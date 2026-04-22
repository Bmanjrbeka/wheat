"use client";
import { useEffect, useState } from "react";
import { Page } from "@/components/Page";
import { createClient } from "@/lib/supabase";
import { DISEASE_META, TREATMENTS, fmtConf, fmtDate, DetectionRecord, DiseaseClass } from "@/lib/constants";

const DISEASES: DiseaseClass[] = ["Healthy","Leaf Rust","Stripe Rust","Stem Rust","Septoria","Fusarium"];

const MOCK: DetectionRecord[] = [
  {id:"1",user_id:"u",image_url:"",disease:"Leaf Rust",  confidence:0.88,treatment:TREATMENTS["Leaf Rust"].treatment,  prevention:TREATMENTS["Leaf Rust"].prevention,  top3:[{disease:"Leaf Rust",confidence:0.88},{disease:"Healthy",confidence:0.08},{disease:"Septoria",confidence:0.04}],latitude:9.14,longitude:40.49,created_at:new Date(Date.now()-3600000).toISOString()},
  {id:"2",user_id:"u",image_url:"",disease:"Healthy",    confidence:0.95,treatment:TREATMENTS["Healthy"].treatment,    prevention:TREATMENTS["Healthy"].prevention,    top3:[{disease:"Healthy",confidence:0.95},{disease:"Septoria",confidence:0.03},{disease:"Leaf Rust",confidence:0.02}],latitude:null,longitude:null,created_at:new Date(Date.now()-7200000).toISOString()},
  {id:"3",user_id:"u",image_url:"",disease:"Stem Rust",  confidence:0.91,treatment:TREATMENTS["Stem Rust"].treatment,  prevention:TREATMENTS["Stem Rust"].prevention,  top3:[{disease:"Stem Rust",confidence:0.91},{disease:"Stripe Rust",confidence:0.07},{disease:"Leaf Rust",confidence:0.02}],latitude:8.9,longitude:40.1,created_at:new Date(Date.now()-86400000).toISOString()},
  {id:"4",user_id:"u",image_url:"",disease:"Stripe Rust",confidence:0.62,treatment:TREATMENTS["Stripe Rust"].treatment,prevention:TREATMENTS["Stripe Rust"].prevention,top3:[{disease:"Stripe Rust",confidence:0.62},{disease:"Leaf Rust",confidence:0.28},{disease:"Healthy",confidence:0.10}],latitude:null,longitude:null,created_at:new Date(Date.now()-172800000).toISOString()},
  {id:"5",user_id:"u",image_url:"",disease:"Fusarium",   confidence:0.79,treatment:TREATMENTS["Fusarium"].treatment,   prevention:TREATMENTS["Fusarium"].prevention,   top3:[{disease:"Fusarium",confidence:0.79},{disease:"Septoria",confidence:0.15},{disease:"Healthy",confidence:0.06}],latitude:9.2,longitude:40.6,created_at:new Date(Date.now()-259200000).toISOString()},
];

