import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"

/**
 * Call at the top of any API route handler that requires a logged-in user.
 *
 * Usage:
 *   const { user, error } = await requireAuth()
 *   if (error) return error   // returns a 401 NextResponse
 *   // user is guaranteed non-null here
 */
export async function requireAuth() {
  const supabase = await createServerClient()

  if (!supabase) {
    return {
      user: null,
      error: NextResponse.json({ error: "Service unavailable" }, { status: 503 }),
    }
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  return { user, error: null }
}

/**
 * Sanitize a string — strips HTML tags and trims whitespace.
 * Use on any user-supplied input before storing in the database.
 */
export function sanitize(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim()
}
