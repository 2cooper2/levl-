"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, X, LogIn, UserPlus, Settings, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { LevlLogo } from "@/components/levl-logo"
import { motion, AnimatePresence } from "framer-motion"

interface MobileDrawerProps {
  user?: {
    name: string
    email: string
    avatar?: string
  } | null
}

export function MobileDrawer({ user }: MobileDrawerProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleNavigation = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  const mainNavItems = [
    { label: "Home", path: "/" },
    { label: "Explore Services", path: "/explore" },
    { label: "Categories", path: "/categories" },
    { label: "How It Works", path: "/how-it-works" },
  ]

  const userNavItems = user
    ? [
        { label: "Dashboard", path: "/dashboard" },
        { label: "My Services", path: "/dashboard/services" },
        { label: "Bookings", path: "/dashboard/bookings" },
        { label: "Messages", path: "/messages" },
        { label: "Settings", path: "/settings", icon: Settings },
      ]
    : [
        { label: "Log In", path: "/auth/login", icon: LogIn },
        { label: "Sign Up", path: "/auth/signup", icon: UserPlus },
      ]

  const supportNavItems = [
    { label: "Help Center", path: "/help" },
    { label: "Contact Support", path: "/contact" },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-xs p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <LevlLogo />
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="py-4 overflow-y-auto">
          {user && (
            <div className="px-4 mb-4">
              <div className="flex items-center space-x-3 mb-3" onClick={() => handleNavigation("/profile")}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          <div className="px-2 space-y-1">
            <AnimatePresence>
              {mainNavItems.map((item) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => handleNavigation(item.path)}
                  >
                    {item.label}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <Separator className="my-4" />

          <div className="px-4 mb-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{user ? "Account" : "Authentication"}</h3>
          </div>

          <div className="px-2 space-y-1">
            <AnimatePresence>
              {userNavItems.map((item) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => handleNavigation(item.path)}
                  >
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    {item.label}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <Separator className="my-4" />

          <div className="px-4 mb-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Support</h3>
          </div>

          <div className="px-2 space-y-1">
            <AnimatePresence>
              {supportNavItems.map((item) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => handleNavigation(item.path)}
                  >
                    {item.label}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {user && (
            <>
              <Separator className="my-4" />
              <div className="px-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left font-normal text-destructive"
                  onClick={() => {
                    // Handle logout
                    setOpen(false)
                    router.push("/auth/login")
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </>
          )}

          <div className="px-4 mt-6 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">© 2024 Levl</p>
            <ThemeToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
