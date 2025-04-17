"use client"

import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { AnimatedGradientBackground } from "@/components/animated-gradient-background"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function CheckoutSuccessPage() {
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
                  <CheckCircle className="h-3 w-3 text-primary" />
                </span>
                <span>The service provider will contact you to discuss project details.</span>
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
              <Link href="/dashboard">View Your Orders</Link>
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
