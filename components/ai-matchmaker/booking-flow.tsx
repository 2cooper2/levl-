"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ChevronRight, Calendar, Clock, CreditCard, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import type { Service } from "@/types/matchmaker"

interface BookingFlowProps {
  service: Service
  onClose: () => void
  onComplete: () => void
}

export function BookingFlow({ service, onClose, onComplete }: BookingFlowProps) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    address: "",
    notes: "",
    paymentMethod: "card",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBookingData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setBookingData((prev) => ({ ...prev, paymentMethod: value }))
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      onClose()
    }
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      // In a real app, this would submit to an API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Booking Confirmed!",
        description: `Your booking with ${service.provider.name} has been confirmed for ${bookingData.date} at ${bookingData.time}.`,
      })

      onComplete()
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold">Book {service.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">with {service.provider.name}</p>
        </div>

        {/* Progress steps */}
        <div className="flex justify-between px-6 pt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= i
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}
              >
                {step > i ? (
                  <Check className="w-4 h-4" />
                ) : i === 1 ? (
                  <Calendar className="w-4 h-4" />
                ) : i === 2 ? (
                  <Clock className="w-4 h-4" />
                ) : i === 3 ? (
                  <User className="w-4 h-4" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
              </div>
              <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                {i === 1 ? "Date" : i === 2 ? "Time" : i === 3 ? "Details" : "Payment"}
              </span>
            </div>
          ))}
        </div>

        {/* Form steps */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-medium mb-4">Select a date</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={bookingData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-medium mb-4">Select a time</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      value={bookingData.time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Estimated duration: {service.timeEstimate}</p>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-medium mb-4">Service details</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Service Address</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Enter your address"
                      value={bookingData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Special Instructions</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Any special requirements or instructions"
                      value={bookingData.notes}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="font-medium mb-4">Payment method</h3>
                <div className="space-y-4">
                  <RadioGroup value={bookingData.paymentMethod} onValueChange={handleRadioChange}>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="cursor-pointer flex-1">
                        Credit/Debit Card
                      </Label>
                      <div className="flex space-x-1">
                        <div className="w-8 h-5 bg-blue-600 rounded"></div>
                        <div className="w-8 h-5 bg-red-500 rounded"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label htmlFor="paypal" className="cursor-pointer flex-1">
                        PayPal
                      </Label>
                      <div className="w-8 h-5 bg-blue-800 rounded"></div>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="cursor-pointer">
                        Cash on Delivery
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
                    <div className="flex justify-between mb-2">
                      <span>Service Price</span>
                      <span>{service.price}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>Service Fee</span>
                      <span>$5.00</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                      <span>Total</span>
                      <span>${(Number.parseFloat(service.price.replace(/[^0-9.]/g, "")) + 5).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={loading}>
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={handleNext}
            disabled={loading || (step === 1 && !bookingData.date) || (step === 2 && !bookingData.time)}
          >
            {loading ? (
              <>
                <span className="mr-2">Processing</span>
                <span className="animate-spin">⟳</span>
              </>
            ) : step < 4 ? (
              <>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
