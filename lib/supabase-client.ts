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
    throw new Error("Missing Supabase credentials: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }

  try {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: "levl-supabase-auth",
        autoRefreshToken: true,
      },
    })
    return clientInstance
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    throw new Error("Failed to initialize Supabase client")
  }
}

// Export a singleton instance
let supabase: ReturnType<typeof createClient> | null = null
try {
  supabase = createClientSupabase()
} catch (error) {
  console.error("Failed to initialize Supabase singleton:", error)
  // Don't throw here to prevent breaking the app on load
  // The error will be handled when methods are called
}

export { supabase }

export const createClientDatabaseClient = createClientSupabase
