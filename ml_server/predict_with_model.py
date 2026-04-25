#!/usr/bin/env python3
"""
Python script to predict using the real Keras model
Called from Node.js server when Python is available
"""

import sys
import json
import base64
import io
from pathlib import Path

# Add current directory to path for imports
sys.path.append(str(Path(__file__).parent))

try:
    import numpy as np
    import tensorflow as tf
    from PIL import Image
    from tensorflow.keras.preprocessing import image
except ImportError as e:
    print(json.dumps({"error": f"Missing dependency: {e}"}))
    sys.exit(1)

# Configuration
DISEASE_CLASSES = ["Healthy", "Leaf Rust", "Stripe Rust", "Stem Rust", "Septoria", "Fusarium"]
MODEL_PATH = "model.keras"

def load_model():
    """Load the Keras model"""
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        return model
    except Exception as e:
        print(json.dumps({"error": f"Failed to load model: {e}"}))
        sys.exit(1)

def preprocess_image(img_data):
    """Preprocess base64 image data"""
    try:
        # Decode base64
        img_bytes = base64.b64decode(img_data)
        img = Image.open(io.BytesIO(img_bytes))
        
        # Resize to 300x300 for EfficientNetB3
        img = img.resize((300, 300))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Convert to array
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        print(json.dumps({"error": f"Image preprocessing failed: {e}"}))
        sys.exit(1)

def predict_disease(model, img_array):
    """Make prediction using the model"""
    try:
        # Predict
        predictions = model.predict(img_array, verbose=0)
        probabilities = predictions[0]
        
        # Get results
        predicted_idx = np.argmax(probabilities)
        predicted_class = DISEASE_CLASSES[predicted_idx]
        confidence = float(probabilities[predicted_idx])
        
        # Create all probabilities dict
        all_probabilities = {
            disease: float(prob) 
            for disease, prob in zip(DISEASE_CLASSES, probabilities)
        }
        
        # Get top 3
        sorted_probs = sorted(all_probabilities.items(), key=lambda x: x[1], reverse=True)[:3]
        top3 = [{"disease": d, "confidence": c} for d, c in sorted_probs]
        
        return {
            "disease": predicted_class,
            "confidence": confidence,
            "all_probabilities": all_probabilities,
            "top3": top3,
            "inference_ms": 1000  # Mock timing
        }
        
    except Exception as e:
        print(json.dumps({"error": f"Prediction failed: {e}"}))
        sys.exit(1)

def main():
    """Main function"""
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python predict_with_model.py <base64_image_data>"}))
        sys.exit(1)
    
    try:
        # Load model
        model = load_model()
        
        # Get image data
        img_data = sys.argv[1]
        
        # Preprocess
        img_array = preprocess_image(img_data)
        
        # Predict
        result = predict_disease(model, img_array)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
