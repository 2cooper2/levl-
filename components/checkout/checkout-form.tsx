"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createServicePayment } from "@/app/actions/stripe-actions"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface CheckoutFormProps {
  service: any
  packageName: string
  userId: string
}

// Wrapper component to provide Stripe Elements
export function CheckoutForm({ service, packageName, userId }: CheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormContent service={service} packageName={packageName} userId={userId} />
    </Elements>
  )
}

// Main form component
function CheckoutFormContent({ service, packageName, userId }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  })
  const [projectDetails, setProjectDetails] = useState("")
  const [error, setError] = useState<string | null>(null)

  const selectedPackage = service.packages[packageName]
  const amount = selectedPackage.price * 100 // Convert to cents for Stripe

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBillingDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setError("Card element not found")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create payment intent on the server
      const { clientSecret, error: paymentError } = await createServicePayment({
        amount,
        serviceId: service.id,
        providerId: service.provider.id,
        userId,
        packageName,
        projectDetails,
      })

      if (paymentError || !clientSecret) {
        throw new Error(paymentError || "Failed to create payment")
      }

      // Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: billingDetails.name,
            email: billingDetails.email,
            address: {
              line1: billingDetails.address,
              city: billingDetails.city,
              state: billingDetails.state,
              postal_code: billingDetails.zip,
              country: billingDetails.country,
            },
          },
        },
        return_url: `${window.location.origin}/services/payment/success`,
      })

      if (stripeError) {
        throw new Error(stripeError.message || "Payment failed")
      }

      if (paymentIntent.status === "succeeded") {
        // Payment succeeded
        toast({
          title: "Payment successful!",
          description: `Your booking for ${service.title} has been confirmed.`,
        })

        // Redirect to success page
        router.push(`/checkout/success?serviceId=${service.id}&package=${packageName}`)
      }
    } catch (err: any) {
      console.error("Payment error:", err)
      setError(err.message || "An error occurred during payment processing")
      toast({
        title: "Payment failed",
        description: err.message || "An error occurred during payment processing",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Complete your booking for {service.title} ({packageName} Package)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="card" onValueChange={setPaymentMethod}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="card">Credit Card</TabsTrigger>
              <TabsTrigger value="paypal" disabled>
                PayPal
              </TabsTrigger>
            </TabsList>
            <TabsContent value="card" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Card Information</Label>
                <div className="border rounded-md p-3">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#424770",
                          "::placeholder": {
                            color: "#aab7c4",
                          },
                        },
                        invalid: {
                          color: "#9e2146",
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Billing Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={billingDetails.name} onChange={handleBillingChange} required />
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
                <Input id="city" name="city" value={billingDetails.city} onChange={handleBillingChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input id="state" name="state" value={billingDetails.state} onChange={handleBillingChange} required />
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

          <div className="space-y-2">
            <Label htmlFor="project-details">Project Details</Label>
            <Textarea
              id="project-details"
              placeholder="Describe your project requirements and any specific details the service provider should know..."
              value={projectDetails}
              onChange={(e) => setProjectDetails(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
            disabled={!stripe || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${selectedPackage.price.toFixed(2)}`
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
