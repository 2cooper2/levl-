"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LevlLogo } from "@/components/levl-logo"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const { user, isAuthenticated } = useAuth()
  const isProvider = user?.role === "provider"

  return (
    <div className="flex items-center md:hidden">
      <Link href="/" className="mr-4 flex items-center">
        <LevlLogo className="h-6 w-6 mr-2" />
        <span className="font-bold">Levl</span>
      </Link>

      <div className="flex items-center space-x-2">
        {isAuthenticated ? (
          <>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" size="sm">
                Messages
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                Profile
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="outline" size="sm">
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

interface MobileLinkProps {
  href: string
  onOpenChange?: (open: boolean) => void
  className?: string
  children: React.ReactNode
}

function MobileLink({ href, onOpenChange, className, children }: MobileLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(className)}
      onClick={() => {
        onOpenChange?.(false)
      }}
    >
      {children}
    </Link>
  )
}
