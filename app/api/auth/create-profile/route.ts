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
    const { userId, name, email, role } = await request.json()

    if (!userId || !name || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate role - must be one of the allowed values
    if (!["worker", "client", "both"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be 'worker', 'client', or 'both'." }, { status: 400 })
    }

    console.log("Creating profile for user:", userId)

    // Create the user profile
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: userId,
      email: email,
      name: name,
      role: role,
      avatar_url: `/placeholder.svg?height=200&width=200&text=${name.charAt(0)}`,
      email_verified: true, // Set email as verified
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      console.error("Profile error details:", JSON.stringify(profileError))
      return NextResponse.json({ error: `Database error: ${profileError.message}` }, { status: 500 })
    }

    console.log("User profile created successfully")
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Profile creation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
