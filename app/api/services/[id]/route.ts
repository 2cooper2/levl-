import { NextResponse } from "next/server"
import { createServerDatabaseClient } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const serviceId = params.id

    const supabase = createServerDatabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    const { data: service, error } = await supabase
      .from("services")
      .select(`
        *,
        provider:provider_id(id, name, avatar_url, headline, bio, skills),
        category:category_id(id, name)
      `)
      .eq("id", serviceId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Service not found" }, { status: 404 })
      }
      console.error("Error fetching service:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get reviews for this service
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select(`
        *,
        client:client_id(id, name, avatar_url)
      `)
      .eq("service_id", serviceId)
      .order("created_at", { ascending: false })

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError)
      // Continue anyway, we'll just return the service without reviews
    }

    return NextResponse.json({
      service,
      reviews: reviews || [],
    })
  } catch (error: any) {
    console.error("Unexpected error in service API:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const serviceId = params.id

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

    // Get the service to check ownership
    const { data: existingService, error: serviceError } = await supabase
      .from("services")
      .select("provider_id")
      .eq("id", serviceId)
      .single()

    if (serviceError) {
      if (serviceError.code === "PGRST116") {
        return NextResponse.json({ error: "Service not found" }, { status: 404 })
      }
      console.error("Error fetching service:", serviceError)
      return NextResponse.json({ error: serviceError.message }, { status: 500 })
    }

    // Check if user is the owner or an admin
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    if (existingService.provider_id !== user.id && userProfile.role !== "admin") {
      return NextResponse.json({ error: "You do not have permission to update this service" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, categoryId, basePrice, currency, deliveryTime, isActive, isFeatured } = body

    // Validate required fields
    if (!title || !description || !basePrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updateData: any = {
      title,
      description,
      category_id: categoryId || null,
      base_price: basePrice,
      currency: currency || "USD",
      delivery_time: deliveryTime || null,
      updated_at: new Date().toISOString(),
    }

    // Only admins can update featured status
    if (userProfile.role === "admin" && isFeatured !== undefined) {
      updateData.is_featured = isFeatured
    }

    // Provider can update active status
    if (isActive !== undefined) {
      updateData.is_active = isActive
    }

    const { data: updatedService, error: updateError } = await supabase
      .from("services")
      .update(updateData)
      .eq("id", serviceId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating service:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ service: updatedService })
  } catch (error: any) {
    console.error("Unexpected error in service API:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const serviceId = params.id

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

    // Get the service to check ownership
    const { data: existingService, error: serviceError } = await supabase
      .from("services")
      .select("provider_id")
      .eq("id", serviceId)
      .single()

    if (serviceError) {
      if (serviceError.code === "PGRST116") {
        return NextResponse.json({ error: "Service not found" }, { status: 404 })
      }
      console.error("Error fetching service:", serviceError)
      return NextResponse.json({ error: serviceError.message }, { status: 500 })
    }

    // Check if user is the owner or an admin
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    if (existingService.provider_id !== user.id && userProfile.role !== "admin") {
      return NextResponse.json({ error: "You do not have permission to delete this service" }, { status: 403 })
    }

    // Delete the service
    const { error: deleteError } = await supabase.from("services").delete().eq("id", serviceId)

    if (deleteError) {
      console.error("Error deleting service:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Unexpected error in service API:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
