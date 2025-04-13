"use client"

import { EnhancedButton } from "@/components/ui/enhanced-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ArrowRight, Briefcase, Clock, Search, Users } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export function EnhancedHeroSection() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

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

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
      <div className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl opacity-50"></div>
      <div className="absolute -right-64 -bottom-64 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-3xl opacity-50"></div>

      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
          <motion.div
            className="flex flex-col justify-center space-y-4"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  Level Up Your Skills & Services
                </h1>
                <div className="inline-flex items-center mt-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium">
                  <span className="mr-1">✓</span> Lower fees than TaskRabbit
                </div>
              </motion.div>
              <motion.p
                className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                The marketplace where you can both hire skilled professionals and offer your own services to others.
              </motion.p>
            </div>
            <motion.div
              className="flex flex-col gap-3 min-[400px]:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <EnhancedButton size="lg" variant="gradient" className="gap-1.5 text-base" onClick={handleGetStarted}>
                Get Started <ArrowRight className="h-4 w-4 ml-1" />
              </EnhancedButton>
              <EnhancedButton size="lg" variant="outline" className="text-base">
                Learn More
              </EnhancedButton>
            </motion.div>
          </motion.div>
          <motion.div
            className="flex items-center justify-center"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <div className="relative w-full max-w-md">
              <motion.div
                className="relative rounded-xl border border-white/20 bg-white/10 dark:bg-black/10 backdrop-blur-md p-6 shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 dark:from-white/5 dark:to-transparent rounded-xl pointer-events-none"></div>
                <Tabs defaultValue="hire" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/20 dark:bg-black/20 backdrop-blur-sm">
                    <TabsTrigger
                      value="hire"
                      className="data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/10"
                    >
                      Hire Someone
                    </TabsTrigger>
                    <TabsTrigger
                      value="work"
                      className="data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/10"
                    >
                      Offer Services
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="hire" className="space-y-5">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">What service do you need?</h3>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search for services..."
                          className="w-full bg-white/20 dark:bg-black/20 backdrop-blur-sm pl-10 border-white/20"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <EnhancedButton
                          variant="outline"
                          className="justify-start bg-white/10 dark:bg-black/10 backdrop-blur-sm border-white/20"
                        >
                          <Briefcase className="mr-2 h-4 w-4" />
                          Business
                        </EnhancedButton>
                        <EnhancedButton
                          variant="outline"
                          className="justify-start bg-white/10 dark:bg-black/10 backdrop-blur-sm border-white/20"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Personal
                        </EnhancedButton>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2">Popular searches:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {["Web Design", "Logo", "Writing", "Marketing"].map((tag, i) => (
                            <EnhancedButton
                              key={i}
                              variant="secondary"
                              size="sm"
                              className="text-xs h-7 bg-white/10 dark:bg-black/20 backdrop-blur-sm"
                            >
                              {tag}
                            </EnhancedButton>
                          ))}
                        </div>
                      </div>
                    </div>
                    <EnhancedButton variant="gradient" className="w-full" onClick={handleFindServices}>
                      Find Services
                    </EnhancedButton>
                  </TabsContent>
                  <TabsContent value="work" className="space-y-5">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">What services can you offer?</h3>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Your skills..."
                          className="w-full bg-white/20 dark:bg-black/20 backdrop-blur-sm pl-10 border-white/20"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <EnhancedButton
                          variant="outline"
                          className="justify-start bg-white/10 dark:bg-black/10 backdrop-blur-sm border-white/20"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Part-time
                        </EnhancedButton>
                        <EnhancedButton
                          variant="outline"
                          className="justify-start bg-white/10 dark:bg-black/10 backdrop-blur-sm border-white/20"
                        >
                          <Briefcase className="mr-2 h-4 w-4" />
                          Full-time
                        </EnhancedButton>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2">Top categories:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {["Design", "Development", "Writing", "Marketing"].map((tag, i) => (
                            <EnhancedButton
                              key={i}
                              variant="secondary"
                              size="sm"
                              className="text-xs h-7 bg-white/10 dark:bg-black/20 backdrop-blur-sm"
                            >
                              {tag}
                            </EnhancedButton>
                          ))}
                        </div>
                      </div>
                    </div>
                    <EnhancedButton variant="gradient" className="w-full" onClick={handleOfferServices}>
                      Start Offering
                    </EnhancedButton>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
