"use server"

import Stripe from "stripe"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  console.error("STRIPE_SECRET_KEY is not set")
  throw new Error("STRIPE_SECRET_KEY is not set")
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
})

export async function createPaymentIntent({
  amount,
  currency,
  metadata,
}: {
  amount: number
  currency: string
  metadata: {
    providerId: string
    hours: number
    projectDetails?: string
    serviceId?: string
  }
}) {
  try {
    console.log("Creating payment intent with:", { amount, currency, metadata })
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadata,
    })

    console.log("Payment intent created:", paymentIntent)

    return {
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error: any) {
    console.error("Error creating payment intent:", error)
    console.error("Error details:", error.stack, error.message, error.code)
    return {
      error: error.message || "Failed to create payment intent",
    }
  }
}
