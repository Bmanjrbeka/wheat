# 🏗️ Production Environment Setup

## 📋 Environment Variables Configuration

### Required Variables

```bash
# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# ML API (HuggingFace Spaces)
NEXT_PUBLIC_API_URL=https://your-username-wheat-disease-api.hf.space

# Application URLs
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

### Optional Variables (Email Notifications)

```bash
# SendGrid SMTP Settings
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=WheatGuard
```

## 🗄️ Database Setup

### Supabase Tables Required

```sql
-- Detection History
CREATE TABLE detection_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  image_url TEXT,
  disease TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  treatment TEXT,
  prevention TEXT,
  top3 JSONB,
  latitude FLOAT,
  longitude FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Settings
CREATE TABLE notification_settings (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email_alerts BOOLEAN DEFAULT true,
  sms_alerts BOOLEAN DEFAULT false,
  high_severity_only BOOLEAN DEFAULT true,
  weekly_reports BOOLEAN DEFAULT true,
  disease_alerts TEXT[] DEFAULT ARRAY['Stem Rust', 'Fusarium']
);

-- Disease Alerts
CREATE TABLE disease_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE detection_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_alerts ENABLE ROW LEVEL SECURITY;

-- Policies for detection_history
CREATE POLICY "Users can view own detection history" ON detection_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own detection history" ON detection_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for notification_settings
CREATE POLICY "Users can view own notification settings" ON notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings" ON notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings" ON notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for disease_alerts
CREATE POLICY "Users can view own disease alerts" ON disease_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own disease alerts" ON disease_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## 🔧 Production Configuration

### 1. HuggingFace Spaces Setup

```bash
# Environment Variables in HuggingFace Space
PORT=7860
```

### 2. Vercel Setup

```bash
# Environment Variables in Vercel Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=https://your-username-wheat-disease-api.hf.space
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

### 3. Email Service Setup (SendGrid)

```bash
# Create SendGrid API Key
# 1. Sign up at sendgrid.com
# 2. Create API Key with "Mail Send" permission
# 3. Set up sender verification
# 4. Add API key to environment variables
```

## 🧪 Production Testing Checklist

### API Tests

```bash
# Test HuggingFace Space Health
curl https://your-username-wheat-disease-api.hf.space/health

# Test Prediction Endpoint
curl -X POST \
  -F "file=@test_image.jpg" \
  https://your-username-wheat-disease-api.hf.space/predict

# Test Frontend Build
npm run build
```

### Feature Tests

- [ ] Authentication works
- [ ] Image analysis functions
- [ ] Reports generate correctly
- [ ] GPS mapping displays
- [ ] Email notifications send
- [ ] Offline mode works
- [ ] Database operations succeed

## 📊 Performance Monitoring

### 1. HuggingFace Metrics

- Monitor Space usage
- Check response times
- Track error rates
- Set up alerts for failures

### 2. Vercel Analytics

- Page views and users
- Core Web Vitals
- Build times
- Error rates

### 3. Supabase Monitoring

- Database performance
- API usage
- Row counts
- Query performance

## 🚨 Error Handling

### Common Production Issues

1. **ML Server Down**
   - Check HuggingFace Space status
   - Monitor build logs
   - Set up health checks

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Monitor connection limits

3. **Email Service Failures**
   - Verify SendGrid API key
   - Check sender verification
   - Monitor email deliverability

### Monitoring Setup

```bash
# Health Check Endpoint
GET /health

# Metrics to Monitor:
- API response time < 2s
- Error rate < 1%
- Uptime > 99%
- Database query time < 500ms
```

## 🔒 Security Considerations

### 1. API Keys
- Never commit secrets to git
- Use environment variables
- Rotate keys regularly
- Monitor for unauthorized access

### 2. Database Security
- Row Level Security enabled
- Proper user authentication
- Limited API permissions
- Regular backups

### 3. CORS Configuration
- Frontend domain whitelisted
- API endpoints protected
- Rate limiting implemented
- Input validation

## 📈 Scaling Considerations

### When to Scale

1. **High Traffic (>1000 users/day)**
   - Upgrade HuggingFace hardware
   - Consider CDN for static assets
   - Optimize database queries

2. **Slow API Response (>2s)**
   - Upgrade to GPU on HuggingFace
   - Implement caching
   - Optimize model size

3. **Database Performance Issues**
   - Add indexes to frequently queried columns
   - Consider read replicas
   - Optimize RLS policies

### Scaling Checklist

- [ ] Monitor performance metrics
- [ ] Set up alerting
- [ ] Plan capacity needs
- [ ] Document scaling procedures
- [ ] Test scaling scenarios

## 🎯 Production Launch Checklist

### Pre-Launch

- [ ] All environment variables set
- [ ] Database schema deployed
- [ ] RLS policies configured
- [ ] SSL certificates active
- [ ] Domain names configured
- [ ] Monitoring tools set up
- [ ] Error tracking enabled
- [ ] Backup procedures tested

### Post-Launch

- [ ] Monitor performance metrics
- [ ] Check error logs regularly
- [ ] Collect user feedback
- [ ] Plan for maintenance windows
- [ ] Document production issues
- [ ] Update documentation

## 📞 Support Contacts

- **HuggingFace Support**: [docs.huggingface.co](https://docs.huggingface.co)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Support**: [supabase.com/docs/guides/getting-started](https://supabase.com/docs/guides/getting-started)
- **SendGrid Support**: [sendgrid.com/support](https://sendgrid.com/support)
