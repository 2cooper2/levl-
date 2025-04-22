"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface PaymentFormProps {
  clientSecret: string
  amount: number
  serviceId: string
}

export function PaymentForm({ clientSecret, amount, serviceId }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setCardError(null)

    try {
      const cardElement = elements.getElement(CardElement)

      if (!cardElement) {
        throw new Error("Card element not found")
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (error) {
        setCardError(error.message || "An error occurred with your payment")
        return
      }

      if (paymentIntent.status === "succeeded") {
        toast({
          title: "Payment successful!",
          description: "Your payment has been processed successfully.",
        })

        router.push(`/checkout/success?serviceId=${serviceId}`)
      }
    } catch (error) {
      console.error("Payment error:", error)
      setCardError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-md">
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
        />
      </div>

      {cardError && <div className="text-sm text-red-500">{cardError}</div>}

      <Button type="submit" disabled={!stripe || isLoading} className="w-full">
        {isLoading ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
      </Button>
    </form>
  )
}
