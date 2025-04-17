"use client"

import type React from "react"

import { Button, type ButtonProps } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

interface CheckoutButtonProps extends ButtonProps {
  providerId: string
  packageName?: string
  amount?: number
  children?: React.ReactNode
}

export function CheckoutButton({ providerId, packageName, amount, children, ...props }: CheckoutButtonProps) {
  const router = useRouter()

  const handleCheckout = () => {
    let url = `/checkout?provider=${providerId}`

    if (packageName) {
      url += `&package=${packageName.toLowerCase()}`
    }

    if (amount) {
      url += `&amount=${amount}`
    }

    router.push(url)
  }

  return (
    <Button
      onClick={handleCheckout}
      className="bg-purple-500/80 hover:bg-purple-600/90 backdrop-blur-sm border border-purple-300/30 shadow-sm hover:shadow-md transition-all duration-300"
      {...props}
    >
      {children || (
        <>
          Hire Now <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  )
}
