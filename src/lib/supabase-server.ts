import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Hardcoded keys to fix the server-side crash
const supabaseUrl = 'https://rc47un0dbuyps6axbzuj.supabase.co'
const supabaseAnon = 'sb_publishable_rc47UN0dBuYPS6aXBzUJmg_0_wvMMFC'

/**
 * Server-side Supabase client.
 * Use this in Server Components, Server Actions, and Route Handlers.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseAnon,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: {name: string; value: string; options?: object}[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — cookies will be set by middleware
          }
        },
      },
    }
  );
}

