"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface SuccessStory {
  id: number
  name: string
  role: string
  avatar: string
  story: string
  impact: string
  before: string
  after: string
  rating: number
}

export function SuccessStoryCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)

    // Auto-rotate stories
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % successStories.length)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const successStories: SuccessStory[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Freelance Designer",
      avatar: "/placeholder.svg?height=80&width=80&text=SJ",
      story:
        "I was struggling to find consistent work and spending hours on proposals that went nowhere. LevL changed everything for me.",
      impact:
        "Within two months, I doubled my client base and increased my rates by 40%. The skill accelerator helped me identify gaps in my portfolio that were holding me back.",
      before: "$2,400/month",
      after: "$5,800/month",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Torres",
      role: "Home Service Provider",
      avatar: "/placeholder.svg?height=80&width=80&text=MT",
      story:
        "After losing my job during the pandemic, I started offering handyman services but struggled to find enough clients to make ends meet.",
      impact:
        "LevL's platform connected me with homeowners in my area looking for exactly my skills. The mentorship program taught me how to price my services properly and communicate my value.",
      before: "3 clients/month",
      after: "15+ clients/month",
      rating: 5,
    },
    {
      id: 3,
      name: "Aisha Patel",
      role: "Content Creator",
      avatar: "/placeholder.svg?height=80&width=80&text=AP",
      story:
        "I was burning out working with difficult clients who didn't value my expertise and constantly haggled over my rates.",
      impact:
        "The LevL community helped me realize I wasn't charging what I was worth. With their support, I niched down, created a portfolio that showcased my unique voice, and now work with dream clients who respect my time.",
      before: "60+ hour weeks",
      after: "30 hour weeks, 2x income",
      rating: 5,
    },
  ]

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % successStories.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + successStories.length) % successStories.length)
  }

  const currentStory = successStories[currentIndex]

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl border border-primary/10 p-6 md:p-8">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="absolute top-6 left-8 text-primary/20">
        <Quote className="h-16 w-16 rotate-180" />
      </div>

      <div className="relative z-10">
        <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">Real Stories, Real Impact</h3>

        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {successStories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-primary scale-125" : "bg-primary/30"
                }`}
                aria-label={`Go to story ${index + 1}`}
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
                  <AvatarImage src={currentStory.avatar || "/placeholder.svg"} alt={currentStory.name} />
                  <AvatarFallback>
                    {currentStory.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h4 className="text-xl font-bold">{currentStory.name}</h4>
                <p className="text-muted-foreground">{currentStory.role}</p>
                <div className="flex mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < currentStory.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                  <div className="bg-background/50 backdrop-blur-sm p-3 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">Before LevL</p>
                    <p className="font-semibold text-red-500">{currentStory.before}</p>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm p-3 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">After LevL</p>
                    <p className="font-semibold text-green-500">{currentStory.after}</p>
                  </div>
                </div>
              </div>

              <div className="md:w-2/3">
                <blockquote className="relative">
                  <p className="text-lg italic mb-4 leading-relaxed">{currentStory.story}</p>
                  <p className="text-lg leading-relaxed">{currentStory.impact}</p>
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
            <span className="sr-only">Previous story</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-0 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-md"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next story</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
