"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { PaymentCheckout } from "@/components/services/payment-checkout"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { AnimatedGradientBackground } from "@/components/animated-gradient-background"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get parameters from URL
  const serviceId = searchParams.get("serviceId")
  const providerId = searchParams.get("providerId")
  const hourlyRate = searchParams.get("hourlyRate") ? Number.parseInt(searchParams.get("hourlyRate") || "0") : 0

  useEffect(() => {
    // Validate required parameters
    if (!serviceId || !providerId || !hourlyRate) {
      setError("Missing required checkout information")
      setIsLoading(false)
      return
    }

    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId,
            providerId,
            amount: hourlyRate * 100, // Convert to cents for Stripe
            description: `Service booking for ${serviceId}`,
          }),
        })

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        setClientSecret(data.clientSecret)
      } catch (err: any) {
        console.error("Error creating payment intent:", err)
        setError(err.message || "Failed to initialize checkout")
        toast({
          title: "Checkout Error",
          description: err.message || "There was a problem setting up the checkout",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    createPaymentIntent()
  }, [serviceId, providerId, hourlyRate, toast])

  const handleSuccess = () => {
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully",
    })
    router.push("/checkout/success")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <EnhancedMainNav />
        <AnimatedGradientBackground />
        <div className="container py-10 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg">Initializing checkout...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <EnhancedMainNav />
        <AnimatedGradientBackground />
        <div className="container py-10 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="max-w-md w-full bg-red-50 p-6 rounded-lg border border-red-200">
            <h2 className="text-xl font-bold text-red-700 mb-2">Checkout Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <EnhancedMainNav />
      <AnimatedGradientBackground />
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6 text-center">Complete Your Booking</h1>

        {clientSecret && (
          <PaymentCheckout
            clientSecret={clientSecret}
            amount={hourlyRate * 100}
            serviceName="Professional Service"
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  )
}
