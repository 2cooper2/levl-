import { NextResponse } from "next/server"
import { createServerDatabaseClient } from "@/lib/database"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const serviceId = url.searchParams.get("serviceId")
  const providerId = url.searchParams.get("providerId")
  const page = Number(url.searchParams.get("page") || "1")
  const limit = Number(url.searchParams.get("limit") || "10")

  try {
    const supabase = createServerDatabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    let query = supabase
      .from("reviews")
      .select(`
        *,
        client:client_id(id, name, avatar_url),
        service:service_id(id, title),
        likes:review_likes(count)
      `)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (serviceId) {
      query = query.eq("service_id", serviceId)
    }

    if (providerId) {
      query = query.eq("provider_id", providerId)
    }

    const { data: reviews, error } = await query

    if (error) {
      console.error("Error fetching reviews:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase.from("reviews").select("id", { count: "exact" })

    if (serviceId) {
      countQuery = countQuery.eq("service_id", serviceId)
    }

    if (providerId) {
      countQuery = countQuery.eq("provider_id", providerId)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error("Error fetching review count:", countError)
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    return NextResponse.json({
      reviews,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error("Unexpected error in reviews API:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}

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
    const { serviceId, rating, comment, images } = body

    // Validate required fields
    if (!serviceId || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Get the service to get the provider_id
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("provider_id")
      .eq("id", serviceId)
      .single()

    if (serviceError) {
      console.error("Error fetching service:", serviceError)
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Check if user already reviewed this service
    const { data: existingReview, error: reviewCheckError } = await supabase
      .from("reviews")
      .select("id")
      .eq("service_id", serviceId)
      .eq("client_id", user.id)
      .maybeSingle()

    if (reviewCheckError) {
      console.error("Error checking existing review:", reviewCheckError)
      return NextResponse.json({ error: reviewCheckError.message }, { status: 500 })
    }

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this service" }, { status: 400 })
    }

    // Insert review
    const { data: newReview, error: insertError } = await supabase
      .from("reviews")
      .insert({
        id: crypto.randomUUID(),
        service_id: serviceId,
        provider_id: service.provider_id,
        client_id: user.id,
        rating,
        comment,
        images: images || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating review:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Create notification for the provider
    await supabase.from("notifications").insert({
      id: crypto.randomUUID(),
      user_id: service.provider_id,
      type: "new_review",
      title: "New Review",
      message: `You received a new ${rating}-star review on your service.`,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ review: newReview })
  } catch (error: any) {
    console.error("Unexpected error in reviews API:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
