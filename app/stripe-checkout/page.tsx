"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { CardElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { createPaymentIntent } from "@/app/actions/payment-actions"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

const CheckoutForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (event: any) => {
    event.preventDefault()

    if (!stripe || !elements) {
      console.log("Stripe or Elements not initialized")
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const amount = 1000 // Replace with the actual amount
      const currency = "usd" // Replace with the actual currency
      const metadata = {
        providerId: "provider123", // Replace with the actual provider ID
        hours: 10, // Replace with the actual number of hours
        projectDetails: "Project details", // Replace with the actual project details
      }

      const { clientSecret, error: paymentIntentError } = await createPaymentIntent({
        amount,
        currency,
        metadata,
      })

      if (paymentIntentError) {
        setErrorMessage(paymentIntentError)
        setIsProcessing(false)
        console.error("Payment intent creation error:", paymentIntentError)
        return
      }

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement) as any,
      })

      if (stripeError) {
        setErrorMessage(stripeError.message)
        setIsProcessing(false)
        console.error("Payment method creation error:", stripeError)
        return
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret!, {
        payment_method: paymentMethod?.id,
        receipt_email: "test@example.com",
      })

      if (confirmError) {
        setErrorMessage(confirmError.message)
        console.error("Payment confirmation error:", confirmError)
      } else {
        console.log("Payment successful!", paymentIntent)
      }
    } catch (err: any) {
      setErrorMessage(err.message)
      console.error("Payment processing error:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
        }}
        className="mb-4"
      />
      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full">
        {isProcessing ? "Processing..." : "Pay"}
      </Button>
    </form>
  )
}

export default function StripeCheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6 text-center">Stripe Checkout</h1>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  )
}
