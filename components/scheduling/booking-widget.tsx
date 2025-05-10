"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Clock, ChevronRight } from "lucide-react"
import { format, addDays } from "date-fns"
import { cn } from "@/lib/utils"

interface TimeSlot {
  id: string
  time: string
  available: boolean
}

interface BookingWidgetProps {
  serviceId: string
  serviceName: string
  providerId: string
  providerName: string
  onBookingCreated?: (booking: any) => void
  className?: string
}

export function BookingWidget({
  serviceId,
  serviceName,
  providerId,
  providerName,
  onBookingCreated,
  className,
}: BookingWidgetProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const [step, setStep] = useState<"date" | "time" | "details">("date")
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    meetingType: "video",
    location: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)

  // Mock time slots - in a real app, these would be fetched based on the selected date
  const getTimeSlots = (date: Date): TimeSlot[] => {
    // Generate time slots from 9 AM to 5 PM
    const slots: TimeSlot[] = []
    const baseHours = [9, 10, 11, 12, 13, 14, 15, 16]
    const minutes = [0, 30]

    baseHours.forEach((hour) => {
      minutes.forEach((minute) => {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

        // Randomly mark some slots as unavailable for demo purposes
        const isAvailable = Math.random() > 0.3

        slots.push({
          id: `${date.toISOString().split("T")[0]}-${time}`,
          time,
          available: isAvailable,
        })
      })
    })

    return slots
  }

  const timeSlots = getTimeSlots(date)

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate)
      setStep("time")
    }
  }

  const handleTimeSelect = (slotId: string) => {
    setSelectedTimeSlot(slotId)
    setStep("details")
  }

  const handleSubmit = async () => {
    if (!selectedTimeSlot) return

    setIsSubmitting(true)

    try {
      // In a real app, you would send this data to your backend
      const [dateStr, timeStr] = selectedTimeSlot.split("-")
      const bookingDate = new Date(`${dateStr}T${timeStr}:00`)

      const bookingData = {
        serviceId,
        serviceName,
        providerId,
        providerName,
        clientName: bookingDetails.name,
        clientEmail: bookingDetails.email,
        startTime: bookingDate.toISOString(),
        endTime: new Date(bookingDate.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
        meetingType: bookingDetails.meetingType,
        location: bookingDetails.location,
        notes: bookingDetails.notes,
        status: "pending",
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (onBookingCreated) {
        onBookingCreated(bookingData)
      }

      setBookingConfirmed(true)
    } catch (error) {
      console.error("Error creating booking:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToDate = () => {
    setStep("date")
    setSelectedTimeSlot(null)
  }

  const handleBackToTime = () => {
    setStep("time")
  }

  const renderDateStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Select a Date</h3>
        <p className="text-sm text-gray-500">Choose a date for your appointment</p>
      </div>

      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateSelect}
        className="rounded-md border mx-auto"
        disabled={(date) => {
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return date < today || date > addDays(today, 30)
        }}
      />

      <div className="text-center text-sm text-gray-500">Available booking dates for the next 30 days</div>
    </div>
  )

  const renderTimeStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={handleBackToDate}>
          <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
          Back
        </Button>
        <div className="text-center">
          <h3 className="text-lg font-medium">Select a Time</h3>
          <p className="text-sm text-gray-500">{format(date, "EEEE, MMMM d, yyyy")}</p>
        </div>
        <div className="w-16"></div> {/* Spacer for alignment */}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {timeSlots.map((slot) => (
          <Button
            key={slot.id}
            variant="outline"
            className={cn(
              "justify-start h-auto py-3",
              !slot.available && "opacity-50 cursor-not-allowed",
              slot.id === selectedTimeSlot && "border-primary",
            )}
            disabled={!slot.available}
            onClick={() => handleTimeSelect(slot.id)}
          >
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span>{format(new Date(`2000-01-01T${slot.time}`), "h:mm a")}</span>
            {!slot.available && (
              <Badge variant="outline" className="ml-auto">
                Unavailable
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {timeSlots.every((slot) => !slot.available) && (
        <div className="text-center text-sm text-gray-500 mt-4">
          No available time slots for this date. Please select another date.
        </div>
      )}
    </div>
  )

  const renderDetailsStep = () => {
    if (!selectedTimeSlot) return null

    const [dateStr, timeStr] = selectedTimeSlot.split("-")
    const bookingDate = new Date(`${dateStr}T${timeStr}:00`)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={handleBackToTime}>
            <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
            Back
          </Button>
          <div className="text-center">
            <h3 className="text-lg font-medium">Booking Details</h3>
            <p className="text-sm text-gray-500">
              {format(bookingDate, "EEEE, MMMM d, yyyy")} at {format(bookingDate, "h:mm a")}
            </p>
          </div>
          <div className="w-16"></div> {/* Spacer for alignment */}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={bookingDetails.name}
              onChange={(e) => setBookingDetails({ ...bookingDetails, name: e.target.value })}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={bookingDetails.email}
              onChange={(e) => setBookingDetails({ ...bookingDetails, email: e.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <Label htmlFor="meetingType">Meeting Type</Label>
            <Select
              value={bookingDetails.meetingType}
              onValueChange={(value) => setBookingDetails({ ...bookingDetails, meetingType: value })}
            >
              <SelectTrigger id="meetingType">
                <SelectValue placeholder="Select meeting type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video Call</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="in-person">In Person</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {bookingDetails.meetingType === "in-person" && (
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={bookingDetails.location}
                onChange={(e) => setBookingDetails({ ...bookingDetails, location: e.target.value })}
                placeholder="Enter meeting location"
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={bookingDetails.notes}
              onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
              placeholder="Add any additional information or questions"
              rows={3}
            />
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting || !bookingDetails.name || !bookingDetails.email}
        >
          {isSubmitting ? "Confirming..." : "Confirm Booking"}
        </Button>
      </div>
    )
  }

  const renderConfirmation = () => {
    if (!selectedTimeSlot) return null

    const [dateStr, timeStr] = selectedTimeSlot.split("-")
    const bookingDate = new Date(`${dateStr}T${timeStr}:00`)

    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 text-green-600"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h3 className="text-xl font-bold">Booking Confirmed!</h3>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <p className="font-medium">{serviceName}</p>
          <p className="text-sm text-gray-500">with {providerName}</p>

          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm">
              {format(bookingDate, "EEEE, MMMM d, yyyy")}
              <br />
              {format(bookingDate, "h:mm a")} - {format(new Date(bookingDate.getTime() + 60 * 60 * 1000), "h:mm a")}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-500">A confirmation email has been sent to {bookingDetails.email}</p>

        <div className="pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setBookingConfirmed(false)
              setStep("date")
              setSelectedTimeSlot(null)
              setBookingDetails({
                name: "",
                email: "",
                meetingType: "video",
                location: "",
                notes: "",
              })
            }}
          >
            Book Another Appointment
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Book an Appointment</CardTitle>
        <CardDescription>
          Schedule a session with {providerName} for {serviceName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bookingConfirmed ? (
          renderConfirmation()
        ) : (
          <>
            {step === "date" && renderDateStep()}
            {step === "time" && renderTimeStep()}
            {step === "details" && renderDetailsStep()}
          </>
        )}
      </CardContent>
    </Card>
  )
}
