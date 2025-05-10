"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LevlLogo } from "@/components/levl-logo"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const isProvider = user?.role === "provider"

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <LevlLogo className="h-6 w-6" />
        <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          LevL
        </span>
      </Link>
      <nav className="flex items-center space-x-6 text-sm font-medium">
        <Link
          href="/dashboard"
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/dashboard" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Dashboard
        </Link>
        <Link
          href="/explore"
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/explore" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Explore
        </Link>
        <Link
          href="/messages"
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/messages" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Messages
        </Link>
        <Link
          href="/bookings"
          className={cn(
            "transition-colors hover:text-primary",
            pathname === "/bookings" ? "text-primary" : "text-muted-foreground",
          )}
        >
          Bookings
        </Link>
        {isProvider && (
          <Link
            href="/skill-progress"
            className={cn(
              "transition-colors hover:text-primary",
              pathname === "/skill-progress" ? "text-primary" : "text-muted-foreground",
            )}
          >
            Skills
          </Link>
        )}
      </nav>
    </div>
  )
}
