"use client"

import { motion } from "framer-motion"
import { ArrowRight, Search, Calendar, Star } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: <Search className="h-10 w-10" />,
      title: "Discover Skills",
      description: "Browse through a curated marketplace of verified professionals across various skill categories.",
    },
    {
      icon: <Calendar className="h-10 w-10" />,
      title: "Book Services",
      description: "Schedule appointments with skilled professionals that match your specific requirements.",
    },
    {
      icon: <Star className="h-10 w-10" />,
      title: "Rate & Review",
      description: "Share your experience and help build a trusted community of skilled professionals.",
    },
  ]

  return (
    <section className="w-full py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How Levl Works</h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Our platform makes it easy to connect with skilled professionals and get things done
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mb-4 p-3 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center text-white">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>

              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
