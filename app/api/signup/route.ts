import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json()

    // Validate inputs
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    console.log("Creating auth user...")

    // Step 1: Create the auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: { name, role },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    const userId = authData.user.id
    console.log("Auth user created:", userId)

    // Step 2: Create the user profile
    console.log("Creating user profile...")
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: userId,
      name,
      email,
      role,
      is_active: true,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Profile error:", profileError)

      // If profile creation fails, delete the auth user to avoid orphaned accounts
      await supabaseAdmin.auth.admin.deleteUser(userId)

      return NextResponse.json({ error: `Failed to create user profile: ${profileError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId })
  } catch (error: any) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
