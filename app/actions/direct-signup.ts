"use server"

import { createClient } from "@supabase/supabase-js"

export async function directSignup(name: string, email: string, password: string, role: string) {
  console.log("Starting direct signup process...")

  try {
    // Validate inputs
    if (!name || !email || !password) {
      return { success: false, error: "Missing required fields" }
    }

    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials")
      return { success: false, error: "Server configuration error" }
    }

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if user already exists
    console.log("Checking if user exists...")
    const { data: existingUsers, error: queryError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (queryError) {
      console.error("Error checking existing users:", queryError)
      return { success: false, error: "Error checking if user already exists" }
    }

    if (existingUsers) {
      return { success: false, error: "Email already in use" }
    }

    // Create user with admin API
    console.log("Creating user with admin API...")
    const { data: authUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification
      user_metadata: {
        full_name: name,
      },
    })

    if (createUserError || !authUser.user) {
      console.error("Error creating auth user:", createUserError)
      return { success: false, error: createUserError?.message || "Failed to create user" }
    }

    // Map the role to match the database constraint
    // The database only accepts 'worker', 'client', or 'both'
    let dbRole = "client" // Default

    if (role === "provider") {
      dbRole = "worker"
    } else if (role === "both") {
      dbRole = "both"
    }

    console.log(`Mapping role from ${role} to ${dbRole} to match database constraint`)

    // Create user profile
    console.log("Creating user profile...")
    const { error: profileError } = await supabaseAdmin.from("users").insert([
      {
        id: authUser.user.id,
        name,
        email,
        role: dbRole, // Use the mapped role
        avatar_url: `/placeholder.svg?height=200&width=200&text=${name.charAt(0)}`,
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])

    if (profileError) {
      console.error("Error creating user profile:", profileError)
      // Try to delete the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return { success: false, error: `Error creating user profile: ${profileError.message}` }
    }

    console.log("User created successfully!")
    return { success: true, userId: authUser.user.id }
  } catch (error: any) {
    console.error("Unexpected error in directSignup:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
