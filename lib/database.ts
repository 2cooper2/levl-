"use client"

import { supabase } from "./supabase-client"

// Export a function that returns the singleton instance
export const createDatabaseClient = () => {
  return supabase
}

// For server-side usage
export const createServerDatabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase server credentials")
    return null
  }

  return supabase
}
