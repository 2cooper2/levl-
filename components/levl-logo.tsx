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
      className={`${className} relative overflow-hidden rounded-md`}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...(props.style || {}),
      }}
      {...props}
    >
      {/* Enhanced logo container with better styling */}
      <div className="absolute inset-0 bg-gradient-to-br from-lavender-200/40 via-lavender-300/25 to-lavender-400/20 rounded-md"></div>

      {/* Logo image — grayscale strips all original color variation (removes pink/gradient) */}
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/D86926DF-2501-4C99-9452-927116E45324-oXEcNS38lLlIRweavHw5KIvvgR32ot.jpeg"
        alt="LevL Logo"
        className={`w-full h-full object-contain transition-all duration-500 ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        onLoad={() => setIsLoaded(true)}
        style={{}}
      />

      {/* Lavender color overlay — color blend mode uses overlay H+S, base L.
          White bg (L=100%) stays white. Icon (dark L) becomes lavender. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "#c084fc", mixBlendMode: "color" }}
      />

      {/* Main wax highlight — hard white oval, upper-left, rotated like car shine */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "6%", left: "6%",
          width: "60%", height: "26%",
          background: "rgba(255,255,255,0.88)",
          borderRadius: "50%",
          filter: "blur(2px)",
          transform: "rotate(-12deg)",
        }}
      />

      {/* Secondary glint — small tight bright dot, offset upper-right */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "8%", left: "58%",
          width: "22%", height: "10%",
          background: "rgba(255,255,255,0.80)",
          borderRadius: "50%",
          filter: "blur(1px)",
          transform: "rotate(-8deg)",
        }}
      />

      {/* Thin rim streak along top edge */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: 0, left: "8%",
          width: "84%", height: "3px",
          background: "rgba(255,255,255,0.95)",
          borderRadius: "2px",
          filter: "blur(0.5px)",
        }}
      />
    </div>
  )
}
