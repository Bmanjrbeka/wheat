import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely — use this everywhere instead of raw template strings */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a 0–1 float as a percentage string: 0.94 → "94%" */
export function formatConfidence(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** Map a disease class to a Tailwind color token */
export const DISEASE_COLORS: Record<string, string> = {
  "Healthy":     "green",
  "Leaf Rust":   "amber",
  "Stripe Rust": "yellow",
  "Stem Rust":   "red",
  "Septoria":    "orange",
  "Fusarium":    "purple",
};

/** Severity badge color */
export function severityColor(confidence: number): "green" | "amber" | "red" {
  if (confidence >= 0.85) return "red";
  if (confidence >= 0.60) return "amber";
  return "green";
}
