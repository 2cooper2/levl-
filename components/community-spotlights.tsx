"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface CommunitySpotlight {
  id: number
  name: string
  role: string
  avatar: string
  story: string
  contribution: string
  impact: string
  rating: number
}

export function CommunitySpotlights() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)

    // Auto-rotate spotlights
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % communitySpotlights.length)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const communitySpotlights: CommunitySpotlight[] = [
    {
      id: 1,
      name: "Elena Ramirez",
      role: "Web Developer",
      avatar: "/placeholder.svg?height=80&width=80&text=ER",
      story:
        "I joined LevL to find clients, but I found so much more. The community has been invaluable for my growth.",
      contribution:
        "Elena regularly shares her expertise in React and Next.js in the community forum, helping other developers overcome challenges and improve their skills.",
      impact:
        "Her contributions have helped countless members level up their web development skills and land better-paying projects.",
      rating: 5,
    },
    {
      id: 2,
      name: "Carlos Silva",
      role: "Graphic Designer",
      avatar: "/placeholder.svg?height=80&width=80&text=CS",
      story:
        "I was hesitant to share my design secrets at first, but the supportive environment on LevL made me feel comfortable opening up.",
      contribution:
        "Carlos hosts weekly design critiques, providing constructive feedback and helping other designers refine their work and build stronger portfolios.",
      impact:
        "His critiques have helped many designers improve their skills and create portfolios that attract high-paying clients.",
      rating: 5,
    },
    {
      id: 3,
      name: "Mei Chen",
      role: "Home Service Provider",
      avatar: "/placeholder.svg?height=80&width=80&text=MC",
      story:
        "I never thought I'd find such a supportive community in the gig economy. LevL has been a game-changer for me.",
      contribution:
        "Mei organizes local meetups for home service providers, creating a network of support and collaboration in her city.",
      impact:
        "Her meetups have helped providers share best practices, find new clients, and build a stronger sense of community.",
      rating: 5,
    },
  ]

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % communitySpotlights.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + communitySpotlights.length) % communitySpotlights.length)
  }

  const currentSpotlight = communitySpotlights[currentIndex]

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl border border-primary/10 p-6 md:p-8">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="absolute top-6 left-8 text-primary/20">
        <Quote className="h-16 w-16 rotate-180" />
      </div>

      <div className="relative z-10">
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">Community Spotlights</h3>

        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {communitySpotlights.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-primary scale-125" : "bg-primary/30"
                }`}
                aria-label={`Go to spotlight ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="md:w-1/3 flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4 border-2 border-primary/20">
                  <AvatarImage src={currentSpotlight.avatar || "/placeholder.svg"} alt={currentSpotlight.name} />
                  <AvatarFallback>
                    {currentSpotlight.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h4 className="text-xl font-bold">{currentSpotlight.name}</h4>
                <p className="text-muted-foreground">{currentSpotlight.role}</p>
                <div className="flex mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < currentSpotlight.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
              </div>

              <div className="md:w-2/3">
                <blockquote className="relative">
                  <p className="text-lg italic mb-4 leading-relaxed">{currentSpotlight.story}</p>
                  <p className="text-lg leading-relaxed">{currentSpotlight.contribution}</p>
                  <p className="text-lg leading-relaxed">{currentSpotlight.impact}</p>
                </blockquote>
              </div>
            </motion.div>
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:translate-x-0 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-md"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous spotlight</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-0 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-md"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next spotlight</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
