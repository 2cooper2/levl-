import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"
import { ENV } from "./env"

// Singleton client instance for client-side usage
let clientInstance: ReturnType<typeof createClient<Database>> | null = null

// Mock client to use when actual client initialization fails
const createMockClient = () => {
  const mockResponse = { data: null, error: new Error("Mock Supabase client used due to initialization failure") }

  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => mockResponse,
          ...mockResponse,
        }),
        ...mockResponse,
      }),
      insert: async () => mockResponse,
      update: async () => mockResponse,
      delete: async () => mockResponse,
      upsert: async () => mockResponse,
    }),
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => mockResponse,
      signOut: async () => mockResponse,
    },
    storage: {
      from: () => ({
        upload: async () => mockResponse,
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
    // Add other methods as needed
  } as any
}

/**
 * Creates a robust Supabase client that won't crash on initialization failures
 */
export function createRobustSupabaseClient() {
  // Return existing instance if available
  if (clientInstance) return clientInstance

  try {
    const supabaseUrl = ENV.SUPABASE_URL()
    const supabaseAnonKey = ENV.SUPABASE_ANON_KEY()

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase credentials")
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
    return createMockClient()
  }
}

/**
 * Creates a robust Supabase client for server-side operations
 */
export function createRobustSupabaseServerClient() {
  try {
    const supabaseUrl = ENV.SUPABASE_URL()
    const supabaseServiceRoleKey = ENV.SUPABASE_SERVICE_ROLE_KEY()

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing Supabase server credentials")
      return createMockClient()
    }

    return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  } catch (error) {
    console.error("Error creating Supabase server client:", error)
    return createMockClient()
  }
}

/**
 * Safe wrapper for Supabase operations
 */
export async function safeSupabaseOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error("Supabase operation failed:", error)
    return fallback
  }
}
