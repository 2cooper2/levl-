"use client"

import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export const createClientSupabase = () => {
  if (clientInstance) return clientInstance
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials for client")
    throw new Error("Missing Supabase credentials")
  }
  clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  return clientInstance
}

let supabase: ReturnType<typeof createBrowserClient> | null = null
try {
  supabase = createClientSupabase()
} catch (error) {
  console.error("Failed to initialize Supabase singleton:", error)
}

export { supabase }
export const createClientDatabaseClient = createClientSupabase
