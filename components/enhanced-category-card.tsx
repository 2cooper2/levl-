"use client"

import type React from "react"

import type { LucideIcon } from "lucide-react"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { useRef } from "react"

interface CategoryCardProps {
  icon: LucideIcon
  name: string
  count: number // Still in props but won't be displayed
  index: number
  featured?: boolean
  className?: string
  size?: "default" | "small" // Add size prop
  onClick?: () => void // Add onClick prop
}

export function EnhancedCategoryCard({
  icon: Icon,
  name,
  index,
  featured = false,
  className = "",
  size = "default", // Default to the original size
  onClick, // Add onClick prop
}: CategoryCardProps) {
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

  // Generate a placeholder image URL based on the category name
  const imageUrl = `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(`${name} category abstract pattern purple`)}`

  // Adjust the icon size based on the size prop
  const iconSize = size === "small" ? "h-6 w-6" : "h-7 w-7"

  // Adjust the padding based on the size prop
  const cardPadding = size === "small" ? "p-3" : "p-6"

  // Adjust the text size based on the size prop
  const textSize = size === "small" ? "text-base" : "text-xl"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
      className="h-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        whileHover={{
          y: size === "small" ? -6 : -10,
          scale: 1.02,
          transition: { duration: 0.3, ease: "easeOut" },
        }}
        className="h-full perspective-[1500px]"
      >
        <div
          onClick={onClick}
          className="block h-full transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-xl cursor-pointer overflow-hidden"
          aria-label={`Explore ${name} category`}
        >
          <div
            className={`relative group overflow-hidden rounded-xl border ${
              featured ? "border-purple-400/60" : "border-purple-300/50"
            } 
            backdrop-blur-xl text-card-foreground transition-all duration-300 h-full
            bg-purple-400/40 dark:bg-purple-500/25 ${className}
            shadow-[0_15px_30px_-8px_rgba(0,0,0,0.35)] 
            hover:shadow-[0_25px_35px_-12px_rgba(147,51,234,0.5)]`}
            style={{
              transform: "translateZ(0)",
              transformStyle: "preserve-3d",
              borderRadius: "0.75rem", // Explicit border-radius to ensure rounded corners
            }}
          >
            {/* Card background with depth */}
            <div
              className="absolute inset-0 backdrop-blur-[8px] bg-gradient-to-br from-purple-400/60 to-purple-600/40 dark:from-purple-500/40 dark:to-purple-700/30 opacity-90 rounded-xl"
              style={{ transform: "translateZ(-10px)" }}
            ></div>

            {/* Background image with overlay */}
            <div className="absolute inset-0 opacity-20 mix-blend-overlay overflow-hidden rounded-xl">
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt=""
                fill
                className="object-cover rounded-xl"
                style={{
                  transition: "transform 1.2s ease-in-out",
                }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-purple-700/30 rounded-xl"></div>
            </div>

            {/* Interactive spotlight effect */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(255,255,255,0.15)_0%,transparent_60%)] rounded-xl"
              style={
                {
                  "--x": spotlightX,
                  "--y": spotlightY,
                } as React.CSSProperties
              }
            ></div>

            {/* Enhanced reflective top highlight with 3D effect - hidden on mobile */}
            <div
              className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/60 via-white/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300 hidden md:block rounded-t-xl"
              style={{ transform: "translateZ(5px)" }}
            ></div>

            {/* Enhanced hover shine effect with 3D - hidden on mobile */}
            <div
              className="absolute -inset-full h-[200%] w-[200%] bg-gradient-to-tr from-white/0 via-white/50 to-white/0 opacity-0 group-hover:opacity-100 transform -rotate-45 group-hover:translate-x-full transition-all duration-700 ease-in-out hidden md:block"
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
              className={`${cardPadding} flex flex-col items-center justify-between text-center relative z-10 h-full`}
              style={{ transform: "translateZ(15px) rotateX(2deg)" }}
            >
              {/* Enhanced glossy icon container with 3D effect */}
              <motion.div
                className={`relative rounded-full bg-gradient-to-br from-white/90 to-purple-200/80 ${size === "small" ? "p-2" : "p-4"} 
                shadow-lg overflow-hidden`}
                style={{ transform: "translateZ(30px)" }}
                whileHover={{
                  scale: 1.15,
                  boxShadow: "0 0 25px 5px rgba(168, 85, 247, 0.4)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {/* Icon top highlight - hidden on mobile */}
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white via-transparent to-transparent opacity-90 hidden md:block"></div>

                {/* Icon shine effect - hidden on mobile */}
                <div className="absolute -inset-full h-20 w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transform -rotate-45 group-hover:translate-x-full transition-all duration-700 ease-in-out hidden md:block"></div>

                <Icon className={`${iconSize} text-primary relative z-10`} />
              </motion.div>

              {/* Flexible spacer */}
              <div className={`flex-grow ${size === "small" ? "my-1" : ""}`}></div>

              {/* Category name with enhanced styling */}
              <motion.div
                className={size === "small" ? "my-2" : "my-4"}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <h3
                  className={`font-semibold ${textSize} text-white group-hover:text-white transition-colors duration-200 drop-shadow-md`}
                >
                  {name}
                </h3>
              </motion.div>

              {/* Flexible spacer */}
              <div className={`flex-grow ${size === "small" ? "my-1" : ""}`}></div>

              {/* Explore button with enhanced styling - Only show for default size */}
              {size === "default" && (
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
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
