"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useAuth } from "@/context/auth-context"
import {
  createProviderConnectAccount,
  generateOnboardingLink,
  getConnectAccountStatus,
} from "@/app/actions/stripe-actions"
import { CheckCircle, AlertCircle, ArrowRight } from "lucide-react"

export default function ConnectAccountPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [accountStatus, setAccountStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      loadAccountStatus()
    }
  }, [user])

  const loadAccountStatus = async () => {
    if (!user) return

    try {
      const status = await getConnectAccountStatus(user.id)
      setAccountStatus(status)
    } catch (err) {
      console.error("Error loading account status:", err)
    }
  }

  const handleConnectAccount = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      // Create Connect account if it doesn't exist
      const accountResult = await createProviderConnectAccount(user.id, user.email, user.name)

      if (!accountResult.success) {
        setError("Failed to create Connect account. Please try again.")
        return
      }

      // Generate onboarding link
      const returnUrl = `${window.location.origin}/dashboard/payments/success`
      const linkResult = await generateOnboardingLink(user.id, returnUrl)

      if (!linkResult.success || !linkResult.url) {
        setError("Failed to generate onboarding link. Please try again.")
        return
      }

      // Redirect to Stripe onboarding
      window.location.href = linkResult.url
    } catch (err) {
      console.error("Connect error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Connect Stripe Account"
        text="Set up your Stripe account to receive payments from clients."
      />

      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Stripe Connect</CardTitle>
          <CardDescription>
            Connect your Stripe account to receive payments directly to your bank account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accountStatus?.exists ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-full ${accountStatus.details_submitted ? "bg-green-100" : "bg-amber-100"}`}
                >
                  {accountStatus.details_submitted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Account Details</p>
                  <p className="text-sm text-muted-foreground">
                    {accountStatus.details_submitted ? "Completed" : "Incomplete"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${accountStatus.charges_enabled ? "bg-green-100" : "bg-amber-100"}`}>
                  {accountStatus.charges_enabled ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Payments</p>
                  <p className="text-sm text-muted-foreground">
                    {accountStatus.charges_enabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${accountStatus.payouts_enabled ? "bg-green-100" : "bg-amber-100"}`}>
                  {accountStatus.payouts_enabled ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Payouts</p>
                  <p className="text-sm text-muted-foreground">
                    {accountStatus.payouts_enabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="mb-4">
                You haven't connected a Stripe account yet. Connect your account to start receiving payments.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleConnectAccount}
            disabled={isLoading}
            className="w-full gap-2 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
          >
            {accountStatus?.exists ? "Update Account Details" : "Connect Stripe Account"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </DashboardShell>
  )
}
