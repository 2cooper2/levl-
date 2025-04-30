import { NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
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
        break

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`Payment failed: ${failedPaymentIntent.last_payment_error?.message}`)
        break

      // Connect-specific event handlers
      case "account.updated":
        const account = event.data.object as Stripe.Account
        console.log(`Connected account ${account.id} was updated`)
        break

      case "account.application.authorized":
        const authorizedAccount = event.data.object as Stripe.Account
        console.log(`Connected account ${authorizedAccount.id} was authorized`)
        break

      case "account.application.deauthorized":
        const deauthorizedAccount = event.data.object as Stripe.Account
        console.log(`Connected account ${deauthorizedAccount.id} was deauthorized`)
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

// Helper functions for webhook handlers - simplified to avoid database errors
async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Processing successful payment: ${paymentIntent.id}`)
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Processing failed payment: ${paymentIntent.id}`)
}

async function updateConnectedAccountStatus(account: Stripe.Account) {
  console.log(`Updating connected account status: ${account.id}`)
}

async function markAccountAsAuthorized(account: Stripe.Account) {
  console.log(`Marking account as authorized: ${account.id}`)
}

async function markAccountAsDeauthorized(account: Stripe.Account) {
  console.log(`Marking account as deauthorized: ${account.id}`)
}
