"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

interface ServiceCheckoutProps {
  serviceId: string
  userId: string
  price: number
  title: string
}

export function ServiceCheckout({ serviceId, userId, price, title }: ServiceCheckoutProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to checkout",
        variant: "destructive",
      })
      router.push(`/auth/login?redirect=/services/${serviceId}`)
      return
    }

    router.push(`/checkout?serviceId=${serviceId}&amount=${price}&name=${encodeURIComponent(title)}`)
  }

  return (
    <div className="mt-6">
      <Button onClick={handleCheckout} className="w-full">
        {`Book for $${(price / 100).toFixed(2)}`}
      </Button>
    </div>
  )
}
