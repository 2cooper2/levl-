"use client"

import { Code, Palette, Briefcase, Lightbulb, Camera, Wrench, Home, Laptop, BookOpen, Music } from "lucide-react"
import { EnhancedCategoryCard } from "@/components/enhanced-category-card"
import { CategoryScrollContainer } from "@/components/category-scroll-container"

export function CategoriesSection() {
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

  const handleCategoryClick = (categoryName: string) => {
    console.log(`Selected category: ${categoryName}`)
    // Add navigation logic here if needed
  }

  return (
    <section className="py-12 px-4 md:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            Explore Categories
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover services across various categories tailored to your needs
          </p>
        </div>

        <CategoryScrollContainer>
          {categories.map((category, index) => (
            <div key={category.name} className="snap-start flex-shrink-0 min-w-[280px] md:min-w-[320px] px-3">
              <EnhancedCategoryCard
                icon={category.icon}
                name={category.name}
                count={category.count}
                index={index}
                featured={category.featured}
                onClick={() => handleCategoryClick(category.name)}
              />
            </div>
          ))}
        </CategoryScrollContainer>
      </div>
    </section>
  )
}
