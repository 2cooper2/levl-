"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Search, Send, Paperclip, MoreHorizontal, Phone, Video } from "lucide-react"
import { motion } from "framer-motion"

export default function MessagesPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeChat, setActiveChat] = useState(1)
  const [message, setMessage] = useState("")

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const contacts = [
    {
      id: 1,
      name: "Alex Morgan",
      avatar: "/placeholder.svg?height=40&width=40&text=AM",
      status: "online",
      lastMessage: "Hi, I'm interested in your web development service. Do you have availability next week?",
      time: "10:23 AM",
      unread: true,
    },
    {
      id: 2,
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=40&width=40&text=SC",
      status: "offline",
      lastMessage: "Thanks for the logo design concepts. I'll review them and get back to you tomorrow.",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 3,
      name: "James Wilson",
      avatar: "/placeholder.svg?height=40&width=40&text=JW",
      status: "online",
      lastMessage:
        "I've completed the first draft of the content. Please check your email and let me know your thoughts.",
      time: "Yesterday",
      unread: true,
    },
    {
      id: 4,
      name: "Emma Davis",
      avatar: "/placeholder.svg?height=40&width=40&text=ED",
      status: "offline",
      lastMessage:
        "The social media campaign is performing really well! We've already seen a 20% increase in engagement.",
      time: "2 days ago",
      unread: false,
    },
    {
      id: 5,
      name: "Michael Zhang",
      avatar: "/placeholder.svg?height=40&width=40&text=MZ",
      status: "online",
      lastMessage: "Can we reschedule our meeting to next Monday instead of Friday?",
      time: "3 days ago",
      unread: false,
    },
  ]

  const messages = [
    {
      id: 1,
      contactId: 1,
      messages: [
        {
          id: 1,
          sender: "contact",
          text: "Hi there! I'm interested in your web development service.",
          time: "10:15 AM",
        },
        {
          id: 2,
          sender: "contact",
          text: "I need a website for my small business. Do you have availability next week to discuss the details?",
          time: "10:16 AM",
        },
        {
          id: 3,
          sender: "user",
          text: "Hello! Thanks for reaching out. I'd be happy to discuss your website project.",
          time: "10:20 AM",
        },
        {
          id: 4,
          sender: "user",
          text: "I do have availability next week. How about Monday at 2 PM?",
          time: "10:21 AM",
        },
        {
          id: 5,
          sender: "contact",
          text: "Monday at 2 PM works perfectly for me. Should we do a video call?",
          time: "10:23 AM",
        },
      ],
    },
    {
      id: 2,
      contactId: 2,
      messages: [
        {
          id: 1,
          sender: "user",
          text: "Hi Sarah, I've completed the logo design concepts as we discussed. I've sent them to your email.",
          time: "Yesterday, 3:45 PM",
        },
        {
          id: 2,
          sender: "contact",
          text: "Thanks for the logo design concepts. I'll review them and get back to you tomorrow.",
          time: "Yesterday, 4:30 PM",
        },
      ],
    },
  ]

  const activeContactMessages = messages.find((m) => m.contactId === activeChat)?.messages || []
  const activeContactInfo = contacts.find((c) => c.id === activeChat)

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, you would send the message to the server
      console.log("Sending message:", message)
      setMessage("")
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Messages" text="Communicate with your clients and service providers." />
      <div className="grid h-[calc(100vh-12rem)] grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card className="md:col-span-1">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search messages..." className="w-full bg-background pl-8" />
              </div>
            </div>
            <Separator />
            <div className="h-[calc(100vh-16rem)] overflow-auto">
              {contacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 10 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div
                    className={`cursor-pointer p-4 transition-colors hover:bg-muted/50 ${
                      activeChat === contact.id ? "bg-muted" : ""
                    } ${contact.unread ? "border-l-4 border-l-primary" : ""}`}
                    onClick={() => setActiveChat(contact.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                          <AvatarFallback>{contact.name[0]}</AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-1 ring-background ${
                            contact.status === "online" ? "bg-green-500" : "bg-muted"
                          }`}
                        ></span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{contact.name}</p>
                          <span className="text-xs text-muted-foreground">{contact.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{contact.lastMessage}</p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-3">
          <CardContent className="p-0 h-full flex flex-col">
            {activeContactInfo ? (
              <>
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-500/10 to-background relative overflow-hidden">
                  {/* Background elements */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40"></div>
                  <div className="absolute -right-10 top-0 w-40 h-20 bg-purple-500/20 rounded-full filter blur-[40px]"></div>

                  <div className="flex items-center gap-3 relative z-10">
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-purple-500/20 ring-offset-2 ring-offset-background">
                        <AvatarImage
                          src={activeContactInfo.avatar || "/placeholder.svg"}
                          alt={activeContactInfo.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                          {activeContactInfo.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                          activeContactInfo.status === "online" ? "bg-green-500" : "bg-muted"
                        }`}
                      ></span>
                    </div>
                    <div>
                      <p className="font-medium bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                        {activeContactInfo.name}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span
                          className={`inline-block h-1.5 w-1.5 rounded-full ${
                            activeContactInfo.status === "online" ? "bg-green-500" : "bg-muted"
                          }`}
                        ></span>
                        {activeContactInfo.status === "online" ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 relative z-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-purple-500/10 transition-colors"
                    >
                      <Phone className="h-4 w-4 text-purple-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-purple-500/10 transition-colors"
                    >
                      <Video className="h-4 w-4 text-purple-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-purple-500/10 transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4 text-purple-500" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4 space-y-4 relative">
                  {/* Background elements */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(168,85,247,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.02)_1px,transparent_1px)] bg-[size:24px_24px] -z-10"></div>
                  <div className="absolute top-0 right-0 w-60 h-60 bg-purple-500/5 rounded-full filter blur-[80px] -z-10"></div>
                  <div className="absolute bottom-0 left-0 w-60 h-60 bg-primary/5 rounded-full filter blur-[80px] -z-10"></div>

                  {activeContactMessages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 10 }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                    >
                      {msg.sender !== "user" && (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 mr-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={activeContactInfo?.avatar || "/placeholder.svg"}
                              alt={activeContactInfo?.name}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xs">
                              {activeContactInfo?.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg p-3 shadow-sm ${
                          msg.sender === "user"
                            ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white"
                            : "bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-900/20"
                        }`}
                      >
                        <p className={msg.sender === "user" ? "text-white" : ""}>{msg.text}</p>
                        <p
                          className={`text-right text-xs mt-1 ${
                            msg.sender === "user" ? "text-white/80" : "text-muted-foreground"
                          }`}
                        >
                          {msg.time}
                        </p>
                      </div>
                      {msg.sender === "user" && (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ml-2">
                          <div className="h-8 w-8 bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xs">
                            You
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {activeContactMessages.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center p-6 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Send className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg font-medium bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                          Start the conversation
                        </h3>
                        <p className="text-muted-foreground mt-1">Send a message to begin chatting</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button
                      className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                      size="icon"
                      onClick={handleSendMessage}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium">Select a conversation</h3>
                  <p className="text-muted-foreground">Choose a contact to start messaging</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
