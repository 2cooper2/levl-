import { NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// Get the webhook secret from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature")

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`)

        // Here you would:
        // 1. Update your database to mark the order as paid
        // 2. Send confirmation emails
        // 3. Provision the service
        // 4. Update inventory, etc.

        break

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`Payment failed: ${failedPaymentIntent.last_payment_error?.message}`)

        // Here you would:
        // 1. Update your database to mark the payment as failed
        // 2. Notify the customer
        // 3. Take any necessary recovery actions

        break

      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error(`Error handling webhook: ${err.message}`)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
