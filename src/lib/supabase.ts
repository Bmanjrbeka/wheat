import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser-side Supabase client.
 * Use this in Client Components and API route helpers.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnon);
}
