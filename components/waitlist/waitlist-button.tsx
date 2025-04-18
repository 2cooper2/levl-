"use client"

import { useState } from "react"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { WaitlistForm } from "@/components/waitlist/waitlist-form"

export function WaitlistButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <EnhancedButton
        variant="gradient"
        className="rounded-full shadow-lg relative z-10 px-5 py-2.5 text-base font-medium"
        onClick={() => setIsOpen(true)}
      >
        Join Waitlist
      </EnhancedButton>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] p-4 sm:p-6 max-w-[95vw] mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Join our Waitlist</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Be the first to know when LevL launches. Enter your details below to join our exclusive waitlist.
            </DialogDescription>
          </DialogHeader>
          <WaitlistForm onSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
