"use client";
import { useState, useEffect } from "react";
import { Page } from "@/components/Page";
import { createClient } from "@/lib/supabase";
import { DISEASE_META, TREATMENTS, fmtConf, fmtDate, DetectionRecord, DiseaseClass } from "@/lib/constants";
import Link from "next/link";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ReportData {
  records: DetectionRecord[];
  stats: {
    totalScans: number;
    avgConfidence: number;
    diseaseCounts: Record<string, number>;
    dateRange: { start: string; end: string };
  };
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      const sb = createClient();
      const { data } = await sb.from("detection_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (data && data.length > 0) {
        const records = data as DetectionRecord[];
        const stats = calculateStats(records);
        setReportData({ records, stats });
      } else {
        // Use mock data if no real data
        const mockRecords = generateMockData();
        const stats = calculateStats(mockRecords);
        setReportData({ records: mockRecords, stats });
      }
    } catch (error) {
      console.error("Failed to load report data:", error);
      // Fallback to mock data
      const mockRecords = generateMockData();
      const stats = calculateStats(mockRecords);
      setReportData({ records: mockRecords, stats });
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (): DetectionRecord[] => {
    const diseases: DiseaseClass[] = ["Healthy", "Leaf Rust", "Stripe Rust", "Stem Rust", "Septoria", "Fusarium"];
    return Array.from({ length: 20 }, (_, i) => ({
      id: `mock-${i}`,
      user_id: "demo-user",
      image_url: "",
      disease: diseases[Math.floor(Math.random() * diseases.length)],
      confidence: 0.6 + Math.random() * 0.4,
      treatment: "",
      prevention: "",
      top3: [],
      latitude: 8.0 + Math.random() * 2,
      longitude: 38.0 + Math.random() * 4,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  const calculateStats = (records: DetectionRecord[]) => {
    const diseaseCounts: Record<string, number> = {};
    let totalConf = 0;

    records.forEach(record => {
      diseaseCounts[record.disease] = (diseaseCounts[record.disease] || 0) + 1;
      totalConf += record.confidence;
    });

    const avgConfidence = records.length > 0 ? totalConf / records.length : 0;
    const dates = records.map(r => new Date(r.created_at));
    const dateRange = {
      start: dates.length > 0 ? fmtDate(Math.min(...dates.map(d => d.getTime())).toString()) : "",
      end: dates.length > 0 ? fmtDate(Math.max(...dates.map(d => d.getTime())).toString()) : ""
    };

    return {
      totalScans: records.length,
      avgConfidence,
      diseaseCounts,
      dateRange
    };
  };

  const generatePDF = async () => {
    if (!reportData) return;

    setGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Title Page
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.text("Wheat Disease Detection Report", pageWidth / 2, 30, { align: "center" });

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 45, { align: "center" });
      pdf.text(`Date Range: ${reportData.stats.dateRange.start} - ${reportData.stats.dateRange.end}`, pageWidth / 2, 55, { align: "center" });

      // Statistics Section
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Summary Statistics", 20, 75);

      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Total Scans: ${reportData.stats.totalScans}`, 20, 85);
      pdf.text(`Average Confidence: ${fmtConf(reportData.stats.avgConfidence)}`, 20, 95);

      // Disease Distribution
      let yPosition = 110;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Disease Distribution", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      Object.entries(reportData.stats.diseaseCounts).forEach(([disease, count]) => {
        const meta = DISEASE_META[disease as DiseaseClass];
        const percentage = ((count / reportData.stats.totalScans) * 100).toFixed(1);
        pdf.text(`${disease}: ${count} (${percentage}%)`, 25, yPosition);
        yPosition += 7;
      });

      // Detailed Records (simplified for PDF)
      yPosition += 15;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Recent Detections (Last 10)", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      
      const recentRecords = reportData.records.slice(0, 10);
      recentRecords.forEach((record, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }

        const meta = DISEASE_META[record.disease];
        pdf.text(`${index + 1}. ${record.disease}`, 20, yPosition);
        pdf.text(`Confidence: ${fmtConf(record.confidence)}`, 80, yPosition);
        pdf.text(`Date: ${fmtDate(record.created_at)}`, 140, yPosition);
        yPosition += 6;
      });

      // Save PDF
      pdf.save(`wheat-detection-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const headers = ["Date", "Disease", "Confidence", "Latitude", "Longitude"];
    const csvContent = [
      headers.join(","),
      ...reportData.records.map(record => [
        fmtDate(record.created_at),
        record.disease,
        fmtConf(record.confidence),
        record.latitude || "",
        record.longitude || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wheat-detection-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Page title="Reports" subtitle="Loading report data...">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 16 }}>📊</div>
            <div style={{ fontSize: 16, color: "#666" }}>Loading report data...</div>
          </div>
        </div>
      </Page>
    );
  }

  if (!reportData) {
    return (
      <Page title="Reports" subtitle="No data available">
        <div style={{ maxWidth:560, margin:"0 auto" }} className="card">
          <div style={{ padding:"40px 32px", textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:16 }}>📭</div>
            <h2 style={{ fontSize:18, fontWeight:700, color:"#111", marginBottom:8 }}>No detection data</h2>
            <p style={{ fontSize:13, color:"#777", lineHeight:1.7, marginBottom:24 }}>
              No detection records found. Start analyzing wheat leaves to generate reports.
            </p>
            <Link href="/analysis" className="btn-primary">Start Analysis →</Link>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Reports" subtitle="Export and share your detection data">
      <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>
        
        {/* Export Actions */}
        <div className="card" style={{ padding:"20px" }}>
          <div style={{ fontSize:16, fontWeight:600, color:"#111", marginBottom:16 }}>Export Options</div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <button 
              onClick={generatePDF}
              disabled={generatingPDF}
              className="btn-primary"
              style={{ fontSize:14, padding:"10px 20px", minWidth:150 }}
            >
              {generatingPDF ? "Generating PDF..." : "📄 Download PDF Report"}
            </button>
            <button 
              onClick={exportToCSV}
              className="btn-ghost"
              style={{ fontSize:14, padding:"10px 20px", minWidth:150 }}
            >
              📊 Export CSV Data
            </button>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="card" style={{ padding:"20px" }}>
          <div style={{ fontSize:16, fontWeight:600, color:"#111", marginBottom:16 }}>Summary Statistics</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:16 }}>
            <div style={{ textAlign:"center", padding:"16px", background:"#f8f9fa", borderRadius:8 }}>
              <div style={{ fontSize:24, fontWeight:700, color:"#2d6a10", marginBottom:8 }}>
                {reportData.stats.totalScans}
              </div>
              <div style={{ fontSize:12, color:"#666" }}>Total Scans</div>
            </div>
            <div style={{ textAlign:"center", padding:"16px", background:"#f8f9fa", borderRadius:8 }}>
              <div style={{ fontSize:24, fontWeight:700, color:"#2d6a10", marginBottom:8 }}>
                {fmtConf(reportData.stats.avgConfidence)}
              </div>
              <div style={{ fontSize:12, color:"#666" }}>Avg Confidence</div>
            </div>
            <div style={{ textAlign:"center", padding:"16px", background:"#f8f9fa", borderRadius:8 }}>
              <div style={{ fontSize:24, fontWeight:700, color:"#2d6a10", marginBottom:8 }}>
                {reportData.stats.dateRange.start ? reportData.stats.dateRange.start.split(',')[0] : "N/A"}
              </div>
              <div style={{ fontSize:12, color:"#666" }}>Start Date</div>
            </div>
            <div style={{ textAlign:"center", padding:"16px", background:"#f8f9fa", borderRadius:8 }}>
              <div style={{ fontSize:24, fontWeight:700, color:"#2d6a10", marginBottom:8 }}>
                {reportData.stats.dateRange.end ? reportData.stats.dateRange.end.split(',')[0] : "N/A"}
              </div>
              <div style={{ fontSize:12, color:"#666" }}>End Date</div>
            </div>
          </div>
        </div>

        {/* Disease Distribution */}
        <div className="card" style={{ padding:"20px" }}>
          <div style={{ fontSize:16, fontWeight:600, color:"#111", marginBottom:16 }}>Disease Distribution</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {Object.entries(reportData.stats.diseaseCounts).map(([disease, count]) => {
              const meta = DISEASE_META[disease as DiseaseClass];
              const percentage = ((count / reportData.stats.totalScans) * 100).toFixed(1);
              return (
                <div key={disease} style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ 
                    width:24, height:24, borderRadius:6, background:meta.bg, 
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:meta.color 
                  }}>
                    {meta.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:"#111" }}>{disease}</div>
                    <div style={{ fontSize:12, color:"#666" }}>{count} detections ({percentage}%)</div>
                  </div>
                  <div style={{ 
                    width:120, height:8, background:"#e9ecef", borderRadius:4, overflow:"hidden" 
                  }}>
                    <div style={{ 
                      width:`${percentage}%`, height:"100%", background:meta.color, borderRadius:4 
                    }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Records Preview */}
        <div className="card" style={{ padding:"20px" }}>
          <div style={{ fontSize:16, fontWeight:600, color:"#111", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            Recent Detections
            <Link href="/history" className="btn-ghost" style={{ fontSize:12, padding:"6px 12px" }}>
              View All →
            </Link>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Disease</th>
                  <th>Confidence</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {reportData.records.slice(0, 10).map(record => {
                  const meta = DISEASE_META[record.disease];
                  return (
                    <tr key={record.id}>
                      <td>{fmtDate(record.created_at)}</td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ 
                            width:20, height:20, borderRadius:4, background:meta.bg,
                            display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:meta.color 
                          }}>
                            {meta.icon}
                          </div>
                          {record.disease}
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          fontWeight:600, color:record.confidence < 0.7 ? "var(--amber-warn)" : meta.color 
                        }}>
                          {fmtConf(record.confidence)}
                        </span>
                      </td>
                      <td>
                        {record.latitude && record.longitude ? (
                          <span style={{ fontSize:11, color:"var(--green-mid)", fontWeight:600 }}>
                            {record.latitude.toFixed(3)}, {record.longitude.toFixed(3)}
                          </span>
                        ) : (
                          <span style={{ fontSize:11, color:"#ddd" }}>No GPS</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Page>
  );
}
