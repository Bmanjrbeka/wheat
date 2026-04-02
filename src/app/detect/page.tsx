"use client";

import { useState, useRef } from "react";
import { ImageUploader }  from "@/components/ImageUploader";
import { DiagnosisCard }  from "@/components/DiagnosisCard";
import { LocationPanel }  from "@/components/LocationPanel";
import { predictDisease } from "@/lib/api";
import { createClient }   from "@/lib/supabase";
import { useAuth }        from "@/hooks/useAuth";
import type { Prediction } from "@/types";

type Stage = "upload" | "analyzing" | "result" | "error";

export default function DetectPage() {
  const { user } = useAuth();

  const [stage,      setStage]      = useState<Stage>("upload");
  const [imageFile,  setImageFile]  = useState<File | null>(null);
  const [imageUrl,   setImageUrl]   = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null);
  const [recordId,   setRecordId]   = useState<string | null>(null);

  // GPS coords come back from LocationPanel after user taps "Tag my location"
  const locationSaved = useRef(false);

  function handleImageReady(file: File, previewUrl: string) {
    setImageFile(file);
    setImageUrl(previewUrl);
  }

  async function handleAnalyze() {
    if (!imageFile || !imageUrl) return;
    setStage("analyzing");
    setErrorMsg(null);
    locationSaved.current = false;

    try {
      const result = await predictDisease(imageFile);
      setPrediction(result);

      if (user) {
        const id = await saveToHistory(imageFile, result, user.id, null, null);
        setRecordId(id);
      }

      setStage("result");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Prediction failed");
      setStage("error");
    }
  }

  // Called by LocationPanel once GPS coords are available
  async function handleLocation(lat: number, lng: number) {
    if (locationSaved.current || !recordId) return;
    locationSaved.current = true;

    const supabase = createClient();
    await supabase
      .from("detection_history")
      .update({ latitude: lat, longitude: lng })
      .eq("id", recordId);
  }

  function handleReset() {
    setStage("upload");
    setImageFile(null);
    setImageUrl(null);
    setPrediction(null);
    setErrorMsg(null);
    setRecordId(null);
    locationSaved.current = false;
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white">Leaf Analysis</h1>
          <p className="text-gray-400 text-sm mt-1">
            Upload a clear photo of the affected wheat leaf
          </p>
        </div>

        {/* ── Upload / error ─────────────────────────────────── */}
        {(stage === "upload" || stage === "error") && (
          <div className="flex flex-col gap-4">
            <ImageUploader onImageReady={handleImageReady} disabled={false} />

            {imageUrl && imageFile && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Preview" className="w-full h-52 object-cover" />
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white truncate max-w-[180px]">{imageFile.name}</p>
                    <p className="text-xs text-gray-500">{(imageFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    onClick={handleAnalyze}
                    className="tap-target px-6 py-3 rounded-xl bg-brand-600
                               hover:bg-brand-500 active:scale-95 text-white
                               font-medium text-sm transition-all"
                  >
                    Analyze →
                  </button>
                </div>
              </div>
            )}

            {stage === "error" && errorMsg && (
              <div className="px-4 py-3 rounded-xl bg-red-900/40 border border-red-700/40
                              text-red-300 text-sm text-center">
                {errorMsg}
              </div>
            )}

            {!user && (
              <p className="text-xs text-gray-600 text-center">
                <a href="/login" className="text-gray-500 hover:text-gray-300 underline">Sign in</a>
                {" "}to save detection history
              </p>
            )}
          </div>
        )}

        {/* ── Analyzing ─────────────────────────────────────── */}
        {stage === "analyzing" && (
          <div className="flex flex-col items-center justify-center gap-6 py-16">
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Analyzing"
                className="w-40 h-40 object-cover rounded-2xl opacity-60 animate-pulse" />
            )}
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent
                              rounded-full animate-spin" />
              <p className="text-gray-300 text-sm font-medium">Analyzing leaf...</p>
              <p className="text-gray-600 text-xs">Running EfficientNetB3 model</p>
            </div>
          </div>
        )}

        {/* ── Result ────────────────────────────────────────── */}
        {stage === "result" && prediction && imageUrl && (
          <div className="flex flex-col gap-4">
            <DiagnosisCard
              prediction={prediction}
              imageUrl={imageUrl}
              onReset={handleReset}
            />

            {/* Map — always show, GPS is optional */}
            <LocationPanel
              disease={prediction.disease}
              confidence={prediction.confidence}
              onLocation={user ? handleLocation : undefined}
            />

            {!user && (
              <p className="text-xs text-gray-600 text-center pb-4">
                <a href="/login" className="text-gray-500 hover:text-gray-300 underline">Sign in</a>
                {" "}to save your location and track disease spread
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Save to Supabase ─────────────────────────────────────────
async function saveToHistory(
  file:       File,
  prediction: Prediction,
  userId:     string,
  lat:        number | null,
  lng:        number | null
): Promise<string | null> {
  const supabase = createClient();

  const filename = `${userId}/${Date.now()}.jpg`;
  const { data: uploadData, error: uploadError } =
    await supabase.storage.from("leaf-images").upload(filename, file);

  if (uploadError) { console.error("Upload error:", uploadError.message); return null; }

  const { data: { publicUrl } } = supabase.storage
    .from("leaf-images").getPublicUrl(uploadData.path);

  const { data, error } = await supabase
    .from("detection_history")
    .insert({
      user_id:    userId,
      image_url:  publicUrl,
      disease:    prediction.disease,
      confidence: prediction.confidence,
      treatment:  prediction.treatment,
      latitude:   lat,
      longitude:  lng,
    })
    .select("id")
    .single();

  if (error) { console.error("DB error:", error.message); return null; }
  return data?.id ?? null;
}
