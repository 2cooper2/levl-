"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase-client"
import { Loader2, CheckCircle } from "lucide-react"

type UserData = {
  id: string
  name: string
  email: string
  is_verified: boolean
  created_at: string
}

export default function VerifyUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { manuallyVerifyUser, user } = useAuth()
  const [verifyingUserId, setVerifyingUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Only allow admins to access this page
        if (user?.role !== "admin") {
          setError("You don't have permission to access this page")
          setIsLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("users")
          .select("id, name, email, is_verified, created_at")
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setUsers(data || [])
      } catch (err: any) {
        console.error("Error fetching users:", err)
        setError(err.message || "Failed to load users")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [user])

  const handleVerifyUser = async (userId: string) => {
    setVerifyingUserId(userId)

    try {
      const result = await manuallyVerifyUser(userId)

      if (result.success) {
        // Update the local state to reflect the change
        setUsers((prevUsers) => prevUsers.map((u) => (u.id === userId ? { ...u, is_verified: true } : u)))
      } else {
        setError(result.error || "Failed to verify user")
      }
    } catch (err: any) {
      console.error("Error verifying user:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setVerifyingUserId(null)
    }
  }

  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Verify Users</CardTitle>
          <CardDescription>Manually verify users who couldn't receive verification emails</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-red-800">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No users found</div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between border-b border-gray-100 py-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-gray-500">Created: {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.is_verified ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-sm">Verified</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleVerifyUser(user.id)}
                        disabled={verifyingUserId === user.id}
                        size="sm"
                      >
                        {verifyingUserId === user.id ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          "Verify User"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
