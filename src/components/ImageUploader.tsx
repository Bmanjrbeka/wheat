"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  onImageReady: (file: File, previewUrl: string) => void;
  disabled?: boolean;
}

const ACCEPTED = { "image/*": [".jpg", ".jpeg", ".png", ".webp"] };
const MAX_SIZE  = 10 * 1024 * 1024; // 10 MB

export function ImageUploader({ onImageReady, disabled }: Props) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      setError(null);
      const file = accepted[0];
      if (!file) return;

      // Resize to 512×512 on canvas before sending to API
      resizeImage(file, 512).then((resized) => {
        const url = URL.createObjectURL(resized);
        onImageReady(resized, url);
      });
    },
    [onImageReady]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept:   ACCEPTED,
      maxFiles: 1,
      maxSize:  MAX_SIZE,
      disabled,
    });

  const dropError =
    fileRejections[0]?.errors[0]?.code === "file-too-large"
      ? "Image must be under 10 MB"
      : fileRejections[0]?.errors[0]?.message ?? null;

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          relative flex flex-col items-center justify-center gap-4
          w-full min-h-[220px] rounded-2xl border-2 border-dashed
          cursor-pointer transition-all duration-200 p-8 text-center
          ${isDragActive
            ? "border-brand-500 bg-brand-900/20"
            : "border-gray-700 hover:border-gray-500 bg-gray-900/50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />

        {/* Upload icon */}
        <div className={`
          w-14 h-14 rounded-full flex items-center justify-center text-2xl
          transition-colors
          ${isDragActive ? "bg-brand-800" : "bg-gray-800"}
        `}>
          {isDragActive ? "⬇️" : "📷"}
        </div>

        <div>
          <p className="text-white font-medium text-base">
            {isDragActive ? "Drop the image here" : "Upload a leaf photo"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Drag & drop, tap to browse, or use your camera
          </p>
          <p className="text-gray-600 text-xs mt-2">
            JPG, PNG, WEBP · max 10 MB
          </p>
        </div>
      </div>

      {/* Camera capture button (mobile) */}
      <label className="
        tap-target mt-3 flex items-center justify-center gap-2 w-full
        py-3 rounded-xl border border-gray-700 bg-gray-900
        text-gray-300 text-sm font-medium cursor-pointer
        hover:bg-gray-800 active:scale-95 transition-all
      ">
        <span>📸</span>
        Take a photo
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            resizeImage(file, 512).then((resized) => {
              onImageReady(resized, URL.createObjectURL(resized));
            });
            e.target.value = "";
          }}
        />
      </label>

      {/* Error */}
      {(error || dropError) && (
        <p className="mt-2 text-sm text-red-400 text-center">
          {error ?? dropError}
        </p>
      )}
    </div>
  );
}

// ── Resize helper ─────────────────────────────────────────────
function resizeImage(file: File, size: number): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas     = document.createElement("canvas");
      canvas.width     = size;
      canvas.height    = size;
      const ctx        = canvas.getContext("2d")!;
      // Center-crop to square
      const minSide    = Math.min(img.width, img.height);
      const sx         = (img.width  - minSide) / 2;
      const sy         = (img.height - minSide) / 2;
      ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => resolve(new File([blob!], file.name, { type: "image/jpeg" })),
        "image/jpeg",
        0.9
      );
    };
    img.src = url;
  });
}
