"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CategoryScrollContainerProps {
  children: React.ReactNode
  className?: string
}

export function CategoryScrollContainer({ children, className = "" }: CategoryScrollContainerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  // Check if we need to show scroll arrows
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setShowLeftArrow(scrollLeft > 10)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }

  // Handle scroll events
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const handleScroll = () => checkScrollPosition()
    scrollContainer.addEventListener("scroll", handleScroll)

    // Initial check
    checkScrollPosition()

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => checkScrollPosition()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Scroll functions
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return
    const containerWidth = scrollContainerRef.current.clientWidth
    scrollContainerRef.current.scrollBy({
      left: -containerWidth * 0.7,
      behavior: "smooth",
    })
  }

  const scrollRight = () => {
    if (!scrollContainerRef.current) return
    const containerWidth = scrollContainerRef.current.clientWidth
    scrollContainerRef.current.scrollBy({
      left: containerWidth * 0.7,
      behavior: "smooth",
    })
  }

  return (
    <div className={`relative ${className}`}>
      {/* Left scroll button */}
      {showLeftArrow && (
        <button
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
          onClick={scrollLeft}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* Right scroll button */}
      {showRightArrow && (
        <button
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
          onClick={scrollRight}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto pb-8 pt-2 px-1 -mx-1 snap-x scroll-smooth hide-scrollbar"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {children}
      </div>

      {/* Gradient fade effect on edges */}
      <div className="absolute pointer-events-none left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-[1]"></div>
      <div className="absolute pointer-events-none right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-[1]"></div>
    </div>
  )
}
