"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Provider = "google" | "github";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirectTo") ?? "/";
  const authError    = searchParams.get("error");
  const [loading, setLoading] = useState<Provider | null>(null);

  async function signInWith(provider: Provider) {
    setLoading(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
      },
    });
    if (error) { console.error("OAuth error:", error.message); setLoading(null); }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <span className="text-4xl mb-4">🌾</span>
          <h1 className="text-xl font-semibold text-white">Sign in</h1>
          <p className="text-sm text-gray-400 mt-1 text-center">
            Save your detection history and access it anywhere
          </p>
        </div>
        {authError && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-900/40 border border-red-700/40 text-red-300 text-sm text-center">
            Sign-in failed. Please try again.
          </div>
        )}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => signInWith("google")}
            disabled={!!loading}
            className="tap-target flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl border border-gray-700 bg-white text-gray-900 font-medium text-sm hover:bg-gray-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
          >
            {loading === "google" ? <Spinner /> : <GoogleIcon />}
            Continue with Google
          </button>
          <button
            onClick={() => signInWith("github")}
            disabled={!!loading}
            className="tap-target flex items-center justify-center gap-3 w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white font-medium text-sm hover:bg-gray-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
          >
            {loading === "github" ? <Spinner light /> : <GitHubIcon />}
            Continue with GitHub
          </button>
        </div>
        <p className="mt-6 text-center text-xs text-gray-600">No password needed. Your data stays private.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.216.69.825.572C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function Spinner({ light = false }: { light?: boolean }) {
  return (
    <svg className={`animate-spin w-4 h-4 ${light ? "text-white" : "text-gray-600"}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}
