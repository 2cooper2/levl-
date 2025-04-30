"use server"

import { createServerClient } from "@/lib/supabase-server"
import { randomUUID } from "crypto"

// Sample user data
const sampleUsers = [
  {
    email: "john.doe@example.com",
    password: "password123",
    fullName: "John Doe",
    displayName: "John",
    bio: "Experienced web developer with 5+ years in React and Node.js",
    avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    email: "jane.smith@example.com",
    password: "password123",
    fullName: "Jane Smith",
    displayName: "Jane",
    bio: "UI/UX designer passionate about creating beautiful interfaces",
    avatarUrl: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  // Add more sample users as needed
]

export async function seedUsers() {
  try {
    const supabase = createServerClient()

    if (!supabase) {
      return {
        error: "Could not connect to database",
      }
    }

    const results = []

    for (const user of sampleUsers) {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      })

      if (authError) {
        results.push({
          email: user.email,
          success: false,
          error: authError.message,
        })
        continue
      }

      const userId = authData.user.id

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: randomUUID(),
        user_id: userId,
        full_name: user.fullName,
        display_name: user.displayName,
        email: user.email,
        bio: user.bio,
        avatar_url: user.avatarUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        results.push({
          email: user.email,
          success: false,
          error: `Auth created but profile failed: ${profileError.message}`,
        })
        continue
      }

      results.push({
        email: user.email,
        success: true,
      })
    }

    return { results }
  } catch (error: any) {
    console.error("Error seeding users:", error)
    return { error: error.message || "Failed to seed users" }
  }
}
