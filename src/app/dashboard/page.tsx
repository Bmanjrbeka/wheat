"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Page } from "@/components/Page";
import { createClient } from "@/lib/supabase";
import { DISEASE_META, fmtConf, fmtDate, fmtRelative, DetectionRecord, DiseaseClass } from "@/lib/constants";

const MOCK: DetectionRecord[] = [
  { id:"1",user_id:"u",image_url:"",disease:"Healthy",    confidence:0.94,treatment:"",prevention:"",top3:[],latitude:9.14, longitude:40.49,created_at:new Date(Date.now()-120000).toISOString()},
  { id:"2",user_id:"u",image_url:"",disease:"Leaf Rust",  confidence:0.88,treatment:"",prevention:"",top3:[],latitude:null,longitude:null,  created_at:new Date(Date.now()-840000).toISOString()},
  { id:"3",user_id:"u",image_url:"",disease:"Stripe Rust",confidence:0.62,treatment:"",prevention:"",top3:[],latitude:9.01, longitude:40.22,created_at:new Date(Date.now()-3600000).toISOString()},
  { id:"4",user_id:"u",image_url:"",disease:"Stem Rust",  confidence:0.91,treatment:"",prevention:"",top3:[],latitude:null,longitude:null,  created_at:new Date(Date.now()-10800000).toISOString()},
  { id:"5",user_id:"u",image_url:"",disease:"Healthy",    confidence:0.97,treatment:"",prevention:"",top3:[],latitude:8.88, longitude:40.01,created_at:new Date(Date.now()-86400000).toISOString()},
  { id:"6",user_id:"u",image_url:"",disease:"Fusarium",   confidence:0.79,treatment:"",prevention:"",top3:[],latitude:null,longitude:null,  created_at:new Date(Date.now()-172800000).toISOString()},
];

