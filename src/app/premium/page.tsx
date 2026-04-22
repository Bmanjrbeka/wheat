"use client";
import { Page } from "@/components/Page";
import Link from "next/link";

const FEATURES = [
  { icon:"🗺", title:"GPS spread mapping",      desc:"Visualize disease outbreak patterns across your region on an interactive Leaflet map." },
  { icon:"📊", title:"Advanced reports",        desc:"Export professional PDF reports with full analysis history and trend data." },
  { icon:"🔔", title:"Outbreak alerts",         desc:"Real-time SMS and email alerts when high-severity diseases are detected in your area." },
  { icon:"👥", title:"Team accounts",           desc:"Share detection history with your team and agronomist with role-based access." },
  { icon:"🧠", title:"Model feedback",          desc:"Help improve the AI by flagging incorrect predictions — your data makes the model smarter." },
  { icon:"📱", title:"Offline mode",            desc:"Analyze leaves without internet connection. Results sync automatically when back online." },
];

export default function PremiumPage() {
  return (
    <Page title="Premium" subtitle="Advanced features for serious researchers">
      <div style={{ maxWidth:720, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>

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
            <button className="btn-primary" style={{ fontSize:13, padding:"10px 24px" }}>
              Coming soon — join waitlist
            </button>
            <Link href="/analysis" className="btn-ghost" style={{ fontSize:13, padding:"10px 24px" }}>
              Use free tier →
            </Link>
          </div>
        </div>

        {/* Features grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
          {FEATURES.map((f,i)=>(
            <div key={i} className="card" style={{ padding:20 }}>
              <div style={{ fontSize:22, marginBottom:10 }}>{f.icon}</div>
              <div style={{ fontSize:13, fontWeight:600, color:"#111", marginBottom:6 }}>{f.title}</div>
              <p style={{ fontSize:12, color:"#777", lineHeight:1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <p style={{ textAlign:"center", fontSize:12, color:"#aaa" }}>
          Premium features are under development. The free tier includes full AI diagnosis, history tracking, and GPS tagging.
        </p>
      </div>
    </Page>
  );
}
