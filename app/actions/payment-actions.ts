"use server"

import Stripe from "stripe"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  console.error("STRIPE_SECRET_KEY is not set")
  throw new Error("STRIPE_SECRET_KEY is not set")
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
})

// Get the connected account ID for a provider
export async function getConnectedAccountId(providerId: string) {
  try {
    // For demo purposes, return a mock connected account ID or null
    // This bypasses the need for the connect_accounts table
    console.log(`Demo mode: Simulating connected account lookup for provider ${providerId}`)

    // You can return null to use direct payment mode
    // Or return a mock ID for testing connected accounts
    return null // Direct payment mode

    /* Original code commented out due to missing table
    // Validate if providerId is in UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(providerId)) {
      console.warn(`Provider ID "${providerId}" is not a valid UUID format`)
      return null
    }

    const supabase = createServerClient()

    // Use .select() without .single() to handle cases where no rows are returned
    const { data, error } = await supabase
      .from("connect_accounts")
      .select("stripe_account_id")
      .eq("user_id", providerId)
      .limit(1)

    if (error) {
      console.error("Error fetching connected account:", error)
      return null
    }

    // Check if we have any data
    if (!data || data.length === 0) {
      console.log(`No connected account found for provider ${providerId}`)
      return null
    }

    // Return the first account ID
    return data[0].stripe_account_id || null
    */
  } catch (error) {
    console.error("Error getting connected account ID:", error)
    return null
  }
}

export async function createPaymentIntent({
  amount = 202, // Default to $2.02 (202 cents)
  currency = "usd",
  metadata,
}: {
  amount?: number
  currency?: string
  metadata: {
    providerId: string
    serviceId?: string
    description?: string
  }
}) {
  try {
    console.log("Creating payment intent with:", { amount, currency, metadata })

    // Get the provider's connected account ID
    const connectedAccountId = await getConnectedAccountId(metadata.providerId)

    // Calculate platform fee - fixed at $0.02 (2 cents)
    const applicationFeeAmount = 2

    // Create payment intent parameters
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: amount,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        serviceFee: ((amount - applicationFeeAmount) / 100).toFixed(2),
        platformFee: (applicationFeeAmount / 100).toFixed(2),
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

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

    console.log("Payment intent created:", paymentIntent.id)

    return {
      clientSecret: paymentIntent.client_secret,
      isConnectedAccount: !!connectedAccountId,
    }
  } catch (error: any) {
    console.error("Error creating payment intent:", error)
    console.error("Error details:", error.stack, error.message, error.code)
    return {
      error: error.message || "Failed to create payment intent",
    }
  }
}

// Get a service provider's connected account status
export async function getConnectedAccountStatus(providerId: string) {
  try {
    // For demo purposes, return a mock status
    return { isConnected: false }

    /* Original code commented out due to missing table
    // Validate if providerId is in UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(providerId)) {
      console.warn(`Provider ID "${providerId}" is not a valid UUID format`)
      return { isConnected: false }
    }

    const supabase = createServerClient()

    // Use .select() without .single() to handle cases where no rows are returned
    const { data, error } = await supabase
      .from("connect_accounts")
      .select("stripe_account_id, details_submitted, charges_enabled, payouts_enabled")
      .eq("user_id", providerId)
      .limit(1)

    if (error) {
      console.error("Error fetching connected account status:", error)
      return { isConnected: false }
    }

    // Check if we have any data
    if (!data || data.length === 0) {
      return { isConnected: false }
    }

    const accountData = data[0]

    if (accountData?.stripe_account_id) {
      try {
        // Verify the account status with Stripe
        const account = await stripe.accounts.retrieve(accountData.stripe_account_id)

        return {
          isConnected: true,
          accountId: accountData.stripe_account_id,
          detailsSubmitted: account.details_submitted,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
        }
      } catch (stripeError) {
        console.error("Error retrieving Stripe account:", stripeError)
        return { isConnected: false }
      }
    }

    return { isConnected: false }
    */
  } catch (error) {
    console.error("Error getting connected account status:", error)
    return { isConnected: false }
  }
}

// Create a connected account link for onboarding
export async function createAccountLink(connectedAccountId: string, returnUrl: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: connectedAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/connect/refresh`,
      return_url: returnUrl,
      type: "account_onboarding",
    })

    return { url: accountLink.url }
  } catch (error: any) {
    console.error("Error creating account link:", error)
    return { error: error.message || "Failed to create account link" }
  }
}

// Create a connected account
export async function createConnectedAccount(userId: string, email: string) {
  try {
    // Validate if userId is in UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return { error: "Invalid user ID format" }
    }

    // Create a new connected account
    const account = await stripe.accounts.create({
      type: "express", // Use 'express' for a simplified onboarding
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        userId: userId,
      },
    })

    // For demo purposes, return success without database operations
    return {
      accountId: account.id,
      success: true,
    }

    /* Original code commented out due to missing table
    // Store the account ID in the database
    const supabase = createServerClient()

    // First check if an account already exists for this user
    const { data } = await supabase.from("connect_accounts").select("id").eq("user_id", userId).limit(1)

    if (data && data.length > 0) {
      // Update existing account
      const { error } = await supabase
        .from("connect_accounts")
        .update({
          stripe_account_id: account.id,
          details_submitted: false,
          charges_enabled: false,
          payouts_enabled: false,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)

      if (error) {
        console.error("Error updating connected account:", error)
        throw error
      }
    } else {
      // Create new account
      const { error } = await supabase.from("connect_accounts").insert({
        id: randomUUID(),
        user_id: userId,
        stripe_account_id: account.id,
        details_submitted: false,
        charges_enabled: false,
        payouts_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error storing connected account:", error)
        throw error
      }
    }

    return {
      accountId: account.id,
      success: true,
    }
    */
  } catch (error: any) {
    console.error("Error creating connected account:", error)
    return { error: error.message || "Failed to create connected account" }
  }
}

// Update a connected account status
export async function updateConnectedAccountStatus(userId: string, accountId: string) {
  try {
    // For demo purposes, return mock success data
    return {
      success: true,
      detailsSubmitted: true,
      chargesEnabled: true,
      payoutsEnabled: true,
    }

    /* Original code commented out due to missing table
    // Validate if userId is in UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return { error: "Invalid user ID format" }
    }

    // Get the account details from Stripe
    const account = await stripe.accounts.retrieve(accountId)

    // Update the database with the latest status
    const supabase = createServerClient()
    const { error } = await supabase
      .from("connect_accounts")
      .update({
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (error) {
      console.error("Error updating connected account status:", error)
      throw error
    }

    return {
      success: true,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    }
    */
  } catch (error: any) {
    console.error("Error updating connected account status:", error)
    return { error: error.message || "Failed to update connected account status" }
  }
}

// Function to get a Stripe dashboard link for providers
export async function createDashboardLink(connectedAccountId: string) {
  try {
    const loginLink = await stripe.accounts.createLoginLink(connectedAccountId)
    return { url: loginLink.url }
  } catch (error: any) {
    console.error("Error creating dashboard link:", error)
    return { error: error.message || "Failed to create dashboard link" }
  }
}
