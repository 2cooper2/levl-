"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ArrowRight, Briefcase, Clock, Search, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { GlassCard, GradientBorder } from "@/components/premium-background"

export function PremiumHeroSection() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/auth/signup")
    }
  }

  const handleFindServices = () => {
    router.push("/explore")
  }

  const handleOfferServices = () => {
    if (isAuthenticated) {
      router.push("/dashboard/services/new")
    } else {
      router.push("/auth/signup?role=provider")
    }
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
                  <span className="mr-1">✓</span> Lower fees than TaskRabbit
                </div>
              </motion.div>
              <motion.p
                className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed"
                custom={1}
                variants={fadeInUp}
              >
                The marketplace where you can both hire skilled professionals and offer your own services to others.
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
                  Get Started <ArrowRight className="h-4 w-4 ml-1" />
                </EnhancedButton>
              </GradientBorder>
            </motion.div>
          </div>
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GlassCard className="w-full max-w-md p-1">
              <div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                <Tabs defaultValue="hire" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="hire">Hire Someone</TabsTrigger>
                    <TabsTrigger value="work">Offer Services</TabsTrigger>
                  </TabsList>
                  <TabsContent value="hire" className="space-y-5">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">What service do you need?</h3>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search for services..."
                          className="w-full bg-background pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <EnhancedButton variant="outline" className="justify-start">
                          <Briefcase className="mr-2 h-4 w-4" />
                          Business
                        </EnhancedButton>
                        <EnhancedButton variant="outline" className="justify-start">
                          <Users className="mr-2 h-4 w-4" />
                          Personal
                        </EnhancedButton>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2">Popular searches:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {["Web Design", "Logo", "Writing", "Marketing"].map((tag, i) => (
                            <EnhancedButton key={i} variant="secondary" size="sm" className="text-xs h-7">
                              {tag}
                            </EnhancedButton>
                          ))}
                        </div>
                      </div>
                    </div>
                    <EnhancedButton
                      className="w-full btn-premium bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                      onClick={handleFindServices}
                    >
                      Find Services
                    </EnhancedButton>
                  </TabsContent>
                  <TabsContent value="work" className="space-y-5">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">What services can you offer?</h3>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="search" placeholder="Your skills..." className="w-full bg-background pl-10" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <EnhancedButton variant="outline" className="justify-start">
                          <Clock className="mr-2 h-4 w-4" />
                          Part-time
                        </EnhancedButton>
                        <EnhancedButton variant="outline" className="justify-start">
                          <Briefcase className="mr-2 h-4 w-4" />
                          Full-time
                        </EnhancedButton>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2">Top categories:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {["Design", "Development", "Writing", "Marketing"].map((tag, i) => (
                            <EnhancedButton key={i} variant="secondary" size="sm" className="text-xs h-7">
                              {tag}
                            </EnhancedButton>
                          ))}
                        </div>
                      </div>
                    </div>
                    <EnhancedButton
                      className="w-full btn-premium bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                      onClick={handleOfferServices}
                    >
                      Start Offering
                    </EnhancedButton>
                  </TabsContent>
                </Tabs>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
