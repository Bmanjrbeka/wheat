"use client";

import dynamic from "next/dynamic";
import { useGPS } from "@/hooks/useGPS";
import type { DetectionRecord } from "@/types";

// Leaflet must be dynamically imported — it requires window
const LeafletMap = dynamic(
  () => import("./LeafletMap").then((m) => m.LeafletMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

interface Props {
  disease:    string;
  confidence: number;
  history?:   DetectionRecord[];
  /** Called with coords so parent can save them to Supabase */
  onLocation?: (lat: number, lng: number) => void;
}

export function LocationPanel({ disease, confidence, history = [], onLocation }: Props) {
  const { gps, requestLocation, clearLocation } = useGPS();

  function handleRequest() {
    requestLocation();
  }

  // Once granted, bubble coords up to parent
  if (gps.status === "granted" && onLocation) {
    onLocation(gps.lat, gps.lng);
  }

  // Default center: Addis Ababa (Ethiopia)
  const center =
    gps.status === "granted"
      ? { lat: gps.lat, lng: gps.lng }
      : { lat: 9.145, lng: 40.489 };

  const zoom = gps.status === "granted" ? 13 : 5;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-800">
        <div>
          <h3 className="text-sm font-medium text-white">Detection location</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Tag this result on the disease spread map
          </p>
        </div>

        {/* Status badge */}
        {gps.status === "granted" && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
                          bg-green-900/40 border border-green-700/40">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs text-green-400">
              ±{gps.accuracy}m
            </span>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-64 w-full bg-gray-950">
        <LeafletMap
          center={center}
          zoom={zoom}
          current={
            gps.status === "granted"
              ? { lat: gps.lat, lng: gps.lng, disease, confidence }
              : undefined
          }
          history={history}
        />
      </div>

      {/* Action row */}
      <div className="px-5 py-4">
        {gps.status === "idle" && (
          <button
            onClick={handleRequest}
            className="tap-target w-full flex items-center justify-center gap-2
                       py-3 rounded-xl bg-brand-600 hover:bg-brand-500
                       active:scale-95 text-white text-sm font-medium transition-all"
          >
            📍 Tag my location
          </button>
        )}

        {gps.status === "requesting" && (
          <div className="flex items-center justify-center gap-2 py-3 text-gray-400 text-sm">
            <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent
                            rounded-full animate-spin" />
            Requesting location...
          </div>
        )}

        {gps.status === "granted" && (
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
            </div>
            <button
              onClick={clearLocation}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors underline"
            >
              Remove
            </button>
          </div>
        )}

        {gps.status === "denied" && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-red-400 text-center">{gps.reason}</p>
            <button
              onClick={handleRequest}
              className="text-xs text-gray-500 hover:text-gray-300 underline text-center"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="w-full h-64 bg-gray-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-gray-700 border-t-gray-500
                      rounded-full animate-spin" />
    </div>
  );
}
