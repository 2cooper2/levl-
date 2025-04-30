"use server"

import { createClient } from "@/lib/supabase"
import { randomUUID } from "crypto"

/**
 * @deprecated Use the signup function from the auth context instead
 */
export async function createUserProfile(userData: {
  name: string
  email: string
  role: string
  avatar_url?: string
}) {
  try {
    const supabase = createClient()

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", userData.email)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is what we want
      console.error("Error checking for existing user:", checkError)
      return { success: false, message: "Error checking for existing user" }
    }

    if (existingUser) {
      return { success: false, message: "User with this email already exists" }
    }

    // Create new user
    const { error } = await supabase.from("users").insert([
      {
        id: randomUUID(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        avatar_url: userData.avatar_url || `/placeholder.svg?height=200&width=200&text=${userData.name.charAt(0)}`,
        is_active: true,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Error creating user profile:", error)
      return { success: false, message: "Error creating user profile" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in createUserProfile:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}
