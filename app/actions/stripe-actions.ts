"use server"

import { createServerClient } from "@/lib/supabase"
import { createConnectAccount, createAccountLink, retrieveConnectAccount } from "@/lib/stripe"
import { revalidatePath } from "next/cache"
import { stripe } from "@/lib/stripe"

/**
 * Create a Stripe Connect account for a provider
 */
export async function createProviderConnectAccount(userId: string, email: string, name: string) {
  try {
    const supabase = createServerClient()

    // Check if user already has a connect account
    const { data: existingAccount } = await supabase
      .from("connect_accounts")
      .select("stripe_account_id")
      .eq("user_id", userId)
      .single()

    if (existingAccount?.stripe_account_id) {
      return {
        success: true,
        accountId: existingAccount.stripe_account_id,
        existing: true,
      }
    }

    // Create Stripe Connect account
    const { success, accountId, error } = await createConnectAccount(email, name)

    if (!success || !accountId) {
      return { success: false, error }
    }

    // Save Connect account to database
    const { error: insertError } = await supabase.from("connect_accounts").insert({
      user_id: userId,
      stripe_account_id: accountId,
      charges_enabled: false,
      payouts_enabled: false,
      details_submitted: false,
    })

    if (insertError) {
      return { success: false, error: insertError }
    }

    return { success: true, accountId }
  } catch (error) {
    console.error("Error in createProviderConnectAccount:", error)
    return { success: false, error }
  }
}

/**
 * Generate onboarding link for Connect account
 */
export async function generateOnboardingLink(userId: string, returnUrl: string) {
  try {
    const supabase = createServerClient()

    // Get connect account
    const { data: connectAccount, error } = await supabase
      .from("connect_accounts")
      .select("stripe_account_id")
      .eq("user_id", userId)
      .single()

    if (error || !connectAccount) {
      return { success: false, error: error || new Error("Connect account not found") }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const refreshUrl = `${baseUrl}/dashboard/payments/refresh`

    const {
      success,
      url,
      error: linkError,
    } = await createAccountLink(connectAccount.stripe_account_id, refreshUrl, returnUrl)

    if (!success || !url) {
      return { success: false, error: linkError }
    }

    return { success: true, url }
  } catch (error) {
    console.error("Error in generateOnboardingLink:", error)
    return { success: false, error }
  }
}

/**
 * Get Connect account status
 */
export async function getConnectAccountStatus(userId: string) {
  try {
    const supabase = createServerClient()

    // Get connect account
    const { data: connectAccount, error } = await supabase
      .from("connect_accounts")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No account found
        return { exists: false }
      }
      return { success: false, error }
    }

    if (!connectAccount) {
      return { exists: false }
    }

    // Get latest account status from Stripe
    const { success, account, error: stripeError } = await retrieveConnectAccount(connectAccount.stripe_account_id)

    if (!success || !account) {
      return {
        exists: true,
        ...connectAccount,
      }
    }

    // Update account status in database if changed
    if (
      account.chargesEnabled !== connectAccount.charges_enabled ||
      account.payoutsEnabled !== connectAccount.payouts_enabled ||
      account.detailsSubmitted !== connectAccount.details_submitted
    ) {
      const { error: updateError } = await supabase
        .from("connect_accounts")
        .update({
          charges_enabled: account.chargesEnabled,
          payouts_enabled: account.payoutsEnabled,
          details_submitted: account.detailsSubmitted,
          updated_at: new Date().toISOString(),
        })
        .eq("id", connectAccount.id)

      if (updateError) {
        console.error("Error updating connect account status:", updateError)
      }
    }

    return {
      exists: true,
      id: connectAccount.id,
      stripe_account_id: connectAccount.stripe_account_id,
      charges_enabled: account.chargesEnabled,
      payouts_enabled: account.payoutsEnabled,
      details_submitted: account.detailsSubmitted,
    }
  } catch (error) {
    console.error("Error in getConnectAccountStatus:", error)
    return { success: false, error }
  }
}

interface PaymentIntentParams {
  amount: number
  serviceId: string
  providerId: string
  userId: string
  packageName: string
  projectDetails?: string
}

export async function createServicePayment({
  amount,
  serviceId,
  providerId,
  userId,
  packageName,
  projectDetails,
}: PaymentIntentParams) {
  try {
    // In a real app, you would validate the user is logged in here
    const supabase = createServerClient()

    // Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: "usd",
      metadata: {
        serviceId,
        providerId,
        userId,
        packageName,
        projectDetails: projectDetails || "",
        type: "service_booking",
      },
    })

    // In a real app, you would store the payment intent in your database
    // const { error } = await supabase.from("bookings").insert({
    //   provider_id: providerId,
    //   client_id: userId,
    //   hours,
    //   amount,
    //   payment_intent_id: paymentIntent.id,
    //   status: "pending",
    //   project_details: projectDetails,
    // })

    return {
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error: any) {
    console.error("Error creating payment intent:", error)
    return {
      error: error.message || "Failed to create payment intent",
    }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const supabase = createServerClient()

    // In a real app, you would update the booking status in your database
    // const { error } = await supabase
    //   .from("bookings")
    //   .update({ status, updated_at: new Date().toISOString() })
    //   .eq("payment_intent_id", paymentIntentId)

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating payment status:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Update payment status from webhook
 */
export async function updatePaymentStatus(paymentIntentId: string, status: string) {
  try {
    const supabase = createServerClient()

    const { error } = await supabase
      .from("payments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("payment_intent_id", paymentIntentId)

    if (error) {
      return { success: false, error }
    }

    revalidatePath("/dashboard/payments")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error in updatePaymentStatus:", error)
    return { success: false, error }
  }
}

/**
 * Get payment history for a user
 */
export async function getUserPayments(userId: string, role: "client" | "provider") {
  try {
    const supabase = createServerClient()

    const query = supabase
      .from("payments")
      .select(
        `
        *,
        service:services(id, title, price),
        client:client_id(id, name, email),
        provider:provider_id(id, name, email)
      `,
      )
      .order("created_at", { ascending: false })

    // Filter by role
    if (role === "client") {
      query.eq("client_id", userId)
    } else {
      query.eq("provider_id", userId)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error }
    }

    return { success: true, payments: data }
  } catch (error) {
    console.error("Error in getUserPayments:", error)
    return { success: false, error }
  }
}
