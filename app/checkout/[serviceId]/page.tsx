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

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

export default function CheckoutPage({ params }: { params: { serviceId: string } }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [serviceDetails, setServiceDetails] = useState<{
    title: string
    amount: number
    providerId: string
  } | null>(null)

  useEffect(() => {
    // In a real app, fetch service details from your API
    const fetchServiceDetails = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Use the actual user ID that has a connected account
        setServiceDetails({
          title: "Professional Website Development",
          amount: 202, // $2.02 in cents
          providerId: "0c4ebdf3-3421-4f6a-adaf-0df55a85b242", // The user ID with the connected account
        })
      } catch (err) {
        console.error("Error fetching service details:", err)
        setError("Could not load service details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchServiceDetails()
  }, [params.serviceId])

  useEffect(() => {
    if (!serviceDetails) return

    const createPaymentIntent = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: serviceDetails.amount,
            serviceId: params.serviceId,
            providerId: serviceDetails.providerId, // Pass the provider ID
            description: serviceDetails.title,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Payment intent creation failed:", errorText)
          setError(`Payment setup failed: ${response.status} ${response.statusText}`)
          setIsLoading(false)
          return
        }

        const data = await response.json()

        if (data.clientSecret) {
          setClientSecret(data.clientSecret)
          // Note whether this is a connected account payment
          const isConnected = data.isConnectedAccount || false
          if (!isConnected) {
            console.warn("Provider does not have a connected Stripe account. Using direct payment.")
            // You could show a warning to the user here
          }
        } else if (data.needsOnboarding) {
          setNeedsOnboarding(true)
          setError(data.error || "Provider needs to complete Stripe Connect setup")
        } else {
          setError(data.error?.message || "Failed to initialize payment")
        }
      } catch (error: any) {
        console.error("Error creating payment intent:", error)
        setError(error.message || "Failed to initialize payment")
      } finally {
        setIsLoading(false)
      }
    }

    createPaymentIntent()
  }, [serviceDetails, params.serviceId])

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
                  The service provider needs to complete their Stripe Connect setup before they can accept payments.
                  Please try again later or contact the provider directly.
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
              </div>
            </div>
          ) : clientSecret && serviceDetails ? (
            <Elements stripe={stripePromise} options={options}>
              <PaymentForm
                clientSecret={clientSecret}
                amount={serviceDetails.amount}
                serviceId={params.serviceId}
                providerId={serviceDetails.providerId}
                isConnectedAccount={true}
              />
            </Elements>
          ) : (
            <div className="text-center">
              <p>Unable to initialize payment. Please try again.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
