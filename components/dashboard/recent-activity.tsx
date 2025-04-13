"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export function RecentActivity() {
  const activities = [
    {
      id: 1,
      type: "booking",
      title: "New booking request",
      description: "Alex Morgan requested your Web Development service",
      time: "2 hours ago",
      user: {
        name: "Alex Morgan",
        avatar: "/placeholder.svg?height=32&width=32&text=AM",
      },
    },
    {
      id: 2,
      type: "message",
      title: "New message",
      description: "Sarah Chen sent you a message about your Logo Design service",
      time: "5 hours ago",
      user: {
        name: "Sarah Chen",
        avatar: "/placeholder.svg?height=32&width=32&text=SC",
      },
    },
    {
      id: 3,
      type: "review",
      title: "New review",
      description: "James Wilson left a 5-star review on your Content Writing service",
      time: "Yesterday",
      user: {
        name: "James Wilson",
        avatar: "/placeholder.svg?height=32&width=32&text=JW",
      },
    },
    {
      id: 4,
      type: "payment",
      title: "Payment received",
      description: "You received a payment of $299 for Social Media Management",
      time: "2 days ago",
      user: {
        name: "Emma Davis",
        avatar: "/placeholder.svg?height=32&width=32&text=ED",
      },
    },
    {
      id: 5,
      type: "booking",
      title: "Booking completed",
      description: "Your booking with Michael Zhang has been marked as completed",
      time: "3 days ago",
      user: {
        name: "Michael Zhang",
        avatar: "/placeholder.svg?height=32&width=32&text=MZ",
      },
    },
  ]

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "booking":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            Booking
          </Badge>
        )
      case "message":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            Message
          </Badge>
        )
      case "review":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
            Review
          </Badge>
        )
      case "payment":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
            Payment
          </Badge>
        )
      default:
        return <Badge variant="outline">Activity</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          className="flex items-start gap-4 rounded-lg border p-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
            <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">{activity.title}</p>
              {getActivityBadge(activity.type)}
            </div>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
