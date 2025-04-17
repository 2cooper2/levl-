"use client"

import { useRouter } from "next/navigation"
import { Button, type ButtonProps } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"

interface ServiceCheckoutButtonProps extends ButtonProps {
  serviceId: string
  packageName: string
  price: number
}

export function ServiceCheckoutButton({
  serviceId,
  packageName,
  price,
  children,
  ...props
}: ServiceCheckoutButtonProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to book this service",
        variant: "destructive",
      })
      router.push(`/auth/login?redirect=/services/${serviceId}`)
      return
    }

    router.push(`/checkout/${serviceId}?package=${packageName}`)
  }

  return (
    <Button onClick={handleCheckout} {...props}>
      {children || `Continue with ${packageName} ($${price.toFixed(2)})`}
    </Button>
  )
}

// Add this alias export to fix the import error
export const CheckoutButton = ServiceCheckoutButton
