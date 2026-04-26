"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { EnhancedCategoryCard } from "@/components/enhanced-category-card"
import {
  Truck,
  Tv,
  Droplet,
  SprayCan as Spray,
  Wrench,
  Zap,
  Sparkles,
  Leaf,
  Layers,
  HardHat,
  ChevronLeft,
} from "lucide-react"
import { LevlLogo } from "@/components/levl-logo"

import { motion, AnimatePresence } from "framer-motion"

import { ProviderCard } from "@/components/ai-matchmaker/provider-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Option3DPreview, THREE_D_OPTIONS } from "@/components/ai-matchmaker/option-3d-preview"
import dynamic from "next/dynamic"

// Static render images for mount object option cards
const MOUNT_RENDERS: Record<string, string> = {
  "TV/Monitor":        "/assets/renders/tv-monitor.png",
  "Art/Picture Frame": "/assets/renders/art-frame.png",
  "Floating Shelves":  "/assets/renders/floating-shelves.png",
  "Light Fixture":     "/assets/renders/light-fixture.png",
}
function isMountOption(opt: string): boolean {
  return opt in MOUNT_RENDERS || opt === "Mirror"
}

// Static Blender renders for mount TYPE option cards (Fixed/Tilting/etc.)
const MOUNT_TYPE_RENDERS: Record<string, string> = {
  "Fixed (flat against wall)":                   "/assets/renders/mount-fixed.png",
  "Tilting (angle adjustment)":                  "/assets/renders/mount-tilting.png",
  "Full-motion/Articulating (swivel and tilt)":  "/assets/renders/mount-fullmotion.png",
  "Ceiling mount":                               "/assets/renders/mount-ceiling.png",
}
const MOUNT_TYPE_VIDEOS: Record<string, string> = {
  "Tilting (angle adjustment)":                  "/assets/renders/mount-tilting.webm",
  "Full-motion/Articulating (swivel and tilt)":  "/assets/renders/mount-fullmotion.webm",
}
function isMountTypeRender(opt: string): boolean {
  return opt in MOUNT_TYPE_RENDERS
}

// Static Blender renders for wall type cards (replaces WebGL WallTexScene)
const WALL_RENDERS: Record<string, string> = {
  "Drywall/Sheetrock": "/assets/renders/wall-drywall.png",
  "Brick":             "/assets/renders/wall-brick.png",
  "Concrete":          "/assets/renders/wall-concrete.png",
  "Plaster":           "/assets/renders/wall-plaster.png",
  "Stone":             "/assets/renders/wall-stone.png",
}
function isWallRender(opt: string): boolean {
  return opt in WALL_RENDERS
}

// Maps non-TV mount answers to their own service sub-type
const MOUNT_OBJECT_SERVICE_MAP: Record<string, string> = {
  "Art/Picture Frame": "artMounting",
  "Floating Shelves":  "shelvesMounting",
  "Mirror":            "mirrorMounting",
  "Light Fixture":     "lightFixtureMounting",
}

// Static Blender renders for cable management cards (replaces WebGL cable scenes)
const CABLE_RENDERS: Record<string, string> = {
  "Yes, hide all cables in wall": "/assets/renders/cable-hidden.png",
  "Yes, use cable covers":        "/assets/renders/cable-covers.png",
  "No, cables visible is fine":   "/assets/renders/cable-visible.png",
}
function isCableRender(opt: string): boolean {
  return opt in CABLE_RENDERS
}

