import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase-server"
import { randomUUID } from "crypto"

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

// Get the webhook secret from environment variables
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature")

  if (!signature || !webhookSecret) {
    console.error("Missing signature or webhook secret")
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  // Handle the event
  try {
    console.log(`Processing webhook event: ${event.type}`)

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handleSuccessfulPayment(paymentIntent)
        break

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent
        await handleFailedPayment(failedPaymentIntent)
        break

      case "payment_intent.canceled":
        const canceledPaymentIntent = event.data.object as Stripe.PaymentIntent
        await handleCanceledPayment(canceledPaymentIntent)
        break

      // Connect-specific event handlers
      case "account.updated":
        const account = event.data.object as Stripe.Account
        await updateConnectedAccountStatus(account)
        break

      case "account.application.authorized":
        const authorizedAccount = event.data.object as Stripe.Account
        await markAccountAsAuthorized(authorizedAccount)
        break

      case "account.application.deauthorized":
        const deauthorizedAccount = event.data.object as Stripe.Account
        await markAccountAsDeauthorized(deauthorizedAccount)
        break

      // Payout events
      case "payout.created":
        const createdPayout = event.data.object as Stripe.Payout
        await handlePayoutCreated(createdPayout)
        break

      case "payout.paid":
        const paidPayout = event.data.object as Stripe.Payout
        await handlePayoutPaid(paidPayout)
        break

      case "payout.failed":
        const failedPayout = event.data.object as Stripe.Payout
        await handlePayoutFailed(failedPayout)
        break

      default:
        // Log unexpected event type
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error(`Error handling webhook: ${err.message}`)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

// Helper functions for webhook handlers
async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Processing successful payment: ${paymentIntent.id}`)

  try {
    const supabase = createServerClient()
    if (!supabase) {
      throw new Error("Could not connect to database")
    }

    // Extract metadata from the payment intent
    const { serviceId, providerId, description } = paymentIntent.metadata || {}

    if (!serviceId || !providerId) {
      console.warn(`Missing metadata in payment intent ${paymentIntent.id}`)
      return
    }

    // Check if transaction already exists to prevent duplicates
    const { data: existingTransaction } = await supabase
      .from("transactions")
      .select("id")
      .eq("payment_intent_id", paymentIntent.id)
      .single()

    if (existingTransaction) {
      console.log(`Transaction for payment intent ${paymentIntent.id} already exists`)
      return
    }

    // Create transaction record
    const { error: transactionError } = await supabase.from("transactions").insert({
      id: randomUUID(),
      payment_intent_id: paymentIntent.id,
      service_id: serviceId,
      provider_id: providerId,
      client_id: paymentIntent.metadata.clientId || null,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: "completed",
      description: description || "Service payment",
      payment_method: paymentIntent.payment_method_types?.[0] || "card",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (transactionError) {
      console.error("Error creating transaction record:", transactionError)
      return
    }

    // Create booking record if this is a service booking
    if (serviceId) {
      const { error: bookingError } = await supabase.from("bookings").insert({
        id: randomUUID(),
        service_id: serviceId,
        provider_id: providerId,
        client_id: paymentIntent.metadata.clientId || null,
        transaction_id: paymentIntent.id,
        status: "confirmed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (bookingError) {
        console.error("Error creating booking record:", bookingError)
      }
    }

    console.log(`Successfully recorded transaction for payment intent ${paymentIntent.id}`)
  } catch (error) {
    console.error("Error handling successful payment:", error)
  }
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Processing failed payment: ${paymentIntent.id}`)

  try {
    const supabase = createServerClient()
    if (!supabase) {
      throw new Error("Could not connect to database")
    }

    // Create or update transaction record
    const { data: existingTransaction } = await supabase
      .from("transactions")
      .select("id")
      .eq("payment_intent_id", paymentIntent.id)
      .single()

    if (existingTransaction) {
      // Update existing transaction
      const { error } = await supabase
        .from("transactions")
        .update({
          status: "failed",
          error_message: paymentIntent.last_payment_error?.message || "Payment failed",
          updated_at: new Date().toISOString(),
        })
        .eq("payment_intent_id", paymentIntent.id)

      if (error) {
        console.error("Error updating failed transaction:", error)
      }
    } else {
      // Create new transaction record
      const { error } = await supabase.from("transactions").insert({
        id: randomUUID(),
        payment_intent_id: paymentIntent.id,
        service_id: paymentIntent.metadata?.serviceId || null,
        provider_id: paymentIntent.metadata?.providerId || null,
        client_id: paymentIntent.metadata?.clientId || null,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: "failed",
        error_message: paymentIntent.last_payment_error?.message || "Payment failed",
        description: paymentIntent.metadata?.description || "Failed service payment",
        payment_method: paymentIntent.payment_method_types?.[0] || "card",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error creating failed transaction record:", error)
      }
    }
  } catch (error) {
    console.error("Error handling failed payment:", error)
  }
}

async function handleCanceledPayment(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Processing canceled payment: ${paymentIntent.id}`)

  try {
    const supabase = createServerClient()
    if (!supabase) {
      throw new Error("Could not connect to database")
    }

    // Create or update transaction record
    const { data: existingTransaction } = await supabase
      .from("transactions")
      .select("id")
      .eq("payment_intent_id", paymentIntent.id)
      .single()

    if (existingTransaction) {
      // Update existing transaction
      const { error } = await supabase
        .from("transactions")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("payment_intent_id", paymentIntent.id)

      if (error) {
        console.error("Error updating canceled transaction:", error)
      }
    } else {
      // Create new transaction record
      const { error } = await supabase.from("transactions").insert({
        id: randomUUID(),
        payment_intent_id: paymentIntent.id,
        service_id: paymentIntent.metadata?.serviceId || null,
        provider_id: paymentIntent.metadata?.providerId || null,
        client_id: paymentIntent.metadata?.clientId || null,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: "canceled",
        description: paymentIntent.metadata?.description || "Canceled service payment",
        payment_method: paymentIntent.payment_method_types?.[0] || "card",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error creating canceled transaction record:", error)
      }
    }
  } catch (error) {
    console.error("Error handling canceled payment:", error)
  }
}

async function updateConnectedAccountStatus(account: Stripe.Account) {
  console.log(`Updating connected account status: ${account.id}`)

  try {
    const supabase = createServerClient()
    if (!supabase) {
      throw new Error("Could not connect to database")
    }

    // Find the user associated with this Stripe account
    const { data: connectAccount, error: fetchError } = await supabase
      .from("connect_accounts")
      .select("user_id")
      .eq("stripe_account_id", account.id)
      .single()

    if (fetchError || !connectAccount) {
      console.error("Error finding user for connected account:", fetchError)
      return
    }

    // Update the account status
    const { error: updateError } = await supabase
      .from("connect_accounts")
      .update({
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_account_id", account.id)

    if (updateError) {
      console.error("Error updating connected account status:", updateError)
    }
  } catch (error) {
    console.error("Error updating connected account status:", error)
  }
}

async function markAccountAsAuthorized(account: Stripe.Account) {
  console.log(`Marking account as authorized: ${account.id}`)

  try {
    const supabase = createServerClient()
    if (!supabase) {
      throw new Error("Could not connect to database")
    }

    // Update the account status
    const { error } = await supabase
      .from("connect_accounts")
      .update({
        is_authorized: true,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_account_id", account.id)

    if (error) {
      console.error("Error marking account as authorized:", error)
    }
  } catch (error) {
    console.error("Error marking account as authorized:", error)
  }
}

async function markAccountAsDeauthorized(account: Stripe.Account) {
  console.log(`Marking account as deauthorized: ${account.id}`)

  try {
    const supabase = createServerClient()
    if (!supabase) {
      throw new Error("Could not connect to database")
    }

    // Update the account status
    const { error } = await supabase
      .from("connect_accounts")
      .update({
        is_authorized: false,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_account_id", account.id)

    if (error) {
      console.error("Error marking account as deauthorized:", error)
    }
  } catch (error) {
    console.error("Error marking account as deauthorized:", error)
  }
}

async function handlePayoutCreated(payout: Stripe.Payout) {
  console.log(`Processing payout created: ${payout.id}`)

  try {
    const supabase = createServerClient()
    if (!supabase) {
      throw new Error("Could not connect to database")
    }

    // Find the user associated with this Stripe account
    const { data: connectAccount, error: fetchError } = await supabase
      .from("connect_accounts")
      .select("user_id")
      .eq("stripe_account_id", payout.destination)
      .single()

    if (fetchError || !connectAccount) {
      console.error("Error finding user for payout:", fetchError)
      return
    }

    // Create payout record
    const { error } = await supabase.from("payouts").insert({
      id: randomUUID(),
      payout_id: payout.id,
      provider_id: connectAccount.user_id,
      amount: payout.amount,
      currency: payout.currency,
      status: payout.status,
      arrival_date: new Date(payout.arrival_date * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error creating payout record:", error)
    }
  } catch (error) {
    console.error("Error handling payout created:", error)
  }
}

async function handlePayoutPaid(payout: Stripe.Payout) {
  console.log(`Processing payout paid: ${payout.id}`)

  try {
    const supabase = createServerClient()
    if (!supabase) {
      throw new Error("Could not connect to database")
    }

    // Update payout record
    const { error } = await supabase
      .from("payouts")
      .update({
        status: payout.status,
        updated_at: new Date().toISOString(),
      })
      .eq("payout_id", payout.id)

    if (error) {
      console.error("Error updating payout record:", error)
    }
  } catch (error) {
    console.error("Error handling payout paid:", error)
  }
}

async function handlePayoutFailed(payout: Stripe.Payout) {
  console.log(`Processing payout failed: ${payout.id}`)

  try {
    const supabase = createServerClient()
    if (!supabase) {
      throw new Error("Could not connect to database")
    }

    // Update payout record
    const { error } = await supabase
      .from("payouts")
      .update({
        status: payout.status,
        failure_message: payout.failure_message,
        updated_at: new Date().toISOString(),
      })
      .eq("payout_id", payout.id)

    if (error) {
      console.error("Error updating failed payout record:", error)
    }
  } catch (error) {
    console.error("Error handling payout failed:", error)
  }
}
