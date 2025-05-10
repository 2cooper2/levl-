"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LevlLogo } from "@/components/levl-logo"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { Menu } from "lucide-react"

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const { user, isAuthenticated } = useAuth()
  const isProvider = user?.role === "provider"

  return (
    <div className="flex items-center justify-between w-full md:hidden">
      <Link href="/" className="flex items-center">
        <LevlLogo className="h-8 w-8 mr-2" />
        <span className="font-bold text-xl">Levl</span>
      </Link>

      <Button variant="ghost" size="icon" className="ml-auto">
        <Menu className="h-6 w-6" />
      </Button>
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
