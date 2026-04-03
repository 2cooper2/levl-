import { createClientDatabaseClient, createServerDatabaseClient } from "@/lib/supabase"
import type { Service, UserPreferenceModel, ServiceMatch } from "@/types/matchmaker"

// Feature weights for the recommendation algorithm
interface FeatureWeights {
  categoryMatch: number
  priceMatch: number
  qualityMatch: number
  providerMatch: number
  popularityBoost: number
  personalHistoryBoost: number
}

// Default weights
const DEFAULT_WEIGHTS: FeatureWeights = {
  categoryMatch: 0.35,
  priceMatch: 0.2,
  qualityMatch: 0.25,
  providerMatch: 0.1,
  popularityBoost: 0.05,
  personalHistoryBoost: 0.05,
}

/**
 * Fetches personalized service recommendations
 */
export async function getPersonalizedRecommendations(
  userId: string | null,
  userModel: UserPreferenceModel,
  categoryId?: string,
  limit = 5,
): Promise<ServiceMatch[]> {
  try {
    const supabase = userId ? createClientDatabaseClient() : createServerDatabaseClient()

    // Fetch services
    let query = supabase
      .from("services")
      .select(`
        id, 
        title, 
        description, 
        base_price,
        category_id,
        provider_id,
        is_featured,
        categories:category_id (id, name),
        providers:provider_id (id, name, avatar_url, bio),
        reviews(rating, comment)
      `)
      .eq("is_active", true)

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    const { data: services, error } = await query.limit(50) // Fetch more than needed for filtering

    if (error) {
      console.error("Error fetching services:", error)
      return []
    }

    // Fetch user's booking history if logged in
    let userBookings: any[] = []
    let userViews: any[] = []

    if (userId) {
      const { data: bookings } = await supabase
        .from("bookings")
        .select("service_id, provider_id, created_at")
        .eq("client_id", userId)

      if (bookings) {
        userBookings = bookings
      }

      const { data: views } = await supabase
        .from("service_views")
        .select("service_id, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20)

      if (views) {
        userViews = views
      }
    }

    // Fetch global popularity metrics
    const { data: popularServices } = await supabase
      .from("service_popularity")
      .select("service_id, view_count, booking_count, conversion_rate")

    const popularityMap = new Map(popularServices?.map((item) => [item.service_id, item]) || [])

    // Calculate feature vectors for each service
    const serviceMatches = services.map((service) => {
      // Calculate average rating
      let avgRating = 0
      if (service.reviews && service.reviews.length > 0) {
        avgRating =
          service.reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / service.reviews.length
      }

      // Create provider object
      const provider = {
        id: service.providers.id,
        name: service.providers.name,
        avatar:
          service.providers.avatar_url ||
          `/placeholder.svg?height=40&width=40&text=${service.providers.name.substring(0, 2).toUpperCase()}`,
        rating: avgRating || 4.5,
        reviews: service.reviews?.length || 0,
        verified: true, // Assume all providers in the database are verified
        responseTime: "< 2 hours", // Mock data
        completionRate: 95, // Mock data
        bio: service.providers.bio || "",
      }

      // Create service object
      const serviceObj: Service = {
        id: service.id,
        title: service.title,
        category: service.categories.name,
        provider,
        price: `$${service.base_price}`,
        timeEstimate: "1-3 hours", // Mock data
        description: service.description,
        image: `/placeholder.svg?height=80&width=80&text=${service.title.substring(0, 2).toUpperCase()}`,
        tags: service.title
          .split(" ")
          .filter((word: string) => word.length > 3)
          .slice(0, 3),
        completedProjects: 50, // Mock data
        satisfaction: 95, // Mock data
      }

      // Calculate match score components
      const categoryConfidence = userModel.categories.get(service.categories.name) || 0
      const categoryScore = categoryConfidence * DEFAULT_WEIGHTS.categoryMatch * 100

      // Price match (inverse of budget sensitivity)
      const priceScore =
        (10 - userModel.budget.sensitivity) * (service.base_price / 100) * DEFAULT_WEIGHTS.priceMatch * 10

      // Quality match
      const qualityScore =
        (service.reviews?.length ? avgRating : 4.5) * userModel.quality.importance * DEFAULT_WEIGHTS.qualityMatch * 2

      // Provider match (based on previous bookings with this provider)
      const hasBookedProvider = userBookings.some((booking) => booking.provider_id === service.provider_id)
      const providerScore = hasBookedProvider ? DEFAULT_WEIGHTS.providerMatch * 100 : 0

      // Popularity boost
      const popularity = popularityMap.get(service.id)
      const popularityScore = popularity
        ? (popularity.view_count * 0.01 + popularity.booking_count * 0.1) * DEFAULT_WEIGHTS.popularityBoost
        : 0

      // Personal history boost
      const hasViewed = userViews.some((view) => view.service_id === service.id)
      const hasBooked = userBookings.some((booking) => booking.service_id === service.id)
      const personalHistoryScore = (hasViewed ? 5 : 0) + (hasBooked ? 10 : 0) * DEFAULT_WEIGHTS.personalHistoryBoost

      // Featured boost
      const featuredBoost = service.is_featured ? 5 : 0

      // Calculate total match score
      const rawScore =
        categoryScore +
        priceScore +
        qualityScore +
        providerScore +
        popularityScore +
        personalHistoryScore +
        featuredBoost
      const matchScore = Math.min(99, Math.max(60, Math.round(rawScore)))

      // Generate match reasons
      const matchReasons = []

      if (categoryConfidence > 0.3) {
        matchReasons.push({
          factor: "Category Match",
          score: Math.round(categoryScore),
          explanation: `Matches your interest in ${service.categories.name} services`,
        })
      }

      if (avgRating > 4.5) {
        matchReasons.push({
          factor: "High Rating",
          score: Math.round(qualityScore),
          explanation: `${avgRating.toFixed(1)}★ rating from ${service.reviews?.length || 0} reviews`,
        })
      }

      if (hasBookedProvider) {
        matchReasons.push({
          factor: "Trusted Provider",
          score: Math.round(providerScore),
          explanation: `You've worked with ${service.providers.name} before`,
        })
      }

      if (popularity && popularity.booking_count > 5) {
        matchReasons.push({
          factor: "Popular Service",
          score: Math.round(popularityScore),
          explanation: `Booked by ${popularity.booking_count} people recently`,
        })
      }

      if (service.is_featured) {
        matchReasons.push({
          factor: "Featured Service",
          score: featuredBoost,
          explanation: "Highly recommended by LEVL",
        })
      }

      return {
        service: serviceObj,
        matchScore,
        matchReasons,
        confidenceScore: Math.min(0.95, matchScore / 100 + 0.2),
      }
    })

    // Sort by match score and limit results
    return serviceMatches.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit)
  } catch (error) {
    console.error("Error getting personalized recommendations:", error)
    return []
  }
}

