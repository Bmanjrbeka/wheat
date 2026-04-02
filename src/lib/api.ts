import type { Prediction } from "@/types";

const HF_API_URL = process.env.NEXT_PUBLIC_HF_API_URL ?? "http://localhost:8000";

// ── Mock response for frontend development ───────────────────
// Remove this and uncomment the real call below once Task 1.3 is done.
const MOCK_PREDICTION: Prediction = {
  disease: "Leaf Rust",
  confidence: 0.91,
  treatment:
    "Apply a triazole-based fungicide (e.g., Tebuconazole) at the first sign of infection. " +
    "Ensure adequate spacing between plants to improve air circulation. " +
    "Remove and destroy heavily infected plant material.",
  all_probabilities: {
    Healthy:      0.02,
    "Leaf Rust":  0.91,
    "Stripe Rust":0.03,
    "Stem Rust":  0.01,
    Septoria:     0.02,
    Fusarium:     0.01,
  },
};

/**
 * Send an image file to the prediction API.
 * During development, this returns a mock response after a short delay.
 * After Task 1.3: set NEXT_PUBLIC_HF_API_URL to your HuggingFace Space URL.
 */
export async function predictDisease(imageFile: File): Promise<Prediction> {
  // ── DEV MOCK (delete this block after Task 1.3) ──────────
  if (HF_API_URL === "http://localhost:8000") {
    await new Promise((r) => setTimeout(r, 1800)); // simulate latency
    return MOCK_PREDICTION;
  }
  // ── REAL API CALL (active once HF Space is live) ─────────
  const formData = new FormData();
  formData.append("file", imageFile);

  const response = await fetch(`${HF_API_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }

  return response.json() as Promise<Prediction>;
}
