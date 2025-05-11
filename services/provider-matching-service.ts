import { createClientDatabaseClient } from "@/lib/supabase-client"
import type { UserPreferenceModel } from "@/types/matchmaker"

interface ProviderMatch {
  id: string
  name: string
  avatar: string
  bio: string
  specialties: string[]
  rating: number
  reviews: number
  completionRate: number
  responseTime: string
  matchScore: number
  matchReasons: {
    factor: string
    score: number
    explanation: string
  }[]
}

/**
 * Fetches providers that match the user's preferences
 */
export async function getMatchingProviders(
  userId: string | null,
  userModel: UserPreferenceModel,
  categoryId?: string,
  limit = 5,
): Promise<ProviderMatch[]> {
  try {
    const supabase = createClientDatabaseClient()

    // Fetch providers
    let query = supabase
      .from("providers")
      .select(`
        id, 
        name, 
        avatar_url,
        bio,
        specialties,
        avg_rating,
        review_count,
        completion_rate,
        response_time,
        services!inner(category_id)
      `)
      .eq("is_active", true)

    if (categoryId) {
      query = query.eq("services.category_id", categoryId)
    }

    const { data: providers, error } = await query.limit(20)

    if (error) {
      console.error("Error fetching providers:", error)
      return []
    }

    // Fetch user's booking history if logged in
    let userBookings: any[] = []
    let userReviews: any[] = []

    if (userId) {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("provider_id, created_at, status")
        .eq("client_id", userId)

      if (bookings) {
        userBookings = bookings
      }

      const { data: reviews } = await supabase
        .from("provider_reviews")
        .select("provider_id, rating, comment")
        .eq("user_id", userId)

      if (reviews) {
        userReviews = reviews
      }
    }

    // Calculate match scores for each provider
    const providerMatches = await Promise.all(
      providers.map(async (provider) => {
        // Calculate match score components
        let categoryScore = 0

        // If provider offers services in user's preferred categories
        if (provider.services && provider.services.length > 0) {
          const categoryIds = [...new Set(provider.services.map((s: any) => s.category_id))]

          // Fetch category names
          const { data: categories } = await supabase.from("categories").select("id, name").in("id", categoryIds)

          if (categories) {
            // Calculate category match score
            categories.forEach((category) => {
              const confidence = userModel.categories.get(category.name) || 0
              categoryScore += confidence * 20
            })
          }
        }

        // Quality score based on ratings and user's quality importance
        const qualityScore = (provider.avg_rating || 4.5) * userModel.quality.importance * 2

        // Previous interaction score
        const hasBookedProvider = userBookings.some((booking) => booking.provider_id === provider.id)
        const hasReviewedProvider = userReviews.some((review) => review.provider_id === provider.id)
        const interactionScore = (hasBookedProvider ? 15 : 0) + (hasReviewedProvider ? 10 : 0)

        // Completion rate score
        const completionScore = ((provider.completion_rate || 95) - 90) * 2

        // Calculate total match score
        const rawScore = categoryScore + qualityScore + interactionScore + completionScore
        const matchScore = Math.min(99, Math.max(60, Math.round(rawScore)))

        // Generate match reasons
        const matchReasons = []

        if (categoryScore > 10) {
          matchReasons.push({
            factor: "Service Match",
            score: Math.round(categoryScore),
            explanation: "Offers services you're interested in",
          })
        }

        if (provider.avg_rating && provider.avg_rating > 4.5) {
          matchReasons.push({
            factor: "High Rating",
            score: Math.round(qualityScore),
            explanation: `${provider.avg_rating.toFixed(1)}★ rating from ${provider.review_count || 0} reviews`,
          })
        }

        if (hasBookedProvider) {
          matchReasons.push({
            factor: "Previous Experience",
            score: 15,
            explanation: "You've worked with this provider before",
          })
        }

        if (provider.completion_rate && provider.completion_rate > 95) {
          matchReasons.push({
            factor: "Reliability",
            score: Math.round(completionScore),
            explanation: `${provider.completion_rate}% completion rate`,
          })
        }

        return {
          id: provider.id,
          name: provider.name,
          avatar:
            provider.avatar_url ||
            `/placeholder.svg?height=80&width=80&text=${provider.name.substring(0, 2).toUpperCase()}`,
          bio: provider.bio || "",
          specialties: provider.specialties || [],
          rating: provider.avg_rating || 4.5,
          reviews: provider.review_count || 0,
          completionRate: provider.completion_rate || 95,
          responseTime: provider.response_time || "< 2 hours",
          matchScore,
          matchReasons,
        }
      }),
    )

    // Sort by match score and limit results
    return providerMatches.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit)
  } catch (error) {
    console.error("Error getting matching providers:", error)
    return []
  }
}
