"use client"

import type React from "react"
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

  // Initialize animation on mount and check device capabilities
  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Simple intersection observer to trigger animations when in view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true)
        } else {
          setIsInView(false)
        }
      },
      { threshold: 0.2 },
    )

    if (dividerRef.current) {
      observer.observe(dividerRef.current)
    }

    return () => {
      if (dividerRef.current) {
        observer.unobserve(dividerRef.current)
      }
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

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
    >
      {/* Lavender and purple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 dark:from-purple-900 dark:via-purple-800 dark:to-purple-900"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Improved layout with better spacing */}
        <div className="flex flex-col items-center justify-center">
          {/* Text container with improved accessibility */}
          <div className="relative flex flex-col items-center max-w-4xl mx-auto">
            {/* First word - with requested changes - removed quotation marks */}
            <div className="relative mb-6 md:mb-8 group">
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-wide">{firstText}</h2>
            </div>

            {/* Second word - with requested changes */}
            <div className="relative mt-2 group">
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-wide">{secondText}</h2>
              <span className="absolute -left-6 top-1/2 -translate-y-1/2 text-3xl text-white/80 font-sans">[</span>
              <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-3xl text-white/80 font-sans">]</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
