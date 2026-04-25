# 🚀 HuggingFace Spaces Deployment - Step by Step

## 📋 Prerequisites
- HuggingFace account (free tier available)
- Your ML model file: `wheat_b3_fixed_UP_77%.keras`
- Git installed on your system

## 🎯 Step 1: Create HuggingFace Space

1. **Go to HuggingFace Spaces**
   - Visit: [huggingface.co/spaces](https://huggingface.co/spaces)
   - Click "Create new Space"

2. **Configure Space**
   ```
   Space name: wheat-disease-api
   License: MIT
   Visibility: Public
   Hardware: CPU Basic (free tier)
   Template: Docker
   ```

3. **Initialize Repository**
   - Clone the space locally
   ```bash
   git clone https://huggingface.co/spaces/your-username/wheat-disease-api
   cd wheat-disease-api
   ```

## 📁 Step 2: Upload Files

Copy these files to your space directory:

```bash
# From your wheat-app/ml_server/ directory to wheat-disease-api/
cp ml_server/app.py .
cp ml_server/requirements.txt .
cp ml_server/model.keras .
cp ml_server/predict_with_model.py .
cp ml_server/Dockerfile .
```

## ⚙️ Step 3: Configure Environment

1. **Set Environment Variables** in your Space settings:
   ```bash
   PORT=7860
   ```

2. **Verify Files** are present:
   ```bash
   ls -la
   # Should show: app.py, requirements.txt, model.keras, predict_with_model.py, Dockerfile
   ```

## 🚀 Step 4: Deploy

1. **Push to HuggingFace**
   ```bash
   git add .
   git commit -m "Initial deployment - wheat disease detection API"
   git push
   ```

2. **Monitor Build**
   - Watch the build progress in your Space
   - Check for any errors in the logs

## 🧪 Step 5: Test Deployment

1. **Health Check**
   ```bash
   curl https://your-username-wheat-disease-api.hf.space/health
   # Expected: {"status": "healthy", "model_loaded": true}
   ```

2. **Test Prediction**
   ```bash
   curl -X POST \
     -F "file=@test_image.jpg" \
     https://your-username-wheat-disease-api.hf.space/predict
   ```

## 🔧 Troubleshooting

### Common Issues:
1. **Model Loading Error**
   - Ensure `model.keras` is uploaded
   - Check file size (< 1GB for free tier)

2. **Memory Issues**
   - Reduce model size if needed
   - Upgrade to larger hardware

3. **CORS Issues**
   - The FastAPI server includes CORS middleware
   - Should work with any frontend domain

### Debug Commands:
```bash
# Check logs
huggingface-cli repo logs your-username/wheat-disease-api

# Check space status
curl https://your-username-wheat-disease-api.hf.space/health
```

## 📊 Expected Performance

- **Cold Start**: ~30 seconds
- **Prediction Time**: ~850ms
- **Concurrent Users**: 10-20 (CPU Basic)
- **Monthly Requests**: 10,000+ (free tier)

## 🎯 Next Steps

Once HuggingFace deployment is working:
1. Update frontend environment variables
2. Deploy to Vercel
3. Configure production settings
4. Set up monitoring

## 📞 Support

- HuggingFace Documentation: [docs.huggingface.co](https://docs.huggingface.co)
- Community Forums: [discuss.huggingface.co](https://discuss.huggingface.co)
- Space Issues: Check your Space's "Logs" tab
