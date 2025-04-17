"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight } from "lucide-react"

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
  const [isProcessing, setIsProcessing] = useState(false)

  // Check if we're in development mode with a mock client secret
  const isDevelopmentMode = clientSecret === "mock_secret_for_development"

  const handlePayment = () => {
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      onSuccess()
    }, 1500)
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

        {/* Mock payment form fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Card Information</label>
            <div className="border rounded-md p-3 bg-background">
              <div className="h-6 bg-muted/50 rounded w-full"></div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Name on Card</label>
            <div className="border rounded-md p-3 bg-background">
              <div className="h-6 bg-muted/50 rounded w-full"></div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Billing Address</label>
            <div className="border rounded-md p-3 bg-background">
              <div className="h-6 bg-muted/50 rounded w-full mb-2"></div>
              <div className="h-6 bg-muted/50 rounded w-full"></div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Button
          className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
          onClick={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : `Pay ${((amount * 1.05) / 100).toFixed(2)}`}
          {!isProcessing && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          {isDevelopmentMode
            ? "Demo Mode: No actual payment will be processed"
            : "Your payment is processed securely by Stripe."}
        </p>
      </CardFooter>
    </Card>
  )
}
