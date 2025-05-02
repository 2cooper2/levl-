"use client"

import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a singleton instance for the client
let clientInstance: ReturnType<typeof createClient> | null = null

export const createClientSupabase = () => {
  if (clientInstance) return clientInstance

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials for client")
    throw new Error("Missing Supabase credentials")
  }

  clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: "levl-supabase-auth",
      autoRefreshToken: true,
    },
  })

  return clientInstance
}

// Export a singleton instance
export const supabase = createClientSupabase()
