"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface DimensionalCardProps {
  children: React.ReactNode
  className?: string
  depth?: number
  backgroundColor?: string
  glowColor?: string
  borderColor?: string
}

export function DimensionalCard({
  children,
  className,
  depth = 20,
  backgroundColor = "hsl(var(--card))",
  glowColor = "rgba(var(--primary-rgb), 0.15)",
  borderColor = "rgba(var(--primary-rgb), 0.1)",
}: DimensionalCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Mouse position values
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring physics for mouse movement
  const springConfig = { damping: 20, stiffness: 300 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  // Transform mouse position into rotation values
  const rotateX = useTransform(springY, [-100, 100], [10, -10])
  const rotateY = useTransform(springX, [-100, 100], [-10, 10])

  // Handle mouse move for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    mouseX.set(e.clientX - centerX)
    mouseY.set(e.clientY - centerY)
  }

  // Reset position when mouse leaves
  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  // Clean up animation values
  useEffect(() => {
    return () => {
      mouseX.destroy()
      mouseY.destroy()
    }
  }, [mouseX, mouseY])

  return (
    <motion.div
      ref={cardRef}
      className={cn("relative rounded-xl overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-px rounded-xl opacity-0"
        style={{
          background: `radial-gradient(circle at ${mouseX.get()}px ${mouseY.get()}px, ${glowColor} 0%, transparent 70%)`,
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />

      {/* Card content with 3D transform */}
      <motion.div
        className="relative rounded-xl border overflow-hidden"
        style={{
          backgroundColor,
          borderColor,
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          boxShadow: isHovered
            ? `0 10px 30px -10px ${glowColor}, 0 1px 3px rgba(0,0,0,0.1)`
            : "0 1px 3px rgba(0,0,0,0.1)",
          transition: "box-shadow 0.3s",
        }}
      >
        {/* Inner elements with depth */}
        <motion.div
          style={{
            transformStyle: "preserve-3d",
            transform: `translateZ(${depth}px)`,
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
