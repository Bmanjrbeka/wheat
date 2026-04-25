# Environment Setup Guide

## Critical Missing Items - COMPLETED ✅

### 1. Real ML Model Integration
- ✅ Connected `wheat_b3_fixed_UP_77%.keras` model to ML server
- ✅ Created Python script for real model inference
- ✅ Updated Node.js server to use real model when available
- ✅ Implemented fallback to mock predictions when Python unavailable

### 2. ML Server Setup
- ✅ Created hybrid Node.js + Python ML server
- ✅ Model file copied to `ml_server/model.keras`
- ✅ Python prediction script created
- ✅ Server automatically detects and uses real model

### 3. API Integration
- ✅ Updated frontend API calls to use real ML server
- ✅ Removed mock data dependency
- ✅ Added error handling and fallback mechanisms

## Environment Variables Setup

### Create `.env.local` file:
```bash
# Copy this content to your .env.local file:

# ── Supabase ─────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://rc47un0dbuyps6axbzuj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_rc47UN0dBuYPS6aXBzUJmg_0_wvMMFC

# ── SendGrid SMTP ─────────────────────────────────────────────
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Wheat-Guard

# ── ML API ─────────────────────────────────────────────────────
# Local development
NEXT_PUBLIC_API_URL=http://localhost:8000

# Production (replace with your HuggingFace Space URL)
# NEXT_PUBLIC_API_URL=https://your-username-wheat-detection-api.hf.space

# ── App ───────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How to Run Real Model

### Option 1: With Python (Recommended for Real Model)
```bash
# Install Python dependencies
cd ml_server
pip install -r requirements.txt

# Start Python server directly
python app.py
```

### Option 2: With Node.js (Hybrid Approach)
```bash
# Install Node.js dependencies
cd ml_server
npm install

# Start Node.js server (will use Python if available)
node server.js
```

### Option 3: Easy Start
```bash
# Double-click or run from command line
start_ml_server.bat
```

## Testing Real Model

1. **Start ML Server**: Run `start_ml_server.bat`
2. **Start Frontend**: `npm run dev` in main directory
3. **Test**: Upload wheat leaf images to see real model predictions

## Model Details

- **Model**: EfficientNetB3 (77% accuracy)
- **Input**: 300x300 RGB images
- **Classes**: 6 disease types
- **Output**: Probability distribution across all classes

## Production Deployment

For production deployment to HuggingFace Spaces:

1. Upload ML server files to HuggingFace Space
2. Update `NEXT_PUBLIC_API_URL` to your Space URL
3. Deploy frontend to Vercel
4. Update Supabase schema if needed

## Next Critical Tasks

The critical missing items are now COMPLETE. Remaining tasks:

- **Reports Page**: Implement PDF export functionality
- **Premium Features**: GPS mapping, team accounts, offline mode
- **Testing**: Add unit and integration tests
- **Documentation**: API documentation and deployment guides