// Tip text shown overlaid on the lavender canvas for specific wall types
const WALL_TIPS: Record<string, string> = {
  "Drywall/Sheetrock": "Tip: sounds hollow when you knock",
  "Plaster": "Tip: dense feeling when knocking",
  "Brick": "Tip: needs masonry bit + anchors",
  "Concrete": "Tip: needs hammer drill",
  "Stone": "Tip: needs masonry anchors",
  "Metal studs": "Tip: use toggle bolts",
}

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
      "What type of TV mount do you have/need?",
      "Do you need cable management (hiding cables in the wall)?",
      "Will you have a soundbar or other accessories to mount/attach with the TV?",
    ],
    options: {
      "What would you like to mount?": [
        "TV/Monitor",
        "Art/Picture Frame",
        "Floating Shelves",
        "Mirror",
        "Light Fixture",
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
    "Plaster",
    "Brick",
    "Concrete",
    "Stone",
    "Unsure",
  ],
      "Do you already have a wall mount, or do you need one included?": [
        "I have a mount",
        "I need a mount included",
        "I need help choosing a mount",
        "Unsure",
      ],
"What type of TV mount do you have/need?": [
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
    },
    required: [true, true, true, false, false, false],
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
    required: [true, true, false, false, false, false, false],
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
  // ── Non-TV mount sub-paths ─────────────────────────────────────────────────
  artMounting: {
    questions: [
      "What type of wall do you have?",
      "How many pieces need to be hung?",
      "What is the approximate size of each piece?",
      "Do you need precise alignment or gallery-wall arrangement?",
      "Is there any special requirement for the hanging?",
    ],
    options: {
      "What type of wall do you have?": [
        "Drywall/Sheetrock",
        "Plaster",
        "Brick",
        "Concrete",
        "Stone",
        "Unsure",
      ],
      "How many pieces need to be hung?": [
        "1 piece",
        "2–4 pieces",
        "5–10 pieces",
        "More than 10 pieces",
        "Unsure",
      ],
      "What is the approximate size of each piece?": [
        "Small (under 24 inches)",
        "Medium (24–48 inches)",
        "Large (48–72 inches)",
        "Extra large (over 72 inches)",
        "Mixed sizes",
        "Unsure",
      ],
      "Do you need precise alignment or gallery-wall arrangement?": [
        "Yes, precise gallery-style layout",
        "Yes, just level and centered",
        "No, casual placement is fine",
        "Unsure",
      ],
      "Is there any special requirement for the hanging?": [
        "Heavy piece (over 50 lbs)",
        "Valuable/fragile artwork",
        "Canvas/no frame",
        "No special requirements",
        "Unsure",
      ],
    },
    required: [true, true, false, false, false],
  },
  shelvesMounting: {
    questions: [
      "What type of wall do you have?",
      "How many shelves need to be installed?",
      "What is the approximate load per shelf?",
      "Are the shelves floating (no visible brackets)?",
      "Do you already have the shelves, or need help sourcing them?",
    ],
    options: {
      "What type of wall do you have?": [
        "Drywall/Sheetrock",
        "Plaster",
        "Brick",
        "Concrete",
        "Stone",
        "Unsure",
      ],
      "How many shelves need to be installed?": [
        "1 shelf",
        "2–3 shelves",
        "4–6 shelves",
        "More than 6 shelves",
        "Unsure",
      ],
      "What is the approximate load per shelf?": [
        "Light — books, décor (under 20 lbs)",
        "Medium — small appliances (20–50 lbs)",
        "Heavy — storage, equipment (50+ lbs)",
        "Unsure",
      ],
      "Are the shelves floating (no visible brackets)?": [
        "Yes, floating/invisible brackets",
        "No, standard bracket-mounted",
        "Unsure",
      ],
      "Do you already have the shelves, or need help sourcing them?": [
        "I have the shelves ready",
        "I need help choosing/sourcing shelves",
        "Unsure",
      ],
    },
    required: [true, true, false, false, false],
  },
  mirrorMounting: {
    questions: [
      "What type of wall do you have?",
      "How large is the mirror?",
      "What type of mirror is it?",
      "Does the mirror already have hanging hardware?",
    ],
    options: {
      "What type of wall do you have?": [
        "Drywall/Sheetrock",
        "Plaster",
        "Brick",
        "Concrete",
        "Stone",
        "Unsure",
      ],
      "How large is the mirror?": [
        "Small (under 24 inches)",
        "Medium (24–48 inches)",
        "Large (48–72 inches)",
        "Extra large/Full-length (over 72 inches)",
        "Unsure",
      ],
      "What type of mirror is it?": [
        "Decorative/framed mirror",
        "Full-length mirror",
        "Bathroom vanity mirror",
        "Frameless/beveled mirror",
        "Antique/heavy mirror",
        "Unsure",
      ],
      "Does the mirror already have hanging hardware?": [
        "Yes, has hooks/wire",
        "No, needs hardware added",
        "Unsure",
      ],
    },
    required: [true, true, false, false],
  },
  lightFixtureMounting: {
    questions: [
      "What type of light fixture needs to be installed?",
      "Where is the fixture being installed?",
      "Is there existing wiring at the installation point?",
      "What type of ceiling or wall surface is it?",
      "Do you need any additional electrical work alongside this?",
    ],
    options: {
      "What type of light fixture needs to be installed?": [
        "Ceiling light/flush mount",
        "Chandelier/pendant light",
        "Wall sconce",
        "Recessed/can lights",
        "Track lighting",
        "Outdoor light",
        "Unsure",
      ],
      "Where is the fixture being installed?": [
        "Living room",
        "Bedroom",
        "Kitchen",
        "Bathroom",
        "Dining room",
        "Hallway/Entryway",
        "Outdoor/Exterior",
        "Unsure",
      ],
      "Is there existing wiring at the installation point?": [
        "Yes, replacing an existing fixture",
        "Existing wiring but no fixture",
        "No wiring — new installation",
        "Unsure",
      ],
      "What type of ceiling or wall surface is it?": [
        "Drywall/Sheetrock",
        "Plaster",
        "Concrete/Masonry",
        "Vaulted/Angled ceiling",
        "High ceiling (10 ft+)",
        "Unsure",
      ],
      "Do you need any additional electrical work alongside this?": [
        "Yes, need a new circuit or outlet",
        "Yes, dimmer switch installation",
        "No, just the fixture installation",
        "Unsure",
      ],
    },
    required: [true, true, true, false, false],
  },
}

