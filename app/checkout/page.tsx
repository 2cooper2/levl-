"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { OrderSummary } from "@/components/checkout/order-summary"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/supabase-js"
import { useAuth } from "@/context/auth-context"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [service, setService] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const serviceId = searchParams.get("serviceId")
  const packageName = searchParams.get("package") || "Standard"
  const providerId = searchParams.get("providerId")

  useEffect(() => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to checkout",
        variant: "destructive",
      })
      router.push("/auth/login?redirect=/checkout")
      return
    }

    if (!serviceId) {
      toast({
        title: "Missing service",
        description: "No service selected for checkout",
        variant: "destructive",
      })
      router.push("/explore")
      return
    }

    // Fetch service details
    const fetchService = async () => {
      try {
        setIsLoading(true)
        const supabase = createClientComponentClient()

        // In a real app, this would fetch from your database
        // For now, we'll use mock data
        const mockService = {
          id: serviceId,
          title: "Professional Website Development",
          provider: {
            id: "provider-123",
            name: "Alex Morgan",
            avatar: "/placeholder.svg?height=80&width=80&text=AM",
          },
          packages: {
            Basic: {
              price: 499,
              description: "Basic website with up to 5 pages",
              deliveryTime: "7 days",
            },
            Standard: {
              price: 799,
              description: "Standard website with up to 10 pages and additional features",
              deliveryTime: "10 days",
            },
            Premium: {
              price: 1299,
              description: "Premium website with up to 15 pages and all features",
              deliveryTime: "14 days",
            },
          },
        }

        setService(mockService)
      } catch (err) {
        console.error("Error fetching service:", err)
        setError("Failed to load service details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchService()
  }, [serviceId, user, router, toast])

  useEffect(() => {
    if (providerId) {
      fetchProviderData(providerId)
    }
  }, [providerId])

  const fetchProviderData = async (id: string) => {
    setLoading(true)
    try {
      const supabase = createClientComponentClient()
      // In a real app, you would fetch this from your database
      const { data, error } = await supabase.from("providers").select("*").eq("id", id).single()

      if (error) throw error

      if (data) {
        setSelectedProvider(data)
        // If a package was specified in the URL, select it
        if (packageName && data.packages) {
          const pkg = data.packages.find((p: any) => p.name.toLowerCase() === packageName.toLowerCase())
          if (pkg) {
            setSelectedPackage(pkg)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching provider:", error)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <EnhancedMainNav />
        <main className="container py-10">
          <div className="max-w-md mx-auto p-6 bg-destructive/10 rounded-lg text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">Error</h2>
            <p className="text-destructive">{error}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <EnhancedMainNav />
      <main className="container py-10">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <CheckoutForm service={service} packageName={packageName} userId={user?.id || ""} />
            )}
          </div>

          <div>
            {isLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <OrderSummary service={service} packageName={packageName} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
