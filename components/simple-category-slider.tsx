"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Code, Palette, Briefcase, Lightbulb, Camera, Wrench, Home, Laptop, BookOpen, Music } from "lucide-react"
import { EnhancedCategoryCard } from "@/components/enhanced-category-card"

export function SimpleCategorySlider() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const categories = [
    { name: "Programming", icon: Code, count: 120, featured: true },
    { name: "Design", icon: Palette, count: 85, featured: false },
    { name: "Business", icon: Briefcase, count: 74, featured: true },
    { name: "Marketing", icon: Lightbulb, count: 63, featured: false },
    { name: "Photography", icon: Camera, count: 42, featured: false },
    { name: "Home Services", icon: Home, count: 38, featured: true },
    { name: "Technology", icon: Laptop, count: 56, featured: false },
    { name: "Education", icon: BookOpen, count: 47, featured: false },
    { name: "Music", icon: Music, count: 31, featured: false },
    { name: "Repairs", icon: Wrench, count: 29, featured: false },
  ]

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef
      const scrollAmount = current.clientWidth * 0.8

      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" })
      }
    }
  }

  return (
    <section className="py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Popular Categories</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex overflow-x-auto hide-scrollbar space-x-4 pb-8">
          {categories.map((category, index) => (
            <div key={category.name} className="flex-shrink-0 w-[280px]">
              <EnhancedCategoryCard
                icon={category.icon}
                name={category.name}
                count={category.count}
                index={index}
                featured={category.featured}
                size="small"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
