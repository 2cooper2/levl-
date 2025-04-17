import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  try {
    const { amount, serviceId, providerId, clientId } = await request.json()

    // Validate input
    if (!amount || !serviceId || !providerId || !clientId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the provider's connected account ID
    const supabase = createClient()
    const { data: connectAccount, error: accountError } = await supabase
      .from("connect_accounts")
      .select("stripe_account_id")
      .eq("user_id", providerId)
      .single()

    if (accountError || !connectAccount) {
      return NextResponse.json({ error: "Provider is not set up to receive payments" }, { status: 400 })
    }

    // Calculate platform fee (10%)
    const platformFee = Math.round(amount * 0.1)

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      application_fee_amount: platformFee,
      transfer_data: {
        destination: connectAccount.stripe_account_id,
      },
      metadata: {
        serviceId,
        providerId,
        clientId,
      },
    })

    // Store the payment intent in the database
    const { error: insertError } = await supabase.from("payments").insert({
      amount,
      currency: "usd",
      status: "pending",
      payment_intent_id: paymentIntent.id,
      client_id: clientId,
      provider_id: providerId,
      service_id: serviceId,
    })

    if (insertError) {
      console.error("Error storing payment:", insertError)
    }

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error: any) {
    console.error("Payment intent error:", error)
    return NextResponse.json({ error: error.message || "Failed to create payment intent" }, { status: 500 })
  }
}
