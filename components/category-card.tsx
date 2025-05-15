"use client"

import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface CategoryCardProps {
  icon: LucideIcon
  name: string
  count: number
  index: number
}

export function CategoryCard({ icon: Icon, name, count, index }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
      className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="mb-3 sm:mb-4 rounded-full bg-primary/10 p-3 sm:p-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
      </div>
      <h3 className="text-base sm:text-lg font-medium text-center">{name}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-center">{count} services</p>
    </motion.div>
  )
}
