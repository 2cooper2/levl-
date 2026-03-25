"use client"

import { useState, useEffect } from "react"

// Debounce function to improve performance
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function useMobile(breakpoint = 768): boolean {
  // Default to desktop to avoid hydration mismatch
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Set initial value once mounted
    setIsMobile(window.innerWidth < breakpoint)

    // Add debounced resize listener
    const handleResize = debounce(() => {
      setIsMobile(window.innerWidth < breakpoint)
    }, 100)

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [breakpoint])

  return isMobile
}

export default useMobile