const questionSkipLogic: {
  [serviceType: string]: {
    [question: string]: {
      [answer: string]: Set<string>
    }
  }
} = {
  tvMounting: {
    "What would you like to mount?": {
      // Non-TV paths are handled by service-type switching — these are fallbacks for "Other"
      "Other": new Set([
        "What size is your TV?",
        "What type of TV mount do you have/need?",
        "Will you have a soundbar or other accessories to mount/attach with the TV?",
      ]),
    },
    // "I have a mount" no longer skips mount-type — we still need to know which type they have
  },
  painting: {
    "Do you have a color scheme in mind?": {
      "Yes, I know exact colors": new Set(["Do you need help with color selection?"]),
    },
    "What is the current wall condition?": {
      "Good condition": new Set(["Do walls need repair before painting?"]),
    },
    "Do you need interior or exterior painting?": {
      "Interior only": new Set([]),
      "Exterior only": new Set(["What is the current wall condition?", "Do walls need repair before painting?"]),
    },
  },
  plumbing: {
    "Is there active water leakage?": {
      "No active leak": new Set(["Do you need emergency shutoff assistance?"]),
      "Water shut off": new Set(["Do you need emergency shutoff assistance?"]),
    },
    "What type of plumbing issue are you experiencing?": {
      "Installation of new fixture": new Set(["Is there active water leakage?", "Have you tried any DIY fixes already?"]),
    },
  },
  moving: {
    "What type of move are you planning?": {
      "Single item/Partial": new Set(["How many rooms need to be moved?", "Do you need storage services?"]),
      "Storage unit": new Set(["How many rooms need to be moved?"]),
    },
    "What is the distance of your move?": {
      "Same building": new Set([]),
    },
    "Do you have any large or specialty items?": {
      "No specialty items": new Set([]),
    },
  },
  cleaning: {
    "What type of cleaning service do you need?": {
      "One-time deep clean": new Set(["How often do you need cleaning?"]),
      "Move-in/Move-out": new Set(["How often do you need cleaning?"]),
      "Post-construction": new Set(["How often do you need cleaning?"]),
      "Post-renovation": new Set(["How often do you need cleaning?"]),
      "Event cleanup": new Set(["How often do you need cleaning?"]),
      "Office cleaning": new Set(["Do you have any pets?"]),
    },
    "Do you need cleaning supplies provided?": {
      "I have all supplies": new Set(["Any allergies or product preferences?"]),
    },
  },
  electrical: {
    "What type of electrical work do you need?": {
      "Safety inspection": new Set(["Is this a repair or new installation?", "Has this issue occurred before?"]),
      "Troubleshooting/Diagnosis": new Set(["Is this a repair or new installation?"]),
    },
    "How urgent is this electrical work?": {
      "Emergency (safety hazard)": new Set(["Do you need a permit for this work?"]),
    },
    "Is the property residential or commercial?": {
      "Residential": new Set([]),
    },
    "Has this issue occurred before?": {
      "No, first time": new Set([]),
    },
  },
  landscaping: {
    "What type of landscaping service do you need?": {
      "Lawn maintenance": new Set([
        "Are there any specific features you want to include?",
        "Do you need irrigation or drainage work?",
      ]),
      "Landscape cleanup": new Set([
        "Are there any specific features you want to include?",
        "Do you need irrigation or drainage work?",
      ]),
      "Tree service/trimming": new Set([
        "Are there any specific features you want to include?",
        "Do you need irrigation or drainage work?",
      ]),
    },
    "Do you need regular maintenance or a one-time service?": {
      "One-time project": new Set(["When would you like the work to be completed?"]),
    },
    "Are there any specific features you want to include?": {
      "None/Unsure": new Set(["Do you need irrigation or drainage work?"]),
    },
  },
  furniture: {
    "What type of furniture needs assembly?": {
      "1 piece (already answered)": new Set([]),
    },
    "Are the assembly instructions available?": {
      "Yes, have instructions": new Set([]),
    },
    "Is the furniture already delivered to your location?": {
      "Yes, at location": new Set([]),
    },
  },
  flooring: {
    "What type of flooring project do you need?": {
      "Repair": new Set(["Do you need removal of existing flooring?"]),
      "Cleaning/Maintenance": new Set([
        "What type of flooring material are you interested in?",
        "Do you need removal of existing flooring?",
        "What is the subfloor condition?",
      ]),
      "Refinishing": new Set(["Do you need removal of existing flooring?"]),
    },
    "Is this for a residential or commercial property?": {
      "Residential": new Set([]),
    },
  },
  roofing: {
    "What type of roofing service do you need?": {
      "Inspection only": new Set([
        "Have you noticed any leaks or damage?",
        "Do you need emergency services?",
      ]),
      "Emergency leak repair": new Set(["What is your timeline for this project?"]),
    },
    "Have you noticed any leaks or damage?": {
      "No visible issues": new Set(["Do you need emergency services?"]),
    },
    "Do you need emergency services?": {
      "No, can wait": new Set([]),
    },
  },
  lightFixtureMounting: {
    "Is there existing wiring at the installation point?": {
      "Yes, replacing an existing fixture": new Set(["Do you need any additional electrical work alongside this?"]),
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
          <div className="relative bg-gradient-to-br from-[#ede8ff] via-[#e0d8ff] to-[#d4ccff] dark:from-lavender-950 dark:via-lavender-950 dark:to-lavender-950 rounded-3xl px-5 py-3 max-w-[80%] shadow-[0_0_0_1px_rgba(88,82,100,0.10),0_16px_16px_rgba(68,62,86,0.22),0_28px_20px_rgba(64,58,82,0.10),0_-1px_0_rgba(255,255,255,0.65)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_16px_16px_rgba(0,0,0,0.34),0_28px_20px_rgba(0,0,0,0.16),0_-1px_0_rgba(255,255,255,0.07)] translate-y-[-14px] hover:translate-y-[-20px] transition-all duration-300 transform">
            <p className="text-sm text-gray-800 dark:text-gray-100 relative z-10">{message.content}</p>
          </div>
        </motion.div>
      )
    }

    if (message.type === "ai") {
      return (
        <motion.div
          className="flex flex-col items-start w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          layout={false}
        >
          <div className={`relative bg-gradient-to-br from-white via-[#fefeff] to-[#fbf9ff] dark:from-gray-800 dark:via-gray-800 dark:to-lavender-950 rounded-3xl px-5 py-3 ${(message.options?.some(o => isMountOption(o) || isMountTypeRender(o)) || message.content === "What size is your TV?") ? 'w-full' : message.options?.some(o => isWallRender(o)) ? 'max-w-[92%]' : 'max-w-[80%]'} shadow-[0_0_0_1px_rgba(88,82,100,0.09),0_16px_16px_rgba(64,58,84,0.20),0_28px_20px_rgba(60,54,80,0.09),0_-1px_0_rgba(255,255,255,0.88)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_16px_16px_rgba(0,0,0,0.32),0_28px_20px_rgba(0,0,0,0.14),0_-1px_0_rgba(255,255,255,0.05)] translate-y-[-14px] transition-all duration-300 transform`}>
            <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-3xl bg-gradient-to-t from-black/5 to-transparent dark:from-white/5"></div>

            <p className="text-sm relative z-10">
              {message.content.split(/(\*[^*]+\*)/).map((part, i) =>
                part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
                  <span
                    key={i}
                    className="italic inline-block bg-lavender-100 dark:bg-lavender-900/40 text-lavender-800 dark:text-lavender-200 rounded-md px-2 py-1 my-1"
                  >
                    {part.slice(1, -1)}
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </p>

            {message.options && (
              <div className="mt-4 relative z-10">
                {/* Check if any options have 3D previews */}
                {message.options.some(opt => THREE_D_OPTIONS.has(opt)) ? (
                  // No translateZ/backfaceVisibility here — those fight the Canvas WebGL layer
                  <div className="flex flex-col gap-2">
                    {/* cards — 2 columns mobile, 3 on md+ */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                      {message.options.filter(opt => THREE_D_OPTIONS.has(opt)).map((option, index) => (
                <motion.button
                  key={`${message.id}-${option}-${index}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 20 }}
                  className="group relative flex flex-col items-center
                    bg-gradient-to-b from-white/95 to-white/80 dark:from-gray-800/95 dark:to-gray-900/80
                    rounded-2xl text-xs font-semibold
                    shadow-[0_2px_6px_rgba(44,38,80,0.07),0_8px_24px_rgba(44,38,80,0.06),0_20px_48px_rgba(38,32,72,0.05),0_36px_72px_rgba(30,26,64,0.03)]
                    dark:shadow-[0_2px_6px_rgba(0,0,0,0.24),0_8px_24px_rgba(0,0,0,0.18),0_20px_48px_rgba(0,0,0,0.12),0_36px_72px_rgba(0,0,0,0.07)]
                    backdrop-blur-md"
                  onClick={() => handleOptionClick(option)}
                >
                  <div className="w-full aspect-[8/13] relative overflow-hidden">
                    {isMountTypeRender(option) ? (
                      <div className="w-full h-full relative" style={{ background: 'linear-gradient(180deg, #1e1530 0%, #2d2050 45%, #3a2d5c 100%)' }}>
                        {MOUNT_TYPE_VIDEOS[option] ? (
                          <video
                            src={MOUNT_TYPE_VIDEOS[option]}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-contain p-2"
                          />
                        ) : (
                          <Image
                            src={MOUNT_TYPE_RENDERS[option]}
                            alt={option}
                            fill
                            className="object-contain p-2"
                            sizes="(max-width: 768px) 45vw, 200px"
                          />
                        )}
                      </div>
                    ) : isMountOption(option) ? (
                      MOUNT_RENDERS[option] ? (
                        <div className="w-full h-full relative" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.08) 35%, transparent 60%), linear-gradient(135deg, #ede9ff 0%, #c4b8f5 100%)' }}>
                          <Image
                            src={MOUNT_RENDERS[option]}
                            alt={option}
                            fill
                            className="object-contain p-3"
                            sizes="(max-width: 768px) 45vw, 200px"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.08) 35%, transparent 60%), linear-gradient(135deg, #ede9ff 0%, #c4b8f5 100%)' }}>
                          <span className="text-[10px] text-purple-400 font-medium">Coming soon</span>
                        </div>
                      )
                    ) : isWallRender(option) ? (
                      <div className="w-full h-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #ede9ff 0%, #c4b8f5 100%)' }}>
                        {/* Bokeh blur orbs — lavender light circles that give frosted depth */}
                        <div style={{ position:'absolute', inset:0, zIndex:1, pointerEvents:'none' }}>
                          <div style={{ position:'absolute', width:'140%', height:'140%', top:'-20%', left:'-20%', background:'radial-gradient(ellipse at 30% 40%, rgba(200,185,255,0.90) 0%, rgba(180,160,255,0.60) 25%, transparent 65%)', filter:'blur(32px)' }} />
                          <div style={{ position:'absolute', width:'120%', height:'120%', top:'10%', left:'15%', background:'radial-gradient(ellipse at 70% 60%, rgba(220,210,255,0.80) 0%, rgba(160,140,240,0.50) 30%, transparent 65%)', filter:'blur(40px)' }} />
                          <div style={{ position:'absolute', width:'80%', height:'80%', bottom:'-10%', right:'-5%', background:'radial-gradient(ellipse at 60% 70%, rgba(180,165,255,0.70) 0%, transparent 60%)', filter:'blur(28px)' }} />
                        </div>
                        <Image
                          src={WALL_RENDERS[option]}
                          alt={option}
                          fill
                          className="object-contain"
                          style={{ zIndex:2 }}
                          sizes="(max-width: 768px) 45vw, 200px"
                        />
                      </div>
                    ) : isCableRender(option) ? (
                      <div className="w-full h-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.08) 35%, transparent 60%), linear-gradient(135deg, #ede9ff 0%, #c4b8f5 100%)' }}>
                        <Image
                          src={CABLE_RENDERS[option]}
                          alt={option}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 768px) 45vw, 200px"
                        />
                      </div>
                    ) : (
                      <Option3DPreview
                        option={option}
                        className="w-full h-full"
                        disableHover={!!WALL_TIPS[option]}
                      />
                    )}
                  </div>
                  <div className={`relative w-full px-3 text-center bg-white/40 dark:bg-gray-900/40 backdrop-blur-md ${WALL_TIPS[option] ? 'pt-2 pb-1.5' : 'py-2.5'}`}>
                    <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                      {option}
                    </span>
                    {WALL_TIPS[option] && (
                      <p className="text-[9px] font-medium text-black mt-0.5">
                        {WALL_TIPS[option]}
                      </p>
                    )}
                  </div>
                </motion.button>
                      ))}
                    </div>
                    {/* Non-3D options (e.g. "Other") — full width below the grid */}
                    {message.options.filter(opt => !THREE_D_OPTIONS.has(opt)).map((option, index) => (
                      <motion.button
                        key={`${message.id}-${option}-other-${index}`}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ delay: (message.options!.length + index) * 0.05, type: "spring", stiffness: 260, damping: 20 }}
                        className="w-full group relative flex flex-col items-center justify-center overflow-hidden
                          min-h-[52px]
                          bg-gradient-to-b from-white/95 to-white/80 dark:from-gray-800/95 dark:to-gray-900/80
                          rounded-2xl text-xs font-semibold
                          border border-white/30
                          shadow-[0_2px_6px_rgba(44,38,80,0.07),0_8px_24px_rgba(44,38,80,0.06),0_20px_48px_rgba(38,32,72,0.05),0_36px_72px_rgba(30,26,64,0.03),0_-1px_0_rgba(255,255,255,0.82)]
                          dark:shadow-[0_2px_6px_rgba(0,0,0,0.24),0_8px_24px_rgba(0,0,0,0.18),0_20px_48px_rgba(0,0,0,0.12),0_36px_72px_rgba(0,0,0,0.07),0_-1px_0_rgba(255,255,255,0.05)]
                          backdrop-blur-md"
                        onClick={() => handleOptionClick(option)}
                      >
                        <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent px-3 py-2.5">
                          {option}
                        </span>
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
                        className="px-3 py-1.5 bg-gradient-to-br from-white via-[#fefeff] to-[#fbf9ff] dark:bg-gray-800 rounded-full text-xs font-medium transition-all duration-200 shadow-[0_0_0_1px_rgba(88,82,100,0.09),0_2px_6px_rgba(44,38,80,0.07),0_6px_18px_rgba(44,38,80,0.06),0_-1px_0_rgba(255,255,255,0.78)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_2px_6px_rgba(0,0,0,0.22),0_6px_18px_rgba(0,0,0,0.16),0_-1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_0_0_1px_rgba(88,82,100,0.12),0_3px_10px_rgba(44,38,80,0.10),0_10px_28px_rgba(44,38,80,0.08),0_-1px_0_rgba(255,255,255,0.82)] hover:translate-y-[-2px]"
                        onClick={() => handleOptionClick(option)}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Mount type illustration */}
                {message.content === "What type of TV mount do you have/need?" && (
                  <>
                    <motion.div
                      className="mt-4 relative w-full h-64 sm:h-80 overflow-hidden rounded-xl border border-lavender-200/70"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                      style={{ background: 'linear-gradient(180deg, #1e1530 0%, #2d2050 45%, #3a2d5c 100%)' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/renders/tv-monitor.png"
                        alt="TV mount types"
                        className="absolute inset-0 w-full h-full object-contain"
                        style={{ zIndex: 2 }}
                      />
                    </motion.div>
                  </>
                )}

                {/* TV size illustration — Blender render */}
                {message.content === "What size is your TV?" && (
                  <>
                    <motion.div
                      className="mt-4 relative w-full h-64 sm:h-80 overflow-hidden rounded-xl border border-lavender-200/70"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                      style={{ background: 'linear-gradient(135deg, #ede9ff 0%, #c4b8f5 100%)' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/renders/tv-measure.webp"
                        alt="TV diagonal measurement"
                        className="absolute inset-0 w-full h-full object-contain"
                        style={{ zIndex: 2 }}
                      />
                    </motion.div>
                    <p className="mt-3 mb-1 text-xs font-medium text-black text-center">Measure corner to corner diagonally</p>
                  </>
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
          </div>
          <span
            className="text-[9px] font-semibold tracking-wide select-none ml-2 -mt-0.5 px-2.5 py-1 rounded-none"
            suppressHydrationWarning
            style={{
              color: "rgba(85,75,110,0.80)",
              textShadow: "0 1px 2px rgba(255,255,255,1), 0 -1px 1px rgba(0,0,0,0.22)",
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.70)",
              boxShadow: "0 2px 8px rgba(80,70,120,0.08), inset 0 1px 0 rgba(255,255,255,0.90)",
            }}
          >
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
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
          <div className="flex items-center">
            <LevlLogo className="h-10 w-10 mr-2 translate-y-[-1px]" style={{ filter: "drop-shadow(0px 2px 4px rgba(66,60,86,0.17)) drop-shadow(0px 6px 16px rgba(62,56,82,0.15)) drop-shadow(0px 14px 32px rgba(56,50,76,0.13))" }} />
            <div className="flex space-x-1.5">
              <motion.div
                className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-lavender-200/90 via-lavender-400/95 to-lavender-600/95 shadow-[0_0_0_1px_rgba(88,82,100,0.13),inset_0_2px_3px_rgba(255,255,255,0.98),inset_0_-2px_3px_rgba(66,60,86,0.32),0_2px_4px_rgba(66,60,86,0.24),0_4px_12px_rgba(62,56,82,0.20)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_2px_3px_rgba(255,255,255,0.18),inset_0_-2px_3px_rgba(0,0,0,0.40),0_2px_4px_rgba(0,0,0,0.40),0_4px_12px_rgba(0,0,0,0.32)]"
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
                className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-lavender-200/90 via-lavender-400/95 to-lavender-600/95 shadow-[0_0_0_1px_rgba(88,82,100,0.13),inset_0_2px_3px_rgba(255,255,255,0.98),inset_0_-2px_3px_rgba(66,60,86,0.32),0_2px_4px_rgba(66,60,86,0.24),0_4px_12px_rgba(62,56,82,0.20)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_2px_3px_rgba(255,255,255,0.18),inset_0_-2px_3px_rgba(0,0,0,0.40),0_2px_4px_rgba(0,0,0,0.40),0_4px_12px_rgba(0,0,0,0.32)]"
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
                className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-lavender-200/90 via-lavender-400/95 to-lavender-600/95 shadow-[0_0_0_1px_rgba(88,82,100,0.13),inset_0_2px_3px_rgba(255,255,255,0.98),inset_0_-2px_3px_rgba(66,60,86,0.32),0_2px_4px_rgba(66,60,86,0.24),0_4px_12px_rgba(62,56,82,0.20)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_2px_3px_rgba(255,255,255,0.18),inset_0_-2px_3px_rgba(0,0,0,0.40),0_2px_4px_rgba(0,0,0,0.40),0_4px_12px_rgba(0,0,0,0.32)]"
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
  // Stable ref so MessageItem memo is never broken when handleOptionSelect deps change
  const latestHandleOptionSelectRef = useRef<(option: string) => void>(() => {})

  const [aiModel, setAIModel] = useState<AIModelState>(initialAIModel)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Scroll to top on initial load so the page always starts at the top
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Preload the 3D module bundle immediately on mount — before user clicks anything.
  useEffect(() => {
    import("@/components/ai-matchmaker/option-3d-impl").catch(() => {})
  }, [])

  // Track whether the user has interacted (clicked a category or sent a message)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  // Auto-scroll to show new questions only AFTER the user has interacted
  useEffect(() => {
    if (!hasUserInteracted) return
    if (messages.length > 1 && messagesEndRef.current) {
      // Delay to ensure DOM has updated with new message
      const timeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [messages, hasUserInteracted])

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
          tvMounting:           "Mounting",
          artMounting:          "Mounting",
          shelvesMounting:      "Mounting",
          mirrorMounting:       "Mounting",
          lightFixtureMounting: "Mounting",
          furniture:            "Assembly",
          painting:             "Painting",
          plumbing:             "Plumbing",
          moving:               "Moving",
          cleaning:             "Cleaning",
          electrical:           "Electrical",
          landscaping:          "Landscaping",
          flooring:             "Flooring",
          roofing:              "Roofing",
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
        let serviceType = aiModel.conversationContext.currentServiceType
        if (!serviceType) return

        const questionIndex = aiModel.conversationContext.currentServiceQuestion
        const questions = serviceSpecificQuestions[serviceType].questions
        const currentQuestion = questions[questionIndex]

        const updatedAnswers = new Map(aiModel.conversationContext.serviceSpecificAnswers)
        updatedAnswers.set(currentQuestion, option)

        // ── Branch to sub-path when user picks a non-TV mount item ────────────
        if (currentQuestion === "What would you like to mount?" && option in MOUNT_OBJECT_SERVICE_MAP) {
          const newServiceType = MOUNT_OBJECT_SERVICE_MAP[option]
          const newQuestions = serviceSpecificQuestions[newServiceType].questions
          const firstQuestion = newQuestions[0]
          const firstOptions = serviceSpecificQuestions[newServiceType].options[firstQuestion]

          setAIModel((prev) => ({
            ...prev,
            conversationContext: {
              ...prev.conversationContext,
              currentServiceType: newServiceType,
              serviceSpecificAnswers: updatedAnswers,
              currentServiceQuestion: 0,
            },
          }))

          setIsTyping(true)
          const loadingId = `loading-${Date.now()}`
          setMessages((prev) => [...prev, { id: loadingId, type: "loading", content: "", timestamp: new Date() }])
          setTimeout(() => {
            if (!isMountedRef.current) return
            setMessages((prev) => {
              const filtered = prev.filter((msg) => msg.id !== loadingId)
              return [
                ...filtered,
                {
                  id: `ai-${Date.now()}`,
                  type: "ai",
                  content: firstQuestion,
                  timestamp: new Date(),
                  options: firstOptions,
                },
              ]
            })
            setIsTyping(false)
          }, 800)
          return
        }

        const nextQuestionIndex = getNextQuestionIndex(serviceType, questionIndex, option, currentQuestion)

        // ── Cross-category trigger: new wiring needed during light fixture install ──
        const needsElectrical =
          (currentQuestion === "Is there existing wiring at the installation point?" && option === "No wiring — new installation")

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
          const nextOptions = serviceSpecificQuestions[serviceType].options[nextQuestion]

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
              const next: Message[] = [
                ...filtered,
                {
                  id: `ai-${Date.now()}`,
                  type: "ai" as const,
                  content: nextQuestion,
                  timestamp: new Date(),
                  options: nextOptions,
                },
              ]
              // Append electrical note after the next question bubble
              if (needsElectrical) {
                next.push({
                  id: `ai-elec-${Date.now()}`,
                  type: "ai" as const,
                  content: "Just so you know — our providers can also handle any electrical work (outlet installation, new circuits) as part of the same job.",
                  timestamp: new Date(),
                })
              }
              return next
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
  // Always keep ref pointing to latest version — used by stableHandleOptionSelect
  latestHandleOptionSelectRef.current = handleOptionSelect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableHandleOptionSelect = useCallback((option: string) => {
    latestHandleOptionSelectRef.current(option)
  }, []) // empty deps — this reference never changes, so MessageItem memo holds

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      if (inputValue.trim() === "" && !e) return

      setHasUserInteracted(true)

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

    setHasUserInteracted(true)
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
      tvMounting:           "TV Mounting",
      artMounting:          "Art & Picture Frame Mounting",
      shelvesMounting:      "Floating Shelves Installation",
      mirrorMounting:       "Mirror Mounting",
      lightFixtureMounting: "Light Fixture Installation",
      furniture:            "Furniture Assembly",
      painting:             "Painting",
      plumbing:             "Plumbing",
      moving:               "Moving",
      cleaning:             "Cleaning",
      electrical:           "Electrical",
      landscaping:          "Landscaping",
      flooring:             "Flooring",
      roofing:              "Roofing",
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
          content: `Great! I'll help you find the best ${categoryNames[serviceType] || serviceType} service. When would you like this service completed?\n\n*All details will be sent to your selected handyman to help them prepare for your project.*`,
          timestamp: new Date(),
          options: ["ASAP", "This week", "Within 2 weeks", "I'm flexible with timing", "Unsure"],
        },
      ])
      setIsTyping(false)
    }, 800)
  }, [])

  const categories = useMemo(
    () => [
      { icon: Tv,       name: "Mounting",    serviceType: "tvMounting",  cardRender: "/assets/renders/category-mounting-v2.png" },
      { icon: Truck,    name: "Moving",      serviceType: "moving",      cardRender: "/assets/renders/category-moving-v2.png" },
      { icon: Spray,    name: "Painting",    serviceType: "painting",    cardRender: "/assets/renders/category-painting-v2.png" },
      { icon: Wrench,   name: "Assembly",    serviceType: "furniture",   cardRender: "/assets/renders/category-assembly-v2.png" },
      { icon: Zap,      name: "Electrical",  serviceType: "electrical",  cardRender: "/assets/renders/category-electrical.png" },
      { icon: Droplet,  name: "Plumbing",    serviceType: "plumbing",    cardRender: "/assets/renders/category-plumbing.png" },
      { icon: Leaf,     name: "Landscaping", serviceType: "landscaping", cardRender: "/assets/renders/category-landscaping.png" },
      { icon: Layers,   name: "Flooring",    serviceType: "flooring",    cardRender: "/assets/renders/category-flooring.png" },
    ],
    [],
  )

  // Removed auto-focus on load to prevent page scrolling to middle on initial load
  // Users can click the input to focus when they're ready to type

  return (
    <section className="w-full pb-8 md:pb-12 relative order-first z-20 -mt-8">
      {/* ─── Infinity cove / cyclorama wall ─────────────────────────────────────
          Simulates a seamless photography studio backdrop:
          · Bright white key-light zone at upper-centre (the "lit wall")
          · Smooth radial falloff to a cool lavender-shadow at the lower edges
          · Second radial at bottom mimics the cove shadow where wall meets floor
          · Dark mode: deep studio black with a subtle purple rim                */}
      <style jsx global>{`
        .cyc-wall {
          background:
            /* top-left corner — darkest point, wall curves away from camera */
            radial-gradient(ellipse 58% 48% at 0% 0%,
              rgba(88,85,100,0.32) 0%, transparent 62%
            ),
            /* top-right corner — mirrors left */
            radial-gradient(ellipse 58% 48% at 100% 0%,
              rgba(88,85,100,0.32) 0%, transparent 62%
            ),
            /* bottom-left corner — lighter than top but still recedes */
            radial-gradient(ellipse 42% 36% at 0% 100%,
              rgba(88,85,100,0.28) 0%, transparent 58%
            ),
            /* bottom-right corner */
            radial-gradient(ellipse 42% 36% at 100% 100%,
              rgba(88,85,100,0.28) 0%, transparent 58%
            ),
            /* THE COVE — bright hotspot at lower-centre where curved floor
               meets the back wall; this is the signature of a real infinity cove */
            radial-gradient(ellipse 68% 58% at 50% 90%,
              rgba(255,255,255,1.0)  0%,
              rgba(255,255,255,0.70) 32%,
              transparent            64%
            ),
            /* base backdrop — bright white centre, clear falloff to studio edge */
            radial-gradient(ellipse 150% 130% at 50% 45%,
              #ffffff  0%,
              #fdfcff 35%,
              #f5f3f9 60%,
              #e8e6ef 80%,
              #dddbe5 100%
            );
        }
        .dark .cyc-wall {
          background:
            /* top corners — very dark */
            radial-gradient(ellipse 58% 48% at 0% 0%,
              rgba(4,3,10,0.80) 0%, transparent 60%
            ),
            radial-gradient(ellipse 58% 48% at 100% 0%,
              rgba(4,3,10,0.80) 0%, transparent 60%
            ),
            /* bottom corners */
            radial-gradient(ellipse 42% 36% at 0% 100%,
              rgba(6,4,16,0.55) 0%, transparent 58%
            ),
            radial-gradient(ellipse 42% 36% at 100% 100%,
              rgba(6,4,16,0.55) 0%, transparent 58%
            ),
            /* cove highlight — subtle purple-tinged glow at lower-centre */
            radial-gradient(ellipse 68% 58% at 50% 90%,
              rgba(62,48,108,0.55)  0%,
              rgba(38,28,72,0.28)  35%,
              transparent          64%
            ),
            /* base — deep studio dark */
            radial-gradient(ellipse 150% 130% at 50% 45%,
              #1a1826  0%,
              #120f1e 32%,
              #0c0a16 60%,
              #070510 82%,
              #04030c 100%
            );
        }
        /* Scrollbar — categories strip (hide) */
        .cyc-cats-scroll::-webkit-scrollbar { display: none; }
        /* Scrollbar — chat area (thin lavender) */
        .cyc-chat-scroll::-webkit-scrollbar { width: 6px; background: transparent; }
        .cyc-chat-scroll::-webkit-scrollbar-thumb { background: rgba(79,70,229,0.2); border-radius: 10px; }
        .cyc-chat-scroll::-webkit-scrollbar-thumb:hover { background: rgba(79,70,229,0.4); }
      `}</style>

      <div className="w-full relative z-10 px-0 mx-0">
        <motion.div
          className="w-full mx-0 px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full">
            <div className="relative flex items-center justify-between p-5 mb-0 mt-8">
              <div className="flex items-center">
                <LevlLogo className="h-16 w-16 transition-all shadow-[0_2px_4px_rgba(66,60,86,0.17),0_6px_16px_rgba(62,56,82,0.15),0_14px_32px_rgba(56,50,76,0.13)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.38),0_6px_16px_rgba(0,0,0,0.29),0_14px_32px_rgba(0,0,0,0.20)] translate-y-[-2px]" />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { localStorage.setItem("levl-role", "worker"); router.push("/work") }}
                  className="text-xs font-black px-3 py-1.5 rounded-full transition-all active:scale-95 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg,rgba(255,255,255,0.97),rgba(237,233,254,0.82))",
                    border: "1px solid rgba(167,139,250,0.45)",
                    boxShadow: "0 4px 10px -3px rgba(0,0,0,0.22), 0 -1px 3px 0 rgba(255,255,255,0.9) inset",
                    color: "#7c3aed",
                  }}
                >
                  Worker
                </button>
                <Link
                  href="/pool"
                  className="text-xs font-black px-3 py-1.5 rounded-full transition-all active:scale-95 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg,rgba(109,40,217,0.92),rgba(124,58,237,0.85))",
                    border: "1px solid rgba(167,139,250,0.5)",
                    boxShadow: "0 4px 10px -3px rgba(109,40,217,0.45), 0 -1px 3px 0 rgba(255,255,255,0.2) inset",
                    color: "#fff",
                  }}
                >
                  Levl Pool
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-black dark:text-white"
                  style={{ textShadow: "0px 2px 4px rgba(66,60,86,0.17), 0px 5px 12px rgba(62,56,82,0.11)" }}
                >
                  Profile
                </Link>
                <Link
                  href="/forum"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-black dark:text-white"
                  style={{ textShadow: "0px 2px 4px rgba(66,60,86,0.17), 0px 5px 12px rgba(62,56,82,0.11)" }}
                >
                  Forum
                </Link>
              </div>
            </div>

            <div className="mb-0 pb-0">
              <div className="relative w-full">

                <div
                  className="cyc-cats-scroll overflow-x-auto py-2 pb-8 scrollbar-hide scroll-smooth mx-auto"
                  ref={categoriesRef}
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch",
                    scrollBehavior: "smooth",
                  }}
                >
                  <div className="flex space-x-4 snap-x snap-mandatory px-4 md:px-8 -ml-2 md:-ml-4 mr-4 md:mr-8">
                    {categories.map((category, index) => (
                      category.cardRender ? (
                        /* Neumorphic pillowed bubble card */
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
                          whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.3 } }}
                          className="shrink-0 my-2 mx-1 scale-[1.04] cursor-pointer"
                          style={{
                            width: 136,
                            height: 158,
                            borderRadius: 18,
                            overflow: "hidden",
                            position: "relative",
                            // Match card's rendered lavender — fills transparent PNG corners seamlessly
                            background: "linear-gradient(to bottom, #e1d5fe 0%, #b497f2 100%)",
                            // Deep side shadows wrap to the back; top-left rim catch light; bottom lift
                            boxShadow: [
                              "10px 18px 16px -6px rgba(0,0,0,0.56)",
                              "-10px 18px 16px -6px rgba(0,0,0,0.28)",
                              "0 6px 8px -10px rgba(50,10,110,0.05)",
                              "-3px -4px 14px 1px rgba(200,180,255,0.20)",
                            ].join(", "),
                          }}
                          onClick={() => handleCategoryClick(category.serviceType)}
                        >
                          {/* Blender render — fills card */}
                          <Image
                            src={category.cardRender}
                            alt={category.name}
                            width={136}
                            height={158}
                            className="w-full h-full object-cover"
                          />
                          {/* Convex dome overlay — radial bright centre fading to edge shadow */}
                          <div
                            aria-hidden="true"
                            style={{
                              position: "absolute",
                              inset: 0,
                              borderRadius: 18,
                              pointerEvents: "none",
                              background:
                                "radial-gradient(ellipse at 50% 42%, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.05) 42%, rgba(0,0,0,0.14) 100%)",
                              boxShadow: [
                                "inset 0 0 0 1px rgba(255,255,255,0.10)",
                                "inset 3px 5px 16px 0 rgba(255,255,255,0.14)",
                                "inset -3px -5px 16px 0 rgba(0,0,0,0.22)",
                              ].join(", "),
                            }}
                          />
                          {/* Specular highlight — light source hitting curved top-left surface */}
                          <div
                            aria-hidden="true"
                            style={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              width: 46,
                              height: 28,
                              borderRadius: "50%",
                              pointerEvents: "none",
                              background:
                                "radial-gradient(ellipse at center, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.10) 55%, transparent 78%)",
                              filter: "blur(5px)",
                              transform: "rotate(-18deg)",
                            }}
                          />
                        </motion.button>
                      ) : (
                      <EnhancedCategoryCard
                        key={index}
                        icon={category.icon}
                        name={category.name}
                        count={0}
                        index={index}
                        size="small"
                        className="w-28 h-32 my-2 mx-1 scale-[1.04]"
                        boxShadow="6px 10px 8px -6px rgba(0,0,0,0.45), -6px 10px 8px -6px rgba(0,0,0,0.45), 0 28px 22px -4px rgba(0,0,0,0.16), 0 19px 12px -4px rgba(0,0,0,0.11)"
                        onClick={() => handleCategoryClick(category.serviceType)}
                      />
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              id="chat-container"
              ref={chatContainerRef}
              className="relative p-6 pt-4"
            >
              <div className="space-y-6 w-full">
                <AnimatePresence mode="sync" initial={false}>
                  {messages.map((message) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      onOptionSelect={stableHandleOptionSelect}
                      router={router}
                    />
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </div>

            <motion.div
              className="relative z-10 p-4 pt-2"
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
                    className="pl-4 pr-12 py-6 bg-gradient-to-br from-white via-[#fefeff] to-[#fbf9ff] dark:bg-gray-800 border-0
      focus:ring-0 focus:outline-none focus:border-0
      rounded-full shadow-[0_0_0_1px_rgba(88,82,100,0.09),0_8px_32px_rgba(64,58,84,0.13),0_20px_56px_rgba(60,54,80,0.07),0_-1px_0_rgba(255,255,255,0.88)]
      hover:shadow-[0_0_0_1px_rgba(88,82,100,0.13),0_10px_36px_rgba(64,58,84,0.16),0_24px_64px_rgba(60,54,80,0.09),0_-1px_0_rgba(255,255,255,0.95)]
      dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.22),0_10px_28px_rgba(0,0,0,0.16)]
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
