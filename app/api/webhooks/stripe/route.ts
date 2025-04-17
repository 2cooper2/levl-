import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = headers().get("stripe-signature") || ""

    // This would normally verify the webhook signature
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "")

    // For our demo purposes, we'll just parse the JSON
    const event = JSON.parse(body)

    const supabase = createServerClient()

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object

        // Update the database with payment success
        // In a real implementation you would update your database
        console.log("Payment succeeded:", paymentIntent.id)

        // Create an order record
        // const { error } = await supabase.from("orders").insert({
        //   payment_intent_id: paymentIntent.id,
        //   amount: paymentIntent.amount,
        //   status: "completed",
        //   service_id: paymentIntent.metadata.serviceId,
        //   customer_id: paymentIntent.customer,
        //   provider_id: paymentIntent.transfer_data?.destination,
        //   created_at: new Date(),
        // })

        // if (error) {
        //   console.error("Error creating order:", error)
        // }

        break
      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object
        console.log("Payment failed:", failedPaymentIntent.id)

        // Update the order status to failed
        // await supabase
        //   .from("orders")
        //   .update({ status: "failed" })
        //   .eq("payment_intent_id", failedPaymentIntent.id)

        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
