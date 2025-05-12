/**
 * Service for tracking and analyzing LLM usage
 */

import { createClientDatabaseClient } from "@/lib/supabase-client"
import { createServerDatabaseClient } from "@/lib/supabase-server"

export interface LLMUsageMetrics {
  totalRequests: number
  totalTokens: number
  averageTokensPerRequest: number
  requestsByModel: Record<string, number>
  tokensByModel: Record<string, number>
  requestsOverTime: {
    date: string
    count: number
  }[]
}

export interface LLMFeedbackStats {
  averageRating: number
  totalFeedback: number
  ratingDistribution: Record<number, number>
}

// Record user feedback for an LLM response
export async function recordLLMFeedback(
  userId: string,
  requestId: number,
  rating: number,
  feedbackText?: string,
): Promise<boolean> {
  try {
    const supabase = createClientDatabaseClient()

    const { error } = await supabase.from("llm_response_feedback").insert({
      user_id: userId,
      request_id: requestId,
      rating,
      feedback_text: feedbackText || null,
    })

    if (error) {
      console.error("Error recording LLM feedback:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in recordLLMFeedback:", error)
    return false
  }
}

// Get LLM usage metrics for analytics
export async function getLLMUsageMetrics(
  startDate?: Date,
  endDate?: Date,
  provider?: string,
): Promise<LLMUsageMetrics> {
  try {
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

    const { data, error } = await query

    if (error) {
      console.error("Error fetching LLM usage metrics:", error)
      throw error
    }

    // Process data for metrics
    const totalRequests = data.length
    const totalTokens = data.reduce((sum, req) => sum + (req.total_tokens || 0), 0)

    const requestsByModel: Record<string, number> = {}
    const tokensByModel: Record<string, number> = {}

    // Group by date for time series
    const requestsByDate: Record<string, number> = {}

    data.forEach((req) => {
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

    return {
      totalRequests,
      totalTokens,
      averageTokensPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
      requestsByModel,
      tokensByModel,
      requestsOverTime,
    }
  } catch (error) {
    console.error("Error in getLLMUsageMetrics:", error)
    throw error
  }
}

// Get feedback statistics for LLM responses
export async function getLLMFeedbackStats(): Promise<LLMFeedbackStats> {
  try {
    const supabase = createServerDatabaseClient()

    const { data, error } = await supabase.from("llm_response_feedback").select("rating")

    if (error) {
      console.error("Error fetching LLM feedback stats:", error)
      throw error
    }

    const totalFeedback = data.length
    let sumRatings = 0
    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    }

    data.forEach((feedback) => {
      sumRatings += feedback.rating
      ratingDistribution[feedback.rating] = (ratingDistribution[feedback.rating] || 0) + 1
    })

    return {
      averageRating: totalFeedback > 0 ? sumRatings / totalFeedback : 0,
      totalFeedback,
      ratingDistribution,
    }
  } catch (error) {
    console.error("Error in getLLMFeedbackStats:", error)
    throw error
  }
}
