-- ============================================================
-- TASK 2.2 — Supabase Schema
-- Run this in: supabase.com → your project → SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── Users ─────────────────────────────────────────────────────
-- Supabase Auth creates auth.users automatically.
-- This public table stores extra profile data.
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Auto-create a public.users row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Detection History ─────────────────────────────────────────
create table if not exists public.detection_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users(id) on delete cascade,
  image_url   text not null,
  disease     text not null,
  confidence  float not null check (confidence >= 0 and confidence <= 1),
  treatment   text,
  latitude    float,
  longitude   float,
  created_at  timestamptz default now()
);

-- Index for fast user history lookup
create index if not exists idx_detection_history_user
  on public.detection_history(user_id, created_at desc);


-- ── Farming Tips ──────────────────────────────────────────────
create table if not exists public.farming_tips (
  id        uuid primary key default gen_random_uuid(),
  disease   text not null,
  title     text not null,
  body      text not null,
  severity  text not null check (severity in ('low', 'medium', 'high'))
);

-- Seed with base tips
insert into public.farming_tips (disease, title, body, severity) values
  ('Leaf Rust',    'Apply fungicide early',       'Use triazole-based fungicide at first sign. Tebuconazole is effective.', 'high'),
  ('Stripe Rust',  'Monitor temperature closely', 'Stripe rust thrives in cool, moist conditions. Scout weekly in early spring.', 'medium'),
  ('Stem Rust',    'Use resistant varieties',     'Plant Ug99-resistant varieties. Apply propiconazole if outbreak detected.', 'high'),
  ('Septoria',     'Improve field drainage',      'Septoria spreads via rain splash. Avoid overhead irrigation and rotate crops.', 'medium'),
  ('Fusarium',     'Harvest promptly',            'Delayed harvest worsens fusarium. Dry grain below 14% moisture immediately.', 'high'),
  ('Healthy',      'Keep monitoring',             'No disease detected. Continue weekly scouting especially after rain.', 'low')
on conflict do nothing;


-- ── Row Level Security (RLS) ──────────────────────────────────
alter table public.users             enable row level security;
alter table public.detection_history enable row level security;
alter table public.farming_tips      enable row level security;

-- Users: only see and edit your own row
create policy "users: own row only" on public.users
  for all using (auth.uid() = id);

-- Detection history: only see and write your own records
create policy "history: own records only" on public.detection_history
  for all using (auth.uid() = user_id);

-- Farming tips: readable by everyone, editable by no one (read-only seed data)
create policy "tips: public read" on public.farming_tips
  for select using (true);

-- ── Supabase Storage bucket for leaf images ───────────────────
-- Run this too (or create via the dashboard: Storage → New Bucket)
insert into storage.buckets (id, name, public)
  values ('leaf-images', 'leaf-images', true)
  on conflict do nothing;

create policy "leaf images: public read" on storage.objects
  for select using (bucket_id = 'leaf-images');

create policy "leaf images: auth upload" on storage.objects
  for insert with check (bucket_id = 'leaf-images' and auth.role() = 'authenticated');
