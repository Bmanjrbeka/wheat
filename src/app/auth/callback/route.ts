import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

/**
 * Supabase redirects here after Google / GitHub OAuth.
 * This route exchanges the one-time code for a session cookie.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code        = searchParams.get("code");
  const redirectTo  = searchParams.get("redirectTo") ?? "/";
  const next        = redirectTo.startsWith("/") ? redirectTo : "/";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("Auth callback error:", error.message);
  }

  // Something went wrong — send back to login with an error flag
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
