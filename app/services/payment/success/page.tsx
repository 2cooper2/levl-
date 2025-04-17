"use client"

import { CardFooter } from "@/components/ui/card"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const paymentIntentId = searchParams.get("payment_intent")
  const redirectStatus = searchParams.get("redirect_status")

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (paymentIntentId && redirectStatus === "succeeded") {
        try {
          const supabase = createClient()
          const { data, error } = await supabase
            .from("payments")
            .select("*, services(*)")
            .eq("payment_intent_id", paymentIntentId)
            .single()

          if (error) throw error
          setPaymentInfo(data)
        } catch (error) {
          console.error("Error fetching payment details:", error)
        }
      }
      setIsLoading(false)
    }

    fetchPaymentDetails()
  }, [paymentIntentId, redirectStatus])

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>Your booking has been confirmed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading payment details...</p>
          ) : paymentInfo ? (
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium">{paymentInfo.services?.title || "Service"}</span>
              </div>
              <div className="mb-3 flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">${((paymentInfo.amount || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="mb-3 flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{new Date(paymentInfo.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-green-600">Paid</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Your payment was successful, but we couldn't retrieve the details.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/dashboard/bookings">View My Bookings</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/explore">Browse More Services</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
