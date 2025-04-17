import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase"
import { updateOrderStatus } from "@/app/actions/payment-actions"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature") || ""

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Update order status
        const supabase = createServerClient()
        const { data: order, error } = await supabase
          .from("orders")
          .select("id")
          .eq("payment_intent_id", paymentIntent.id)
          .single()

        if (error) {
          console.error("Error finding order:", error)
          return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        await updateOrderStatus(order.id, "paid")

        console.log(`Payment for order ${order.id} succeeded`)
        break

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent

        // Update order status
        const failedSubabase = createServerClient()
        const { data: failedOrder, error: failedError } = await failedSubabase
          .from("orders")
          .select("id")
          .eq("payment_intent_id", failedPaymentIntent.id)
          .single()

        if (failedError) {
          console.error("Error finding order:", failedError)
          return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        await updateOrderStatus(failedOrder.id, "failed")

        console.log(`Payment for order ${failedOrder.id} failed`)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
