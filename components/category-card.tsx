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
      className="flex flex-col items-center justify-center p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-medium">{name}</h3>
      <p className="text-sm text-muted-foreground mt-1">{count} services</p>
    </motion.div>
  )
}
