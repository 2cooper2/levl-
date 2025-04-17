import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { serviceId, amount, providerId, description } = await request.json()

    // For development/testing, return a mock response without trying to use Stripe
    return NextResponse.json({
      clientSecret: "mock_secret_for_development",
      paymentIntentId: "mock_payment_intent_id",
      isDevelopmentMode: true,
    })
  } catch (error: any) {
    console.error("Payment intent error:", error)
    return NextResponse.json({ error: error.message || "Failed to create payment intent" }, { status: 500 })
  }
}
