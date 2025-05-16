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
      whileHover={{
        y: -12,
        scale: 1.05,
        boxShadow:
          "0 30px 60px -12px rgba(0, 0, 0, 0.3), 0 18px 36px -18px rgba(0, 0, 0, 0.33), 0 0 0 1px rgba(0, 0, 0, 0.05)",
        filter: "drop-shadow(0 30px 40px rgba(0, 0, 0, 0.2))",
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      className="flex flex-col items-center justify-center p-6 rounded-xl border bg-card text-card-foreground transition-all cursor-pointer group relative overflow-visible"
      style={{
        boxShadow:
          "0 20px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)",
        transform: "translateY(0) translateZ(0)",
        filter: "drop-shadow(0 20px 30px rgba(0, 0, 0, 0.15))",
      }}
    >
      <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-medium">{name}</h3>
      <p className="text-sm text-muted-foreground mt-1">{count} services</p>
    </motion.div>
  )
}
