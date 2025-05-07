"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LevlLogo } from "@/components/levl-logo"
import { Menu, Moon, Sun, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "next-themes"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { setTheme, theme } = useTheme()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <div className="flex items-center justify-between gap-2 border-b pb-4">
          <div className="flex items-center relative">
            <LevlLogo className="h-12 w-12" />
            <span className="text-xl font-bold absolute left-12 bottom-2 z-10">LevL</span>
          </div>
        </div>
        {isAuthenticated && (
          <div className="flex items-center gap-3 my-4 py-4 border-b">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
              <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
            </div>
          </div>
        )}
        <nav className="flex flex-col gap-4 mt-4">
          <Link
            href="/explore"
            className="text-lg font-medium transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Find Services
          </Link>
          <Link
            href="/providers"
            className="text-lg font-medium transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            Become a Provider
          </Link>
          <Link
            href="/how-it-works"
            className="text-lg font-medium transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            How it Works
          </Link>
          <Link
            href="/about"
            className="text-lg font-medium transition-colors hover:text-primary"
            onClick={() => setOpen(false)}
          >
            About
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href="/dashboard"
                className="text-lg font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/messages"
                className="text-lg font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Messages
              </Link>
              <Link
                href="/bookings"
                className="text-lg font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Bookings
              </Link>
              <Link
                href="/profile"
                className="text-lg font-medium transition-colors hover:text-primary flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-md"
                onClick={() => {
                  setOpen(false)
                }}
              >
                <User className="h-5 w-5 text-primary" />
                My Profile
              </Link>
              <Link
                href="/settings"
                className="text-lg font-medium transition-colors hover:text-primary"
                onClick={() => setOpen(false)}
              >
                Settings
              </Link>
            </>
          )}
          <div className="flex items-center justify-between border-t pt-4 mt-2">
            <span className="text-lg font-medium">Dark Mode</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </nav>
        <div className="mt-auto flex flex-col gap-2 pt-4 border-t">
          {isAuthenticated ? (
            <Button
              variant="outline"
              onClick={() => {
                logout()
                setOpen(false)
              }}
            >
              Log Out
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setOpen(false)} asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button onClick={() => setOpen(false)} asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
