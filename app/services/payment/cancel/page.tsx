"use client"

import { CardFooter } from "@/components/ui/card"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <AlertCircle className="h-10 w-10 text-amber-500" />
          </div>
          <CardTitle>Payment Cancelled</CardTitle>
          <CardDescription>Your payment was not completed.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            Your payment process was cancelled or interrupted. No charges have been made to your account.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/dashboard/bookings">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/explore">Browse More Services</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
