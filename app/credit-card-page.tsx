"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CreditCardPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4">Enter Credit Card Information</h2>
        <form className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input type="text" id="cardNumber" placeholder="XXXX-XXXX-XXXX-XXXX" />
          </div>
          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input type="text" id="expiryDate" placeholder="MM/YY" />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input type="text" id="cvv" placeholder="CVV" />
          </div>
          <div>
            <Button className="w-full">Submit</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
