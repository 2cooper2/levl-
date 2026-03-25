"use client"

import { useState } from "react"
import { AvailabilityCalendar } from "@/components/scheduling/availability-calendar"
import { BookingWidget } from "@/components/scheduling/booking-widget"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import type { Database } from "@/types/database.types"

export default function SchedulingPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isProvider, setIsProvider] = useState(true)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  // In a real app, fetch user data and determine if they're a provider
  // For demo purposes, we'll allow toggling between provider and client views

  const handleBookingCreated = (booking: any) => {
    console.log("Booking created:", booking)
    // In a real app, you would save this to your database
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Scheduling</h1>
          <p className="text-gray-500">Manage your availability and bookings</p>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant={isProvider ? "default" : "outline"} onClick={() => setIsProvider(true)}>
            Provider View
          </Button>
          <Button variant={!isProvider ? "default" : "outline"} onClick={() => setIsProvider(false)}>
            Client View
          </Button>
        </div>
      </div>

      {isProvider ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AvailabilityCalendar userId="provider123" isProvider={true} />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>Your next scheduled appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Website Consultation</h3>
                        <p className="text-sm text-gray-500">Today, 2:00 PM - 3:00 PM</p>
                        <p className="text-sm mt-1">with John Smith</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Logo Design Review</h3>
                        <p className="text-sm text-gray-500">Tomorrow, 10:00 AM - 11:00 AM</p>
                        <p className="text-sm mt-1">with Emily Johnson</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Mobile App Feedback</h3>
                        <p className="text-sm text-gray-500">May 17, 11:00 AM - 12:00 PM</p>
                        <p className="text-sm mt-1">with Michael Brown</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Your scheduling activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4 text-center">
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-sm text-gray-500">Upcoming</p>
                  </div>
                  <div className="border rounded-md p-4 text-center">
                    <p className="text-3xl font-bold">3</p>
                    <p className="text-sm text-gray-500">Pending</p>
                  </div>
                  <div className="border rounded-md p-4 text-center">
                    <p className="text-3xl font-bold">85%</p>
                    <p className="text-sm text-gray-500">Availability</p>
                  </div>
                  <div className="border rounded-md p-4 text-center">
                    <p className="text-3xl font-bold">24</p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AvailabilityCalendar userId="client123" isProvider={false} />
          </div>

          <div className="space-y-6">
            <BookingWidget
              serviceId="service123"
              serviceName="Web Development Consultation"
              providerId="provider123"
              providerName="Jane Doe"
              onBookingCreated={handleBookingCreated}
            />

            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>Your scheduled appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Website Consultation</h3>
                        <p className="text-sm text-gray-500">Today, 2:00 PM - 3:00 PM</p>
                        <p className="text-sm mt-1">with Jane Doe</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    View All Bookings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
