"use server"

import { stripe } from "@/lib/stripe"

export async function createServicePayment(serviceId: string, userId: string, amount: number) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        serviceId: serviceId,
        userId: userId,
      },
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error: any) {
    console.error("Error creating service payment:", error)
    return {
      success: false,
      error: error.message || "Failed to create payment",
    }
  }
}

export async function generateOnboardingLink(userId: string, returnUrl: string) {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: userId, // Use the user ID as the email for now
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { userId: userId },
    })

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/payments/connect`,
      return_url: returnUrl,
      type: "account_onboarding",
    })

    return {
      success: true,
      url: accountLink.url,
    }
  } catch (error: any) {
    console.error("Error generating onboarding link:", error)
    return {
      success: false,
      error: error.message || "Failed to generate link",
    }
  }
}

export async function createProviderConnectAccount(userId: string, email: string, name: string) {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: { userId: userId },
    })

    return {
      success: true,
      accountId: account.id,
    }
  } catch (error: any) {
    console.error("Error creating connect account:", error)
    return {
      success: false,
      error: error.message || "Failed to create account",
    }
  }
}

export async function getConnectAccountStatus(accountId: string) {
  try {
    const account = await stripe.accounts.retrieve(accountId)
    return {
      exists: true,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    }
  } catch (error: any) {
    console.error("Error getting account status:", error)
    return {
      success: false,
      error: error.message || "Failed to get status",
    }
  }
}

export async function getUserPayments(userId: string, role: "client" | "provider") {
  try {
    // Mock successful response
    return {
      success: true,
      payments: [],
    }
  } catch (error: any) {
    console.error("Error getting payments:", error)
    return {
      success: false,
      error: error.message || "Failed to get payments",
    }
  }
}

export async function updatePaymentStatus(paymentIntentId: string, status: string) {
  try {
    // Mock successful response
    return {
      success: true,
    }
  } catch (error: any) {
    console.error("Error updating payment status:", error)
    return {
      success: false,
      error: error.message || "Failed to update status",
    }
  }
}