/**
 * Updates the recommendation model based on user feedback
 */
export async function updateRecommendationModel(
  userId: string,
  serviceId: string,
  feedback: "positive" | "negative",
  userModel: UserPreferenceModel,
): Promise<UserPreferenceModel> {
  try {
    const supabase = createClientDatabaseClient()

    // Log the feedback
    await supabase.from("recommendation_feedback").insert({
      user_id: userId,
      service_id: serviceId,
      is_positive: feedback === "positive",
      created_at: new Date().toISOString(),
    })

    // Fetch the service details
    const { data: service } = await supabase
      .from("services")
      .select(`
        id, 
        category_id,
        categories:category_id (name),
        base_price
      `)
      .eq("id", serviceId)
      .single()

    if (!service) {
      return userModel
    }

    // Update the user model based on feedback
    const updatedModel = { ...userModel }
    const categoryName = service.categories.name
    const learningRate = 0.2

    if (feedback === "positive") {
      // Increase confidence in this category
      const currentConfidence = updatedModel.categories.get(categoryName) || 0
      updatedModel.categories.set(categoryName, Math.min(0.95, currentConfidence + learningRate))

      // Adjust budget sensitivity based on price
      if (service.base_price < 50) {
        updatedModel.budget.sensitivity = Math.min(10, updatedModel.budget.sensitivity + learningRate)
      } else if (service.base_price > 150) {
        updatedModel.budget.sensitivity = Math.max(1, updatedModel.budget.sensitivity - learningRate)
      }

      // Add to satisfaction trend
      updatedModel.history.satisfactionTrend.push(0.8)

      // Add to viewed services
      if (!updatedModel.history.viewedServices.includes(Number(serviceId))) {
        updatedModel.history.viewedServices.push(Number(serviceId))
      }
    } else {
      // Decrease confidence in this category slightly
      const currentConfidence = updatedModel.categories.get(categoryName) || 0
      if (currentConfidence > 0.3) {
        updatedModel.categories.set(categoryName, currentConfidence - learningRate / 2)
      }

      // Add to satisfaction trend
      updatedModel.history.satisfactionTrend.push(-0.5)

      // Increment refinement iterations
      updatedModel.history.refinementIterations += 1
    }

    // Increment interaction count
    updatedModel.history.interactionCount += 1

    return updatedModel
  } catch (error) {
    console.error("Error updating recommendation model:", error)
    return userModel
  }
}

