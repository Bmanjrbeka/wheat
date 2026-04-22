"use client";
import { Page } from "@/components/Page";
import Link from "next/link";

export default function ReportsPage() {
  return (
    <Page title="Reports" subtitle="Export and share your detection data">
      <div style={{ maxWidth:560, margin:"0 auto" }} className="card">
        <div style={{ padding:"40px 32px", textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:16 }}>📄</div>
          <h2 style={{ fontSize:18, fontWeight:700, color:"#111", marginBottom:8 }}>Reports coming soon</h2>
          <p style={{ fontSize:13, color:"#777", lineHeight:1.7, marginBottom:24 }}>
            Professional PDF reports with full detection history, disease trend analysis, and treatment summaries —
            exportable for field records, research papers, and institutional reporting.
          </p>
          <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
            <Link href="/history" className="btn-primary">View history →</Link>
            <Link href="/analysis" className="btn-ghost">New analysis</Link>
          </div>
        </div>
      </div>
    </Page>
  );
}
