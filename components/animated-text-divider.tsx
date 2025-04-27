"use client"

import type React from "react"

import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useEffect, useRef, useState } from "react"

interface AnimatedTextDividerProps {
  firstText: string
  secondText: string
  className?: string
}

export function AnimatedTextDivider({ firstText, secondText, className = "" }: AnimatedTextDividerProps) {
  const dividerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [expandedInfo, setExpandedInfo] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [sectionRect, setSectionRect] = useState({ width: 0, height: 0, left: 0, top: 0 })

  // Motion values for parallax effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring physics for mouse movement
  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 })
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 })

  // Transform mouse position to background movement (subtle effect)
  const backgroundX = useTransform(smoothMouseX, [-1, 1], ["-2%", "2%"])
  const backgroundY = useTransform(smoothMouseY, [-1, 1], ["-2%", "2%"])

  // Light spot positions based on mouse
  const lightSpot1X = useTransform(smoothMouseX, [-1, 1], ["20%", "30%"])
  const lightSpot1Y = useTransform(smoothMouseY, [-1, 1], ["20%", "30%"])
  const lightSpot2X = useTransform(smoothMouseX, [-1, 1], ["70%", "80%"])
  const lightSpot2Y = useTransform(smoothMouseY, [-1, 1], ["70%", "80%"])

  // Initialize animation on mount and check device capabilities
  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check for reduced motion preference
    const checkReducedMotion = () => {
      setIsReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    }

    checkMobile()
    checkReducedMotion()

    window.addEventListener("resize", checkMobile)
    window.addEventListener("resize", checkReducedMotion)

    // Simple intersection observer to trigger animations when in view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true)

          // Update section dimensions for mouse tracking
          if (dividerRef.current) {
            const rect = dividerRef.current.getBoundingClientRect()
            setSectionRect({
              width: rect.width,
              height: rect.height,
              left: rect.left,
              top: rect.top,
            })
          }
        } else {
          setIsInView(false)
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    )

    if (dividerRef.current) {
      observer.observe(dividerRef.current)
    }

    return () => {
      if (dividerRef.current) {
        observer.unobserve(dividerRef.current)
      }
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("resize", checkReducedMotion)
    }
  }, [])

  // Handle mouse movement for interactive background
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isReducedMotion || !isInView) return

    // Calculate normalized mouse position (-1 to 1)
    const { clientX, clientY } = e
    const normalizedX = ((clientX - sectionRect.left) / sectionRect.width) * 2 - 1
    const normalizedY = ((clientY - sectionRect.top) / sectionRect.height) * 2 - 1

    mouseX.set(normalizedX)
    mouseY.set(normalizedY)

    setMousePosition({ x: clientX - sectionRect.left, y: clientY - sectionRect.top })
  }

  // Reset mouse position when mouse leaves
  const handleMouseLeave = () => {
    if (isReducedMotion) return

    // Animate back to center
    mouseX.set(0)
    mouseY.set(0)
  }

  // Handle keyboard navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggleExpanded(index)
    } else if (e.key === "Escape") {
      setExpandedInfo(null)
    }
  }

  // Toggle expanded info panel
  const toggleExpanded = (index: number) => {
    setActiveIndex(index)
    setExpandedInfo(expandedInfo === index ? null : index)
  }

  // Get content for expanded info panels
  const getExpandedContent = (index: number) => {
    if (index === 0) {
      return {
        title: "Learn on our platform",
        description: "Access curated courses, mentorship programs, and hands-on projects to develop in-demand skills.",
        features: [
          "Expert-led video courses",
          "Interactive coding challenges",
          "Real-world project experience",
          "Personalized learning paths",
        ],
        cta: "Browse Courses",
      }
    } else {
      return {
        title: "Earn as you progress",
        description: "Get rewarded for your achievements with tokens, credentials, and job opportunities.",
        features: ["Skill-based tokens", "Verified credentials", "Freelance opportunities", "Project bounties"],
        cta: "View Rewards",
      }
    }
  }

  return (
    <section
      ref={dividerRef}
      className={`relative w-full py-16 md:py-20 overflow-hidden ${className}`}
      aria-label={`${firstText} and ${secondText} section`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: isReducedMotion ? "none" : "1000px",
      }}
    >
      {/* Enhanced multi-layered gradient background with only lavender/purple tones and more shine */}
      <motion.div
        className="absolute inset-0"
        style={
          isReducedMotion
            ? {}
            : {
                x: backgroundX,
                y: backgroundY,
              }
        }
      >
        {/* Base gradient layer with lavender/purple tones - enhanced brightness */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/95 via-lavender-200/95 via-purple-200/95 to-lavender-100/95 dark:from-purple-900/60 dark:via-lavender-800/60 dark:via-purple-800/60 dark:to-lavender-900/60"></div>

        {/* Diagonal gradient overlay with lavender tones - increased opacity for more shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-lavender-300/30 via-transparent to-purple-300/30 dark:from-lavender-700/30 dark:to-purple-700/30"></div>

        {/* Radial gradient for center highlight - increased opacity for more shine */}
        <div className="absolute inset-0 bg-radial-gradient from-lavender-200/40 to-transparent dark:from-lavender-800/40 opacity-80"></div>

        {/* Top-to-bottom subtle gradient for vertical dimension - enhanced brightness */}
        <div className="absolute inset-0 bg-gradient-to-b from-lavender-200/20 via-transparent to-purple-200/20 dark:from-lavender-800/20 dark:to-purple-800/20"></div>

        {/* Additional shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
      </motion.div>

      {/* Improved subtle noise texture with reduced opacity for better performance */}
      <div className="absolute inset-0 opacity-[0.02] bg-noise"></div>

      {/* Enhanced grid pattern with better sizing and opacity - responsive to device capabilities */}
      <div
        className={`absolute inset-0 ${isMobile ? "bg-[size:16px_16px]" : "bg-[size:24px_24px]"} bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px)] opacity-40 dark:opacity-30`}
      ></div>

      {/* Diagonal lines for added texture - only on non-mobile for performance */}
      {!isMobile && (
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20"></div>
      )}

      {/* Enhanced top border with subtle glow - lavender only */}
      <div className="absolute top-0 left-0 right-0">
        <div className="h-px bg-gradient-to-r from-transparent via-lavender-300/70 to-transparent"></div>
        <div className="h-[1px] mt-[3px] bg-gradient-to-r from-transparent via-lavender-300/30 to-transparent blur-[1px]"></div>
      </div>

      {/* Enhanced bottom border with subtle glow - lavender only */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="h-px bg-gradient-to-r from-transparent via-purple-300/70 to-transparent"></div>
        <div className="h-[1px] mb-[3px] bg-gradient-to-r from-transparent via-purple-300/30 to-transparent blur-[1px]"></div>
      </div>

      {/* Interactive light spots that follow mouse movement - lavender only - increased brightness */}
      {!isReducedMotion && (
        <>
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full bg-lavender-200/30 dark:bg-lavender-800/30 blur-[80px] opacity-80"
            style={{
              left: lightSpot1X,
              top: lightSpot1Y,
              transition: "opacity 0.5s ease",
              opacity: isInView ? 0.8 : 0,
            }}
          />
          <motion.div
            className="absolute w-[250px] h-[250px] rounded-full bg-purple-200/30 dark:bg-purple-800/30 blur-[60px] opacity-70"
            style={{
              left: lightSpot2X,
              top: lightSpot2Y,
              transition: "opacity 0.5s ease",
              opacity: isInView ? 0.7 : 0,
            }}
          />
        </>
      )}

      {/* Additional shine spots for more brightness */}
      <div className="absolute top-1/3 right-1/4 w-[200px] h-[200px] rounded-full bg-white/10 blur-[100px] opacity-60"></div>
      <div className="absolute bottom-1/3 left-1/3 w-[150px] h-[150px] rounded-full bg-white/10 blur-[80px] opacity-50"></div>

      {/* Subtle particle effect - only on desktop for performance */}
      {!isMobile && !isReducedMotion && isInView && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/30"
              initial={{
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%",
                opacity: 0,
                scale: 0,
              }}
              animate={{
                y: [null, Math.random() * 100 + "%"],
                opacity: [0, 0.5, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 5 + 10,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 5,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10">
        {/* Improved layout with better spacing */}
        <div className="flex flex-col items-center justify-center">
          {/* Text container with improved accessibility */}
          <div className="relative flex flex-col items-center max-w-4xl mx-auto">
            {/* First word - with requested changes - removed quotation marks */}
            <motion.div
              className="relative mb-6 md:mb-8 group"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => toggleExpanded(0)}
              onMouseEnter={() => setActiveIndex(0)}
              onMouseLeave={() => expandedInfo !== 0 && setActiveIndex(null)}
              tabIndex={0}
              role="button"
              aria-expanded={expandedInfo === 0}
              aria-controls="learn-panel"
              onKeyDown={(e) => handleKeyDown(0, e)}
            >
              {/* Interactive background with improved feedback - lavender */}
              <motion.div
                className="absolute -inset-4 rounded-xl bg-lavender-400/10 opacity-0 group-focus-visible:opacity-100 group-hover:opacity-10"
                initial={false}
                animate={{ opacity: activeIndex === 0 ? 0.2 : 0 }}
                transition={{ duration: 0.2 }}
                whileHover={{ opacity: 0.1 }}
              />

              {/* Main text - now using sans-serif font for both words */}
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                {firstText}
              </h2>

              {/* Enhanced shadow for depth - lavender */}
              <span className="absolute inset-0 text-4xl md:text-5xl lg:text-7xl font-bold text-purple-900/10 tracking-wide blur-sm transform translate-y-[3px] -z-10">
                {firstText}
              </span>

              {/* Removed quotation marks as requested */}

              {/* Mobile indicator for expandable content */}
              {isMobile && (
                <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-white/70">
                  {expandedInfo === 0 ? "−" : "+"}
                </span>
              )}
            </motion.div>

            {/* Second word - with requested changes */}
            <motion.div
              className="relative mt-2 group"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => toggleExpanded(1)}
              onMouseEnter={() => setActiveIndex(1)}
              onMouseLeave={() => expandedInfo !== 1 && setActiveIndex(null)}
              tabIndex={0}
              role="button"
              aria-expanded={expandedInfo === 1}
              aria-controls="earn-panel"
              onKeyDown={(e) => handleKeyDown(1, e)}
            >
              {/* Interactive background with improved feedback - purple */}
              <motion.div
                className="absolute -inset-4 rounded-xl bg-purple-400/10 opacity-0 group-focus-visible:opacity-100 group-hover:opacity-10"
                initial={false}
                animate={{ opacity: activeIndex === 1 ? 0.2 : 0 }}
                transition={{ duration: 0.2 }}
                whileHover={{ opacity: 0.1 }}
              />

              {/* Main text - now using same font as first word */}
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                {secondText}
              </h2>

              {/* Enhanced shadow for depth - purple */}
              <span className="absolute inset-0 text-4xl md:text-5xl lg:text-7xl font-bold text-purple-900/10 tracking-wide blur-sm transform translate-y-[3px] -z-10">
                {secondText}
              </span>

              {/* Decorative brackets with improved visibility */}
              <span className="absolute -left-6 top-1/2 -translate-y-1/2 text-3xl text-purple-300/80 font-sans">[</span>
              <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-3xl text-purple-300/80 font-sans">
                ]
              </span>

              {/* Mobile indicator for expandable content */}
              {isMobile && (
                <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-white/70">
                  {expandedInfo === 1 ? "−" : "+"}
                </span>
              )}
            </motion.div>

            {/* Removed the vertical white line on the left side as requested */}
          </div>

          {/* Expanded information panels with enhanced styling and accessibility */}
          <div className="w-full max-w-3xl mt-8">
            <AnimatePresence>
              {expandedInfo === 0 && (
                <motion.div
                  id="learn-panel"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mt-4 shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]"
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  aria-live="polite"
                >
                  <h3 className="text-xl font-medium text-white mb-3">{getExpandedContent(0).title}</h3>
                  <p className="text-white/80 mb-4">{getExpandedContent(0).description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {getExpandedContent(0).features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-lavender-300 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-white/90 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <a
                      href="/courses"
                      className="px-4 py-2 bg-lavender-600 hover:bg-lavender-700 text-white rounded-md text-sm transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-lavender-500 focus:ring-offset-2 focus:ring-offset-lavender-900/40"
                    >
                      {getExpandedContent(0).cta}
                    </a>

                    <button
                      onClick={() => setExpandedInfo(null)}
                      className="text-white/70 hover:text-white text-sm flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-white/30 focus:rounded-sm p-1"
                      aria-label="Close panel"
                    >
                      <span>Close</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )}

              {expandedInfo === 1 && (
                <motion.div
                  id="earn-panel"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mt-4 shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]"
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  aria-live="polite"
                >
                  <h3 className="text-xl font-medium text-white mb-3">{getExpandedContent(1).title}</h3>
                  <p className="text-white/80 mb-4">{getExpandedContent(1).description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {getExpandedContent(1).features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-purple-300 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-white/90 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <a
                      href="/rewards"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-900/40"
                    >
                      {getExpandedContent(1).cta}
                    </a>

                    <button
                      onClick={() => setExpandedInfo(null)}
                      className="text-white/70 hover:text-white text-sm flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-white/30 focus:rounded-sm p-1"
                      aria-label="Close panel"
                    >
                      <span>Close</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
