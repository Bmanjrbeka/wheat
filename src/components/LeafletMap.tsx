"use client";

import { useEffect, useRef } from "react";
import type { DetectionRecord } from "@/types";

interface Props {
  center:     { lat: number; lng: number };
  zoom?:      number;
  /** Current detection pin (new result) */
  current?:   { lat: number; lng: number; disease: string; confidence: number };
  /** Past detections from history to show as cluster */
  history?:   DetectionRecord[];
}

// Disease → marker color
const DISEASE_COLOR: Record<string, string> = {
  "Healthy":     "#22c55e",
  "Leaf Rust":   "#f59e0b",
  "Stripe Rust": "#eab308",
  "Stem Rust":   "#ef4444",
  "Septoria":    "#f97316",
  "Fusarium":    "#a855f7",
};

export function LeafletMap({ center, zoom = 13, current, history = [] }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<ReturnType<typeof import("leaflet")["map"]> | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamic import — Leaflet touches `window`, must be client-only
    import("leaflet").then((L) => {
      // Fix default icon path broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center:          [center.lat, center.lng],
        zoom,
        zoomControl:     true,
        attributionControl: false,
      });

      // Dark tile layer (fits the app's dark theme)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 }
      ).addTo(map);

      // Attribution (minimal)
      L.control.attribution({ prefix: "© CartoDB" }).addTo(map);

      // ── Current detection pin ──────────────────────────────
      if (current) {
        const color = DISEASE_COLOR[current.disease] ?? "#6b7280";
        const pct   = Math.round(current.confidence * 100);

        const pulseIcon = L.divIcon({
          className: "",
          html: `
            <div style="position:relative;width:40px;height:40px;">
              <div style="
                position:absolute;inset:0;border-radius:50%;
                background:${color};opacity:0.25;
                animation:pulse 2s infinite;
              "></div>
              <div style="
                position:absolute;top:50%;left:50%;
                transform:translate(-50%,-50%);
                width:18px;height:18px;border-radius:50%;
                background:${color};border:2px solid white;
              "></div>
            </div>
            <style>
              @keyframes pulse {
                0%,100%{transform:scale(1);opacity:.25}
                50%{transform:scale(1.6);opacity:.1}
              }
            </style>
          `,
          iconSize:   [40, 40],
          iconAnchor: [20, 20],
        });

        L.marker([current.lat, current.lng], { icon: pulseIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;font-size:13px;line-height:1.5;min-width:130px">
              <strong style="color:${color}">${current.disease}</strong><br/>
              Confidence: ${pct}%<br/>
              <span style="font-size:11px;color:#9ca3af">Current detection</span>
            </div>
          `, { maxWidth: 200 })
          .openPopup();
      }

      // ── History pins ──────────────────────────────────────
      history.forEach((rec) => {
        if (!rec.latitude || !rec.longitude) return;
        const color = DISEASE_COLOR[rec.disease] ?? "#6b7280";
        const pct   = Math.round(rec.confidence * 100);
        const date  = new Date(rec.created_at).toLocaleDateString();

        const smallIcon = L.divIcon({
          className: "",
          html: `<div style="
            width:12px;height:12px;border-radius:50%;
            background:${color};border:1.5px solid rgba(255,255,255,.5);
            opacity:0.7;
          "></div>`,
          iconSize:   [12, 12],
          iconAnchor: [6, 6],
        });

        L.marker([rec.latitude, rec.longitude], { icon: smallIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:sans-serif;font-size:12px;line-height:1.5">
              <strong style="color:${color}">${rec.disease}</strong><br/>
              ${pct}% confidence<br/>
              <span style="font-size:11px;color:#9ca3af">${date}</span>
            </div>
          `, { maxWidth: 180 });
      });

      mapRef.current = map;
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: "280px" }}
    />
  );
}
