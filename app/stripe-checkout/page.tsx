"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { AnimatedGradientBackground } from "@/components/animated-gradient-background"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckoutForm } from "@/components/payments/checkout-form"

// Load Stripe outside of component to avoid recreating it on each render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

export default function StripeCheckoutPage() {
  const searchParams = useSearchParams()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get parameters from URL
  const serviceId = searchParams.get("serviceId")
  const amount = Number(searchParams.get("amount") || 0)
  const name = searchParams.get("name") || "Service"

  useEffect(() => {
    // Create a PaymentIntent as soon as the page loads
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceId,
            amount,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create payment intent")
        }

        const data = await response.json()
        setClientSecret(data.clientSecret)
      } catch (err) {
        console.error("Error creating payment intent:", err)
        setError("Something went wrong with the payment process. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    createPaymentIntent()
  }, [serviceId, amount])

  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#6366f1",
    },
  }

  const options = {
    clientSecret,
    appearance,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <EnhancedMainNav />
        <AnimatedGradientBackground />
        <div className="container py-16">
          <div className="max-w-md mx-auto">
            <Skeleton className="h-12 w-3/4 mb-8" />
            <Skeleton className="h-[400px] w-full rounded-md" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !clientSecret) {
    return (
      <div className="min-h-screen bg-background">
        <EnhancedMainNav />
        <AnimatedGradientBackground />
        <div className="container py-16">
          <div className="max-w-md mx-auto bg-red-50 p-8 rounded-lg text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Payment Error</h2>
            <p className="text-red-500 mb-6">{error || "Failed to initialize payment. Please try again."}</p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <EnhancedMainNav />
      <AnimatedGradientBackground />
      <div className="container py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Payment</h1>
          {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm
                serviceId={serviceId || ""}
                clientId="current-user-id"
                amount={amount}
                serviceName={name}
                providerName="Provider Name"
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  )
}
