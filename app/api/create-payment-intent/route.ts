import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getConnectedAccountId } from "@/app/actions/payment-actions"
import { ApiError, handleApiError } from "@/lib/api-error"

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

// Modify the POST function to handle errors better
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.serviceId || !body.description) {
      throw new ApiError("Missing required fields: serviceId and description are required", 400)
    }

    const { serviceId, description, providerId } = body

    // Fixed amount of $2.02 (202 cents)
    const amount = 202

    // Fixed platform fee of $0.02 (2 cents)
    const applicationFeeAmount = 2

    // Get the provider's connected account ID
    let connectedAccountId
    try {
      connectedAccountId = await getConnectedAccountId(providerId)
    } catch (error) {
      console.error("Error getting connected account ID:", error)
      connectedAccountId = null
      // Continue with direct payment
    }

    // Create payment intent parameters
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: amount,
      currency: "usd",
      // Include metadata about the service being purchased
      metadata: {
        serviceId,
        providerId: providerId || "unknown",
        description: description || "Service booking",
        serviceFee: "2.00",
        platformFee: "0.02",
      },
      // Enable automatic payment methods for the PaymentIntent
      automatic_payment_methods: {
        enabled: true,
      },
    }

    // If we have a connected account ID, use Stripe Connect
    if (connectedAccountId) {
      console.log("Using Stripe Connect with account:", connectedAccountId)

      // Add Connect-specific parameters
      paymentIntentParams.application_fee_amount = applicationFeeAmount
      paymentIntentParams.transfer_data = {
        destination: connectedAccountId,
      }
    } else {
      console.log("No connected account found for provider. Using direct payment.")
      // For development/testing purposes, we'll still create a payment intent
      // In production, you might want to handle this differently
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

    // Return the client secret to the client
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      isConnectedAccount: !!connectedAccountId,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
