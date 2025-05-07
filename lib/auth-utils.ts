/**
 * Utility functions for authentication
 */

import { createClient } from "@supabase/supabase-js"

// Verify a Supabase session token
export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    if (!token) return false

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase credentials")
      return false
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get user from the token
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return false
    }

    return true
  } catch (error) {
    console.error("Error verifying token:", error)
    return false
  }
}

// Securely hash sensitive data (for additional security if needed)
export function secureHash(data: string): string {
  try {
    // In a browser environment, we can use the SubtleCrypto API
    // This is a simplified version - in production you'd want to use a salt
    const encoder = new TextEncoder()
    const data_buffer = encoder.encode(data)

    // Create a simple hash using available browser APIs
    let hash = 0
    for (let i = 0; i < data_buffer.length; i++) {
      hash = (hash << 5) - hash + data_buffer[i]
      hash |= 0 // Convert to 32bit integer
    }

    return hash.toString(36)
  } catch (error) {
    console.error("Error creating hash:", error)
    return ""
  }
}

// Generate a secure session ID
export function generateSessionId(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
