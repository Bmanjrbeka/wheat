// ── Prediction types ─────────────────────────────────────────
export type DiseaseClass =
  | "Healthy"
  | "Leaf Rust"
  | "Stripe Rust"
  | "Stem Rust"
  | "Septoria"
  | "Fusarium";

export interface Prediction {
  disease: DiseaseClass;
  confidence: number;         // 0–1 float
  treatment: string;
  all_probabilities: Record<DiseaseClass, number>;
}

// ── Detection history (Supabase row) ─────────────────────────
export interface DetectionRecord {
  id: string;
  user_id: string;
  image_url: string;
  disease: DiseaseClass;
  confidence: number;
  treatment: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

// ── Farming tips (Supabase row) ───────────────────────────────
export interface FarmingTip {
  id: string;
  disease: DiseaseClass;
  title: string;
  body: string;
  severity: "low" | "medium" | "high";
}

// ── Auth user ─────────────────────────────────────────────────
export interface AppUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}
