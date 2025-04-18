"use client"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// For backward compatibility
export { createSupabaseClient as createClient }
