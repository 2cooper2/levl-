"use client"

import type React from "react"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements, AddressElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatAmountForDisplay } from "@/lib/stripe"
import { stripePublishableKey } from "@/lib/stripe"

// Load Stripe outside of component to avoid recreating it on each render
const stripePromise = loadStripe(stripePublishableKey)

// Checkout Form Component
function CheckoutForm({
  amount,
  currency = "usd",
  onSuccess,
}: {
  amount: number
  currency?: string
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    // Confirm payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/services/payment/success`,
      },
      redirect: "if_required",
    })

    if (error) {
      setErrorMessage(error.message || "An error occurred while processing your payment.")
      setIsProcessing(false)
    } else {
      // Payment succeeded
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <div className="space-y-2">
        <p className="text-sm font-medium">Billing Address</p>
        <AddressElement options={{ mode: "billing" }} />
      </div>

      {errorMessage && <div className="text-sm text-red-500">{errorMessage}</div>}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
      >
        {isProcessing ? "Processing..." : `Pay ${formatAmountForDisplay(amount, currency)}`}
      </Button>
    </form>
  )
}

// Main Payment Checkout Component
export function PaymentCheckout({
  clientSecret,
  amount,
  serviceName,
  onSuccess,
}: {
  clientSecret: string
  amount: number
  serviceName: string
  onSuccess: () => void
}) {
  const options = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#7c3aed",
        colorBackground: "#ffffff",
        colorText: "#1f2937",
      },
    },
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete your booking</CardTitle>
        <CardDescription>Secure payment for {serviceName}</CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm amount={amount} onSuccess={onSuccess} />
        </Elements>
      </CardContent>
      <CardFooter className="flex-col items-start text-xs text-muted-foreground">
        <p>Your payment is processed securely by Stripe.</p>
        <p>The service provider will receive your payment after the service is completed.</p>
      </CardFooter>
    </Card>
  )
}
