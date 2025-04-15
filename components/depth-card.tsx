"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface DepthCardProps {
  children: React.ReactNode
  className?: string
  depth?: number // 1-5, controls the intensity of the 3D effect
  glare?: boolean // Whether to show a glare effect
}

export function DepthCard({ children, className, depth = 3, glare = true }: DepthCardProps) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)

  const cardRef = useRef<HTMLDivElement>(null)

  // Normalize depth to a value between 0 and 1
  const normalizedDepth = Math.min(Math.max(depth, 1), 5) / 5
  const rotationFactor = normalizedDepth * 10 // Max rotation of 10 degrees
  const translateFactor = normalizedDepth * 15 // Max translation of 15px

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return

      const rect = cardRef.current.getBoundingClientRect()

      // Calculate mouse position relative to card center (in percentage, -50 to 50)
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 100
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 100

      setMouseX(x)
      setMouseY(y)

      // Calculate rotation based on mouse position
      setRotateY((x / 50) * rotationFactor)
      setRotateX((-y / 50) * rotationFactor)
    }

    const handleMouseLeave = () => {
      // Reset rotation when mouse leaves
      setRotateX(0)
      setRotateY(0)
    }

    const card = cardRef.current
    if (card) {
      card.addEventListener("mousemove", handleMouseMove)
      card.addEventListener("mouseleave", handleMouseLeave)

      return () => {
        card.removeEventListener("mousemove", handleMouseMove)
        card.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [rotationFactor])

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-xl bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10",
        `shadow-depth-${depth}`,
        className,
      )}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      animate={{
        rotateX,
        rotateY,
        z: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.5,
      }}
    >
      {/* Content container with 3D transform */}
      <div
        className="relative z-10 p-6"
        style={{
          transform: `translateZ(${translateFactor}px)`,
        }}
      >
        {children}
      </div>

      {/* Lighting effects */}
      {glare && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${50 + mouseX}% ${50 + mouseY}%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)`,
            opacity: 0.7,
          }}
        />
      )}

      {/* Edge highlight based on rotation */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: `
            linear-gradient(
              to right, 
              rgba(255, 255, 255, ${(rotateY > 0 ? 0.1 : 0.05) * normalizedDepth}) 0%, 
              transparent 15%, 
              transparent 85%, 
              rgba(255, 255, 255, ${(rotateY < 0 ? 0.1 : 0.05) * normalizedDepth}) 100%
            ),
            linear-gradient(
              to bottom, 
              rgba(255, 255, 255, ${(rotateX < 0 ? 0.1 : 0.05) * normalizedDepth}) 0%, 
              transparent 15%, 
              transparent 85%, 
              rgba(255, 255, 255, ${(rotateX > 0 ? 0.1 : 0.05) * normalizedDepth}) 100%
            )
          `,
        }}
      />
    </motion.div>
  )
}
