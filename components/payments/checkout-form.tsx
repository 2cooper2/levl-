"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createServicePayment } from "@/app/actions/stripe-actions"
import { useToast } from "@/hooks/use-toast"

interface CheckoutFormProps {
  serviceId: string
  clientId: string
  amount: number
  serviceName: string
  providerName: string
}

export function CheckoutForm({ serviceId, clientId, amount, serviceName, providerName }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Create payment intent on the server
      const { success, clientSecret, error } = await createServicePayment(serviceId, clientId, amount)

      if (!success || !clientSecret) {
        throw new Error(error?.message || "Failed to create payment intent")
      }

      // Confirm card payment
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error("Card element not found")
      }

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // You can collect billing details here if needed
          },
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message || "Payment failed")
      }

      // Payment succeeded
      toast({
        title: "Payment successful!",
        description: `You have successfully booked ${serviceName}`,
      })

      // Redirect to success page
      router.push("/dashboard/bookings")
    } catch (error: any) {
      setErrorMessage(error.message || "Something went wrong")
      toast({
        title: "Payment failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete your booking</CardTitle>
        <CardDescription>
          You are booking {serviceName} with {providerName}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Card Information</div>
            <div className="border rounded-md p-3">
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
          </div>

          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${(amount / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Platform fee</span>
            <span>${((amount * 0.1) / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${(amount / 100).toFixed(2)}</span>
          </div>

          {errorMessage && <div className="text-sm text-red-500">{errorMessage}</div>}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
            disabled={!stripe || isLoading}
          >
            {isLoading ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
