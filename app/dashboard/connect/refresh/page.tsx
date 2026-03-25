"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { RefreshCw, ArrowLeft } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { createAccountLink } from "@/app/actions/payment-actions"
import { useToast } from "@/components/ui/use-toast"

export default function ConnectRefreshPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    // In a real app, you would fetch the provider's Stripe account ID
    // and create a new account link
    const refreshAccountLink = async () => {
      if (!user) return

      try {
        // Mock account ID - in a real app, this would come from your database
        const mockAccountId = "acct_mock_connected_account"

        const result = await createAccountLink(
          mockAccountId,
          `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/connect/success`,
        )

        if (result.error) {
          throw new Error(result.error)
        }

        // Redirect to Stripe's account link
        window.location.href = result.url
      } catch (error: any) {
        console.error("Error refreshing account link:", error)
        toast({
          title: "Error refreshing Stripe session",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    }

    // Auto-refresh after a short delay
    const timer = setTimeout(() => {
      refreshAccountLink()
    }, 1000)

    return () => clearTimeout(timer)
  }, [user, toast])

  return (
    <div className="min-h-screen bg-background">
      <EnhancedMainNav />
      <main className="container py-12">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-t-lg border-b">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <RefreshCw className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Refreshing Stripe Session</CardTitle>
              <CardDescription className="text-center">
                Please wait while we refresh your Stripe Connect session...
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <p className="text-center text-sm text-muted-foreground">
                  Your previous session has expired. We're creating a new session for you to complete your Stripe
                  account setup.
                </p>
              </div>

              <div className="flex justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            </CardContent>

            <CardFooter className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-b-lg border-t p-6">
              <Button onClick={() => router.push("/dashboard/connect")} variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Connect Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
