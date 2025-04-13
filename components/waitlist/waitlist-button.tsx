"use client"

import { useState } from "react"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { WaitlistForm } from "@/components/waitlist/waitlist-form"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function FloatingWaitlistButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <EnhancedButton variant="gradient" size="lg" className="rounded-full shadow-lg" onClick={() => setIsOpen(true)}>
          Join Waitlist
        </EnhancedButton>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background rounded-lg shadow-xl p-6"
            >
              <button
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Join Our Waitlist</h3>
                <p className="text-muted-foreground">
                  Be the first to know when we launch. Get early access and exclusive offers.
                </p>
              </div>

              <WaitlistForm onSuccess={() => setTimeout(() => setIsOpen(false), 2000)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
