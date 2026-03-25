import { NextResponse } from "next/server"
import { createServerDatabaseClient } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const providerId = searchParams.get("providerId")
    const featured = searchParams.get("featured")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const supabase = createServerDatabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    let query = supabase
      .from("services")
      .select(`
        *,
        provider:provider_id(id, name, avatar_url, headline),
        category:category_id(id, name)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    if (providerId) {
      query = query.eq("provider_id", providerId)
    }

    if (featured === "true") {
      query = query.eq("is_featured", true)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching services:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      services: data || [],
      count,
      pagination: {
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error: any) {
    console.error("Unexpected error in services API:", error)
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

    // Get user profile to check role
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    if (userProfile.role !== "provider" && userProfile.role !== "admin") {
      return NextResponse.json({ error: "Only providers can create services" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, categoryId, basePrice, currency, deliveryTime } = body

    // Validate required fields
    if (!title || !description || !basePrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
      .concat("-", Math.floor(Math.random() * 1000).toString())

    const { data: service, error: insertError } = await supabase
      .from("services")
      .insert({
        title,
        slug,
        description,
        provider_id: user.id,
        category_id: categoryId || null,
        base_price: basePrice,
        currency: currency || "USD",
        delivery_time: deliveryTime || null,
        is_featured: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating service:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ service }, { status: 201 })
  } catch (error: any) {
    console.error("Unexpected error in services API:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
