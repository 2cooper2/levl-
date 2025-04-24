"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, Settings, User } from "lucide-react"
import Link from "next/link"
import { ActiveSessions } from "@/components/profile/active-sessions"

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push("/auth/login")
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="mb-6 text-3xl font-bold">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        {/* Profile sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                  <AvatarFallback className="text-2xl">{user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-bold">{user?.name}</h2>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {user?.role === "provider" ? "Service Provider" : user?.role === "client" ? "Client" : "Admin"}
                    </span>
                    {user?.is_verified && (
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-800/20 dark:text-green-400">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 pb-6">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/dashboard">
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Profile content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View and manage your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                  <dd className="text-base">{user?.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="text-base">{user?.email}</dd>
                </div>
                {user?.phone && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                    <dd className="text-base">{user?.phone}</dd>
                  </div>
                )}
                {user?.location && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                    <dd className="text-base">{user?.location}</dd>
                  </div>
                )}
                {user?.website && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Website</dt>
                    <dd className="text-base">
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {user.website}
                      </a>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Account Type</dt>
                  <dd className="text-base capitalize">{user?.role}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Account Status</dt>
                  <dd className="text-base flex items-center">
                    {user?.is_active ? (
                      <span className="flex items-center text-green-600">
                        <span className="mr-2 h-2 w-2 rounded-full bg-green-600"></span>
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <span className="mr-2 h-2 w-2 rounded-full bg-red-600"></span>
                        Inactive
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Login</dt>
                  <dd className="text-base">
                    {user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never"}
                  </dd>
                </div>
              </dl>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link href="/settings">Edit Profile</Link>
              </Button>
            </CardFooter>
          </Card>

          <ActiveSessions />

          {user?.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{user.bio}</p>
              </CardContent>
            </Card>
          )}

          {user?.role === "provider" && (
            <Card>
              <CardHeader>
                <CardTitle>Service Provider Information</CardTitle>
                <CardDescription>Manage your service provider details</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You are registered as a service provider. You can manage your services and bookings from your
                  dashboard.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href="/dashboard/services">Manage Services</Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      {/* Prominent logout button at the bottom */}
      <div className="mt-10 flex justify-center">
        <Button variant="destructive" size="lg" onClick={handleLogout} className="px-8">
          <LogOut className="mr-2 h-5 w-5" />
          Logout from Account
        </Button>
      </div>
    </div>
  )
}
