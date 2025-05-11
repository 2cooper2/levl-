import { createClientDatabaseClient } from "@/lib/supabase-client"
import type { Service, ServiceProvider, UserPreferenceModel } from "@/types/matchmaker"

export async function fetchServices(categoryId?: string, limit = 10): Promise<Service[]> {
  try {
    const supabase = createClientDatabaseClient()

    let query = supabase
      .from("services")
      .select(`
        id, 
        title, 
        description, 
        base_price,
        category_id,
        categories:category_id (id, name),
        providers:provider_id (id, name, avatar_url),
        avg_rating:reviews(rating)
      `)
      .eq("is_active", true)
      .order("is_featured", { ascending: false })

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    const { data, error } = await query.limit(limit)

    if (error) {
      console.error("Error fetching services:", error)
      return []
    }

    // Transform the data to match our Service interface
    return data.map((item) => {
      // Calculate average rating
      let avgRating = 0
      if (item.avg_rating && item.avg_rating.length > 0) {
        avgRating =
          item.avg_rating.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / item.avg_rating.length
      }

      // Create a provider object
      const provider: ServiceProvider = {
        id: item.providers.id,
        name: item.providers.name,
        avatar:
          item.providers.avatar_url ||
          "/placeholder.svg?height=40&width=40&text=" + item.providers.name.substring(0, 2).toUpperCase(),
        rating: avgRating || 4.5,
        reviews: Math.floor(Math.random() * 100) + 50, // Mock data for now
        verified: Math.random() > 0.3, // 70% chance of being verified
        responseTime: "< " + (Math.floor(Math.random() * 3) + 1) + " hour" + (Math.random() > 0.5 ? "s" : ""),
        completionRate: Math.floor(Math.random() * 10) + 90, // 90-99%
      }

      // Create a service object
      return {
        id: item.id,
        title: item.title,
        category: item.categories.name,
        provider,
        price: `$${item.base_price}`,
        timeEstimate: Math.random() > 0.5 ? "1-2 hours" : "2-4 hours",
        description: item.description,
        image: "/placeholder.svg?height=80&width=80&text=" + item.title.substring(0, 2).toUpperCase(),
        tags: item.title
          .split(" ")
          .filter((word: string) => word.length > 3)
          .slice(0, 3),
        completedProjects: Math.floor(Math.random() * 200) + 50,
        satisfaction: Math.floor(Math.random() * 10) + 90,
      }
    })
  } catch (error) {
    console.error("Unexpected error fetching services:", error)
    return []
  }
}

export async function fetchCategories(): Promise<{ id: string; name: string }[]> {
  try {
    const supabase = createClientDatabaseClient()

    const { data, error } = await supabase.from("categories").select("id, name").order("name")

    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }

    return data
  } catch (error) {
    console.error("Unexpected error fetching categories:", error)
    return []
  }
}

export async function saveUserPreferences(userId: string, preferences: Partial<UserPreferenceModel>): Promise<boolean> {
  try {
    const supabase = createClientDatabaseClient()

    // Convert Maps to objects for storage
    const preferencesObj = {
      ...preferences,
      categories: preferences.categories ? Object.fromEntries(preferences.categories) : undefined,
      requirements: preferences.requirements
        ? {
            ...preferences.requirements,
            implicit: preferences.requirements.implicit
              ? Object.fromEntries(preferences.requirements.implicit)
              : undefined,
          }
        : undefined,
    }

    const { error } = await supabase.from("user_preferences").upsert({
      user_id: userId,
      preferences: preferencesObj,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving user preferences:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Unexpected error saving user preferences:", error)
    return false
  }
}

export async function fetchUserPreferences(userId: string): Promise<Partial<UserPreferenceModel> | null> {
  try {
    const supabase = createClientDatabaseClient()

    const { data, error } = await supabase.from("user_preferences").select("preferences").eq("user_id", userId).single()

    if (error) {
      if (error.code !== "PGRST116") {
        // PGRST116 is "no rows returned" error
        console.error("Error fetching user preferences:", error)
      }
      return null
    }

    if (!data || !data.preferences) {
      return null
    }

    // Convert objects back to Maps
    const preferences = data.preferences as any

    return {
      ...preferences,
      categories: preferences.categories ? new Map(Object.entries(preferences.categories)) : new Map(),
      requirements: preferences.requirements
        ? {
            ...preferences.requirements,
            implicit: preferences.requirements.implicit
              ? new Map(Object.entries(preferences.requirements.implicit))
              : new Map(),
          }
        : {
            explicit: [],
            implicit: new Map(),
            dealBreakers: [],
          },
    }
  } catch (error) {
    console.error("Unexpected error fetching user preferences:", error)
    return null
  }
}

export async function logMatchmakerInteraction(userId: string, interactionType: string, details: any): Promise<void> {
  try {
    const supabase = createClientDatabaseClient()

    await supabase.from("matchmaker_interactions").insert({
      user_id: userId,
      interaction_type: interactionType,
      details,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error logging matchmaker interaction:", error)
  }
}
