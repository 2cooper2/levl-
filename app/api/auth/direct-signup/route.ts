import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Parse request body
    const { name, email, password, role } = await request.json()

    // Validate inputs
    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json(
        { success: false, error: "Server configuration error - missing Supabase credentials" },
        { status: 500 },
      )
    }

    // Create a Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Skip checking for existing users in auth.users and directly try to create the user
    // If the email exists, Supabase will return an error that we can handle

    // Create user with admin API (bypasses email verification)
    const { data: userData, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // This marks the email as confirmed
      user_metadata: {
        name,
        role,
      },
    })

    if (createUserError) {
      // Check if the error is because the user already exists
      if (createUserError.message.includes("already exists")) {
        return NextResponse.json(
          { success: false, error: "Email already in use. Please use a different email or try logging in." },
          { status: 400 },
        )
      }

      console.error("Error creating user:", createUserError)
      return NextResponse.json({ success: false, error: createUserError.message }, { status: 500 })
    }

    if (!userData || !userData.user) {
      return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
    }

    // Create user profile in users table
    const { error: profileError } = await supabaseAdmin.from("users").insert([
      {
        id: userData.user.id,
        name,
        email,
        role,
        avatar_url: `/placeholder.svg?height=200&width=200&text=${name.charAt(0)}`,
        is_active: true,
        is_verified: true, // Always mark as verified
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])

    if (profileError) {
      console.error("Error creating user profile:", profileError)
      // Even if profile creation fails, the auth user was created, so we should return success
      // but include a warning that profile creation failed
      return NextResponse.json({
        success: true,
        userId: userData.user.id,
        warning: "User created but profile creation failed. Please update your profile.",
      })
    }

    // Return success with user ID
    return NextResponse.json({
      success: true,
      userId: userData.user.id,
    })
  } catch (error: any) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An error occurred during signup" },
      { status: 500 },
    )
  }
}
