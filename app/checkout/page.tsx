"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Get parameters from URL
  const serviceId = searchParams.get("serviceId") || ""
  const providerId = searchParams.get("providerId") || ""
  const hourlyRate = Number(searchParams.get("hourlyRate") || "0")

  const [hours, setHours] = useState(10) // Default to 10 hours
  const [isLoading, setIsLoading] = useState(false)
  const [service, setService] = useState<any>(null)
  const [provider, setProvider] = useState<any>(null)
  const [billingDetails, setBillingDetails] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  })
  const [projectDetails, setProjectDetails] = useState("")

  useEffect(() => {
    // Fetch service and provider details
    const fetchDetails = async () => {
      try {
        // In a real app, you would fetch from your API
        // For now, we'll use mock data
        setService({
          id: serviceId,
          title: "Professional Website Development",
        })

        setProvider({
          id: providerId,
          name: "Alex Morgan",
          hourlyRate: hourlyRate || 85,
        })
      } catch (error) {
        console.error("Error fetching details:", error)
        toast({
          title: "Error",
          description: "Failed to load service details",
          variant: "destructive",
        })
      }
    }

    fetchDetails()
  }, [serviceId, providerId, hourlyRate, router, toast])

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBillingDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (!isNaN(value) && value > 0) {
      setHours(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real app, you would submit to your API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Order placed successfully!",
        description: `You have booked ${hours} hours with ${provider?.name}`,
      })

      // Redirect to success page
      router.push(`/checkout/success?serviceId=${serviceId}&hours=${hours}`)
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout failed",
        description: "There was an error processing your order",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!service || !provider) {
    return (
      <div className="min-h-screen bg-background">
        <EnhancedMainNav />
        <main className="container py-10">
          <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  const totalAmount = hours * provider.hourlyRate

  return (
    <div className="min-h-screen bg-background">
      <EnhancedMainNav />
      <main className="container py-10">
        <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Booking</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
                <CardDescription>
                  Enter your payment information to book {hours} hours with {provider.name}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Project Details</h3>
                    <div className="space-y-2">
                      <Label htmlFor="hours">Number of Hours</Label>
                      <Input
                        id="hours"
                        type="number"
                        min="1"
                        value={hours}
                        onChange={handleHoursChange}
                        className="max-w-[200px]"
                      />
                      <p className="text-sm text-muted-foreground">Minimum booking is 1 hour</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-details">Project Requirements</Label>
                      <Textarea
                        id="project-details"
                        placeholder="Describe your project requirements and any specific details the service provider should know..."
                        value={projectDetails}
                        onChange={(e) => setProjectDetails(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Billing Information</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={billingDetails.name}
                          onChange={handleBillingChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={billingDetails.email}
                          onChange={handleBillingChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={billingDetails.address}
                        onChange={handleBillingChange}
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={billingDetails.city}
                          onChange={handleBillingChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          name="state"
                          value={billingDetails.state}
                          onChange={handleBillingChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP/Postal Code</Label>
                        <Input id="zip" name="zip" value={billingDetails.zip} onChange={handleBillingChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <select
                          id="country"
                          name="country"
                          value={billingDetails.country}
                          onChange={(e) => setBillingDetails((prev) => ({ ...prev, country: e.target.value }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          required
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GB">United Kingdom</option>
                          <option value="AU">Australia</option>
                          <option value="DE">Germany</option>
                          <option value="FR">France</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Complete Booking - $${totalAmount.toFixed(2)}`
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Service</p>
                  <p>{service.title}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Provider</p>
                  <p>{provider.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Hours</p>
                  <p>{hours} hours</p>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span>Hourly Rate</span>
                  <span>${provider.hourlyRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hours</span>
                  <span>× {hours}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
