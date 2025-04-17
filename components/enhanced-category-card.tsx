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
  // Convert the category name to a URL-friendly slug
  const categorySlug = name.toLowerCase().replace(/\s+/g, "-")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Link href={`/category/${categorySlug}`} className="block h-full">
        <div
          className={`relative group overflow-hidden rounded-xl border ${
            featured ? "border-purple-300/40" : "border-purple-200/30"
          } 
          ${featured ? "bg-primary/30 dark:bg-primary/20" : "bg-primary/20 dark:bg-primary/15"} 
          backdrop-blur-xl text-card-foreground shadow-md transition-all duration-300 
          hover:shadow-xl hover:shadow-purple-500/20 h-full`}
        >
          {/* Ultra glossy top highlight - simulates light reflection */}
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/50 via-white/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>

          {/* Side glossy highlight */}
          <div className="absolute top-0 bottom-0 right-0 w-1/4 bg-gradient-to-l from-white/30 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>

          {/* Bottom edge highlight */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-white/40 opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>

          {/* Dynamic shine effect that moves on hover */}
          <div className="absolute -inset-full h-[200%] w-[200%] bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transform -rotate-45 group-hover:translate-x-full transition-all duration-1000 ease-in-out"></div>

          {/* Subtle rainbow reflection */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-500"></div>

          {/* Enhanced glass effect with blur */}
          <div className="absolute inset-0 backdrop-blur-md bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Subtle pattern overlay for texture */}
          <div
            className="absolute inset-0 opacity-5 mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fillOpacity='0.4' fillRule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          ></div>

          {featured && (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center rounded-full bg-primary/40 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white border border-purple-300/40 shadow-sm">
                <span className="relative">
                  Featured
                  {/* Glossy shine on the badge */}
                  <span className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-50"></span>
                </span>
              </span>
            </div>
          )}

          {/* Enhanced hover gradient with more depth and glossiness */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-purple-500/30 to-purple-700/40 opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105"></div>

          {/* Inner border glow - enhanced */}
          <div className="absolute inset-0 rounded-xl border-2 border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[0.5px]"></div>

          <div className="p-6 flex flex-col items-center justify-between text-center space-y-4 relative z-10 h-full">
            {/* Ultra glossy icon container */}
            <div
              className={`relative rounded-full ${
                featured ? "bg-gradient-to-br from-white/95 to-white/80" : "bg-gradient-to-br from-white/90 to-white/75"
              } p-4 group-hover:bg-white/95 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110 overflow-hidden`}
            >
              {/* Icon top highlight */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white via-transparent to-transparent opacity-80"></div>

              {/* Icon shine effect - enhanced */}
              <div className="absolute -inset-full h-20 w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transform -rotate-45 group-hover:translate-x-full transition-all duration-1000 ease-in-out"></div>

              {/* Icon bottom reflection */}
              <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-primary/10 to-transparent opacity-50"></div>

              <Icon className="h-7 w-7 text-primary relative z-10" />
            </div>

            <div className="flex-grow flex flex-col justify-center my-2">
              <h3 className="font-semibold text-lg text-white group-hover:text-white transition-colors duration-200 drop-shadow-sm">
                {name}
              </h3>
            </div>

            {/* Enhanced explore indicator with glossy effect */}
            <div className="relative flex items-center justify-center space-x-1 text-sm font-medium text-white opacity-80 group-hover:opacity-100 transition-all duration-300 mt-2 drop-shadow-sm">
              <span>Explore</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />

              {/* Text highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-0 group-hover:opacity-100 mix-blend-overlay"></div>
            </div>

            {/* Enhanced animated underline with glossy effect */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-gradient-to-r from-white/90 via-primary to-purple-300 rounded-full group-hover:w-20 transition-all duration-300 ease-out shadow-md"></div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
