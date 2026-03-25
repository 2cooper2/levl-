"use client"

import { useEffect, useState } from "react"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
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
        <div className="max-w-lg mx-auto text-center relative">
          {/* Add LevL aesthetic background elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-blue-500/20 backdrop-blur-sm"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"></div>
          </div>

          <div className="p-8 relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="rounded-full bg-gradient-to-br from-purple-500/80 to-indigo-600/80 p-6 mx-auto w-24 h-24 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20"
            >
              <CheckCircle className="h-12 w-12 text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                Payment Successful!
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Thank you for your payment. Your booking has been confirmed!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex justify-center"
            >
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
              >
                <Link href="/">Return to Homepage</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
