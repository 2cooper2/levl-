"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface CheckoutFormProps {
  service: any
  packageName: string
  userId: string
}

export function CheckoutForm({ service, packageName, userId }: CheckoutFormProps) {
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Checkout coming soon",
      description: "Our payment system is currently being updated. Please try again later.",
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <Button type="submit" className="w-full">
        Complete Checkout
      </Button>
    </form>
  )
}
