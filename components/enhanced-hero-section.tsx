"use client"

import { EnhancedButton } from "@/components/ui/enhanced-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ArrowRight, Briefcase, Clock, Search, Users, Sparkles, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useState, useEffect } from "react"

export function EnhancedHeroSection() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

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
      {/* Animated background elements */}
      <div
        className="absolute -left-64 -top-64 h-[500px] w-[500px] rounded-full bg-primary/10 blur-3xl opacity-50 animate-pulse"
        style={{ animationDuration: "15s" }}
      ></div>
      <div
        className="absolute -right-64 -bottom-64 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-3xl opacity-50 animate-pulse"
        style={{ animationDuration: "20s" }}
      ></div>

      {/* Futuristic grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_49.5%,rgba(255,255,255,0.05)_49.5%,rgba(255,255,255,0.05)_50.5%,transparent_50.5%),linear-gradient(to_bottom,transparent_49.5%,rgba(255,255,255,0.05)_49.5%,rgba(255,255,255,0.05)_50.5%,transparent_50.5%)] bg-[length:50px_50px] opacity-20 pointer-events-none"></div>

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
                <div className="relative">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    Hire & Complete Jobs All In One Place!
                  </h1>
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-xl opacity-0"
                    animate={{ opacity: [0, 0.3, 0] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                  />
                </div>
                <div className="inline-flex items-center mt-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 backdrop-blur-sm border border-white/10 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 mr-2 text-primary animate-pulse" />
                  <span className="text-sm font-medium bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    Lower fees than TaskRabbit
                  </span>
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
              <EnhancedButton
                size="lg"
                variant="gradient"
                className="gap-1.5 text-base relative overflow-hidden group"
                onClick={handleGetStarted}
              >
                <span className="relative z-10 flex items-center">
                  Get Started <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-purple-500/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="absolute -inset-px rounded-md bg-gradient-to-r from-primary to-purple-500 opacity-70 group-hover:opacity-100 blur-sm transition-opacity"></span>
              </EnhancedButton>
              <EnhancedButton
                size="lg"
                variant="outline"
                className="text-base border-white/20 hover:bg-white/10 transition-all duration-300"
              >
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
            <div
              className="relative w-full max-w-md"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <motion.div
                className="relative rounded-xl overflow-hidden border border-white/20 bg-white/10 dark:bg-black/10 backdrop-blur-md p-6 shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                style={{
                  boxShadow: "0 10px 30px -10px rgba(var(--primary-rgb), 0.2)",
                }}
              >
                {/* Glassmorphic effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 dark:from-white/5 dark:to-transparent rounded-xl pointer-events-none"></div>

                {/* Animated border glow */}
                <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-primary/30 via-purple-500/30 to-primary/30 opacity-0 hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

                {/* Interactive light effect that follows mouse */}
                {isHovering && (
                  <div
                    className="absolute inset-0 bg-radial-light opacity-20 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at ${mousePosition.x - 500}px ${mousePosition.y - 300}px, rgba(255,255,255,0.8) 0%, transparent 15%)`,
                    }}
                  />
                )}

                <Tabs defaultValue="hire" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/10 dark:bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 p-1">
                    <TabsTrigger
                      value="hire"
                      className="data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm rounded-md transition-all duration-300 data-[state=active]:backdrop-blur-md relative overflow-hidden group"
                    >
                      <span className="relative z-10">Hire Someone</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="work"
                      className="data-[state=active]:bg-white/20 dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm rounded-md transition-all duration-300 data-[state=active]:backdrop-blur-md relative overflow-hidden group"
                    >
                      <span className="relative z-10">Offer Services</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"></span>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="hire" className="space-y-5">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-primary" />
                        What service do you need?
                      </h3>
                      <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search for services..."
                          className="w-full bg-white/10 dark:bg-black/20 backdrop-blur-sm pl-10 border-white/10 focus:border-primary/50 transition-all duration-300 rounded-md"
                        />
                        <div className="absolute inset-0 rounded-md border border-primary/0 group-hover:border-primary/20 group-focus-within:border-primary/30 pointer-events-none transition-all duration-300"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <EnhancedButton
                          variant="outline"
                          className="justify-start bg-white/5 dark:bg-black/10 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                          <Briefcase className="mr-2 h-4 w-4 text-primary" />
                          Business
                        </EnhancedButton>
                        <EnhancedButton
                          variant="outline"
                          className="justify-start bg-white/5 dark:bg-black/10 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                          <Users className="mr-2 h-4 w-4 text-primary" />
                          Personal
                        </EnhancedButton>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2 flex items-center">
                          <Sparkles className="h-3 w-3 mr-1.5 text-primary/70" />
                          Popular searches:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {["Web Design", "Logo", "Writing", "Marketing"].map((tag, i) => (
                            <EnhancedButton
                              key={i}
                              variant="secondary"
                              size="sm"
                              className="text-xs h-7 bg-white/5 dark:bg-black/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/20"
                            >
                              {tag}
                            </EnhancedButton>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="work" className="space-y-5">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-primary" />
                        What services can you offer?
                      </h3>
                      <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Your skills..."
                          className="w-full bg-white/10 dark:bg-black/20 backdrop-blur-sm pl-10 border-white/10 focus:border-primary/50 transition-all duration-300 rounded-md"
                        />
                        <div className="absolute inset-0 rounded-md border border-primary/0 group-hover:border-primary/20 group-focus-within:border-primary/30 pointer-events-none transition-all duration-300"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <EnhancedButton
                          variant="outline"
                          className="justify-start bg-white/5 dark:bg-black/10 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                          <Clock className="mr-2 h-4 w-4 text-primary" />
                          Part-time
                        </EnhancedButton>
                        <EnhancedButton
                          variant="outline"
                          className="justify-start bg-white/5 dark:bg-black/10 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                        >
                          <Briefcase className="mr-2 h-4 w-4 text-primary" />
                          Full-time
                        </EnhancedButton>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2 flex items-center">
                          <Sparkles className="h-3 w-3 mr-1.5 text-primary/70" />
                          Top categories:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {["Design", "Development", "Writing", "Marketing"].map((tag, i) => (
                            <EnhancedButton
                              key={i}
                              variant="secondary"
                              size="sm"
                              className="text-xs h-7 bg-white/5 dark:bg-black/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/20"
                            >
                              {tag}
                            </EnhancedButton>
                          ))}
                        </div>
                      </div>
                    </div>
                    <EnhancedButton
                      variant="gradient"
                      className="w-full relative overflow-hidden group"
                      onClick={handleOfferServices}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Start Offering{" "}
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-primary/80 to-purple-500/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="absolute -inset-px rounded-md bg-gradient-to-r from-primary to-purple-500 opacity-70 group-hover:opacity-100 blur-sm transition-opacity"></span>
                    </EnhancedButton>
                  </TabsContent>
                </Tabs>

                {/* Futuristic decorative elements */}
                <div className="absolute top-1/4 right-6 w-2 h-2 rounded-full bg-primary/50 animate-pulse"></div>
                <div
                  className="absolute bottom-1/3 left-8 w-1.5 h-1.5 rounded-full bg-purple-500/50 animate-ping"
                  style={{ animationDuration: "3s" }}
                ></div>
                <div className="absolute top-0 left-0 w-20 h-[1px] bg-gradient-to-r from-primary/50 to-transparent"></div>
                <div className="absolute top-0 right-0 w-[1px] h-20 bg-gradient-to-b from-purple-500/50 to-transparent"></div>
                <div className="absolute bottom-0 right-0 w-20 h-[1px] bg-gradient-to-l from-primary/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-[1px] h-20 bg-gradient-to-t from-purple-500/50 to-transparent"></div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
