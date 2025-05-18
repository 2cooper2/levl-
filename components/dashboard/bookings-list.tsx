"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, MessageSquare } from "lucide-react"
import { motion } from "framer-motion"

interface BookingsListProps {
  status?: "upcoming" | "pending" | "completed" | "all"
  limit?: number
}

export function BookingsList({ status = "all", limit }: BookingsListProps) {
  const allBookings = [
    {
      id: 1,
      service: "Website Development",
      client: {
        name: "Alex Morgan",
        avatar: "/placeholder.svg?height=40&width=40&text=AM",
      },
      date: "2023-10-15",
      time: "10:00 AM",
      duration: "1 hour",
      status: "upcoming",
    },
    {
      id: 2,
      service: "Logo Design Consultation",
      client: {
        name: "Sarah Chen",
        avatar: "/placeholder.svg?height=40&width=40&text=SC",
      },
      date: "2023-10-16",
      time: "2:30 PM",
      duration: "45 minutes",
      status: "upcoming",
    },
    {
      id: 3,
      service: "Content Strategy Session",
      client: {
        name: "James Wilson",
        avatar: "/placeholder.svg?height=40&width=40&text=JW",
      },
      date: "2023-10-12",
      time: "11:15 AM",
      duration: "1 hour",
      status: "pending",
    },
    {
      id: 4,
      service: "Social Media Audit",
      client: {
        name: "Emma Davis",
        avatar: "/placeholder.svg?height=40&width=40&text=ED",
      },
      date: "2023-10-10",
      time: "3:00 PM",
      duration: "2 hours",
      status: "completed",
    },
    {
      id: 5,
      service: "Mobile App Consultation",
      client: {
        name: "Michael Zhang",
        avatar: "/placeholder.svg?height=40&width=40&text=MZ",
      },
      date: "2023-10-08",
      time: "9:30 AM",
      duration: "1.5 hours",
      status: "completed",
    },
    {
      id: 6,
      service: "Video Editing Review",
      client: {
        name: "Olivia Johnson",
        avatar: "/placeholder.svg?height=40&width=40&text=OJ",
      },
      date: "2023-10-18",
      time: "4:00 PM",
      duration: "1 hour",
      status: "pending",
    },
  ]

  const filteredBookings = status === "all" ? allBookings : allBookings.filter((booking) => booking.status === status)

  const limitedBookings = limit ? filteredBookings.slice(0, limit) : filteredBookings

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-lavender-500">Upcoming</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
            Pending
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {limitedBookings.length === 0 ? (
        <p className="text-center text-muted-foreground py-4">No bookings found.</p>
      ) : (
        limitedBookings.map((booking, index) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={booking.client.avatar || "/placeholder.svg"} alt={booking.client.name} />
                      <AvatarFallback>{booking.client.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{booking.service}</h4>
                      <p className="text-sm text-muted-foreground">with {booking.client.name}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{booking.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {booking.time} ({booking.duration})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(booking.status)}
                    {booking.status !== "completed" && (
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <MessageSquare className="h-3 w-3" /> Message
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  )
}
