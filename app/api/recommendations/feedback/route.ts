import { NextResponse } from "next/server"
import { createServerDatabaseClient } from "@/lib/database"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
  try {
    const supabase = createServerDatabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { serviceId, isPositive } = body

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    // Store the feedback
    const { error: insertError } = await supabase.from("recommendation_feedback").insert({
      id: randomUUID(),
      user_id: user.id,
      service_id: serviceId,
      is_positive: isPositive,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("Error storing recommendation feedback:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // If negative feedback, we could update user preferences or exclude this service in future
    if (!isPositive) {
      // This would be implemented based on your recommendation algorithm
      console.log(`User ${user.id} gave negative feedback for service ${serviceId}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Unexpected error in recommendation feedback API:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
