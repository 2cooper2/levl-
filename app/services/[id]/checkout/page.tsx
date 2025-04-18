"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { StripeProvider } from "@/components/payments/stripe-provider"
import { CheckoutForm } from "@/components/payments/checkout-form"
import { useAuth } from "@/context/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function CheckoutPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchService() {
      if (!id) return

      try {
        const { data, error } = await supabase
          .from("services")
          .select(`
           *,
           provider:provider_id(
             id,
             name,
             avatar_url
           )
         `)
          .eq("id", id)
          .single()

        if (error) throw error

        setService(data)
      } catch (err: any) {
        console.error("Error fetching service:", err)
        setError(err.message || "Failed to load service")
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="container py-10">
        <div className="max-w-md mx-auto space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="container py-10">
        <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error || "Service not found"}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container py-10">
        <div className="max-w-md mx-auto p-6 bg-yellow-50 rounded-lg text-center">
          <h2 className="text-xl font-bold text-yellow-700 mb-2">Please log in</h2>
          <p className="text-yellow-600">You need to be logged in to book this service.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Checkout</h1>
      <StripeProvider>
        <CheckoutForm
          serviceId={service.id}
          clientId={user.id}
          amount={service.price}
          serviceName={service.title}
          providerName={service.provider?.name || "Provider"}
        />
      </StripeProvider>
    </div>
  )
}
