import Stripe from "stripe"

// Initialize Stripe with the secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ""
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""

// Create a Stripe instance
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
})

// Platform fee percentage (10%)
const PLATFORM_FEE_PERCENT = 10

/**
 * Format amount for display (e.g., 1000 -> $10.00)
 */
export function formatAmountForDisplay(amount: number, currency = "USD"): string {
  const numberFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  })
  return numberFormat.format(amount / 100)
}

/**
 * Format amount for Stripe (e.g., $10.00 -> 1000)
 */
export function formatAmountForStripe(amount: number, currency = "USD"): number {
  const currencies = ["JPY", "KRW", "VND"]
  return currencies.includes(currency.toUpperCase()) ? Math.round(amount) : Math.round(amount * 100)
}

/**
 * Calculate platform fee amount
 */
export function calculatePlatformFee(amount: number): number {
  return Math.round((amount * PLATFORM_FEE_PERCENT) / 100)
}

/**
 * Create a Stripe Connect account for a service provider
 */
export async function createConnectAccount(email: string, name: string) {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      email,
      business_type: "individual",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name,
      },
    })

    return { success: true, accountId: account.id }
  } catch (error) {
    console.error("Error creating Connect account:", error)
    return { success: false, error }
  }
}

/**
 * Create an account link for onboarding
 */
export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    })

    return { success: true, url: accountLink.url }
  } catch (error) {
    console.error("Error creating account link:", error)
    return { success: false, error }
  }
}

/**
 * Retrieve a Connect account
 */
export async function retrieveConnectAccount(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId)
    return {
      success: true,
      account: {
        id: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      },
    }
  } catch (error) {
    console.error("Error retrieving Connect account:", error)
    return { success: false, error }
  }
}

/**
 * Create a payment intent for a service
 */
export async function createPaymentIntent(
  amount: number,
  currency = "usd",
  connectAccountId: string,
  metadata: Record<string, string> = {},
) {
  try {
    // Calculate platform fee
    const applicationFeeAmount = calculatePlatformFee(amount)

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: connectAccountId,
      },
      metadata,
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return { success: false, error }
  }
}

/**
 * Create a customer in Stripe
 */
export async function createCustomer(email: string, name: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    })
    return { success: true, customerId: customer.id }
  } catch (error) {
    console.error("Error creating customer:", error)
    return { success: false, error }
  }
}

export { stripe, stripePublishableKey }
