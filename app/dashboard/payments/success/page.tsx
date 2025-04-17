"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function ConnectSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // You could verify the account status here
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle>Account Connected!</CardTitle>
          <CardDescription>Your Stripe account has been successfully connected.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            You can now receive payments for your services on LevL. Funds will be transferred directly to your bank
            account.
          </p>

          <Button onClick={() => router.push("/dashboard")} className="mx-auto">
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
