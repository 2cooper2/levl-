import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createRobustSupabaseServerClient } from "@/lib/supabase-robust-client"
import { ENV } from "@/lib/env"

// Initialize Stripe
let stripe: Stripe | null = null

try {
  const stripeSecretKey = ENV.STRIPE_SECRET_KEY()
  if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    })
  }
} catch (error) {
  console.error("Failed to initialize Stripe:", error)
}

export async function POST(req: Request) {
  // Verify Stripe is initialized
  if (!stripe) {
    console.error("Stripe not initialized")
    return NextResponse.json({ error: "Stripe integration not configured" }, { status: 500 })
  }

  try {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")
    const webhookSecret = ENV.STRIPE_WEBHOOK_SECRET()

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 })
    }

    if (!webhookSecret) {
      console.error("Missing webhook secret")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed:`, err)
      return NextResponse.json({ error: `Webhook signature verification failed` }, { status: 400 })
    }

    // Process the event
    let response: { message: string; success: boolean } = {
      message: "Unhandled event type",
      success: false,
    }

    try {
      switch (event.type) {
        case "payment_intent.succeeded":
          response = await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
          break
        case "payment_intent.payment_failed":
          response = await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
          break
        // Add other event types as needed
        default:
          console.log(`Unhandled event type ${event.type}`)
      }

      return NextResponse.json({
        received: true,
        type: event.type,
        ...response,
      })
    } catch (error) {
      console.error(`Error processing event ${event.type}:`, error)
      return NextResponse.json(
        {
          error: `Error processing event: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in webhook handler:", error)
    return NextResponse.json(
      {
        error: `Webhook handler failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
): Promise<{ message: string; success: boolean }> {
  try {
    const supabase = createRobustSupabaseServerClient()

    // Extract metadata
    const { serviceId, providerId, clientId } = paymentIntent.metadata || {}

    if (!serviceId || !providerId) {
      throw new Error(`Missing metadata in payment intent ${paymentIntent.id}`)
    }

    // Update booking status
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({
        payment_status: "completed",
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("payment_intent_id", paymentIntent.id)

    if (bookingError) {
      throw new Error(`Error updating booking: ${bookingError.message}`)
    }

    // Create notification for provider
    await supabase.from("notifications").insert({
      id: crypto.randomUUID?.() || `notification-${Date.now()}`,
      user_id: providerId,
      type: "booking_confirmed",
      title: "New Booking Confirmed",
      message: "You have a new confirmed booking. Payment has been received.",
      created_at: new Date().toISOString(),
    })

    // Create notification for client
    if (clientId) {
      await supabase.from("notifications").insert({
        id: crypto.randomUUID?.() || `notification-${Date.now()}`,
        user_id: clientId,
        type: "payment_successful",
        title: "Payment Successful",
        message: "Your payment has been processed successfully. Your booking is now confirmed.",
        created_at: new Date().toISOString(),
      })
    }

    return {
      message: `Payment for booking with payment intent ${paymentIntent.id} succeeded`,
      success: true,
    }
  } catch (error) {
    console.error("Error handling payment intent succeeded:", error)
    // Return success because Stripe needs a 200 response to prevent retries
    // But log the error so we can address it
    return {
      message: `Error processing successful payment: ${error instanceof Error ? error.message : "Unknown error"}`,
      success: false,
    }
  }
}

async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
): Promise<{ message: string; success: boolean }> {
  try {
    const supabase = createRobustSupabaseServerClient()

    // Extract client ID from metadata
    const { clientId } = paymentIntent.metadata || {}

    // Update booking status
    const { error: bookingError } = await supabase
      .from("bookings")
      .update({
        payment_status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("payment_intent_id", paymentIntent.id)

    if (bookingError) {
      throw new Error(`Error updating booking: ${bookingError.message}`)
    }

    // Create notification for client
    if (clientId) {
      await supabase.from("notifications").insert({
        id: crypto.randomUUID?.() || `notification-${Date.now()}`,
        user_id: clientId,
        type: "payment_failed",
        title: "Payment Failed",
        message: "Your payment could not be processed. Please try again or use a different payment method.",
        created_at: new Date().toISOString(),
      })
    }

    return {
      message: `Payment for booking with payment intent ${paymentIntent.id} failed`,
      success: true,
    }
  } catch (error) {
    console.error("Error handling payment intent failed:", error)
    // Return success because Stripe needs a 200 response to prevent retries
    return {
      message: `Error processing failed payment: ${error instanceof Error ? error.message : "Unknown error"}`,
      success: false,
    }
  }
}
