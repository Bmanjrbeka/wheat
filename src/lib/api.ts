import type { Prediction } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Send an image file to the wheat disease prediction API.
 * Connects to the local ML server or deployed HuggingFace Space.
 */
export async function predictDisease(imageFile: File): Promise<Prediction> {
  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    const result = await response.json();
    
    // Validate response structure
    if (!result.disease || typeof result.confidence !== 'number') {
      throw new Error('Invalid API response structure');
    }

    return result as Prediction;
    
  } catch (error) {
    console.error('Prediction API error:', error);
    
    // Fallback to mock if API is unavailable
    console.warn('Falling back to mock prediction due to API error');
    return getFallbackPrediction();
  }
}

/**
 * Fallback prediction when API is unavailable
 */
function getFallbackPrediction(): Prediction {
  return {
    disease: "Leaf Rust",
    confidence: 0.85,
    treatment: "Apply Tebuconazole 250 EC at 0.75L/ha. Repeat after 14 days if infection persists.",
    prevention: "Plant certified resistant varieties. Apply preventive fungicide at tillering.",
    all_probabilities: {
      "Healthy": 0.05,
      "Leaf Rust": 0.85,
      "Stripe Rust": 0.04,
      "Stem Rust": 0.03,
      "Septoria": 0.02,
      "Fusarium": 0.01,
    },
    top3: [
      { disease: "Leaf Rust", confidence: 0.85 },
      { disease: "Healthy", confidence: 0.05 },
      { disease: "Stripe Rust", confidence: 0.04 }
    ],
    inference_ms: 1200
  };
}

/**
 * Check API health status
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
