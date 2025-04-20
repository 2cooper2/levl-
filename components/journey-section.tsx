"use client"

import { motion } from "framer-motion"
import { UserPlus, Sparkles, Rocket, TrendingUp, Award, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function JourneySection() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/waitlist")
  }

  const steps = [
    {
      icon: <UserPlus className="h-6 w-6" />,
      title: "Join the Community",
      description: "Create your profile and connect with like-minded professionals and clients who value quality work.",
      color: "from-blue-500/20 to-blue-600/20",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Discover Your Potential",
      description:
        "Our AI analyzes your skills and matches you with opportunities that align with your strengths and goals.",
      color: "from-purple-500/20 to-purple-600/20",
    },
    {
      icon: <Rocket className="h-6 w-6" />,
      title: "Learn & Earn",
      description: "Access skill accelerator programs that help you improve while earning through real-world projects.",
      color: "from-pink-500/20 to-pink-600/20",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Grow Your Business",
      description: "Increase your rates, build a client base, and establish yourself as an authority in your field.",
      color: "from-green-500/20 to-green-600/20",
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Achieve Freedom",
      description: "Create the lifestyle you want with flexible work that pays what you're truly worth.",
      color: "from-yellow-500/20 to-yellow-600/20",
    },
  ]

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5"></div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Journey to Success</h2>
            <p className="text-lg text-muted-foreground">
              We're not just another gig platform. We're a community dedicated to helping you transform your career and
              life.
            </p>
          </motion.div>
        </div>

        <div className="relative mt-20">
          {/* Connecting line */}
          <div className="absolute top-1/4 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent hidden md:block"></div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div
                    className={`h-12 w-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center border-4 border-background shadow-lg`}
                  >
                    {step.icon}
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold">
                    {index + 1}
                  </div>
                </div>

                <div className="bg-background/50 backdrop-blur-sm rounded-lg border border-border p-6 pt-8 h-full">
                  <h3 className="font-bold text-lg mb-2 text-center">{step.title}</h3>
                  <p className="text-muted-foreground text-center">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-center mt-16"
          >
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white px-8 py-6 text-lg rounded-full h-auto"
            >
              Start Your Journey <Zap className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
