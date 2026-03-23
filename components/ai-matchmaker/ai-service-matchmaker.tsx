"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { EnhancedCategoryCard } from "@/components/enhanced-category-card"
import {
  Briefcase,
  Tv,
  Droplet,
  SprayCan as Spray,
  Home,
  Zap,
  Scissors,
  Leaf,
  Construction,
  HardHat,
} from "lucide-react"
import { LevlLogo } from "@/components/levl-logo"

import { motion, AnimatePresence } from "framer-motion"

import { ProviderCard } from "@/components/ai-matchmaker/provider-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Layout } from "lucide-react"
import { LevlPortal } from "@/components/levl-portal"
import Image from "next/image"

// Visual guides for technical options - shows animated previews inline
const optionVisualGuides: Record<string, { 
  type: "animation" | "image"
  description: string
  animationFrames?: string[] // CSS animation keyframes description
  bgColor?: string
  icon?: React.ReactNode
}> = {
  // Item types to mount
  "TV/Monitor": {
    type: "animation",
    description: "Television or computer monitor mounting",
    bgColor: "bg-gradient-to-br from-slate-100 to-slate-200",
  },
  "Art/Picture Frame": {
    type: "animation",
    description: "Artwork, photos, or picture frames",
    bgColor: "bg-gradient-to-br from-amber-100 to-amber-200",
  },
  "Floating Shelves": {
    type: "animation",
    description: "Wall-mounted floating shelves",
    bgColor: "bg-gradient-to-br from-emerald-100 to-emerald-200",
  },
  "Mirror": {
    type: "animation",
    description: "Wall-mounted mirrors",
    bgColor: "bg-gradient-to-br from-cyan-100 to-cyan-200",
  },
  // Mount types
  "Fixed (flat against wall)": {
    type: "animation",
    description: "TV sits flat against wall, no movement",
    bgColor: "bg-gradient-to-br from-slate-100 to-slate-200",
  },
  "Tilting (angle adjustment)": {
    type: "animation", 
    description: "TV can tilt up/down to reduce glare",
    bgColor: "bg-gradient-to-br from-blue-100 to-blue-200",
  },
  "Full-motion/Articulating (swivel and tilt)": {
    type: "animation",
    description: "TV extends out and swivels in any direction",
    bgColor: "bg-gradient-to-br from-purple-100 to-purple-200",
  },
  "Ceiling mount": {
    type: "animation",
    description: "TV hangs down from ceiling",
    bgColor: "bg-gradient-to-br from-amber-100 to-amber-200",
  },
  // Wall types
  "Drywall/Sheetrock": {
    type: "animation",
    description: "Standard interior wall, needs studs or anchors",
    bgColor: "bg-gradient-to-br from-gray-100 to-gray-200",
  },
  "Brick": {
    type: "animation",
    description: "Solid brick requires masonry drill bits",
    bgColor: "bg-gradient-to-br from-red-100 to-red-200",
  },
  "Concrete": {
    type: "animation",
    description: "Very solid, needs hammer drill and concrete anchors",
    bgColor: "bg-gradient-to-br from-stone-100 to-stone-200",
  },
  "Plaster": {
    type: "animation",
    description: "Older homes, may need special anchoring",
    bgColor: "bg-gradient-to-br from-amber-100 to-orange-200",
  },
  "Stone": {
    type: "animation",
    description: "Natural stone, requires careful drilling",
    bgColor: "bg-gradient-to-br from-zinc-200 to-zinc-300",
  },
  "Metal studs": {
    type: "animation",
    description: "Thinner than wood, needs toggle bolts",
    bgColor: "bg-gradient-to-br from-slate-200 to-slate-300",
  },
  // Cable management
  "Yes, hide all cables in wall": {
    type: "animation",
    description: "Cables routed through wall, completely hidden",
    bgColor: "bg-gradient-to-br from-green-100 to-green-200",
  },
  "Yes, use cable covers": {
    type: "animation",
    description: "Cables covered with paintable plastic channels",
    bgColor: "bg-gradient-to-br from-teal-100 to-teal-200",
  },
  "No, cables visible is fine": {
    type: "animation",
    description: "Cables hang freely from TV to outlet",
    bgColor: "bg-gradient-to-br from-gray-100 to-gray-150",
  },
  // Plumbing issues
  "Clogged drain": {
    type: "animation",
    description: "Water draining slowly or not at all",
    bgColor: "bg-gradient-to-br from-blue-100 to-cyan-200",
  },
  "Leaky pipe/faucet": {
    type: "animation",
    description: "Water dripping from pipes or faucet",
    bgColor: "bg-gradient-to-br from-sky-100 to-sky-200",
  },
  "Water heater issue": {
    type: "animation",
    description: "No hot water or temperature problems",
    bgColor: "bg-gradient-to-br from-orange-100 to-red-200",
  },
  "Toilet problem": {
    type: "animation",
    description: "Running, clogged, or not flushing properly",
    bgColor: "bg-gradient-to-br from-indigo-100 to-indigo-200",
  },
  // Paint finishes
  "Textured finish": {
    type: "animation",
    description: "Adds depth and pattern to walls",
    bgColor: "bg-gradient-to-br from-amber-100 to-yellow-200",
  },
  "Faux finish": {
    type: "animation",
    description: "Mimics marble, wood, or other materials",
    bgColor: "bg-gradient-to-br from-rose-100 to-pink-200",
  },
  "High-gloss/specialty coating": {
    type: "animation",
    description: "Shiny, reflective surface finish",
    bgColor: "bg-gradient-to-br from-violet-100 to-purple-200",
  },
}

