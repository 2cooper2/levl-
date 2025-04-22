"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button, type ButtonProps } from "@/components/ui/button"

interface CheckoutButtonProps extends ButtonProps {
  providerId: string
  packageName?: string
  amount?: number
  children?: React.ReactNode
}

export function CheckoutButton({ providerId, packageName, amount, children, ...props }: CheckoutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)

    try {
      // In a real implementation, this would prepare the checkout session
      // and redirect to the checkout page

      router.push(`/checkout/${providerId}?package=${packageName || "standard"}`)
    } catch (error) {
      console.error("Error initiating checkout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={isLoading} {...props}>
      {isLoading ? "Loading..." : children || "Hire Now"}
    </Button>
  )
}
