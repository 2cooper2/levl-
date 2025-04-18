"use client"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a singleton instance for the client
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null

export const createServerClient = () => {
  return createSupabaseClient(supabaseUrl || "", supabaseAnonKey || "", {
    auth: {
      persistSession: false,
    },
  })
}

export const createClient = () => {
  if (clientInstance) return clientInstance

  clientInstance = createSupabaseClient(supabaseUrl || "", supabaseAnonKey || "", {
    auth: {
      persistSession: true,
      storageKey: "levl-supabase-auth",
    },
  })

  return clientInstance
}
