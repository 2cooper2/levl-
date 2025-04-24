"use server"

import { createServerClient } from "@/lib/supabase"

export async function createUserProfile(
  userId: string,
  name: string,
  email: string,
  role: "client" | "provider" | "admin",
) {
  try {
    const supabase = createServerClient()
    if (!supabase) {
      console.error("Failed to create Supabase client")
      return { success: false, message: "Database connection error. Please try again later." }
    }

    const { error: profileError } = await supabase.from("users").insert([
      {
        id: userId,
        name: name,
        email: email,
        avatar_url: `/placeholder.svg?height=200&width=200&text=${name.charAt(0)}`,
        role: role,
        is_active: true,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])

    if (profileError) {
      console.error("Error creating user profile:", profileError)
      return { success: false, message: "Failed to create user profile." }
    }

    return { success: true, message: "User profile created successfully." }
  } catch (error) {
    console.error("Error in createUserProfile:", error)
    return { success: false, message: "An unexpected error occurred." }
  }
}
