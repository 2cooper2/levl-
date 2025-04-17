"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { CardElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { createPaymentIntent } from "@/app/actions/payment-actions"
import { Loader2 } from "lucide-react"

// Add this near the top of the component, after the imports
console.log("Stripe Checkout Page Loading")

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

export default function StripeCheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <StripeCheckout />
    </Elements>
  )
}

function StripeCheckout() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
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

  // Get parameters from URL
  const providerId = searchParams.get("providerId") || ""
  const providerName = searchParams.get("providerName") || "Provider"
  const hours = Number(searchParams.get("hours") || "0")
  const amount = Number(searchParams.get("amount") || "0")
  const serviceTitle = searchParams.get("serviceTitle") || "Service"

  // And add this inside the StripeCheckout component
  useEffect(() => {
    console.log("Stripe Checkout mounted with params:", {
      providerId,
      providerName,
      hours,
      amount,
      serviceTitle,
    })
  }, [providerId, providerName, hours, amount, serviceTitle])

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
      setErrorMessage("Card element not found")
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      // Create payment intent on the server
      const { clientSecret, error: paymentError } = await createPaymentIntent({
        amount,
        providerId,
        hours,
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
        setIsSuccess(true)
        toast({
          title: "Payment successful!",
          description: `You have successfully booked ${hours} hours with ${providerName}.`,
        })
        router.push("/dashboard/bookings")
      }
    } catch (err: any) {
      console.error("Payment error:", err)
      setErrorMessage(err.message || "An error occurred during payment processing")
      toast({
        title: "Payment failed",
        description: err.message || "An error occurred during payment processing",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
                  Enter your payment information to book {hours} hours with {providerName}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
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

                  <div className="space-y-2">
                    <Label htmlFor="project-details">Project Details</Label>
                    <textarea
                      id="project-details"
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Describe your project requirements and any specific details the service provider should know..."
                      value={projectDetails}
                      onChange={(e) => setProjectDetails(e.target.value)}
                    />
                  </div>

                  {errorMessage && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{errorMessage}</div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800"
                    disabled={!stripe || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Pay ${amount.toFixed(2)}`
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
                  <p>{serviceTitle}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Provider</p>
                  <p>{providerName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Hours</p>
                  <p>{hours} hours</p>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span>Hourly Rate</span>
                  <span>${(amount / hours).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hours</span>
                  <span>× {hours}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