// Animated visual preview component
const OptionVisualPreview = memo(function OptionVisualPreview({ option, isActive = true }: { option: string; isActive?: boolean }) {
  const guide = optionVisualGuides[option]
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!isActive) {
      setIsVisible(false)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [isActive])
  
  if (!guide) return null

  // Different animations based on option type
  const getAnimation = () => {
    // Item type animations - what to mount
    if (option === "TV/Monitor") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Living room wall */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, #f5f2ed 0%, #e8e4dd 40%, #ddd9d2 100%)'
          }}>
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, rgba(0,0,0,0.02) 1px, transparent 1px)`,
              backgroundSize: '12px 12px'
            }} />
          </div>
          
          {/* Modern flatscreen TV */}
          <motion.div 
            className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[78%] h-[52%]"
            style={{
              background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
              borderRadius: '4px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.35)'
            }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Screen with content */}
            <div className="absolute inset-[3%] rounded-[2px] overflow-hidden" style={{
              background: 'linear-gradient(135deg, #1a2a4a 0%, #0f1829 100%)'
            }}>
              {/* Animated screen content - movie scene */}
              <motion.div 
                className="absolute inset-0"
                animate={{ 
                  background: [
                    'linear-gradient(135deg, #1a2a4a 0%, #2a1a3a 100%)',
                    'linear-gradient(135deg, #2a3a2a 0%, #1a2a4a 100%)',
                    'linear-gradient(135deg, #3a2a1a 0%, #1a3a4a 100%)',
                    'linear-gradient(135deg, #1a2a4a 0%, #2a1a3a 100%)'
                  ]
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="w-[18%] h-[28%] rounded-full bg-white/20 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-0 h-0 ml-[15%] border-l-[8px] border-l-white/80 border-y-[5px] border-y-transparent" />
                </motion.div>
              </div>
            </div>
            {/* Stand */}
            <div className="absolute -bottom-[18%] left-1/2 -translate-x-1/2 w-[35%] h-[12%] rounded-b-lg" style={{
              background: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)'
            }} />
          </motion.div>
          
          {/* Floor */}
          <div className="absolute bottom-0 left-0 right-0 h-[12%]" style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(139,119,101,0.15) 100%)'
          }} />
        </div>
      )
    }
    
    if (option === "Art/Picture Frame") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Gallery wall */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, #faf8f5 0%, #f0ede8 100%)'
          }}>
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 30% 40%, rgba(0,0,0,0.015) 1px, transparent 1px)`,
              backgroundSize: '10px 10px'
            }} />
          </div>
          
          {/* Picture frame with art */}
          <motion.div 
            className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[65%] h-[70%]"
            style={{
              background: 'linear-gradient(135deg, #8b6914 0%, #6b4f0f 30%, #4a3608 100%)',
              borderRadius: '2px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.2)'
            }}
            animate={{ rotateZ: [-0.5, 0.5, -0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Inner frame border */}
            <div className="absolute inset-[6%] rounded-[1px]" style={{
              background: 'linear-gradient(135deg, #a67c1a 0%, #7d5c10 100%)',
              boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              {/* Canvas/artwork */}
              <div className="absolute inset-[4%] overflow-hidden" style={{
                background: 'linear-gradient(180deg, #f5e6c8 0%, #e8d4a8 100%)'
              }}>
                {/* Abstract art - color blocks */}
                <motion.div 
                  className="absolute top-[10%] left-[10%] w-[40%] h-[35%] rounded-sm"
                  style={{ background: '#c44536' }}
                  animate={{ opacity: [0.9, 1, 0.9] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div 
                  className="absolute bottom-[15%] right-[10%] w-[50%] h-[40%] rounded-sm"
                  style={{ background: '#1e6091' }}
                  animate={{ opacity: [1, 0.85, 1] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div 
                  className="absolute top-[30%] right-[25%] w-[25%] h-[25%] rounded-full"
                  style={{ background: '#e9c46a' }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                />
              </div>
            </div>
          </motion.div>
          
          {/* Gallery lighting effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-[20%]" style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(255,250,240,0.4) 0%, transparent 70%)'
          }} />
        </div>
      )
    }
    
    if (option === "Floating Shelves") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Wall */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, #f0ece5 0%, #e5e1da 100%)'
          }}>
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 40% 30%, rgba(0,0,0,0.018) 1px, transparent 1px)`,
              backgroundSize: '11px 11px'
            }} />
          </div>
          
          {/* Floating shelf 1 - top */}
          <motion.div 
            className="absolute left-[12%] top-[18%] w-[76%] h-[10%]"
            style={{
              background: 'linear-gradient(180deg, #8b7355 0%, #6d5a45 100%)',
              borderRadius: '2px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
            }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Items on shelf */}
            <div className="absolute -top-[80%] left-[8%] w-[15%] h-[80%] rounded-sm" style={{
              background: 'linear-gradient(180deg, #2d5a3d 0%, #1e4030 100%)'
            }} />
            <motion.div 
              className="absolute -top-[100%] left-[35%] w-[12%] h-[100%] rounded-t-full"
              style={{ background: 'linear-gradient(180deg, #c4a35a 0%, #a08040 100%)' }}
              animate={{ rotateZ: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="absolute -top-[60%] right-[10%] w-[20%] h-[60%] rounded-sm" style={{
              background: 'linear-gradient(180deg, #8b4513 0%, #5d2e0a 100%)'
            }} />
          </motion.div>
          
          {/* Floating shelf 2 - middle */}
          <motion.div 
            className="absolute left-[12%] top-[48%] w-[76%] h-[10%]"
            style={{
              background: 'linear-gradient(180deg, #8b7355 0%, #6d5a45 100%)',
              borderRadius: '2px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
            }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          >
            {/* Books */}
            <div className="absolute -top-[120%] left-[5%] flex gap-[2px]">
              <div className="w-[8px] h-[28px] rounded-t-sm" style={{ background: '#c44536' }} />
              <div className="w-[6px] h-[24px] rounded-t-sm mt-[4px]" style={{ background: '#1e6091' }} />
              <div className="w-[7px] h-[26px] rounded-t-sm mt-[2px]" style={{ background: '#2a9d8f' }} />
            </div>
            <motion.div 
              className="absolute -top-[90%] right-[15%] w-[18%] h-[90%] rounded-full"
              style={{ background: 'linear-gradient(180deg, #ddd 0%, #bbb 100%)' }}
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </motion.div>
          
          {/* Floating shelf 3 - bottom */}
          <motion.div 
            className="absolute left-[12%] top-[78%] w-[76%] h-[10%]"
            style={{
              background: 'linear-gradient(180deg, #8b7355 0%, #6d5a45 100%)',
              borderRadius: '2px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
            }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          >
            <motion.div 
              className="absolute -top-[70%] left-[40%] w-[20%] h-[70%] rounded-sm"
              style={{ background: 'linear-gradient(135deg, #4a7c59 0%, #2d5a3d 100%)' }}
              animate={{ rotateZ: [-1, 1, -1] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            />
          </motion.div>
        </div>
      )
    }
    
    if (option === "Mirror") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Bathroom/bedroom wall */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, #e8e5e0 0%, #ddd9d4 100%)'
          }}>
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 35%, rgba(0,0,0,0.02) 1px, transparent 1px)`,
              backgroundSize: '9px 9px'
            }} />
          </div>
          
          {/* Mirror with frame */}
          <motion.div 
            className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[55%] h-[75%]"
            style={{
              background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
              borderRadius: '3px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
            }}
          >
            {/* Mirror glass surface */}
            <div className="absolute inset-[4%] rounded-[2px] overflow-hidden" style={{
              background: 'linear-gradient(135deg, #d8e8f0 0%, #b8d0e0 30%, #a0c0d4 60%, #c8dce8 100%)'
            }}>
              {/* Reflection shimmer */}
              <motion.div 
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)'
                }}
                animate={{ 
                  x: ['-100%', '200%'],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              />
              
              {/* Reflected room elements - blurred */}
              <div className="absolute top-[20%] left-[20%] w-[25%] h-[15%] rounded-sm bg-[#a8b8c0]/30" />
              <div className="absolute bottom-[30%] right-[15%] w-[20%] h-[25%] rounded-sm bg-[#98a8b0]/25" />
              
              {/* Light source reflection */}
              <motion.div 
                className="absolute top-[10%] right-[20%] w-[15%] h-[10%] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)'
                }}
                animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.1, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
          
          {/* Vanity/counter hint at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[15%]" style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(100,90,80,0.12) 100%)'
          }} />
        </div>
      )
    }
    
    // Mount type animations
    if (option === "Fixed (flat against wall)") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Living room wall with realistic paint texture */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, #f5f2ed 0%, #e8e4dd 40%, #ddd9d2 100%)'
          }}>
            {/* Wall texture - subtle stippling */}
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 30%, rgba(0,0,0,0.02) 1px, transparent 1px),
                               radial-gradient(circle at 60% 70%, rgba(0,0,0,0.015) 1px, transparent 1px),
                               radial-gradient(circle at 80% 20%, rgba(0,0,0,0.02) 1px, transparent 1px)`,
              backgroundSize: '12px 12px, 8px 8px, 15px 15px'
            }} />
            {/* Ambient shadow from ceiling */}
            <div className="absolute top-0 left-0 right-0 h-[15%] bg-gradient-to-b from-black/5 to-transparent" />
          </div>
          
          {/* TV mounted flat - ultra thin bezel modern TV */}
          <motion.div 
            className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[82%] h-[58%]"
            style={{
              background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
              borderRadius: '3px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.25)'
            }}
            animate={{ 
              boxShadow: ['0 4px 20px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.25)', '0 4px 22px rgba(0,0,0,0.4), 0 2px 10px rgba(0,0,0,0.3)', '0 4px 20px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.25)']
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Ultra-thin bezel frame */}
            <div className="absolute inset-[2px] rounded-[2px]" style={{
              background: 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)'
            }}>
              {/* Screen with content */}
              <div className="absolute inset-[3px] rounded-[1px] overflow-hidden" style={{
                background: 'linear-gradient(135deg, #1a2a4a 0%, #0f1829 50%, #0a1220 100%)'
              }}>
                {/* Landscape image hint on screen */}
                <div className="absolute bottom-[20%] left-[10%] right-[10%] h-[40%] rounded-sm" style={{
                  background: 'linear-gradient(180deg, rgba(100,150,200,0.15) 0%, rgba(80,120,160,0.1) 100%)'
                }} />
                {/* UI elements hint */}
                <div className="absolute top-[15%] left-[10%] w-[30%] h-[8%] rounded-sm bg-white/10" />
                <div className="absolute top-[15%] right-[10%] w-[15%] h-[8%] rounded-sm bg-white/8" />
                
                {/* Screen glow/reflection */}
                <motion.div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.02) 50%, transparent 70%)'
                  }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 5, repeat: Infinity }}
                />
              </div>
            </div>
            
            {/* Center logo/sensor area */}
            <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-[12%] h-[5%] flex items-center justify-center">
              <motion.div 
                className="w-[30%] h-[50%] rounded-full"
                style={{ background: 'radial-gradient(circle, #00dd00 0%, #00aa00 100%)', boxShadow: '0 0 4px #00cc00' }}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
          
          {/* Shadow on wall behind TV showing it's flush */}
          <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[85%] h-[62%] -z-10 rounded-[4px]" style={{
            boxShadow: '0 8px 30px rgba(0,0,0,0.15), 0 4px 15px rgba(0,0,0,0.1)'
          }} />
          
          {/* Floor hint */}
          <div className="absolute bottom-0 left-0 right-0 h-[12%]" style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(139,119,101,0.15) 100%)'
          }} />
        </div>
      )
    }
    if (option === "Tilting (angle adjustment)") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Side profile view - room cross section */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(90deg, #e8e5e0 0%, #f0ede8 50%, #f5f2ed 100%)'
          }} />
          
          {/* Wall on left side */}
          <div className="absolute left-0 top-0 bottom-0 w-[15%]" style={{
            background: 'linear-gradient(90deg, #d5d2cd 0%, #e0ddd8 100%)',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
          }} />
          
          {/* TV with tilting bracket - close to wall, side profile view */}
          <motion.div 
            className="absolute left-[12%] top-[25%] origin-left"
            animate={{ rotateZ: [0, -15, 0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Low-profile tilt bracket - flush against wall */}
            <div className="absolute left-0 top-[15px] w-[8px] h-[35px]" style={{
              background: 'linear-gradient(90deg, #4a4a4a 0%, #5a5a5a 50%, #4a4a4a 100%)',
              borderRadius: '2px',
              boxShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              {/* Tilt hinge points */}
              <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full" style={{
                background: 'radial-gradient(circle at 40% 40%, #888 0%, #555 100%)'
              }} />
              <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full" style={{
                background: 'radial-gradient(circle at 40% 40%, #888 0%, #555 100%)'
              }} />
            </div>
            
            {/* TV - side profile showing thin edge */}
            <div className="absolute left-[6px] top-0 w-[6px] h-[65px]" style={{
              background: 'linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 40%, #1a1a1a 100%)',
              borderRadius: '2px',
              boxShadow: '4px 4px 12px rgba(0,0,0,0.35)'
            }} />
            
            {/* TV front face - angled perspective */}
            <div 
              className="absolute left-[10px] top-[2px] w-[70px] h-[62px] rounded-[3px]"
              style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #151515 50%, #0a0a0a 100%)',
                transform: 'perspective(120px) rotateY(-65deg)',
                boxShadow: '-3px 4px 15px rgba(0,0,0,0.35)'
              }}
            >
              {/* Screen bezel */}
              <div className="absolute inset-[4%] rounded-[2px]" style={{
                background: 'linear-gradient(180deg, #121212 0%, #0a0a0a 100%)'
              }}>
                {/* Screen with content */}
                <div className="absolute inset-[3%] rounded-[1px] overflow-hidden" style={{
                  background: 'linear-gradient(135deg, #1a2a4a 0%, #0f1829 100%)'
                }}>
                  {/* Movie content */}
                  <div className="absolute inset-[10%] rounded-sm" style={{
                    background: 'linear-gradient(180deg, rgba(255,200,150,0.1) 0%, rgba(100,150,200,0.12) 100%)'
                  }} />
                  {/* Cinematic bars */}
                  <div className="absolute top-0 left-0 right-0 h-[10%] bg-black/50" />
                  <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-black/50" />
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Tilt direction indicator */}
          <div className="absolute right-[15%] top-[40%]">
            <motion.svg 
              width="20" height="30" viewBox="0 0 20 30"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <path d="M10 5 L15 10 L12 10 L12 20 L15 20 L10 25 L5 20 L8 20 L8 10 L5 10 Z" fill="#666" opacity="0.5" />
            </motion.svg>
          </div>
          
          {/* Floor */}
          <div className="absolute bottom-0 left-0 right-0 h-[12%]" style={{
            background: 'linear-gradient(180deg, #c4a882 0%, #a08060 100%)'
          }} />
        </div>
      )
    }
    if (option === "Full-motion/Articulating (swivel and tilt)") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Side profile view - room cross section */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(90deg, #e5e2dd 0%, #edebe6 50%, #f2f0eb 100%)'
          }} />
          
          {/* Wall on left side - side view */}
          <div className="absolute left-0 top-0 bottom-0 w-[15%]" style={{
            background: 'linear-gradient(90deg, #ccc9c4 0%, #dbd8d3 100%)',
            boxShadow: '3px 0 10px rgba(0,0,0,0.12)'
          }}>
            {/* Wall texture */}
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 50% 25%, rgba(0,0,0,0.025) 1px, transparent 1px)`,
              backgroundSize: '6px 6px'
            }} />
          </div>
          
          {/* Wall plate - side profile */}
          <div className="absolute left-[12%] top-[28%] w-[6%] h-[28%]" style={{
            background: 'linear-gradient(90deg, #3a3a3a 0%, #4a4a4a 50%, #3a3a3a 100%)',
            borderRadius: '2px',
            boxShadow: '2px 2px 6px rgba(0,0,0,0.35)'
          }} />
          
          {/* Full articulating arm system - all connected */}
          <motion.div 
            className="absolute left-[16%] top-[36%] origin-left"
            animate={{ rotateZ: [0, 15, 15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* First arm segment - from wall */}
            <div className="relative w-[28px] h-[10px] rounded-[2px]" style={{
              background: 'linear-gradient(180deg, #606060 0%, #454545 50%, #353535 100%)',
              boxShadow: '0 3px 6px rgba(0,0,0,0.3)'
            }}>
              {/* Wall pivot joint */}
              <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-[12px] h-[14px] rounded-full" style={{
                background: 'radial-gradient(circle at 35% 35%, #888 0%, #555 50%, #333 100%)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.35)'
              }}>
                <div className="absolute inset-[28%] rounded-full" style={{
                  background: 'radial-gradient(circle, #444 0%, #222 100%)'
                }} />
              </div>
              
              {/* Mid joint - elbow */}
              <div className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-[14px] h-[16px] rounded-full" style={{
                background: 'radial-gradient(circle at 40% 35%, #999 0%, #666 40%, #444 100%)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.15)'
              }}>
                <div className="absolute inset-[25%] rounded-full" style={{
                  background: 'radial-gradient(circle, #555 0%, #333 100%)'
                }} />
              </div>
            </div>
            
            {/* Second arm segment - connected to elbow */}
            <motion.div 
              className="absolute left-[24px] top-[1px] origin-left"
              animate={{ rotateZ: [0, -25, -25, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-[24px] h-[9px] rounded-[2px]" style={{
                background: 'linear-gradient(180deg, #555555 0%, #404040 50%, #303030 100%)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.25)'
              }}>
                {/* TV connection joint */}
                <div className="absolute -right-[4px] top-1/2 -translate-y-1/2 w-[10px] h-[12px] rounded-full" style={{
                  background: 'radial-gradient(circle at 40% 35%, #777 0%, #444 100%)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }} />
              </div>
              
              {/* TV bracket plate - vertical */}
              <div className="absolute left-[26px] top-[-12px] w-[6px] h-[32px] rounded-[2px]" style={{
                background: 'linear-gradient(90deg, #4a4a4a 0%, #5a5a5a 50%, #4a4a4a 100%)',
                boxShadow: '1px 2px 4px rgba(0,0,0,0.25)'
              }} />
              
              {/* TV - side profile (thin edge) */}
              <div className="absolute left-[30px] top-[-18px] w-[5px] h-[45px] rounded-[1px]" style={{
                background: 'linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 40%, #1a1a1a 100%)',
                boxShadow: '4px 5px 15px rgba(0,0,0,0.4)'
              }} />
              
              {/* TV front face - proper rectangular TV shape */}
              <div 
                className="absolute left-[33px] top-[-16px] w-[55px] h-[42px] rounded-[3px]"
                style={{
                  background: 'linear-gradient(135deg, #0a0a0a 0%, #151515 50%, #0a0a0a 100%)',
                  transform: 'perspective(100px) rotateY(-60deg)',
                  boxShadow: '-3px 4px 12px rgba(0,0,0,0.35)'
                }}
              >
                {/* Screen bezel */}
                <div className="absolute inset-[4%] rounded-[2px]" style={{
                  background: 'linear-gradient(180deg, #121212 0%, #0a0a0a 100%)'
                }}>
                  {/* Screen with sports content */}
                  <div className="absolute inset-[3%] rounded-[1px] overflow-hidden" style={{
                    background: 'linear-gradient(135deg, #1a3525 0%, #102818 100%)'
                  }}>
                    {/* Sports field */}
                    <div className="absolute inset-[8%]" style={{
                      background: 'radial-gradient(ellipse at 50% 50%, rgba(80,160,80,0.2) 0%, transparent 70%)'
                    }} />
                    {/* Score overlay */}
                    <div className="absolute top-[8%] left-[6%] w-[30%] h-[12%] rounded-sm bg-black/50" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Extended position ghost/shadow showing range */}
          <div className="absolute left-[45%] top-[32%] w-[4px] h-[40px] rounded-[1px] opacity-20" style={{
            background: 'linear-gradient(90deg, #666 0%, #888 50%, #666 100%)',
            border: '1px dashed #999'
          }} />
          
          {/* Motion range arc */}
          <div className="absolute left-[18%] top-[60%]">
            <motion.svg 
              width="50" height="25" viewBox="0 0 50 25"
              animate={{ opacity: [0.25, 0.5, 0.25] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <path d="M5 20 Q25 0, 45 15" fill="none" stroke="#888" strokeWidth="1.5" strokeDasharray="4,3" />
              <polygon points="43,12 48,17 44,19" fill="#888" />
            </motion.svg>
          </div>
          
          {/* Floor with wood texture */}
          <div className="absolute bottom-0 left-0 right-0 h-[15%]" style={{
            background: 'linear-gradient(180deg, #c4a882 0%, #a08060 100%)'
          }}>
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 18px, rgba(80,60,40,0.08) 18px, rgba(80,60,40,0.08) 19px)'
            }} />
          </div>
          
          {/* Couch/seating silhouette */}
          <div className="absolute right-[8%] bottom-[15%] w-[25%] h-[22%] rounded-t-lg" style={{
            background: 'linear-gradient(180deg, rgba(90,80,70,0.12) 0%, rgba(70,60,50,0.08) 100%)'
          }} />
        </div>
      )
    }
    if (option === "Ceiling mount") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Commercial/gym environment - slight upward angle view */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, #b8b5ae 0%, #ccc9c2 15%, #dddad3 35%, #e8e5de 60%, #f0ede6 100%)'
          }} />
          
          {/* Ceiling - industrial/commercial style with exposed elements */}
          <div className="absolute top-0 left-0 right-0 h-[20%]" style={{
            background: 'linear-gradient(180deg, #9a9790 0%, #a8a5a0 40%, #b5b2ab 70%, #c2bfb8 100%)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
          }}>
            {/* Industrial ceiling texture - acoustic tiles */}
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px),
                linear-gradient(180deg, rgba(0,0,0,0.04) 1px, transparent 1px),
                radial-gradient(circle at 20% 40%, rgba(160,157,150,0.5) 1px, transparent 1px),
                radial-gradient(circle at 60% 70%, rgba(155,152,145,0.4) 1px, transparent 1px),
                radial-gradient(circle at 80% 30%, rgba(165,162,155,0.5) 1px, transparent 1px)`,
              backgroundSize: '25px 20px, 25px 20px, 8px 8px, 10px 10px, 7px 7px'
            }} />
            
            {/* Exposed ductwork hint */}
            <div className="absolute top-[30%] left-[5%] w-[25%] h-[35%] rounded-[3px]" style={{
              background: 'linear-gradient(180deg, #7a7770 0%, #8a8780 50%, #7a7770 100%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
            <div className="absolute top-[25%] right-[8%] w-[20%] h-[40%] rounded-[3px]" style={{
              background: 'linear-gradient(180deg, #757570 0%, #858580 50%, #757570 100%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </div>
          
          {/* Heavy-duty ceiling mounting plate - industrial */}
          <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[22%] h-[10%]" style={{
            background: 'linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 50%, #2a2a2a 100%)',
            borderRadius: '3px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.1)'
          }}>
            {/* Mounting bolts */}
            <div className="absolute top-[25%] left-[15%] w-[18%] h-[50%] rounded-full" style={{
              background: 'radial-gradient(circle at 40% 40%, #888 0%, #555 100%)'
            }} />
            <div className="absolute top-[25%] right-[15%] w-[18%] h-[50%] rounded-full" style={{
              background: 'radial-gradient(circle at 40% 40%, #888 0%, #555 100%)'
            }} />
          </div>
          
          {/* Main pole assembly - all connected */}
          <motion.div 
            className="absolute top-[23%] left-1/2 -translate-x-1/2 flex flex-col items-center"
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Upper pole section - heavy gauge steel */}
            <div className="relative w-[14px] h-[28px]" style={{
              background: 'linear-gradient(90deg, #3a3a3a 0%, #555555 20%, #6a6a6a 35%, #7a7a7a 50%, #6a6a6a 65%, #555555 80%, #3a3a3a 100%)',
              borderRadius: '2px',
              boxShadow: '3px 0 6px rgba(0,0,0,0.25), -2px 0 4px rgba(0,0,0,0.15)'
            }}>
              {/* Chrome highlight */}
              <div className="absolute top-0 bottom-0 left-[35%] w-[15%]" style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.12) 100%)'
              }} />
            </div>
            
            {/* Height adjustment collar with grip texture */}
            <div className="relative w-[20px] h-[8px]" style={{
              background: 'linear-gradient(90deg, #2d2d2d 0%, #454545 20%, #555555 50%, #454545 80%, #2d2d2d 100%)',
              borderRadius: '2px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.35)'
            }}>
              {/* Knurled grip pattern */}
              <div className="absolute inset-0 flex justify-around items-center px-[10%]">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-[6%] h-[60%] bg-black/25 rounded-full" />
                ))}
              </div>
            </div>
            
            {/* Lower pole section */}
            <div className="w-[14px] h-[22px]" style={{
              background: 'linear-gradient(90deg, #404040 0%, #5a5a5a 20%, #707070 35%, #808080 50%, #707070 65%, #5a5a5a 80%, #404040 100%)',
              borderRadius: '2px'
            }}>
              {/* Chrome highlight */}
              <div className="absolute top-0 bottom-0 left-[35%] w-[15%]" style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)'
              }} />
            </div>
            
            {/* Swivel/tilt head mechanism - connected to TV */}
            <motion.div 
              className="relative flex flex-col items-center"
              animate={{ rotateZ: [-4, 4, -4] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Swivel head */}
              <div className="w-[28px] h-[10px] rounded-[3px]" style={{
                background: 'linear-gradient(180deg, #4a4a4a 0%, #3a3a3a 50%, #2a2a2a 100%)',
                boxShadow: '0 3px 6px rgba(0,0,0,0.4)'
              }} />
              
              {/* Connecting bracket arms - clearly connecting head to TV */}
              <div className="relative w-[60px] h-[8px] flex justify-between items-start">
                <div className="w-[4px] h-[8px] rounded-b-sm" style={{
                  background: 'linear-gradient(90deg, #3a3a3a 0%, #4a4a4a 100%)'
                }} />
                <div className="w-[4px] h-[8px] rounded-b-sm" style={{
                  background: 'linear-gradient(90deg, #4a4a4a 0%, #3a3a3a 100%)'
                }} />
              </div>
              
              {/* TV back bracket bar */}
              <div className="w-[65px] h-[6px] rounded-[2px] -mt-[1px]" style={{
                background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }} />
            
              {/* TV - commercial display style */}
              <div 
                className="relative w-[85px] h-[52px] mt-[2px]"
              style={{
                background: 'linear-gradient(180deg, #0a0a0a 0%, #050505 100%)',
                borderRadius: '3px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.3)'
              }}
              animate={{ rotateZ: [-3, 3, -3] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Slim bezel frame */}
              <div className="absolute inset-[2px] rounded-[2px]" style={{
                background: 'linear-gradient(180deg, #121212 0%, #080808 100%)'
              }}>
                {/* Screen - sports bar/gym content */}
                <div className="absolute inset-[2px] rounded-[1px] overflow-hidden" style={{
                  background: 'linear-gradient(135deg, #0f1a28 0%, #0a1520 50%, #061018 100%)'
                }}>
                  {/* Live sports broadcast look */}
                  <motion.div 
                    className="absolute inset-[5%]"
                    animate={{ 
                      background: [
                        'linear-gradient(135deg, rgba(30,80,30,0.2) 0%, rgba(20,60,20,0.15) 100%)',
                        'linear-gradient(135deg, rgba(40,90,40,0.25) 0%, rgba(25,70,25,0.18) 100%)',
                        'linear-gradient(135deg, rgba(30,80,30,0.2) 0%, rgba(20,60,20,0.15) 100%)'
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  {/* Score bug overlay */}
                  <div className="absolute top-[6%] left-[5%] w-[35%] h-[14%] rounded-sm" style={{
                    background: 'linear-gradient(90deg, rgba(20,20,20,0.9) 0%, rgba(30,30,30,0.85) 100%)'
                  }}>
                    <div className="absolute left-[8%] top-[20%] w-[25%] h-[60%] bg-red-800/60 rounded-sm" />
                    <div className="absolute right-[8%] top-[20%] w-[25%] h-[60%] bg-blue-800/60 rounded-sm" />
                  </div>
                  
                  {/* Network logo corner */}
                  <div className="absolute top-[6%] right-[5%] w-[12%] h-[10%] rounded-sm bg-white/10" />
                  
                  {/* Bottom ticker */}
                  <motion.div 
                    className="absolute bottom-[5%] left-0 right-0 h-[12%]"
                    style={{ background: 'linear-gradient(90deg, rgba(180,30,30,0.5) 0%, rgba(200,40,40,0.4) 100%)' }}
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
              </div>
              
              {/* Power LED */}
              <motion.div 
                className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full"
                style={{ background: '#00ee00', boxShadow: '0 0 5px #00cc00, 0 0 10px rgba(0,200,0,0.3)' }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2.2, repeat: Infinity }}
              />
            </div>
            </motion.div>
          </motion.div>
          
          {/* Gym/commercial environment hints */}
          {/* Back wall with window/mirror */}
          <div className="absolute bottom-[22%] left-[8%] right-[8%] h-[18%] rounded-t-sm" style={{
            background: 'linear-gradient(180deg, rgba(180,200,210,0.12) 0%, rgba(160,180,190,0.08) 100%)',
            boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.1)'
          }} />
          
          {/* Rubber gym floor */}
          <div className="absolute bottom-0 left-0 right-0 h-[18%]" style={{
            background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)'
          }}>
            {/* Floor texture - rubber matting */}
            <div className="absolute inset-0" style={{
              backgroundImage: `
                radial-gradient(circle at 15% 30%, rgba(50,50,50,0.5) 1px, transparent 1px),
                radial-gradient(circle at 45% 60%, rgba(45,45,45,0.4) 1px, transparent 1px),
                radial-gradient(circle at 75% 40%, rgba(55,55,55,0.5) 1px, transparent 1px),
                radial-gradient(circle at 90% 70%, rgba(40,40,40,0.4) 1px, transparent 1px)`,
              backgroundSize: '12px 12px, 10px 10px, 14px 14px, 11px 11px'
            }} />
            
            {/* Floor marking line */}
            <div className="absolute top-[30%] left-[20%] right-[20%] h-[4%]" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(200,50,50,0.4) 20%, rgba(200,50,50,0.4) 80%, transparent 100%)'
            }} />
          </div>
          
          {/* Exercise equipment silhouette */}
          <div className="absolute bottom-[18%] right-[12%] w-[18%] h-[12%] rounded-t-sm" style={{
            background: 'linear-gradient(180deg, rgba(60,60,60,0.15) 0%, rgba(40,40,40,0.1) 100%)'
          }} />
        </div>
      )
    }
    // Wall type animations
    if (option === "Drywall/Sheetrock") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Drywall/Sheetrock - orange peel texture typical of modern homes */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#f5f5f0] via-[#eeede8] to-[#e8e7e2]">
            {/* Orange peel bumpy texture - characteristic of drywall */}
            <div className="absolute inset-0" style={{ 
              backgroundImage: `
                radial-gradient(ellipse 2px 1.5px at 15% 20%, rgba(220,218,210,0.7) 0%, transparent 100%),
                radial-gradient(ellipse 1.5px 2px at 35% 15%, rgba(215,213,205,0.6) 0%, transparent 100%),
                radial-gradient(ellipse 2px 1.5px at 55% 25%, rgba(225,223,215,0.65) 0%, transparent 100%),
                radial-gradient(ellipse 1.5px 2px at 75% 18%, rgba(218,216,208,0.7) 0%, transparent 100%),
                radial-gradient(ellipse 2px 2px at 25% 45%, rgba(222,220,212,0.6) 0%, transparent 100%),
                radial-gradient(ellipse 1.5px 1.5px at 45% 40%, rgba(220,218,210,0.65) 0%, transparent 100%),
                radial-gradient(ellipse 2px 1.5px at 65% 48%, rgba(217,215,207,0.7) 0%, transparent 100%),
                radial-gradient(ellipse 1.5px 2px at 85% 42%, rgba(223,221,213,0.6) 0%, transparent 100%),
                radial-gradient(ellipse 2px 1.5px at 20% 70%, rgba(219,217,209,0.65) 0%, transparent 100%),
                radial-gradient(ellipse 1.5px 2px at 40% 65%, rgba(221,219,211,0.7) 0%, transparent 100%),
                radial-gradient(ellipse 2px 2px at 60% 72%, rgba(216,214,206,0.6) 0%, transparent 100%),
                radial-gradient(ellipse 1.5px 1.5px at 80% 68%, rgba(224,222,214,0.65) 0%, transparent 100%),
                radial-gradient(ellipse 2px 1.5px at 30% 90%, rgba(218,216,208,0.7) 0%, transparent 100%),
                radial-gradient(ellipse 1.5px 2px at 70% 85%, rgba(220,218,210,0.6) 0%, transparent 100%)
              `,
              backgroundSize: '100% 100%'
            }} />
            {/* Taped seam line - vertical joint compound */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[3px] -translate-x-1/2">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#e0dfd8]/40 to-transparent" />
            </div>
            {/* Screw dimples filled with joint compound */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-[#e5e4dd] shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.12)]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-[#e5e4dd] shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.12)]" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-[#e5e4dd] shadow-[inset_0_0.5px_1px_rgba(0,0,0,0.12)]" />
            {/* Subtle light/shadow for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5" />
          </div>
        </div>
      )
    }
    if (option === "Brick") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Realistic brick wall with mortar joints */}
          <div className="absolute inset-0 bg-[#c9b9a8]">
            {/* Mortar base color */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#d4c8ba] via-[#c9bba8] to-[#bfb09c]" />
            
            {/* Row 1 - full bricks */}
            <div 
              className="absolute top-[2px] left-[2px] w-[38%] h-[28%] rounded-[2px]"
              style={{
                background: 'linear-gradient(145deg, #c45a3d 0%, #a8412a 35%, #8b3422 70%, #7a2d1d 100%)',
                boxShadow: 'inset 2px 1px 3px rgba(255,200,180,0.25), inset -1px -1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.25)'
              }}
            >
              <div className="absolute top-[20%] left-[15%] w-[3px] h-[2px] bg-[#8b3422]/40 rounded-full" />
              <div className="absolute top-[60%] right-[20%] w-[2px] h-[2px] bg-[#6b2418]/30 rounded-full" />
            </div>
            
            <div 
              className="absolute top-[2px] left-[42%] w-[38%] h-[28%] rounded-[2px]"
              style={{
                background: 'linear-gradient(140deg, #b84d35 0%, #9c3d28 40%, #7f2f1f 75%, #6e2819 100%)',
                boxShadow: 'inset 2px 1px 3px rgba(255,180,160,0.22), inset -1px -1px 2px rgba(0,0,0,0.28), 0 1px 2px rgba(0,0,0,0.22)'
              }}
            >
              <div className="absolute top-[40%] left-[30%] w-[2px] h-[3px] bg-[#7f2f1f]/35 rounded-full" />
            </div>

            <div 
              className="absolute top-[2px] right-[2px] w-[16%] h-[28%] rounded-[2px]"
              style={{
                background: 'linear-gradient(150deg, #d06245 0%, #b54a32 50%, #8f3825 100%)',
                boxShadow: 'inset 1px 1px 2px rgba(255,190,170,0.2), inset -1px -1px 2px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.2)'
              }}
            />
            
            {/* Row 2 - offset bricks (staggered pattern) */}
            <div 
              className="absolute top-[34%] left-[2px] w-[18%] h-[28%] rounded-[2px]"
              style={{
                background: 'linear-gradient(135deg, #be5038 0%, #9e3c28 45%, #82301e 80%, #722a1a 100%)',
                boxShadow: 'inset 1px 1px 2px rgba(255,185,165,0.2), inset -1px -1px 2px rgba(0,0,0,0.26), 0 1px 2px rgba(0,0,0,0.22)'
              }}
            />
            
            <div 
              className="absolute top-[34%] left-[22%] w-[38%] h-[28%] rounded-[2px]"
              style={{
                background: 'linear-gradient(142deg, #cc5c40 0%, #aa4530 38%, #8c3623 72%, #783020 100%)',
                boxShadow: 'inset 2px 1px 3px rgba(255,195,175,0.24), inset -1px -1px 2px rgba(0,0,0,0.28), 0 1px 2px rgba(0,0,0,0.24)'
              }}
            >
              <div className="absolute top-[25%] right-[25%] w-[3px] h-[2px] bg-[#6b2418]/30 rounded-full" />
              <div className="absolute bottom-[30%] left-[20%] w-[2px] h-[2px] bg-[#8c3623]/35 rounded-full" />
            </div>
            
            <div 
              className="absolute top-[34%] right-[2px] w-[36%] h-[28%] rounded-[2px]"
              style={{
                background: 'linear-gradient(148deg, #c25540 0%, #a6422d 42%, #884032 78%, #753525 100%)',
                boxShadow: 'inset 2px 1px 3px rgba(255,188,168,0.22), inset -1px -1px 2px rgba(0,0,0,0.27), 0 1px 2px rgba(0,0,0,0.23)'
              }}
            >
              <div className="absolute top-[50%] left-[40%] w-[2px] h-[2px] bg-[#753525]/40 rounded-full" />
            </div>
            
            {/* Row 3 - same as row 1 pattern */}
            <div 
              className="absolute bottom-[2px] left-[2px] w-[38%] h-[28%] rounded-[2px]"
              style={{
                background: 'linear-gradient(138deg, #c85a3e 0%, #ac4630 36%, #8e3824 68%, #7c3120 100%)',
                boxShadow: 'inset 2px 1px 3px rgba(255,192,172,0.23), inset -1px -1px 2px rgba(0,0,0,0.29), 0 1px 2px rgba(0,0,0,0.24)'
              }}
            >
              <div className="absolute top-[35%] left-[60%] w-[2px] h-[3px] bg-[#7c3120]/35 rounded-full" />
            </div>
            
            <div 
              className="absolute bottom-[2px] left-[42%] w-[38%] h-[28%] rounded-[2px]"
              style={{
                background: 'linear-gradient(144deg, #ba5038 0%, #9c3f2a 40%, #803220 74%, #702b1b 100%)',
                boxShadow: 'inset 2px 1px 3px rgba(255,185,165,0.21), inset -1px -1px 2px rgba(0,0,0,0.27), 0 1px 2px rgba(0,0,0,0.22)'
              }}
            >
              <div className="absolute top-[55%] right-[30%] w-[3px] h-[2px] bg-[#803220]/32 rounded-full" />
            </div>

            <div 
              className="absolute bottom-[2px] right-[2px] w-[16%] h-[28%] rounded-[2px]"
              style={{
                background: 'linear-gradient(152deg, #d26548 0%, #b24e35 48%, #923c28 100%)',
                boxShadow: 'inset 1px 1px 2px rgba(255,195,178,0.2), inset -1px -1px 2px rgba(0,0,0,0.24), 0 1px 2px rgba(0,0,0,0.2)'
              }}
            />
            
            {/* Mortar texture in joints */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: `radial-gradient(circle at 50% 32%, rgba(180,170,155,0.15) 0.5px, transparent 0.5px),
                               radial-gradient(circle at 20% 65%, rgba(170,160,145,0.12) 0.5px, transparent 0.5px)`,
              backgroundSize: '6px 6px'
            }} />
          </div>
        </div>
      )
    }
    if (option === "Concrete") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Poured concrete wall - raw industrial look */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#8a8a88] via-[#7d7d7b] to-[#737371]">
            {/* Exposed aggregate - visible sand and small pebbles */}
            <div className="absolute inset-0" style={{ 
              backgroundImage: `
                radial-gradient(ellipse 3px 2px at 12% 15%, rgba(95,90,85,0.8) 0%, transparent 100%),
                radial-gradient(ellipse 2px 3px at 28% 22%, rgba(110,105,100,0.7) 0%, transparent 100%),
                radial-gradient(ellipse 2.5px 2px at 45% 18%, rgba(85,80,75,0.75) 0%, transparent 100%),
                radial-gradient(ellipse 2px 2.5px at 65% 25%, rgba(100,95,90,0.7) 0%, transparent 100%),
                radial-gradient(ellipse 3px 2px at 82% 20%, rgba(90,85,80,0.8) 0%, transparent 100%),
                radial-gradient(ellipse 2px 2px at 18% 42%, rgba(105,100,95,0.7) 0%, transparent 100%),
                radial-gradient(ellipse 2.5px 3px at 38% 48%, rgba(80,75,70,0.8) 0%, transparent 100%),
                radial-gradient(ellipse 2px 2px at 55% 45%, rgba(115,110,105,0.65) 0%, transparent 100%),
                radial-gradient(ellipse 3px 2.5px at 72% 52%, rgba(88,83,78,0.75) 0%, transparent 100%),
                radial-gradient(ellipse 2px 2px at 88% 48%, rgba(98,93,88,0.7) 0%, transparent 100%),
                radial-gradient(ellipse 2.5px 2px at 22% 72%, rgba(92,87,82,0.8) 0%, transparent 100%),
                radial-gradient(ellipse 2px 2.5px at 42% 78%, rgba(108,103,98,0.7) 0%, transparent 100%),
                radial-gradient(ellipse 2px 2px at 58% 75%, rgba(82,77,72,0.75) 0%, transparent 100%),
                radial-gradient(ellipse 3px 2px at 78% 82%, rgba(102,97,92,0.7) 0%, transparent 100%)
              `,
              backgroundSize: '100% 100%'
            }} />
            {/* Form tie holes - characteristic of poured concrete */}
            <div className="absolute top-[25%] left-[20%] w-[4px] h-[4px] rounded-full bg-[#5a5855] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.45)]" />
            <div className="absolute top-[25%] right-[20%] w-[4px] h-[4px] rounded-full bg-[#5a5855] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.45)]" />
            <div className="absolute top-[75%] left-[20%] w-[4px] h-[4px] rounded-full bg-[#5a5855] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.45)]" />
            <div className="absolute top-[75%] right-[20%] w-[4px] h-[4px] rounded-full bg-[#5a5855] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.45)]" />
            {/* Horizontal form line from pour */}
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#6a6a68]/50" />
            {/* Surface weathering/variation */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10" />
          </div>
        </div>
      )
    }
    if (option === "Plaster") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Old plaster wall - characteristic of pre-1950s homes */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#f0ebe0] via-[#e8e2d5] to-[#dfd8ca]">
            {/* Plaster texture - hand-troweled swirl marks */}
            <div className="absolute inset-0" style={{ 
              backgroundImage: `
                radial-gradient(ellipse 8px 3px at 15% 20%, rgba(210,200,180,0.3) 0%, transparent 100%),
                radial-gradient(ellipse 6px 4px at 40% 15%, rgba(200,190,170,0.25) 0%, transparent 100%),
                radial-gradient(ellipse 7px 3px at 70% 25%, rgba(215,205,185,0.3) 0%, transparent 100%),
                radial-gradient(ellipse 5px 4px at 25% 45%, rgba(205,195,175,0.25) 0%, transparent 100%),
                radial-gradient(ellipse 8px 3px at 55% 50%, rgba(195,185,165,0.3) 0%, transparent 100%),
                radial-gradient(ellipse 6px 4px at 80% 48%, rgba(210,200,180,0.25) 0%, transparent 100%),
                radial-gradient(ellipse 7px 3px at 20% 75%, rgba(200,190,170,0.3) 0%, transparent 100%),
                radial-gradient(ellipse 5px 4px at 50% 80%, rgba(215,205,185,0.25) 0%, transparent 100%),
                radial-gradient(ellipse 8px 3px at 75% 72%, rgba(195,185,165,0.3) 0%, transparent 100%)
              `,
              backgroundSize: '100% 100%'
            }} />
            {/* Hairline cracks - spider web pattern typical of old plaster */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 60 60" preserveAspectRatio="none">
              <motion.path 
                d="M 8 5 Q 12 8, 15 12 Q 18 15, 22 14" 
                stroke="#b5a890" 
                strokeWidth="0.3" 
                fill="none"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.path 
                d="M 15 12 Q 16 16, 14 20" 
                stroke="#b5a890" 
                strokeWidth="0.25" 
                fill="none"
                animate={{ opacity: [0.25, 0.45, 0.25] }}
                transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
              />
              <motion.path 
                d="M 45 42 Q 48 45, 52 48 Q 54 51, 55 55" 
                stroke="#b5a890" 
                strokeWidth="0.3" 
                fill="none"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              />
              <motion.path 
                d="M 52 48 Q 50 50, 48 53" 
                stroke="#b5a890" 
                strokeWidth="0.25" 
                fill="none"
                animate={{ opacity: [0.25, 0.45, 0.25] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
              />
            </svg>
            {/* Subtle color variation from age/paint layers */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#d8d0c2]/30 via-transparent to-[#f5f0e5]/20" />
            {/* Slight surface undulation shadow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5" />
          </div>
        </div>
      )
    }
    if (option === "Stone") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Fieldstone/natural stone wall - irregular shapes with mortar */}
          <div className="absolute inset-0 bg-[#9a9590]">
            {/* Mortar background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#a8a39d] via-[#9a958f] to-[#8c8781]" />
            
            {/* Individual fieldstones - irregular shapes */}
            {/* Top left large stone */}
            <div 
              className="absolute top-[3px] left-[3px] w-[45%] h-[42%] rounded-[4px_2px_6px_3px]"
              style={{
                background: 'linear-gradient(135deg, #b5ad9f 0%, #9a928a 40%, #7d766e 100%)',
                boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.15), inset -1px -1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)'
              }}
            />
            
            {/* Top right stone */}
            <div 
              className="absolute top-[4px] right-[3px] w-[48%] h-[38%] rounded-[2px_5px_3px_6px]"
              style={{
                background: 'linear-gradient(145deg, #c4bbb0 0%, #a8a095 35%, #8a8278 100%)',
                boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.12), inset -1px -1px 3px rgba(0,0,0,0.18), 0 1px 2px rgba(0,0,0,0.25)'
              }}
            />
            
            {/* Bottom left stone */}
            <div 
              className="absolute bottom-[3px] left-[3px] w-[42%] h-[48%] rounded-[5px_3px_2px_4px]"
              style={{
                background: 'linear-gradient(160deg, #bab2a5 0%, #9e968a 45%, #827b70 100%)',
                boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.14), inset -1px -1px 3px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.28)'
              }}
            />
            
            {/* Bottom right stone */}
            <div 
              className="absolute bottom-[4px] right-[3px] w-[50%] h-[45%] rounded-[3px_6px_4px_2px]"
              style={{
                background: 'linear-gradient(125deg, #afa799 0%, #958d82 50%, #79726a 100%)',
                boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.13), inset -1px -1px 3px rgba(0,0,0,0.19), 0 1px 2px rgba(0,0,0,0.26)'
              }}
            />
            
            {/* Small accent stone in middle gap */}
            <div 
              className="absolute top-[44%] left-[46%] w-[12%] h-[14%] rounded-[2px]"
              style={{
                background: 'linear-gradient(140deg, #a9a196 0%, #8a837a 100%)',
                boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.1), 0 1px 1px rgba(0,0,0,0.2)'
              }}
            />
            
            {/* Mortar texture in gaps */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: `radial-gradient(circle at 48% 50%, rgba(120,115,108,0.4) 1px, transparent 1px)`,
              backgroundSize: '4px 4px'
            }} />
          </div>
        </div>
      )
    }
    // Cable management animations
    if (option === "Yes, hide all cables in wall") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Wall background */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, #f5f2ed 0%, #e8e4dd 100%)'
          }} />
          
          {/* TV mounted on wall */}
          <div className="absolute left-1/2 top-[18%] -translate-x-1/2 w-[75%] h-[40%]" style={{
            background: 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)',
            borderRadius: '3px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <div className="absolute inset-[4%] rounded-[2px]" style={{
              background: 'linear-gradient(135deg, #1a2a4a 0%, #0f1829 100%)'
            }} />
          </div>
          
          {/* Clean wall - no visible cables */}
          <div className="absolute left-1/2 top-[60%] -translate-x-1/2 w-[50%] h-[25%]" style={{
            background: 'linear-gradient(180deg, #f0ede8 0%, #e5e2dd 100%)'
          }} />
          
          {/* Wall outlet */}
          <div className="absolute left-1/2 bottom-[12%] -translate-x-1/2 w-[18%] h-[12%] rounded-[2px]" style={{
            background: 'linear-gradient(180deg, #f8f8f6 0%, #e8e8e4 100%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
          }}>
            <div className="absolute top-[30%] left-[25%] w-[15%] h-[20%] rounded-sm bg-[#333]" />
            <div className="absolute top-[30%] right-[25%] w-[15%] h-[20%] rounded-sm bg-[#333]" />
          </div>
          
          {/* Hidden cable path indicator (dashed) */}
          <motion.div 
            className="absolute left-1/2 top-[58%] -translate-x-1/2 w-[2px]"
            style={{ 
              height: '25%',
              background: 'repeating-linear-gradient(180deg, #4ade80 0px, #4ade80 3px, transparent 3px, transparent 6px)'
            }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Check mark indicator */}
          <motion.div 
            className="absolute right-[12%] top-[50%] w-[15%] h-[15%] rounded-full bg-green-500/20 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L19 7" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>
      )
    }
    if (option === "Yes, use cable covers") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Wall background */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, #f5f2ed 0%, #e8e4dd 100%)'
          }} />
          
          {/* TV mounted on wall */}
          <div className="absolute left-1/2 top-[18%] -translate-x-1/2 w-[75%] h-[40%]" style={{
            background: 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)',
            borderRadius: '3px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <div className="absolute inset-[4%] rounded-[2px]" style={{
              background: 'linear-gradient(135deg, #1a2a4a 0%, #0f1829 100%)'
            }} />
          </div>
          
          {/* Cable cover channel - paintable raceway */}
          <motion.div 
            className="absolute left-1/2 top-[58%] -translate-x-1/2 w-[8%] rounded-[2px]"
            style={{
              background: 'linear-gradient(90deg, #e8e5e0 0%, #f5f2ed 30%, #f8f6f2 50%, #f5f2ed 70%, #e8e5e0 100%)',
              boxShadow: '1px 1px 3px rgba(0,0,0,0.1), -1px 0 2px rgba(255,255,255,0.5)'
            }}
            initial={{ height: 0 }}
            animate={{ height: '28%' }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
          />
          
          {/* Wall outlet */}
          <div className="absolute left-1/2 bottom-[12%] -translate-x-1/2 w-[18%] h-[12%] rounded-[2px]" style={{
            background: 'linear-gradient(180deg, #f8f8f6 0%, #e8e8e4 100%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
          }}>
            <div className="absolute top-[30%] left-[25%] w-[15%] h-[20%] rounded-sm bg-[#333]" />
            <div className="absolute top-[30%] right-[25%] w-[15%] h-[20%] rounded-sm bg-[#333]" />
          </div>
        </div>
      )
    }
    if (option === "No, cables visible is fine") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Wall background */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, #f5f2ed 0%, #e8e4dd 100%)'
          }} />
          
          {/* TV mounted on wall */}
          <div className="absolute left-1/2 top-[18%] -translate-x-1/2 w-[75%] h-[40%]" style={{
            background: 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)',
            borderRadius: '3px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            <div className="absolute inset-[4%] rounded-[2px]" style={{
              background: 'linear-gradient(135deg, #1a2a4a 0%, #0f1829 100%)'
            }} />
          </div>
          
          {/* Visible cables hanging - multiple cables */}
          <svg className="absolute left-1/2 top-[58%] -translate-x-1/2 w-[40%] h-[32%]" viewBox="0 0 40 32" fill="none">
            {/* Power cable */}
            <motion.path 
              d="M15 0 Q 12 10, 18 16 Q 24 22, 16 32" 
              stroke="#1a1a1a" 
              strokeWidth="1.5" 
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
            />
            {/* HDMI cable */}
            <motion.path 
              d="M22 0 Q 26 8, 20 15 Q 14 22, 22 32" 
              stroke="#333" 
              strokeWidth="1.2" 
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.2, repeat: Infinity, repeatDelay: 0.5 }}
            />
          </svg>
          
          {/* Wall outlet */}
          <div className="absolute left-1/2 bottom-[12%] -translate-x-1/2 w-[18%] h-[12%] rounded-[2px]" style={{
            background: 'linear-gradient(180deg, #f8f8f6 0%, #e8e8e4 100%)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
          }}>
            <div className="absolute top-[30%] left-[25%] w-[15%] h-[20%] rounded-sm bg-[#333]" />
            <div className="absolute top-[30%] right-[25%] w-[15%] h-[20%] rounded-sm bg-[#333]" />
          </div>
        </div>
      )
    }
    // Plumbing animations
    if (option === "Clogged drain") {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="w-6 h-2 bg-gray-300 rounded-t-full" /> {/* Sink */}
          <div className="absolute top-4 w-2 h-4 bg-gray-400 rounded-b-sm" /> {/* Pipe */}
          <motion.div 
            className="absolute top-3 w-4 h-1 bg-blue-400 rounded-full"
            animate={{ y: [0, 1, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.div 
            className="absolute top-5 w-1.5 h-1.5 bg-amber-600 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </div>
      )
    }
    if (option === "Leaky pipe/faucet") {
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="w-3 h-2 bg-gray-400 rounded-t-sm" /> {/* Faucet */}
          <div className="w-1 h-3 bg-gray-400" /> {/* Spout */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              style={{ top: "60%" }}
              animate={{ 
                y: [0, 8, 16],
                opacity: [1, 0.7, 0],
                scale: [1, 0.8, 0.5]
              }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity, 
                delay: i * 0.3,
                ease: "easeIn"
              }}
            />
          ))}
        </div>
      )
    }
    if (option === "Water heater issue") {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="w-6 h-10 bg-gray-300 rounded-sm border border-gray-400 flex flex-col items-center justify-center">
            <motion.div 
              className="w-4 h-1 rounded-full"
              animate={{ backgroundColor: ["#60a5fa", "#f97316", "#60a5fa"] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div 
              className="text-[6px] mt-1 font-bold"
              animate={{ color: ["#3b82f6", "#ea580c", "#3b82f6"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              TEMP
            </motion.div>
          </div>
        </div>
      )
    }
    // Default fallback - show description text
    return (
      <div className="w-full h-full flex items-center justify-center p-1">
        <span className="text-[7px] text-gray-600 text-center leading-tight">{guide.description}</span>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full aspect-[5/4] rounded-lg overflow-hidden shadow-inner" style={{ willChange: 'transform', transform: 'translateZ(0)' }}>
      {isVisible ? getAnimation() : (
        <div className={`w-full h-full ${guide.bgColor || 'bg-gray-100'}`} />
      )}
    </div>
  )
})

type ServiceProvider = {
  id: number
  name: string
  avatar: string
  rating: number
  reviews: number
  verified: boolean
  responseTime: string
  completionRate: number
}

type Service = {
  id: number
  title: string
  category: string
  provider: ServiceProvider
  price: string
  timeEstimate: string
  description: string
  image: string
  tags: string[]
  matchScore: number
  completedProjects: number
  satisfaction: number
}

interface Message {
  id: string
  type: "user" | "ai" | "system" | "loading"
  content: string
  timestamp: Date
  suggestions?: string[]
  options?: string[]
  services?: Service[]
  context?: {
    intent?: string
    confidence?: number
    entities?: Array<{ type: string; value: string }>
    sentiment?: "positive" | "neutral" | "negative"
    urgency?: "low" | "medium" | "high"
  }
  metadata?: {
    processingTime?: number
    modelUsed?: string
    reasoning?: string[]
  }
}

const services: Service[] = [
  {
    id: 1,
    title: "Professional TV Mounting",
    category: "Mounting",
    provider: {
      id: 101,
      name: "Alex Morgan",
      avatar: "/professional-avatar.png",
      rating: 4.9,
      reviews: 124,
      verified: true,
      responseTime: "< 1 hour",
      completionRate: 98,
    },
    price: "$85",
    timeEstimate: "1-2 hours",
    description:
      "Professional TV mounting service for all TV sizes. Includes wall mount, cable management, and device setup.",
    image: "/tv-mounting-service.png",
    tags: ["TV Mounting", "Cable Management", "Electronics Setup"],
    matchScore: 95,
    completedProjects: 215,
    satisfaction: 98,
  },
  {
    id: 2,
    title: "Custom Furniture Assembly",
    category: "Assembly",
    provider: {
      id: 102,
      name: "Sarah Johnson",
      avatar: "/avatar-executive.png",
      rating: 4.8,
      reviews: 98,
      verified: true,
      responseTime: "< 2 hours",
      completionRate: 96,
    },
    price: "$65",
    timeEstimate: "2-4 hours",
    description:
      "Expert furniture assembly service for all types of furniture. Fast, reliable, and professional service.",
    image: "/furniture-assembly.png",
    tags: ["Furniture Assembly", "IKEA", "Custom Furniture"],
    matchScore: 88,
    completedProjects: 187,
    satisfaction: 96,
  },
  {
    id: 3,
    title: "Interior Painting Service",
    category: "Painting",
    provider: {
      id: 103,
      name: "Michael Chen",
      avatar: "/professional-expert-avatar.png",
      rating: 4.9,
      reviews: 156,
      verified: true,
      responseTime: "< 3 hours",
      completionRate: 99,
    },
    price: "$45/hour",
    timeEstimate: "Varies by project",
    description:
      "Professional interior painting service with premium materials. Transform your space with expert painting.",
    image: "/interior-painter.png",
    tags: ["Interior Painting", "Color Consultation", "Wall Repair"],
    matchScore: 82,
    completedProjects: 230,
    satisfaction: 99,
  },
  {
    id: 4,
    title: "Smart Home Installation",
    category: "Technology",
    provider: {
      id: 104,
      name: "Jamie Wilson",
      avatar: "/avatar-executive-professional.png",
      rating: 4.7,
      reviews: 87,
      verified: true,
      responseTime: "< 1 hour",
      completionRate: 95,
    },
    price: "$120",
    timeEstimate: "2-3 hours",
    description:
      "Complete smart home setup and integration. Connect all your devices for a seamless smart home experience.",
    image: "/smart-home-installation.png",
    tags: ["Smart Home", "Home Automation", "IoT Setup"],
    matchScore: 79,
    completedProjects: 145,
    satisfaction: 97,
  },
  {
    id: 5,
    title: "Plumbing Repair & Installation",
    category: "Plumbing",
    provider: {
      id: 105,
      name: "Robert Garcia",
      avatar: "/professional-plumber.png",
      rating: 4.8,
      reviews: 112,
      verified: true,
      responseTime: "< 2 hours",
      completionRate: 97,
    },
    price: "$75/hour",
    timeEstimate: "1-4 hours",
    description:
      "Professional plumbing services including repairs, installations, and maintenance for residential properties.",
    image: "/plumber-fixing-sink.png",
    tags: ["Plumbing", "Repairs", "Installation"],
    matchScore: 75,
    completedProjects: 198,
    satisfaction: 95,
  },
  {
    id: 6,
    title: "Professional Photography",
    category: "Photography",
    provider: {
      id: 106,
      name: "Emma Rodriguez",
      avatar: "/professional-photographer-portrait.png",
      rating: 4.9,
      reviews: 143,
      verified: true,
      responseTime: "< 3 hours",
      completionRate: 99,
    },
    price: "$150/session",
    timeEstimate: "2-3 hours",
    description:
      "Professional photography services for events, portraits, products, and real estate. High-quality images guaranteed.",
    image: "/professional-photographer.png",
    tags: ["Photography", "Portraits", "Events"],
    matchScore: 72,
    completedProjects: 176,
    satisfaction: 98,
  },
]

interface ServiceSpecificQuestions {
  [key: string]: {
    questions: string[]
    options: { [key: string]: string[] }
    required: boolean[]
  }
}

const serviceSpecificQuestions: ServiceSpecificQuestions = {
  tvMounting: {
    questions: [
      "What would you like to mount?",
      "What size is your TV?",
      "What type of wall do you have?",
      "Do you already have a wall mount, or do you need one included?",
      "What type of mount would you prefer?",
      "Do you need cable management (hiding cables in the wall)?",
      "Will you have a soundbar or other accessories to mount/attach with the TV?",
      "Is the mounting location near a power outlet?",
      "Do you need help with any additional setup (streaming devices, gaming consoles, etc.)?",
    ],
    options: {
      "What would you like to mount?": [
        "TV/Monitor",
        "Art/Picture Frame",
        "Floating Shelves",
        "Mirror",
        "Other",
      ],
      "What size is your TV?": [
        "Under 32 inches",
        "32-42 inches",
        "43-55 inches",
        "56-65 inches",
        "66-75 inches",
        "Over 75 inches",
        "Unsure",
      ],
  "What type of wall do you have?": [
    "Drywall/Sheetrock",
    "Brick",
    "Concrete",
    "Plaster",
    "Stone",
    "Unsure",
  ],
      "Do you already have a wall mount, or do you need one included?": [
        "I have a mount",
        "I need a mount included",
        "I need help choosing a mount",
        "Unsure",
      ],
"What type of mount would you prefer?": [
  "Fixed (flat against wall)",
  "Tilting (angle adjustment)",
  "Full-motion/Articulating (swivel and tilt)",
  "Ceiling mount",
  "Unsure",
  ],
      "Do you need cable management (hiding cables in the wall)?": [
        "Yes, hide all cables in wall",
        "Yes, use cable covers",
        "No, cables visible is fine",
        "Unsure",
      ],
      "Will you have a soundbar or other accessories to mount/attach with the TV?": [
        "Yes, soundbar",
        "Yes, soundbar and subwoofer",
        "Yes, multiple accessories",
        "No additional accessories",
        "Unsure",
      ],
      "Is the mounting location near a power outlet?": [
        "Yes, within 3 feet",
        "Yes, but farther away",
        "No, need outlet installed",
        "Unsure",
      ],
      "Do you need help with any additional setup (streaming devices, gaming consoles, etc.)?": [
        "Yes, full entertainment system setup",
        "Yes, just basic device connection",
        "No, just TV mounting",
        "Unsure",
      ],
    },
    required: [true, true, true, false, false, false, false, false],
  },
  plumbing: {
    questions: [
      "What type of plumbing issue are you experiencing?",
      "How urgent is this plumbing situation?",
      "Is there active water leakage?",
      "Where is the problem located?",
      "Have you tried any DIY fixes already?",
      "How old is your plumbing system?",
      "Do you need emergency shutoff assistance?",
    ],
    options: {
      "What type of plumbing issue are you experiencing?": [
        "Clogged drain",
        "Leaky pipe/faucet",
        "Water heater issue",
        "Toilet problem",
        "Installation of new fixture",
        "Sewer line issue",
        "Water pressure problem",
        "Other",
        "Unsure",
      ],
      "How urgent is this plumbing situation?": [
        "Emergency (need help immediately)",
        "Urgent (today or tomorrow)",
        "Standard (this week)",
        "Flexible (whenever available)",
        "Unsure",
      ],
      "Is there active water leakage?": [
        "Yes, significant leak",
        "Yes, minor dripping",
        "No active leak",
        "Water shut off",
        "Unsure",
      ],
      "Where is the problem located?": [
        "Kitchen",
        "Bathroom",
        "Basement",
        "Laundry room",
        "Outside/Yard",
        "Multiple locations",
        "Unsure",
      ],
      "Have you tried any DIY fixes already?": ["Yes, still not working", "Yes, made it worse", "No", "Unsure"],
      "How old is your plumbing system?": ["Less than 5 years", "5-15 years", "15-25 years", "Over 25 years", "Unsure"],
      "Do you need emergency shutoff assistance?": [
        "Yes, water still running",
        "Already shut off",
        "Don't know how to shut off",
        "Not needed",
        "Unsure",
      ],
    },
    required: [true, true, true, false, false, false, false],
  },
  painting: {
    questions: [
      "What area needs painting?",
      "Do you need interior or exterior painting?",
      "What is the approximate square footage?",
      "What is the current wall condition?",
      "Do walls need repair before painting?",
      "Do you need any special finishes or techniques?",
      "Do you have a color scheme in mind?",
      "Do you need help with color selection?",
    ],
    options: {
      "What area needs painting?": [
        "Single room",
        "Multiple rooms (2-3)",
        "Multiple rooms (4+)",
        "Entire home interior",
        "Exterior only",
        "Both interior and exterior",
        "Commercial space",
        "Unsure",
      ],
      "Do you need interior or exterior painting?": ["Interior only", "Exterior only", "Both", "Unsure"],
      "What is the approximate square footage?": [
        "Under 500 sq ft",
        "500-1000 sq ft",
        "1000-2000 sq ft",
        "2000-3000 sq ft",
        "Over 3000 sq ft",
        "Unsure",
      ],
      "What is the current wall condition?": [
        "Good condition",
        "Minor imperfections",
        "Visible damage/holes",
        "Major repair needed",
        "Unsure",
      ],
      "Do walls need repair before painting?": [
        "Yes, significant repairs needed",
        "Yes, minor patching needed",
        "No, walls are ready",
        "Need professional assessment",
        "Unsure",
      ],
      "Do you need any special finishes or techniques?": [
        "Standard paint job",
        "Textured finish",
        "Faux finish",
        "Accent wall with special technique",
        "Mural or custom design",
        "High-gloss/specialty coating",
        "Unsure",
      ],
      "Do you have a color scheme in mind?": [
        "Yes, I know exact colors",
        "Have some ideas",
        "Need complete guidance",
        "Unsure",
      ],
      "Do you need help with color selection?": [
        "Yes, full color consultation",
        "Yes, just some advice",
        "No, I have colors chosen",
        "Unsure",
      ],
    },
    required: [true, true, true, false, false, false, false, false],
  },
  furniture: {
    questions: [
      "What type of furniture needs assembly?",
      "How many pieces need assembly?",
      "What is the brand/source of the furniture?",
      "Do you have all the necessary tools?",
      "Are the assembly instructions available?",
      "Is the furniture already delivered to your location?",
      "Do you need the packaging materials removed after assembly?",
      "Are there any special requirements (stairs, tight spaces, etc.)?",
    ],
    options: {
      "What type of furniture needs assembly?": [
        "Bed frame",
        "Dresser/Chest",
        "Desk/Table",
        "Chair/Seating",
        "Bookshelf/Storage unit",
        "Entertainment center",
        "Outdoor furniture",
        "Office furniture",
        "Multiple types",
        "Unsure",
      ],
      "How many pieces need assembly?": [
        "1 piece",
        "2-3 pieces",
        "4-5 pieces",
        "6-10 pieces",
        "More than 10 pieces",
        "Unsure",
      ],
      "What is the brand/source of the furniture?": [
        "IKEA",
        "Wayfair",
        "Amazon",
        "West Elm",
        "CB2/Crate & Barrel",
        "Target",
        "Other big box store",
        "Custom/Local",
        "Unsure",
      ],
      "Do you have all the necessary tools?": ["Yes, all tools ready", "Missing some tools", "No tools", "Unsure"],
      "Are the assembly instructions available?": [
        "Yes, have instructions",
        "Lost/missing instructions",
        "Instructions unclear",
        "No instructions included",
        "Unsure",
      ],
      "Is the furniture already delivered to your location?": [
        "Yes, at location",
        "Partially delivered",
        "Not yet delivered",
        "Need help with delivery too",
        "Unsure",
      ],
      "Do you need the packaging materials removed after assembly?": [
        "Yes, remove all packaging",
        "Yes, but I'll keep boxes",
        "No, I'll handle disposal",
        "Unsure",
      ],
      "Are there any special requirements (stairs, tight spaces, etc.)?": [
        "Need to move up/down stairs",
        "Tight doorways/hallways",
        "Elevator access required",
        "Heavy/oversized pieces",
        "No special requirements",
        "Unsure",
      ],
    },
    required: [true, true, false, false, false, false, false, false],
  },
  moving: {
    questions: [
      "What type of move are you planning?",
      "How many rooms need to be moved?",
      "What is the distance of your move?",
      "Do you need packing services?",
      "Do you have any large or specialty items?",
      "What floors are you moving from/to?",
      "Do you need storage services?",
      "What's your preferred moving date?",
    ],
    options: {
      "What type of move are you planning?": [
        "Residential - full home",
        "Residential - apartment",
        "Office/Commercial",
        "Single item/Partial",
        "Storage unit",
        "Unsure",
      ],
      "How many rooms need to be moved?": [
        "Studio/1 bedroom",
        "2 bedrooms",
        "3 bedrooms",
        "4+ bedrooms",
        "Office space",
        "Unsure",
      ],
      "What is the distance of your move?": [
        "Same building",
        "Local (under 10 miles)",
        "Local (10-50 miles)",
        "Long distance (50-200 miles)",
        "Cross-country",
        "Unsure",
      ],
      "Do you need packing services?": [
        "Yes, full packing",
        "Partial packing (fragile items only)",
        "Just packing materials provided",
        "No, I'll pack myself",
        "Unsure",
      ],
      "Do you have any large or specialty items?": [
        "Piano",
        "Pool table",
        "Artwork/Antiques",
        "Exercise equipment",
        "Large furniture",
        "Multiple specialty items",
        "No specialty items",
        "Unsure",
      ],
      "What floors are you moving from/to?": [
        "Ground floor both locations",
        "Elevator access both",
        "Stairs at one or both",
        "High-rise building",
        "Unsure",
      ],
      "Do you need storage services?": [
        "Yes, short-term (1-3 months)",
        "Yes, long-term (3+ months)",
        "No storage needed",
        "Unsure",
      ],
      "What's your preferred moving date?": [
        "Within a week",
        "1-2 weeks",
        "3-4 weeks",
        "1-2 months",
        "Flexible/Not sure",
        "Unsure",
      ],
    },
    required: [true, true, true, false, false, false, false, true],
  },
  cleaning: {
    questions: [
      "What type of cleaning service do you need?",
      "What is the size of your space?",
      "How often do you need cleaning?",
      "What is the current condition of your space?",
      "Are there any specific areas that need special attention?",
      "Do you have any pets?",
      "Do you need cleaning supplies provided?",
      "Any allergies or product preferences?",
    ],
    options: {
      "What type of cleaning service do you need?": [
        "Regular/Standard cleaning",
        "Deep cleaning",
        "Move-in/Move-out",
        "Post-construction",
        "Post-renovation",
        "Office cleaning",
        "Event cleanup",
        "Unsure",
      ],
      "What is the size of your space?": [
        "Studio/1 bedroom",
        "2-3 bedrooms",
        "4+ bedrooms",
        "Small office",
        "Large office/Commercial",
        "Unsure",
      ],
      "How often do you need cleaning?": [
        "One-time deep clean",
        "Weekly",
        "Bi-weekly",
        "Monthly",
        "Occasional/as needed",
        "Unsure",
      ],
      "What is the current condition of your space?": [
        "Generally clean, needs maintenance",
        "Moderately dirty",
        "Very dirty/neglected",
        "Post-construction mess",
        "Unsure",
      ],
      "Are there any specific areas that need special attention?": [
        "Kitchen (appliances, cabinets)",
        "Bathrooms (deep scrub)",
        "Carpets/Upholstery",
        "Windows",
        "Floors (all types)",
        "All areas equally",
        "Unsure",
      ],
      "Do you have any pets?": ["Yes, cats", "Yes, dogs", "Yes, multiple pets", "Yes, other pets", "No pets", "Unsure"],
      "Do you need cleaning supplies provided?": [
        "Yes, provide all supplies",
        "I have basic supplies",
        "I have all supplies",
        "Unsure",
      ],
      "Any allergies or product preferences?": [
        "Eco-friendly products only",
        "Fragrance-free",
        "Chemical allergies",
        "No preferences",
        "Unsure",
      ],
    },
    required: [true, true, true, false, false, false, false, false],
  },
  electrical: {
    questions: [
      "What type of electrical work do you need?",
      "Is this a repair or new installation?",
      "How urgent is this electrical work?",
      "Is the property residential or commercial?",
      "What is the scope of work?",
      "Has this issue occurred before?",
      "Do you need a permit for this work?",
    ],
    options: {
      "What type of electrical work do you need?": [
        "Outlet/Switch installation",
        "Lighting installation/fixture",
        "Electrical panel work",
        "Wiring/Rewiring",
        "Circuit breaker issue",
        "Smart home integration",
        "Troubleshooting/Diagnosis",
        "Safety inspection",
        "Other",
        "Unsure",
      ],
      "Is this a repair or new installation?": [
        "Repair existing",
        "New installation",
        "Upgrade existing",
        "Inspection only",
        "Unsure",
      ],
      "How urgent is this electrical work?": [
        "Emergency (safety hazard)",
        "Urgent (1-2 days)",
        "Standard (this week)",
        "Flexible scheduling",
        "Unsure",
      ],
      "Is the property residential or commercial?": ["Residential", "Commercial", "Industrial", "Unsure"],
      "What is the scope of work?": ["Single room", "Multiple rooms", "Entire home/building", "Outdoor work", "Unsure"],
      "Has this issue occurred before?": [
        "Yes, multiple times",
        "Yes, once before",
        "No, first time",
        "Ongoing issue",
        "Unsure",
      ],
      "Do you need a permit for this work?": [
        "Yes, need permit",
        "Already have permit",
        "Not sure if needed",
        "No permit needed",
        "Unsure",
      ],
    },
    required: [true, true, true, false, false, false, false],
  },
  landscaping: {
    questions: [
      "What type of landscaping service do you need?",
      "What is the approximate size of your yard?",
      "Do you need regular maintenance or a one-time service?",
      "What is the current condition of your landscape?",
      "Are there any specific features you want to include?",
      "Do you need irrigation or drainage work?",
      "When would you like the work to be completed?",
    ],
    options: {
      "What type of landscaping service do you need?": [
        "Lawn maintenance",
        "Garden design/planting",
        "Tree service/trimming",
        "Hardscaping (patio, walkway)",
        "Irrigation system",
        "Landscape cleanup",
        "Full landscape redesign",
        "Unsure",
      ],
      "What is the approximate size of your yard?": [
        "Small (under 1,000 sq ft)",
        "Medium (1,000-5,000 sq ft)",
        "Large (5,000-10,000 sq ft)",
        "Very large (10,000+ sq ft)",
        "Unsure",
      ],
      "Do you need regular maintenance or a one-time service?": [
        "Weekly maintenance",
        "Bi-weekly maintenance",
        "Monthly maintenance",
        "Seasonal service",
        "One-time project",
        "Unsure",
      ],
      "What is the current condition of your landscape?": [
        "Well-maintained",
        "Needs some work",
        "Overgrown/neglected",
        "Blank slate/new construction",
        "Unsure",
      ],
      "Are there any specific features you want to include?": [
        "Flower beds/Garden",
        "Water features",
        "Patio/Deck",
        "Fencing",
        "Outdoor lighting",
        "Fire pit/Outdoor kitchen",
        "None/Unsure",
      ],
      "Do you need irrigation or drainage work?": [
        "New irrigation system",
        "Repair existing irrigation",
        "Drainage solutions",
        "Both irrigation and drainage",
        "No irrigation needed",
        "Unsure",
      ],
      "When would you like the work to be completed?": [
        "ASAP",
        "Within 2 weeks",
        "Within a month",
        "This season",
        "Flexible timing",
        "Unsure",
      ],
    },
    required: [true, true, true, false, false, false, false],
  },
  flooring: {
    questions: [
      "What type of flooring project do you need?",
      "What is the approximate square footage?",
      "What type of flooring material are you interested in?",
      "Is this for a residential or commercial property?",
      "What rooms need flooring work?",
      "Do you need removal of existing flooring?",
      "What is the subfloor condition?",
      "When do you need the work completed?",
    ],
    options: {
      "What type of flooring project do you need?": [
        "New installation",
        "Replacement",
        "Repair",
        "Refinishing",
        "Cleaning/Maintenance",
        "Unsure",
      ],
      "What is the approximate square footage?": [
        "Under 500 sq ft",
        "500-1,000 sq ft",
        "1,000-2,000 sq ft",
        "2,000-3,000 sq ft",
        "Over 3,000 sq ft",
        "Unsure",
      ],
      "What type of flooring material are you interested in?": [
        "Hardwood",
        "Laminate",
        "Vinyl/LVP",
        "Tile (ceramic/porcelain)",
        "Carpet",
        "Bamboo",
        "Cork",
        "Need recommendations",
        "Unsure",
      ],
      "Is this for a residential or commercial property?": ["Residential", "Commercial", "Industrial", "Unsure"],
      "What rooms need flooring work?": [
        "Single room",
        "Multiple rooms (2-3)",
        "Multiple rooms (4+)",
        "Entire home/building",
        "Basement",
        "Unsure",
      ],
      "Do you need removal of existing flooring?": [
        "Yes, carpet removal",
        "Yes, tile removal",
        "Yes, hardwood removal",
        "Yes, other flooring",
        "No removal needed",
        "Unsure",
      ],
      "What is the subfloor condition?": [
        "Good condition",
        "Needs minor repair",
        "Needs major repair",
        "Unknown/Need assessment",
        "Unsure",
      ],
      "When do you need the work completed?": [
        "ASAP",
        "Within 2 weeks",
        "Within a month",
        "Within 2 months",
        "Flexible",
        "Unsure",
      ],
    },
    required: [true, true, true, false, false, false, false, false],
  },
  roofing: {
    questions: [
      "What type of roofing service do you need?",
      "What is the approximate size of your roof?",
      "What type of roofing material do you have or want?",
      "How old is your current roof?",
      "Have you noticed any leaks or damage?",
      "Do you need emergency services?",
      "What is your timeline for this project?",
    ],
    options: {
      "What type of roofing service do you need?": [
        "Minor repair",
        "Major repair",
        "Full replacement",
        "Inspection only",
        "Maintenance",
        "New installation",
        "Emergency leak repair",
        "Unsure",
      ],
      "What is the approximate size of your roof?": [
        "Small (under 1,000 sq ft)",
        "Medium (1,000-2,000 sq ft)",
        "Large (2,000-3,000 sq ft)",
        "Very large (3,000+ sq ft)",
        "Unsure",
      ],
      "What type of roofing material do you have or want?": [
        "Asphalt shingles",
        "Metal roofing",
        "Tile (clay/concrete)",
        "Flat/TPO",
        "Wood shake/shingle",
        "Slate",
        "Need recommendations",
        "Unsure",
      ],
      "How old is your current roof?": [
        "Less than 5 years",
        "5-10 years",
        "10-15 years",
        "15-20 years",
        "Over 20 years",
        "Don't know",
        "Unsure",
      ],
      "Have you noticed any leaks or damage?": [
        "Yes, active leaks",
        "Yes, visible exterior damage",
        "Yes, interior water damage",
        "Minor issues",
        "No visible issues",
        "Unsure",
      ],
      "Do you need emergency services?": [
        "Yes, emergency leak",
        "Yes, storm damage",
        "No, can wait",
        "Not sure",
        "Unsure",
      ],
      "What is your timeline for this project?": [
        "Emergency (ASAP)",
        "Within a week",
        "Within a month",
        "Within 3 months",
        "Flexible/Planning ahead",
        "Unsure",
      ],
    },
    required: [true, true, false, true, false, false, false],
  },
}

const questionSkipLogic: {
  [serviceType: string]: {
    [question: string]: {
      [answer: string]: Set<string>
    }
  }
} = {
  painting: {
    "Do you have a color scheme in mind?": {
      "Yes, I know exact colors": new Set(["Do you need help with color selection?"]),
    },
    "What is the current wall condition?": {
      "Good condition": new Set(["Do walls need repair before painting?"]),
    },
  },
  plumbing: {
    "Is there active water leakage?": {
      "No active leak": new Set(["Do you need emergency shutoff assistance?"]),
      "Water shut off": new Set(["Do you need emergency shutoff assistance?"]),
    },
  },
}

interface AIModelState {
  conversationContext: {
    stage: "initial" | "understanding" | "service-specific" | "recommending" | "refining" | "finalizing"
    currentServiceType: string | null
    serviceSpecificAnswers: Map<string, string>
    currentServiceQuestion: number
  }
}

const initialAIModel: AIModelState = {
  conversationContext: {
    stage: "initial",
    currentServiceType: null,
    serviceSpecificAnswers: new Map(),
    currentServiceQuestion: 0,
  },
}

const initialMessages: Message[] = [
  {
    id: "welcome",
    type: "ai",
    content: "Hi! I'm LevL AI. Please select one of the above categories that you need help with!",
    timestamp: new Date(),
  },
]

const MessageItem = memo(
  ({
    message,
    onOptionSelect,
    router,
    isActiveOptions = false,
  }: {
    message: Message
    onOptionSelect: (option: string) => void
    router: ReturnType<typeof useRouter>
    isActiveOptions?: boolean
  }) => {
    const handleOptionClick = useCallback(
      (option: string) => {
        onOptionSelect(option)
      },
      [onOptionSelect],
    )

    if (message.type === "user") {
      return (
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          layout={false}
        >
          <div className="relative bg-gradient-to-br from-lavender-200/95 via-lavender-300/90 to-lavender-200/90 dark:from-lavender-950/95 dark:via-lavender-950/90 dark:to-lavender-950/90 backdrop-blur-sm rounded-2xl px-5 py-3 max-w-[80%] shadow-[0_14px_20px_-3px_rgba(79,70,229,0.3),0_6px_10px_-4px_rgba(79,70,229,0.2),0_-2px_8px_0px_rgba(255,255,255,0.15)] dark:shadow-[0_10px_15px_-3px_rgba(79,70,229,0.3),0_4px_6px_-4px_rgba(0,0,0,0.4),0_-2px_6px_0px_rgba(79,70,229,0.1)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-800/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 translate-y-[-2px] hover:translate-y-[-4px] transition-all duration-300 transform">
            <p className="text-sm text-gray-800 dark:text-gray-100 relative z-10">{message.content}</p>
            <div className="text-[10px] text-black dark:text-white text-right mt-1 relative z-10">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </motion.div>
      )
    }

    if (message.type === "ai") {
      return (
        <motion.div
          className="flex"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          layout={false}
        >
          <div className="relative bg-gradient-to-br from-white/95 via-white/90 to-lavender-50/90 dark:from-gray-800/95 dark:via-gray-800/90 dark:to-lavender-950/90 backdrop-blur-sm rounded-2xl px-5 py-3 max-w-[80%] shadow-[0_14px_20px_-3px_rgba(79,70,229,0.3),0_6px_10px_-4px_rgba(79,70,229,0.2),0_-2px_8px_0px_rgba(255,255,255,0.15)] dark:shadow-[0_10px_15px_-3px_rgba(79,70,229,0.3),0_4px_6px_-4px_rgba(0,0,0,0.4),0_-2px_6px_0px_rgba(79,70,229,0.1)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 translate-y-[-4px] transition-all duration-300 transform">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-lavender-500/8 via-purple-500/8 to-violet-500/8 dark:from-lavender-500/15 dark:via-purple-500/15 dark:to-violet-500/15 opacity-80"></div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-2xl bg-gradient-to-t from-black/5 to-transparent dark:from-white/5"></div>

            <p className="text-sm relative z-10">{message.content}</p>

            {message.options && (
              <div className="mt-4 relative z-10">
                {/* Check if any options have visual guides */}
                {message.options.some(opt => optionVisualGuides[opt]) ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {message.options.map((option, index) => {
                      const hasVisualGuide = !!optionVisualGuides[option]
                      return (
                <motion.button
                key={`${message.id}-${option}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className={`flex flex-col items-center overflow-hidden bg-white/90 dark:bg-gray-800/90 hover:bg-lavender-100/90 dark:hover:bg-lavender-900/30 rounded-xl text-xs font-medium transition-all duration-200 border border-lavender-200/70 dark:border-lavender-700/50 hover:border-lavender-400 dark:hover:border-lavender-500/70 backdrop-blur-sm hover:shadow-lg hover:scale-[1.02] ${!hasVisualGuide ? 'justify-center min-h-[80px]' : ''}`}
                onClick={() => handleOptionClick(option)}
                >
                <OptionVisualPreview option={option} isActive={isActiveOptions} />
                <span className={`text-center leading-tight px-2 py-1.5 w-full ${hasVisualGuide ? 'bg-white/80 dark:bg-gray-800/80' : ''}`}>{option}</span>
                </motion.button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {message.options.map((option, index) => (
                      <motion.button
                        key={`${message.id}-${option}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        className="px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 hover:bg-lavender-100/90 dark:hover:bg-lavender-900/30 rounded-full text-xs font-medium transition-all duration-200 border border-lavender-200/70 dark:border-lavender-700/50 hover:border-lavender-300 dark:hover:border-lavender-600/70 backdrop-blur-sm hover:shadow-md"
                        onClick={() => handleOptionClick(option)}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {message.services && (
              <div className="mt-5 space-y-4 relative z-10">
                {message.services.map((service, index) => (
                  <motion.div
                    key={service.provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <ProviderCard
                      provider={service.provider}
                      onSelect={(providerId) => router.push(`/services/${service.id}`)}
                      onViewServices={(providerId) => router.push(`/services/${service.id}`)}
                      onContact={(providerId) => router.push(`/messages?provider=${providerId}`)}
                      matchScore={service.matchScore}
                    />
                  </motion.div>
                ))}
              </div>
            )}
            <div className="text-[10px] text-black dark:text-white mt-1 relative z-10">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </motion.div>
      )
    }

    if (message.type === "loading") {
      return (
        <motion.div
          className="flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          layout={false}
        >
          <div className="flex items-center p-4 rounded-2xl bg-gradient-to-br from-white/95 via-white/90 to-lavender-50/90 dark:from-gray-800/95 dark:via-gray-800/90 dark:to-lavender-950/90 backdrop-blur-sm shadow-[0_20px_30px_-5px_rgba(79,70,229,0.4),0_10px_15px_-5px_rgba(79,70,229,0.3),0_-3px_10px_0px_rgba(255,255,255,0.2),inset_0_1px_2px_0px_rgba(255,255,255,0.5)] dark:shadow-[0_20px_30px_-5px_rgba(79,70,229,0.5),0_10px_15px_-5px_rgba(0,0,0,0.6),0_-3px_10px_0px_rgba(79,70,229,0.3),inset_0_1px_2px_0px_rgba(79,70,229,0.2)] border-t border-l border-r border-lavender-200/80 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/50 border-b-2 border-b-lavender-300 dark:border-b-2 dark:border-b-lavender-600 transform translate-y-[-6px] hover:translate-y-[-8px] transition-all duration-300">
            <LevlLogo className="h-14 w-14 mr-3 drop-shadow-[0_4px_8px_rgba(79,70,229,0.3)] dark:drop-shadow-[0_4px_8px_rgba(79,70,229,0.5)]" />
            <div className="flex space-x-2 ml-1">
              <motion.div
                className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-600 shadow-[0_2px_8px_rgba(139,92,246,0.6)] dark:shadow-[0_2px_8px_rgba(139,92,246,0.8)]"
                animate={{
                  scale: [0.6, 1.2, 0.6],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-600 shadow-[0_2px_8px_rgba(139,92,246,0.6)] dark:shadow-[0_2px_8px_rgba(139,92,246,0.8)]"
                animate={{
                  scale: [0.6, 1.2, 0.6],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.2,
                }}
              />
              <motion.div
                className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-600 shadow-[0_2px_8px_rgba(139,92,246,0.6)] dark:shadow-[0_2px_8px_rgba(139,92,246,0.8)]"
                animate={{
                  scale: [0.6, 1.2, 0.6],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
              />
            </div>
          </div>
        </motion.div>
      )
    }

    return null
  },
)

MessageItem.displayName = "MessageItem"

export function AIServiceMatchmaker() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [conversationStage, setConversationStage] = useState<
    "initial" | "understanding" | "service-specific" | "recommending" | "refining" | "finalizing"
  >("initial")
  const [showPortal, setShowPortal] = useState(false)
  const [detectedPreferences, setDetectedPreferences] = useState<{
    category: string | null
    timeframe: string | null
  }>({
    category: null,
    timeframe: null,
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const categoriesRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const isMountedRef = useRef(true)

  const [aiModel, setAIModel] = useState<AIModelState>(initialAIModel)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const addMessage = useCallback((message: Message) => {
    if (!isMountedRef.current) return
    setMessages((prev) => [...prev, message])
  }, [])

  const generateRecommendations = useCallback(() => {
    const scoredServices = services.map((service) => {
      let score = service.matchScore
      const factors: string[] = []

      if (detectedPreferences.timeframe === "ASAP") {
        if (service.provider.responseTime.includes("< 1 hour")) {
          score += 20
          factors.push("fastest response")
        } else if (service.provider.responseTime.includes("< 2 hour")) {
          score += 10
          factors.push("quick response")
        }
      }

      if (service.provider.rating >= 4.8) {
        score += 10
        factors.push("highly rated")
      }

      if (service.provider.verified) {
        score += 5
        factors.push("verified")
      }

      if (service.provider.completionRate >= 95) {
        score += 8
        factors.push("reliable completion")
      }

      if (aiModel.conversationContext.currentServiceType) {
        const serviceTypeMap: { [key: string]: string } = {
          tvMounting: "Mounting",
          furniture: "Assembly",
          painting: "Painting",
          plumbing: "Plumbing",
          moving: "Moving",
          cleaning: "Cleaning",
          electrical: "Electrical",
          landscaping: "Landscaping",
          flooring: "Flooring",
          roofing: "Roofing",
        }
        const expectedCategory = serviceTypeMap[aiModel.conversationContext.currentServiceType]
        if (service.category === expectedCategory) {
          score += 25
          factors.push("perfect category match")
        }
      }

      return {
        ...service,
        finalScore: score,
        matchReasons: factors,
      }
    })

    scoredServices.sort((a, b) => b.finalScore - a.finalScore)
    const topServices = scoredServices.slice(0, 3)

    let explanation = "Based on your detailed requirements"
    if (detectedPreferences.timeframe) {
      explanation = `Based on your ${detectedPreferences.timeframe} timeframe`
    }

    setIsTyping(true)
    const loadingMessage: Message = {
      id: `loading-${Date.now()}`,
      type: "loading",
      content: "",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, loadingMessage])

    setTimeout(() => {
      setMessages((prev) => prev.filter((msg) => msg.id !== loadingMessage.id))
      setIsTyping(false)

      const recommendationMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: `${explanation}, here are my top recommendations:`,
        timestamp: new Date(),
        services: topServices.map((s) => ({
          ...s,
          matchScore: Math.round(s.finalScore),
        })),
      }

      setMessages((prev) => [...prev, recommendationMessage])

      setTimeout(() => {
        const helpfulContext = topServices[0]
        const followUp: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: `My top pick is ${helpfulContext.provider.name} because of their ${helpfulContext.matchReasons.join(", ")}. Would you like me to explain more, or are you ready to book?`,
          timestamp: new Date(),
          options: ["Explain your choices", "Show more options", "Compare these three", "Book with top choice"],
        }
        setMessages((prev) => [...prev, followUp])
      }, 600)
    }, 1000)
  }, [detectedPreferences, aiModel.conversationContext])

  const getNextQuestionIndex = useCallback(
    (serviceType: string, currentIndex: number, currentAnswer: string, currentQuestion: string): number => {
      const questions = serviceSpecificQuestions[serviceType].questions
      const questionsToSkip = questionSkipLogic[serviceType]?.[currentQuestion]?.[currentAnswer] || new Set()

      let nextIndex = currentIndex + 1
      while (nextIndex < questions.length && questionsToSkip.has(questions[nextIndex])) {
        nextIndex++
      }

      return nextIndex
    },
    [],
  )

  const handleOptionSelect = useCallback(
    (option: string) => {
      if (!isMountedRef.current) return

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: "user",
        content: option,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])

      if (conversationStage === "service-specific") {
        const serviceType = aiModel.conversationContext.currentServiceType
        if (!serviceType) return

        const questionIndex = aiModel.conversationContext.currentServiceQuestion
        const questions = serviceSpecificQuestions[serviceType].questions
        const currentQuestion = questions[questionIndex]
        const nextQuestionIndex = getNextQuestionIndex(serviceType, questionIndex, option, currentQuestion)

        const updatedAnswers = new Map(aiModel.conversationContext.serviceSpecificAnswers)
        updatedAnswers.set(currentQuestion, option)

        setAIModel((prev) => ({
          ...prev,
          conversationContext: {
            ...prev.conversationContext,
            serviceSpecificAnswers: updatedAnswers,
            currentServiceQuestion: nextQuestionIndex,
          },
        }))

        if (nextQuestionIndex < questions.length) {
          const nextQuestion = questions[nextQuestionIndex]
          const options = serviceSpecificQuestions[serviceType].options[nextQuestion]

          setIsTyping(true)
          const loadingId = `loading-${Date.now()}`
          setMessages((prev) => [
            ...prev,
            {
              id: loadingId,
              type: "loading",
              content: "",
              timestamp: new Date(),
            },
          ])

          setTimeout(() => {
            if (!isMountedRef.current) return
            setMessages((prev) => {
              const filtered = prev.filter((msg) => msg.id !== loadingId)
              return [
                ...filtered,
                {
                  id: `ai-${Date.now()}`,
                  type: "ai",
                  content: nextQuestion,
                  timestamp: new Date(),
                  options: options,
                },
              ]
            })
            setIsTyping(false)
          }, 800)
        } else {
          setConversationStage("recommending")
          setTimeout(() => {
            if (isMountedRef.current) generateRecommendations()
          }, 500)
        }
        return
      }

      if (["ASAP", "This week", "Within 2 weeks", "I'm flexible with timing", "Unsure"].includes(option)) {
        setDetectedPreferences((prev) => ({ ...prev, timeframe: option }))
        setConversationStage("service-specific")

        const serviceType = aiModel.conversationContext.currentServiceType
        if (!serviceType) return

        const questions = serviceSpecificQuestions[serviceType].questions
        const currentQuestion = questions[0]
        const options = serviceSpecificQuestions[serviceType].options[currentQuestion]

        setIsTyping(true)
        const loadingId = `loading-${Date.now()}`
        setMessages((prev) => [
          ...prev,
          {
            id: loadingId,
            type: "loading",
            content: "",
            timestamp: new Date(),
          },
        ])

        setTimeout(() => {
          if (!isMountedRef.current) return
          setMessages((prev) => {
            const filtered = prev.filter((msg) => msg.id !== loadingId)
            return [
              ...filtered,
              {
                id: `ai-intro-${Date.now()}`,
                type: "ai",
                content: "Great! Now let me ask you some specific questions to match you with the perfect provider.",
                timestamp: new Date(),
              },
            ]
          })

          setTimeout(() => {
            if (!isMountedRef.current) return
            setMessages((prev) => [
              ...prev,
              {
                id: `ai-question-${Date.now()}`,
                type: "ai",
                content: currentQuestion,
                timestamp: new Date(),
                options: options,
              },
            ])
            setIsTyping(false)
          }, 400)
        }, 800)
        return
      }
    },
    [conversationStage, generateRecommendations, aiModel.conversationContext, getNextQuestionIndex],
  )

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      if (inputValue.trim() === "" && !e) return

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: "user",
        content: inputValue,
        timestamp: new Date(),
      }

      addMessage(userMessage)
      setInputValue("")
    },
    [inputValue, addMessage],
  )

  const handleCategoryClick = useCallback((serviceType: string) => {
    if (!isMountedRef.current) return

    setInputValue("")
    setIsTyping(false)
    setConversationStage("initial")
    setDetectedPreferences({ category: null, timeframe: null })
    setAIModel({
      conversationContext: {
        stage: "initial",
        currentServiceType: serviceType,
        serviceSpecificAnswers: new Map(),
        currentServiceQuestion: 0,
      },
    })

    const categoryNames: { [key: string]: string } = {
      tvMounting: "TV Mounting",
      furniture: "Furniture Assembly",
      painting: "Painting",
      plumbing: "Plumbing",
      moving: "Moving",
      cleaning: "Cleaning",
      electrical: "Electrical",
      landscaping: "Landscaping",
      flooring: "Flooring",
      roofing: "Roofing",
    }

    const loadingId = `loading-${Date.now()}`
    setMessages([
      {
        id: loadingId,
        type: "loading",
        content: "",
        timestamp: new Date(),
      },
    ])
    setIsTyping(true)

    setTimeout(() => {
      if (!isMountedRef.current) return
      setMessages([
        {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: `Great! I'll help you find the best ${categoryNames[serviceType] || serviceType} service. When would you like this service completed?`,
          timestamp: new Date(),
          options: ["ASAP", "This week", "Within 2 weeks", "I'm flexible with timing", "Unsure"],
        },
      ])
      setIsTyping(false)
    }, 800)
  }, [])

  const categories = useMemo(
    () => [
      { icon: Tv, name: "Mounting", serviceType: "tvMounting" },
      { icon: Briefcase, name: "Moving", serviceType: "moving" },
      { icon: Spray, name: "Painting", serviceType: "painting" },
      { icon: Home, name: "Assembly", serviceType: "furniture" },
      { icon: Scissors, name: "Cleaning", serviceType: "cleaning" },
      { icon: Zap, name: "Electrical", serviceType: "electrical" },
      { icon: Droplet, name: "Plumbing", serviceType: "plumbing" },
      { icon: Leaf, name: "Landscaping", serviceType: "landscaping" },
      { icon: Construction, name: "Flooring", serviceType: "flooring" },
      { icon: HardHat, name: "Roofing", serviceType: "roofing" },
    ],
    [],
  )

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <section className="w-full pb-8 md:pb-12 relative overflow-hidden order-first z-20 -mt-8">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white/90 to-violet-50/80 dark:from-gray-900/90 dark:via-gray-900/95 dark:to-indigo-950/80 z-0" />

      <div className="w-full relative z-10 overflow-x-hidden px-0 mx-0">
        <motion.div
          className="w-full mx-0 px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
            <div className="relative flex items-center justify-between p-5 bg-white dark:bg-gray-900 backdrop-blur-sm mb-0 mt-8">
              <div className="flex items-center">
                <LevlLogo className="h-16 w-16 transition-all shadow-[0_4px_8px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_8px_rgba(79,70,229,0.2),0_2px_4px_rgba(79,70,229,0.1)]" />
              </div>
              <div className="flex items-center gap-3">
                <Dialog open={showPortal} onOpenChange={setShowPortal}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-lavender-400 opacity-100 bg-transparent"
                    >
                      <Layout className="mr-2 h-4 w-4" />
                      Portal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
                    <DialogHeader className="sr-only">
                      <DialogTitle>LevL Portal</DialogTitle>
                    </DialogHeader>
                    <div className="w-full h-full overflow-hidden">
                      <LevlPortal />
                    </div>
                  </DialogContent>
                </Dialog>

                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-lavender-400 opacity-100"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-lavender-400"
                >
                  Profile
                </Link>
                <Link
                  href="/forum"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-lavender-400"
                >
                  Forum
                </Link>
              </div>
            </div>

            <div className="border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-gray-50/80 via-white/80 to-gray-50/80 dark:from-gray-900/80 dark:via-gray-900/90 dark:to-gray-900/80 mb-0 pb-0">
              <div className="relative w-full overflow-hidden">
                <div
                  className="overflow-x-auto py-2 pb-1 scrollbar-hide scroll-smooth mx-auto bg-white"
                  ref={categoriesRef}
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch",
                    scrollBehavior: "smooth",
                  }}
                >
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  <div className="flex space-x-4 snap-x snap-mandatory px-4 md:px-8 -ml-2 md:-ml-4 mr-4 md:mr-8">
                    {categories.map((category, index) => (
                      <EnhancedCategoryCard
                        key={index}
                        icon={category.icon}
                        name={category.name}
                        count={0}
                        index={index}
                        size="small"
                        className="w-36 h-32 my-2 mx-1 rounded-xl overflow-hidden transition-all duration-300 
bg-gradient-to-br from-white/95 via-white/90 to-indigo-50/90 dark:from-gray-800/95 dark:via-gray-800/90 dark:to-indigo-950/90 
backdrop-blur-sm 
shadow-[0_14px_20px_-3px_rgba(79,70,229,0.3),0_6px_10px_-4px_rgba(79,70,229,0.2),0_-2px_8px_0px_rgba(255,255,255,0.15)] 
dark:shadow-[0_10px_15px_-3px_rgba(79,70,229,0.3),0_4px_6px_-4px_rgba(0,0,0,0.4),0_-2px_6px_0px_rgba(79,70,229,0.1)] 
hover:shadow-[0_18px_25px_-5px_rgba(79,70,229,0.4),0_10px_15px_-5px_rgba(79,70,229,0.3),0_-2px_10px_0px_rgba(255,255,255,0.2)] 
dark:hover:shadow-[0_15px_20px_-3px_rgba(79,70,229,0.4),0_8px_12px_-4px_rgba(0,0,0,0.5),0_-2px_8px_0px_rgba(79,70,229,0.2)] 
border-t border-l border-r border-indigo-100/70 dark:border-t dark:border-l dark:border-r dark:border-indigo-700/40 
border-b-2 border-b-indigo-200/80 dark:border-b-2 dark:border-b-indigo-800/80 
translate-y-[-4px] hover:translate-y-[-8px]"
                        onClick={() => handleCategoryClick(category.serviceType)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              id="chat-container"
              ref={chatContainerRef}
              className="relative overflow-y-auto p-6 pb-16 min-h-[600px] bg-white dark:bg-gray-900 backdrop-blur-sm shadow-inner border-t border-indigo-100/20 dark:border-indigo-800/20 rounded-b-lg mt-0 pt-4"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(79, 70, 229, 0.2) transparent",
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 6px;
                  background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                  background: rgba(79, 70, 229, 0.2);
                  border-radius: 10px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: rgba(79, 70, 229, 0.4);
                }
              `}</style>
              <div className="space-y-6 w-full">
                <AnimatePresence initial={false}>
                  {(() => {
                    // Find the last AI message with options to mark as active
                    const lastAiWithOptionsIndex = messages.reduce((lastIdx, msg, idx) => 
                      msg.type === 'ai' && msg.options && msg.options.length > 0 ? idx : lastIdx, -1)
                    
                    return messages.map((message, idx) => (
                      <MessageItem
                        key={message.id}
                        message={message}
                        onOptionSelect={handleOptionSelect}
                        router={router}
                        isActiveOptions={idx === lastAiWithOptionsIndex}
                      />
                    ))
                  })()}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>

            <motion.div
              className="absolute bottom-0 left-0 right-0 z-10 p-4 
bg-gradient-to-b from-transparent via-gray-50/90 to-white/95
dark:from-transparent dark:via-gray-900/90 dark:to-gray-950/95
backdrop-blur-sm transition-all duration-200"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-4xl mx-auto">
                <div className="relative flex-1 border-none">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder={isTyping ? "AI is thinking..." : "Type your message..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isTyping}
                    className="pl-4 pr-12 py-6 bg-white/80 dark:bg-gray-800/80 border-0
      focus:ring-0 focus:outline-none focus:border-0
      rounded-full shadow-[0_4px_12px_rgba(79,70,229,0.15)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.2)]
      dark:shadow-[0_4px_12px_rgba(79,70,229,0.2)] dark:hover:shadow-[0_6px_16px_rgba(79,70,229,0.25)]
      transform hover:-translate-y-1 transition-all duration-300"
                  />

                  {inputValue && (
                    <button
                      type="button"
                      onClick={() => setInputValue("")}
                      className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Clear input"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
