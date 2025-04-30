import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase-server"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    if (!supabase) {
      return NextResponse.json({ error: "Could not connect to database" }, { status: 500 })
    }

    const { userId, email, fullName, displayName, avatarUrl } = await request.json()

    if (!userId || !email || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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
      return NextResponse.json({ error: "Failed to check for existing profile" }, { status: 500 })
    }

    if (existingProfile) {
      return NextResponse.json({ message: "Profile already exists" }, { status: 200 })
    }

    // Create new profile
    const { error } = await supabase.from("profiles").insert({
      id: randomUUID(),
      user_id: userId,
      full_name: fullName,
      display_name: displayName || fullName.split(" ")[0],
      email: email,
      avatar_url: avatarUrl || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error creating profile:", error)
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
    }

    return NextResponse.json({ message: "Profile created successfully" }, { status: 201 })
  } catch (error: any) {
    console.error("Error in create-profile route:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
