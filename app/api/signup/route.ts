import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    if (!supabase) {
      return NextResponse.json({ error: "Could not connect to authentication service" }, { status: 500 })
    }

    const { email, password, fullName, displayName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, password, and full name are required" }, { status: 400 })
    }

    // Step 1: Create the user in auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Step 2: Create the user profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: randomUUID(),
      user_id: authData.user.id,
      full_name: fullName,
      display_name: displayName || fullName.split(" ")[0],
      email: email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      // We should ideally delete the auth user here, but Supabase doesn't expose this API easily
      return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 })
    }

    return NextResponse.json(
      {
        message: "Signup successful",
        user: authData.user,
        session: authData.session,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error in signup route:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
