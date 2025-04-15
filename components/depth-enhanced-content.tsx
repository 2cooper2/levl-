"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface DepthEnhancedContentProps {
  children: ReactNode
  depth?: 1 | 2 | 3 | 4 | 5
  className?: string
}

export function DepthEnhancedContent({ children, depth = 3, className = "" }: DepthEnhancedContentProps) {
  // Map depth level to shadow and transform values
  const depthStyles = {
    1: {
      shadow: "shadow-depth-1",
      translateZ: "translate-z-[25px]",
      scale: 1.01,
    },
    2: {
      shadow: "shadow-depth-2",
      translateZ: "translate-z-[50px]",
      scale: 1.02,
    },
    3: {
      shadow: "shadow-depth-3",
      translateZ: "translate-z-[75px]",
      scale: 1.03,
    },
    4: {
      shadow: "shadow-depth-4",
      translateZ: "translate-z-[100px]",
      scale: 1.04,
    },
    5: {
      shadow: "shadow-depth-5",
      translateZ: "translate-z-[150px]",
      scale: 1.05,
    },
  }

  const { shadow, scale } = depthStyles[depth]

  return (
    <motion.div
      className={`relative ${shadow} rounded-lg bg-background/80 backdrop-blur-sm ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale }}
    >
      {children}
    </motion.div>
  )
}
