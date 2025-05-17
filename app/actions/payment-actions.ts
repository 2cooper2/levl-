"use server"

import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { randomUUID } from "crypto"

// Initialize Stripe with the secret key
let stripe: Stripe | null = null
try {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  if (!stripeSecretKey) {
    console.error("STRIPE_SECRET_KEY is not set")
  } else {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    })
  }
} catch (error) {
  console.error("Failed to initialize Stripe:", error)
  // We'll handle this in the functions that use stripe
}

// Environment flag to enable direct payments for testing
const ENABLE_DIRECT_PAYMENTS = true // Set to true for testing

async function getTransactionHistory(
  userId: string,
  role: string,
  limit: number,
  offset: number,
): Promise<{ transactions: any[]; total: number; error?: string }> {
  try {
    const supabase = createServerClient({ cookies })
    if (!supabase) {
      throw new Error("Could not connect to database")
    }

    let query = supabase
      .from("transactions")
      .select("*", { count: "exact" })
      .order("transaction_created_at", { ascending: false })

    if (role === "provider") {
      query = query.eq("provider_id", userId)
    } else {
      query = query.eq("client_id", userId)
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching transaction history:", error)
      return { transactions: [], total: 0, error: error.message || "Failed to fetch transaction history" }
    }

    return { transactions: data || [], total: count || 0 }
  } catch (error: any) {
    console.error("Error in getTransactionHistory:", error)
    return { transactions: [], total: 0, error: error.message || "An unexpected error occurred" }
  }
}

async function createConnectedAccount(userId: string, email: string): Promise<{ accountId?: string; error?: string }> {
  try {
    if (!stripe) {
      throw new Error("Stripe is not initialized")
    }

    const account = await stripe.accounts.create({
      type: "express",
      email: email,
      metadata: {
        userId: userId,
      },
    })

    const supabase = createServerClient({ cookies })
    if (!supabase) {
      throw new Error("Could not connect to database")
    }

    const { error } = await supabase.from("stripe_connect_accounts").insert({
      account_owner_reference: userId,
      stripe_account_reference: account.id,
      has_charges_enabled: false,
      has_payouts_enabled: false,
      account_created_at: new Date().toISOString(),
      account_updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error creating connected account:", error)
      return { error: error.message || "Failed to create connected account" }
    }

    return { accountId: account.id }
  } catch (error: any) {
    console.error("Error creating connected account:", error)
    return { error: error.message || "Failed to create connected account" }
  }
}

async function createAccountLink(accountId: string, refreshUrl: string): Promise<{ url?: string; error?: string }> {
  try {
    if (!stripe) {
      throw new Error("Stripe is not initialized")
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: refreshUrl,
      type: "account_onboarding",
    })

    return { url: accountLink.url }
  } catch (error: any) {
    console.error("Error creating account link:", error)
    return { error: error.message || "Failed to create account link" }
  }
}

async function getConnectedAccountId(userId: string): Promise<string | null> {
  try {
    const supabase = createServerClient({ cookies })
    if (!supabase) {
      throw new Error("Failed to create Supabase client")
    }

    // Try to get from stripe_connect_accounts first (new schema)
    const { data, error } = await supabase
      .from("stripe_connect_accounts")
      .select("stripe_account_reference")
      .eq("account_owner_reference", userId)
      .eq("has_charges_enabled", true)
      .single()

    if (data) {
      return data.stripe_account_reference
    }

    // If not found or error, try the connect_accounts table (old schema)
    const { data: oldData, error: oldError } = await supabase
      .from("connect_accounts")
      .select("stripe_account_id")
      .eq("user_id", userId)
      .single()

    if (oldData) {
      return oldData.stripe_account_id
    }

    console.log(`No enabled connected account found for provider ${userId}`)
    return null
  } catch (error) {
    console.error("Error getting connected account ID:", error)
    return null
  }
}

async function getConnectedAccountStatus(userId: string): Promise<{
  isConnected: boolean
  accountId?: string
  detailsSubmitted?: boolean
  chargesEnabled?: boolean
  payoutsEnabled?: boolean
}> {
  try {
    const supabase = createServerClient({ cookies })
    if (!supabase) {
      throw new Error("Could not connect to database")
    }

    const { data, error } = await supabase
      .from("stripe_connect_accounts")
      .select("*")
      .eq("account_owner_reference", userId)
      .single()

    if (error) {
      console.error("Error fetching connected account status:", error)
      return { isConnected: false }
    }

    if (!data) {
      return { isConnected: false }
    }

    return {
      isConnected: true,
      accountId: data.stripe_account_reference,
      detailsSubmitted: data.has_details_submitted,
      chargesEnabled: data.has_charges_enabled,
      payoutsEnabled: data.has_payouts_enabled,
    }
  } catch (error) {
    console.error("Error in getConnectedAccountStatus:", error)
    return { isConnected: false }
  }
}

async function createDashboardLink(accountId: string): Promise<{ url?: string; error?: string }> {
  try {
    if (!stripe) {
      throw new Error("Stripe is not initialized")
    }

    const dashboardLink = await stripe.accounts.createLoginLink(accountId)
    return { url: dashboardLink.url }
  } catch (error: any) {
    console.error("Error creating dashboard link:", error)
    return { error: error.message || "Failed to create dashboard link" }
  }
}

