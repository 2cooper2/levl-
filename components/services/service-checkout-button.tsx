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
        title: "Please sign in",
        description: "You need to be signed in to checkout",
        variant: "destructive",
      })
      router.push(`/auth/login?redirect=/checkout?serviceId=${serviceId}&package=${packageName}`)
      return
    }

    router.push(`/checkout?serviceId=${serviceId}&package=${packageName}`)
  }

  return (
    <Button
      onClick={handleCheckout}
      className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
      {...props}
    >
      {children || `Continue with ${packageName} (${price})`}
    </Button>
  )
}

// Add this alias export to fix the import error
export const CheckoutButton = ServiceCheckoutButton
