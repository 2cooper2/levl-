"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
// Step 1: Comment out all Framer Motion imports to see if they're causing the issue
// import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"

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

  // Step 2: Comment out all state related to mouse movement and animations
  // const [sectionRect, setSectionRect] = useState({ width: 0, height: 0, left: 0, top: 0 })

  // Step 3: Comment out all motion values
  // const mouseX = useMotionValue(0)
  // const mouseY = useMotionValue(0)
  // const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 })
  // const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 })
  // const backgroundX = useTransform(smoothMouseX, [-1, 1], ["-2%", "2%"])
  // const backgroundY = useTransform(smoothMouseY, [-1, 1], ["-2%", "2%"])
  // const lightSpot1X = useTransform(smoothMouseX, [-1, 1], ["20%", "30%"])
  // const lightSpot1Y = useTransform(smoothMouseY, [-1, 1], ["20%", "30%"])
  // const lightSpot2X = useTransform(smoothMouseX, [-1, 1], ["70%", "80%"])
  // const lightSpot2Y = useTransform(smoothMouseY, [-1, 1], ["70%", "80%"])

  // Initialize animation on mount and check device capabilities
  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Step 4: Comment out the intersection observer
    // const observer = new IntersectionObserver(
    //   (entries) => {
    //     if (entries[0].isIntersecting) {
    //       setIsInView(true)
    //
    //       // Update section dimensions for mouse tracking
    //       if (dividerRef.current) {
    //         const rect = dividerRef.current.getBoundingClientRect()
    //         setSectionRect({
    //           width: rect.width,
    //           height: rect.height,
    //           left: rect.left,
    //           top: rect.top,
    //         })
    //       }
    //     } else {
    //       setIsInView(false)
    //     }
    //   },
    //   { threshold: 0.2 }
    // )
    //
    // if (dividerRef.current) {
    //   observer.observe(dividerRef.current)
    // }

    return () => {
      // Step 5: Comment out the cleanup for the observer
      // if (dividerRef.current) {
      //   observer.unobserve(dividerRef.current)
      // }
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Step 6: Comment out mouse movement handlers
  // const handleMouseMove = (e: React.MouseEvent) => {
  //   if (!isInView) return
  //
  //   // Calculate normalized mouse position (-1 to 1)
  //   const { clientX, clientY } = e
  //   const normalizedX = ((clientX - sectionRect.left) / sectionRect.width) * 2 - 1
  //   const normalizedY = ((clientY - sectionRect.top) / sectionRect.height) * 2 - 1
  //
  //   mouseX.set(normalizedX)
  //   mouseY.set(normalizedY)
  // }
  //
  // // Reset mouse position when mouse leaves
  // const handleMouseLeave = () => {
  //   // Animate back to center
  //   mouseX.set(0)
  //   mouseY.set(0)
  // }

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
      // Step 7: Comment out mouse event handlers
      // onMouseMove={handleMouseMove}
      // onMouseLeave={handleMouseLeave}
    >
      {/* Step 8: Comment out complex background with motion */}
      {/* <motion.div
        className="absolute inset-0"
        style={{
          x: backgroundX,
          y: backgroundY,
        }}
      > */}

      {/* Simplified background */}
      <div className="absolute inset-0">
        {/* Base gradient layer with lavender/purple tones */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 dark:from-purple-900 dark:via-purple-800 dark:to-purple-900"></div>

        {/* Step 9: Comment out complex gradients */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-lavender-300/30 via-transparent to-purple-300/30 dark:from-lavender-700/30 dark:to-purple-700/30"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-lavender-200/20 via-transparent to-purple-200/20 dark:from-lavender-800/20 dark:to-purple-800/20"></div> */}
      </div>
      {/* </motion.div> */}

      {/* Step 10: Comment out complex grid pattern */}
      {/* <div
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px)] opacity-40 dark:opacity-30"
        style={{
          backgroundSize: isMobile ? "16px 16px" : "24px 24px",
        }}
      ></div> */}

      {/* Step 11: Comment out glow effects */}
      {/* <div className="absolute top-0 left-0 right-0">
        <div className="h-px bg-gradient-to-r from-transparent via-lavender-300/70 to-transparent"></div>
        <div className="h-[1px] mt-[3px] bg-gradient-to-r from-transparent via-lavender-300/30 to-transparent blur-[1px]"></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <div className="h-px bg-gradient-to-r from-transparent via-purple-300/70 to-transparent"></div>
        <div className="h-[1px] mb-[3px] bg-gradient-to-r from-transparent via-purple-300/30 to-transparent blur-[1px]"></div>
      </div> */}

      {/* Step 12: Comment out light spots */}
      {/* <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-lavender-200/30 dark:bg-lavender-800/30 blur-[80px] opacity-80"
        style={{
          left: lightSpot1X,
          top: lightSpot1Y,
          opacity: isInView ? 0.8 : 0,
        }}
      />
      <motion.div
        className="absolute w-[250px] h-[250px] rounded-full bg-purple-200/30 dark:bg-purple-800/30 blur-[60px] opacity-70"
        style={{
          left: lightSpot2X,
          top: lightSpot2Y,
          opacity: isInView ? 0.7 : 0,
        }}
      />
      <div className="absolute top-1/3 right-1/4 w-[200px] h-[200px] rounded-full bg-white/10 blur-[100px] opacity-60"></div>
      <div className="absolute bottom-1/3 left-1/3 w-[150px] h-[150px] rounded-full bg-white/10 blur-[80px] opacity-50"></div> */}

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center">
          <div className="relative flex flex-col items-center max-w-4xl mx-auto">
            {/* Step 13: Replace motion.div with regular div */}
            {/* <motion.div
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
            > */}
            <div
              className="relative mb-6 md:mb-8 group"
              onClick={() => toggleExpanded(0)}
              onMouseEnter={() => setActiveIndex(0)}
              onMouseLeave={() => expandedInfo !== 0 && setActiveIndex(null)}
              tabIndex={0}
              role="button"
              aria-expanded={expandedInfo === 0}
              aria-controls="learn-panel"
              onKeyDown={(e) => handleKeyDown(0, e)}
            >
              {/* Step 14: Comment out interactive background */}
              {/* <motion.div
                className="absolute -inset-4 rounded-xl bg-lavender-400/10 opacity-0 group-focus-visible:opacity-100 group-hover:opacity-10"
                initial={false}
                animate={{ opacity: activeIndex === 0 ? 0.2 : 0 }}
                transition={{ duration: 0.2 }}
                whileHover={{ opacity: 0.1 }}
              /> */}

              {/* Main text */}
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-wide">{firstText}</h2>

              {/* Step 15: Comment out shadow effect */}
              {/* <span className="absolute inset-0 text-4xl md:text-5xl lg:text-7xl font-bold text-purple-900/10 tracking-wide blur-sm transform translate-y-[3px] -z-10">
                {firstText}
              </span> */}

              {/* Mobile indicator for expandable content */}
              {isMobile && (
                <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-white/70">
                  {expandedInfo === 0 ? "−" : "+"}
                </span>
              )}
            </div>
            {/* </motion.div> */}

            {/* Step 16: Replace second motion.div with regular div */}
            {/* <motion.div
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
            > */}
            <div
              className="relative mt-2 group"
              onClick={() => toggleExpanded(1)}
              onMouseEnter={() => setActiveIndex(1)}
              onMouseLeave={() => expandedInfo !== 1 && setActiveIndex(null)}
              tabIndex={0}
              role="button"
              aria-expanded={expandedInfo === 1}
              aria-controls="earn-panel"
              onKeyDown={(e) => handleKeyDown(1, e)}
            >
              {/* Step 17: Comment out interactive background */}
              {/* <motion.div
                className="absolute -inset-4 rounded-xl bg-purple-400/10 opacity-0 group-focus-visible:opacity-100 group-hover:opacity-10"
                initial={false}
                animate={{ opacity: activeIndex === 1 ? 0.2 : 0 }}
                transition={{ duration: 0.2 }}
                whileHover={{ opacity: 0.1 }}
              /> */}

              {/* Main text */}
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-wide">{secondText}</h2>

              {/* Step 18: Comment out shadow effect */}
              {/* <span className="absolute inset-0 text-4xl md:text-5xl lg:text-7xl font-bold text-purple-900/10 tracking-wide blur-sm transform translate-y-[3px] -z-10">
                {secondText}
              </span> */}

              {/* Decorative brackets */}
              <span className="absolute -left-6 top-1/2 -translate-y-1/2 text-3xl text-white/80 font-sans">[</span>
              <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-3xl text-white/80 font-sans">]</span>

              {/* Mobile indicator for expandable content */}
              {isMobile && (
                <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-white/70">
                  {expandedInfo === 1 ? "−" : "+"}
                </span>
              )}
            </div>
            {/* </motion.div> */}
          </div>

          {/* Step 19: Comment out expandable panels */}
          {/* <div className="w-full max-w-3xl mt-8">
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
          </div> */}
        </div>
      </div>
    </section>
  )
}