async function updateConnectedAccountStatus(userId: string, accountId: string): Promise<void> {
  try {
    if (!stripe) {
      throw new Error("Stripe is not initialized")
    }

    const account = await stripe.accounts.retrieve(accountId)

    const supabase = createServerClient({ cookies })
    if (!supabase) {
      throw new Error("Could not connect to database")
    }

    const { error } = await supabase
      .from("stripe_connect_accounts")
      .update({
        has_details_submitted: account.details_submitted,
        has_charges_enabled: account.charges_enabled,
        has_payouts_enabled: account.payouts_enabled,
        account_updated_at: new Date().toISOString(),
      })
      .eq("account_owner_reference", userId)

    if (error) {
      console.error("Error updating connected account status:", error)
    }
  } catch (error) {
    console.error("Error updating connected account status:", error)
  }
}

async function updateTransactionStatus(
  paymentIntentId: string,
  status: string,
  errorMessage?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient({ cookies })
    if (!supabase) {
      throw new Error("Could not connect to database")
    }

    // First try the payment_transactions table (new schema)
    const updateData: any = {
      payment_status: status,
      transaction_updated_at: new Date().toISOString(),
    }

    // Add error details if provided
    if (errorMessage) {
      updateData.error_details = errorMessage
    }

    // Try to update in payment_transactions table
    const { error } = await supabase
      .from("payment_transactions")
      .update(updateData)
      .eq("stripe_payment_intent_id", paymentIntentId)

    // If that fails, try the transactions table (old schema)
    if (error) {
      console.log("Trying to update in transactions table instead:", error)

      const oldUpdateData: any = {
        status: status,
        updated_at: new Date().toISOString(),
      }

      if (errorMessage) {
        oldUpdateData.error_message = errorMessage
      }

      const { error: oldError } = await supabase
        .from("transactions")
        .update(oldUpdateData)
        .eq("payment_intent_id", paymentIntentId)

      if (oldError) {
        console.error("Error updating transaction status in both tables:", oldError)
        return { success: false, error: oldError.message || "Failed to update transaction status" }
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error updating transaction status:", error)
    return { success: false, error: error.message || "Failed to update transaction status" }
  }
}

async function createPaymentIntent({
  amount,
  serviceId,
  providerId,
  description,
}: {
  amount: number
  serviceId: string
  providerId: string
  description: string
}): Promise<{
  clientSecret?: string
  paymentIntentId?: string
  isConnectedAccount?: boolean
  needsOnboarding?: boolean
  error?: string
}> {
  try {
    if (!stripe) {
      throw new Error("Stripe is not initialized")
    }

    const supabase = createServerClient({ cookies })
    if (!supabase) {
      throw new Error("Could not connect to database")
    }

    // Check if the provider has a connected Stripe account
    const connectedAccountId = await getConnectedAccountId(providerId)
    const isConnectedAccount = !!connectedAccountId

    // Create payment intent parameters
    const params: Stripe.PaymentIntentCreateParams = {
      amount: amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        serviceId: serviceId,
        providerId: providerId,
        description: description,
      },
    }

    // If provider has a connected account, use it
    if (connectedAccountId) {
      console.log(`Using connected account ${connectedAccountId} for provider ${providerId}`)
      params.application_fee_amount = Math.round(amount * 0.05) // 5% platform fee
      params.transfer_data = {
        destination: connectedAccountId,
      }
    } else {
      // For testing: If direct payments are enabled, proceed without a connected account
      if (!ENABLE_DIRECT_PAYMENTS) {
        console.warn(`Provider ${providerId} has no connected Stripe account and direct payments are disabled.`)
        return { needsOnboarding: true, error: "Provider needs to connect their Stripe account" }
      }

      console.warn(`Provider ${providerId} has no connected Stripe account. Using direct payment for testing.`)
      // No transfer_data for direct payments
    }

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create(params)

    // Generate a transaction ID
    const transactionId = randomUUID()

    // Store payment intent in database - try payment_transactions first
    try {
      const { error } = await supabase.from("payment_transactions").insert({
        transaction_id: transactionId,
        stripe_payment_intent_id: paymentIntent.id,
        service_reference_id: serviceId,
        provider_reference_id: providerId,
        amount_cents: amount,
        currency_code: "usd",
        payment_status: paymentIntent.status,
        payment_description: description,
        transaction_created_at: new Date().toISOString(),
        transaction_updated_at: new Date().toISOString(),
      })

      if (error) {
        console.warn("Error storing in payment_transactions, trying transactions table:", error)

        // Try the transactions table as fallback
        const { error: oldError } = await supabase.from("transactions").insert({
          id: transactionId,
          payment_intent_id: paymentIntent.id,
          service_id: serviceId,
          user_id: providerId,
          amount: amount,
          currency: "usd",
          status: "pending",
          description: description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (oldError) {
          console.error("Error storing payment intent in both tables:", oldError)
          // Continue anyway - we don't want to fail the payment just because of DB issues
        }
      }
    } catch (dbError) {
      console.error("Database error when storing payment intent:", dbError)
      // Continue anyway - we don't want to fail the payment just because of DB issues
    }

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
      isConnectedAccount: isConnectedAccount,
    }
  } catch (error: any) {
    console.error("Error creating payment intent:", error)
    return { error: error.message || "Failed to create payment intent" }
  }
}

// Export all functions
export {
  getTransactionHistory,
  createConnectedAccount,
  createAccountLink,
  getConnectedAccountId,
  getConnectedAccountStatus,
  createDashboardLink,
  updateConnectedAccountStatus,
  updateTransactionStatus,
  createPaymentIntent,
}
