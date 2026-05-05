export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { createServerClient } from "@/lib/supabase-server"

const BG_CHECK_AMOUNT_CENTS = 4000 // $40.00

export async function POST(_request: NextRequest) {
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  try {
    const { default: Stripe } = await import("stripe")
    const stripeKey = process.env.STRIPE_SECRET_KEY
    if (!stripeKey) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 })
    }
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" })

    const supabase = await createServerClient()
    const { data: profile } = await supabase
      .from("users")
      .select("role, background_check_status, email, name")
      .eq("id", user!.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Already cleared or master — no charge needed
    if (profile.background_check_status === "cleared" || profile.role === "both") {
      return NextResponse.json({ alreadyCleared: true })
    }

    if (profile.background_check_status === "pending") {
      return NextResponse.json({ error: "A background check is already in progress" }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: BG_CHECK_AMOUNT_CENTS,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        purpose: "background_check",
        userId: user!.id,
        userEmail: profile.email || "",
        userName: profile.name || "",
      },
      description: `Levl background check for ${profile.email || user!.id}`,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (e: any) {
    console.error("create-bg-check-payment error:", e)
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}
