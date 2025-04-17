"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { AnimatedGradientBackground } from "@/components/animated-gradient-background"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const paymentIntentId = searchParams.get("payment_intent")
  const redirectStatus = searchParams.get("redirect_status")

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (paymentIntentId && redirectStatus === "succeeded") {
        try {
          const supabase = createClient()
          // In a real app, fetch payment details from your database

          // For now, let's use mock data
          setPaymentInfo({
            id: "mock-payment-id",
            amount: 99900,
            created_at: new Date().toISOString(),
            status: "completed",
            service: {
              title: "Professional Website Development",
              provider_name: "Alex Morgan",
            },
          })
        } catch (error) {
          console.error("Error fetching payment details:", error)
        }
      }
      setIsLoading(false)
    }

    fetchPaymentDetails()
  }, [paymentIntentId, redirectStatus])

  return (
    <div className="min-h-screen bg-background">
      <EnhancedMainNav />
      <AnimatedGradientBackground />
      <div className="container py-20">
        <div className="max-w-lg mx-auto text-center">
          <div className="rounded-full bg-green-100 p-6 mx-auto w-24 h-24 flex items-center justify-center mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your payment. Your order has been successfully processed and confirmed.
          </p>

          {paymentInfo && (
            <div className="bg-card p-6 rounded-lg border mb-8">
              <h2 className="font-semibold mb-4 text-lg">Order Details</h2>
              <div className="space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium">{paymentInfo.service.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="font-medium">{paymentInfo.service.provider_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">${(paymentInfo.amount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-green-600 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" /> Completed
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{new Date(paymentInfo.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-muted p-6 rounded-lg border mb-8">
            <h2 className="font-semibold mb-4">What happens next?</h2>
            <ul className="text-left space-y-2">
              <li className="flex items-start">
                <span className="bg-primary/10 rounded-full p-1 mr-2 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-primary" />
                </span>
                <span>You'll receive a confirmation email with your order details.</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 rounded-full p-1 mr-2 mt-0.5">
                  <Clock className="h-3 w-3 text-primary" />
                </span>
                <span>The service provider will contact you within 24 hours to get started.</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary/10 rounded-full p-1 mr-2 mt-0.5">
                  <CheckCircle className="h-3 w-3 text-primary" />
                </span>
                <span>You can track your order status in your dashboard.</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/explore">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
