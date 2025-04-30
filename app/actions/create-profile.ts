"use server"

import { createAdminClient } from "@/lib/supabase-client"

export async function createUserProfile(
  userId: string,
  userData: {
    name: string
    email: string
    role: string
  },
) {
  console.log("Creating user profile for:", userId, userData)

  try {
    const supabase = createAdminClient()

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking for existing user:", checkError)
    }

    if (existingUser) {
      console.log("User already exists, skipping profile creation")
      return { success: true }
    }

    // Create user profile with fields that match your schema
    const { error } = await supabase.from("users").insert({
      id: userId,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      is_active: true,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Profile creation error:", error)
      throw new Error(`Failed to create user profile: ${error.message}`)
    }

    console.log("User profile created successfully")
    return { success: true }
  } catch (err: any) {
    console.error("Server action error:", err)
    throw new Error(`Server action failed: ${err.message}`)
  }
}
