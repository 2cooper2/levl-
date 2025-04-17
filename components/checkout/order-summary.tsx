"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, Shield, CheckCircle } from "lucide-react"

interface OrderSummaryProps {
  service: any
  packageName: string
}

export function OrderSummary({ service, packageName }: OrderSummaryProps) {
  const selectedPackage = service.packages[packageName]
  const price = selectedPackage.price
  const platformFee = Math.round(price * 0.05) // 5% platform fee
  const total = price + platformFee

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <h3 className="font-medium">{service.title}</h3>
          </div>
          <div className="flex justify-between text-sm">
            <span>{packageName} Package</span>
            <span>${price.toFixed(2)}</span>
          </div>
          <div className="text-sm text-muted-foreground">{selectedPackage.description}</div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Service Fee</span>
            <span>${platformFee.toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-2 text-sm">
            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <span className="font-medium">Delivery Time</span>
              <p className="text-muted-foreground">{selectedPackage.deliveryTime}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Shield className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <span className="font-medium">Payment Protection</span>
              <p className="text-muted-foreground">
                Payment is released to the provider only when you're satisfied with the work.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <CheckCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <span className="font-medium">Quality Guarantee</span>
              <p className="text-muted-foreground">All services come with our satisfaction guarantee.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
