import { createClient } from "@supabase/supabase-js"

// For client components
export const createClientComponentClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase client credentials - returning mock client")
    return createMockClient()
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// For server components and server actions
export const createServerClient = () => {
  // Try different environment variable names that might be available
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Log available environment variables (without revealing the actual keys)
  console.log("Supabase environment variables check:", {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Missing Supabase server credentials - returning mock client")
    return createMockClient()
  }

  console.log("Creating real Supabase client with URL:", supabaseUrl)
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Mock client for development/testing when Supabase isn't available
export const createMockClient = () => {
  console.log("Using mock Supabase client - data will NOT be saved to actual database")

  // In-memory storage for the mock client
  const mockStorage: Record<string, any[]> = {
    waitlist: [],
  }

  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            console.log(`Mock query: SELECT * FROM ${table} WHERE ${column} = ${value}`)
            const items = mockStorage[table] || []
            const item = items.find((item) => item[column] === value)
            return { data: item || null, error: null }
          },
        }),
        order: (column: string, { ascending }: { ascending: boolean }) => {
          console.log(`Mock query: SELECT * FROM ${table} ORDER BY ${column} ${ascending ? "ASC" : "DESC"}`)
          const items = mockStorage[table] || []
          return {
            data: [...items].sort((a, b) => {
              if (ascending) {
                return a[column] > b[column] ? 1 : -1
              } else {
                return a[column] < b[column] ? 1 : -1
              }
            }),
            error: null,
          }
        },
      }),
      insert: async (items: any[]) => {
        console.log(`Mock insert into ${table}:`, items)

        if (!mockStorage[table]) {
          mockStorage[table] = []
        }

        // Add created_at timestamp and id
        const itemsWithTimestamp = items.map((item, index) => ({
          id: mockStorage[table].length + index + 1,
          ...item,
          created_at: new Date().toISOString(),
        }))

        mockStorage[table].push(...itemsWithTimestamp)
        console.log(`Mock inserted ${items.length} items into ${table}`)
        console.log(`Mock ${table} now has ${mockStorage[table].length} items:`, mockStorage[table])

        return { data: null, error: null }
      },
    }),
  }
}
