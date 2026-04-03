"use server"

import { createServerClient } from "@/lib/supabase-server"

export async function checkEmailExists(email: string) {
  try {
    const supabase = createServerClient()

    if (!supabase) {
      return {
        error: "Could not connect to database",
      }
    }

    // Check if the email exists in the auth.users table
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error("Error checking email:", error)
      // For security reasons, don't expose the specific error
      return { exists: false }
    }

    // Check if any user has this email
    const userExists = data.users.some((user) => user.email === email)

    return { exists: userExists }
  } catch (error) {
    console.error("Error in checkEmailExists:", error)
    // For security reasons, don't expose the specific error
    return { exists: false }
  }
}
