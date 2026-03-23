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

// Visual guides for technical options - LevL themed animated previews
const optionVisualGuides: Set<string> = new Set([
  // Mount types
  "Fixed (flat against wall)",
  "Tilting (angle adjustment)",
  "Full-motion/Articulating (swivel and tilt)",
  "Ceiling mount",
  // Wall types
  "Drywall/Sheetrock",
  "Brick",
  "Concrete",
  "Wood/Plaster",
  "Stone",
  "Metal studs",
  // Cable management
  "Yes, hide all cables in wall",
  "Yes, use cable covers",
  "No, cables visible is fine",
  // Plumbing issues
  "Clogged drain",
  "Leaky pipe/faucet",
  "Water heater issue",
  "Toilet problem",
  // Paint finishes
  "Textured finish",
  "Faux finish",
  "High-gloss/specialty coating",
])

// Highly detailed animated visual preview component with LevL styling
const OptionVisualPreview = memo(function OptionVisualPreview({ option }: { option: string }) {
  if (!optionVisualGuides.has(option)) return null

  const getAnimation = () => {
    // ============ MOUNT TYPES ============
    if (option === "Fixed (flat against wall)") {
      return (
        <div className="relative w-full h-full bg-gradient-to-b from-lavender-100 to-lavender-200 overflow-hidden">
          {/* Room background with floor */}
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-amber-200 to-amber-100" />
          {/* Wall texture */}
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139,92,246,0.1) 2px, rgba(139,92,246,0.1) 4px)" }} />
          {/* Wall mount bracket */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-1 h-4 bg-gradient-to-b from-gray-400 to-gray-500 rounded-sm mx-auto shadow-sm" />
            {/* TV - sleek modern design */}
            <div className="relative -mt-0.5">
              <div className="w-14 h-9 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-sm shadow-lg border border-gray-700">
                {/* Screen reflection */}
                <div className="absolute inset-0.5 bg-gradient-to-br from-lavender-400/20 via-transparent to-transparent rounded-sm" />
                {/* Screen content shimmer */}
                <motion.div 
                  className="absolute inset-1 rounded-sm overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #8b5cf6 100%)" }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: [-60, 60] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>
              {/* TV stand indicator */}
              <div className="w-4 h-0.5 bg-gray-600 mx-auto mt-0.5 rounded-full" />
            </div>
          </div>
          {/* Static indicator arrows */}
          <div className="absolute top-2 right-2 flex flex-col items-center">
            <div className="w-0.5 h-2 bg-lavender-400/50 rounded-full" />
            <div className="w-1.5 h-1.5 border-l border-b border-lavender-400/50 rotate-[-45deg] -mt-0.5" />
          </div>
        </div>
      )
    }
    
    if (option === "Tilting (angle adjustment)") {
      return (
        <div className="relative w-full h-full bg-gradient-to-b from-lavender-100 to-lavender-200 overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-amber-200 to-amber-100" />
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(139,92,246,0.1) 2px, rgba(139,92,246,0.1) 4px)" }} />
          {/* Tilt mount bracket with hinge */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-3 bg-gradient-to-b from-gray-400 to-gray-500 rounded-sm mx-auto shadow-sm" />
            <div className="w-3 h-1 bg-gray-500 rounded-full mx-auto -mt-0.5 shadow-inner" /> {/* Hinge */}
            <motion.div 
              className="relative origin-top"
              animate={{ rotateX: [0, 20, 0, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-14 h-9 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-sm shadow-lg border border-gray-700 -mt-1">
                <div className="absolute inset-0.5 bg-gradient-to-br from-lavender-400/20 via-transparent to-transparent rounded-sm" />
                <motion.div 
                  className="absolute inset-1 rounded-sm overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #8b5cf6 100%)" }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: [-60, 60] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
          {/* Tilt motion indicator */}
          <motion.div 
            className="absolute top-3 right-2"
            animate={{ rotate: [0, 15, 0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 4v16M12 4l-4 4M12 4l4 4M12 20l-4-4M12 20l4-4" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.div>
        </div>
      )
    }
    
    if (option === "Full-motion/Articulating (swivel and tilt)") {
      return (
        <div className="relative w-full h-full bg-gradient-to-b from-lavender-100 to-lavender-200 overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-amber-200 to-amber-100" />
          {/* Wall on left side */}
          <div className="absolute left-0 top-0 bottom-3 w-3 bg-gradient-to-r from-lavender-300 to-lavender-200 shadow-inner" />
          {/* Articulating arm system */}
          <motion.div 
            className="absolute top-1/2 left-3 -translate-y-1/2 flex items-center"
            animate={{ 
              x: [0, 12, 12, 0],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Wall plate */}
            <div className="w-2 h-6 bg-gradient-to-r from-gray-500 to-gray-400 rounded-sm shadow-md" />
            {/* First arm segment */}
            <motion.div 
              className="flex items-center origin-left"
              animate={{ rotate: [0, 0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-6 h-1.5 bg-gradient-to-r from-gray-500 to-gray-400 rounded-full shadow-sm -ml-0.5" />
              {/* Joint */}
              <div className="w-2 h-2 bg-gray-500 rounded-full shadow-inner -ml-0.5" />
              {/* Second arm segment */}
              <motion.div 
                className="flex items-center origin-left"
                animate={{ rotate: [0, 0, 15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-5 h-1.5 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-sm -ml-0.5" />
                {/* TV */}
                <motion.div
                  className="origin-left"
                  animate={{ rotateY: [0, 0, -25, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-12 h-8 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-sm shadow-lg border border-gray-700 ml-0.5">
                    <div className="absolute inset-0.5 bg-gradient-to-br from-lavender-400/20 via-transparent to-transparent rounded-sm" />
                    <div className="absolute inset-1 rounded-sm bg-gradient-to-br from-lavender-500 to-indigo-500">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: [-50, 50] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
          {/* Motion arrows */}
          <motion.svg 
            className="absolute top-2 right-1" 
            width="14" height="14" 
            viewBox="0 0 24 24"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="none" stroke="#8b5cf6" strokeWidth="1"/>
            <path d="M12 8l4 4-4 4" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round"/>
          </motion.svg>
        </div>
      )
    }
    
    if (option === "Ceiling mount") {
      return (
        <div className="relative w-full h-full bg-gradient-to-b from-gray-200 to-lavender-100 overflow-hidden">
          {/* Ceiling with texture */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-300 to-gray-200 shadow-md">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 6px)" }} />
          </div>
          {/* Floor */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-amber-300 to-amber-200" />
          {/* Ceiling mount assembly */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
            {/* Ceiling plate */}
            <div className="w-4 h-1.5 bg-gradient-to-b from-gray-400 to-gray-500 rounded-b-sm shadow-md" />
            {/* Adjustable pole */}
            <motion.div
              className="flex flex-col items-center"
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-1.5 h-8 bg-gradient-to-b from-gray-500 via-gray-400 to-gray-500 rounded-full shadow-inner" />
              {/* Swivel joint */}
              <div className="w-3 h-2 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full -mt-0.5 shadow-md" />
              {/* TV */}
              <motion.div
                animate={{ rotateY: [0, 10, 0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-14 h-9 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-sm shadow-xl border border-gray-700 -mt-0.5">
                  <div className="absolute inset-0.5 bg-gradient-to-br from-lavender-400/20 via-transparent to-transparent rounded-sm" />
                  <div className="absolute inset-1 rounded-sm bg-gradient-to-br from-lavender-500 to-indigo-500">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: [-60, 60] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )
    }

    // ============ WALL TYPES ============
    if (option === "Drywall/Sheetrock") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Drywall cross-section view */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-white">
            {/* Paper facing texture */}
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='%23f5f5f5'/%3E%3Cpath d='M0 10h20M10 0v20' stroke='%23e5e5e5' stroke-width='0.5'/%3E%3C/svg%3E\")" }} />
          </div>
          {/* Exposed gypsum core */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-lg overflow-hidden shadow-inner border-2 border-gray-200"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100" />
            {/* Gypsum texture */}
            <div className="absolute inset-0 opacity-30">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-gray-300"
                  style={{ 
                    left: `${(i % 4) * 25 + 10}%`, 
                    top: `${Math.floor(i / 4) * 30 + 15}%`,
                  }}
                />
              ))}
            </div>
            {/* Paper layers on sides */}
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-amber-100 to-gray-100" />
            <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-l from-amber-100 to-gray-100" />
          </motion.div>
          {/* Stud indicator behind */}
          <motion.div 
            className="absolute left-2 top-2 bottom-2 w-2 rounded-sm bg-gradient-to-r from-amber-600 to-amber-500 shadow-md"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {/* Lavender accent corner */}
          <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-br from-lavender-300/50 to-transparent" />
        </div>
      )
    }
    
    if (option === "Brick") {
      return (
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-red-100 to-red-50">
          {/* Brick pattern - realistic with mortar */}
          <div className="absolute inset-0 p-0.5">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="flex gap-[2px] mb-[2px]" style={{ marginLeft: row % 2 === 1 ? "-8px" : "0" }}>
                {[0, 1, 2, 3].map((col) => (
                  <motion.div
                    key={col}
                    className="h-3 rounded-[1px] shadow-sm"
                    style={{
                      width: "16px",
                      background: `linear-gradient(135deg, 
                        ${["#c9553d", "#b84a35", "#d45a42", "#bf5240"][Math.floor(Math.random() * 4)]} 0%, 
                        ${["#a34332", "#8f3a2a", "#b84a35", "#9e4030"][Math.floor(Math.random() * 4)]} 100%)`,
                    }}
                    animate={{ 
                      boxShadow: [
                        "inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.1)",
                        "inset 1px 1px 3px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.15)",
                        "inset 1px 1px 2px rgba(255,255,255,0.2), inset -1px -1px 2px rgba(0,0,0,0.1)",
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: (row + col) * 0.1 }}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Mortar visible in gaps */}
          <div className="absolute inset-0 pointer-events-none opacity-60" style={{ background: "linear-gradient(to bottom, #d1d5db 0%, #9ca3af 100%)" }}>
            <div className="absolute inset-0" style={{ 
              maskImage: "repeating-linear-gradient(0deg, black 0px, black 2px, transparent 2px, transparent 14px), repeating-linear-gradient(90deg, black 0px, black 2px, transparent 2px, transparent 18px)",
              WebkitMaskImage: "repeating-linear-gradient(0deg, black 0px, black 2px, transparent 2px, transparent 14px), repeating-linear-gradient(90deg, black 0px, black 2px, transparent 2px, transparent 18px)"
            }} />
          </div>
          {/* Lavender highlight */}
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-tl from-lavender-400/30 to-transparent rounded-tl-full" />
        </div>
      )
    }
    
    if (option === "Concrete") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Concrete texture base */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600">
            {/* Aggregate texture - using dots pattern instead of filter */}
            <div className="absolute inset-0 opacity-30" style={{ 
              backgroundImage: `radial-gradient(circle at 20% 30%, rgba(180,180,180,0.4) 1px, transparent 1px),
                               radial-gradient(circle at 60% 20%, rgba(160,160,160,0.3) 1.5px, transparent 1.5px),
                               radial-gradient(circle at 80% 70%, rgba(170,170,170,0.35) 1px, transparent 1px),
                               radial-gradient(circle at 40% 80%, rgba(150,150,150,0.4) 2px, transparent 2px),
                               radial-gradient(circle at 10% 60%, rgba(190,190,190,0.3) 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }} />
            {/* Pebbles/aggregate */}
            {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-gray-400/60"
                style={{
                  width: `${2 + (i % 3)}px`,
                  height: `${2 + (i % 3)}px`,
                  left: `${(i * 17) % 90}%`,
                  top: `${(i * 23) % 90}%`,
                }}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
          {/* Surface imperfections */}
          <motion.div 
            className="absolute top-3 left-4 w-6 h-0.5 bg-gray-700/30 rounded-full"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-4 right-3 w-4 h-0.5 bg-gray-700/20 rounded-full rotate-45"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          />
          {/* Lavender overlay accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-lavender-400/10 to-transparent" />
        </div>
      )
    }
    
    if (option === "Wood/Plaster") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Split view - wood on left, plaster on right */}
          <div className="absolute inset-0 flex">
            {/* Wood grain side */}
            <div className="w-1/2 h-full bg-gradient-to-b from-amber-600 to-amber-700 relative overflow-hidden">
              {/* Wood grain lines */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-full w-[2px] rounded-full"
                  style={{
                    left: `${i * 14 + 5}%`,
                    background: `linear-gradient(to bottom, rgba(120,53,15,${0.2 + Math.random() * 0.3}) 0%, rgba(180,83,9,${0.1 + Math.random() * 0.2}) 50%, rgba(120,53,15,${0.2 + Math.random() * 0.3}) 100%)`,
                  }}
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
              {/* Knot */}
              <div className="absolute top-4 left-3 w-2 h-3 rounded-full bg-amber-900/50 shadow-inner" />
            </div>
            {/* Plaster side */}
            <div className="w-1/2 h-full bg-gradient-to-br from-gray-100 to-gray-200 relative">
              {/* Plaster texture */}
              <div className="absolute inset-0 opacity-30">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-gray-400/30"
                    style={{
                      width: `${Math.random() * 4 + 1}px`,
                      height: `${Math.random() * 4 + 1}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      borderRadius: "50%",
                    }}
                  />
                ))}
              </div>
              {/* Crack lines (old plaster characteristic) */}
              <motion.svg 
                className="absolute inset-0 w-full h-full" 
                viewBox="0 0 30 60"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <path d="M5 10 Q 10 20, 8 30 Q 12 40, 10 50" stroke="#9ca3af" strokeWidth="0.3" fill="none"/>
              </motion.svg>
            </div>
          </div>
          {/* Divider line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-lavender-400/50" />
        </div>
      )
    }
    
    if (option === "Stone") {
      return (
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-stone-300 to-stone-400">
          {/* Natural stone pattern using CSS shapes */}
          <div className="absolute inset-0">
            {/* Stone 1 - top left */}
            <motion.div 
              className="absolute top-1 left-1 w-7 h-6 rounded-[40%_60%_50%_50%] bg-gradient-to-br from-stone-400 to-stone-500 border border-stone-500/50"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Stone 2 - top right */}
            <motion.div 
              className="absolute top-1 right-1 w-6 h-7 rounded-[50%_40%_60%_50%] bg-gradient-to-br from-stone-300 to-stone-400 border border-stone-500/50"
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
            />
            {/* Stone 3 - bottom left */}
            <motion.div 
              className="absolute bottom-1 left-1 w-6 h-6 rounded-[60%_40%_50%_50%] bg-gradient-to-br from-amber-200/50 to-stone-400 border border-stone-500/50"
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: 0.6 }}
            />
            {/* Stone 4 - bottom right */}
            <motion.div 
              className="absolute bottom-1 right-1 w-7 h-6 rounded-[40%_50%_40%_60%] bg-gradient-to-br from-stone-350 to-stone-500 border border-stone-500/50"
              animate={{ opacity: [0.88, 1, 0.88] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.9 }}
            />
            {/* Center stone */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-[50%_50%_40%_60%] bg-gradient-to-br from-stone-300 to-stone-500 border border-stone-600/40"
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
            />
          </div>
          {/* Mortar lines */}
          <div className="absolute inset-0 opacity-40">
            <div className="absolute top-[45%] left-0 right-0 h-[2px] bg-stone-500/30" />
            <div className="absolute top-0 bottom-0 left-[45%] w-[2px] bg-stone-500/30" />
          </div>
          {/* Lavender shimmer */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-lavender-400/20 to-transparent"
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
      )
    }
    
    if (option === "Metal studs") {
      return (
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          {/* Metal C-channel studs */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute top-1 bottom-1 w-3 flex flex-col"
              style={{ left: `${i * 35 + 10}%` }}
              animate={{ 
                boxShadow: [
                  "0 0 3px rgba(148,163,184,0.5)",
                  "0 0 6px rgba(148,163,184,0.8)",
                  "0 0 3px rgba(148,163,184,0.5)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            >
              {/* C-channel shape */}
              <div className="h-full bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 rounded-sm relative">
                {/* Lip on left */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-500 rounded-l-sm" />
                {/* Lip on right */}
                <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-slate-500 rounded-r-sm" />
                {/* Punch-outs (holes) */}
                {[0, 1, 2].map((j) => (
                  <div
                    key={j}
                    className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1 rounded-sm bg-slate-200"
                    style={{ top: `${j * 35 + 15}%` }}
                  />
                ))}
                {/* Metallic reflection */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent rounded-sm"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                />
              </div>
            </motion.div>
          ))}
          {/* Lavender glow */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-lavender-300/30 to-transparent" />
        </div>
      )
    }

    // ============ CABLE MANAGEMENT ============
    if (option === "Yes, hide all cables in wall") {
      return (
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-lavender-100 to-lavender-50">
          {/* Wall with cutout */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-lavender-200 to-lavender-100">
            {/* In-wall cable path (hidden) */}
            <motion.div 
              className="absolute left-1/2 -translate-x-1/2 top-6 w-1 rounded-full bg-lavender-300/50"
              animate={{ height: [0, 26, 26], opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          {/* TV mounted on wall */}
          <div className="absolute top-2 left-4 w-12 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-sm shadow-lg border border-gray-700">
            <div className="absolute inset-1 rounded-sm bg-gradient-to-br from-lavender-500 to-indigo-500">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: [-50, 50] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
          {/* Low voltage plate behind TV */}
          <div className="absolute top-8 left-6 w-2 h-2 bg-white rounded-sm border border-gray-300 shadow-inner" />
          {/* Power outlet at bottom */}
          <div className="absolute bottom-2 left-5 w-3 h-4 bg-white rounded-sm border border-gray-300 shadow-md">
            <div className="flex flex-col items-center justify-center h-full gap-0.5">
              <div className="w-1 h-0.5 bg-gray-800 rounded-full" />
              <div className="w-1 h-0.5 bg-gray-800 rounded-full" />
            </div>
          </div>
          {/* Checkmark indicator */}
          <motion.div 
            className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>
      )
    }
    
    if (option === "Yes, use cable covers") {
      return (
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-lavender-100 to-lavender-50">
          {/* Wall */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-lavender-200 to-lavender-100" />
          {/* TV */}
          <div className="absolute top-2 left-4 w-12 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-sm shadow-lg border border-gray-700">
            <div className="absolute inset-1 rounded-sm bg-gradient-to-br from-lavender-500 to-indigo-500">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: [-50, 50] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
          {/* Cable cover channel */}
          <motion.div 
            className="absolute left-6 top-10 w-2 bg-white rounded-sm shadow-md border border-gray-200"
            initial={{ height: 0 }}
            animate={{ height: 24 }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
          >
            {/* Channel ridges */}
            <div className="absolute inset-x-0 top-1 h-px bg-gray-200" />
            <div className="absolute inset-x-0 top-3 h-px bg-gray-200" />
            <div className="absolute inset-x-0 top-5 h-px bg-gray-200" />
          </motion.div>
          {/* Cable inside cover (visible moving) */}
          <motion.div 
            className="absolute left-[26px] top-10 w-0.5 bg-gray-800 rounded-full"
            initial={{ height: 0 }}
            animate={{ height: 22 }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.3, delay: 0.3 }}
          />
          {/* Outlet */}
          <div className="absolute bottom-2 left-5 w-3 h-4 bg-white rounded-sm border border-gray-300 shadow-md">
            <div className="flex flex-col items-center justify-center h-full gap-0.5">
              <div className="w-1 h-0.5 bg-gray-800 rounded-full" />
              <div className="w-1 h-0.5 bg-gray-800 rounded-full" />
            </div>
          </div>
        </div>
      )
    }
    
    if (option === "No, cables visible is fine") {
      return (
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-lavender-100 to-lavender-50">
          {/* Wall */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-lavender-200 to-lavender-100" />
          {/* TV */}
          <div className="absolute top-2 left-4 w-12 h-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-sm shadow-lg border border-gray-700">
            <div className="absolute inset-1 rounded-sm bg-gradient-to-br from-lavender-500 to-indigo-500">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: [-50, 50] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
          {/* Visible hanging cables */}
          <motion.svg 
            className="absolute left-7 top-9" 
            width="20" 
            height="30" 
            viewBox="0 0 20 30"
          >
            {/* Multiple cables hanging */}
            <motion.path 
              d="M2 0 Q 0 8, 3 15 Q 6 22, 2 28" 
              stroke="#1f2937" 
              strokeWidth="1.5" 
              fill="none"
              strokeLinecap="round"
              animate={{ d: ["M2 0 Q 0 8, 3 15 Q 6 22, 2 28", "M2 0 Q 4 8, 1 15 Q -2 22, 2 28", "M2 0 Q 0 8, 3 15 Q 6 22, 2 28"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path 
              d="M6 0 Q 8 10, 5 18 Q 2 26, 6 28" 
              stroke="#374151" 
              strokeWidth="1" 
              fill="none"
              strokeLinecap="round"
              animate={{ d: ["M6 0 Q 8 10, 5 18 Q 2 26, 6 28", "M6 0 Q 4 10, 7 18 Q 10 26, 6 28", "M6 0 Q 8 10, 5 18 Q 2 26, 6 28"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
          </motion.svg>
          {/* Outlet */}
          <div className="absolute bottom-2 left-5 w-3 h-4 bg-white rounded-sm border border-gray-300 shadow-md">
            <div className="flex flex-col items-center justify-center h-full gap-0.5">
              <div className="w-1 h-0.5 bg-gray-800 rounded-full" />
              <div className="w-1 h-0.5 bg-gray-800 rounded-full" />
            </div>
          </div>
        </div>
      )
    }

    // ============ PLUMBING ISSUES ============
    if (option === "Clogged drain") {
      return (
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200">
          {/* Sink basin */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-8 bg-white rounded-b-lg shadow-inner border border-gray-200">
            {/* Accumulated water */}
            <motion.div 
              className="absolute bottom-0 left-1 right-1 rounded-b-lg bg-gradient-to-t from-blue-400/60 to-blue-300/40"
              animate={{ height: [4, 10, 4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Water surface shimmer */}
            <motion.div 
              className="absolute bottom-0 left-1 right-1 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
              animate={{ opacity: [0.3, 0.6, 0.3], y: [0, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          {/* Drain hole */}
          <div className="absolute top-9 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-700 rounded-full shadow-inner">
            <div className="absolute inset-0.5 bg-gray-800 rounded-full" />
          </div>
          {/* Pipe below */}
          <div className="absolute top-11 left-1/2 -translate-x-1/2 w-4 h-10 bg-gradient-to-b from-gray-400 to-gray-500 rounded-b-lg">
            {/* Clog blockage */}
            <motion.div 
              className="absolute top-2 left-0.5 right-0.5 h-3 bg-gradient-to-b from-amber-600 to-amber-700 rounded-sm"
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
          {/* Warning indicator */}
          <motion.div 
            className="absolute top-1 right-1 text-amber-500"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22h20L12 2zm0 4l7.5 14h-15L12 6zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
            </svg>
          </motion.div>
        </div>
      )
    }
    
    if (option === "Leaky pipe/faucet") {
      return (
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200">
          {/* Faucet */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2">
            {/* Faucet body */}
            <div className="w-6 h-4 bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-lg relative">
              {/* Chrome shine */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent rounded-t-lg" />
              {/* Handle */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2 bg-gradient-to-b from-gray-400 to-gray-500 rounded-t-md" />
            </div>
            {/* Spout */}
            <div className="w-2 h-6 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 mx-auto rounded-b-lg relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent rounded-b-lg" />
            </div>
          </div>
          {/* Water drops falling */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: "40%" }}
              initial={{ y: 0, opacity: 1, scale: 1 }}
              animate={{ 
                y: [0, 25],
                opacity: [1, 0.8, 0],
                scale: [1, 1.2, 0.8],
              }}
              transition={{ 
                duration: 0.7, 
                repeat: Infinity, 
                delay: i * 0.25,
                ease: "easeIn"
              }}
            >
              <div className="w-2 h-2.5 bg-gradient-to-b from-blue-300 to-blue-500 rounded-full shadow-sm">
                <div className="absolute top-0 left-0.5 w-1 h-1 bg-white/50 rounded-full" />
              </div>
            </motion.div>
          ))}
          {/* Puddle at bottom */}
          <motion.div 
            className="absolute bottom-2 left-1/2 -translate-x-1/2 h-2 bg-gradient-to-t from-blue-400/50 to-blue-300/30 rounded-full"
            animate={{ width: [20, 28, 20] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      )
    }
    
    if (option === "Water heater issue") {
      return (
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200">
          {/* Water heater tank */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-16 bg-gradient-to-b from-gray-200 via-white to-gray-200 rounded-lg shadow-md border border-gray-300">
            {/* Tank body details */}
            <div className="absolute top-1 left-1 right-1 h-3 bg-gray-300/50 rounded-t-md" />
            {/* Pipes on top */}
            <div className="absolute -top-2 left-2 w-1.5 h-3 bg-gradient-to-b from-gray-400 to-gray-500 rounded-t-sm" />
            <div className="absolute -top-2 right-2 w-1.5 h-3 bg-gradient-to-b from-gray-400 to-gray-500 rounded-t-sm" />
            {/* Temperature gauge */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full border-2 border-gray-300 shadow-inner">
              <motion.div 
                className="absolute top-1/2 left-1/2 w-3 h-0.5 origin-left rounded-full"
                style={{ background: "linear-gradient(90deg, #ef4444 0%, #f97316 50%, #3b82f6 100%)" }}
                animate={{ rotate: [-30, 30, -30] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Gauge markings */}
              <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-gray-400" />
              <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-gray-400" />
            </div>
            {/* Heating indicator */}
            <motion.div 
              className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full"
              animate={{ 
                backgroundColor: ["#3b82f6", "#f97316", "#ef4444", "#f97316", "#3b82f6"],
                boxShadow: ["0 0 4px #3b82f6", "0 0 8px #f97316", "0 0 12px #ef4444", "0 0 8px #f97316", "0 0 4px #3b82f6"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </div>
      )
    }
    
    if (option === "Toilet problem") {
      return (
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200">
          {/* Toilet side view */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            {/* Tank */}
            <div className="w-8 h-10 bg-gradient-to-b from-white to-gray-100 rounded-t-lg border border-gray-200 shadow-md relative -mb-1">
              {/* Tank lid */}
              <div className="absolute -top-1 left-0 right-0 h-2 bg-gradient-to-b from-gray-200 to-white rounded-t-lg" />
              {/* Flush handle */}
              <div className="absolute top-3 -left-1 w-2 h-1 bg-gray-400 rounded-full" />
              {/* Water in tank */}
              <motion.div 
                className="absolute bottom-1 left-1 right-1 bg-gradient-to-t from-blue-400/50 to-blue-300/30 rounded-b"
                animate={{ height: [16, 8, 16] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              {/* Running water indicator */}
              <motion.div 
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <div className="w-full h-2 bg-blue-400/60 rounded-full" />
              </motion.div>
            </div>
            {/* Bowl */}
            <div className="w-10 h-6 bg-gradient-to-b from-white to-gray-100 rounded-b-[50%] border border-gray-200 shadow-md mx-auto" />
          </div>
          {/* Problem indicator */}
          <motion.div 
            className="absolute top-1 right-1"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
          </motion.div>
        </div>
      )
    }

    // ============ PAINT FINISHES ============
    if (option === "Textured finish") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Textured wall surface */}
          <div className="absolute inset-0 bg-gradient-to-br from-lavender-100 to-lavender-200">
            {/* Knockdown/orange peel texture */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 60 60">
              {[...Array(25)].map((_, i) => (
                <motion.ellipse
                  key={i}
                  cx={5 + (i % 5) * 12}
                  cy={5 + Math.floor(i / 5) * 12}
                  rx={3 + Math.random() * 2}
                  ry={2 + Math.random() * 2}
                  fill={`rgba(139, 92, 246, ${0.1 + Math.random() * 0.15})`}
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.05 }}
                />
              ))}
            </svg>
            {/* Light reflection showing texture depth */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent"
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
        </div>
      )
    }
    
    if (option === "Faux finish") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* Marble faux finish */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-lavender-50 to-gray-200">
            {/* Marble veins */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 60 60">
              <motion.path
                d="M0 20 Q 15 15, 30 25 Q 45 35, 60 20"
                stroke="rgba(139, 92, 246, 0.3)"
                strokeWidth="1"
                fill="none"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.path
                d="M0 40 Q 20 50, 40 35 Q 55 25, 60 45"
                stroke="rgba(107, 114, 128, 0.2)"
                strokeWidth="0.5"
                fill="none"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              />
              <motion.path
                d="M10 0 Q 25 20, 15 40 Q 5 55, 20 60"
                stroke="rgba(139, 92, 246, 0.2)"
                strokeWidth="0.8"
                fill="none"
                animate={{ opacity: [0.25, 0.45, 0.25] }}
                transition={{ duration: 2.8, repeat: Infinity, delay: 1 }}
              />
            </svg>
            {/* Shimmer effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: [-60, 60] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      )
    }
    
    if (option === "High-gloss/specialty coating") {
      return (
        <div className="relative w-full h-full overflow-hidden">
          {/* High gloss surface */}
          <div className="absolute inset-0 bg-gradient-to-br from-lavender-400 via-lavender-500 to-indigo-500">
            {/* Mirror-like reflection */}
            <motion.div 
              className="absolute inset-0"
              animate={{ 
                background: [
                  "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)",
                  "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.3) 100%)",
                  "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Bright shine streak */}
            <motion.div 
              className="absolute top-0 w-8 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12"
              animate={{ left: ["-20%", "120%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            />
            {/* Secondary reflection */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/20 to-transparent" />
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-lavender-50 to-white shadow-lg border border-lavender-200/50 overflow-hidden mb-2">
      {getAnimation()}
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
        "Wood/Plaster",
        "Stone",
        "Metal studs",
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
        "Let professional recommend",
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
  }: {
    message: Message
    onOptionSelect: (option: string) => void
    router: ReturnType<typeof useRouter>
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
                    {message.options.map((option, index) => (
                      <motion.button
                        key={`${message.id}-${option}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        className="flex flex-col items-center p-2 bg-white/90 dark:bg-gray-800/90 hover:bg-lavender-100/90 dark:hover:bg-lavender-900/30 rounded-xl text-xs font-medium transition-all duration-200 border border-lavender-200/70 dark:border-lavender-700/50 hover:border-lavender-400 dark:hover:border-lavender-500/70 backdrop-blur-sm hover:shadow-lg hover:scale-[1.02]"
                        onClick={() => handleOptionClick(option)}
                      >
                        <OptionVisualPreview option={option} />
                        <span className="text-center leading-tight mt-1">{option}</span>
                      </motion.button>
                    ))}
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
                <AnimatePresence mode="popLayout" initial={false}>
                  {messages.map((message) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      onOptionSelect={handleOptionSelect}
                      router={router}
                    />
                  ))}
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
