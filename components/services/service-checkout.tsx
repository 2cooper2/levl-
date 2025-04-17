"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createServicePayment } from "@/app/actions/stripe-actions"
import { loadStripe } from "@stripe/stripe-js"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface ServiceCheckoutProps {
  serviceId: string
  userId: string
  price: number
  title: string
}

export function ServiceCheckout({ serviceId, userId, price, title }: ServiceCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCheckout = async () => {
    try {
      setLoading(true)
      setError(null)

      // Create payment intent
      const result = await createServicePayment(serviceId, userId, price)

      if (!result.success || !result.clientSecret) {
        setError("Failed to create payment. Please try again.")
        return
      }

      // Load Stripe
      const stripe = await stripePromise
      if (!stripe) {
        setError("Could not connect to Stripe. Please try again.")
        return
      }

      // Redirect to Stripe Checkout
      const { error: stripeError } = await stripe.redirectToCheckout({
        clientSecret: result.clientSecret,
      })

      if (stripeError) {
        setError(stripeError.message || "Payment failed. Please try again.")
      }
    } catch (err) {
      console.error("Checkout error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <Button onClick={handleCheckout} disabled={loading} className="w-full">
        {loading ? "Processing..." : `Book for $${(price / 100).toFixed(2)}`}
      </Button>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  )
}
