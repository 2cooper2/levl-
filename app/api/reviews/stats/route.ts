import { NextResponse } from "next/server"
import { createServerDatabaseClient } from "@/lib/database"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const serviceId = url.searchParams.get("serviceId")
  const providerId = url.searchParams.get("providerId")

  if (!serviceId && !providerId) {
    return NextResponse.json({ error: "Either serviceId or providerId is required" }, { status: 400 })
  }

  try {
    const supabase = createServerDatabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Start building query
    let query = supabase.from("reviews").select("rating")

    if (serviceId) {
      query = query.eq("service_id", serviceId)
    }

    if (providerId) {
      query = query.eq("provider_id", providerId)
    }

    const { data: reviews, error } = await query

    if (error) {
      console.error("Error fetching review ratings:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({
        stats: {
          avgRating: 0,
          totalCount: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          recommendationPercentage: 0,
        },
      })
    }

    // Calculate average rating
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0)
    const avgRating = sum / reviews.length

    // Calculate rating distribution
    const distribution = reviews.reduce(
      (acc, review) => {
        const rating = review.rating
        if (rating >= 1 && rating <= 5) {
          acc[rating] = (acc[rating] || 0) + 1
        }
        return acc
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
    )

    // Calculate recommendation percentage (4 and 5 star ratings)
    const recommendedCount = (distribution[4] || 0) + (distribution[5] || 0)
    const recommendationPercentage = Math.round((recommendedCount / reviews.length) * 100)

    return NextResponse.json({
      stats: {
        avgRating,
        totalCount: reviews.length,
        distribution,
        recommendationPercentage,
      },
    })
  } catch (error: any) {
    console.error("Unexpected error in review stats API:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
