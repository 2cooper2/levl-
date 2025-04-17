"use client"

import { motion } from "framer-motion"

export function SocialProofSection() {
  const logos = [
    { name: "Company 1", logo: "/placeholder.svg?height=40&width=120" },
    { name: "Company 2", logo: "/placeholder.svg?height=40&width=120" },
    { name: "Company 3", logo: "/placeholder.svg?height=40&width=120" },
    { name: "Company 4", logo: "/placeholder.svg?height=40&width=120" },
    { name: "Company 5", logo: "/placeholder.svg?height=40&width=120" },
  ]

  return (
    <section className="w-full py-12 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Trusted by innovative teams
            </p>
          </motion.div>
          <motion.div
            className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {logos.map((logo, index) => (
              <div key={index} className="flex items-center justify-center">
                <img
                  src={logo.logo || "/placeholder.svg"}
                  alt={`${logo.name} logo`}
                  className="h-8 w-auto opacity-70 grayscale transition-all duration-200 hover:opacity-100 hover:grayscale-0"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
