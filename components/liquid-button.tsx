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
      {/* Liquid blob effect */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <radialGradient
                id="liquid-gradient"
                cx={mousePosition.x / dimensions.width}
                cy={mousePosition.y / dimensions.height}
                r="0.5"
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>
            <motion.circle
              cx={mousePosition.x}
              cy={mousePosition.y}
              r={isPressed ? dimensions.width : dimensions.width * 0.3}
              fill="url(#liquid-gradient)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </svg>
        </motion.div>
      )}

      {/* Button content with subtle 3D effect */}
      <motion.span
        className="relative z-10 flex items-center justify-center"
        animate={{
          y: isPressed ? 1 : 0,
          scale: isPressed ? 0.98 : 1,
        }}
      >
        {children}
      </motion.span>
    </motion.button>
  )
}
