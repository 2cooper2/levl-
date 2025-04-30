"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { useToast } from "@/components/ui/use-toast"
import {
  createConnectedAccount,
  createAccountLink,
  getConnectedAccountStatus,
  createDashboardLink,
  updateConnectedAccountStatus,
} from "@/app/actions/payment-actions"
import { useAuth } from "@/context/auth-context"
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"

export default function ConnectPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDashboardLoading, setIsDashboardLoading] = useState(false)
  const [accountStatus, setAccountStatus] = useState<{
    isConnected: boolean
    accountId?: string
    detailsSubmitted?: boolean
    chargesEnabled?: boolean
    payoutsEnabled?: boolean
  } | null>(null)

  useEffect(() => {
    const fetchAccountStatus = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const status = await getConnectedAccountStatus(user.id)
        setAccountStatus(status)

        // If connected, refresh the status from Stripe
        if (status.isConnected && status.accountId) {
          await updateConnectedAccountStatus(user.id, status.accountId)
          // Fetch the updated status
          const updatedStatus = await getConnectedAccountStatus(user.id)
          setAccountStatus(updatedStatus)
        }
      } catch (error) {
        console.error("Error fetching account status:", error)
        setAccountStatus({
          isConnected: false,
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchAccountStatus()
    }
  }, [user])

  const handleConnect = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to connect your Stripe account",
        variant: "destructive",
      })
      router.push("/auth/login?redirect=/dashboard/connect")
      return
    }

    setIsLoading(true)

    try {
      // If the user already has a connected account, redirect to the account link
      if (accountStatus?.accountId) {
        const result = await createAccountLink(
          accountStatus.accountId,
          `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/connect/success`,
        )

        if (result.error) {
          throw new Error(result.error)
        }

        // Redirect to Stripe's account link
        window.location.href = result.url
        return
      }

      // Otherwise, create a new connected account
      const result = await createConnectedAccount(user.id, user.email || "unknown@example.com")

      if (result.error) {
        throw new Error(result.error)
      }

      // Create an account link for the new account
      const linkResult = await createAccountLink(
        result.accountId,
        `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/connect/success`,
      )

      if (linkResult.error) {
        throw new Error(linkResult.error)
      }

      // Redirect to Stripe's account link
      window.location.href = linkResult.url
    } catch (error: any) {
      console.error("Error connecting Stripe account:", error)
      toast({
        title: "Error connecting Stripe account",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewDashboard = async () => {
    if (!accountStatus?.accountId) return

    setIsDashboardLoading(true)
    try {
      const result = await createDashboardLink(accountStatus.accountId)

      if (result.error) {
        throw new Error(result.error)
      }

      // Open Stripe dashboard in a new tab
      window.open(result.url, "_blank")
    } catch (error: any) {
      console.error("Error opening Stripe dashboard:", error)
      toast({
        title: "Error opening Stripe dashboard",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDashboardLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <EnhancedMainNav />
      <main className="container py-12">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg border-2">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-t-lg border-b">
              <CardTitle className="text-2xl">Connect with Stripe</CardTitle>
              <CardDescription>Set up your Stripe account to receive payments for your services</CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {!accountStatus ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : accountStatus.isConnected ? (
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Your Stripe account is connected</h3>
                      <p className="text-sm text-muted-foreground">
                        You can now receive payments for your services through our platform.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Account Status</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${accountStatus.detailsSubmitted ? "bg-green-500" : "bg-red-500"}`}
                        ></div>
                        <span>Details Submitted: {accountStatus.detailsSubmitted ? "Yes" : "No"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${accountStatus.chargesEnabled ? "bg-green-500" : "bg-red-500"}`}
                        ></div>
                        <span>Charges Enabled: {accountStatus.chargesEnabled ? "Yes" : "No"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${accountStatus.payoutsEnabled ? "bg-green-500" : "bg-red-500"}`}
                        ></div>
                        <span>Payouts Enabled: {accountStatus.payoutsEnabled ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleConnect} className="flex-1">
                      Update Stripe Account
                    </Button>
                    <Button
                      onClick={handleViewDashboard}
                      variant="outline"
                      className="flex items-center gap-2"
                      disabled={isDashboardLoading}
                    >
                      {isDashboardLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                      Dashboard
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium">Connect your Stripe account</h3>
                      <p className="text-sm text-muted-foreground">
                        To receive payments for your services, you need to connect your Stripe account. This will allow
                        customers to pay you directly through our platform.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium">What you'll need:</h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>Your legal business name or personal name</li>
                      <li>Your address and phone number</li>
                      <li>Your bank account details for receiving payouts</li>
                      <li>A government-issued ID for verification</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-b-lg border-t p-6">
              {!accountStatus?.isConnected && (
                <Button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect with Stripe"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
