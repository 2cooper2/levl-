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
      className="h-full pb-8" // Increased bottom padding for more shadow space
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        whileHover={{
          y: size === "small" ? -8 : -12, // Increased lift on hover
          scale: 1.03,
          transition: { duration: 0.3, ease: "easeOut" },
        }}
        className="h-full perspective-[1500px] overflow-visible"
      >
        <div
          onClick={onClick}
          className={`relative group overflow-hidden rounded-xl backdrop-blur-xl text-card-foreground transition-all duration-300 h-full
bg-gradient-to-br from-white/95 via-white/90 to-indigo-50/90 dark:from-gray-800/95 dark:via-gray-800/90 dark:to-indigo-950/90 ${className}
translate-y-[-4px] hover:translate-y-[-10px] mb-4`} // Added mb-4 for bottom margin
          style={{
            transform: "translateZ(0)",
            transformStyle: "preserve-3d",
            borderRadius: "0.75rem", // Explicit border-radius to ensure rounded corners
            transformOrigin: "center bottom",
            position: "relative",
            // Enhanced shadow with BLACK color for depth
            boxShadow:
              "0 20px 25px -5px rgba(0,0,0,0.4), 0 10px 10px -5px rgba(0,0,0,0.3), 0 -2px 8px 0px rgba(255,255,255,0.2)",
            // Glassmorphic border
            border: "1px solid rgba(167, 139, 250, 0.5)",
          }}
        >
          {/* Enhanced bottom shadow with more depth - BLACK */}
          <div
            className="absolute -bottom-6 left-[10%] right-[10%] h-6 rounded-full"
            style={{
              background: "radial-gradient(ellipse at center, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 70%)",
              filter: "blur(10px)",
              transform: "translateZ(-20px) rotateX(40deg)",
              zIndex: -1,
            }}
          ></div>

          {/* Card background with depth — richer lavender gradient */}
          <div
            className="absolute inset-0 backdrop-blur-[8px] rounded-xl opacity-95"
            style={{
              transform: "translateZ(-10px)",
              background: "linear-gradient(135deg, rgba(167,139,250,0.72) 0%, rgba(139,92,246,0.65) 45%, rgba(109,40,217,0.55) 100%)",
            }}
          />
          {/* Ambient glow pulse */}
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(192,132,252,0.35) 0%, transparent 65%)" }}
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

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

          {/* Glassmorphic border overlay */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "inset 0 1px 1px 0 rgba(255,255,255,0.25)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          ></div>

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
            className={`${cardPadding} flex flex-col items-center justify-between text-center relative z-10 h-full min-h-[160px]`}
            style={{ transform: "translateZ(15px) rotateX(2deg)" }}
          >
            {/* Enhanced glossy icon container with 3D effect */}
            <motion.div
              className={`relative rounded-full bg-gradient-to-br from-white/95 to-purple-100/85 ${size === "small" ? "p-3" : "p-5"}
  shadow-lg overflow-hidden border border-purple-300/50`}
              style={{
                transform: "translateZ(30px)",
                boxShadow:
                  "0 10px 20px -3px rgba(139, 92, 246, 0.35), 0 4px 8px -4px rgba(139, 92, 246, 0.25), inset 0 1px 2px 0 rgba(255,255,255,0.95)",
              }}
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

              <Icon className={`${iconSize} text-purple-500 relative z-10`} />
            </motion.div>

            {/* Flexible spacer */}
            <div className={`flex-grow ${size === "small" ? "my-1" : ""}`}></div>

            {/* Category name with enhanced styling */}
            <motion.div
              className={size === "small" ? "my-2" : "my-3"}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
              style={{ transform: "translateZ(25px)" }}
            >
              <h3
                className={`font-semibold ${textSize} text-white group-hover:text-white transition-colors duration-200`}
                style={{
                  textShadow: "0 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(168, 85, 247, 0.5)",
                  letterSpacing: "0.02em",
                }}
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
                style={{
                  transform: "translateZ(20px)",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2)",
                }}
              >
                <span>Explore</span>
                <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
