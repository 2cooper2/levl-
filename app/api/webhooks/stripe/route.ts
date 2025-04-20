import { NextResponse } from "next/server"
import Stripe from "stripe"
import { headers } from "next/headers"
import { createServerClient } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get("stripe-signature") as string

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object

  // Handle specific event types
  switch (event.type) {
    case "payment_intent.succeeded":
      console.log(`PaymentIntent for ${session.metadata.serviceId} was successful!`)
      // Then define and call a method to handle the successful payment intent.
      await handlePaymentIntentSucceeded(session)
      break
    case "payment_intent.payment_failed":
      console.log(`PaymentIntent failed for ${session.metadata.serviceId}`)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

async function handlePaymentIntentSucceeded(session: any) {
  // Extract relevant information from the session
  const serviceId = session.metadata.serviceId
  const userId = session.metadata.userId
  const amount = session.amount
  const paymentIntentId = session.id
  const packageName = session.metadata.packageName || null // Extract package name, if available
  const platformFee = session.application_fee_amount || 0

  // Log the extracted information
  console.log("Extracted information:", { serviceId, userId, amount, paymentIntentId, packageName })

  // Create Supabase client
  const supabase = createServerClient()

  if (!supabase) {
    console.error("Failed to create Supabase client")
    return {
      success: false,
      message: "Database connection error. Please try again later.",
    }
  }

  // Update the orders table with payment information
  const { data, error } = await supabase
    .from("orders")
    .insert([
      {
        service_id: serviceId,
        user_id: userId,
        amount: amount,
        payment_intent_id: paymentIntentId,
        status: "paid",
        package_name: packageName,
        platform_fee: platformFee,
      },
    ])
    .select()

  if (error) {
    console.error("Error inserting order:", error)
    return {
      success: false,
      message: "Failed to create order. Please try again.",
    }
  }

  console.log("Successfully created order:", data)

  // Add your logic here to send a confirmation email to the user
  // Example: Mock email sending
  console.log("Sending confirmation email to user...")
  // In a real application, you would use an email service like SendGrid or Mailgun here
  // to send a confirmation email to the user.
}
