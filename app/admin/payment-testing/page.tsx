"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, CreditCard } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { PaymentForm } from "@/components/checkout/payment-form"

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

export default function PaymentTestingPage() {
  const { toast } = useToast()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [testMode, setTestMode] = useState<"direct" | "connect">("direct")

  // Form state
  const [amount, setAmount] = useState(1000) // $10.00 by default
  const [providerId, setProviderId] = useState("0c4ebdf3-3421-4f6a-adaf-0df55a85b242") // Test provider ID

  const handleCreateTestPayment = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccess(null)
      setClientSecret(null)

      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          serviceId: "test-service-id",
          providerId,
          description: "Test payment",
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        setError(`Payment intent creation failed: ${response.status} ${response.statusText}`)
        toast({
          title: "Error",
          description: `Failed to create test payment: ${response.status} ${response.statusText}`,
          variant: "destructive",
        })
        return
      }

      const data = await response.json()

      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
        setPaymentIntentId(data.paymentIntentId)
        setSuccess("Payment intent created successfully. You can now test the payment flow.")
        toast({
          title: "Success",
          description: "Payment intent created successfully.",
        })
      } else {
        setError(data.error || "Unknown error creating payment intent")
        toast({
          title: "Error",
          description: data.error || "Unknown error creating payment intent",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Stripe Elements options
  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#7c3aed",
    },
  }

  const options = clientSecret
    ? {
        clientSecret,
        appearance,
      }
    : {}

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Payment Testing Tool</h1>
      <p className="text-muted-foreground mb-8">
        This tool allows administrators to test payment flows without affecting production data.
      </p>

      <Tabs defaultValue="create" className="max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Payment</TabsTrigger>
          <TabsTrigger value="test">Test Payment Flow</TabsTrigger>
          <TabsTrigger value="cards">Test Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Test Payment</CardTitle>
              <CardDescription>Configure a test payment to verify payment processing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (in cents)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={50}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  This will create a payment intent for ${(amount / 100).toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="providerId">Provider ID</Label>
                <Input
                  id="providerId"
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                  placeholder="Provider UUID"
                />
                <p className="text-xs text-muted-foreground">Test provider ID to use for this payment</p>
              </div>

              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="direct"
                      name="testMode"
                      value="direct"
                      checked={testMode === "direct"}
                      onChange={() => setTestMode("direct")}
                      className="mr-2"
                    />
                    <Label htmlFor="direct" className="cursor-pointer">
                      Direct Payment
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="connect"
                      name="testMode"
                      value="connect"
                      checked={testMode === "connect"}
                      onChange={() => setTestMode("connect")}
                      className="mr-2"
                    />
                    <Label htmlFor="connect" className="cursor-pointer">
                      Connected Account
                    </Label>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>{success}</p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleCreateTestPayment} disabled={isLoading} className="w-full">
                {isLoading ? "Creating..." : "Create Test Payment"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Payment Form</CardTitle>
              <CardDescription>Complete a test payment using Stripe's test cards</CardDescription>
            </CardHeader>
            <CardContent>
              {!clientSecret ? (
                <div className="text-center py-12">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Active Payment</h3>
                  <p className="text-muted-foreground mb-4">Create a test payment first to see the payment form</p>
                  <Button variant="outline" onClick={() => document.getElementById("create-tab")?.click()}>
                    Go to Create Payment
                  </Button>
                </div>
              ) : (
                <Elements stripe={stripePromise} options={options}>
                  <PaymentForm
                    clientSecret={clientSecret}
                    paymentIntentId={paymentIntentId || ""}
                    amount={amount}
                    serviceId="test-service-id"
                    providerId={providerId}
                    isConnectedAccount={testMode === "connect"}
                  />
                </Elements>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Cards</CardTitle>
              <CardDescription>Use these card numbers to test different payment scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Successful Payment</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Card Number</p>
                      <code className="text-sm bg-muted p-1 rounded">4242 4242 4242 4242</code>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Expiry Date</p>
                      <code className="text-sm bg-muted p-1 rounded">Any future date</code>
                    </div>
                    <div>
                      <p className="text-sm font-medium">CVC</p>
                      <code className="text-sm bg-muted p-1 rounded">Any 3 digits</code>
                    </div>
                    <div>
                      <p className="text-sm font-medium">ZIP</p>
                      <code className="text-sm bg-muted p-1 rounded">Any 5 digits</code>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Declined Payment</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Card Number</p>
                      <code className="text-sm bg-muted p-1 rounded">4000 0000 0000 0002</code>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Expiry Date</p>
                      <code className="text-sm bg-muted p-1 rounded">Any future date</code>
                    </div>
                    <div>
                      <p className="text-sm font-medium">CVC</p>
                      <code className="text-sm bg-muted p-1 rounded">Any 3 digits</code>
                    </div>
                    <div>
                      <p className="text-sm font-medium">ZIP</p>
                      <code className="text-sm bg-muted p-1 rounded">Any 5 digits</code>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Authentication Required</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Card Number</p>
                      <code className="text-sm bg-muted p-1 rounded">4000 0025 0000 3155</code>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Expiry Date</p>
                      <code className="text-sm bg-muted p-1 rounded">Any future date</code>
                    </div>
                    <div>
                      <p className="text-sm font-medium">CVC</p>
                      <code className="text-sm bg-muted p-1 rounded">Any 3 digits</code>
                    </div>
                    <div>
                      <p className="text-sm font-medium">ZIP</p>
                      <code className="text-sm bg-muted p-1 rounded">Any 5 digits</code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
