import { NextResponse } from "next/server"
import { createServerDatabaseClient } from "@/lib/database"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")
  const categoryId = url.searchParams.get("categoryId")
  const limit = Number(url.searchParams.get("limit") || "3")

  try {
    const supabase = createServerDatabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Get current user if userId not provided
    let currentUserId = userId
    if (!currentUserId) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error("Auth error:", authError)
        return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
      }

      if (user) {
        currentUserId = user.id
      }
    }

    // If we have a user, get their data for personalization
    let userData = null
    if (currentUserId) {
      const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", currentUserId).single()

      if (userError && userError.code !== "PGRST116") {
        console.error("Error fetching user data:", userError)
      } else {
        userData = user
      }

      // Get user's previous bookings for service history
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("service_id")
        .eq("client_id", currentUserId)

      if (bookingsError) {
        console.error("Error fetching user bookings:", bookingsError)
      } else if (bookings && bookings.length > 0) {
        // Add booking data to userData
        userData = {
          ...userData,
          bookings: bookings.map((b) => b.service_id),
        }
      }
    }

    // Build the query for services
    let query = supabase
      .from("services")
      .select(
        `
        id, 
        title, 
        description, 
        base_price,
        category_id,
        categories:category_id (id, name),
        providers:provider_id (id, name, avatar_url),
        avg_rating:reviews(rating)
      `,
      )
      .eq("is_active", true)
      .order("is_featured", { ascending: false })

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    // If we have user data, we could filter based on preferences
    // This is a simplified example - in a real app, you'd use more sophisticated algorithms
    if (userData && userData.bookings && userData.bookings.length > 0) {
      // Get services in the same categories as previously booked services
      const { data: previousServices, error: prevServicesError } = await supabase
        .from("services")
        .select("category_id")
        .in("id", userData.bookings)

      if (!prevServicesError && previousServices && previousServices.length > 0) {
        const categoryIds = [...new Set(previousServices.map((s) => s.category_id))]
        if (categoryIds.length > 0 && !categoryId) {
          // If no specific category was requested, prioritize categories the user has used before
          query = query.in("category_id", categoryIds)
        }
      }
    }

    // Get one more than needed so we can calculate if there are more
    const { data: services, error } = await query.limit(limit + 1)

    if (error) {
      console.error("Error fetching services:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Process the services to add match scores and reasons
    // In a real app, this would be done with a more sophisticated algorithm
    const hasMore = services.length > limit
    const recommendedServices = services.slice(0, limit).map((service) => {
      // Calculate average rating
      let avgRating = 0
      if (service.avg_rating && service.avg_rating.length > 0) {
        avgRating =
          service.avg_rating.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) /
          service.avg_rating.length
      }

      // Generate a match score (in a real app, this would be based on user preferences, behavior, etc.)
      const matchScore = Math.floor(Math.random() * 15) + 85 // Random score between 85-99

      // Generate a match reason
      let matchReason = "Based on popular services in this category"
      if (userData) {
        if (userData.bookings && userData.bookings.includes(service.id)) {
          matchReason = "You've used this service before"
        } else if (userData.bookings && userData.bookings.length > 0) {
          matchReason = "Similar to services you've used before"
        } else {
          matchReason = "Recommended for new users in your field"
        }
      }

      return {
        ...service,
        provider: service.providers,
        category: service.categories,
        avg_rating: avgRating,
        match_score: matchScore,
        match_reason: matchReason,
      }
    })

    // Sort by match score
    recommendedServices.sort((a, b) => (b.match_score || 0) - (a.match_score || 0))

    return NextResponse.json({
      recommendations: recommendedServices,
      hasMore,
    })
  } catch (error: any) {
    console.error("Unexpected error in recommendations API:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
