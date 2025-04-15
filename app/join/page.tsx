"use client"

import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { WaitlistForm } from "@/components/waitlist/waitlist-form"
import { LevlLogo } from "@/components/levl-logo"
import { BackgroundPattern } from "@/components/background-pattern"
import { motion } from "framer-motion"

export default function JoinPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <EnhancedMainNav />
      <main className="flex-1 flex items-center justify-center p-4 relative">
        <BackgroundPattern className="opacity-30" />
        <div className="max-w-md w-full mx-auto relative z-10">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-4">
              <LevlLogo className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Join LevL Today</h1>
            <p className="text-muted-foreground">Get early access to the platform revolutionizing the gig economy</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-border">
                <div className="font-medium mb-1">Early Access</div>
                <div className="text-sm text-muted-foreground">Be among the first to use our platform</div>
              </div>
              <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-border">
                <div className="font-medium mb-1">Skill Growth</div>
                <div className="text-sm text-muted-foreground">Access our AI-powered skill accelerator</div>
              </div>
              <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border border-border">
                <div className="font-medium mb-1">Lower Fees</div>
                <div className="text-sm text-muted-foreground">Enjoy reduced platform fees as an early adopter</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <WaitlistForm />
          </motion.div>

          <motion.div
            className="mt-8 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p>Join over 500+ freelancers already on our waitlist</p>
            <p className="mt-2">We respect your privacy and will never share your information.</p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
