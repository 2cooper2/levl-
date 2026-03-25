import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Client-side database client
let clientInstance: ReturnType<typeof createClient<Database>> | null = null

export const createDatabaseClient = () => {
  if (typeof window === "undefined") {
    // Server-side
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing Supabase credentials for server")
      return null
    }

    try {
      return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    } catch (error) {
      console.error("Error creating server database client:", error)
      return null
    }
  } else {
    // Client-side (browser)
    if (clientInstance) return clientInstance

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase credentials for client")
      return null
    }

    try {
      clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          storageKey: "levl-auth-token",
          autoRefreshToken: true,
        },
      })
      return clientInstance
    } catch (error) {
      console.error("Error creating client database client:", error)
      return null
    }
  }
}

// Server-side database client
export const createServerDatabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing Supabase credentials for server")
    return null
  }

  try {
    return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  } catch (error) {
    console.error("Error creating server database client:", error)
    return null
  }
}
