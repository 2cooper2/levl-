import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  try {
    const { amount, serviceId } = await request.json()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount),
      currency: "usd",
      metadata: { serviceId },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (e: any) {
    return NextResponse.json({
      error: {
        message: e.message,
      },
    })
  }
}
