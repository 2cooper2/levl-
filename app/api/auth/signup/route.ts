import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: Request) {
  try {
    // Get user data from request
    const { name, email, password, role } = await request.json()

    // Validate role - must be one of the allowed values
    if (!["worker", "client", "both"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be 'worker', 'client', or 'both'." }, { status: 400 })
    }

    console.log("Starting signup process for:", email)

    try {
      // Step 1: Create the auth user using signUp instead of admin.createUser
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role,
        },
      })

      if (authError) {
        console.error("Auth error:", authError)
        return NextResponse.json({ error: authError.message }, { status: 400 })
      }

      if (!authData.user) {
        return NextResponse.json({ error: "Failed to create auth user" }, { status: 500 })
      }

      const userId = authData.user.id
      console.log("Auth user created with ID:", userId)

      // Step 2: Manually create the user profile
      try {
        const { error: profileError } = await supabaseAdmin.from("users").insert({
          id: userId,
          email: email,
          name: name,
          role: role,
          avatar_url: `/placeholder.svg?height=200&width=200&text=${name.charAt(0)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)
          console.error("Profile error details:", JSON.stringify(profileError))

          // Don't delete the auth user, as it might be useful for debugging
          return NextResponse.json({ error: `Database error: ${profileError.message}` }, { status: 500 })
        }

        console.log("User profile created successfully")
        return NextResponse.json({ success: true })
      } catch (profileErr: any) {
        console.error("Profile creation exception:", profileErr)
        return NextResponse.json({ error: `Profile creation exception: ${profileErr.message}` }, { status: 500 })
      }
    } catch (authErr: any) {
      console.error("Auth creation exception:", authErr)
      return NextResponse.json({ error: `Auth creation exception: ${authErr.message}` }, { status: 500 })
    }
  } catch (error: any) {
    console.error("General signup error:", error)
    return NextResponse.json({ error: `General error: ${error.message}` }, { status: 500 })
  }
}
