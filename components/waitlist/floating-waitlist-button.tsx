"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { WaitlistForm } from "@/components/waitlist/waitlist-form"

interface FloatingWaitlistButtonProps {
  inHeader?: boolean
}

export function FloatingWaitlistButton({ inHeader = false }: FloatingWaitlistButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Styles for the button when in header vs floating
  const buttonClasses = inHeader
    ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium relative"
    : "rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-6 py-3 h-auto fixed bottom-6 right-6 z-50"

  return (
    <>
      {inHeader ? (
        <Button onClick={() => setIsOpen(true)} className={buttonClasses}>
          <span className="absolute inset-0 rounded-md bg-purple-500 opacity-30 animate-pulse"></span>
          <span className="relative z-10">Join Waitlist</span>
        </Button>
      ) : (
        <div className="fixed bottom-6 right-6 z-50">
          <Button onClick={() => setIsOpen(true)} className={buttonClasses}>
            <span className="absolute inset-0 rounded-full bg-purple-500 opacity-30 animate-ping"></span>
            <span className="relative z-10">Join Waitlist</span>
          </Button>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join our Waitlist</DialogTitle>
            <DialogDescription>
              Be the first to know when LevL launches. Enter your details below to join our exclusive waitlist.
            </DialogDescription>
          </DialogHeader>
          <WaitlistForm onSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
