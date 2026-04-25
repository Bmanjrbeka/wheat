# 📊 Performance Monitoring & Optimization Guide

## 🎯 Key Performance Metrics

### 1. Application Performance

```javascript
// Core Web Vitals Targets
const PERFORMANCE_TARGETS = {
  // Loading Performance
  FirstContentfulPaint: '< 1.8s',
  LargestContentfulPaint: '< 2.5s',
  FirstInputDelay: '< 100ms',
  
  // API Performance
  ML_API_Response: '< 2s',
  Database_Query: '< 500ms',
  Email_Delivery: '< 30s',
  
  // User Experience
  Page_Load: '< 3s',
  Image_Upload: '< 5s',
  PDF_Generation: '< 5s'
};
```

### 2. Monitoring Setup

#### HuggingFace Spaces Monitoring
```bash
# Check Space Status
curl https://your-username-wheat-disease-api.hf.space/health

# Monitor Response Time
time curl -X POST \
  -F "file=@test_image.jpg" \
  https://your-username-wheat-disease-api.hf.space/predict

# Check Logs
huggingface-cli repo logs your-username/wheat-disease-api
```

#### Vercel Analytics
```javascript
// Add to your Next.js app for custom monitoring
import { Analytics } from '@vercel/analytics/react';

// Monitor specific events
<Analytics event="detection_detected" data={{ disease: 'Leaf Rust', confidence: 0.85 }} />
<Analytics event="report_generated" data={{ type: 'pdf', pages: 5 }} />
<Analytics event="user_registered" data={{ source: 'organic' }} />
```

#### Database Performance
```sql
-- Monitor slow queries
SELECT 
  query, 
  mean_exec_time, 
  calls,
  total_exec_time
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public';
```

## 🔍 Performance Optimization Strategies

### 1. Frontend Optimization

#### Image Optimization
```javascript
// Next.js Image Component Usage
import Image from 'next/image';

<Image
  src="/wheat-leaf.jpg"
  alt="Wheat leaf with disease"
  width={300}
  height={300}
  priority={true}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

#### Code Splitting
```javascript
// Dynamic imports for heavy components
const GPSMap = dynamic(() => import('@/components/GPSMap'), {
  loading: () => <div>Loading map...</div>,
  ssr: false
});

const ReportsPage = dynamic(() => import('@/app/reports/page'), {
  loading: () => <div>Loading reports...</div>
});
```

#### Caching Strategy
```javascript
// API Response Caching
export async function GET(request: Request) {
  const cache = caches.default;
  const cacheKey = new Request(request.url);
  
  let response = await cache.match(cacheKey);
  if (!response) {
    response = new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minutes
      }
    });
    await cache.put(cacheKey, response.clone());
  }
  
  return response;
}
```

### 2. Backend Optimization

#### ML Model Optimization
```python
# Python: Model quantization for faster inference
import tensorflow as tf

# Convert to TensorFlow Lite for faster inference
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

# Save the optimized model
with open('model.tflite', 'wb') as f:
    f.write(tflite_model)
```

#### Database Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_detection_history_user_id ON detection_history(user_id);
CREATE INDEX idx_detection_history_created_at ON detection_history(created_at);
CREATE INDEX idx_detection_history_disease ON detection_history(disease);

-- Optimize RLS policies
CREATE POLICY "Optimized user history" ON detection_history
  FOR SELECT USING (
    auth.uid() = user_id AND 
    created_at > NOW() - INTERVAL '1 year'
  );
```

#### API Response Optimization
```python
# FastAPI: Response compression and caching
from fastapi import FastAPI, Response
from fastapi.middleware.gzip import GZipMiddleware

app = FastAPI()
app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.get("/health")
async def health_check(response: Response):
    response.headers["Cache-Control"] = "no-store"
    return {"status": "healthy", "timestamp": datetime.utcnow()}
```

### 3. Email Performance

#### SendGrid Optimization
```javascript
// Batch email sending
async function sendBatchEmails(emails) {
  const batchSize = 100;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    await Promise.all(batch.map(email => sendEmail(email)));
    // Rate limiting: wait between batches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Email template caching
const emailTemplates = new Map();
function getEmailTemplate(type) {
  if (!emailTemplates.has(type)) {
    emailTemplates.set(type, generateEmailTemplate(type));
  }
  return emailTemplates.get(type);
}
```

