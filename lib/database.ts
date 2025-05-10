// Remove the 'use client' directive since this file needs to work on both client and server
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Create a singleton instance for the client
let clientInstance: ReturnType<typeof createClient<Database>> | null = null

// This function is meant for client-side usage
export const createDatabaseClient = () => {
  if (typeof window === "undefined") {
    throw new Error("createDatabaseClient can only be used on the client side")
  }

  if (clientInstance) return clientInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials")
    return null
  }

  clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: "levl-supabase-auth",
    },
  })

  return clientInstance
}

// For server-side usage
export const createServerDatabaseClient = () => {
  // This function is specifically for server-side usage
  if (typeof window !== "undefined") {
    throw new Error("createServerDatabaseClient can only be used on the server side")
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase server credentials")
    return null
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  })
}
