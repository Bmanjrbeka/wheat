import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in Client Components.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rc47un0dbuyps6axbzuj.supabase.co'
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjNDd1bjBkYnV5cHM2YXhieml1aiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzIyNzQ2MDAwLCJleHAiOjIwMzgzMjIwMDB9.test'
  
  // Debug logging
  console.log('Supabase URL:', supabaseUrl)
  console.log('Supabase Anon Key:', supabaseAnon.substring(0, 50) + '...')
  
  return createBrowserClient(supabaseUrl, supabaseAnon)
}