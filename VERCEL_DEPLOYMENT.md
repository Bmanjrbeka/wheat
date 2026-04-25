# 🚀 Vercel Deployment - Step by Step

## 📋 Prerequisites
- Vercel account (free tier available)
- GitHub repository with your code
- HuggingFace Space URL (from previous step)

## 🎯 Step 1: Connect to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link Project**
   ```bash
   cd c:\Users\Bman\Desktop\wheat-app
   vercel link
   ```

## ⚙️ Step 2: Configure Build Settings

1. **Update vercel.json** (already configured):
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm install",
     "framework": "nextjs",
     "env": {
       "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
       "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
       "NEXT_PUBLIC_API_URL": "@api-url"
     }
   }
   ```

2. **Verify Build Configuration**
   ```bash
   npm run build
   # Should complete without errors
   ```

## 🌐 Step 3: Deploy to Vercel

1. **Deploy to Preview**
   ```bash
   vercel
   # Follow prompts, select "Yes" for all defaults
   ```

2. **Deploy to Production**
   ```bash
   vercel --prod
   ```

3. **Get Production URL**
   - Note the URL: `https://your-app-name.vercel.app`

## 🔧 Step 4: Configure Environment Variables

1. **Set Environment Variables** in Vercel Dashboard:
   ```bash
   # Go to: vercel.com/your-username/your-project/settings/environment-variables
   
   # Add these variables:
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=https://your-username-wheat-disease-api.hf.space
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
   ```

2. **Email Variables (Optional)**
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your_sendgrid_api_key
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=WheatGuard
   ```

## 🧪 Step 5: Test Production

1. **Test Frontend**
   - Visit: `https://your-app-name.vercel.app`
   - Check all pages load correctly

2. **Test ML API Connection**
   - Go to Analysis page
   - Upload a test image
   - Verify prediction works

3. **Test Premium Features**
   - Reports: Generate PDF/CSV
   - GPS Mapping: View interactive map
   - Notifications: Send test alert
   - Offline Mode: Check offline functionality

## 📊 Production Checklist

### ✅ Pre-Deployment Tests:
- [ ] All pages load without errors
- [ ] ML API responds correctly
- [ ] File uploads work
- [ ] PDF generation works
- [ ] GPS mapping displays
- [ ] Email notifications send
- [ ] Database operations function

### ✅ Post-Deployment Tests:
- [ ] Site loads quickly (< 3 seconds)
- [ ] Mobile responsive
- [ ] All features work in production
- [ ] No console errors
- [ ] API calls successful
- [ ] User authentication works

## 🔍 Monitoring Setup

1. **Vercel Analytics**
   - Enable in Vercel dashboard
   - Monitor page views and performance

2. **Error Tracking**
   - Check Vercel logs for errors
   - Monitor 404s and API failures

3. **Performance Metrics**
   - Core Web Vitals
   - API response times
   - Build times

## 🚨 Common Issues & Solutions

### Build Errors:
```bash
# Fix: Update dependencies
npm install
npm run build

# Fix: Clear cache
rm -rf .next
vercel --prod
```

### API Connection Issues:
```bash
# Fix: Check CORS settings
# Verify HuggingFace Space is running
# Test API endpoint directly
```

### Environment Variable Issues:
```bash
# Fix: Verify variable names match
# Check for typos
# Ensure variables are set in production
```

## 📈 Performance Optimization

1. **Image Optimization**
   - Next.js automatically optimizes images
   - Ensure images are properly sized

2. **Code Splitting**
   - Next.js handles automatically
   - Monitor bundle size

3. **Caching**
   - API responses cached appropriately
   - Static assets served from CDN

## 🎯 Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure SSL (automatic with Vercel)
3. Set up monitoring alerts
4. Plan for scaling

## 📞 Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Next.js Deployment: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- Vercel Status: [vercel-status.com](https://vercel-status.com)
