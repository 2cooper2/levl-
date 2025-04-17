"use client"

import type React from "react"

import { Button, type ButtonProps } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface CheckoutButtonProps extends ButtonProps {
  providerId: string
  packageName?: string
  amount?: number
  children?: React.ReactNode
}

export function CheckoutButton({ providerId, packageName, amount, children, ...props }: CheckoutButtonProps) {
  const { toast } = useToast()

  const handleCheckout = () => {
    toast({
      title: "Checkout coming soon",
      description: "Our payment system is currently being updated. Please try again later.",
    })
  }

  return (
    <Button onClick={handleCheckout} {...props}>
      {children || "Hire Now"}
    </Button>
  )
}
