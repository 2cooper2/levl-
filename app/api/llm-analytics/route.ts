import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined
    const provider = searchParams.get("provider") || undefined

    // Mock data for now since we don't have actual database connection
    const mockData = {
      usageMetrics: {
        totalRequests: 1250,
        totalTokens: 45000,
        averageTokensPerRequest: 36,
        requestsByModel: {
          "gpt-4": 800,
          "gpt-3.5-turbo": 450,
        },
        tokensByModel: {
          "gpt-4": 30000,
          "gpt-3.5-turbo": 15000,
        },
        requestsOverTime: [
          { date: "2024-01-01", count: 100 },
          { date: "2024-01-02", count: 120 },
          { date: "2024-01-03", count: 95 },
        ],
      },
      feedbackStats: {
        averageRating: 4.2,
        totalFeedback: 85,
        ratingDistribution: {
          1: 2,
          2: 5,
          3: 15,
          4: 35,
          5: 28,
        },
      },
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Error in LLM analytics API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
