// ── Types ─────────────────────────────────────────────────────
export type DiseaseClass = "Healthy"|"Leaf Rust"|"Stripe Rust"|"Stem Rust"|"Septoria"|"Fusarium";
export type QueueStatus  = "waiting"|"processing"|"done"|"error";

export interface QueueItem {
  id: string; file: File; previewUrl: string;
  status: QueueStatus; result?: PredictionResult; error?: string;
}

export interface PredictionResult {
  disease: DiseaseClass; confidence: number;
  top3: { disease: DiseaseClass; confidence: number }[];
  treatment: string; prevention: string;
  all_probabilities: Record<DiseaseClass, number>;
  inference_ms: number; image_url?: string; record_id?: string;
}

export interface DetectionRecord {
  id: string; user_id: string; image_url: string;
  disease: DiseaseClass; confidence: number;
  treatment: string; prevention: string;
  top3: { disease: DiseaseClass; confidence: number }[];
  latitude: number|null; longitude: number|null; created_at: string;
}

// ── Disease metadata ──────────────────────────────────────────
export const DISEASE_META: Record<DiseaseClass, { color: string; bg: string; icon: string; severity: string }> = {
  "Healthy":     { color:"#2d6a10", bg:"#EAF3DE", icon:"✓",  severity:"safe"     },
  "Leaf Rust":   { color:"#854F0B", bg:"#FAEEDA", icon:"◈",  severity:"high"     },
  "Stripe Rust": { color:"#BA7517", bg:"#FEF3C7", icon:"≋",  severity:"medium"   },
  "Stem Rust":   { color:"#A32D2D", bg:"#FEE2E2", icon:"⚡",  severity:"critical" },
  "Septoria":    { color:"#854F0B", bg:"#FFF0E0", icon:"●",  severity:"medium"   },
  "Fusarium":    { color:"#534AB7", bg:"#EEEDFE", icon:"◆",  severity:"high"     },
};

// ── Helpers ───────────────────────────────────────────────────
export function fmtConf(v: number) { return `${Math.round(v * 100)}%`; }
export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit"
  });
}
export function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000)   return "just now";
  if (diff < 3600000) return `${Math.round(diff/60000)}m ago`;
  if (diff < 86400000)return `${Math.round(diff/3600000)}h ago`;
  return `${Math.round(diff/86400000)}d ago`;
}

// ── Treatments ────────────────────────────────────────────────
export const TREATMENTS: Record<string, { treatment: string; prevention: string }> = {
  "Healthy":     { treatment:"No treatment required. Continue routine field monitoring.", prevention:"Scout weekly. Maintain crop rotation and remove volunteer plants." },
  "Leaf Rust":   { treatment:"Apply Tebuconazole 250 EC at 0.75L/ha. Repeat after 14 days if infection persists.", prevention:"Plant certified resistant varieties. Apply preventive fungicide at tillering." },
  "Stripe Rust": { treatment:"Apply propiconazole or tebuconazole within 48 hours. Stripe rust spreads rapidly in cool conditions.", prevention:"Use certified rust-resistant seed. Monitor from March onwards in moist weather." },
  "Stem Rust":   { treatment:"CRITICAL — Apply propiconazole at full label rate immediately. Contact local agricultural extension officer.", prevention:"Only plant Ug99-resistant varieties. Destroy infected stubble after harvest." },
  "Septoria":    { treatment:"Apply azoxystrobin + propiconazole mixture. Improve field drainage.", prevention:"Avoid overhead irrigation. Rotate with non-cereal crops. Fungicide at flag leaf emergence." },
  "Fusarium":    { treatment:"Harvest immediately. Dry grain below 14% moisture. Segregate affected grain.", prevention:"Apply tebuconazole at anthesis. Avoid planting after maize. Use certified clean seed." },
};
