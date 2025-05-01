"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

// Add these keyframes after the imports
const floatAnimation = `
@keyframes float {
  0% { transform: translateY(0) translateX(0); }
  25% { transform: translateY(-10px) translateX(5px); }
  50% { transform: translateY(0) translateX(10px); }
  75% { transform: translateY(10px) translateX(5px); }
  100% { transform: translateY(0) translateX(0); }
}
.animate-float {
  animation: float linear infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 8s ease-in-out infinite;
}

/* Add 3D text effect styles */
.text-3d {
  position: relative;
  transform-style: preserve-3d;
}
.text-3d::before,
.text-3d::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  overflow: hidden;
  background-clip: text;
  -webkit-background-clip: text;
}
.text-3d::before {
  text-shadow: 0 0 10px rgba(255,255,255,0.4);
  z-index: -1;
  transform: translateZ(-1px);
}
.text-3d::after {
  color: rgba(128, 90, 213, 0.2);
  z-index: -2;
  transform: translateZ(-2px) translateY(2px);
}

/* Add refined shimmer effect */
@keyframes shimmer {
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
.text-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.7) 0%,
    rgba(255,255,255,1) 20%,
    rgba(255,255,255,1) 30%,
    rgba(255,255,255,0.7) 40%,
    rgba(255,255,255,0.7) 100%
  );
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  animation: shimmer 12s infinite linear;
}
`

interface AnimatedTextDividerProps {
  firstText: string
  secondText: string
  className?: string
}

export function AnimatedTextDivider({
  firstText = "INNOVATE",
  secondText = "ACCELERATE",
  className = "",
}: AnimatedTextDividerProps) {
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

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [isMobile])

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
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-background pointer-events-none"></div>
      <style dangerouslySetInnerHTML={{ __html: floatAnimation }} />

      {/* Enhanced background with more vibrant gradients */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient layer with new gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-background"></div>

        {/* Add diagonal gradient overlay for more dimension */}
        <div className="absolute inset-0 bg-gradient-to-br from-lavender-300/30 via-transparent to-purple-400/30 dark:from-lavender-600/30 dark:via-transparent dark:to-purple-800/30"></div>

        {/* Add radial gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_60%)]"></div>

        {/* Add subtle color shifts */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-pink-300/5 to-transparent dark:via-pink-600/5"></div>

        {/* Add subtle floating particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 animate-float"
              style={{
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 15 + 15}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Add subtle light beam effect */}
        <div className="absolute -inset-[100px] opacity-40 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.2),transparent_70%)] animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center">
          <div className="relative flex flex-col items-center max-w-4xl mx-auto">
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
              {/* Main text - more sleek version */}
              <h2
                className="text-4xl md:text-5xl lg:text-7xl font-bold text-lavender-300"
                style={{
                  textShadow: "0 4px 6px rgba(0,0,0,0.2), 0 8px 12px rgba(0,0,0,0.1), 0 -1px 1px rgba(255,255,255,0.3)",
                  transform: "perspective(800px) translateZ(10px)",
                  paddingBottom: "0.1em",
                  position: "relative",
                }}
              >
                {firstText}
              </h2>

              {/* Mobile indicator for expandable content */}
              {isMobile && (
                <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-white/70">
                  {expandedInfo === 0 ? "−" : "+"}
                </span>
              )}
            </div>

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
              {/* Main text - more sleek version */}
              <h2
                className="text-4xl md:text-5xl lg:text-7xl font-bold text-lavender-300"
                style={{
                  textShadow: "0 4px 6px rgba(0,0,0,0.2), 0 8px 12px rgba(0,0,0,0.1), 0 -1px 1px rgba(255,255,255,0.3)",
                  transform: "perspective(800px) translateZ(10px)",
                  paddingBottom: "0.1em",
                  position: "relative",
                }}
              >
                {secondText}
              </h2>

              {/* Decorative brackets - more sleek version */}
              <span className="absolute -left-6 top-1/2 -translate-y-1/2 text-3xl text-lavender-300/80 font-sans">
                [
              </span>
              <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-3xl text-lavender-300/80 font-sans">
                ]
              </span>

              {/* Mobile indicator for expandable content */}
              {isMobile && (
                <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-white/70">
                  {expandedInfo === 1 ? "−" : "+"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
