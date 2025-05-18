"use client"

import {
  Hammer,
  PenLineIcon as PipeLine,
  Zap,
  PaintBucket,
  Camera,
  Code2,
  Sofa,
  GraduationCap,
  ChefHat,
  Globe,
  Stethoscope,
  LineChart,
  Megaphone,
  Bike,
  MoveIcon as TruckMoving,
  Dumbbell,
  Scissors,
  FileEdit,
  Palette,
  Building,
  Ruler,
  Dog,
  Baby,
  Car,
  ShoppingCart,
  MonitorSmartphone,
  Shirt,
  Plane,
  Brush,
  Briefcase,
} from "lucide-react"
import { EnhancedCategoryCard } from "./enhanced-category-card"

// Define the categories with their appropriate icons
const categories = [
  { name: "Home Repair", icon: Hammer, count: 128 },
  { name: "Plumbing", icon: PipeLine, count: 76 },
  { name: "Electrical", icon: Zap, count: 93 },
  { name: "Painting", icon: PaintBucket, count: 59 },
  { name: "Photography", icon: Camera, count: 144 },
  { name: "Programming", icon: Code2, count: 218 },
  { name: "Interior Design", icon: Sofa, count: 82 },
  { name: "Education", icon: GraduationCap, count: 176 },
  { name: "Cooking", icon: ChefHat, count: 64 },
  { name: "Web Development", icon: Globe, count: 193 },
  { name: "Healthcare", icon: Stethoscope, count: 157 },
  { name: "Business", icon: LineChart, count: 204 },
  { name: "Marketing", icon: Megaphone, count: 118 },
  { name: "Cycling", icon: Bike, count: 42 },
  { name: "Moving", icon: TruckMoving, count: 56 },
  { name: "Fitness", icon: Dumbbell, count: 94 },
  { name: "Hair Styling", icon: Scissors, count: 78 },
  { name: "Content Writing", icon: FileEdit, count: 87 },
  { name: "Graphic Design", icon: Palette, count: 126 },
  { name: "Architecture", icon: Building, count: 49 },
  { name: "Carpentry", icon: Ruler, count: 61 },
  { name: "Pet Care", icon: Dog, count: 83 },
  { name: "Childcare", icon: Baby, count: 72 },
  { name: "Auto Repair", icon: Car, count: 68 },
  { name: "Personal Shopping", icon: ShoppingCart, count: 53 },
  { name: "TV & Electronics", icon: MonitorSmartphone, count: 89 },
  { name: "Tailoring", icon: Shirt, count: 47 },
  { name: "Travel Planning", icon: Plane, count: 74 },
  { name: "Makeup Artist", icon: Brush, count: 66 },
  { name: "Legal Services", icon: Briefcase, count: 58 },
]

interface CategoryGridProps {
  limit?: number
  featured?: string[]
  className?: string
}

export function CategoryGrid({ limit, featured = [], className = "" }: CategoryGridProps) {
  // If limit is provided, only show that many categories
  const displayCategories = limit ? categories.slice(0, limit) : categories

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${className}`}>
      {displayCategories.map((category, index) => (
        <EnhancedCategoryCard
          key={category.name}
          name={category.name}
          icon={category.icon}
          count={category.count}
          index={index}
          featured={featured.includes(category.name)}
          onClick={() => console.log(`Clicked on ${category.name}`)}
        />
      ))}
    </div>
  )
}
