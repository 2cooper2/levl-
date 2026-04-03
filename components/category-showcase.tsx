"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  PaintBucket,
  Hammer,
  Camera,
  PenLineIcon as PipeLine,
  Globe,
  Sofa,
  LineChart,
  ShoppingCart,
  ChefHat,
  CarFront,
  Scissors,
  Music,
  GraduationCap,
  Stethoscope,
  Flower2,
  MonitorSmartphone,
  Shirt,
  MoveIcon as TruckMoving,
  FileEdit,
  Zap,
  Brush,
  Palette,
  Ruler,
  Building,
  Briefcase,
  Baby,
  Dog,
  Bike,
  Dumbbell,
  Plane,
} from "lucide-react"
import { EnhancedCategoryCard } from "@/components/enhanced-category-card"

// Define category data with more specific icons
const categories = [
  { name: "Home Repair", icon: Hammer, count: 120, featured: true },
  { name: "Plumbing", icon: PipeLine, count: 85 },
  { name: "Electrical", icon: Zap, count: 92 },
  { name: "Painting", icon: PaintBucket, count: 78 },
  { name: "Photography", icon: Camera, count: 65 },
  { name: "Web Development", icon: Globe, count: 110 },
  { name: "Interior Design", icon: Sofa, count: 55 },
  { name: "Business Consulting", icon: LineChart, count: 48 },
  { name: "Personal Shopping", icon: ShoppingCart, count: 37 },
  { name: "Cooking Lessons", icon: ChefHat, count: 42 },
  { name: "Auto Repair", icon: CarFront, count: 63 },
  { name: "Hair Styling", icon: Scissors, count: 89 },
  { name: "Music Lessons", icon: Music, count: 51 },
  { name: "Tutoring", icon: GraduationCap, count: 74 },
  { name: "Healthcare", icon: Stethoscope, count: 29 },
  { name: "Gardening", icon: Flower2, count: 44 },
  { name: "TV & Electronics", icon: MonitorSmartphone, count: 38 },
  { name: "Tailoring", icon: Shirt, count: 27 },
  { name: "Moving Services", icon: TruckMoving, count: 56 },
  { name: "Content Writing", icon: FileEdit, count: 33 },
  { name: "Graphic Design", icon: Palette, count: 41 },
  { name: "Makeup Artist", icon: Brush, count: 39 },
  { name: "Carpentry", icon: Ruler, count: 47 },
  { name: "Architecture", icon: Building, count: 31 },
  { name: "Legal Services", icon: Briefcase, count: 28 },
  { name: "Childcare", icon: Baby, count: 52 },
  { name: "Pet Care", icon: Dog, count: 45 },
  { name: "Fitness Training", icon: Dumbbell, count: 58 },
  { name: "Cycling Repair", icon: Bike, count: 25 },
  { name: "Travel Planning", icon: Plane, count: 36 },
]

export function CategoryShowcase() {
  const [visibleCategories, setVisibleCategories] = useState(8)

  const handleLoadMore = () => {
    setVisibleCategories((prev) => Math.min(prev + 8, categories.length))
  }

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Explore Services by Category</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Find skilled professionals across a wide range of categories to help with your projects and needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {categories.slice(0, visibleCategories).map((category, index) => (
            <EnhancedCategoryCard
              key={category.name}
              icon={category.icon}
              name={category.name}
              count={category.count}
              index={index}
              featured={category.featured}
            />
          ))}
        </div>

        {visibleCategories < categories.length && (
          <div className="mt-12 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all duration-200"
              onClick={handleLoadMore}
            >
              Load More Categories
            </motion.button>
          </div>
        )}
      </div>
    </section>
  )
}
