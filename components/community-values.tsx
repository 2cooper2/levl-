"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Heart, Lightbulb, Users, ShieldCheck } from "lucide-react"

interface CommunityValue {
  icon: React.ReactNode
  title: string
  description: string
}

export function CommunityValues() {
  const communityValues: CommunityValue[] = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Supportive Community",
      description:
        "Connect with like-minded individuals who are passionate about helping each other succeed. Share your knowledge, ask questions, and build lasting relationships.",
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Continuous Learning",
      description:
        "Access a wealth of resources, mentorship opportunities, and skill-building programs to help you grow your expertise and stay ahead of the curve.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Collaborative Projects",
      description:
        "Work together on exciting projects, build your portfolio, and gain valuable experience while making a real-world impact.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Trusted Environment",
      description:
        "Join a platform built on trust, transparency, and respect. We're committed to creating a safe and inclusive space for everyone.",
    },
  ]

  return (
    <section className="w-full py-16 md:py-24 bg-muted/10">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Community Values</h2>
            <p className="text-lg text-muted-foreground">
              We're more than just a platform. We're a community of passionate individuals who are committed to helping
              each other succeed.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {communityValues.map((value, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mb-4 p-3 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