export default function DashboardPage() {
  const [records, setRecords] = useState<DetectionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sb = createClient();
        const { data } = await sb.from("detection_history").select("*")
          .order("created_at",{ascending:false}).limit(100);
        setRecords(data?.length ? data as DetectionRecord[] : MOCK);
      } catch { setRecords(MOCK); }
      setLoading(false);
    })();
  }, []);

  const counts: Record<string,number> = {};
  let totalConf = 0;
  records.forEach(r => { counts[r.disease]=(counts[r.disease]??0)+1; totalConf+=r.confidence; });
  const avgConf  = records.length ? totalConf/records.length : 0;
  const lowCount = records.filter(r=>r.confidence<0.7).length;
  const weekAgo  = Date.now()-7*86400000;
  const thisWeek = records.filter(r=>new Date(r.created_at).getTime()>weekAgo).length;
  const maxCount = Math.max(...Object.values(counts),1);

  const DISEASE_ORDER: DiseaseClass[] = ["Healthy","Leaf Rust","Stripe Rust","Stem Rust","Septoria","Fusarium"];

  return (
    <Page
      title="Dashboard"
      subtitle="Detection activity overview"
      actions={
        <Link href="/analysis" className="btn-primary tap">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/>
          </svg>
          New analysis
        </Link>
      }
    >
      <div style={{ display:"flex", flexDirection:"column", gap:16, maxWidth:1100 }}>

        {/* ── Stats row ──────────────────────────────────── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[
            { label:"Total scans",    value: loading?"—":records.length,               sub:`${thisWeek} this week`,           warn:false },
            { label:"Avg confidence", value: loading?"—":`${Math.round(avgConf*100)}%`, sub:"Across all images",             warn:false },
            { label:"Low confidence", value: loading?"—":lowCount,                     sub:"Manual review needed",             warn:true  },
            { label:"GPS tagged",     value: loading?"—":records.filter(r=>r.latitude).length, sub:"Location recorded",     warn:false },
          ].map((s,i)=>(
            <div key={i} className="card" style={{ padding:"16px 20px" }}>
              <div style={{ fontSize:11, color:"#888", marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                {s.label}
                {s.warn && <span style={{ width:6,height:6,borderRadius:"50%",background:"var(--amber-warn)",display:"inline-block" }}/>}
              </div>
              <div style={{ fontSize:26, fontWeight:600, color: s.warn?"var(--amber-warn)":"#111", lineHeight:1, marginBottom:4 }}>
                {loading ? <div className="skeleton" style={{width:48,height:28}}/> : String(s.value)}
              </div>
              <div style={{ fontSize:11, color:"#aaa" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Charts row ─────────────────────────────────── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>

          {/* Disease distribution */}
          <div className="card" style={{ padding:"18px 20px" }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#111", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              Disease distribution
              <span style={{ fontSize:11, color:"#aaa", fontWeight:400 }}>{records.length} scans total</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {loading ? (
                [75,55,40,25,15,8].map((w,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div className="skeleton" style={{ width:70, height:10 }}/>
                    <div className="skeleton" style={{ width:`${w}%`, height:22, flex:"none", borderRadius:4 }}/>
                  </div>
                ))
              ) : (
                DISEASE_ORDER.map(d => {
                  const meta = DISEASE_META[d];
                  const count = counts[d] ?? 0;
                  const pct   = count/maxCount;
                  return (
                    <div key={d} style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ width:72, fontSize:11, color:"#666", textAlign:"right", flexShrink:0 }}>
                        {d.split(" ")[0]}
                      </span>
                      <div style={{ flex:1, height:24, background:"#f4f4f4", borderRadius:6, overflow:"hidden" }}>
                        <div style={{
                          height:"100%", borderRadius:6, minWidth: count>0?28:0,
                          width:`${pct*100}%`, background:meta.color, opacity:.85,
                          display:"flex", alignItems:"center", paddingLeft:8,
                          transition:"width 800ms cubic-bezier(.4,0,.2,1)"
                        }}>
                          {count > 0 && (
                            <span style={{ fontSize:11, fontWeight:600, color:"#fff" }}>{count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent activity */}
          <div className="card" style={{ padding:"18px 20px" }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#111", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              Recent activity
              <Link href="/history" style={{ fontSize:11, color:"var(--green-mid)", textDecoration:"none", fontWeight:500 }}>
                View all →
              </Link>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {loading ? (
                [...Array(5)].map((_,i)=>(
                  <div key={i} className="skeleton" style={{ height:44, borderRadius:10, opacity:1-i*.15 }}/>
                ))
              ) : records.slice(0,6).map(rec => {
                const meta = DISEASE_META[rec.disease];
                const low  = rec.confidence<0.7;
                return (
                  <div key={rec.id} style={{
                    display:"flex", alignItems:"center", gap:10, padding:"8px 10px",
                    borderRadius:10, background:"#fafafa", transition:"background var(--transition)"
                  }}
                  onMouseEnter={e=>(e.currentTarget.style.background="#f2f8ed")}
                  onMouseLeave={e=>(e.currentTarget.style.background="#fafafa")}>
                    <div style={{ width:30, height:30, borderRadius:8, background:meta.bg,
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  fontSize:14, color:meta.color, flexShrink:0 }}>
                      {meta.icon}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600, color:"#111", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {rec.disease}
                      </div>
                      <div style={{ fontSize:10, color:"#aaa" }}>{fmtRelative(rec.created_at)}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:12, fontWeight:700, color: low?"var(--amber-warn)":meta.color }}>
                        {fmtConf(rec.confidence)}
                      </div>
                      {low && <div style={{ fontSize:9, color:"var(--amber-warn)", fontWeight:600 }}>⚠ review</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── CTA ────────────────────────────────────────── */}
        <div className="card" style={{ padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:"#111", marginBottom:4 }}>Start a new analysis</div>
            <div style={{ fontSize:12, color:"#888" }}>Upload up to 10 wheat leaf images for batch AI diagnosis</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Link href="/analysis" className="btn-primary tap">Analyze leaves →</Link>
            <Link href="/history"  className="btn-ghost tap">View history</Link>
          </div>
        </div>
      </div>
    </Page>
  );
}
