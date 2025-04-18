"use client"

import { motion, useAnimation } from "framer-motion"
import { useEffect, useRef, useState } from "react"

interface AnimatedTextDividerProps {
  firstText: string
  secondText: string
  className?: string
}

export function AnimatedTextDivider({ firstText, secondText, className = "" }: AnimatedTextDividerProps) {
  const dividerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const [hovered, setHovered] = useState(false)

  // Initialize animation on mount
  useEffect(() => {
    controls.start("visible")
  }, [controls])

  // Generate particles for background effect
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <div
      ref={dividerRef}
      className={`relative w-full py-16 overflow-hidden ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Enhanced gradient background with depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/60 via-purple-100/60 to-blue-100/60 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-blue-900/30"></div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>

      {/* Animated particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white dark:bg-purple-300 opacity-40 dark:opacity-20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: particle.delay,
          }}
        />
      ))}

      {/* Enhanced wave effect with multiple layers for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
        {/* First wave layer */}
        <svg className="absolute bottom-0 left-0 right-0 w-full h-16" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <motion.path
            d="M0,50 C320,120 420,0 840,60 C1260,120 1360,0 1440,40 L1440,100 L0,100 Z"
            fill="url(#gradient1)"
            animate={{
              d: [
                "M0,50 C320,120 420,0 840,60 C1260,120 1360,0 1440,40 L1440,100 L0,100 Z",
                "M0,40 C320,0 420,120 840,40 C1260,0 1360,120 1440,50 L1440,100 L0,100 Z",
                "M0,50 C320,120 420,0 840,60 C1260,120 1360,0 1440,40 L1440,100 L0,100 Z",
              ],
            }}
            transition={{
              duration: 15,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(96, 165, 250, 0.4)" />
              <stop offset="50%" stopColor="rgba(168, 85, 247, 0.4)" />
              <stop offset="100%" stopColor="rgba(96, 165, 250, 0.4)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Second wave layer (slightly offset) */}
        <svg className="absolute bottom-0 left-0 right-0 w-full h-14" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <motion.path
            d="M0,60 C280,0 520,120 720,60 C920,0 1200,80 1440,30 L1440,100 L0,100 Z"
            fill="url(#gradient2)"
            animate={{
              d: [
                "M0,60 C280,0 520,120 720,60 C920,0 1200,80 1440,30 L1440,100 L0,100 Z",
                "M0,30 C280,100 520,20 720,80 C920,30 1200,100 1440,60 L1440,100 L0,100 Z",
                "M0,60 C280,0 520,120 720,60 C920,0 1200,80 1440,30 L1440,100 L0,100 Z",
              ],
            }}
            transition={{
              duration: 18,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
          <defs>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(96, 165, 250, 0.2)" />
              <stop offset="50%" stopColor="rgba(168, 85, 247, 0.2)" />
              <stop offset="100%" stopColor="rgba(96, 165, 250, 0.2)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Top subtle highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
          {/* First text with enhanced animation */}
          <motion.div
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white relative"
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
              },
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Text shadow for depth */}
            <span className="relative z-10 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] [text-shadow:0_1px_0_rgb(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.3)]">
              {firstText}
            </span>

            {/* Subtle highlight under text on hover */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
              initial={{ width: "0%", opacity: 0 }}
              animate={{
                width: hovered ? "100%" : "30%",
                opacity: hovered ? 0.7 : 0.3,
              }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>

          {/* Enhanced divider with animation */}
          <div className="relative h-16 md:h-20 w-px hidden md:block">
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500 to-transparent"
              animate={{
                opacity: [0.5, 1, 0.5],
                height: ["80%", "90%", "80%"],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "mirror",
              }}
            />

            {/* Glowing dot in the middle */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400"
              animate={{
                boxShadow: [
                  "0 0 4px 1px rgba(168, 85, 247, 0.4)",
                  "0 0 8px 2px rgba(168, 85, 247, 0.6)",
                  "0 0 4px 1px rgba(168, 85, 247, 0.4)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "mirror",
              }}
            />
          </div>

          {/* Second text with enhanced animation */}
          <motion.div
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white relative"
            initial="hidden"
            animate={controls}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] },
              },
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Text with gradient */}
            <span className="relative z-10 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] [text-shadow:0_1px_0_rgb(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.3)]">
              {secondText}
            </span>

            {/* Subtle highlight under text on hover */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"
              initial={{ width: "0%", opacity: 0 }}
              animate={{
                width: hovered ? "100%" : "30%",
                opacity: hovered ? 0.7 : 0.3,
              }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
