"use client"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create a singleton instance for the client
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null
let serverInstance: ReturnType<typeof createSupabaseClient> | null = null

export const createServerClient = () => {
  if (typeof window !== "undefined") {
    console.warn("createServerClient should only be called on the server")
  }

  if (serverInstance) return serverInstance

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials for server client")
    return null
  }

  // Use service role key for server operations if available
  const key = supabaseServiceKey || supabaseAnonKey

  serverInstance = createSupabaseClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema: "public",
    },
  })

  return serverInstance
}

export const createClient = () => {
  if (clientInstance) return clientInstance

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials for client")
    return null
  }

  clientInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: "levl-supabase-auth",
    },
  })

  return clientInstance
}
