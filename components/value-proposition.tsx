"use client"

import { motion } from "framer-motion"
import { Clock, DollarSign, Heart, ShieldCheck, Smile, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function ValueProposition() {
  const router = useRouter()

  const handleExplore = () => {
    router.push("/explore")
  }

  const values = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Time Freedom",
      description: "Reclaim your schedule and work when it suits you, not when someone demands it.",
      color: "bg-blue-500/10",
      textColor: "text-blue-600",
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Financial Security",
      description: "Earn what you deserve without the ceiling of traditional employment.",
      color: "bg-green-500/10",
      textColor: "text-green-600",
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Passion-Driven Work",
      description: "Do work that energizes you instead of draining your soul.",
      color: "bg-red-500/10",
      textColor: "text-red-600",
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Protection & Support",
      description: "Never feel alone or vulnerable in your freelance journey again.",
      color: "bg-purple-500/10",
      textColor: "text-purple-600",
    },
    {
      icon: <Smile className="h-6 w-6" />,
      title: "Life Satisfaction",
      description: "Build a career that complements your ideal lifestyle, not competes with it.",
      color: "bg-yellow-500/10",
      textColor: "text-yellow-600",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Continuous Growth",
      description: "Keep evolving your skills and increasing your value in the marketplace.",
      color: "bg-orange-500/10",
      textColor: "text-orange-600",
    },
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">More Than Just Income</h2>
            <p className="text-lg text-muted-foreground">
              LevL isn't just about making money. It's about creating the life you've always wanted.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-card border border-border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div
                className={`${value.color} ${value.textColor} w-12 h-12 rounded-full flex items-center justify-center mb-4`}
              >
                {value.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center mt-12"
        >
          <Button onClick={handleExplore} variant="outline" className="group">
            Explore How We Help <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
