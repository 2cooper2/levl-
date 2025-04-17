"use client"

import type React from "react"

import { useState } from "react"
import { useStripe, useElements, PaymentElement, AddressElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Loader2, Lock } from "lucide-react"

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
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Confirm the payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/services/payment/success`,
        },
      })

      if (error) {
        // Show error to customer
        setErrorMessage(error.message || "An unexpected error occurred.")
        setIsLoading(false)
      }
      // Otherwise PaymentIntent was confirmed and customer is redirected
    } catch (err: any) {
      console.error("Payment confirmation error:", err)
      setErrorMessage(err.message || "An unexpected error occurred.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Complete your payment for {serviceName} with {providerName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="payment-form" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <PaymentElement id="payment-element" />

            <div className="space-y-2">
              <p className="text-sm font-medium">Billing Address</p>
              <AddressElement options={{ mode: "billing" }} />
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{errorMessage}</div>
            )}

            <div className="flex flex-col space-y-2">
              <Button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay ${(amount / 100).toFixed(2)}</>
                )}
              </Button>
              <div className="text-xs text-center text-muted-foreground flex items-center justify-center">
                <Lock className="h-3 w-3 mr-1" /> Secure payment processing by Stripe
              </div>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-xs text-muted-foreground border-t pt-4">
        <p>By completing this payment, you agree to our Terms of Service and Payment Policy.</p>
        <p>You will receive an email confirmation once your payment is processed.</p>
      </CardFooter>
    </Card>
  )
}
