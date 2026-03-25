"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { GlassCard, GradientBorder } from "@/components/premium-background"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function PremiumHeroSection() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  const handleGetStarted = () => {
    router.push("/waitlist")
  }

  const handleFindServices = () => {
    router.push("/explore")
  }

  const handleOfferServices = () => {
    router.push("/waitlist")
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.1, 0.25, 0.3, 1],
      },
    }),
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4">
            <motion.div
              className="space-y-2"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              <motion.div custom={0} variants={fadeInUp}>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Level Up Your <span className="gradient-text">Skills & Services</span>
                </h1>
                <div className="inline-flex items-center mt-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium">
                  <span className="mr-1">✓</span> Lower fees than competitors
                </div>
              </motion.div>
              <motion.p
                className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed"
                custom={1}
                variants={fadeInUp}
              >
                The all-in-one marketplace where you can both hire skilled professionals and offer your own services to
                others.
              </motion.p>
            </motion.div>
            <motion.div
              className="flex flex-col gap-3 min-[400px]:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <GradientBorder>
                <EnhancedButton
                  size="lg"
                  className="gap-1.5 text-base btn-premium bg-primary hover:bg-primary/90 text-white w-full"
                  onClick={handleGetStarted}
                >
                  Sign Up <ArrowRight className="h-4 w-4 ml-1" />
                </EnhancedButton>
              </GradientBorder>
            </motion.div>
          </div>
          <GlassCard className="w-full max-w-md p-1">
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
              <div className="text-2xl font-semibold mb-4">Find the perfect service</div>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search for services..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <EnhancedButton
                  className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                  size="sm"
                  onClick={handleFindServices}
                >
                  Find Services
                </EnhancedButton>

                <EnhancedButton variant="outline" className="w-full" size="sm" onClick={handleOfferServices}>
                  Offer a Service
                </EnhancedButton>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  )
}
