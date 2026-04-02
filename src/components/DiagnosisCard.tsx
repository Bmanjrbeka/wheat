"use client";

import type { Prediction } from "@/types";
import { formatConfidence, DISEASE_COLORS } from "@/lib/utils";

interface Props {
  prediction: Prediction;
  imageUrl:   string;
  onReset:    () => void;
}

// Treatment icons per disease
const DISEASE_ICONS: Record<string, string> = {
  "Healthy":     "✅",
  "Leaf Rust":   "🍂",
  "Stripe Rust": "🌿",
  "Stem Rust":   "🪵",
  "Septoria":    "💧",
  "Fusarium":    "⚠️",
};

const SEVERITY_LABEL: Record<string, { label: string; classes: string }> = {
  "Healthy":     { label: "No disease",    classes: "bg-green-900/40  border-green-700/40  text-green-400"  },
  "Leaf Rust":   { label: "High risk",     classes: "bg-amber-900/40  border-amber-700/40  text-amber-400"  },
  "Stripe Rust": { label: "Medium risk",   classes: "bg-yellow-900/40 border-yellow-700/40 text-yellow-400" },
  "Stem Rust":   { label: "Critical",      classes: "bg-red-900/40    border-red-700/40    text-red-400"    },
  "Septoria":    { label: "Medium risk",   classes: "bg-orange-900/40 border-orange-700/40 text-orange-400" },
  "Fusarium":    { label: "High risk",     classes: "bg-red-900/40    border-red-700/40    text-red-400"    },
};

export function DiagnosisCard({ prediction, imageUrl, onReset }: Props) {
  const { disease, confidence, treatment, all_probabilities } = prediction;
  const pct      = Math.round(confidence * 100);
  const severity = SEVERITY_LABEL[disease] ?? SEVERITY_LABEL["Healthy"];
  const icon     = DISEASE_ICONS[disease] ?? "🌾";

  // Radial progress arc (SVG)
  const radius      = 44;
  const circumf     = 2 * Math.PI * radius;
  const dashOffset  = circumf * (1 - confidence);
  const arcColor    = confidence >= 0.85 ? "#ef4444" : confidence >= 0.60 ? "#f59e0b" : "#22c55e";

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4">

      {/* ── Header card ─────────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {/* Leaf image */}
        <div className="relative w-full h-48 bg-gray-800 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Uploaded leaf"
            className="w-full h-full object-cover"
          />
          {/* Severity badge */}
          <div className={`
            absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium
            border ${severity.classes}
          `}>
            {severity.label}
          </div>
        </div>

        {/* Disease name + confidence */}
        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">
              Diagnosis
            </div>
            <div className="text-2xl font-semibold text-white flex items-center gap-2">
              <span>{icon}</span>
              {disease}
            </div>
          </div>

          {/* Radial confidence ring */}
          <div className="relative flex-shrink-0">
            <svg width="110" height="110" viewBox="0 0 110 110">
              {/* Track */}
              <circle
                cx="55" cy="55" r={radius}
                fill="none" stroke="#1f2937" strokeWidth="10"
              />
              {/* Progress arc */}
              <circle
                cx="55" cy="55" r={radius}
                fill="none"
                stroke={arcColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumf}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 55 55)"
                style={{ transition: "stroke-dashoffset 0.8s ease" }}
              />
              {/* Label */}
              <text x="55" y="50" textAnchor="middle"
                    fontSize="20" fontWeight="600" fill="white">
                {pct}%
              </text>
              <text x="55" y="66" textAnchor="middle"
                    fontSize="10" fill="#6b7280">
                confidence
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Treatment card ───────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
          Treatment advice
        </h3>
        <p className="text-gray-200 text-sm leading-relaxed">{treatment}</p>
      </div>

      {/* ── All class probabilities ──────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">
          All probabilities
        </h3>
        <div className="flex flex-col gap-3">
          {Object.entries(all_probabilities)
            .sort(([, a], [, b]) => b - a)
            .map(([cls, prob]) => {
              const barPct = Math.round(prob * 100);
              const isTop  = cls === disease;
              return (
                <div key={cls}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={isTop ? "text-white font-medium" : "text-gray-400"}>
                      {DISEASE_ICONS[cls]} {cls}
                    </span>
                    <span className={isTop ? "text-white font-medium" : "text-gray-500"}>
                      {barPct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width:      `${barPct}%`,
                        background: isTop ? arcColor : "#374151",
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ── Actions ─────────────────────────────────────────── */}
      <button
        onClick={onReset}
        className="tap-target w-full py-3 rounded-xl border border-gray-700
                   bg-gray-900 text-gray-300 text-sm font-medium
                   hover:bg-gray-800 active:scale-95 transition-all"
      >
        Analyze another leaf
      </button>
    </div>
  );
}
