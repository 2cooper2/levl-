import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerDatabaseClient } from "@/lib/database"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

// Get the webhook secret from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("stripe-signature")

    if (!signature || !webhookSecret) {
      console.error("Missing signature or webhook secret")
      return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
    }

    const body = await req.text()
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Error handling webhook:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const supabase = createServerDatabaseClient()
    if (!supabase) {
      console.error("Database connection failed")
      return
    }

    const { serviceId, providerId, clientId } = paymentIntent.metadata || {}

    if (!serviceId || !providerId) {
      console.error("Missing metadata in payment intent")
      return
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
      console.error("Error updating booking:", bookingError)
      return
    }

    // Create notification for provider
    await supabase.from("notifications").insert({
      id: crypto.randomUUID(),
      user_id: providerId,
      type: "booking_confirmed",
      title: "New Booking Confirmed",
      message: "You have a new confirmed booking. Payment has been received.",
      created_at: new Date().toISOString(),
    })

    // Create notification for client
    await supabase.from("notifications").insert({
      id: crypto.randomUUID(),
      user_id: clientId,
      type: "payment_successful",
      title: "Payment Successful",
      message: "Your payment has been processed successfully. Your booking is now confirmed.",
      created_at: new Date().toISOString(),
    })

    console.log(`Payment for booking with payment intent ${paymentIntent.id} succeeded`)
  } catch (error) {
    console.error("Error handling payment intent succeeded:", error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const supabase = createServerDatabaseClient()
    if (!supabase) {
      console.error("Database connection failed")
      return
    }

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
      console.error("Error updating booking:", bookingError)
      return
    }

    // Create notification for client
    if (clientId) {
      await supabase.from("notifications").insert({
        id: crypto.randomUUID(),
        user_id: clientId,
        type: "payment_failed",
        title: "Payment Failed",
        message: "Your payment could not be processed. Please try again or use a different payment method.",
        created_at: new Date().toISOString(),
      })
    }

    console.log(`Payment for booking with payment intent ${paymentIntent.id} failed`)
  } catch (error) {
    console.error("Error handling payment intent failed:", error)
  }
}
