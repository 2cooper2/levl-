"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LevlLogo } from "@/components/levl-logo"
import { User, MessageCircle, Layout } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LevlPortal } from "@/components/levl-portal"

export function AIMatchmakerHeader() {
  const [showPortal, setShowPortal] = useState(false)

  return (
    <div className="flex items-center justify-between w-full mb-8 px-4 sm:px-6 lg:px-8">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm pointer-events-none"></div>
          <LevlLogo className="h-10 w-10 relative z-10" />
        </div>
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            LevL
          </h1>
          <p className="text-sm text-white/70">AI Service Matchmaker</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3">
        {/* Portal Button - FIRST BUTTON */}
        <Dialog open={showPortal} onOpenChange={setShowPortal}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <Layout className="mr-2 h-4 w-4" />
              Portal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>LevL Portal</DialogTitle>
            </DialogHeader>
            <div className="w-full h-full overflow-hidden">
              <LevlPortal />
            </div>
          </DialogContent>
        </Dialog>

        {/* Dashboard Button */}
        <Button
          variant="outline"
          size="sm"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <User className="mr-2 h-4 w-4" />
          Dashboard
        </Button>

        {/* Profile Button */}
        <Button
          variant="outline"
          size="sm"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </Button>

        {/* Forum Button */}
        <Button
          variant="outline"
          size="sm"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Forum
        </Button>
      </div>
    </div>
  )
}
