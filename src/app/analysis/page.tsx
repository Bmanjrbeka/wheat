"use client";
import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Page } from "@/components/Page";
import { predictDisease } from "@/lib/api";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { DISEASE_META, TREATMENTS, fmtConf, QueueItem, QueueStatus, PredictionResult, DiseaseClass } from "@/lib/constants";

const MAX   = 10;
const LCONF = 0.70;

function resize(file: File, s=512): Promise<File> {
  return new Promise(r=>{
    const img=new Image(), url=URL.createObjectURL(file);
    img.onload=()=>{
      const c=document.createElement("canvas"); c.width=c.height=s;
      const ctx=c.getContext("2d")!;
      const m=Math.min(img.width,img.height);
      ctx.drawImage(img,(img.width-m)/2,(img.height-m)/2,m,m,0,0,s,s);
      URL.revokeObjectURL(url);
      c.toBlob(b=>r(new File([b!],file.name,{type:"image/jpeg"})),"image/jpeg",.9);
    };
    img.src=url;
  });
}

export default function AnalysisPage() {
  const { user } = useAuth();
  const [queue,    setQueue]    = useState<QueueItem[]>([]);
  const [running,  setRunning]  = useState(false);
  const [selected, setSelected] = useState<string|null>(null);
  const [showXAI,  setShowXAI]  = useState(false);
  const runRef = useRef(false);

  const onDrop = useCallback((files: File[]) => {
    const items: QueueItem[] = files.slice(0,MAX-queue.length).map(f=>({
      id:crypto.randomUUID(), file:f, previewUrl:URL.createObjectURL(f), status:"waiting" as QueueStatus
    }));
    setQueue(p=>[...p,...items]);
  }, [queue.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept:{"image/*":[".jpg",".jpeg",".png",".webp"]}, maxFiles:MAX, disabled:running,
  });

  async function run() {
    if (runRef.current) return;
    runRef.current=true; setRunning(true);
    const sb = user?createClient():null;
    const items = queue.filter(i=>i.status==="waiting");
    for (const item of items) {
      setQueue(p=>p.map(i=>i.id===item.id?{...i,status:"processing"}:i));
      try {
        const resized = await resize(item.file);
        const result  = await predictDisease(resized);
        if (sb&&user) {
          try {
            const fname=`${user.id}/${Date.now()}.jpg`;
            const {data:up}=await sb.storage.from("leaf-images").upload(fname,resized);
            if (up){
              const {data:{publicUrl}}=sb.storage.from("leaf-images").getPublicUrl(up.path);
              result.image_url=publicUrl;
              const {data:rec}=await sb.from("detection_history").insert({
                user_id:user.id, image_url:publicUrl, disease:result.disease,
                confidence:result.confidence, treatment:result.treatment,
                prevention:result.prevention, top3:result.top3,
                latitude:null, longitude:null,
              }).select("id").single();
              if(rec) result.record_id=rec.id;
            }
          } catch(e){console.error("Sync:",e);}
        }
        setQueue(p=>p.map(i=>i.id===item.id?{...i,status:"done",result}:i));
        setSelected(s=>s??item.id);
        setShowXAI(false);
      } catch(err){
        setQueue(p=>p.map(i=>i.id===item.id?{...i,status:"error",error:err instanceof Error?err.message:"Failed"}:i));
      }
    }
    runRef.current=false; setRunning(false);
  }

  function clear(){queue.forEach(i=>URL.revokeObjectURL(i.previewUrl));setQueue([]);setSelected(null);}

  const sel     = queue.find(i=>i.id===selected);
  const waiting = queue.filter(i=>i.status==="waiting").length;
  const done    = queue.filter(i=>i.status==="done").length;

  return (
    <Page
      title="Analysis"
      subtitle={queue.length?`${done}/${queue.length} processed`:"Batch leaf diagnosis"}
    >
      <div style={{ display:"flex", gap:16, height:"calc(100vh - 52px - 40px)" }}>

        {/* ── Queue panel ────────────────────────────────── */}
        <div style={{ width:240, flexShrink:0, display:"flex", flexDirection:"column", gap:10 }}>
          {/* Drop zone */}
          <div className="card" style={{ overflow:"hidden" }}>
            <div {...getRootProps()} style={{
              padding:16, textAlign:"center", cursor: running?"not-allowed":"pointer",
              background: isDragActive?"var(--green-light)":"transparent",
              border:"2px dashed", borderColor: isDragActive?"var(--green-mid)":"var(--border)",
              borderRadius:12, transition:"all var(--transition)"
            }}>
              <input {...getInputProps()}/>
              <div style={{
                width:36, height:36, borderRadius:"50%",
                background: isDragActive?"var(--green-mid)":"#f0f0f0",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto 8px"
              }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
                     stroke={isDragActive?"#EAF3DE":"#888"} strokeWidth="1.7" strokeLinecap="round">
                  <path d="M7.5 10V3M4.5 6l3-3 3 3M2.5 12.5h10"/>
                </svg>
              </div>
              <div style={{ fontSize:12, fontWeight:600, color:"#333" }}>
                {isDragActive?"Drop images here":"Upload leaves"}
              </div>
              <div style={{ fontSize:10, color:"#aaa", marginTop:4 }}>
                Max {MAX} images · JPG PNG WEBP
              </div>
            </div>
            <div style={{ padding:"8px 12px 12px" }}>
              <label style={{
                display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                padding:"7px 12px", borderRadius:8, border:"1px solid var(--border)",
                fontSize:12, fontWeight:500, color:"#555", cursor:"pointer", background:"#fafafa"
              }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="1" y="4" width="11" height="8" rx="1.5"/>
                  <circle cx="6.5" cy="8" r="2.2"/>
                  <path d="M4.5 4L5.3 2h2.4l.8 2"/>
                </svg>
                Camera capture
                <input type="file" accept="image/*" capture="environment" style={{display:"none"}}
                  onChange={e=>{const f=e.target.files?.[0];if(f)onDrop([f]);e.target.value="";}}/>
              </label>
            </div>
          </div>

          {/* Queue list */}
          <div className="card" style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"10px 12px 6px", fontSize:11, fontWeight:600, color:"#888",
                          textTransform:"uppercase", letterSpacing:".06em", borderBottom:"1px solid var(--border)" }}>
              Queue · {queue.length}/{MAX}
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:8, display:"flex", flexDirection:"column", gap:6 }}
                 className="scrollbar-hide">
              {queue.length===0?(
                <div style={{ textAlign:"center", padding:"24px 0", color:"#bbb", fontSize:12 }}>
                  No images queued
                </div>
              ):queue.map(item=>{
                const SMAP={
                  waiting:   {dot:"#ccc",         label:"Waiting"},
                  processing:{dot:"var(--amber-warn)", label:"Processing"},
                  done:      {dot:"var(--green-mid)", label:"Done"},
                  error:     {dot:"var(--red-alert)", label:"Error"},
                };
                const s=SMAP[item.status];
                const meta=item.result?DISEASE_META[item.result.disease]:null;
                return (
                  <div key={item.id}
                    onClick={()=>item.status==="done"&&setSelected(item.id)}
                    style={{
                      display:"flex", alignItems:"center", gap:8,
                      padding:"8px 9px", borderRadius:10,
                      border:`1.5px solid ${selected===item.id?"var(--green-mid)":"var(--border)"}`,
                      background: selected===item.id?"var(--green-pale)":"#fafafa",
                      cursor: item.status==="done"?"pointer":"default",
                      transition:"all var(--transition)"
                    }}>
                    <div style={{ width:32, height:32, borderRadius:8, overflow:"hidden", flexShrink:0, background:"#eee" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.previewUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:11, fontWeight:600, color:"#222", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {item.file.name}
                      </div>
                      {meta&&<div style={{ fontSize:10, fontWeight:600, color:meta.color }}>{item.result!.disease}</div>}
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <span style={{
                        width:6, height:6, borderRadius:"50%", background:s.dot,
                        display:"inline-block", marginBottom:2,
                        animation: item.status==="processing"?"pulse 1.6s infinite":"none"
                      }}/>
                      <div style={{ fontSize:9, color:"#aaa" }}>{s.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {queue.length>0&&(
              <div style={{ padding:"8px 10px", borderTop:"1px solid var(--border)", display:"flex", gap:6 }}>
                {waiting>0&&!running&&(
                  <button onClick={run} className="btn-primary"
                    style={{ flex:1, justifyContent:"center", fontSize:12 }}>
                    Analyze {waiting} image{waiting!==1?"s":""}
                  </button>
                )}
                {running&&(
                  <div style={{ flex:1, textAlign:"center", padding:"8px", fontSize:11,
                                fontWeight:600, color:"var(--green-mid)", background:"var(--green-light)",
                                borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    <span className="pulse-dot" style={{ background:"var(--green-mid)" }}/>
                    Processing…
                  </div>
                )}
                {!waiting&&!running&&(
                  <button onClick={clear} className="btn-ghost" style={{ flex:1, justifyContent:"center", fontSize:12 }}>
                    Clear queue
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Result panel ───────────────────────────────── */}
        <div style={{ flex:1, overflowY:"auto" }} className="scrollbar-hide">
          {!sel||sel.status!=="done"?(
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                          height:"100%", gap:16, color:"#bbb", textAlign:"center" }}>
              <div style={{ width:56, height:56, borderRadius:16, background:"var(--green-light)",
                            display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="var(--green-mid)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 3C12 3 6 8 6 14a6 6 0 0012 0c0-6-6-11-6-11z"/>
                  <line x1="12" y1="7" x2="12" y2="20"/><line x1="9" y1="12" x2="12" y2="15"/>
                  <line x1="15" y1="10" x2="12" y2="13"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:"#555", marginBottom:4 }}>
                  {running?"Analysis running…":queue.length>0?"Select a completed result":"No images uploaded"}
                </div>
                <div style={{ fontSize:12, color:"#aaa", maxWidth:260 }}>
                  {running?"Results appear here as each image finishes"
                  :queue.length>0?"Click a done item in the queue to view its diagnosis"
                  :"Upload wheat leaf images from the panel to begin"}
                </div>
              </div>
            </div>
          ):(
            <ResultView item={sel} showXAI={showXAI} onToggleXAI={()=>setShowXAI(s=>!s)}/>
          )}
        </div>
      </div>
    </Page>
  );
}

function ResultView({item,showXAI,onToggleXAI}:{item:QueueItem;showXAI:boolean;onToggleXAI:()=>void}) {
  const r    = item.result!;
  const meta = DISEASE_META[r.disease];
  const t    = TREATMENTS[r.disease]??TREATMENTS["Healthy"];
  const low  = r.confidence<LCONF;

  return (
    <div style={{ maxWidth:600, margin:"0 auto", display:"flex", flexDirection:"column", gap:12 }}>
      {low&&(
        <div style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 16px",
                      borderRadius:12, background:"var(--amber-bg)", border:"1px solid #EF9F27" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--amber-warn)" strokeWidth="1.7" strokeLinecap="round" style={{flexShrink:0,marginTop:1}}>
            <path d="M9 2l7 13H2L9 2z"/><line x1="9" y1="8" x2="9" y2="11"/>
            <circle cx="9" cy="13" r=".6" fill="var(--amber-warn)"/>
          </svg>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#633806" }}>Manual verification required</div>
            <div style={{ fontSize:11, color:"#854F0B", marginTop:2 }}>
              Confidence is {fmtConf(r.confidence)} — below the 70% threshold. Confirm with an agronomist before applying treatment.
            </div>
          </div>
        </div>
      )}

      {/* Main result */}
      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{ display:"flex", gap:16, padding:20 }}>
          {/* Image + XAI */}
          <div style={{ position:"relative", width:140, height:140, borderRadius:12, overflow:"hidden",
                        background:"#eee", flexShrink:0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.previewUrl} alt="Leaf" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            {showXAI&&(
              <div style={{ position:"absolute", inset:0, borderRadius:12, overflow:"hidden" }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <defs>
                    <radialGradient id="h1" cx="42%" cy="38%" r="32%">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity=".9"/>
                      <stop offset="100%" stopColor="transparent"/>
                    </radialGradient>
                    <radialGradient id="h2" cx="65%" cy="60%" r="24%">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity=".7"/>
                      <stop offset="100%" stopColor="transparent"/>
                    </radialGradient>
                    <radialGradient id="h3" cx="28%" cy="72%" r="18%">
                      <stop offset="0%" stopColor="#FBBF24" stopOpacity=".5"/>
                      <stop offset="100%" stopColor="transparent"/>
                    </radialGradient>
                  </defs>
                  <rect width="140" height="140" fill="url(#h1)"/>
                  <rect width="140" height="140" fill="url(#h2)"/>
                  <rect width="140" height="140" fill="url(#h3)"/>
                </svg>
                <div style={{ position:"absolute", bottom:6, left:6, fontSize:9, fontWeight:700,
                              color:"#fff", background:"rgba(0,0,0,.6)", padding:"2px 6px", borderRadius:4 }}>
                  GRAD-CAM
                </div>
              </div>
            )}
            <button onClick={onToggleXAI} style={{
              position:"absolute", top:6, right:6, padding:"3px 8px", borderRadius:6,
              fontSize:9, fontWeight:700, color:"#fff", background:"rgba(0,0,0,.6)",
              border:"none", cursor:"pointer"
            }}>
              {showXAI?"Hide":"XAI"}
            </button>
          </div>

          {/* Result info */}
          <div style={{ flex:1 }}>
            <span className="pill" style={{ background:meta.bg, color:meta.color, marginBottom:8, display:"inline-flex" }}>
              {meta.icon} {meta.severity.toUpperCase()}
            </span>
            <div style={{ fontSize:22, fontWeight:700, color:"#111", marginBottom:2 }}>{r.disease}</div>
            <div style={{ fontSize:11, color:"#aaa", marginBottom:16 }}>
              {r.inference_ms}ms · EfficientNetB3
            </div>

            {/* Confidence */}
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:6 }}>
                <span style={{ color:"#888" }}>Confidence</span>
                <span style={{ fontWeight:700, color:meta.color }}>{fmtConf(r.confidence)}</span>
              </div>
              <div style={{ height:10, background:"#f0f0f0", borderRadius:5, overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:5, background:meta.color,
                              width:`${r.confidence*100}%`, transition:"width 900ms cubic-bezier(.4,0,.2,1)" }}/>
              </div>
            </div>

            {/* Top 3 */}
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:".06em",
                            textTransform:"uppercase", marginBottom:8 }}>Top 3</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {r.top3.map((t,i)=>{
                  const tm=DISEASE_META[t.disease];
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:10, color:"#ccc", width:16 }}>#{i+1}</span>
                      <span style={{ fontSize:11, color:"#555", width:80, flexShrink:0 }}>{t.disease}</span>
                      <div style={{ flex:1, height:5, background:"#f0f0f0", borderRadius:3, overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:3, background:tm.color,
                                      width:`${t.confidence*100}%`, opacity:i===0?1:.4 }}/>
                      </div>
                      <span style={{ fontSize:11, fontWeight:600, color:tm.color, width:32, textAlign:"right" }}>
                        {fmtConf(t.confidence)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Treatment */}
      <div className="card" style={{ padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"var(--green-light)",
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--green-mid)" strokeWidth="1.6" strokeLinecap="round">
              <path d="M7 1.5C7 1.5 3.5 4.5 3.5 8A3.5 3.5 0 0010.5 8c0-3.5-3.5-6.5-3.5-6.5z"/>
            </svg>
          </div>
          <span style={{ fontSize:13, fontWeight:700, color:"#111" }}>Treatment & Prevention</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:"var(--green-mid)", letterSpacing:".07em",
                          textTransform:"uppercase", marginBottom:8 }}>Immediate treatment</div>
            <p style={{ fontSize:12, color:"#555", lineHeight:1.7 }}>{t.treatment}</p>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:"#aaa", letterSpacing:".07em",
                          textTransform:"uppercase", marginBottom:8 }}>Prevention</div>
            <p style={{ fontSize:12, color:"#555", lineHeight:1.7 }}>{t.prevention}</p>
          </div>
        </div>
      </div>

      {/* All probabilities */}
      <div className="card" style={{ padding:20 }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#111", marginBottom:16 }}>All class probabilities</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {Object.entries(r.all_probabilities).sort(([,a],[,b])=>b-a).map(([cls,prob])=>{
            const m=DISEASE_META[cls as DiseaseClass];
            const top=cls===r.disease;
            return (
              <div key={cls} style={{
                padding:"10px 12px", borderRadius:10,
                background: top?"var(--green-pale)":"#fafafa",
                border: top?"1px solid #C0DD97":"1px solid transparent"
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}>
                  <span style={{ fontWeight: top?700:400, color: top?"#111":"#777" }}>{m.icon} {cls}</span>
                  <span style={{ fontWeight:700, color:top?m.color:"#aaa" }}>{fmtConf(prob)}</span>
                </div>
                <div style={{ height:5, background:"#eee", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:3, background:m.color,
                                width:`${prob*100}%`, opacity:top?1:.3,
                                transition:"width 700ms cubic-bezier(.4,0,.2,1)" }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {r.record_id&&(
        <div style={{ textAlign:"center", fontSize:11, color:"#bbb" }}>
          ✓ Synced to database · {r.record_id.slice(0,8)}…
        </div>
      )}
    </div>
  );
}
