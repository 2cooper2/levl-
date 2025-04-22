"use client"

import { useEffect, useState } from "react"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState<{
    serviceName: string
    providerName: string
    amount: string
  } | null>(null)

  useEffect(() => {
    // In a real app, you would fetch the order details from your database
    // based on the payment_intent parameter in the URL
    const paymentIntentId = searchParams.get("payment_intent")

    if (paymentIntentId) {
      // Simulate fetching order details
      setOrderDetails({
        serviceName: "Professional Website Development",
        providerName: "Alex Morgan",
        amount: "$99.00",
      })
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background">
      <EnhancedMainNav />
      <main className="container py-12">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-full bg-green-100 p-6 mx-auto w-24 h-24 flex items-center justify-center mb-6"
          >
            <CheckCircle className="h-12 w-12 text-green-600" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Thank you for your payment. Your booking has been confirmed and you'll receive a confirmation email
              shortly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-muted p-6 rounded-lg border mb-8 text-left"
          >
            <h2 className="font-semibold mb-4">Order Details</h2>
            {orderDetails ? (
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium">{orderDetails.serviceName}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="font-medium">{orderDetails.providerName}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">{orderDetails.amount}</span>
                </li>
              </ul>
            ) : (
              <p className="text-muted-foreground">Loading order details...</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-muted p-6 rounded-lg border mb-8"
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild>
              <Link href="/dashboard">
                View Your Orders <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/explore">Continue Shopping</Link>
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
