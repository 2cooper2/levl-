"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import { EnhancedButton } from "@/components/ui/enhanced-button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Search, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function HeroSection() {
  const router = useRouter()
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Track mouse position for interactive elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Trigger animations when component comes into view
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  // Particle system for background
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 20 + 10,
  }))

  return (
    <section ref={ref} className="relative w-full py-20 md:py-32 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 z-0" />

      {/* Particle system */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/10 z-0"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      ))}

      {/* 3D perspective container */}
      <div className="container relative z-10">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          {/* Text content with staggered animations */}
          <div className="space-y-6">
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6 },
                },
              }}
              initial="hidden"
              animate={controls}
            >
              <motion.div
                className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                <span>Reimagining Service Marketplaces</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                <motion.span
                  className="block"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, delay: 0.1 },
                    },
                  }}
                >
                  Connect, Collaborate,
                </motion.span>
                <motion.span
                  className="block bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6, delay: 0.2 },
                    },
                  }}
                >
                  Level Up Together
                </motion.span>
              </h1>

              <motion.p
                className="text-lg md:text-xl text-muted-foreground max-w-md"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, delay: 0.3 },
                  },
                }}
              >
                The all-in-one platform where you can both hire skilled professionals and offer your own services, all
                with lower fees than competitors.
              </motion.p>
            </motion.div>

            <motion.div
              className="relative"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.6, delay: 0.4 },
                },
              }}
              initial="hidden"
              animate={controls}
            >
              <div className="relative flex items-center max-w-md">
                <Search className="absolute left-3 text-muted-foreground z-10" />
                <Input
                  placeholder="What service are you looking for?"
                  className="pl-10 pr-32 py-6 text-base rounded-full border-primary/20 focus:border-primary"
                />
                <EnhancedButton className="absolute right-1.5 rounded-full" onClick={() => router.push("/explore")}>
                  Explore <ArrowRight className="ml-2 h-4 w-4" />
                </EnhancedButton>
              </div>

              {/* Animated highlight */}
              <motion.div
                className="absolute -inset-1 rounded-full bg-primary/10 -z-10 opacity-0"
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [0.95, 1.05, 0.95],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-3 pt-2"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.5,
                  },
                },
              }}
              initial="hidden"
              animate={controls}
            >
              {["Web Design", "Marketing", "Writing", "Development", "Design"].map((tag, i) => (
                <motion.span
                  key={i}
                  className="px-3 py-1 bg-muted rounded-full text-sm"
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* 3D Interactive Card */}
          <motion.div
            className="relative h-[400px] w-full max-w-md mx-auto"
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: { duration: 0.6, delay: 0.3 },
              },
            }}
            initial="hidden"
            animate={controls}
          >
            <div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 transform rotate-6 scale-105 -z-10"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateY(${(mousePosition.x - window.innerWidth / 2) / 50}deg) 
                           rotateX(${-(mousePosition.y - window.innerHeight / 2) / 50}deg)
                           rotate(6deg) scale(1.05)`,
              }}
            />

            <motion.div
              className="h-full w-full rounded-2xl bg-card border shadow-xl overflow-hidden"
              style={{
                transformStyle: "preserve-3d",
                transform: `rotateY(${(mousePosition.x - window.innerWidth / 2) / 50}deg) 
                           rotateX(${-(mousePosition.y - window.innerHeight / 2) / 50}deg)`,
              }}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="text-2xl font-bold mb-4">Find the perfect match</div>

                {/* Animated service cards */}
                <div className="space-y-4 flex-1">
                  {[1, 2, 3].map((_, i) => (
                    <motion.div
                      key={i}
                      className="p-4 rounded-lg bg-muted/50 flex items-center gap-3"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + i * 0.2 }}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-medium">{i + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">Service Example {i + 1}</div>
                        <div className="text-sm text-muted-foreground">Starting at $99</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Link href="/waitlist">
                  <EnhancedButton className="w-full mt-4">Join Waitlist</EnhancedButton>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
