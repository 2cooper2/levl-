"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Shield, Lock, CreditCard, Info, AlertTriangle, ArrowLeft } from "lucide-react"
import { updateTransactionStatus } from "@/app/actions/payment-actions"
import Link from "next/link"

interface PaymentFormProps {
  clientSecret: string
  amount: number
  serviceId: string
  providerId: string
  paymentIntentId: string
  isConnectedAccount?: boolean
}

export function PaymentForm({
  clientSecret,
  amount,
  serviceId,
  providerId,
  paymentIntentId,
  isConnectedAccount = true,
}: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [cardError, setCardError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "succeeded" | "error">("idle")
  const [errorRecoveryAttempt, setErrorRecoveryAttempt] = useState(0)

  // Format amounts for display
  const serviceFee = ((amount - 2) / 100).toFixed(2)
  const platformFee = (2 / 100).toFixed(2)
  const total = (amount / 100).toFixed(2)

  // Handle card input changes
  const handleCardChange = (event: any) => {
    setCardError(event.error ? event.error.message : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      setCardError("Stripe has not initialized. Please refresh the page and try again.")
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setCardError("Card element not found. Please refresh the page and try again.")
      return
    }

    setIsLoading(true)
    setPaymentStatus("processing")
    setCardError(null)

    try {
      // Confirm card payment with the client secret
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (error) {
        // Handle payment error
        setCardError(error.message || "An error occurred with your payment")
        setPaymentStatus("error")

        // Record the failed payment in our database
        await updateTransactionStatus(paymentIntentId, "failed", error.message || "Payment confirmation failed")

        return
      }

      if (paymentIntent.status === "succeeded") {
        // Record the successful payment
        await updateTransactionStatus(paymentIntentId, "completed")

        setPaymentStatus("succeeded")
        toast({
          title: "Payment successful!",
          description: "Your payment has been processed successfully.",
        })

        // Redirect to the success page
        router.push(`/checkout/success?serviceId=${serviceId}`)
      } else {
        // Handle other payment intent statuses
        setCardError(`Payment status: ${paymentIntent.status}. Please try again.`)
        setPaymentStatus("error")

        // Record the payment status
        await updateTransactionStatus(
          paymentIntentId,
          paymentIntent.status,
          `Payment returned status: ${paymentIntent.status}`,
        )
      }
    } catch (error: any) {
      console.error("Payment error:", error)
      setCardError("An unexpected error occurred. Please try again.")
      setPaymentStatus("error")

      // Record the error
      await updateTransactionStatus(paymentIntentId, "error", error.message || "Unexpected payment error")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle error recovery
  const handleRetry = async () => {
    setErrorRecoveryAttempt((prev) => prev + 1)
    setCardError(null)
    setPaymentStatus("idle")
  }

  return (
    <Card className="w-full shadow-lg border-2 border-muted">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-t-lg border-b">
        <CardTitle className="text-2xl">Complete your booking</CardTitle>
        <CardDescription>Secure payment for service</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Payment Status Alert */}
        {paymentStatus === "error" && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-medium text-red-700 dark:text-red-400">Payment Failed</h3>
              <p className="text-sm text-red-600 dark:text-red-300">
                {cardError || "We couldn't process your payment. Please try again."}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400"
                onClick={handleRetry}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-lg flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" /> Order Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Service Fee</span>
              <span className="font-medium">${serviceFee}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Platform Fee</span>
              <span className="font-medium">${platformFee}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">${total}</span>
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
              onChange={handleCardChange}
            />
          </div>

          {cardError && paymentStatus !== "error" && (
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
        {paymentStatus === "error" ? (
          <div className="flex gap-3 w-full">
            <Link href={`/services/${serviceId}`} className="flex-1">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Return to Service
              </Button>
            </Link>
            <Button
              onClick={handleRetry}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!stripe || isLoading || !!cardError || paymentStatus === "processing"}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-6 text-lg"
          >
            {isLoading || paymentStatus === "processing" ? "Processing payment..." : `Pay $${total}`}
          </Button>
        )}

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
