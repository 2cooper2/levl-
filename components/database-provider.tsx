"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { ENV } from "@/lib/enhanced-env"
import type { Database } from "@/types/database.types"

type SupabaseContextType = {
  supabase: ReturnType<typeof createClient<Database>> | null
  isLoading: boolean
  error: Error | null
}

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  isLoading: true,
  error: null,
})

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SupabaseContextType>({
    supabase: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    async function initializeSupabase() {
      try {
        const supabaseUrl = ENV.SUPABASE_URL()
        const supabaseAnonKey = ENV.SUPABASE_ANON_KEY()

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error("Missing Supabase credentials")
        }

        const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: true,
            storageKey: "levl-supabase-auth",
          },
        })

        // Test the connection
        await client.auth.getSession()

        setState({ supabase: client, isLoading: false, error: null })
      } catch (error) {
        console.error("Failed to initialize Supabase:", error)
        setState({
          supabase: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error("Unknown error initializing Supabase"),
        })
      }
    }

    initializeSupabase()
  }, [])

  return (
    <SupabaseContext.Provider value={state}>
      {state.isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="loader">Loading...</div>
        </div>
      ) : state.error ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-4">We're having trouble connecting to our database. This might be due to:</p>
            <ul className="list-disc list-inside mb-4 text-gray-600">
              <li>Temporary service disruption</li>
              <li>Network connectivity issues</li>
              <li>Missing configuration values</li>
            </ul>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        children
      )}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => useContext(SupabaseContext)
