import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      {/* Logo / icon */}
      <div className="mb-6 w-20 h-20 rounded-2xl bg-brand-600 flex items-center justify-center text-4xl">
        🌾
      </div>

      <h1 className="text-3xl font-semibold text-white mb-3">
        Wheat Disease Detector
      </h1>
      <p className="text-gray-400 max-w-sm mb-10 text-base leading-relaxed">
        Take a photo of a wheat leaf and get an instant AI diagnosis — built
        for Ethiopian field conditions.
      </p>

      {/* Primary CTA */}
      <Link
        href="/detect"
        className="tap-target inline-flex items-center justify-center px-8 py-4 rounded-2xl
                   bg-brand-600 hover:bg-brand-500 active:scale-95
                   text-white font-medium text-lg transition-all duration-150"
      >
        Analyze a Leaf
      </Link>

      {/* Secondary */}
      <Link
        href="/history"
        className="mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        View past detections →
      </Link>

      {/* Status pill — remove after Phase 1 is live */}
      <div className="mt-16 inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                      bg-amber-900/40 border border-amber-700/40 text-amber-400 text-xs">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Using mock API — HuggingFace endpoint coming in Phase 1
      </div>
    </div>
  );
}
