"use server"

import { createServerClient } from "@/lib/supabase-server"
import { randomUUID } from "crypto"

export async function createUserProfile(userData: {
  userId: string
  email: string
  fullName: string
  displayName?: string
  avatarUrl?: string
}) {
  try {
    const supabase = createServerClient()

    if (!supabase) {
      return {
        error: "Could not connect to database",
      }
    }

    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userData.userId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is expected if profile doesn't exist
      console.error("Error checking for existing profile:", fetchError)
      return { error: "Failed to check for existing profile" }
    }

    if (existingProfile) {
      console.log("Profile already exists for user:", userData.userId)
      return { success: true, message: "Profile already exists" }
    }

    // Create new profile
    const { error } = await supabase.from("profiles").insert({
      id: randomUUID(),
      user_id: userData.userId,
      full_name: userData.fullName,
      display_name: userData.displayName || userData.fullName.split(" ")[0],
      email: userData.email,
      avatar_url: userData.avatarUrl || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error creating profile:", error)
      return { error: "Failed to create profile" }
    }

    return { success: true, message: "Profile created successfully" }
  } catch (error: any) {
    console.error("Error in createUserProfile:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
}
