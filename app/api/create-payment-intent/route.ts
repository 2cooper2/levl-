export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { createPaymentIntent } from "@/app/actions/payment-actions"
import { requireAuth } from "@/lib/api-auth"

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  try {
    // Parse the request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { amount, serviceId, providerId, description } = body

    // Basic validation
    if (!amount || !serviceId || !providerId) {
      return NextResponse.json(
        {
          error:
            `Missing required fields: ${!amount ? "amount" : ""} ${!serviceId ? "serviceId" : ""} ${!providerId ? "providerId" : ""}`.trim(),
        },
        { status: 400 },
      )
    }

    // Validate amount (must be positive number)
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    console.log("Creating payment intent with:", { amount, serviceId, providerId, description })

    // Create a payment intent
    const result = await createPaymentIntent({
      amount,
      serviceId,
      providerId,
      description: description || `Payment for service ${serviceId}`,
    })

    if (result.error) {
      console.error("Error creating payment intent:", result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
      isConnectedAccount: result.isConnectedAccount,
    })
  } catch (error: any) {
    console.error("Error in create-payment-intent API:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
