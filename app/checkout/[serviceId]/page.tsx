"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { PaymentForm } from "@/components/checkout/payment-form"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

export default function CheckoutPage({ params }: { params: { serviceId: string } }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const { toast } = useToast()
  const [serviceDetails, setServiceDetails] = useState<{
    title: string
    amount: number
    providerId: string
  } | null>(null)

  useEffect(() => {
    // Fetch service details from your API
    const fetchServiceDetails = async () => {
      try {
        setIsLoading(true)
        // For testing, we'll use hardcoded values
        // In production, you would fetch this from your API
        setServiceDetails({
          title: "Professional Website Development",
          amount: 1999, // $19.99 in cents
          providerId: "0c4ebdf3-3421-4f6a-adaf-0df55a85b242", // Replace with a valid provider ID
        })
      } catch (err) {
        console.error("Error fetching service details:", err)
        setError("Could not load service details")
        toast({
          title: "Error",
          description: "Could not load service details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchServiceDetails()
  }, [params.serviceId, toast])

  useEffect(() => {
    if (!serviceDetails) return

    const createPaymentIntent = async () => {
      setIsLoading(true)
      try {
        console.log("Creating payment intent with:", {
          amount: serviceDetails.amount,
          serviceId: params.serviceId,
          providerId: serviceDetails.providerId,
        })

        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: serviceDetails.amount,
            serviceId: params.serviceId,
            providerId: serviceDetails.providerId,
            description: serviceDetails.title,
          }),
        })

        const responseText = await response.text()
        console.log("Response from create-payment-intent:", responseText)

        let data
        try {
          data = JSON.parse(responseText)
        } catch (e) {
          console.error("Failed to parse response as JSON:", e)
          setError(`Invalid response from server: ${responseText}`)
          setIsLoading(false)
          return
        }

        if (!response.ok) {
          console.error("Payment intent creation failed:", data.error || response.statusText)
          setError(`Payment setup failed: ${data.error || response.statusText}`)
          toast({
            title: "Payment Setup Failed",
            description: data.error || "Could not initialize payment. Please try again later.",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }

        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
          setPaymentIntentId(data.paymentIntentId)
        } else if (data.needsOnboarding) {
          setNeedsOnboarding(true)
          setError(data.error || "Provider needs to complete payment setup")
          toast({
            title: "Provider Not Ready",
            description: "This service provider hasn't completed their payment setup yet.",
            variant: "destructive",
          })
        } else {
          setError(data.error || "Failed to initialize payment")
          toast({
            title: "Payment Error",
            description: data.error || "Failed to initialize payment",
            variant: "destructive",
          })
        }
      } catch (error: any) {
        console.error("Error creating payment intent:", error)
        setError(error.message || "Failed to initialize payment")
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    createPaymentIntent()
  }, [serviceDetails, params.serviceId, toast])

  // Stripe Elements options
  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#7c3aed",
    },
  }

  const options = clientSecret
    ? {
        clientSecret,
        appearance,
      }
    : {}

  return (
    <div className="min-h-screen bg-background">
      <EnhancedMainNav />
      <main className="container py-12">
        <div className="mb-6">
          <Link
            href={`/services/${params.serviceId}`}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to service details
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Secure Checkout</h1>
            <p className="text-muted-foreground mt-2">Complete your booking in just a few steps</p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-[600px] w-full rounded-lg" />
            </div>
          ) : needsOnboarding ? (
            <Card className="border-2 border-yellow-200">
              <CardHeader className="bg-yellow-50 dark:bg-yellow-950/20 border-b">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="font-medium">Provider Not Ready</h3>
                </div>
                <CardDescription>This service provider hasn't completed their payment setup yet.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  The service provider needs to complete their payment setup before they can accept payments. Please try
                  again later or contact the provider directly.
                </p>
              </CardContent>
              <CardFooter className="bg-yellow-50 dark:bg-yellow-950/20 border-t">
                <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </CardFooter>
            </Card>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">Payment Error</h3>
                <p>{error}</p>
                <p className="text-sm mt-2">Please try again or contact support if the issue persists.</p>
                <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </div>
            </div>
          ) : clientSecret && paymentIntentId && serviceDetails ? (
            <Elements stripe={stripePromise} options={options}>
              <PaymentForm
                clientSecret={clientSecret}
                paymentIntentId={paymentIntentId}
                amount={serviceDetails.amount}
                serviceId={params.serviceId}
                providerId={serviceDetails.providerId}
                isConnectedAccount={true}
              />
            </Elements>
          ) : (
            <div className="text-center">
              <p>Unable to initialize payment. Please try again.</p>
              <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
