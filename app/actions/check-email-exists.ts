"use server"

import { createServerClient } from "@/lib/supabase"

export async function checkEmailExistsAction(email: string): Promise<boolean> {
  try {
    const supabase = createServerClient()

    // Check if the email exists in the users table
    const { count, error } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("email", email)

    if (error) {
      console.error("Error checking email in users table:", error)
      return false
    }

    return count ? count > 0 : false
  } catch (error) {
    console.error("Error checking email:", error)
    return false
  }
}
