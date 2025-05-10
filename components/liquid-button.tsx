"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  variant?: "default" | "gradient" | "outline"
}

export function LiquidButton({ children, className, variant = "default", ...props }: LiquidButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  // Update button dimensions on mount
  useEffect(() => {
    if (buttonRef.current) {
      setDimensions({
        width: buttonRef.current.offsetWidth,
        height: buttonRef.current.offsetHeight,
      })
    }
  }, [])

  // Handle mouse interactions
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case "gradient":
        return "bg-gradient-to-r from-primary to-purple-500 text-primary-foreground"
      case "outline":
        return "bg-transparent border border-primary/20 text-foreground hover:bg-primary/5"
      default:
        return "bg-primary text-primary-foreground"
    }
  }

  return (
    <motion.button
      ref={buttonRef}
      className={cn(
        "relative overflow-hidden rounded-full px-6 py-3 font-medium transition-all",
        getVariantStyles(),
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {/* Simplified hover effect - no SVG */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-white/10 rounded-full pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isPressed ? 0.3 : 0.15, scale: isPressed ? 1 : 0.95 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Button content with subtle 3D effect */}
      <span className="relative z-10 flex items-center justify-center">{children}</span>
    </motion.button>
  )
}
