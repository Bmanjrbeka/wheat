# Wheat Disease Detection ML Server

This Python FastAPI server provides the machine learning backend for wheat disease detection.

## Quick Start

### Option 1: Windows (Recommended)
```bash
# Double-click this file or run from command line
start_ml_server.bat
```

### Option 2: Manual Setup
```bash
# Navigate to ml_server directory
cd ml_server

# Install dependencies
pip install -r requirements.txt

# Start the server
python start_server.py
```

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status and model loading state

### Disease Prediction
- **POST** `/predict`
- Upload an image file for disease detection
- Returns: disease prediction, confidence, treatment recommendations

### API Documentation
- Visit `http://localhost:8000/docs` for interactive API docs

## Model Integration

The server currently uses a mock model for development. To integrate your real model:

1. Replace the `MockWheatModel` class in `app.py` with your actual model loading code
2. Update the `predict()` method to use your model's inference
3. Ensure the input preprocessing matches your model's requirements

## Environment Setup

The server expects:
- Python 3.8+
- TensorFlow 2.x (for your real model)
- FastAPI and related dependencies

## Testing

Test the server with curl:
```bash
# Health check
curl http://localhost:8000/health

# Predict disease (replace with your image path)
curl -X POST -F "file=@/path/to/your/image.jpg" http://localhost:8000/predict
```

## Frontend Integration

The frontend automatically connects to `http://localhost:8000` when:
- `NEXT_PUBLIC_API_URL` is set to `http://localhost:8000`
- The ML server is running

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Python Dependencies
```bash
# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### Model Loading Issues
- Check TensorFlow installation: `pip show tensorflow`
- Verify model file paths
- Check GPU availability if using GPU model

## Production Deployment

For production, deploy this to HuggingFace Spaces:
1. Create a new Space on HuggingFace
2. Upload these files
3. Update `NEXT_PUBLIC_API_URL` in your frontend
4. The Space will automatically install dependencies and start the server
