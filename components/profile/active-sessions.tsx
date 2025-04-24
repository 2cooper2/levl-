"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Laptop, Smartphone, Globe, Loader2, X } from "lucide-react"
import { createClient, createServerClient } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

interface Session {
  id: string
  user_id: string
  device_info: any
  ip_address: string
  user_agent: string
  expires_at: string
  created_at: string
  isCurrent?: boolean
}

export function ActiveSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [terminating, setTerminating] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()
  const serverSupabase = createServerClient() // Create server client
  const { toast } = useToast()
  const currentUserAgent = navigator.userAgent

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return

      try {
        // Use serverSupabase to bypass RLS
        const { data, error } = await serverSupabase
          .from("sessions")
          .select("*")
          .eq("user_id", user.id)
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })

        if (error) throw error

        // Mark the current session
        const sessionsWithCurrent = data.map((session) => ({
          ...session,
          isCurrent: session.user_agent === currentUserAgent,
        }))

        setSessions(sessionsWithCurrent)
      } catch (error) {
        console.error("Error fetching sessions:", error)
        toast({
          title: "Error",
          description: "Failed to load active sessions",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [user, serverSupabase, toast, currentUserAgent])

  const getDeviceIcon = (userAgent: string) => {
    if (/mobile|android|iphone|ipad|ipod/i.test(userAgent.toLowerCase())) {
      return <Smartphone className="h-5 w-5" />
    } else if (/windows|macintosh|linux/i.test(userAgent.toLowerCase())) {
      return <Laptop className="h-5 w-5" />
    } else {
      return <Globe className="h-5 w-5" />
    }
  }

  const getDeviceName = (userAgent: string) => {
    if (/iphone/i.test(userAgent)) return "iPhone"
    if (/ipad/i.test(userAgent)) return "iPad"
    if (/android/i.test(userAgent)) return "Android Device"
    if (/macintosh/i.test(userAgent)) return "Mac"
    if (/windows/i.test(userAgent)) return "Windows PC"
    if (/linux/i.test(userAgent)) return "Linux"
    return "Unknown Device"
  }

  const getBrowserName = (userAgent: string) => {
    if (/chrome/i.test(userAgent)) return "Chrome"
    if (/firefox/i.test(userAgent)) return "Firefox"
    if (/safari/i.test(userAgent)) return "Safari"
    if (/edge/i.test(userAgent)) return "Edge"
    if (/opera/i.test(userAgent)) return "Opera"
    return "Unknown Browser"
  }

  const terminateSession = async (sessionId: string) => {
    if (!user) return

    setTerminating(sessionId)
    try {
      const { error } = await supabase.from("sessions").delete().eq("id", sessionId)

      if (error) throw error

      setSessions((prev) => prev.filter((session) => session.id !== sessionId))
      toast({
        title: "Success",
        description: "Session terminated successfully",
      })
    } catch (error) {
      console.error("Error terminating session:", error)
      toast({
        title: "Error",
        description: "Failed to terminate session",
        variant: "destructive",
      })
    } finally {
      setTerminating(null)
    }
  }

  const terminateAllOtherSessions = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Delete all sessions except the current one
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("user_id", user.id)
        .neq("user_agent", currentUserAgent)

      if (error) throw error

      // Update the sessions list to only include the current session
      setSessions((prev) => prev.filter((session) => session.isCurrent))
      toast({
        title: "Success",
        description: "All other sessions terminated successfully",
      })
    } catch (error) {
      console.error("Error terminating all sessions:", error)
      toast({
        title: "Error",
        description: "Failed to terminate sessions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </div>
        {sessions.length > 1 && (
          <Button variant="outline" size="sm" onClick={terminateAllOtherSessions} disabled={loading}>
            Sign out all other devices
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">No active sessions found</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between rounded-lg border p-4 ${
                  session.isCurrent ? "bg-muted/50" : ""
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">{getDeviceIcon(session.user_agent)}</div>
                  <div>
                    <p className="font-medium">
                      {getDeviceName(session.user_agent)} • {getBrowserName(session.user_agent)}
                      {session.isCurrent && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last active: {new Date(session.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => terminateSession(session.id)}
                    disabled={terminating === session.id}
                  >
                    {terminating === session.id ? (
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
    </Card>
  )
}
