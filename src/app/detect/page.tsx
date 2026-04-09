"use client"; 
import { useState } from "react"; 
import { getWheatPrediction } from "@/lib/predict"; 
 
export default function DetectPage() { 
  const [file, setFile] = useState<any>(null); 
  const [res, setRes] = useState<any>(null); 
  const [loading, setLoading] = useState(false); 
 
  const run = async () => { 
    if (!file) return; 
    setLoading(true); 
    try { 
      const d: any = await getWheatPrediction(file); 
      if (d && d[0]) setRes(d[0]); 
    } catch (e) { alert("Error connecting to AI"); } 
    setLoading(false); 
  }; 
 
  return ( 
    <div style={{padding: "40px", fontFamily: "sans-serif"}}> 
      <h1>Wheat Disease Detector</h1> 
      <input type="file" accept="image/*" onChange={(e: any) => setFile(e.target.files[0])} /> 
      <button onClick={run} disabled={loading}>{loading ? "Analyzing..." : "Detect"}</button> 
      {res && <div style={{marginTop: "20px", color: "green"}}><h2>Result: {res.label}</h2></div>} 
    </div> 
  ); 
} 
