"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function seedUsers() {
  try {
    const supabase = createServerClient()
    if (!supabase) {
      return { success: false, message: "Failed to create Supabase client" }
    }

    // Check if we already have users
    const { data: existingUsers, error: checkError } = await supabase.from("users").select("id").limit(1)

    if (checkError) {
      console.error("Error checking for existing users:", checkError)
      return { success: false, message: "Error checking for existing users" }
    }

    // If we already have users, don't seed
    if (existingUsers && existingUsers.length > 0) {
      return { success: true, message: "Users already exist, skipping seed" }
    }

    // Create test users in auth.users
    const testUsers = [
      {
        email: "client@example.com",
        password: "password123",
        name: "Client User",
        role: "client",
      },
      {
        email: "provider@example.com",
        password: "password123",
        name: "Provider User",
        role: "provider",
      },
      {
        email: "admin@example.com",
        password: "password123",
        name: "Admin User",
        role: "admin",
      },
    ]

    for (const user of testUsers) {
      // Create user in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role,
        },
      })

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError)
        continue
      }

      if (authData.user) {
        // Create user profile in users table
        const { error: profileError } = await supabase.from("users").insert([
          {
            id: authData.user.id,
            name: user.name,
            email: user.email,
            avatar_url: `/placeholder.svg?height=200&width=200&text=${user.name.charAt(0)}`,
            role: user.role,
            is_active: true,
            is_verified: user.role === "admin", // Only admin is verified by default
            bio: `This is a test ${user.role} account created for demonstration purposes.`,
            location: "San Francisco, CA",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

        if (profileError) {
          console.error(`Error creating user profile for ${user.email}:`, profileError)
        }
      }
    }

    revalidatePath("/admin")
    return { success: true, message: "Test users created successfully" }
  } catch (error) {
    console.error("Error seeding users:", error)
    return { success: false, message: "An unexpected error occurred" }
  }
}
