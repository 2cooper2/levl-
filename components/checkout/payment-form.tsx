"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Shield, Lock, CreditCard, Info } from "lucide-react"

interface PaymentFormProps {
  clientSecret: string
  amount: number
  serviceId: string
  providerId: string
  isConnectedAccount?: boolean
}

export function PaymentForm({
  clientSecret,
  amount,
  serviceId,
  providerId,
  isConnectedAccount = true, // Default to true since we're making Connect the default
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)

  // Fixed total amount of $2.02 (202 cents for Stripe)
  const totalAmount = 202 // $2.02 in cents for Stripe

  // Display values
  const serviceFee = 2.0
  const platformFee = 0.02
  const total = 2.02

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

      // Use the client secret from props which should be for the $2.02 amount
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
    <Card className="w-full shadow-lg border-2 border-muted">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-t-lg border-b">
        <CardTitle className="text-2xl">Complete your booking</CardTitle>
        <CardDescription>Secure payment for Professional Website Development</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-lg flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" /> Order Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Service Fee</span>
              <span className="font-medium">$2.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Platform Fee</span>
              <span className="font-medium">$0.02</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">$2.02</span>
            </div>
          </div>

          {isConnectedAccount && (
            <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Direct payment to service provider</span>
            </div>
          )}
        </div>

        {/* Payment Information */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" /> Payment Information
          </h3>
          <div className="border-2 rounded-md p-4 bg-white dark:bg-black">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                    iconColor: "#7c3aed",
                  },
                  invalid: {
                    color: "#9e2146",
                    iconColor: "#ef4444",
                  },
                },
                hidePostalCode: true,
              }}
            />
          </div>

          {cardError && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-md flex items-start gap-2">
              <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{cardError}</p>
            </div>
          )}
        </div>

        {/* Security Information */}
        <div className="space-y-3 bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
          <h3 className="font-medium flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-600 dark:text-green-400" /> Secure Payment
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
              <p>Your payment information is encrypted and secure</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
              <p>We use Stripe, a PCI-DSS Level 1 certified payment processor</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
              <p>Your card details are never stored on our servers</p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-b-lg border-t p-6">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={!stripe || isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 text-lg"
        >
          {isLoading ? "Processing payment..." : `Pay $2.02`}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          By clicking "Pay", you agree to our{" "}
          <a href="#" className="underline hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </CardFooter>
    </Card>
  )
}
