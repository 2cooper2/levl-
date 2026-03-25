"use client"

import { useState, useEffect } from "react"
import { ServiceComparison } from "@/components/service-comparison"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useSearchParams } from "next/navigation"

interface Service {
  id: string
  title: string
  provider: {
    id: string
    name: string
    avatar_url?: string
    rating?: number
    is_verified?: boolean
  }
  category: {
    id: string
    name: string
  }
  base_price: number
  currency: string
  delivery_time?: string
  description: string
  features?: string[]
  rating?: number
  reviews_count?: number
  completion_rate?: number
}

export default function ComparePage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [saveUrl, setSaveUrl] = useState("")
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true)
      try {
        // Get service IDs from query params
        const ids = searchParams.get("ids")?.split(",").filter(Boolean) || []

        if (ids.length === 0) {
          setServices([])
          setIsLoading(false)
          return
        }

        // In a real app, fetch from API
        // const response = await fetch(`/api/services/batch?ids=${ids.join(",")}`)
        // const data = await response.json()

        // Mock data for demo
        await new Promise((resolve) => setTimeout(resolve, 800))
        const mockServices: Service[] = [
          {
            id: "serv1",
            title: "Professional Website Development",
            provider: {
              id: "prov1",
              name: "John Developer",
              rating: 4.8,
              is_verified: true,
            },
            category: { id: "cat1", name: "Web Development" },
            base_price: 500,
            currency: "USD",
            delivery_time: "7 days",
            description: "Professional website development with responsive design and SEO optimization.",
            features: ["Responsive Design", "SEO Optimization", "Contact Form", "5 Pages"],
            rating: 4.8,
            reviews_count: 124,
            completion_rate: 98,
          },
          {
            id: "serv2",
            title: "E-commerce Website Setup",
            provider: {
              id: "prov2",
              name: "Web Solutions Inc",
              rating: 4.5,
              is_verified: true,
            },
            category: { id: "cat1", name: "Web Development" },
            base_price: 800,
            currency: "USD",
            delivery_time: "14 days",
            description: "Complete e-commerce website setup with payment gateway integration.",
            features: ["Product Management", "Payment Gateway", "Inventory System", "Customer Accounts"],
            rating: 4.5,
            reviews_count: 89,
            completion_rate: 95,
          },
          {
            id: "serv3",
            title: "WordPress Website Design",
            provider: {
              id: "prov3",
              name: "Sarah Designer",
              rating: 4.9,
              is_verified: false,
            },
            category: { id: "cat1", name: "Web Development" },
            base_price: 350,
            currency: "USD",
            delivery_time: "5 days",
            description: "Custom WordPress website design with premium theme installation.",
            features: ["Premium Theme", "Plugin Setup", "Content Upload", "Basic SEO"],
            rating: 4.9,
            reviews_count: 56,
            completion_rate: 100,
          },
        ]

        // Filter services based on IDs in URL
        const filteredServices = mockServices.filter((service) => ids.includes(service.id))
        setServices(filteredServices)
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [searchParams])

  // Generate a shareable URL when services change
  useEffect(() => {
    if (services.length > 0) {
      const ids = services.map((service) => service.id).join(",")
      const url = `${window.location.origin}/compare?ids=${ids}`
      setSaveUrl(url)
    } else {
      setSaveUrl("")
    }
  }, [services])

  const handleCopyUrl = () => {
    navigator.clipboard
      .writeText(saveUrl)
      .then(() => {
        alert("Comparison URL copied to clipboard!")
      })
      .catch((err) => {
        console.error("Could not copy URL: ", err)
      })
  }

  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Compare Services</h1>
          <p className="text-gray-500">Compare services side by side to find your perfect match</p>
        </div>

        {saveUrl && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Input value={saveUrl} readOnly className="max-w-md" />
            <Button onClick={handleCopyUrl}>Copy URL</Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-80">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <ServiceComparison initialServices={services} />
      )}

      <div className="bg-gray-50 dark:bg-gray-800/50 border rounded-lg p-6 mt-8">
        <h2 className="text-xl font-bold mb-4">How to Use the Comparison Tool</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-medium">1. Add Services</h3>
            <p className="text-sm text-gray-500">
              Search for services and add them to your comparison. You can compare up to 4 services at once.
            </p>
          </div>

          <div className="space-y-2">
            <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
                />
              </svg>
            </div>
            <h3 className="font-medium">2. Customize Features</h3>
            <p className="text-sm text-gray-500">
              Select which features are most important to you to customize your comparison view.
            </p>
          </div>

          <div className="space-y-2">
            <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                />
              </svg>
            </div>
            <h3 className="font-medium">3. Share Comparison</h3>
            <p className="text-sm text-gray-500">
              Copy the unique URL to share your comparison with others or save it for later reference.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
