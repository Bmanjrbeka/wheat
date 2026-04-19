"use client";

import { useState } from "react";
import { HistoryTable } from "@/components/history/HistoryTable";
import { ResultDrawer, HistoryRecord } from "@/components/history/ResultDrawer";
import type { DetectionRecord } from "@/types";

// Convert DetectionRecord to HistoryRecord format
const convertToHistoryRecord = (record: DetectionRecord): HistoryRecord => ({
  id: record.id,
  fileName: `wheat_sample_${record.id.slice(0, 8)}.jpg`,
  imageUrl: record.image_url,
  disease: record.disease,
  confidence: record.confidence,
  date: record.created_at,
  location: record.latitude && record.longitude 
    ? `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}`
    : undefined,
  treatment: record.treatment,
  allProbabilities: {
    "Healthy": 0.1,
    "Leaf Rust": record.disease === "Leaf Rust" ? record.confidence : 0.05,
    "Stripe Rust": record.disease === "Stripe Rust" ? record.confidence : 0.05,
    "Stem Rust": record.disease === "Stem Rust" ? record.confidence : 0.05,
    "Septoria": record.disease === "Septoria" ? record.confidence : 0.05,
    "Fusarium": record.disease === "Fusarium" ? record.confidence : 0.05
  },
  metadata: {
    temperature: 18 + Math.random() * 10,
    humidity: 60 + Math.random() * 25
  }
});

interface Props { 
  records: DetectionRecord[] 
}

export function HistoryClient({ records }: Props) {
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Convert records to the expected format
  const historyRecords: HistoryRecord[] = records.map(convertToHistoryRecord);

  const handleViewDetails = (record: HistoryRecord) => {
    setSelectedRecord(record);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    // Allow drawer animation to complete before clearing record
    setTimeout(() => setSelectedRecord(null), 300);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analysis History</h1>
        <p className="text-gray-600 mt-2">
          View and filter your wheat disease analysis records
        </p>
      </div>

      {/* History Table */}
      <HistoryTable
        records={historyRecords}
        onViewDetails={handleViewDetails}
      />

      {/* Result Drawer */}
      <ResultDrawer
        record={selectedRecord}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
