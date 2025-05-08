"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type React from "react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CheckoutFormProps {
  service: any
  packageName: string
  userId: string
}

export function CheckoutForm({ service, packageName, userId }: CheckoutFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real implementation, this would call your API to create an order
      // and redirect to the payment processing page

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Redirect to success page
      router.push(`/checkout/success?serviceId=${service.id}`)
    } catch (error) {
      toast({
        title: "Error processing payment",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Checkout</h2>
        <div className="flex items-center space-x-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              type: "spring",
              stiffness: 100,
            }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge className="bg-green-500 text-white">Secure</Badge>
                </TooltipTrigger>
                <TooltipContent>Your payment is secured with industry-standard encryption.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.4,
              type: "spring",
              stiffness: 100,
            }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge className="bg-blue-500 text-white">Guaranteed</Badge>
                </TooltipTrigger>
                <TooltipContent>We offer a satisfaction guarantee or your money back.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Processing..." : "Complete Checkout"}
        </Button>
      </form>
    </div>
  )
}
