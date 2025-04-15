"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface UltraDepthCardProps {
  children: React.ReactNode
  className?: string
  depth?: number // 1-10, controls the intensity of the 3D effect
  glare?: boolean // Whether to show a glare effect
  interactive?: boolean // Whether the card responds to mouse movement
  hoverScale?: number // How much the card scales on hover
}

export function UltraDepthCard({
  children,
  className,
  depth = 5,
  glare = true,
  interactive = true,
  hoverScale = 1.02,
}: UltraDepthCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Normalize depth to a value between 0 and 1
  const normalizedDepth = Math.min(Math.max(depth, 1), 10) / 10
  const rotationFactor = normalizedDepth * 15 // Max rotation of 15 degrees
  const translateFactor = normalizedDepth * 30 // Max translation of 30px
  const shadowIntensity = normalizedDepth * 0.4 // Controls shadow opacity

  // Motion values for smooth animations
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Add springs for smoother motion
  const springConfig = { damping: 25, stiffness: 300 }
  const rotateX = useSpring(useMotionValue(0), springConfig)
  const rotateY = useSpring(useMotionValue(0), springConfig)
  const scale = useSpring(useMotionValue(1), springConfig)
  const translateZ = useSpring(useMotionValue(0), springConfig)

  // Derived values for lighting effects
  const glareX = useTransform(mouseX, [-100, 100], [0, 100])
  const glareY = useTransform(mouseY, [-100, 100], [0, 100])
  const glareOpacity = useTransform(mouseX, [-100, 0, 100], [0.1, normalizedDepth * 0.15, 0.1])

  useEffect(() => {
    if (!interactive || !cardRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return

      const rect = cardRef.current.getBoundingClientRect()

      // Calculate mouse position relative to card center (in percentage, -50 to 50)
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 100
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 100

      mouseX.set(x)
      mouseY.set(y)

      // Calculate rotation based on mouse position
      rotateY.set((x / 50) * rotationFactor)
      rotateX.set((-y / 50) * rotationFactor)
      translateZ.set(isHovered ? translateFactor : 0)
    }

    const handleMouseEnter = () => {
      setIsHovered(true)
      scale.set(hoverScale)
      translateZ.set(translateFactor)
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      mouseX.set(0)
      mouseY.set(0)
      rotateX.set(0)
      rotateY.set(0)
      scale.set(1)
      translateZ.set(0)
    }

    const card = cardRef.current
    if (card) {
      card.addEventListener("mousemove", handleMouseMove)
      card.addEventListener("mouseenter", handleMouseEnter)
      card.addEventListener("mouseleave", handleMouseLeave)

      return () => {
        card.removeEventListener("mousemove", handleMouseMove)
        card.removeEventListener("mouseenter", handleMouseEnter)
        card.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [
    interactive,
    rotateX,
    rotateY,
    mouseX,
    mouseY,
    rotationFactor,
    isHovered,
    scale,
    hoverScale,
    translateZ,
    translateFactor,
  ])

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-xl bg-white/10 dark:bg-black/10 backdrop-blur-sm border border-white/20 dark:border-white/10",
        className,
      )}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
        scale,
        rotateX,
        rotateY,
        z: translateZ,
        boxShadow: isHovered
          ? `0 ${10 * normalizedDepth}px ${25 * normalizedDepth}px rgba(0, 0, 0, ${shadowIntensity})`
          : `0 ${5 * normalizedDepth}px ${10 * normalizedDepth}px rgba(0, 0, 0, ${shadowIntensity * 0.5})`,
      }}
    >
      {/* Content container with 3D transform */}
      <div
        className="relative z-10 p-6"
        style={{
          transform: `translateZ(${translateFactor / 2}px)`,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </div>

      {/* Lighting effects */}
      {glare && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, ${glareOpacity.get()}) 0%, transparent 70%)`,
            opacity: isHovered ? 1 : 0.7,
          }}
        />
      )}

      {/* Edge highlight based on rotation */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: `
            linear-gradient(
              to right, 
              rgba(255, 255, 255, ${(rotateY.get() > 0 ? 0.15 : 0.05) * normalizedDepth}) 0%, 
              transparent 15%, 
              transparent 85%, 
              rgba(255, 255, 255, ${(rotateY.get() < 0 ? 0.15 : 0.05) * normalizedDepth}) 100%
            ),
            linear-gradient(
              to bottom, 
              rgba(255, 255, 255, ${(rotateX.get() < 0 ? 0.15 : 0.05) * normalizedDepth}) 0%, 
              transparent 15%, 
              transparent 85%, 
              rgba(255, 255, 255, ${(rotateX.get() > 0 ? 0.15 : 0.05) * normalizedDepth}) 100%
            )
          `,
        }}
      />

      {/* Inner shadow for depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          boxShadow: `inset 0 0 ${20 * normalizedDepth}px rgba(0, 0, 0, ${0.2 * normalizedDepth})`,
        }}
      />
    </motion.div>
  )
}
