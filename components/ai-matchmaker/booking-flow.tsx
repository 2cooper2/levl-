"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, CheckCircle, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from "next/image"
import type { Service } from "@/types/matchmaker"

interface BookingFlowProps {
  service: Service
  onComplete: () => void
  onCancel: () => void
}

export function BookingFlow({ service, onComplete, onCancel }: BookingFlowProps) {
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("credit")
  const [specialRequests, setSpecialRequests] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)

  // Available dates (next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i + 1)
    return date.toISOString().split("T")[0]
  })

  // Available time slots
  const availableTimeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ]

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setBookingComplete(true)

    // After showing success message, call onComplete
    setTimeout(() => {
      onComplete()
    }, 2000)
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="bg-indigo-600 p-6 text-white">
            <h2 className="text-xl font-semibold">Book Service</h2>
            <p className="text-indigo-100 mt-1">Complete your booking in a few simple steps</p>

            {/* Progress indicator */}
            <div className="flex items-center mt-4">
              <div className={`h-2 w-1/3 rounded-l-full ${step >= 1 ? "bg-white" : "bg-indigo-400"}`}></div>
              <div className={`h-2 w-1/3 ${step >= 2 ? "bg-white" : "bg-indigo-400"}`}></div>
              <div className={`h-2 w-1/3 rounded-r-full ${step >= 3 ? "bg-white" : "bg-indigo-400"}`}></div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {bookingComplete ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Your appointment has been scheduled for {formatDate(selectedDate)} at {selectedTime}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">A confirmation has been sent to your email</p>
              </motion.div>
            ) : (
              <>
                {/* Step 1: Service details and date selection */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={service.image || "/placeholder.svg"}
                          alt={service.title}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{service.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{service.price}</p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>Provider: {service.provider.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <Label className="mb-2 block">Select a date</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableDates.map((date) => (
                          <button
                            key={date}
                            type="button"
                            onClick={() => setSelectedDate(date)}
                            className={`p-2 text-center text-sm rounded-md border ${
                              selectedDate === date
                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                : "border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            {formatDate(date)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={() => setStep(2)}
                        disabled={!selectedDate}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Continue
                        <ChevronRight className="hidden md:block ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Time selection and special requests */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="mb-6">
                      <Label className="mb-2 block">Select a time</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {availableTimeSlots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`p-2 text-center text-sm rounded-md border ${
                              selectedTime === time
                                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                                : "border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <Label htmlFor="special-requests" className="mb-2 block">
                        Special requests (optional)
                      </Label>
                      <Textarea
                        id="special-requests"
                        placeholder="Any special requirements or notes for the service provider..."
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        <ChevronLeft className="hidden md:block mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        disabled={!selectedTime}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Continue
                        <ChevronRight className="hidden md:block ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment and confirmation */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="mb-6">
                      <Label className="mb-2 block">Payment method</Label>
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value="credit" id="credit" />
                          <Label htmlFor="credit" className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                            Credit Card
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value="paypal" id="paypal" />
                          <Label htmlFor="paypal">PayPal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="wallet" id="wallet" />
                          <Label htmlFor="wallet">LEVL Wallet</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium mb-2">Booking Summary</h4>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Service:</span>
                          <span>{service.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Date:</span>
                          <span>{formatDate(selectedDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Time:</span>
                          <span>{selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Provider:</span>
                          <span>{service.provider.name}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>{service.price}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setStep(2)}>
                        <ChevronLeft className="hidden md:block mr-2 h-4 w-4" />
                        Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {isSubmitting ? "Processing..." : "Confirm Booking"}
                        {!isSubmitting && <CheckCircle className="hidden md:block ml-2 h-4 w-4" />}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Separator component
function Separator({ className }: { className?: string }) {
  return <div className={`h-px bg-gray-200 dark:bg-gray-700 ${className || ""}`}></div>
}
