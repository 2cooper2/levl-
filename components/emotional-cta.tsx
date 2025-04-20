"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function EmotionalCta() {
  const router = useRouter()

  const handleJoinWaitlist = () => {
    router.push("/waitlist")
  }

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-600/30"></div>

      {/* Animated particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/20 backdrop-blur-sm"
          style={{
            width: Math.random() * 8 + 4,
            height: Math.random() * 8 + 4,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 5,
          }}
        />
      ))}

      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">It's Time to Value Your Worth</h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Every day you wait is another day stuck in the same cycle. Break free, join our community, and start
              building the future you deserve.
            </p>

            <div className="pt-4">
              <Button
                onClick={handleJoinWaitlist}
                className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg rounded-full h-auto shadow-xl"
              >
                Join the Waitlist
              </Button>
              <p className="mt-4 text-white/80 text-sm">Limited spots available for our beta launch.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
