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
  ChevronRight,
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
import { Option3DPreview, THREE_D_OPTIONS } from "@/components/ai-matchmaker/option-3d-preview"
import dynamic from "next/dynamic"
const TVSizeMeasure = dynamic(
  () => import("@/components/ai-matchmaker/option-3d-impl").then((m) => ({ default: m.TVSizeMeasure })),
  { ssr: false }
)


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
      "Is the mounting location near a power outlet?",
      "Do you need help with any additional setup (streaming devices, gaming consoles, etc.)?",
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
    "Brick",
    "Concrete",
    "Plaster",
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
  tvMounting: {
    "What would you like to mount?": {
      "Art/Picture Frame": new Set([
        "What size is your TV?",
        "What type of TV mount do you have/need?",
        "Do you need cable management (hiding cables in the wall)?",
        "Will you have a soundbar or other accessories to mount/attach with the TV?",
        "Do you need help with any additional setup (streaming devices, gaming consoles, etc.)?",
      ]),
      "Floating Shelves": new Set([
        "What size is your TV?",
        "What type of TV mount do you have/need?",
        "Do you need cable management (hiding cables in the wall)?",
        "Will you have a soundbar or other accessories to mount/attach with the TV?",
        "Do you need help with any additional setup (streaming devices, gaming consoles, etc.)?",
      ]),
      "Mirror": new Set([
        "What size is your TV?",
        "What type of TV mount do you have/need?",
        "Do you need cable management (hiding cables in the wall)?",
        "Will you have a soundbar or other accessories to mount/attach with the TV?",
        "Do you need help with any additional setup (streaming devices, gaming consoles, etc.)?",
      ]),
      "Other": new Set([
        "What size is your TV?",
        "What type of TV mount do you have/need?",
        "Will you have a soundbar or other accessories to mount/attach with the TV?",
        "Do you need help with any additional setup (streaming devices, gaming consoles, etc.)?",
      ]),
    },
  },
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
                {/* Check if any options have 3D previews */}
                {message.options.some(opt => THREE_D_OPTIONS.has(opt)) ? (
                  // No translateZ/backfaceVisibility here — those fight the Canvas WebGL layer
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {message.options.map((option, index) => {
                      const has3D = THREE_D_OPTIONS.has(option)
                      return (
                <motion.button
                  key={`${message.id}-${option}-${index}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 260, damping: 20 }}
                  className={`group relative flex flex-col items-center overflow-hidden
                    bg-gradient-to-b from-white/95 to-white/80 dark:from-gray-800/95 dark:to-gray-900/80
                    rounded-2xl text-xs font-semibold
                    border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]
                    backdrop-blur-md transition-all duration-300
                    hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-lavender-400/50
                    ${!has3D ? 'justify-center min-h-[80px]' : ''}`}
                  onClick={() => handleOptionClick(option)}
                >
                  {/* Glass reflection overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />

                  {has3D ? (
                    <div className="w-full h-32 overflow-hidden relative">
                      <Option3DPreview option={option} className="w-full h-full" />
                    </div>
                  ) : null}

                  {/* Label strip */}
                  <div className={`relative w-full py-2.5 px-3 text-center ${has3D ? 'bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-t border-white/10' : ''}`}>
                    <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                      {option}
                    </span>
                  </div>
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
                
                {/* 3D TV size illustration */}
                {message.content === "What size is your TV?" && (
                  <motion.div
                    className="mt-4 relative w-full h-64 overflow-hidden rounded-xl border border-lavender-200/70"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    <TVSizeMeasure />
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
                      <span className="text-xs font-medium text-gray-500 bg-white/70 rounded px-2 py-0.5">Measure corner to corner diagonally</span>
                    </div>
                  </motion.div>
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
          <div className="flex items-center">
            <LevlLogo className="h-10 w-10 mr-2 drop-shadow-[0_4px_8px_rgba(79,70,229,0.3)] dark:drop-shadow-[0_4px_8px_rgba(79,70,229,0.5)]" />
            <div className="flex space-x-1.5">
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

  // Scroll to top on initial load so the page always starts at the top
  useEffect(() => {
    window.scrollTo(0, 0)
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
          content: `Great! I'll help you find the best ${categoryNames[serviceType] || serviceType} service. When would you like this service completed?\n\n*All answers will be sent to your selected handyman to help them prepare for your job.*`,
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
      { icon: Truck, name: "Moving", serviceType: "moving" },
      { icon: Spray, name: "Painting", serviceType: "painting" },
      { icon: Wrench, name: "Assembly", serviceType: "furniture" },
      { icon: Sparkles, name: "Cleaning", serviceType: "cleaning" },
      { icon: Zap, name: "Electrical", serviceType: "electrical" },
      { icon: Droplet, name: "Plumbing", serviceType: "plumbing" },
      { icon: Leaf, name: "Landscaping", serviceType: "landscaping" },
      { icon: Layers, name: "Flooring", serviceType: "flooring" },
      { icon: HardHat, name: "Roofing", serviceType: "roofing" },
    ],
    [],
  )

  // Removed auto-focus on load to prevent page scrolling to middle on initial load
  // Users can click the input to focus when they're ready to type

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
                    <button
                      className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-lavender-400"
                    >
                      Portal
                    </button>
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
                {/* Right-edge swipe indicator */}
                <div className="absolute right-0 top-0 bottom-0 w-16 z-20 pointer-events-none"
                  style={{ background: 'linear-gradient(to left, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.7) 50%, transparent 100%)' }}
                />
                <motion.div
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center gap-0.5"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ChevronRight className="h-5 w-5 text-purple-500 drop-shadow-sm" />
                  <span className="text-[9px] font-medium text-purple-400 tracking-wide leading-tight">swipe</span>
                </motion.div>

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
                <AnimatePresence mode="sync" initial={false}>
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
