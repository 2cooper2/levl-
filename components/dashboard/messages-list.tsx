"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { motion } from "framer-motion"

export function MessagesList() {
  const messages = [
    {
      id: 1,
      user: {
        name: "Alex Morgan",
        avatar: "/placeholder.svg?height=40&width=40&text=AM",
        status: "online",
      },
      lastMessage: "Hi, I'm interested in your web development service. Do you have availability next week?",
      time: "10:23 AM",
      unread: true,
    },
    {
      id: 2,
      user: {
        name: "Sarah Chen",
        avatar: "/placeholder.svg?height=40&width=40&text=SC",
        status: "offline",
      },
      lastMessage: "Thanks for the logo design concepts. I'll review them and get back to you tomorrow.",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 3,
      user: {
        name: "James Wilson",
        avatar: "/placeholder.svg?height=40&width=40&text=JW",
        status: "online",
      },
      lastMessage:
        "I've completed the first draft of the content. Please check your email and let me know your thoughts.",
      time: "Yesterday",
      unread: true,
    },
    {
      id: 4,
      user: {
        name: "Emma Davis",
        avatar: "/placeholder.svg?height=40&width=40&text=ED",
        status: "offline",
      },
      lastMessage:
        "The social media campaign is performing really well! We've already seen a 20% increase in engagement.",
      time: "2 days ago",
      unread: false,
    },
    {
      id: 5,
      user: {
        name: "Michael Zhang",
        avatar: "/placeholder.svg?height=40&width=40&text=MZ",
        status: "online",
      },
      lastMessage: "Can we reschedule our meeting to next Monday instead of Friday?",
      time: "3 days ago",
      unread: false,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search messages..." className="w-full bg-background pl-8" />
      </div>
      <div className="space-y-2">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${message.unread ? "border-l-4 border-l-primary" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={message.user.avatar || "/placeholder.svg"} alt={message.user.name} />
                      <AvatarFallback>{message.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-1 ring-background ${message.user.status === "online" ? "bg-green-500" : "bg-muted"}`}
                    ></span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{message.user.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{message.time}</span>
                        {message.unread && (
                          <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                            <span className="sr-only">Unread message</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{message.lastMessage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center">
        <Button variant="outline" className="w-full">
          Load more
        </Button>
      </div>
    </div>
  )
}
