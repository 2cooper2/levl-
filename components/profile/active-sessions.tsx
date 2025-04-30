"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Laptop, Smartphone, Loader2, Globe, Clock, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import type { Session } from "@/context/auth-context"

export function ActiveSessions() {
  const { getUserSessions, terminateSession, terminateAllOtherSessions } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTerminating, setIsTerminating] = useState<string | null>(null)
  const [isTerminatingAll, setIsTerminatingAll] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true)
      try {
        const sessionData = await getUserSessions()
        setSessions(sessionData)
      } catch (error) {
        console.error("Error fetching sessions:", error)
        toast({
          title: "Error",
          description: "Failed to load active sessions",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [getUserSessions, toast])

  const handleTerminateSession = async (sessionId: string) => {
    setIsTerminating(sessionId)
    try {
      const success = await terminateSession(sessionId)
      if (success) {
        setSessions((prev) => prev.filter((session) => session.id !== sessionId))
        toast({
          title: "Success",
          description: "Session terminated successfully",
        })
      } else {
        throw new Error("Failed to terminate session")
      }
    } catch (error) {
      console.error("Error terminating session:", error)
      toast({
        title: "Error",
        description: "Failed to terminate session",
        variant: "destructive",
      })
    } finally {
      setIsTerminating(null)
    }
  }

  const handleTerminateAllOtherSessions = async () => {
    setIsTerminatingAll(true)
    try {
      const success = await terminateAllOtherSessions()
      if (success) {
        setSessions((prev) => prev.filter((session) => session.isCurrent))
        toast({
          title: "Success",
          description: "All other sessions terminated successfully",
        })
      } else {
        throw new Error("Failed to terminate sessions")
      }
    } catch (error) {
      console.error("Error terminating all sessions:", error)
      toast({
        title: "Error",
        description: "Failed to terminate all other sessions",
        variant: "destructive",
      })
    } finally {
      setIsTerminatingAll(false)
    }
  }

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.toLowerCase().includes("mobile") || userAgent.toLowerCase().includes("android")) {
      return <Smartphone className="h-5 w-5" />
    }
    return <Laptop className="h-5 w-5" />
  }

  const getDeviceName = (userAgent: string) => {
    if (userAgent.toLowerCase().includes("iphone") || userAgent.toLowerCase().includes("ipad")) {
      return "iOS Device"
    } else if (userAgent.toLowerCase().includes("android")) {
      return "Android Device"
    } else if (userAgent.toLowerCase().includes("windows")) {
      return "Windows Device"
    } else if (userAgent.toLowerCase().includes("mac")) {
      return "Mac Device"
    } else if (userAgent.toLowerCase().includes("linux")) {
      return "Linux Device"
    }
    return "Unknown Device"
  }

  const getBrowserName = (userAgent: string) => {
    if (userAgent.toLowerCase().includes("chrome")) {
      return "Chrome"
    } else if (userAgent.toLowerCase().includes("firefox")) {
      return "Firefox"
    } else if (userAgent.toLowerCase().includes("safari") && !userAgent.toLowerCase().includes("chrome")) {
      return "Safari"
    } else if (userAgent.toLowerCase().includes("edge")) {
      return "Edge"
    } else if (userAgent.toLowerCase().includes("opera")) {
      return "Opera"
    }
    return "Unknown Browser"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
        <CardDescription>Manage your active login sessions across devices</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No active sessions found</div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  session.isCurrent ? "bg-primary/5 border-primary/20" : "bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">{getDeviceIcon(session.user_agent)}</div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {getDeviceName(session.user_agent)}
                      {session.isCurrent && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Current</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {getBrowserName(session.user_agent)}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTerminateSession(session.id)}
                    disabled={isTerminating === session.id}
                  >
                    {isTerminating === session.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    <span className="sr-only">Terminate session</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {sessions.length > 1 && (
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleTerminateAllOtherSessions}
            disabled={isTerminatingAll}
          >
            {isTerminatingAll ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Terminating...
              </>
            ) : (
              "Terminate All Other Sessions"
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
