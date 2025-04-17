"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, MessageSquare, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const serviceId = searchParams.get("serviceId")
  const packageName = searchParams.get("package")

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true)

        // In a real app, you would fetch the actual order details from your database
        // For now, we'll use mock data
        const mockOrderDetails = {
          id: "order-" + Math.random().toString(36).substring(2, 9),
          serviceId,
          packageName,
          service: {
            title: "Professional Website Development",
            provider: {
              name: "Alex Morgan",
            },
          },
          amount: packageName === "Basic" ? 499 : packageName === "Premium" ? 1299 : 799,
          date: new Date().toISOString(),
          deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 10 days from now
        }

        setOrderDetails(mockOrderDetails)
      } catch (error) {
        console.error("Error fetching order details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (serviceId && packageName) {
      fetchOrderDetails()
    } else {
      router.push("/")
    }
  }, [serviceId, packageName, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <EnhancedMainNav />
        <main className="container py-10">
          <div className="max-w-md mx-auto text-center">
            <p>Loading order details...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <EnhancedMainNav />
      <main className="container py-10">
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-green-200">
            <CardHeader className="text-center pb-4">
              <motion.div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CheckCircle className="h-10 w-10 text-green-600" />
              </motion.div>
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
              <CardDescription>Your booking has been confirmed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID:</span>
                  <span className="font-medium">{orderDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium">{orderDetails.service.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package:</span>
                  <span className="font-medium">{orderDetails.packageName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="font-medium">{orderDetails.service.provider.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">${orderDetails.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{new Date(orderDetails.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Delivery:</span>
                  <span className="font-medium">{orderDetails.deliveryDate}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <span className="font-medium">What's Next?</span>
                    <p className="text-muted-foreground">
                      The service provider will contact you shortly to discuss your project details.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Communication</span>
                    <p className="text-muted-foreground">
                      All communication and file sharing will happen through our platform.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
              >
                <Link href="/dashboard/bookings">
                  View My Bookings <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/explore">Browse More Services</Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
