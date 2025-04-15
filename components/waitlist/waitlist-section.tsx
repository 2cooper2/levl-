"use client"

import { motion } from "framer-motion"
import { WaitlistForm } from "./waitlist-form"
import { BackgroundPattern } from "../background-pattern"

export function WaitlistSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 relative">
      <BackgroundPattern className="opacity-50" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Join our waitlist</h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Be the first to know when we launch and get access to exclusive features
            </p>
          </div>
        </motion.div>
        <div className="mx-auto max-w-md">
          <WaitlistForm />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  )
}
