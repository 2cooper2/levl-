"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { CardElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

const CheckoutForm = () => {
  const stripe = useStripe()
  const elements = useElements()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (event: any) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement) as any,
    })

    if (error) {
      setErrorMessage(error.message)
      setIsProcessing(false)
      return
    }

    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentMethodId: paymentMethod?.id,
        amount: 1000, // Replace with the actual amount
      }),
    })

    const data = await response.json()

    if (data.error) {
      setErrorMessage(data.error)
    } else {
      const confirm = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: paymentMethod?.id,
        receipt_email: "test@example.com",
      })

      if (confirm.error) {
        setErrorMessage(confirm.error.message)
      } else {
        console.log("Payment successful!")
      }
    }

    setIsProcessing(false)
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
