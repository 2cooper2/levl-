"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState } from "react"

export default function CheckoutPage({ params }: { params: { serviceId: string } }) {
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [nameOnCard, setNameOnCard] = useState("")

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    // In a real application, you would integrate with a payment gateway like Stripe or PayPal here.
    alert("Payment processed successfully!")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-4">
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>Enter your payment information to complete your purchase.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nameOnCard">Name on Card</Label>
              <Input
                type="text"
                id="nameOnCard"
                placeholder="John Doe"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                type="text"
                id="cardNumber"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    type="text"
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    type="text"
                    id="cvv"
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Pay Now
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
