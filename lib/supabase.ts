"use client"

import { supabase, createClientSupabase } from "./supabase-client"

// Re-export the singleton instance and creation function
export const createClient = () => {
  return supabase || createClientSupabase()
}

// For backward compatibility
export const createServerClient = () => {
  if (typeof window !== "undefined") {
    console.warn("createServerClient should only be called on the server")
  }
  return createClient()
}
