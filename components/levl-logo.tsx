"use client"

import type { SVGProps } from "react"
import { useState, useEffect } from "react"

export function LevlLogo({ className, ...props }: SVGProps<SVGSVGElement> & { className?: string }) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div
      className={`${className} relative overflow-hidden rounded-md border border-gray-300`}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      {...props}
    >
      {/* Enhanced logo container with better styling */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-md"></div>

      {/* Logo image with enhanced presentation */}
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/D86926DF-2501-4C99-9452-927116E45324-oXEcNS38lLlIRweavHw5KIvvgR32ot.jpeg"
        alt="LevL Logo"
        className={`w-full h-full object-contain transition-all duration-500 ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        onLoad={() => setIsLoaded(true)}
        style={{
          filter: "drop-shadow(0 0 2px rgba(139, 92, 246, 0.3))",
        }}
      />

      {/* Subtle highlight effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10 pointer-events-none"></div>
    </div>
  )
}
