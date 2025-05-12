import { NextResponse } from "next/server"
import { createServerDatabaseClient } from "@/lib/supabase-server"

// This is a server-side API route that can safely use next/headers
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined
    const provider = searchParams.get("provider") || undefined

    const supabase = createServerDatabaseClient()

    // Build query with optional filters
    let query = supabase.from("llm_requests").select("*")

    if (startDate) {
      query = query.gte("created_at", startDate.toISOString())
    }

    if (endDate) {
      query = query.lte("created_at", endDate.toISOString())
    }

    if (provider) {
      query = query.eq("provider", provider)
    }

    const { data: requestsData, error: requestsError } = await query

    if (requestsError) {
      console.error("Error fetching LLM usage metrics:", requestsError)
      return NextResponse.json({ error: "Failed to fetch LLM usage metrics" }, { status: 500 })
    }

    // Get feedback data
    const { data: feedbackData, error: feedbackError } = await supabase.from("llm_response_feedback").select("rating")

    if (feedbackError) {
      console.error("Error fetching LLM feedback stats:", feedbackError)
      return NextResponse.json({ error: "Failed to fetch LLM feedback stats" }, { status: 500 })
    }

    // Process requests data
    const totalRequests = requestsData.length
    const totalTokens = requestsData.reduce((sum, req) => sum + (req.total_tokens || 0), 0)

    const requestsByModel: Record<string, number> = {}
    const tokensByModel: Record<string, number> = {}
    const requestsByDate: Record<string, number> = {}

    requestsData.forEach((req) => {
      // Count by model
      requestsByModel[req.model] = (requestsByModel[req.model] || 0) + 1
      tokensByModel[req.model] = (tokensByModel[req.model] || 0) + (req.total_tokens || 0)

      // Group by date
      const date = new Date(req.created_at).toISOString().split("T")[0]
      requestsByDate[date] = (requestsByDate[date] || 0) + 1
    })

    // Format time series data
    const requestsOverTime = Object.entries(requestsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Process feedback data
    const totalFeedback = feedbackData.length
    let sumRatings = 0
    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }

    feedbackData.forEach((feedback) => {
      sumRatings += feedback.rating
      ratingDistribution[feedback.rating] = (ratingDistribution[feedback.rating] || 0) + 1
    })

    return NextResponse.json({
      usageMetrics: {
        totalRequests,
        totalTokens,
        averageTokensPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
        requestsByModel,
        tokensByModel,
        requestsOverTime,
      },
      feedbackStats: {
        averageRating: totalFeedback > 0 ? sumRatings / totalFeedback : 0,
        totalFeedback,
        ratingDistribution,
      },
    })
  } catch (error) {
    console.error("Error in LLM analytics API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
