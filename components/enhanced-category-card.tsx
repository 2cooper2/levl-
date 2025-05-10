"use client"

import type React from "react"

import type { LucideIcon } from "lucide-react"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { useRef, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface CategoryCardProps {
  icon: LucideIcon
  name: string
  count: number // Still in props but won't be displayed
  index: number
  featured?: boolean
  className?: string
}

export function EnhancedCategoryCard({ icon: Icon, name, index, featured = false, className = "" }: CategoryCardProps) {
  // Convert the category name to a URL-friendly slug
  const categorySlug = name.toLowerCase().replace(/\s+/g, "-")

  // Ref for the card element
  const cardRef = useRef<HTMLDivElement>(null)

  // Mouse position for gradient effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Create gradient spotlight effect that follows cursor
  const spotlightX = useMotionTemplate`${mouseX}%`
  const spotlightY = useMotionTemplate`${mouseY}%`

  // Handle mouse move for spotlight effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    mouseX.set(x)
    mouseY.set(y)
  }

  const [loading, setLoading] = useState(true)

  // Generate a placeholder image URL based on the category name
  const imageUrl = `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(`${name} category abstract pattern purple`)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="h-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        whileHover={{
          y: -8,
          transition: { duration: 0.2 },
        }}
        className="h-full perspective-1000"
      >
        <Link
          href={`/category/${categorySlug}`}
          className="block h-full transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-xl"
          aria-label={`Explore ${name} category`}
        >
          <div
            className={`relative group overflow-hidden rounded-xl border ${
              featured ? "border-purple-400/60" : "border-purple-300/50"
            } 
            backdrop-blur-xl text-card-foreground transition-all duration-300 h-full
            bg-purple-400/40 dark:bg-purple-500/25 ${className}
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

            {/* Background image with overlay */}
            <div className="absolute inset-0 opacity-20 mix-blend-overlay overflow-hidden">
              {loading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt=""
                  fill
                  className="object-cover"
                  style={{
                    transition: "transform 1.2s ease-in-out",
                  }}
                  aria-hidden="true"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onLoadingComplete={() => setLoading(false)}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-purple-700/30"></div>
            </div>

            {/* Interactive spotlight effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(255,255,255,0.15)_0%,transparent_60%)]"
              style={
                {
                  "--x": spotlightX,
                  "--y": spotlightY,
                } as React.CSSProperties
              }
            ></div>

            {/* Enhanced reflective top highlight with 3D effect */}
            <div
              className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/60 via-white/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"
              style={{ transform: "translateZ(5px)" }}
            ></div>

            {/* Enhanced hover shine effect with 3D */}
            <div
              className="absolute -inset-full h-[200%] w-[200%] bg-gradient-to-tr from-white/0 via-white/50 to-white/0 opacity-0 group-hover:opacity-100 transform -rotate-45 group-hover:translate-x-full transition-all duration-700 ease-in-out"
              style={{ transform: "translateZ(15px) rotate(-45deg)" }}
            ></div>

            {featured && (
              <motion.div
                className="absolute top-3 right-3 z-10"
                style={{ transform: "translateZ(20px)" }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="inline-flex items-center rounded-full bg-purple-500/40 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-white border border-purple-400/60 shadow-md">
                  <span className="relative flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                    Featured
                  </span>
                </span>
              </motion.div>
            )}

            {/* Content wrapper with 3D effect */}
            <div
              className="p-6 flex flex-col items-center justify-between text-center relative z-10 h-full"
              style={{ transform: "translateZ(10px)" }}
            >
              {/* Enhanced glossy icon container with 3D effect */}
              <motion.div
                className="relative rounded-full bg-gradient-to-br from-white/90 to-purple-200/80 p-4 
                shadow-lg overflow-hidden"
                style={{ transform: "translateZ(25px)" }}
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0 0 20px 0 rgba(168, 85, 247, 0.3)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {/* Icon top highlight */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white via-transparent to-transparent opacity-90"></div>

                {/* Icon shine effect */}
                <div className="absolute -inset-full h-20 w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transform -rotate-45 group-hover:translate-x-full transition-all duration-700 ease-in-out"></div>

                <Icon className="h-7 w-7 text-primary relative z-10" />
              </motion.div>

              {/* Flexible spacer */}
              <div className="flex-grow"></div>

              {/* Category name with enhanced styling */}
              <motion.div className="my-4" whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
                <h3 className="font-semibold text-xl text-white group-hover:text-white transition-colors duration-200 drop-shadow-md">
                  {name}
                </h3>
              </motion.div>

              {/* Flexible spacer */}
              <div className="flex-grow"></div>

              {/* Explore button with enhanced styling */}
              <motion.div
                className="flex items-center justify-center space-x-1.5 text-sm font-medium text-white/90 bg-purple-500/30 hover:bg-purple-500/40 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30 transition-all duration-200"
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(168, 85, 247, 0.4)",
                }}
                style={{ transform: "translateZ(20px)" }}
              >
                <span>Explore</span>
                <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  )
}
