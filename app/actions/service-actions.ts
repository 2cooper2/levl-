"use server"

import { createServerDatabaseClient } from "@/lib/database"
import { revalidatePath } from "next/cache"

export async function createService(formData: FormData) {
  try {
    const supabase = createServerDatabaseClient()
    if (!supabase) {
      return { error: "Database connection failed" }
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "You must be logged in to create a service" }
    }

    // Check if user is a provider
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || !userProfile) {
      return { error: "User profile not found" }
    }

    if (userProfile.role !== "provider" && userProfile.role !== "admin") {
      return { error: "Only providers can create services" }
    }

    // Extract form data
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const categoryId = formData.get("categoryId") as string
    const basePrice = Number.parseInt(formData.get("basePrice") as string)
    const currency = (formData.get("currency") as string) || "USD"
    const deliveryTime = formData.get("deliveryTime") as string

    // Validate required fields
    if (!title || !description || isNaN(basePrice)) {
      return { error: "Please fill in all required fields" }
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")
      .concat("-", Math.floor(Math.random() * 1000).toString())

    // Insert service
    const { data: service, error: insertError } = await supabase
      .from("services")
      .insert({
        title,
        slug,
        description,
        provider_id: user.id,
        category_id: categoryId || null,
        base_price: basePrice,
        currency,
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
      return { error: insertError.message }
    }

    // Revalidate the services page
    revalidatePath("/dashboard/services")
    revalidatePath("/explore")

    return { success: true, service }
  } catch (error: any) {
    console.error("Unexpected error in createService:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
}

export async function updateService(serviceId: string, formData: FormData) {
  try {
    const supabase = createServerDatabaseClient()
    if (!supabase) {
      return { error: "Database connection failed" }
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "You must be logged in to update a service" }
    }

    // Get the service to check ownership
    const { data: existingService, error: serviceError } = await supabase
      .from("services")
      .select("provider_id")
      .eq("id", serviceId)
      .single()

    if (serviceError) {
      if (serviceError.code === "PGRST116") {
        return { error: "Service not found" }
      }
      console.error("Error fetching service:", serviceError)
      return { error: serviceError.message }
    }

    // Check if user is the owner or an admin
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return { error: profileError.message }
    }

    if (existingService.provider_id !== user.id && userProfile.role !== "admin") {
      return { error: "You do not have permission to update this service" }
    }

    // Extract form data
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const categoryId = formData.get("categoryId") as string
    const basePrice = Number.parseInt(formData.get("basePrice") as string)
    const currency = (formData.get("currency") as string) || "USD"
    const deliveryTime = formData.get("deliveryTime") as string
    const isActive = formData.get("isActive") === "true"

    // Validate required fields
    if (!title || !description || isNaN(basePrice)) {
      return { error: "Please fill in all required fields" }
    }

    const updateData: any = {
      title,
      description,
      category_id: categoryId || null,
      base_price: basePrice,
      currency,
      delivery_time: deliveryTime || null,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    }

    // Only admins can update featured status
    if (userProfile.role === "admin" && formData.has("isFeatured")) {
      updateData.is_featured = formData.get("isFeatured") === "true"
    }

    // Update service
    const { data: updatedService, error: updateError } = await supabase
      .from("services")
      .update(updateData)
      .eq("id", serviceId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating service:", updateError)
      return { error: updateError.message }
    }

    // Revalidate the services page
    revalidatePath("/dashboard/services")
    revalidatePath(`/services/${serviceId}`)
    revalidatePath("/explore")

    return { success: true, service: updatedService }
  } catch (error: any) {
    console.error("Unexpected error in updateService:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
}

export async function deleteService(serviceId: string) {
  try {
    const supabase = createServerDatabaseClient()
    if (!supabase) {
      return { error: "Database connection failed" }
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "You must be logged in to delete a service" }
    }

    // Get the service to check ownership
    const { data: existingService, error: serviceError } = await supabase
      .from("services")
      .select("provider_id")
      .eq("id", serviceId)
      .single()

    if (serviceError) {
      if (serviceError.code === "PGRST116") {
        return { error: "Service not found" }
      }
      console.error("Error fetching service:", serviceError)
      return { error: serviceError.message }
    }

    // Check if user is the owner or an admin
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return { error: profileError.message }
    }

    if (existingService.provider_id !== user.id && userProfile.role !== "admin") {
      return { error: "You do not have permission to delete this service" }
    }

    // Delete the service
    const { error: deleteError } = await supabase.from("services").delete().eq("id", serviceId)

    if (deleteError) {
      console.error("Error deleting service:", deleteError)
      return { error: deleteError.message }
    }

    // Revalidate the services page
    revalidatePath("/dashboard/services")
    revalidatePath("/explore")

    return { success: true }
  } catch (error: any) {
    console.error("Unexpected error in deleteService:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
}
