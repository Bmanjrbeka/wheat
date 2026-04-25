'use client'

import { useEffect, useState } from 'react'

export default function TestSupabasePage() {
  const [result, setResult] = useState('Loading...')
  const [error, setError] = useState('')

  useEffect(() => {
    async function testSupabase() {
      try {
        // Test direct fetch to Supabase
        const response = await fetch('https://rc47un0dbuyps6axbzuj.supabase.co/auth/v1/settings')
        const data = await response.json()
        
        setResult(`✅ Direct fetch successful: ${JSON.stringify(data, null, 2)}`)
      } catch (err) {
        setError(`❌ Direct fetch failed: ${err.message}`)
      }
    }

    testSupabase()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Environment Variables:</h2>
          <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 50)}...</p>
        </div>
        
        <div>
          <h2 className="font-semibold">Direct Connection Test:</h2>
          {error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <pre className="text-sm bg-gray-100 p-2 rounded">{result}</pre>
          )}
        </div>
      </div>
    </div>
  )
}
