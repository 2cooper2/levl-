"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TransformationStory {
  id: number
  name: string
  profession: string
  beforeImage: string
  afterImage: string
  beforeText: string
  afterText: string
  quote: string
}

export function TransformationStories() {
  const [activeStory, setActiveStory] = useState(0)

  const stories: TransformationStory[] = [
    {
      id: 1,
      name: "David Rodriguez",
      profession: "Web Developer",
      beforeImage: "/placeholder.svg?height=400&width=300&text=Before",
      afterImage: "/placeholder.svg?height=400&width=300&text=After",
      beforeText: "Struggling freelancer charging $15/hr, working 60+ hours weekly just to make ends meet",
      afterText: "Specialized developer earning $85/hr with a waitlist of quality clients, working 30 hours weekly",
      quote:
        "I was ready to give up on freelancing completely. LevL showed me that I wasn't charging enough and wasn't positioning my skills correctly. The transformation in my business and life has been nothing short of miraculous.",
    },
    {
      id: 2,
      name: "Jennifer Kim",
      profession: "Graphic Designer",
      beforeImage: "/placeholder.svg?height=400&width=300&text=Before",
      afterImage: "/placeholder.svg?height=400&width=300&text=After",
      beforeText: "Constantly competing with thousands of designers on crowded platforms for low-paying projects",
      afterText: "Running a boutique design service with long-term clients who value her unique aesthetic",
      quote:
        "I used to spend hours creating spec work for clients who would ghost me. Now I have a process that attracts the right clients who respect my time and expertise. I'm earning more while working less.",
    },
    {
      id: 3,
      name: "Marcus Johnson",
      profession: "Home Service Provider",
      beforeImage: "/placeholder.svg?height=400&width=300&text=Before",
      afterImage: "/placeholder.svg?height=400&width=300&text=After",
      beforeText: "Relying on word-of-mouth referrals with unpredictable income and seasonal downturns",
      afterText: "Booked solid 3 months in advance with premium clients and a systematic approach to growth",
      quote:
        "I was good at the technical work but terrible at running a business. The mentorship and systems I learned through LevL completely changed how I approach my work. I now have predictable income and can plan for the future.",
    },
  ]

  const nextStory = () => {
    setActiveStory((prev) => (prev + 1) % stories.length)
  }

  const prevStory = () => {
    setActiveStory((prev) => (prev - 1 + stories.length) % stories.length)
  }

  const currentStory = stories[activeStory]

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Transformations</h2>
            <p className="text-lg text-muted-foreground">
              See how people just like you have transformed their careers and lives with LevL.
            </p>
          </motion.div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            key={activeStory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          >
            <div className="relative">
              <div className="relative z-10 rounded-lg overflow-hidden border border-border shadow-xl">
                <div className="absolute top-0 left-0 w-full bg-black/70 text-white text-center py-2 text-sm font-medium">
                  BEFORE
                </div>
                <img
                  src={currentStory.beforeImage || "/placeholder.svg"}
                  alt={`${currentStory.name} before transformation`}
                  className="w-full h-auto"
                />
                <div className="bg-background/90 backdrop-blur-sm p-4">
                  <p className="text-sm">{currentStory.beforeText}</p>
                </div>
              </div>

              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="absolute top-1/2 -right-4 md:right-0 z-20"
              >
                <div className="bg-primary text-white rounded-full p-2 shadow-lg">
                  <ArrowRight className="h-6 w-6" />
                </div>
              </motion.div>
            </div>

            <div className="relative">
              <div className="relative z-10 rounded-lg overflow-hidden border border-border shadow-xl">
                <div className="absolute top-0 left-0 w-full bg-primary/70 text-white text-center py-2 text-sm font-medium">
                  AFTER
                </div>
                <img
                  src={currentStory.afterImage || "/placeholder.svg"}
                  alt={`${currentStory.name} after transformation`}
                  className="w-full h-auto"
                />
                <div className="bg-background/90 backdrop-blur-sm p-4">
                  <p className="text-sm">{currentStory.afterText}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-8 bg-background rounded-lg border border-border p-6 shadow-lg">
            <blockquote className="text-lg italic text-center">"{currentStory.quote}"</blockquote>
            <div className="text-center mt-4">
              <p className="font-semibold">{currentStory.name}</p>
              <p className="text-sm text-muted-foreground">{currentStory.profession}</p>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={prevStory} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous Story
            </Button>
            <Button variant="outline" onClick={nextStory} className="flex items-center">
              Next Story <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
