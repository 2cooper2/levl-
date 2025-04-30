import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create a singleton instance for the server
let serverInstance: ReturnType<typeof createSupabaseClient> | null = null

export const createServerClient = () => {
  if (typeof window !== "undefined") {
    throw new Error("createServerClient should only be called on the server")
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
