"use client";
import { useState, useEffect } from "react";
import { Page } from "@/components/Page";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase";
import { DISEASE_META, fmtDate, fmtConf, DetectionRecord } from "@/lib/constants";

interface NotificationSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  highSeverityOnly: boolean;
  weeklyReports: boolean;
  diseaseAlerts: string[];
}

export function Notifications() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    emailAlerts: true,
    smsAlerts: false,
    highSeverityOnly: true,
    weeklyReports: true,
    diseaseAlerts: ["Stem Rust", "Fusarium"]
  });
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotificationSettings();
      loadRecentAlerts();
    }
  }, [user]);

  const loadNotificationSettings = async () => {
    try {
      const sb = createClient();
      const { data } = await sb
        .from("notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setSettings(data as NotificationSettings);
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentAlerts = async () => {
    try {
      const sb = createClient();
      const { data } = await sb
        .from("disease_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setRecentAlerts(data);
      }
    } catch (error) {
      console.error("Failed to load alerts:", error);
    }
  };

  const saveSettings = async () => {
    try {
      const sb = createClient();
      const { error } = await sb
        .from("notification_settings")
        .upsert({
          user_id: user.id,
          ...settings
        })
        .eq("user_id", user.id)
        .single();

      if (error) {
        alert("Failed to save notification settings");
      } else {
        alert("Notification settings saved successfully!");
      }
    } catch (error) {
      console.error("Settings save error:", error);
      alert("Failed to save notification settings");
    }
  };

  const sendTestAlert = async () => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user?.email || '',
          subject: '🧪 Test Notification from WheatGuard',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; text-align: center;">
                <h2 style="color: #2d6a10; margin: 0 0 20px;">🧪 Test Alert</h2>
                <p style="color: #666; line-height: 1.6;">
                  This is a test notification from your WheatGuard system. 
                  If you received this, your email notifications are working correctly.
                </p>
                <div style="background: #e5e7eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <strong style="color: #111;">Test Details:</strong><br>
                  Time: ${new Date().toLocaleString()}<br>
                  User: ${user?.email}<br>
                  Settings: Email alerts ${settings.emailAlerts ? 'enabled' : 'disabled'}
                </div>
              </div>
            </div>
          `,
        }),
      });

      if (response.ok) {
        setRecentAlerts([{
          id: 'test',
          type: 'test',
          message: 'Test notification sent',
          created_at: new Date().toISOString(),
          severity: 'info'
        }, ...recentAlerts]);
        alert("Test notification sent!");
      } else {
        alert("Failed to send test notification");
      }
    } catch (error) {
      console.error("Test alert error:", error);
      alert("Failed to send test notification");
    }
  };

  const clearAlerts = async () => {
    if (!confirm("Clear all notification history?")) return;

    try {
      const sb = createClient();
      const { error } = await sb
        .from("disease_alerts")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        alert("Failed to clear alerts");
      } else {
        setRecentAlerts([]);
        alert("Notification history cleared");
      }
    } catch (error) {
      console.error("Clear alerts error:", error);
    }
  };

  if (loading) {
    return (
      <Page title="Notifications" subtitle="Loading notification settings...">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 16 }}>🔔</div>
            <div style={{ fontSize: 16, color: "#666" }}>Loading notification settings...</div>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Notifications" subtitle="Configure alerts and notifications">
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        
        {/* Alert Settings */}
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111", marginBottom: 16 }}>
            🔔 Alert Preferences
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Email Alerts */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 12 }}>
                📧 Email Notifications
              </h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={settings.emailAlerts}
                    onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: 13 }}>Enable email alerts for disease detections</span>
                </label>
                
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={settings.highSeverityOnly}
                    onChange={(e) => setSettings({ ...settings, highSeverityOnly: e.target.checked })}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: 13 }}>High severity diseases only (≥70% confidence)</span>
                </label>
              </div>
              
              <div style={{ marginTop: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#333", marginBottom: 8 }}>
                  Disease Alert Types
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.keys(DISEASE_META).map((disease) => (
                    <label key={disease} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input
                        type="checkbox"
                        checked={settings.diseaseAlerts.includes(disease)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSettings({
                            ...settings,
                            diseaseAlerts: checked 
                              ? [...settings.diseaseAlerts, disease]
                              : settings.diseaseAlerts.filter(d => d !== disease)
                          });
                        }}
                        style={{ margin: 0 }}
                      />
                      <span style={{ fontSize: 12 }}>{disease}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* SMS Alerts */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 12 }}>
                📱 SMS Notifications
              </h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={settings.smsAlerts}
                    onChange={(e) => setSettings({ ...settings, smsAlerts: e.target.checked })}
                    style={{ margin: 0 }}
                  />
                  <span style={{ fontSize: 13 }}>Enable SMS alerts (coming soon)</span>
                </label>
              </div>
            </div>

            {/* Weekly Reports */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 12 }}>
                📊 Weekly Reports
              </h4>
              
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={(e) => setSettings({ ...settings, weeklyReports: e.target.checked })}
                  style={{ margin: 0 }}
                />
                <span style={{ fontSize: 13 }}>Receive weekly summary reports via email</span>
              </label>
            </div>
          </div>
        </div>

        {/* Test Alert */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>
              🧪 Test Notifications
            </h3>
            <button
              onClick={sendTestAlert}
              className="btn-primary"
              style={{ fontSize: 14, padding: "10px 20px" }}
            >
              Send Test Alert
            </button>
          </div>
          
          <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
            Send a test notification to verify your email settings are working correctly.
            This will simulate a disease detection alert.
          </p>
        </div>

        {/* Recent Alerts */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>
              📨 Recent Alerts ({recentAlerts.length})
            </h3>
            <button
              onClick={clearAlerts}
              className="btn-ghost"
              style={{ fontSize: 12, padding: "6px 12px" }}
            >
              Clear All
            </button>
          </div>

          {recentAlerts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
              <div style={{ fontSize: 14 }}>No recent alerts</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px",
                    background: "#f8f9fa",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb"
                  }}
                >
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: alert.severity === 'critical' ? '#dc2626' : 
                               alert.severity === 'high' ? '#ea4335' : 
                               alert.severity === 'medium' ? '#f59e0b' : '#10b981',
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    color: "white",
                    fontWeight: 600
                  }}>
                    {alert.type === 'test' ? '🧪' : '🚨'}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 4 }}>
                      {alert.message}
                    </div>
                    <div style={{ fontSize: 11, color: "#666" }}>
                      {fmtDate(alert.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Settings */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            onClick={saveSettings}
            className="btn-primary"
            style={{ fontSize: 16, padding: "12px 32px" }}
          >
            💾 Save Notification Settings
          </button>
        </div>
      </div>
    </Page>
  );
}
