"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FeaturedSkillsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const maxVisibleItems = 3
  const carouselRef = useRef<HTMLDivElement>(null)

  const skills = [
    {
      title: "Mounting",
      icon: "🔧",
      color: "bg-blue-500",
      count: "2,500+ professionals",
    },
    {
      title: "Graphic Design",
      icon: "🎨",
      color: "bg-purple-500",
      count: "1,800+ professionals",
    },
    {
      title: "Digital Marketing",
      icon: "📱",
      color: "bg-green-500",
      count: "1,200+ professionals",
    },
    {
      title: "Content Writing",
      icon: "✍️",
      color: "bg-yellow-500",
      count: "950+ professionals",
    },
    {
      title: "Video Editing",
      icon: "🎬",
      color: "bg-red-500",
      count: "750+ professionals",
    },
    {
      title: "Data Analysis",
      icon: "📊",
      color: "bg-indigo-500",
      count: "680+ professionals",
    },
  ]

  const nextSlide = () => {
    if (currentIndex < skills.length - maxVisibleItems) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0) // Loop back to start
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else {
      setCurrentIndex(skills.length - maxVisibleItems) // Loop to end
    }
  }

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [currentIndex])

  return (
    <section className="w-full py-16 bg-muted/20">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Popular Skills on Levl</h2>
          <p className="max-w-[700px] text-muted-foreground">
            Discover the most in-demand skills from our community of professionals
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 z-10 hidden md:block">
            <Button variant="outline" size="icon" className="rounded-full shadow-md" onClick={prevSlide}>
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Previous</span>
            </Button>
          </div>

          <div ref={carouselRef} className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / maxVisibleItems)}%)` }}
            >
              {skills.map((skill, index) => (
                <motion.div
                  key={index}
                  className="w-full md:w-1/3 flex-shrink-0 px-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="bg-card border border-border rounded-xl p-6 h-full flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div
                      className={`w-16 h-16 ${skill.color} rounded-full flex items-center justify-center text-white text-2xl mb-4`}
                    >
                      {skill.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{skill.title}</h3>
                    <p className="text-sm text-muted-foreground">{skill.count}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 z-10 hidden md:block">
            <Button variant="outline" size="icon" className="rounded-full shadow-md" onClick={nextSlide}>
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Next</span>
            </Button>
          </div>

          <div className="flex justify-center mt-6 gap-1">
            {Array.from({ length: skills.length - maxVisibleItems + 1 }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${currentIndex === index ? "bg-primary" : "bg-muted-foreground/30"}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
