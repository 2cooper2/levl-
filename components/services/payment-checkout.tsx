"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight } from "lucide-react"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"

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
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePayment = async () => {
    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/services/payment/success`,
        },
      })

      if (error) {
        setErrorMessage(error.message || "An unexpected error occurred.")
        setIsProcessing(false)
      } else {
        // PaymentIntent was confirmed and the customer is redirected
        onSuccess()
      }
    } catch (err: any) {
      console.error("Payment confirmation error:", err)
      setErrorMessage(err.message || "An unexpected error occurred.")
      setIsProcessing(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete your booking</CardTitle>
        <CardDescription>Secure payment for {serviceName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Service Fee</span>
            <span>${(amount / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Platform Fee</span>
            <span>${((amount * 0.05) / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${((amount * 1.05) / 100).toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Secure Payment</p>
              <p className="text-sm text-muted-foreground">Your payment information is secure</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Money-Back Guarantee</p>
              <p className="text-sm text-muted-foreground">Full refund if you're not satisfied</p>
            </div>
          </div>
        </div>

        {/* Stripe Payment Element */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Card Information</label>
            <PaymentElement />
          </div>
        </div>

        {errorMessage && <div className="text-red-500">{errorMessage}</div>}
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Button
          className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
          onClick={handlePayment}
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? "Processing..." : `Pay ${((amount * 1.05) / 100).toFixed(2)}`}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="text-xs text-center text-muted-foreground">Your payment is processed securely by Stripe.</p>
      </CardFooter>
    </Card>
  )
}
