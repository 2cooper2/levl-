"use client"

import { motion, useAnimation } from "framer-motion"
import { useEffect, useRef, useState } from "react"

interface CircuitDividerProps {
  firstText: string
  secondText: string
  className?: string
}

export function CircuitDivider({ firstText, secondText, className = "" }: CircuitDividerProps) {
  const dividerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const [hovered, setHovered] = useState(false)

  // Initialize animation on mount
  useEffect(() => {
    controls.start("visible")
  }, [controls])

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

      {/* Circuit board pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden">
        {/* Horizontal lines */}
        <svg className="absolute bottom-0 left-0 right-0 w-full h-24" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <motion.path
            d="M0,100 L240,100 L240,90 L480,90 L480,110 L720,110 L720,95 L960,95 L960,105 L1200,105 L1200,85 L1440,85 L1440,120 L0,120 Z"
            fill="url(#circuitGradient1)"
            animate={{
              d: [
                "M0,100 L240,100 L240,90 L480,90 L480,110 L720,110 L720,95 L960,95 L960,105 L1200,105 L1200,85 L1440,85 L1440,120 L0,120 Z",
                "M0,95 L240,95 L240,105 L480,105 L480,85 L720,85 L720,100 L960,100 L960,90 L1200,90 L1200,110 L1440,110 L1440,120 L0,120 Z",
              ],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
          <defs>
            <linearGradient id="circuitGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(96, 165, 250, 0.6)" />
              <stop offset="50%" stopColor="rgba(168, 85, 247, 0.6)" />
              <stop offset="100%" stopColor="rgba(96, 165, 250, 0.6)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Vertical connectors */}
        {[120, 360, 600, 840, 1080, 1320].map((x, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 w-2 bg-gradient-to-t from-purple-500/60 to-blue-500/60"
            style={{
              left: `${(x / 1440) * 100}%`,
              height: `${30 + i * 5}px`,
            }}
            animate={{
              height: [`${30 + i * 5}px`, `${40 + i * 5}px`, `${30 + i * 5}px`],
              opacity: [0.6, 0.8, 0.6],
            }}
            transition={{
              duration: 4,
              delay: i * 0.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "mirror",
            }}
          />
        ))}

        {/* Circuit nodes */}
        {[120, 360, 600, 840, 1080, 1320].map((x, i) => (
          <motion.div
            key={`node-${i}`}
            className="absolute w-4 h-4 rounded-full bg-purple-500"
            style={{
              left: `${(x / 1440) * 100}%`,
              bottom: `${20 + (i % 3) * 10}px`,
              transform: "translate(-50%, 50%)",
            }}
            animate={{
              boxShadow: [
                "0 0 5px 2px rgba(168, 85, 247, 0.3)",
                "0 0 10px 4px rgba(168, 85, 247, 0.6)",
                "0 0 5px 2px rgba(168, 85, 247, 0.3)",
              ],
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "mirror",
            }}
          />
        ))}

        {/* Data pulse effect */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`pulse-${i}`}
            className="absolute h-2 w-2 rounded-full bg-blue-400"
            initial={{ left: "0%", bottom: `${20 + (i % 3) * 10}px` }}
            animate={{ left: "100%" }}
            transition={{
              duration: 8,
              delay: i * 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
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
