"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, loading, signOut } = useAuth();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-gray-800/60
                    bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="text-xl">🌾</span>
          <span className="hidden sm:inline text-sm">Wheat Disease Detector</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link
            href="/detect"
            className="px-3 py-1.5 rounded-lg text-sm text-gray-400
                       hover:text-white hover:bg-gray-800 transition-colors"
          >
            Detect
          </Link>
          <Link
            href="/history"
            className="px-3 py-1.5 rounded-lg text-sm text-gray-400
                       hover:text-white hover:bg-gray-800 transition-colors"
          >
            History
          </Link>

          {/* Auth area */}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse ml-2" />
          ) : user ? (
            <div className="flex items-center gap-2 ml-2">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center
                              justify-center text-xs font-semibold text-brand-100">
                {(user.user_metadata?.full_name ?? user.email ?? "?")[0].toUpperCase()}
              </div>
              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-400
                           hover:text-white hover:bg-gray-800 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-2 px-4 py-1.5 rounded-lg text-sm font-medium
                         bg-brand-600 hover:bg-brand-500 text-white transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
