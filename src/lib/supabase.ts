import { createBrowserClient } from '@supabase/ssr'

// Hardcoded keys to fix the browser-side crash
const supabaseUrl = 'https://rc47un0dbuyps6axbzuj.supabase.co'
const supabaseAnon = 'sb_publishable_rc47UN0dBuYPS6aXBzUJmg_0_wvMMFC'

/**
 * Creates a Supabase client for use in Client Components.
 */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnon)
}