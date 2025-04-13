"use client"

import type { LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface CategoryCardProps {
  icon: LucideIcon
  name: string
  count: number
  index: number
  featured?: boolean
}

export function EnhancedCategoryCard({ icon: Icon, name, count, index, featured = false }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Link href="/explore" className="block h-full">
        <div
          className={`relative group overflow-hidden rounded-xl border border-white/10 dark:border-white/5 
          ${
            featured ? "bg-white/20 dark:bg-white/10 backdrop-blur-md" : "bg-white/10 dark:bg-white/5 backdrop-blur-sm"
          } 
          text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg h-full`}
        >
          {/* Glassmorphic shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50"></div>

          {featured && (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center rounded-full bg-primary/20 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-primary border border-primary/10">
                Featured
              </span>
            </div>
          )}

          {/* Hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="p-6 flex flex-col items-center justify-between text-center space-y-4 relative z-10 h-full">
            <div
              className={`rounded-full ${
                featured ? "bg-primary/20 text-primary backdrop-blur-sm" : "bg-primary/10 text-primary backdrop-blur-sm"
              } p-4 group-hover:bg-primary/30 transition-all duration-300 shadow-sm group-hover:scale-110`}
            >
              <Icon className="h-7 w-7" />
            </div>

            <div className="flex-grow flex flex-col justify-center my-2">
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors duration-200">{name}</h3>
            </div>

            {/* Explore indicator that appears on hover */}
            <div className="flex items-center justify-center space-x-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 mt-2">
              <span>Explore</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>

            {/* Animated underline on hover */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-gradient-to-r from-primary to-purple-500 rounded-full group-hover:w-16 transition-all duration-300 ease-out"></div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
