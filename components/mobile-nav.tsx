"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LevlLogo } from "@/components/levl-logo"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const { user, isAuthenticated } = useAuth()
  const isProvider = user?.role === "provider"

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 z-50">
        <MobileLink href="/" className="flex items-center" onOpenChange={setOpen}>
          <LevlLogo className="mr-2 h-4 w-4" />
          <span className="font-bold">Levl</span>
        </MobileLink>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {isAuthenticated ? (
              <>
                <MobileLink
                  href="/dashboard"
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === "/dashboard" ? "text-foreground" : "text-foreground/60",
                  )}
                  onOpenChange={setOpen}
                >
                  Dashboard
                </MobileLink>
                <MobileLink
                  href="/messages"
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname?.startsWith("/messages") ? "text-foreground" : "text-foreground/60",
                  )}
                  onOpenChange={setOpen}
                >
                  Messages
                </MobileLink>
                <MobileLink
                  href="/bookings"
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname?.startsWith("/bookings") ? "text-foreground" : "text-foreground/60",
                  )}
                  onOpenChange={setOpen}
                >
                  Bookings
                </MobileLink>
                {isProvider && (
                  <MobileLink
                    href="/skill-progress"
                    className={cn(
                      "transition-colors hover:text-foreground/80",
                      pathname?.startsWith("/skill-progress") ? "text-foreground" : "text-foreground/60",
                    )}
                    onOpenChange={setOpen}
                  >
                    Skills
                  </MobileLink>
                )}
                <MobileLink
                  href="/profile"
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname?.startsWith("/profile") ? "text-foreground" : "text-foreground/60",
                  )}
                  onOpenChange={setOpen}
                >
                  Profile
                </MobileLink>
                <MobileLink
                  href="/settings"
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname?.startsWith("/settings") ? "text-foreground" : "text-foreground/60",
                  )}
                  onOpenChange={setOpen}
                >
                  Settings
                </MobileLink>
              </>
            ) : (
              <>
                <MobileLink
                  href="/about"
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname?.startsWith("/about") ? "text-foreground" : "text-foreground/60",
                  )}
                  onOpenChange={setOpen}
                >
                  About
                </MobileLink>
                <MobileLink
                  href="/auth/login"
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname?.startsWith("/auth/login") ? "text-foreground" : "text-foreground/60",
                  )}
                  onOpenChange={setOpen}
                >
                  Log In
                </MobileLink>
                <MobileLink
                  href="/auth/signup"
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname?.startsWith("/auth/signup") ? "text-foreground" : "text-foreground/60",
                  )}
                  onOpenChange={setOpen}
                >
                  Sign Up
                </MobileLink>
              </>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
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
