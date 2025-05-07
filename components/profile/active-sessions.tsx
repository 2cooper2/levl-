"use client"
import { Button } from "@/components/ui/button"
import { Laptop, Smartphone, Globe, AlertCircle } from "lucide-react"
import { useState } from "react"

type Session = {
  id: string
  device: string
  location: string
  ip: string
  lastActive: string
  isCurrent: boolean
}

export function ActiveSessions() {
  // Mock data - in a real app, this would come from your backend
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: "1",
      device: "Windows PC",
      location: "New York, USA",
      ip: "192.168.1.1",
      lastActive: "Active now",
      isCurrent: true,
    },
    {
      id: "2",
      device: "iPhone 13",
      location: "San Francisco, USA",
      ip: "192.168.1.2",
      lastActive: "2 days ago",
      isCurrent: false,
    },
    {
      id: "3",
      device: "Chrome on Mac",
      location: "Austin, USA",
      ip: "192.168.1.3",
      lastActive: "1 week ago",
      isCurrent: false,
    },
  ])

  const handleRevoke = (id: string) => {
    // In a real app, you would call an API to revoke the session
    setSessions(sessions.filter((session) => session.id !== id))
  }

  const getDeviceIcon = (device: string) => {
    if (device.includes("iPhone") || device.includes("Android")) {
      return <Smartphone className="h-5 w-5" />
    } else if (device.includes("Windows") || device.includes("Mac")) {
      return <Laptop className="h-5 w-5" />
    } else {
      return <Globe className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div
          key={session.id}
          className={`flex items-start space-x-4 rounded-lg border p-4 ${
            session.isCurrent ? "bg-primary/5 border-primary/20" : ""
          }`}
        >
          <div className={`rounded-full p-2 ${session.isCurrent ? "bg-primary/10" : "bg-muted"}`}>
            {getDeviceIcon(session.device)}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">
                {session.device}
                {session.isCurrent && <span className="ml-2 text-xs text-primary">(Current)</span>}
              </p>
              {!session.isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevoke(session.id)}
                  className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Revoke
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Location: {session.location}</p>
              <p>IP: {session.ip}</p>
              <p>Last active: {session.lastActive}</p>
            </div>
            {!session.isCurrent && session.lastActive.includes("week") && (
              <div className="flex items-center mt-2 text-amber-600 dark:text-amber-400 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                Unused session - consider revoking
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
