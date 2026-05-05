"use server"

import { createServerClient } from "@/lib/supabase-server"
import { randomUUID } from "crypto"

export async function createProfile(userId: string, data: any) {
  try {
    const supabase = await createServerClient()

    if (!supabase) {
      return {
        error: "Could not connect to database",
      }
    }

    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 means no rows returned, which is expected if profile doesn't exist
      console.error("Error checking for existing profile:", fetchError)
      return { error: "Failed to check for existing profile" }
    }

    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.fullName,
          display_name: data.displayName || data.fullName.split(" ")[0],
          bio: data.bio || "",
          avatar_url: data.avatarUrl || "",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (error) {
        console.error("Error updating profile:", error)
        return { error: "Failed to update profile" }
      }

      return { success: true, message: "Profile updated successfully" }
    } else {
      // Create new profile
      const { error } = await supabase.from("profiles").insert({
        id: randomUUID(),
        user_id: userId,
        full_name: data.fullName,
        display_name: data.displayName || data.fullName.split(" ")[0],
        bio: data.bio || "",
        avatar_url: data.avatarUrl || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error creating profile:", error)
        return { error: "Failed to create profile" }
      }

      return { success: true, message: "Profile created successfully" }
    }
  } catch (error: any) {
    console.error("Error in createProfile:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
}
