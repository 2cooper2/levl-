"use server"

import { stripe } from "@/lib/stripe"
import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

interface PaymentIntentParams {
  amount: number
  providerId: string
  hours: number
  projectDetails?: string
}

export async function createPaymentIntent({ amount, providerId, hours, projectDetails }: PaymentIntentParams) {
  try {
    // In a real app, you would validate the user is logged in here
    const supabase = createServerClient()

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents for Stripe
      currency: "usd",
      metadata: {
        providerId,
        hours: hours.toString(),
        projectDetails: projectDetails || "",
        type: "hourly_booking",
      },
    })

    // In a real app, you would store the payment intent in your database
    // const { error } = await supabase.from("bookings").insert({
    //   provider_id: providerId,
    //   client_id: userId,
    //   hours,
    //   amount,
    //   payment_intent_id: paymentIntent.id,
    //   status: "pending",
    //   project_details: projectDetails,
    // })

    return {
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error: any) {
    console.error("Error creating payment intent:", error)
    return {
      error: error.message || "Failed to create payment intent",
    }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const supabase = createServerClient()

    // In a real app, you would update the booking status in your database
    // const { error } = await supabase
    //   .from("bookings")
    //   .update({ status, updated_at: new Date().toISOString() })
    //   .eq("payment_intent_id", paymentIntentId)

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating payment status:", error)
    return { success: false, error: error.message }
  }
}
