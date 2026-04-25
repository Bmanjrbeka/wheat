"use client";
import { useState, useEffect } from "react";
import { Page } from "@/components/Page";

interface OfflineDetection {
  id: string;
  image_url: string;
  disease: string;
  confidence: number;
  treatment: string;
  timestamp: number;
  synced: boolean;
}

export function OfflineMode() {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineDetections, setOfflineDetections] = useState<OfflineDetection[]>([]);
  const [pendingSync, setPendingSync] = useState(0);
  const [storageInfo, setStorageInfo] = useState({ used: 0, quota: 50 });

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    setIsOnline(navigator.onLine);
    
    // Load offline detections from localStorage
    const stored = localStorage.getItem('offlineDetections');
    if (stored) {
      setOfflineDetections(JSON.parse(stored));
    }
    
    // Check storage quota
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then((estimate) => {
        if (estimate.usage && estimate.quota) {
          setStorageInfo({
            used: Math.round(estimate.usage / 1024 / 1024), // MB
            quota: Math.round(estimate.quota / 1024 / 1024) // MB
          });
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOfflineDetection = (detection: any) => {
    const offlineDetection: OfflineDetection = {
      id: `offline-${Date.now()}`,
      image_url: detection.image_url || '',
      disease: detection.disease,
      confidence: detection.confidence,
      treatment: detection.treatment,
      timestamp: Date.now(),
      synced: false
    };

    const updated = [...offlineDetections, offlineDetection];
    setOfflineDetections(updated);
    
    // Save to localStorage
    try {
      localStorage.setItem('offlineDetections', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save offline detection:', error);
    }
  };

  const syncToServer = async () => {
    if (!isOnline) return;

    setPendingSync(offlineDetections.filter(d => !d.synced).length);
    
    try {
      // Simulate sync process (in real app, this would call your API)
      for (const detection of offlineDetections.filter(d => !d.synced)) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        
        // Mark as synced
        const updated = offlineDetections.map(d => 
          d.id === detection.id ? { ...d, synced: true } : d
        );
        setOfflineDetections(updated);
        setPendingSync(prev => Math.max(0, prev - 1));
      }
      
      // Clear localStorage after successful sync
      localStorage.removeItem('offlineDetections');
      setOfflineDetections([]);
      
    } catch (error) {
      console.error('Sync failed:', error);
      setPendingSync(0);
    }
  };

  const clearOfflineData = () => {
    if (confirm('Clear all offline detections? This cannot be undone.')) {
      localStorage.removeItem('offlineDetections');
      setOfflineDetections([]);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Page title="Offline Mode" subtitle="Analyze without internet connection">
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        
        {/* Connection Status */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: isOnline ? "#10b981" : "#ef4444",
              boxShadow: isOnline ? "0 0 0 4px rgba(16, 185, 129, 0.3)" : "0 0 0 4px rgba(239, 68, 68, 0.3)"
            }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: isOnline ? "#111" : "#ef4444", marginBottom: 4 }}>
                {isOnline ? "🌐 Online" : "📱 Offline Mode"}
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                {isOnline 
                  ? "Connected to server - Real-time analysis available"
                  : "Working offline - Results will sync when online"
                }
              </div>
            </div>
          </div>

          {/* Storage Info */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: "#666" }}>
              Storage: {storageInfo.used}MB / {storageInfo.quota}MB
            </div>
            <div style={{
              width: 200,
              height: 8,
              background: "#e5e7eb",
              borderRadius: 4,
              overflow: "hidden"
            }}>
              <div style={{
                width: `${(storageInfo.used / storageInfo.quota) * 100}%`,
                height: "100%",
                background: "#3b82f6",
                borderRadius: 4
              }} />
            </div>
          </div>
        </div>

        {/* Offline Actions */}
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111", marginBottom: 16 }}>
            Offline Capabilities
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ textAlign: "center", padding: "20px", background: "#f8f9fa", borderRadius: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>📸</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 4 }}>
                Image Analysis
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                AI disease detection works offline
              </div>
            </div>
            
            <div style={{ textAlign: "center", padding: "20px", background: "#f8f9fa", borderRadius: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>💾</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 4 }}>
                Local Storage
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                Results saved locally
              </div>
            </div>
            
            <div style={{ textAlign: "center", padding: "20px", background: "#f8f9fa", borderRadius: 8 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🔄</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 4 }}>
                Auto Sync
              </div>
              <div style={{ fontSize: 12, color: "#666" }}>
                Sync when online
              </div>
            </div>
          </div>
        </div>

        {/* Offline Detections */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>
              Offline Detections ({offlineDetections.length})
            </h3>
            
            <div style={{ display: "flex", gap: 8 }}>
              {!isOnline && pendingSync > 0 && (
                <button
                  onClick={syncToServer}
                  className="btn-primary"
                  style={{ fontSize: 12 }}
                >
                  🔄 Sync {pendingSync} Pending
                </button>
              )}
              
              {offlineDetections.length > 0 && (
                <button
                  onClick={clearOfflineData}
                  className="btn-ghost"
                  style={{ fontSize: 12 }}
                >
                  🗑️ Clear
                </button>
              )}
            </div>
          </div>

          {offlineDetections.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📱</div>
              <div style={{ fontSize: 16 }}>No offline detections</div>
              <div style={{ fontSize: 12, color: "#aaa" }}>
                {isOnline 
                  ? "Go to Analysis page to start detecting diseases"
                  : "Go online to enable real-time analysis"
                }
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {offlineDetections.map((detection) => (
                <div
                  key={detection.id}
                  style={{
                    display: "flex",
                    gap: 16,
                    padding: "16px",
                    background: "#f8f9fa",
                    borderRadius: 8,
                    border: detection.synced ? "1px solid #10b981" : "1px solid #e5e7eb"
                  }}
                >
                  {/* Image */}
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: 8,
                    background: "#e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    color: "#999"
                  }}>
                    {detection.image_url ? "📸" : "🌾"}
                  </div>
                  
                  {/* Detection Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#111"
                      }}>
                        {detection.disease}
                      </div>
                      <div style={{
                        fontSize: 12,
                        padding: "2px 8px",
                        borderRadius: 12,
                        background: detection.synced ? "#10b981" : "#fbbf24",
                        color: "white",
                        fontWeight: 500
                      }}>
                        {detection.synced ? "✓ Synced" : "⏳ Pending"}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#666" }}>
                      {formatTimestamp(detection.timestamp)}
                    </div>
                    </div>
                    
                    <div style={{ fontSize: 12, color: "#666", lineHeight: 1.4 }}>
                      {detection.treatment.substring(0, 120)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="card" style={{ padding: "20px" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111", marginBottom: 16 }}>
            How Offline Mode Works
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: "#666",
                fontWeight: 600
              }}>
                1
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 4 }}>
                  Analyze Offline
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  Use the Analysis page when offline. The app will detect diseases using the built-in AI model and save results locally.
                </div>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: "#666",
                fontWeight: 600
              }}>
                2
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 4 }}>
                  Auto-Save Results
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  All detection results are automatically saved to your device for offline access.
                </div>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                color: "#666",
                fontWeight: 600
              }}>
                3
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 4 }}>
                  Sync When Online
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  Results automatically sync to your account when you reconnect to the internet.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