export default function HistoryPage() {
  const [records,  setRecords]  = useState<DetectionRecord[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [disease,  setDisease]  = useState<DiseaseClass|"All">("All");
  const [conf,     setConf]     = useState<"all"|"high"|"low">("all");
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState<string|null>(null);

  useEffect(()=>{
    (async()=>{
      try {
        const sb=createClient();
        const {data}=await sb.from("detection_history").select("*").order("created_at",{ascending:false}).limit(200);
        setRecords(data?.length?data as DetectionRecord[]:MOCK);
      } catch {setRecords(MOCK);}
      setLoading(false);
    })();
  },[]);

  const filtered = records.filter(r=>{
    if (disease!=="All"&&r.disease!==disease) return false;
    if (conf==="high"&&r.confidence<0.7) return false;
    if (conf==="low"&&r.confidence>=0.7) return false;
    if (search&&!r.disease.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Page title="History" subtitle={`${records.length} total detections`}>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

        {/* Filter bar */}
        <div className="card" style={{ padding:"12px 16px" }}>
          <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:10 }}>
            {/* Search */}
            <div style={{ position:"relative" }}>
              <svg style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)",
                            width:12, height:12, color:"#aaa" }}
                   viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="5.5" cy="5.5" r="3.5"/><line x1="8.5" y1="8.5" x2="11" y2="11"/>
              </svg>
              <input type="text" placeholder="Search disease…" value={search}
                onChange={e=>setSearch(e.target.value)}
                style={{ paddingLeft:28, paddingRight:10, height:32, border:"1px solid var(--border)",
                         borderRadius:8, fontSize:12, color:"#333", background:"#fafafa", width:160,
                         outline:"none", transition:"border-color var(--transition)" }}
              />
            </div>

            {/* Disease pills */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
              {(["All",...DISEASES] as const).map(d=>{
                const active=disease===d;
                const meta=d!=="All"?DISEASE_META[d]:null;
                return (
                  <button key={d} onClick={()=>setDisease(d)} style={{
                    padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:600,
                    cursor:"pointer", border:"none", transition:"all var(--transition)",
                    background: active&&meta?meta.bg : active?"var(--green-light)":"#f0f0f0",
                    color: active&&meta?meta.color : active?"var(--green-deep)":"#777",
                  }}>
                    {d}
                  </button>
                );
              })}
            </div>

            {/* Confidence filter */}
            <select value={conf} onChange={e=>setConf(e.target.value as typeof conf)} style={{
              padding:"5px 10px", border:"1px solid var(--border)", borderRadius:8,
              fontSize:11, color:"#555", background:"#fafafa", cursor:"pointer", outline:"none"
            }}>
              <option value="all">All confidence</option>
              <option value="high">≥ 70% confident</option>
              <option value="low">&lt; 70% — needs review</option>
            </select>

            <span style={{ marginLeft:"auto", fontSize:11, color:"#aaa", fontWeight:600 }}>
              {filtered.length} records
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow:"hidden" }}>
          {loading?(
            <div style={{ padding:16, display:"flex", flexDirection:"column", gap:8 }}>
              {[...Array(5)].map((_,i)=>(
                <div key={i} className="skeleton" style={{ height:52, opacity:1-i*.15 }}/>
              ))}
            </div>
          ):filtered.length===0?(
            <div style={{ padding:"48px 0", textAlign:"center", color:"#aaa" }}>
              <div style={{ fontSize:24, marginBottom:8 }}>🔍</div>
              <div style={{ fontSize:13 }}>No records match your filters</div>
            </div>
          ):(
            <div style={{ overflowX:"auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width:52 }}></th>
                    <th style={{ width:180 }}>Disease</th>
                    <th style={{ width:140 }}>Confidence</th>
                    <th style={{ width:180 }}>Date & time</th>
                    <th style={{ width:140 }}>Location</th>
                    <th style={{ width:80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(rec=>{
                    const meta=DISEASE_META[rec.disease];
                    const low=rec.confidence<0.7;
                    const open=expanded===rec.id;
                    return (
                      <>
                        <tr key={rec.id} style={{ background:open?"#f8fcf3":"" }}>
                          {/* Thumb */}
                          <td>
                            <div style={{ width:36, height:36, borderRadius:8, overflow:"hidden",
                                          background:"#f0f0f0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              {rec.image_url?(
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={rec.image_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                              ):(
                                <span style={{ fontSize:16, color:meta.color }}>{meta.icon}</span>
                              )}
                            </div>
                          </td>
                          {/* Disease */}
                          <td>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <div style={{ width:28, height:28, borderRadius:7, background:meta.bg,
                                            display:"flex", alignItems:"center", justifyContent:"center",
                                            fontSize:13, color:meta.color, flexShrink:0 }}>
                                {meta.icon}
                              </div>
                              <div>
                                <div style={{ fontSize:12, fontWeight:600, color:"#111" }}>{rec.disease}</div>
                                <div style={{ fontSize:10, color:meta.color, fontWeight:600 }}>{meta.severity}</div>
                              </div>
                            </div>
                          </td>
                          {/* Confidence */}
                          <td>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <span style={{ fontSize:12, fontWeight:700, color:low?"var(--amber-warn)":meta.color }}>
                                {fmtConf(rec.confidence)}
                              </span>
                              {low&&<span style={{ fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:10,
                                                   background:"var(--amber-bg)", color:"#633806" }}>Review</span>}
                              <div className="conf-track">
                                <div className="conf-fill" style={{ width:`${rec.confidence*100}%`, background:meta.color }}/>
                              </div>
                            </div>
                          </td>
                          {/* Date */}
                          <td><span style={{ fontSize:12, color:"#555" }}>{fmtDate(rec.created_at)}</span></td>
                          {/* GPS */}
                          <td>
                            {rec.latitude&&rec.longitude?(
                              <span style={{ fontSize:11, color:"var(--green-mid)", fontWeight:600,
                                             display:"inline-flex", alignItems:"center", gap:4 }}>
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                                     stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                                  <path d="M5 1a3 3 0 010 6L5 9 5 7a3 3 0 010-6z"/><circle cx="5" cy="4" r="1"/>
                                </svg>
                                {rec.latitude.toFixed(3)}, {rec.longitude.toFixed(3)}
                              </span>
                            ):<span style={{ fontSize:11, color:"#ddd" }}>No GPS</span>}
                          </td>
                          {/* Action */}
                          <td>
                            <button onClick={()=>setExpanded(open?null:rec.id)}
                              style={{
                                padding:"5px 12px", borderRadius:7, fontSize:11, fontWeight:600,
                                cursor:"pointer", border:"1px solid", transition:"all var(--transition)",
                                borderColor: open?"var(--green-mid)":"var(--border)",
                                background: open?"var(--green-light)":"transparent",
                                color: open?"var(--green-deep)":"#666",
                              }}>
                              {open?"Close":"View"}
                            </button>
                          </td>
                        </tr>

                        {open&&(
                          <tr key={`${rec.id}-x`}>
                            <td colSpan={6} style={{ background:"#f8fcf3", borderBottom:"1px solid var(--border)", padding:"16px 20px" }}>
                              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20 }}>
                                <div>
                                  <div style={{ fontSize:10, fontWeight:700, color:"var(--green-mid)", letterSpacing:".07em",
                                                textTransform:"uppercase", marginBottom:8 }}>Treatment</div>
                                  <p style={{ fontSize:12, color:"#555", lineHeight:1.7 }}>{rec.treatment}</p>
                                </div>
                                <div>
                                  <div style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:".07em",
                                                textTransform:"uppercase", marginBottom:8 }}>Prevention</div>
                                  <p style={{ fontSize:12, color:"#555", lineHeight:1.7 }}>{rec.prevention}</p>
                                </div>
                                {rec.top3?.length>0&&(
                                  <div>
                                    <div style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:".07em",
                                                  textTransform:"uppercase", marginBottom:8 }}>Top 3 predictions</div>
                                    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                                      {rec.top3.map((t,i)=>{
                                        const tm=DISEASE_META[t.disease];
                                        return (
                                          <div key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
                                            <span style={{ fontSize:10, color:"#ccc", width:16 }}>#{i+1}</span>
                                            <span style={{ fontSize:11, color:"#666", width:72 }}>{t.disease}</span>
                                            <div style={{ flex:1, height:4, background:"#e8e8e8", borderRadius:2, overflow:"hidden" }}>
                                              <div style={{ height:"100%", borderRadius:2, background:tm.color,
                                                            width:`${t.confidence*100}%`, opacity:i===0?1:.35 }}/>
                                            </div>
                                            <span style={{ fontSize:11, fontWeight:600, color:tm.color, width:30, textAlign:"right" }}>
                                              {fmtConf(t.confidence)}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                              {low&&(
                                <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
                                              borderRadius:8, background:"var(--amber-bg)", border:"1px solid #EF9F27" }}>
                                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="var(--amber-warn)"
                                       strokeWidth="1.5" strokeLinecap="round">
                                    <path d="M6.5 1.5l5.5 10H1L6.5 1.5z"/><line x1="6.5" y1="5.5" x2="6.5" y2="7.5"/>
                                  </svg>
                                  <span style={{ fontSize:11, color:"#633806", fontWeight:600 }}>
                                    Low confidence — manual verification recommended before applying treatment.
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
