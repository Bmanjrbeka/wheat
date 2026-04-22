"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { 
  Leaf, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

type Provider = "google" | "github";

function SignupContent() {
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirectTo") ?? "/dashboard";
  const authError    = searchParams.get("error");
  const [loading, setLoading] = useState<Provider | null>(null);

  async function signUpWith(provider: Provider) {
    setLoading(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
      },
    });
    if (error) { 
      console.error("OAuth error:", error.message); 
      setLoading(null); 
      // Redirect with error
      window.location.href = `/signup?error=auth_failed&redirectTo=${redirectTo}`;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <Leaf className="w-10 h-10 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Join Wheat-Guard
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Start your wheat disease research journey
          </p>
          <p className="text-sm text-gray-500">
            Create your account to access advanced analysis tools
          </p>
        </div>

        {/* Error Display */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Sign-up failed</h3>
              <p className="text-red-700 text-sm mt-1">
                Please try again or use a different authentication method.
              </p>
            </div>
          </motion.div>
        )}

        {/* Sign-up Options */}
        <div className="space-y-4">
          <motion.button
            onClick={() => signUpWith("google")}
            disabled={!!loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-gray-300 rounded-xl font-medium text-gray-900 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {loading === "google" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </motion.button>

          <motion.button
            onClick={() => signUpWith("github")}
            disabled={!!loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-900 border border-gray-800 rounded-xl font-medium text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading === "github" ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <GitHubIcon />
            )}
            Continue with GitHub
          </motion.button>
        </div>

        {/* Benefits */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 text-center">
            Why join Wheat-Guard?
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900 text-sm">Save Your History</p>
                <p className="text-green-700 text-xs mt-1">
                  Keep track of all your wheat disease analyses
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 text-sm">Advanced Analytics</p>
                <p className="text-blue-700 text-xs mt-1">
                  Get detailed reports and insights from your data
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-purple-900 text-sm">Research Tools</p>
                <p className="text-purple-700 text-xs mt-1">
                  Access professional-grade analysis features
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sign in link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link 
              href={`/login?redirectTo=${redirectTo}`}
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
            >
              Sign in
              <ArrowRight className="w-4 h-4" />
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our terms of service and privacy policy.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Your data stays private and secure with Supabase authentication.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
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
