"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { getUserPayments } from "@/app/actions/stripe-actions"
import { useAuth } from "@/context/auth-context"
import { formatAmountForDisplay } from "@/lib/stripe"
import { CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react"

export default function PaymentsPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("received")
  const router = useRouter()

  useEffect(() => {
    if (user) {
      loadPayments()
    }
  }, [user, activeTab])

  const loadPayments = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const role = activeTab === "received" ? "provider" : "client"
      const result = await getUserPayments(user.id, role)

      if (result.success) {
        setPayments(result.payments || [])
      }
    } catch (err) {
      console.error("Error loading payments:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Paid</span>
          </div>
        )
      case "failed":
        return (
          <div className="flex items-center gap-1 text-red-600">
            <XCircle className="h-4 w-4" />
            <span>Failed</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1 text-amber-600">
            <Clock className="h-4 w-4" />
            <span>Pending</span>
          </div>
        )
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Payments" text="Manage your payments and transaction history." />

      <Tabs defaultValue="received" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="received">Payments Received</TabsTrigger>
          <TabsTrigger value="made">Payments Made</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payments Received</CardTitle>
              <CardDescription>Payments you've received for your services.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-6">Loading payments...</div>
              ) : payments.length === 0 ? (
                <div className="text-center py-6">
                  <p className="mb-4">You haven't received any payments yet.</p>
                  {!user?.charges_enabled && (
                    <Button onClick={() => router.push("/dashboard/payments/connect")} className="gap-2">
                      Connect Stripe Account <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{payment.service?.title || "Service"}</p>
                        <p className="text-sm text-muted-foreground">From: {payment.client?.name || "Client"}</p>
                        <p className="text-sm">{new Date(payment.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatAmountForDisplay(payment.amount)}</p>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="made" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payments Made</CardTitle>
              <CardDescription>Payments you've made for services.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-6">Loading payments...</div>
              ) : payments.length === 0 ? (
                <div className="text-center py-6">
                  <p className="mb-4">You haven't made any payments yet.</p>
                  <Button onClick={() => router.push("/explore")} className="gap-2">
                    Browse Services <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{payment.service?.title || "Service"}</p>
                        <p className="text-sm text-muted-foreground">To: {payment.provider?.name || "Provider"}</p>
                        <p className="text-sm">{new Date(payment.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatAmountForDisplay(payment.amount)}</p>
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
