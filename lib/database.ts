import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Create a singleton instance for the client
let clientInstance: ReturnType<typeof createClient<Database>> | null = null

export const createDatabaseClient = () => {
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
