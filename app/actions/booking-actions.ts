"use server"

import { createServerDatabaseClient } from "@/lib/database"
import { revalidatePath } from "next/cache"
import Stripe from "stripe"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export async function createBooking(formData: FormData) {
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
      return { error: "You must be logged in to book a service" }
    }

    // Extract form data
    const serviceId = formData.get("serviceId") as string
    const requirements = formData.get("requirements") as string

    if (!serviceId) {
      return { error: "Service ID is required" }
    }

    // Get service details
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*, provider:provider_id(*)")
      .eq("id", serviceId)
      .single()

    if (serviceError) {
      console.error("Error fetching service:", serviceError)
      return { error: "Service not found" }
    }

    // Check if user is trying to book their own service
    if (service.provider_id === user.id) {
      return { error: "You cannot book your own service" }
    }

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: service.base_price,
      currency: service.currency.toLowerCase(),
      metadata: {
        serviceId,
        providerId: service.provider_id,
        clientId: user.id,
      },
    })

    if (!paymentIntent || !paymentIntent.id) {
      return { error: "Failed to create payment intent" }
    }

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        id: crypto.randomUUID(),
        service_id: serviceId,
        provider_id: service.provider_id,
        client_id: user.id,
        payment_intent_id: paymentIntent.id,
        payment_status: "pending",
        status: "pending",
        requirements: requirements || null,
        price: service.base_price,
        currency: service.currency,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (bookingError) {
      console.error("Error creating booking:", bookingError)

      // Attempt to cancel the payment intent since booking creation failed
      try {
        await stripe.paymentIntents.cancel(paymentIntent.id)
      } catch (cancelError) {
        console.error("Error canceling payment intent:", cancelError)
      }

      return { error: "Failed to create booking" }
    }

    return {
      success: true,
      booking,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error: any) {
    console.error("Unexpected error in createBooking:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
}

export async function updateBookingStatus(bookingId: string, status: string) {
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
      return { error: "You must be logged in to update a booking" }
    }

    // Get the booking to check permissions
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("provider_id, client_id, status")
      .eq("id", bookingId)
      .single()

    if (bookingError) {
      console.error("Error fetching booking:", bookingError)
      return { error: "Booking not found" }
    }

    // Check if user is the provider or client
    if (booking.provider_id !== user.id && booking.client_id !== user.id) {
      return { error: "You do not have permission to update this booking" }
    }

    // Validate status transitions
    const validStatuses = ["pending", "confirmed", "in_progress", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return { error: "Invalid status" }
    }

    // Providers can confirm, start, or complete bookings
    // Clients can cancel bookings
    if (
      (user.id === booking.provider_id && ["confirmed", "in_progress", "completed"].includes(status)) ||
      (user.id === booking.client_id && status === "cancelled") ||
      // Allow admins to update any status (would need to check role)
      false
    ) {
      const { data: updatedBooking, error: updateError } = await supabase
        .from("bookings")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating booking:", updateError)
        return { error: updateError.message }
      }

      // Revalidate relevant paths
      revalidatePath("/dashboard/bookings")
      revalidatePath(`/bookings/${bookingId}`)

      return { success: true, booking: updatedBooking }
    } else {
      return { error: "You do not have permission to update to this status" }
    }
  } catch (error: any) {
    console.error("Unexpected error in updateBookingStatus:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
}
