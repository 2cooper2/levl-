import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

// Ensure the Stripe secret key is defined
if (!stripeSecretKey) {
  console.error("STRIPE_SECRET_KEY is not set")
  throw new Error("STRIPE_SECRET_KEY is not set")
}

// Initialize Stripe with the secret key
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  try {
    const { amount, serviceId, description } = await request.json()

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: { message: "Invalid amount" } }, { status: 400 })
    }

    // Create a PaymentIntent with the specified amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount),
      currency: "usd",
      // Include metadata about the service being purchased
      metadata: {
        serviceId,
        description: description || "Service booking",
      },
      // Enable automatic payment methods for the PaymentIntent
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Return the client secret to the client
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error: any) {
    console.error("Error creating payment intent:", error)
    let message = "Failed to create payment intent"
    if (error && typeof error === "object" && "message" in error) {
      message = error.message as string
    }
    return NextResponse.json({ error: { message: message } }, { status: 500 })
  }
}
