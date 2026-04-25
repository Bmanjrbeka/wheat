# HuggingFace Spaces Deployment Guide

## Quick Deployment

### 1. Create HuggingFace Space
1. Go to [huggingface.co/spaces](https://huggingface.co/spaces)
2. Click "Create new Space"
3. Choose **Docker** template
4. Space name: `wheat-disease-api`
5. Visibility: Public
6. Hardware: CPU Basic (free tier)

### 2. Upload Files
Upload these files to your Space:

```
ml_server/
├── app.py              # Main FastAPI server
├── requirements.txt       # Python dependencies
├── model.keras          # Your trained model
├── predict_with_model.py  # Python prediction script
└── Dockerfile          # Docker configuration
```

### 3. Environment Variables
Set these in your Space settings:

```bash
# Required
NEXT_PUBLIC_API_URL=https://your-username-wheat-disease-api.hf.space
PORT=7860

# Optional (for SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=WheatGuard
```

### 4. Docker Configuration
Create `Dockerfile` in your Space:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Copy requirements first
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 7860

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
```

### 5. Build and Deploy
The Space will automatically build and deploy your Docker container.

## Testing Your Deployment

### Health Check
```bash
curl https://your-username-wheat-disease-api.hf.space/health
```

### Test Prediction
```bash
curl -X POST \
  -F "file=@test_image.jpg" \
  https://your-username-wheat-disease-api.hf.space/predict
```

## Integration with Frontend

Update your frontend environment variables:

```bash
# Production
NEXT_PUBLIC_API_URL=https://your-username-wheat-disease-api.hf.space
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## Troubleshooting

### Common Issues

1. **Model Loading Error**
   - Ensure `model.keras` is in the Space
   - Check file size (should be < 1GB for free tier)

2. **Memory Issues**
   - Reduce model size or use quantization
   - Upgrade to larger hardware if needed

3. **CORS Issues**
   - The FastAPI server includes CORS middleware
   - Check frontend URL is in allowed origins

4. **Slow Predictions**
   - Monitor GPU/CPU usage
   - Consider model optimization

### Monitoring

### HuggingFace Metrics
- Monitor your Space's usage
- Check response times and error rates
- Set up alerts for high error rates

### Scaling

### Paid Tiers
- **CPU Basic**: Free, good for testing
- **CPU Upgrade**: $0.10/hour, faster CPU
- **GPU**: $0.50/hour, best for ML workloads

### Security

### API Keys
- Never commit API keys to git
- Use HuggingFace Secrets for sensitive data
- Rotate keys regularly

### Backup Strategy

1. **Model Backup**: Keep local copy of `model.keras`
2. **Configuration**: Document your Space settings
3. **Data**: Regular database exports from Supabase

## Support

- HuggingFace Documentation: [docs.huggingface.co](https://docs.huggingface.co)
- FastAPI Documentation: [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- Community Forums: [discuss.huggingface.co](https://discuss.huggingface.co)
