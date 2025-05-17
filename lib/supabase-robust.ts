import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"
import { ENV } from "./enhanced-env"

// Create a singleton instance for the client
let clientInstance: ReturnType<typeof createClient<Database>> | null = null

export const createRobustDatabaseClient = () => {
  if (clientInstance) return clientInstance

  try {
    const supabaseUrl = ENV.SUPABASE_URL()
    const supabaseAnonKey = ENV.SUPABASE_ANON_KEY()

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase credentials - using mock client")
      // Return a mock client that doesn't break the app but doesn't do anything
      return createMockClient()
    }

    clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: "levl-supabase-auth",
      },
    })
    return clientInstance
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    // Return a mock client that doesn't break the app
    return createMockClient()
  }
}

// For server-side usage
export const createRobustServerDatabaseClient = () => {
  try {
    const supabaseUrl = ENV.SUPABASE_URL()
    const supabaseServiceKey = ENV.SUPABASE_SERVICE_ROLE_KEY()

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase server credentials - using mock client")
      return createMockClient()
    }

    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    })
  } catch (error) {
    console.error("Error creating Supabase server client:", error)
    return createMockClient()
  }
}

// Create a mock client that won't crash the app when Supabase isn't available
function createMockClient() {
  const mockResponse = { data: null, error: new Error("Using mock Supabase client") }

  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve(mockResponse),
          ...mockResponse,
        }),
        ...mockResponse,
      }),
      insert: () => Promise.resolve(mockResponse),
      update: () => Promise.resolve(mockResponse),
      delete: () => Promise.resolve(mockResponse),
      upsert: () => Promise.resolve(mockResponse),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve(mockResponse),
      signOut: () => Promise.resolve(mockResponse),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve(mockResponse),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
    // Add any other methods your app uses
  } as any // Type assertion to make TypeScript happy
}