/**
 * Generates diverse alternatives to current recommendations
 */
export async function generateDiverseAlternatives(
  currentRecommendations: ServiceMatch[],
  userModel: UserPreferenceModel,
  diversityFocus: "category" | "price" | "quality" | "balanced" = "balanced",
): Promise<ServiceMatch[]> {
  try {
    const supabase = createServerDatabaseClient()

    // Get current service IDs to exclude
    const currentIds = currentRecommendations.map((rec) => rec.service.id)

    // Build query based on diversity focus
    let query = supabase
      .from("services")
      .select(`
        id, 
        title, 
        description, 
        base_price,
        category_id,
        provider_id,
        is_featured,
        categories:category_id (id, name),
        providers:provider_id (id, name, avatar_url, bio),
        reviews(rating, comment)
      `)
      .eq("is_active", true)
      .not("id", "in", `(${currentIds.join(",")})`)

    if (diversityFocus === "category") {
      // Get categories from current recommendations
      const currentCategories = currentRecommendations.map((rec) => rec.service.category)

      // Fetch services from different categories
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name")
        .not("name", "in", `(${currentCategories.map((c) => `'${c}'`).join(",")})`)
        .limit(3)

      if (categories && categories.length > 0) {
        query = query.in(
          "category_id",
          categories.map((c) => c.id),
        )
      }
    } else if (diversityFocus === "price") {
      // Get average price of current recommendations
      const avgPrice =
        currentRecommendations.reduce(
          (sum, rec) => sum + Number.parseFloat(rec.service.price.replace(/[^0-9.]/g, "")),
          0,
        ) / currentRecommendations.length

      // Fetch services with different price points
      if (avgPrice < 75) {
        query = query.gt("base_price", 100)
      } else {
        query = query.lt("base_price", 50)
      }
    } else if (diversityFocus === "quality") {
      // Fetch highly rated services
      query = query.order("is_featured", { ascending: false })
    }

    const { data: services, error } = await query.limit(10)

    if (error) {
      console.error("Error fetching diverse alternatives:", error)
      return []
    }

    // Transform to service matches (simplified scoring for diversity)
    const diverseMatches = services.map((service) => {
      // Calculate average rating
      let avgRating = 0
      if (service.reviews && service.reviews.length > 0) {
        avgRating =
          service.reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / service.reviews.length
      }

      // Create provider object
      const provider = {
        id: service.providers.id,
        name: service.providers.name,
        avatar:
          service.providers.avatar_url ||
          `/placeholder.svg?height=40&width=40&text=${service.providers.name.substring(0, 2).toUpperCase()}`,
        rating: avgRating || 4.5,
        reviews: service.reviews?.length || 0,
        verified: true,
        responseTime: "< 2 hours",
        completionRate: 95,
        bio: service.providers.bio || "",
      }

      // Create service object
      const serviceObj: Service = {
        id: service.id,
        title: service.title,
        category: service.categories.name,
        provider,
        price: `$${service.base_price}`,
        timeEstimate: "1-3 hours",
        description: service.description,
        image: `/placeholder.svg?height=80&width=80&text=${service.title.substring(0, 2).toUpperCase()}`,
        tags: service.title
          .split(" ")
          .filter((word: string) => word.length > 3)
          .slice(0, 3),
        completedProjects: 50,
        satisfaction: 95,
      }

      // Calculate a simpler match score for diverse recommendations
      let matchScore = 70 // Base score
      let matchReason = ""

      if (diversityFocus === "category") {
        matchScore += 10
        matchReason = `Different service category (${service.categories.name})`
      } else if (diversityFocus === "price") {
        matchScore += 10
        matchReason = service.base_price < 75 ? "More affordable option" : "Premium quality option"
      } else if (diversityFocus === "quality") {
        matchScore += service.is_featured ? 15 : 5
        matchReason = service.is_featured ? "Featured high-quality service" : "Alternative quality option"
      }

      return {
        service: serviceObj,
        matchScore,
        matchReasons: [
          {
            factor: "Diversity",
            score: 10,
            explanation: matchReason,
          },
        ],
        confidenceScore: 0.7,
      }
    })

    // Return top 3 diverse matches
    return diverseMatches.slice(0, 3)
  } catch (error) {
    console.error("Error generating diverse alternatives:", error)
    return []
  }
}
