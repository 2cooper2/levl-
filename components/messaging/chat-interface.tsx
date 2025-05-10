"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Send, Paperclip, ImageIcon, Calendar, Video } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"

interface Message {
  id: string
  content: string
  sender: string
  recipient: string
  timestamp: Date
  read: boolean
  attachments?: Array<{
    type: "image" | "file" | "link"
    url: string
    name: string
  }>
}

export function ChatInterface({
  conversationId,
  recipientId,
  recipientName,
  recipientAvatar,
  serviceId = null,
}: {
  conversationId: string
  recipientId: string
  recipientName: string
  recipientAvatar: string
  serviceId?: string | null
}) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fetch messages and set up real-time listener
  useEffect(() => {
    const fetchMessages = async () => {
      // Fetch messages from database
      // Set up real-time listener for new messages
    }

    fetchMessages()
    // Return cleanup function
  }, [conversationId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const newMessage: Partial<Message> = {
      content: inputValue,
      sender: user?.id || "",
      recipient: recipientId,
      timestamp: new Date(),
      read: false,
    }

    setInputValue("")
    setIsLoading(true)

    try {
      // Save message to database
      // Update messages state
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl">
      {/* Chat header */}
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={recipientAvatar || "/placeholder.svg"} alt={recipientName} />
          <AvatarFallback>{recipientName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{recipientName}</h3>
          <div className="flex items-center text-xs text-gray-500">
            {isTyping ? (
              <span className="flex items-center text-primary">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Typing...
              </span>
            ) : (
              <span>Active now</span>
            )}
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="icon">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* For brevity, this would contain message rendering logic */}
        <div className="text-center text-sm text-gray-500 my-2">Today</div>

        {/* Example messages */}
        <div className="flex items-end gap-2 max-w-[80%]">
          <Avatar className="h-8 w-8">
            <AvatarImage src={recipientAvatar || "/placeholder.svg"} alt={recipientName} />
            <AvatarFallback>{recipientName[0]}</AvatarFallback>
          </Avatar>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg rounded-bl-none">
            <p className="text-gray-900 dark:text-gray-100">Hi there! I'm interested in your mounting service.</p>
            <span className="text-xs text-gray-500 mt-1 block">2:45 PM</span>
          </div>
        </div>

        <div className="flex items-end justify-end gap-2 max-w-[80%] ml-auto">
          <div className="bg-primary/10 text-primary dark:bg-primary/20 p-3 rounded-lg rounded-br-none">
            <p>
              Hi! Thanks for reaching out. I'd be happy to help with your mounting needs. What kind of item do you need
              mounted?
            </p>
            <span className="text-xs opacity-70 mt-1 block">2:47 PM</span>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt="You" />
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon" className="rounded-full">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="rounded-full">
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 dark:bg-gray-800 border-none focus-visible:ring-1 focus-visible:ring-primary"
          />
          <Button type="submit" size="icon" className="rounded-full" disabled={isLoading || !inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
