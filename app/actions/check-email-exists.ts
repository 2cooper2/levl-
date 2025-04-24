"use server"

import { createServerClient } from "@/lib/supabase"

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const supabase = createServerClient()
    if (!supabase) return false

    // Check in the users table, bypassing RLS policies using the service key
    const { data, error, count } = await supabase.from("users").select("email", { count: "exact" }).eq("email", email)

    if (error) {
      console.error("Error checking email:", error)
      return false
    }

    return count ? count > 0 : false
  } catch (error) {
    console.error("Error checking email:", error)
    return false
  }
}