## 📈 Monitoring Dashboard Setup

### 1. Custom Analytics Dashboard

```javascript
// Performance monitoring component
import { useEffect, useState } from 'react';

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        setMetrics(prev => ({
          ...prev,
          [entry.name]: entry.value
        }));
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input-delay'] });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="performance-metrics">
      <h3>Performance Metrics</h3>
      <div>LCP: {metrics.largestContentfulPaint}ms</div>
      <div>FID: {metrics.firstInputDelay}ms</div>
    </div>
  );
}
```

### 2. Error Tracking

```javascript
// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // Send to monitoring service
  fetch('/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: event.error.message,
      stack: event.error.stack,
      url: window.location.href,
      timestamp: Date.now()
    })
  });
});

// API error tracking
export async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    
    // Log error for monitoring
    fetch('/api/log-api-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        error: error.message,
        timestamp: Date.now()
      })
    });
    
    throw error;
  }
}
```

## 🚨 Alert Configuration

### 1. Performance Alerts

```javascript
// Alert thresholds
const ALERT_THRESHOLDS = {
  api_response_time: 2000, // 2 seconds
  error_rate: 0.01, // 1%
  memory_usage: 0.8, // 80%
  disk_usage: 0.9, // 90%
  cpu_usage: 0.8 // 80%
};

// Alert function
async function sendAlert(type, message, severity) {
  await fetch('/api/send-alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      message,
      severity,
      timestamp: Date.now()
    })
  });
}
```

### 2. Health Check Endpoint

```javascript
// API route for comprehensive health check
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    ml_api: await checkMLAPI(),
    email_service: await checkEmailService(),
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };

  const healthy = Object.values(checks).every(check => 
    typeof check === 'object' ? check.status === 'ok' : check
  );

  return Response.json({
    status: healthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  }, { status: healthy ? 200 : 503 });
}
```

## 📊 Performance Reports

### 1. Weekly Performance Report

```javascript
// Generate weekly performance report
async function generateWeeklyReport() {
  const metrics = {
    page_views: await getPageViews(),
    api_calls: await getAPICalls(),
    error_rate: await getErrorRate(),
    avg_response_time: await getAvgResponseTime(),
    user_growth: await getUserGrowth()
  };

  const report = {
    period: 'weekly',
    date: new Date().toISOString(),
    metrics,
    recommendations: generateRecommendations(metrics)
  };

  // Send report via email
  await sendWeeklyReport(report);
  
  return report;
}
```

### 2. Performance Budget

```javascript
// Performance budget configuration
const PERFORMANCE_BUDGET = {
  javascript: 250000, // 250KB
  css: 50000, // 50KB
  images: 500000, // 500KB
  fonts: 100000, // 100KB
  total: 1000000 // 1MB
};

// Budget enforcement in Next.js
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.performance = {
        maxAssetSize: 250000,
        maxEntrypointSize: 250000
      };
    }
    return config;
  }
};
```

## 🎯 Optimization Checklist

### Weekly Tasks
- [ ] Review performance metrics
- [ ] Check error logs
- [ ] Monitor database performance
- [ ] Update performance budgets
- [ ] Review user feedback

### Monthly Tasks
- [ ] Analyze performance trends
- [ ] Update optimization strategies
- [ ] Review alert configurations
- [ ] Plan infrastructure upgrades
- [ ] Document performance issues

### Quarterly Tasks
- [ ] Conduct performance audits
- [ ] Update monitoring tools
- [ ] Review scaling strategies
- [ ] Plan major optimizations
- [ ] Update performance targets

## 📞 Support Resources

- **Vercel Analytics**: [vercel.com/analytics](https://vercel.com/analytics)
- **HuggingFace Metrics**: [huggingface.co/spaces/metrics](https://huggingface.co/spaces/metrics)
- **Supabase Monitoring**: [supabase.com/docs/guides/platform/monitoring](https://supabase.com/docs/guides/platform/monitoring)
- **Web Vitals**: [web.dev/vitals](https://web.dev/vitals)
