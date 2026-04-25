"use client";
import { useState, useEffect } from "react";
import { Page } from "@/components/Page";
import { GPSMap } from "@/components/GPSMap";
import { OfflineMode } from "@/components/OfflineMode";
import { Notifications } from "@/components/Notifications";
import { createClient } from "@/lib/supabase";
import { DetectionRecord } from "@/lib/constants";
import Link from "next/link";

const FEATURES = [
  { icon:"📊", title:"Advanced reports",        desc:"Export professional PDF reports with full analysis history and trend data.", status:"available" },
  { icon:"🗺", title:"GPS spread mapping",      desc:"Visualize disease outbreak patterns across your region on an interactive Leaflet map.", status:"available" },
  { icon:"🔔", title:"Outbreak alerts",         desc:"Real-time SMS and email alerts when high-severity diseases are detected in your area.", status:"coming" },
    { icon:"🧠", title:"Model feedback",          desc:"Help improve the AI by flagging incorrect predictions — your data makes the model smarter.", status:"coming" },
  { icon:"�", title:"Email notifications",    desc:"Real-time email alerts for disease detections and team updates.", status:"available" },
  { icon:"�", title:"Offline mode",            desc:"Analyze leaves without internet connection. Results sync automatically when back online.", status:"available" },
];

export default function PremiumPage() {
  const [records, setRecords] = useState<DetectionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"features" | "mapping" | "offline" | "notifications">("features");

  useEffect(() => {
    if (activeTab === "mapping") {
      loadDetectionData();
    }
  }, [activeTab]);

  const loadDetectionData = async () => {
    try {
      const sb = createClient();
      const { data } = await sb.from("detection_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (data && data.length > 0) {
        setRecords(data as DetectionRecord[]);
      } else {
        // Generate mock data for demonstration
        const mockRecords = Array.from({ length: 50 }, (_, i) => ({
          id: `mock-${i}`,
          user_id: "demo-user",
          image_url: "",
          disease: ["Healthy", "Leaf Rust", "Stripe Rust", "Stem Rust", "Septoria", "Fusarium"][Math.floor(Math.random() * 6)] as any,
          confidence: 0.6 + Math.random() * 0.4,
          treatment: "",
          prevention: "",
          top3: [],
          latitude: 8.0 + Math.random() * 2,
          longitude: 38.0 + Math.random() * 4,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
        setRecords(mockRecords);
      }
    } catch (error) {
      console.error("Failed to load detection data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Premium" subtitle="Advanced features for serious researchers">
      <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>

        {/* Tab Navigation */}
        <div style={{ display:"flex", gap:0, marginBottom:20 }}>
          <button
            onClick={() => setActiveTab("features")}
            className={activeTab === "features" ? "btn-primary" : "btn-ghost"}
            style={{ 
              borderRadius:"8px 0 0 8px", 
              borderTop:"none",
              borderLeft:"none",
              borderRight:"none"
            }}
          >
            🚀 Features
          </button>
          <button
            onClick={() => setActiveTab("mapping")}
            className={activeTab === "mapping" ? "btn-primary" : "btn-ghost"}
            style={{ 
              borderRadius:"0 8px 8px 0",
              borderTop:"none",
              borderLeft:"none",
              borderRight:"none"
            }}
          >
            🗺 GPS Mapping
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={activeTab === "notifications" ? "btn-primary" : "btn-ghost"}
            style={{ 
              borderRadius:"0 8px 8px 0",
              borderTop:"none",
              borderLeft:"none",
              borderRight:"none"
            }}
          >
            🔔 Notifications
          </button>
        </div>

        {activeTab === "features" && (
          <>
            {/* Hero */}
            <div className="card" style={{
              padding:"32px 36px", textAlign:"center",
              background:"linear-gradient(135deg, #EAF3DE 0%, #f8fcf3 100%)"
            }}>
              <div style={{ fontSize:32, marginBottom:12 }}>🌾</div>
              <h2 style={{ fontSize:22, fontWeight:700, color:"var(--green-deep)", marginBottom:8 }}>
                WheatGuard Premium
              </h2>
              <p style={{ fontSize:13, color:"#555", maxWidth:440, margin:"0 auto 20px" }}>
                Everything in the free tier, plus advanced tools for researchers, extension officers, and agricultural institutions.
              </p>
              <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                <Link href="/reports" className="btn-primary" style={{ fontSize:13, padding:"10px 24px" }}>
                  📊 Try Reports
                </Link>
                <Link href="/analysis" className="btn-ghost" style={{ fontSize:13, padding:"10px 24px" }}>
                  Use free tier →
                </Link>
              </div>
            </div>

            {/* Features grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              {FEATURES.map((f,i)=>(
                <div key={i} className="card" style={{ padding:20, position:"relative" }}>
                  {f.status === "available" && (
                    <div style={{
                      position:"absolute",
                      top:10,
                      right:10,
                      background:"var(--green-mid)",
                      color:"white",
                      fontSize:10,
                      fontWeight:600,
                      padding:"2px 8px",
                      borderRadius:12
                    }}>
                      AVAILABLE
                    </div>
                  )}
                  {f.status === "coming" && (
                    <div style={{
                      position:"absolute",
                      top:10,
                      right:10,
                      background:"var(--amber-warn)",
                      color:"white",
                      fontSize:10,
                      fontWeight:600,
                      padding:"2px 8px",
                      borderRadius:12
                    }}>
                      COMING SOON
                    </div>
                  )}
                  <div style={{ fontSize:22, marginBottom:10 }}>{f.icon}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#111", marginBottom:6 }}>{f.title}</div>
                  <p style={{ fontSize:12, color:"#777", lineHeight:1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "mapping" && (
          <div className="card" style={{ padding:0 }}>
            <div style={{ padding:"20px", borderBottom:"1px solid var(--border)" }}>
              <h2 style={{ fontSize:18, fontWeight:700, color:"#111", marginBottom:8 }}>
                🗺 Disease Spread Mapping
              </h2>
              <p style={{ fontSize:13, color:"#666", lineHeight:1.6 }}>
                Interactive map showing wheat disease detection locations. Filter by disease type and view outbreak patterns.
                Click markers for detailed information about each detection.
              </p>
              <div style={{ display:"flex", gap:12, marginTop:16 }}>
                <div style={{ 
                  padding:"8px 16px", 
                  background:"var(--green-pale)", 
                  borderRadius:8, 
                  fontSize:12, 
                  fontWeight:600, 
                  color:"var(--green-deep)" 
                }}>
                  📍 {records.length} Detections Mapped
                </div>
                <div style={{ 
                  padding:"8px 16px", 
                  background:"#f8f9fa", 
                  borderRadius:8, 
                  fontSize:12, 
                  fontWeight:600, 
                  color:"#666" 
                }}>
                  🗺 Interactive Filtering
                </div>
                <div style={{ 
                  padding:"8px 16px", 
                  background:"#f8f9fa", 
                  borderRadius:8, 
                  fontSize:12, 
                  fontWeight:600, 
                  color:"#666" 
                }}>
                  📊 Disease Heatmap
                </div>
              </div>
            </div>
            
            {loading ? (
              <div style={{ 
                display:"flex", 
                justifyContent:"center", 
                alignItems:"center", 
                height:"400px",
                color:"#666" 
              }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:24, marginBottom:16 }}>🗺</div>
                  <div style={{ fontSize:16 }}>Loading map data...</div>
                </div>
              </div>
            ) : (
              <GPSMap 
                records={records}
                center={[9.145, 40.489]} // Ethiopia center
                zoom={7}
                className="premium-map"
              />
            )}
          </div>
        )}

        
        {activeTab === "notifications" && (
          <Notifications />
        )}

        {activeTab === "offline" && (
          <OfflineMode />
        )}

        <div style={{ textAlign:"center", fontSize:12, color:"#666", marginTop:20 }}>
          <strong>Available Now:</strong> Advanced reports, GPS mapping, offline mode & email notifications | 
          <strong>Coming Soon:</strong> Outbreak alerts, model feedback
        </div>
      </div>
    </Page>
  );
}
