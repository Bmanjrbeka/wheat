interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  fromName: string;
}

interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

interface AlertEmail {
  userEmail: string;
  disease: string;
  confidence: number;
  location?: { latitude: number; longitude: number };
  timestamp: string;
}

class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          from: this.config.from,
          fromName: this.config.fromName,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Email send failed:', error);
        return false;
      }

      const result = await response.json();
      console.log('Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  async sendDiseaseAlert(alert: AlertEmail): Promise<boolean> {
    const severity = this.getSeverityLevel(alert.confidence);
    const urgency = alert.confidence >= 0.8 ? 'high' : alert.confidence >= 0.6 ? 'medium' : 'low';
    
    const subject = `🚨 ${urgency.toUpperCase()} Priority: ${alert.disease} Detected`;
    
    const html = this.generateAlertEmail(alert, severity, urgency);
    
    return this.sendEmail({
      to: alert.userEmail,
      subject,
      html,
      text: `High-priority disease alert: ${alert.disease} detected with ${Math.round(alert.confidence * 100)}% confidence.`,
    });
  }

  
  async sendWeeklyReport(userEmail: string, reportData: any): Promise<boolean> {
    const subject = `📊 Your Weekly WheatGuard Report`;
    
    const html = this.generateReportEmail(reportData);
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text: 'Your weekly disease detection report is ready.',
    });
  }

  private getSeverityLevel(confidence: number): string {
    if (confidence >= 0.8) return 'critical';
    if (confidence >= 0.6) return 'high';
    return 'medium';
  }

  private generateAlertEmail(alert: AlertEmail, severity: string, urgency: string): string {
    const severityColors = {
      critical: '#dc2626',
      high: '#ea4335',
      medium: '#f59e0b',
      low: '#10b981'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Disease Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${severityColors[severity as keyof typeof severityColors]}; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; border-radius: 8px; margin: 20px 0; }
          .disease-info { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid ${severityColors[severity as keyof typeof severityColors]}; }
          .stats { display: flex; gap: 10px; margin: 10px 0; }
          .stat { flex: 1; }
          .action { background: #2d6a10; color: white; padding: 15px; border-radius: 8px; text-align: center; text-decoration: none; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🚨 Disease Detection Alert</h1>
            <p style="margin: 10px 0 0; font-size: 16px;">${urgency.toUpperCase()} Priority</p>
          </div>
          
          <div class="content">
            <div class="disease-info">
              <h2 style="margin: 0 0 10px; color: #111;">${alert.disease} Detected</h2>
              <div class="stats">
                <div class="stat">
                  <strong>Confidence:</strong> ${Math.round(alert.confidence * 100)}%
                </div>
                <div class="stat">
                  <strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}
                </div>
              </div>
              ${alert.location ? `
                <div class="stats">
                  <div class="stat">
                    <strong>Location:</strong> ${alert.location.latitude.toFixed(4)}, ${alert.location.longitude.toFixed(4)}
                  </div>
                </div>
              ` : ''}
              <p style="margin: 15px 0 0; color: #666;">
                Immediate action recommended. Please check your wheat fields and apply appropriate treatment.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/analysis" class="action" style="color: white !important;">
              Analyze New Sample →
            </a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  
  private generateReportEmail(reportData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Report</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2d6a10; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .content { padding: 20px; background: #f8f9fa; border-radius: 8px; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-box { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
          .stat-number { font-size: 24px; font-weight: bold; color: #2d6a10; }
          .stat-label { font-size: 12px; color: #666; margin: 5px 0; }
          .action { background: #2d6a10; color: white; padding: 15px 30px; border-radius: 8px; text-align: center; text-decoration: none; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">📊 Weekly Report</h1>
            <p style="margin: 10px 0 0;">Your wheat disease detection summary</p>
          </div>
          
          <div class="content">
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-number">${reportData.totalScans || 0}</div>
                <div class="stat-label">Total Scans</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${Math.round((reportData.avgConfidence || 0) * 100)}%</div>
                <div class="stat-label">Avg Confidence</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${reportData.highRiskCount || 0}</div>
                <div class="stat-label">High Risk Cases</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">${reportData.thisWeekCount || 0}</div>
                <div class="stat-label">This Week</div>
              </div>
            </div>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/reports" class="action">
              View Full Report →
            </a>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default EmailService;
