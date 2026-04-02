"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { DetectionRecord } from "@/types";
import { formatConfidence } from "@/lib/utils";

const LeafletMap = dynamic(
  () => import("@/components/LeafletMap").then((m) => m.LeafletMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-gray-950 animate-pulse rounded-xl" /> }
);

const DISEASE_ICONS: Record<string, string> = {
  "Healthy":     "✅",
  "Leaf Rust":   "🍂",
  "Stripe Rust": "🌿",
  "Stem Rust":   "🪵",
  "Septoria":    "💧",
  "Fusarium":    "⚠️",
};

const DISEASE_COLOR: Record<string, string> = {
  "Healthy":     "text-green-400  bg-green-900/30  border-green-800",
  "Leaf Rust":   "text-amber-400  bg-amber-900/30  border-amber-800",
  "Stripe Rust": "text-yellow-400 bg-yellow-900/30 border-yellow-800",
  "Stem Rust":   "text-red-400    bg-red-900/30    border-red-800",
  "Septoria":    "text-orange-400 bg-orange-900/30 border-orange-800",
  "Fusarium":    "text-purple-400 bg-purple-900/30 border-purple-800",
};

interface Props { records: DetectionRecord[] }

export function HistoryClient({ records }: Props) {
  const withLocation = records.filter((r) => r.latitude && r.longitude);

  // Summary counts
  const diseaseCounts = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.disease] = (acc[r.disease] ?? 0) + 1;
    return acc;
  }, {});

  const topDisease = Object.entries(diseaseCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Detection history</h1>
            <p className="text-gray-500 text-sm mt-0.5">{records.length} total scans</p>
          </div>
          <Link
            href="/detect"
            className="tap-target px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500
                       text-white text-sm font-medium transition-colors"
          >
            + New scan
          </Link>
        </div>

        {/* Empty state */}
        {records.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-5xl">🌾</span>
            <p className="text-gray-400 text-base">No detections yet</p>
            <p className="text-gray-600 text-sm">Upload your first leaf photo to get started</p>
            <Link
              href="/detect"
              className="mt-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500
                         text-white text-sm font-medium transition-colors"
            >
              Analyze a leaf
            </Link>
          </div>
        )}

        {records.length > 0 && (
          <>
            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-semibold text-white">{records.length}</div>
                <div className="text-xs text-gray-500 mt-1">Total scans</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-semibold text-white">{withLocation.length}</div>
                <div className="text-xs text-gray-500 mt-1">With GPS</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <div className="text-2xl font-semibold text-white">
                  {topDisease ? DISEASE_ICONS[topDisease[0]] : "—"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {topDisease ? topDisease[0].split(" ")[0] : "No data"}
                </div>
              </div>
            </div>

            {/* Map overview — only if any records have GPS */}
            {withLocation.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-6">
                <div className="px-4 py-3 border-b border-gray-800">
                  <h2 className="text-sm font-medium text-white">Disease spread map</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {withLocation.length} location{withLocation.length !== 1 ? "s" : ""} tagged
                  </p>
                </div>
                <div className="h-56">
                  <LeafletMap
                    center={{ lat: withLocation[0].latitude!, lng: withLocation[0].longitude! }}
                    zoom={6}
                    history={records}
                  />
                </div>
              </div>
            )}

            {/* Detection list */}
            <div className="flex flex-col gap-3">
              {records.map((rec) => {
                const colorClass = DISEASE_COLOR[rec.disease] ?? "text-gray-400 bg-gray-900 border-gray-800";
                const pct        = Math.round(rec.confidence * 100);
                const date       = new Date(rec.created_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                });

                return (
                  <div
                    key={rec.id}
                    className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden
                               flex gap-0"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 flex-shrink-0 bg-gray-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rec.image_url}
                        alt={rec.disease}
                        className="w-24 h-full object-cover"
                        style={{ minHeight: "80px" }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col justify-between gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`
                              inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                              text-xs font-medium border ${colorClass}
                            `}>
                              {DISEASE_ICONS[rec.disease]} {rec.disease}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{date}</p>
                        </div>
                        {/* Confidence */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-semibold text-white">{pct}%</div>
                          <div className="text-xs text-gray-600">confidence</div>
                        </div>
                      </div>

                      {/* Treatment snippet */}
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {rec.treatment}
                      </p>

                      {/* GPS badge */}
                      {rec.latitude && rec.longitude && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <span>📍</span>
                          {rec.latitude.toFixed(4)}, {rec.longitude.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
