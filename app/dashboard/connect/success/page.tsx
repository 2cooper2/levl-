"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function ConnectSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Auto-redirect after countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/dashboard")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <EnhancedMainNav />
      <main className="container py-12">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg border-2">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-t-lg border-b">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Stripe Account Connected!</CardTitle>
              <CardDescription className="text-center">
                Your Stripe account has been successfully connected to our platform.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6">
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <p className="text-center text-sm text-muted-foreground">
                  You can now receive payments for your services through our platform.
                  We'll handle the payment processing and transfer the funds directly to your account.
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Redirecting to dashboard in {countdown} seconds...
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-b-lg border-t p-6">
              <Button 
                onClick={() => router.push("/dashboard")} 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  \
}
