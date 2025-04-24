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
      whileHover={{
        y: -8,
        scale: 1.03,
        rotateX: 5,
        rotateY: -5,
        transition: { duration: 0.2 },
      }}
      className="h-full perspective-1000"
    >
      <Link href={`/category/${categorySlug}`} className="block h-full transform-gpu">
        <div
          className={`relative group overflow-hidden rounded-xl border ${
            featured ? "border-purple-400/60" : "border-purple-300/50"
          } 
          backdrop-blur-xl text-card-foreground transition-all duration-300 h-full
          bg-purple-400/40 dark:bg-purple-500/25
          shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] 
          hover:shadow-[0_20px_30px_-10px_rgba(147,51,234,0.4)]`}
          style={{
            transform: "translateZ(0)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Card background with depth */}
          <div
            className="absolute inset-0 backdrop-blur-[8px] bg-gradient-to-br from-purple-400/50 to-purple-500/30 dark:from-purple-500/30 dark:to-purple-600/20 opacity-80"
            style={{ transform: "translateZ(-10px)" }}
          ></div>

          {/* 3D layered background */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-700/10 opacity-70"
            style={{ transform: "translateZ(-5px)" }}
          ></div>

          {/* Enhanced reflective top highlight with 3D effect */}
          <div
            className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/60 via-white/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"
            style={{ transform: "translateZ(5px)" }}
          ></div>

          {/* Enhanced side reflection with 3D effect */}
          <div
            className="absolute top-0 bottom-0 right-0 w-1/4 bg-gradient-to-l from-white/40 via-white/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"
            style={{ transform: "translateZ(2px)" }}
          ></div>

          {/* Bottom edge highlight with depth */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-300/70 via-white/70 to-purple-300/70 opacity-50 group-hover:opacity-90 transition-opacity duration-300"
            style={{ transform: "translateZ(1px)" }}
          ></div>

          {/* Enhanced hover shine effect with 3D */}
          <div
            className="absolute -inset-full h-[200%] w-[200%] bg-gradient-to-tr from-white/0 via-white/50 to-white/0 opacity-0 group-hover:opacity-100 transform -rotate-45 group-hover:translate-x-full transition-all duration-700 ease-in-out"
            style={{ transform: "translateZ(15px) rotate(-45deg)" }}
          ></div>

          {/* Subtle constant shimmer effect */}
          <div
            className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-70 animate-pulse"
            style={{ transform: "translateZ(3px)" }}
          ></div>

          {/* 3D edge highlight - top */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px] bg-white/40 opacity-60 group-hover:opacity-80"
            style={{ transform: "translateZ(4px)" }}
          ></div>

          {/* 3D edge highlight - left */}
          <div
            className="absolute top-0 bottom-0 left-0 w-[3px] bg-white/30 opacity-60 group-hover:opacity-80"
            style={{ transform: "translateZ(4px)" }}
          ></div>

          {/* 3D drop shadow underneath */}
          <div
            className="absolute -bottom-4 left-2 right-2 h-8 bg-black/20 blur-xl rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-300"
            style={{ transform: "translateZ(-20px)" }}
          ></div>

          {featured && (
            <div className="absolute top-3 right-3 z-10" style={{ transform: "translateZ(20px)" }}>
              <span className="inline-flex items-center rounded-full bg-purple-500/40 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-white border border-purple-400/60 shadow-md">
                <span className="relative">
                  Featured
                  {/* Enhanced glossy shine on the badge */}
                  <span className="absolute inset-0 bg-gradient-to-b from-white/70 to-transparent opacity-70"></span>
                </span>
              </span>
            </div>
          )}

          {/* Content wrapper with 3D effect */}
          <div
            className="p-6 flex flex-col items-center justify-between text-center space-y-4 relative z-10 h-full"
            style={{ transform: "translateZ(10px)" }}
          >
            {/* Enhanced glossy icon container with 3D effect */}
            <div
              className="relative rounded-full bg-gradient-to-br from-white/90 to-purple-200/80 p-4 
              group-hover:from-white group-hover:to-white/80 transition-all duration-300 
              shadow-lg group-hover:shadow-xl group-hover:shadow-purple-400/30 group-hover:scale-110 overflow-hidden"
              style={{ transform: "translateZ(25px)" }}
            >
              {/* Icon top highlight */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white via-transparent to-transparent opacity-90"></div>

              {/* Icon shine effect */}
              <div className="absolute -inset-full h-20 w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transform -rotate-45 group-hover:translate-x-full transition-all duration-700 ease-in-out"></div>

              {/* Icon shadow for depth */}
              <div className="absolute -bottom-2 left-0 right-0 h-2 bg-black/10 blur-sm rounded-full"></div>

              <Icon className="h-7 w-7 text-primary relative z-10" />
            </div>

            <div className="flex-grow flex flex-col justify-center my-2" style={{ transform: "translateZ(15px)" }}>
              <h3 className="font-semibold text-lg text-white group-hover:text-white transition-colors duration-200 drop-shadow-md">
                {name}
              </h3>
            </div>

            {/* Explore indicator with 3D effect */}
            <div
              className="relative flex items-center justify-center space-x-1 text-sm font-medium text-white opacity-80 group-hover:opacity-100 transition-all duration-300 mt-2 drop-shadow-sm"
              style={{ transform: "translateZ(20px)" }}
            >
              <span>Explore</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />

              {/* Text highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-0 group-hover:opacity-100 mix-blend-overlay"></div>
            </div>

            {/* Animated underline with 3D effect */}
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 h-0.5 w-0 bg-gradient-to-r from-white/90 via-primary/90 to-purple-300/90 rounded-full group-hover:w-24 transition-all duration-300 ease-out shadow-md"
              style={{ transform: "translateZ(15px)" }}
            ></div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
