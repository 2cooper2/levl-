"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
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

  // Mouse position values - simplified with fewer transformations
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Use direct transforms instead of springs for better performance
  const rotateX = useTransform(mouseY, [-100, 100], [5, -5]) // Reduce rotation range
  const rotateY = useTransform(mouseX, [-100, 100], [-5, 5]) // Reduce rotation range

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
      {/* Simplified glow effect - static instead of dynamic position */}
      <motion.div
        className="absolute -inset-px rounded-xl opacity-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 70%)`,
          opacity: isHovered ? 0.7 : 0,
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
