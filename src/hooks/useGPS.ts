"use client";

import { useState, useCallback } from "react";

export type GPSState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "granted"; lat: number; lng: number; accuracy: number }
  | { status: "denied"; reason: string };

export function useGPS() {
  const [gps, setGPS] = useState<GPSState>({ status: "idle" });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGPS({ status: "denied", reason: "Geolocation not supported on this device" });
      return;
    }

    setGPS({ status: "requesting" });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGPS({
          status:   "granted",
          lat:      pos.coords.latitude,
          lng:      pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        });
      },
      (err) => {
        const reason =
          err.code === 1 ? "Location permission denied" :
          err.code === 2 ? "Location unavailable" :
          "Location request timed out";
        setGPS({ status: "denied", reason });
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    );
  }, []);

  const clearLocation = useCallback(() => setGPS({ status: "idle" }), []);

  return { gps, requestLocation, clearLocation };
}
