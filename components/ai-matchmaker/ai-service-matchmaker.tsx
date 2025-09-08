"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Add import for EnhancedCategoryCard
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
  Star,
} from "lucide-react"
import { LevlLogo } from "@/components/levl-logo"

// Add these imports
import { motion } from "framer-motion"

// Import the ProviderCard component
import { ProviderCard } from "@/components/ai-matchmaker/provider-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Layout } from "lucide-react"
import { LevlPortal } from "@/components/levl-portal"

// Long-term memory
const longTermMemoryData = new Map<string, any>([
  ["userLocation", "San Francisco, CA"],
  ["preferredLanguage", "English"],
  ["pastServices", ["TV Mounting", "Furniture Assembly"]],
])

// Define service types
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
  type: "user" | "ai" | "system"
  content: string
  timestamp: Date
  suggestions?: string[]
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

interface ServiceRecommendation {
  id: string
  title: string
  provider: string
  rating: number
  price: string
  description: string
  matchScore: number
  availability: string
  location: string
  specialties: string[]
  responseTime: string
  completionRate: number
  badges: string[]
  reasoning: string[]
  pros: string[]
  cons: string[]
}

// Sample services data
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

// Mock functions for NLP and reasoning
const detectUserIntent = (input: string) => {
  const intent: any = {
    type: "general",
    confidence: 0.5,
    entities: [],
  }

  const lowerInput = input.toLowerCase()

  if (lowerInput.includes("mount tv") || lowerInput.includes("tv mounting")) {
    intent.type = "booking"
    intent.confidence = 0.8
    intent.entities = ["Mounting"]
  } else if (lowerInput.includes("furniture assembly")) {
    intent.type = "booking"
    intent.confidence = 0.8
    intent.entities = ["Assembly"]
  } else if (lowerInput.includes("painting") || lowerInput.includes("paint home")) {
    intent.type = "booking"
    intent.confidence = 0.8
    intent.entities = ["Painting"]
  } else if (lowerInput.includes("smart home") || lowerInput.includes("home automation")) {
    intent.type = "booking"
    intent.confidence = 0.8
    intent.entities = ["Technology"]
  } else if (lowerInput.includes("plumbing") || lowerInput.includes("fix sink")) {
    intent.type = "booking"
    intent.confidence = 0.8
    intent.entities = ["Plumbing"]
  } else if (lowerInput.includes("photography") || lowerInput.includes("take photos")) {
    intent.type = "booking"
    intent.confidence = 0.8
    intent.entities = ["Photography"]
  } else if (lowerInput.includes("budget") || lowerInput.includes("price")) {
    intent.type = "refinement"
    intent.confidence = 0.7
    intent.entities = ["Budget"]
  } else if (lowerInput.includes("quality") || lowerInput.includes("rating")) {
    intent.type = "refinement"
    intent.confidence = 0.7
    intent.entities = ["Quality"]
  } else if (lowerInput.includes("time") || lowerInput.includes("when")) {
    intent.type = "refinement"
    intent.confidence = 0.7
    intent.entities = ["Timing"]
  } else if (lowerInput.includes("more") || lowerInput.includes("other options")) {
    intent.type = "information"
    intent.confidence = 0.6
  }

  return intent
}

const analyzeSentiment = (input: string) => {
  let type = "neutral"
  let confidence = 0.5

  const lowerInput = input.toLowerCase()

  if (lowerInput.includes("perfect") || lowerInput.includes("great") || lowerInput.includes("good")) {
    type = "positive"
    confidence = 0.8
  } else if (lowerInput.includes("bad") || lowerInput.includes("not right") || lowerInput.includes("expensive")) {
    type = "negative"
    confidence = 0.7
  }

  return { type, confidence }
}

const determineQueryComplexity = (input: string, stage: string) => {
  let complexity = "simple"

  if (stage === "understanding") {
    complexity = "medium"
  } else if (stage === "recommending") {
    complexity = "complex"
  }

  return 1500
}

const updateUserModel = (currentModel: any, input: string, intent: any, context: any) => {
  const updatedModel = { ...currentModel }

  if (intent.entities.includes("Mounting")) {
    updatedModel.category = "Mounting"
  } else if (intent.entities.includes("Assembly")) {
    updatedModel.category = "Assembly"
  } else if (intent.entities.includes("Painting")) {
    updatedModel.category = "Painting"
  } else if (intent.entities.includes("Technology")) {
    updatedModel.category = "Technology"
  } else if (intent.entities.includes("Plumbing")) {
    updatedModel.category = "Plumbing"
  } else if (intent.entities.includes("Photography")) {
    updatedModel.category = "Photography"
  }

  return updatedModel
}

const extractUserConcerns = (input: string) => {
  const concerns: string[] = []

  const lowerInput = input.toLowerCase()

  if (lowerInput.includes("expensive") || lowerInput.includes("pricey") || lowerInput.includes("cost")) {
    concerns.push("price")
  }

  if (
    lowerInput.includes("quality") ||
    lowerInput.includes("good") ||
    lowerInput.includes("best") ||
    lowerInput.includes("reliable")
  ) {
    concerns.push("quality")
  }

  if (lowerInput.includes("time") || lowerInput.includes("urgent") || lowerInput.includes("schedule")) {
    concerns.push("timing")
  }

  return concerns
}

const generatePersonalizedRecommendationIntro = (userModel: any) => {
  let intro = "Based on your needs, here are some top recommendations:"

  if (userModel.category) {
    intro = `Since you're interested in ${userModel.category} services, here are some great options:`
  }

  return intro
}

const generateRefinementResponseIntro = (refinementIterations: number) => {
  let intro = "Here are some refined recommendations based on your feedback:"

  if (refinementIterations > 1) {
    intro = "I've made some further adjustments based on your feedback. Let's see if these options are a better fit:"
  }

  return intro
}

const generatePersonalizedExplanation = (matches: any, userModel: any, reasoning: any) => {
  let explanation = "Here's why I recommended these services:"

  if (matches.length > 0) {
    explanation += `\n\nTop match: ${matches[0].service.title}`
  }

  return explanation
}

const generateDiverseAlternativesFn = (currentMatches: any, allServices: any, userModel: any) => {
  const matches = [...currentMatches]
  const reasoning: any = []

  return { matches, reasoning }
}

const matchServicesWithReasoning = (services: any, userModel: any) => {
  const matches: any = services.map((service: any) => ({
    service,
    matchScore: Math.floor(Math.random() * 50) + 50,
  }))
  const reasoning: any = []

  return { matches, reasoning }
}

// Advanced AI system types
interface ReasoningStep {
  id: string
  step: string
  reasoning: string
  conclusion: string
  confidence: number
  timestamp: Date
}

interface UserIntent {
  type: "booking" | "comparison" | "information" | "save" | "general" | "refinement" | "feedback"
  confidence: number
  entities: string[]
  context?: string
}

interface UserPreferenceModel {
  categories: Map<string, number> // category -> confidence
  budget: {
    sensitivity: number // 0-10 scale
    range: [number, number] | null
    flexibility: number // 0-10 scale
  }
  quality: {
    importance: number // 0-10 scale
    minimumRating: number | null
    certificationRequired: boolean
  }
  timing: {
    urgency: number // 0-10 scale
    specificDate: Date | null
    flexibility: 5 // 0-10 scale
  }
  requirements: {
    explicit: string[]
    implicit: Map<string, number> // requirement -> importance
    dealBreakers: string[]
  }
  history: {
    viewedServices: number[]
    interactionCount: number
    satisfactionTrend: number[] // -1 to 1 scale
    refinementIterations: number
  }
}

// Service-specific question flows
interface ServiceSpecificQuestions {
  tvMounting: {
    questions: string[]
    options: { [key: string]: string[] }
    required: boolean[]
  }
  plumbing: {
    questions: string[]
    options: string[]
    required: boolean[]
  }
  painting: {
    questions: string[]
    options: { [key: string]: string[] }
    required: boolean[]
  }
  furniture: {
    questions: string[]
    options: string[]
    required: boolean[]
  }
  [key: string]: {
    questions: string[]
    options: string[]
    required: boolean[]
  }
}

// Enhanced reasoning engine with multi-step thinking
interface EnhancedReasoning {
  contextualMemory: {
    shortTerm: Map<string, any>
    longTerm: Map<string, any>
    conversationFlow: string[]
  }
  reasoningCapabilities: {
    chainOfThought: boolean
    selfCritique: boolean
    uncertaintyHandling: number
    explorationFactor: number
  }
  adaptivePersonalization: {
    learningRate: number
    preferenceWeights: Map<string, number>
    confidenceThresholds: Map<string, number>
  }
  proactiveCapabilities: {
    suggestionThreshold: number
    anticipationFactors: string[]
    interventionLevel: "low" | "medium" | "high"
  }
}

interface AIModelState {
  reasoningTrace: ReasoningStep[]
  confidenceThreshold: number
  explorationFactor: number // How much to explore vs exploit
  lastUserIntent: UserIntent | null
  userModel: UserPreferenceModel
  conversationContext: {
    stage: "initial" | "understanding" | "service-specific" | "recommending" | "refining" | "finalizing"
    depth: number
    lastRecommendations: (number | string)[]
    explanationProvided: boolean
    comparisonMode: boolean
    currentServiceType: string | null
    serviceSpecificAnswers: Map<string, string>
    currentServiceQuestion: number
  }
  enhancedReasoning: EnhancedReasoning
}

// Enhanced service matching types
interface ServiceMatch {
  service: Service
  matchScore: number
  matchReasons: {
    factor: string
    score: number
    explanation: string
  }[]
  confidenceScore: number
}

interface MatchingResult {
  matches: ServiceMatch[]
  reasoning: ReasoningStep[]
  diversityScore: number
  coverageScore: number
}

// Define message types
type MessageType = "user" | "ai" | "service" | "options" | "loading" | "feedback"

interface Message {
  id: string
  type: MessageType
  content: string
  timestamp: Date
  options?: string[]
  services?: Service[]
  feedbackOptions?: string[]
}

// Predefined conversation flows
const initialMessages: Message[] = [
  {
    id: "welcome",
    type: "ai",
    content: "Hello Im LevL AI! Tap or scroll to find a service you need from above!",
    timestamp: new Date(),
  },
]

// Service-specific questions for different service types
const serviceSpecificQuestions: ServiceSpecificQuestions = {
  tvMounting: {
    questions: [
      "What type of wall do you have?",
      "Do you already have a wall mount, or do you need one included?",
      "What size is your TV?",
      "Do you need cable management (hiding cables in the wall)?",
      "Is the mounting location near a power outlet?",
    ],
    options: {
      "What type of wall do you have?": ["Drywall/Sheetrock", "Brick", "Concrete", "Wood/Plaster", "Not sure"],
      "Do you already have a wall mount, or do you need one included?": [
        "I have a mount",
        "I need a mount included",
        "Not sure yet",
      ],
      "What size is your TV?": ["Under 40 inches", "40-55 inches", "55-65 inches", "65-75 inches", "Over 75 inches"],
      "Do you need cable management (hiding cables in the wall)?": ["Yes", "No", "Not sure"],
      "Is the mounting location near a power outlet?": ["Yes", "No", "Not sure"],
    },
    required: [true, true, true, false, false],
  },
  plumbing: {
    questions: [
      "What type of plumbing issue are you experiencing?",
      "How urgent is this plumbing situation?",
      "Is there active water leakage?",
      "Have you tried any DIY fixes already?",
      "How old is your plumbing system?",
    ],
    options: {
      "What type of plumbing issue are you experiencing?": [
        "Clogged drain",
        "Leaky pipe/faucet",
        "Water heater issue",
        "Toilet problem",
        "Installation of new fixture",
        "Other",
      ],
      "How urgent is this plumbing situation?": [
        "Emergency (need help immediately)",
        "Urgent (today or tomorrow)",
        "Standard (this week)",
        "Flexible (whenever available)",
      ],
      "Is there active water leakage?": ["Yes, significant", "Yes, minor", "No", "Not sure"],
      "Have you tried any DIY fixes already?": ["Yes", "No"],
      "How old is your plumbing system?": [
        "Less than 5 years",
        "5-15 years",
        "15-25 years",
        "Over 25 years",
        "Not sure",
      ],
    },
    required: [true, true, true, false, false],
  },
  painting: {
    questions: [
      "What area needs painting?",
      "Do you need interior or exterior painting?",
      "What is the approximate square footage?",
      "Do you need any special finishes or techniques?",
      "Do walls need repair before painting?",
    ],
    options: {
      "What area needs painting?": ["Entire home", "Several rooms", "Single room", "Accent wall", "Exterior", "Other"],
      "Do you need interior or exterior painting?": ["Interior", "Exterior", "Both"],
      "What is the approximate square footage?": [
        "Under 500 sq ft",
        "500-1000 sq ft",
        "1000-2000 sq ft",
        "Over 2000 sq ft",
        "Not sure",
      ],
      "Do you need any special finishes or techniques?": [
        "Standard paint job",
        "Textured finish",
        "Faux finish",
        "Mural/design",
        "Other",
      ],
      "Do walls need repair before painting?": [
        "Yes, significant repairs",
        "Yes, minor repairs",
        "No, walls are ready",
        "Not sure",
      ],
    },
    required: [true, true, true, false, false],
  },
  furniture: {
    questions: [
      "What type of furniture needs assembly?",
      "How many pieces need assembly?",
      "Do you have all the necessary tools?",
      "Are the assembly instructions available?",
      "Do you need the packaging materials removed after assembly?",
    ],
    options: {
      "What type of furniture needs assembly?": [
        "Bed/Mattress",
        "Table/Desk",
        "Chair/Sofa",
        "Shelving/Bookcase",
        "Cabinet/Dresser",
        "Multiple types",
        "Other",
      ],
      "How many pieces need assembly?": ["1 piece", "2-3 pieces", "4-5 pieces", "More than 5 pieces"],
      "Do you have all the necessary tools?": ["Yes", "No", "Not sure"],
      "Are the assembly instructions available?": ["Yes", "No", "Not sure"],
      "Do you need the packaging materials removed after assembly?": ["Yes", "No", "Not sure"],
    },
    required: [true, true, false, false, false],
  },
  moving: {
    questions: [
      "What type of move are you planning?",
      "How many rooms need to be moved?",
      "Do you need packing services?",
      "Do you have any large or specialty items?",
      "What's your preferred moving date?",
    ],
    options: {
      "What type of move are you planning?": [
        "Local (within city)",
        "Long distance",
        "Office/Commercial",
        "Single item",
        "Storage move",
      ],
      "How many rooms need to be moved?": ["Studio/1 bedroom", "2-3 bedrooms", "4+ bedrooms", "Office space"],
      "Do you need packing services?": ["Yes, full packing", "Partial packing", "No, I'll pack myself"],
      "Do you have any large or specialty items?": [
        "Piano",
        "Pool table",
        "Artwork/Antiques",
        "Exercise equipment",
        "None",
      ],
      "What's your preferred moving date?": ["Within a week", "1-2 weeks", "3-4 weeks", "Flexible/Not sure"],
    },
    required: [true, true, false, false, true],
  },
  cleaning: {
    questions: [
      "What type of cleaning service do you need?",
      "What is the size of your space?",
      "How often do you need cleaning?",
      "Are there any specific areas that need special attention?",
      "Do you have any pets?",
    ],
    options: {
      "What type of cleaning service do you need?": [
        "Regular cleaning",
        "Deep cleaning",
        "Move-in/Move-out",
        "Post-construction",
        "Office cleaning",
      ],
      "What is the size of your space?": ["Studio/1 bedroom", "2-3 bedrooms", "4+ bedrooms", "Commercial space"],
      "How often do you need cleaning?": ["One-time", "Weekly", "Bi-weekly", "Monthly"],
      "Are there any specific areas that need special attention?": [
        "Kitchen",
        "Bathrooms",
        "Carpets/Upholstery",
        "Windows",
        "None",
      ],
      "Do you have any pets?": ["Yes, cats", "Yes, dogs", "Yes, other pets", "No pets"],
    },
    required: [true, true, true, false, false],
  },
  electrical: {
    questions: [
      "What type of electrical work do you need?",
      "Is this a repair or new installation?",
      "How urgent is this electrical work?",
      "Is the property residential or commercial?",
      "Has this issue occurred before?",
    ],
    options: {
      "What type of electrical work do you need?": [
        "Outlet/Switch installation",
        "Lighting installation",
        "Electrical panel work",
        "Wiring",
        "Troubleshooting",
        "Other",
      ],
      "Is this a repair or new installation?": ["Repair", "New installation", "Upgrade", "Inspection"],
      "How urgent is this electrical work?": [
        "Emergency (same day)",
        "Urgent (1-2 days)",
        "Standard (this week)",
        "Flexible",
      ],
      "Is the property residential or commercial?": ["Residential", "Commercial", "Industrial"],
      "Has this issue occurred before?": ["Yes, multiple times", "Yes, once", "No, first time", "Not sure"],
    },
    required: [true, true, true, false, false],
  },
  landscaping: {
    questions: [
      "What type of landscaping service do you need?",
      "What is the approximate size of your yard?",
      "Do you need regular maintenance or a one-time service?",
      "Are there any specific features you want to include?",
      "When would you like the work to be completed?",
    ],
    options: {
      "What type of landscaping service do you need?": [
        "Lawn maintenance",
        "Garden design",
        "Tree service",
        "Hardscaping",
        "Irrigation",
        "Full landscaping",
      ],
      "What is the approximate size of your yard?": [
        "Small (under 1,000 sq ft)",
        "Medium (1,000-5,000 sq ft)",
        "Large (5,000-10,000 sq ft)",
        "Very large (10,000+ sq ft)",
      ],
      "Do you need regular maintenance or a one-time service?": [
        "Regular maintenance",
        "One-time service",
        "Seasonal service",
        "Project-based",
      ],
      "Are there any specific features you want to include?": [
        "Flower beds",
        "Water features",
        "Patio/Deck",
        "Fencing",
        "Lighting",
        "None",
      ],
      "When would you like the work to be completed?": ["ASAP", "Within 2 weeks", "Within a month", "Flexible timing"],
    },
    required: [true, true, true, false, false],
  },
  flooring: {
    questions: [
      "What type of flooring project do you need?",
      "What is the approximate square footage?",
      "What type of flooring material are you interested in?",
      "Is this for a residential or commercial property?",
      "Do you need removal of existing flooring?",
    ],
    options: {
      "What type of flooring project do you need?": [
        "New installation",
        "Replacement",
        "Repair",
        "Refinishing",
        "Cleaning",
      ],
      "What is the approximate square footage?": [
        "Under 500 sq ft",
        "500-1,000 sq ft",
        "1,000-2,000 sq ft",
        "Over 2,000 sq ft",
      ],
      "What type of flooring material are you interested in?": [
        "Hardwood",
        "Laminate",
        "Vinyl/LVP",
        "Tile",
        "Carpet",
        "Not sure",
      ],
      "Is this for a residential or commercial property?": ["Residential", "Commercial", "Industrial"],
      "Do you need removal of existing flooring?": ["Yes", "No", "Not sure"],
    },
    required: [true, true, true, false, false],
  },
  roofing: {
    questions: [
      "What type of roofing service do you need?",
      "What is the approximate size of your roof?",
      "What type of roofing material do you have or want?",
      "How old is your current roof?",
      "Have you noticed any leaks or damage?",
    ],
    options: {
      "What type of roofing service do you need?": [
        "Repair",
        "Full replacement",
        "Inspection",
        "Maintenance",
        "New installation",
      ],
      "What is the approximate size of your roof?": [
        "Small (under 1,000 sq ft)",
        "Medium (1,000-2,000 sq ft)",
        "Large (2,000-3,000 sq ft)",
        "Very large (3,000+ sq ft)",
      ],
      "What type of roofing material do you have or want?": [
        "Asphalt shingles",
        "Metal",
        "Tile",
        "Flat/TPO",
        "Wood shake",
        "Not sure",
      ],
      "How old is your current roof?": ["Less than 5 years", "5-15 years", "15-25 years", "Over 25 years", "Not sure"],
      "Have you noticed any leaks or damage?": [
        "Yes, active leaks",
        "Yes, visible damage",
        "No visible issues",
        "Not sure",
      ],
    },
    required: [true, true, false, true, false],
  },
}

// Initial AI model state - no changes here
const initialAIModel: AIModelState = {
  reasoningTrace: [],
  confidenceThreshold: 0.7,
  explorationFactor: 0.2,
  lastUserIntent: null,
  userModel: {
    categories: new Map(),
    budget: {
      sensitivity: 5,
      range: null,
      flexibility: 5,
    },
    quality: {
      importance: 7,
      minimumRating: null,
      certificationRequired: false,
    },
    timing: {
      urgency: 5,
      specificDate: null,
      flexibility: 5,
    },
    requirements: {
      explicit: [],
      implicit: new Map(),
      dealBreakers: [],
    },
    history: {
      viewedServices: [],
      interactionCount: 0,
      satisfactionTrend: [],
      refinementIterations: 0,
    },
  },
  conversationContext: {
    stage: "initial",
    depth: 0,
    lastRecommendations: [],
    explanationProvided: false,
    comparisonMode: false,
    currentServiceType: null,
    serviceSpecificAnswers: new Map(),
    currentServiceQuestion: 0,
  },
  enhancedReasoning: {
    contextualMemory: {
      shortTerm: new Map(),
      longTerm: longTermMemoryData, // Preserve long-term memory
      conversationFlow: [],
    },
    reasoningCapabilities: {
      chainOfThought: true,
      selfCritique: true,
      uncertaintyHandling: 0.8,
      explorationFactor: 0.3,
    },
    adaptivePersonalization: {
      learningRate: 0.2,
      preferenceWeights: new Map(),
      confidenceThresholds: new Map([
        ["category", 0.7],
        ["budget", 0.6],
        ["quality", 0.65],
        ["timing", 0.6],
      ]),
    },
    proactiveCapabilities: {
      suggestionThreshold: 0.75,
      anticipationFactors: ["budget_constraints", "quality_expectations", "time_sensitivity", "specific_requirements"],
      interventionLevel: "medium",
    },
  },
}

export function AIServiceMatchmaker() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [userInput, setUserInput] = useState("")
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showMatchmaker, setShowMatchmaker] = useState(true) // Changed to true to show by default
  const [matchedServices, setMatchedServices] = useState<Service[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [conversationStage, setConversationStage] = useState<
    "initial" | "understanding" | "service-specific" | "recommending" | "refining" | "finalizing"
  >("initial")

  // Add these state variables
  const [isFocused, setIsFocused] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [showPortal, setShowPortal] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Enhanced state for sophisticated matching
  const [userContextHistory, setUserContextHistory] = useState<
    Array<{
      query: string
      timestamp: Date
      intent?: string
      entities?: string[]
      sentiment?: "positive" | "negative" | "neutral"
    }>
  >([])

  // Advanced preference tracking with confidence scores
  const [enhancedPreferences, setEnhancedPreferences] = useState<{
    categoryPreferences: Map<string, number> // category -> confidence score (0-1)
    budgetSensitivity: number // 0-10 scale
    qualityPreference: number // 0-10 scale
    timeUrgency: number // 0-10 scale
    explicitRequirements: string[]
    implicitPreferences: Map<string, number> // feature -> importance score
    negativePreferences: string[] // things user explicitly doesn't want
    conversationContext: {
      lastMentionedService?: number
      comparisonMode: boolean
      refinementIteration: number
      satisfactionScore: number // 0-10 scale
    }
  }>({
    categoryPreferences: new Map(),
    budgetSensitivity: 5,
    qualityPreference: 7,
    timeUrgency: 5,
    explicitRequirements: [],
    implicitPreferences: new Map(),
    negativePreferences: [],
    conversationContext: {
      comparisonMode: false,
      refinementIteration: 0,
      satisfactionScore: 5,
    },
  })

  // Reasoning trace for explainable AI
  const [reasoningTrace, setReasoningTrace] = useState<
    Array<{
      step: string
      reasoning: string
      conclusion: string
      confidence: number
    }>
  >([])

  // Replace the existing state declarations with this enhanced AI model
  const [aiModel, setAIModel] = useState<AIModelState>(initialAIModel)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Questions for understanding user needs
  const questions = [
    "What's your budget range for this service?",
    "When do you need this service completed?",
    "How important is provider experience to you?",
    "Do you have any specific requirements or preferences?",
  ]

  // Replace the existing scrollToBottom function with this enhanced version
  const scrollToBottom = () => {
    // Auto-scrolling functionality removed to allow only user-initiated scrolling
    // This is intentionally empty
  }

  // Replace the useEffect for scrolling with this enhanced version
  const isInitialMount = useRef(true)
  useEffect(() => {
    // We only want to scroll to top on initial component mount, not when messages update
    // Using a ref to track if it's the initial load

    if (isInitialMount.current) {
      window.scrollTo(0, 0)
      isInitialMount.current = false
    }

    // No auto-scrolling on message updates as per user request
  }, [])

  // Simulate AI typing
  const simulateTyping = useCallback((callback: () => void, delay = 1500) => {
    setIsTyping(true)
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      type: "loading",
      content: "", // Empty content since we're using the logo
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, typingMessage])

    setTimeout(() => {
      setMessages((prev) => prev.filter((msg) => msg.id !== typingMessage.id))
      setIsTyping(false)
      callback()
      // Removed any scrollToBottom calls here
    }, delay)
  }, [])

  // Handle user input submission
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (inputValue.trim() === "" && !e) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue || (e as any).target.innerText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Process user input
    processUserInput(userMessage.content)
  }

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: option,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    processUserInput(option)
  }

  const [userContext, setUserContext] = useState<Array<{ query: string; timestamp: Date }>>([])
  const [detectedPreferences, setDetectedPreferences] = useState<{
    category: string | null
    budget: string | null
    timeframe: string | null
    experienceImportance: string | null
    hasSpecificRequirements: boolean
    specificRequirements: string | null
  }>({
    category: null,
    budget: null,
    timeframe: null,
    experienceImportance: null,
    hasSpecificRequirements: false,
    specificRequirements: null,
  })

  // Process user input
  const processUserInput = (input: string) => {
    // Simple AI response simulation
    simulateTyping(() => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: "I understand you're looking for help. Let me find some great service providers for you!",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      // Show some sample services
      setTimeout(() => {
        const servicesMessage: Message = {
          id: `services-${Date.now()}`,
          type: "ai",
          content: "Here are some top-rated service providers:",
          timestamp: new Date(),
          services: services.slice(0, 3),
        }

        setMessages((prev) => [...prev, servicesMessage])
      }, 1000)
    }, 1500)
  }

  const categoriesRef = useRef<HTMLDivElement>(null)

  // Handle category card click
  const handleCategoryClick = (serviceType: string) => {
    // Reset conversation first
    setMessages([])
    setInputValue("")
    setIsTyping(false)
    setMatchedServices([])

    // Simple response for category selection
    simulateTyping(() => {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: `Great choice! I'll help you find the best ${serviceType} services. Here are some top providers:`,
        timestamp: new Date(),
        services: services
          .filter((service) => service.category.toLowerCase().includes(serviceType.toLowerCase()))
          .slice(0, 3),
      }

      setMessages((prev) => [...prev, aiMessage])
    }, 1000)
  }

  // Handle horizontal scrolling for categories
  const scrollCategories = (direction: "left" | "right") => {
    if (categoriesRef.current) {
      const container = categoriesRef.current
      const scrollAmount = container.clientWidth * 0.75 // Scroll 75% of the visible width
      const currentScroll = container.scrollLeft

      container.scrollTo({
        left: direction === "left" ? Math.max(0, currentScroll - scrollAmount) : currentScroll + scrollAmount,
        behavior: "smooth",
      })
    }
  }

  // Add keyboard navigation for categories
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        scrollCategories("left")
      } else if (e.key === "ArrowRight") {
        scrollCategories("right")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Add this after the scrollCategories function
  useEffect(() => {
    const container = categoriesRef.current
    if (!container) return

    let isDown = false
    let startX: number
    let scrollLeft: number

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true
      container.classList.add("cursor-grabbing")
      startX = e.pageX - container.offsetLeft
      scrollLeft = container.scrollLeft
    }

    const handleMouseLeave = () => {
      isDown = false
      container.classList.remove("cursor-grabbing")
    }

    const handleMouseUp = () => {
      isDown = false
      container.classList.remove("cursor-grabbing")
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - container.offsetLeft
      const walk = (x - startX) * 2 // Scroll speed multiplier
      container.scrollLeft = scrollLeft - walk
    }

    // Touch events for mobile with improved handling
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDown = true
        startX = e.touches[0].pageX - container.offsetLeft
        scrollLeft = container.scrollLeft
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDown || e.touches.length !== 1) return
      const x = e.touches[0].pageX - container.offsetLeft
      const walk = (x - startX) * 2
      container.scrollLeft = scrollLeft - walk

      // Prevent page scrolling when scrolling the categories on mobile devices
      e.preventDefault()
    }

    container.addEventListener("mousedown", handleMouseDown)
    container.addEventListener("mouseleave", handleMouseLeave)
    container.addEventListener("mouseup", handleMouseUp)
    container.addEventListener("mousemove", handleMouseMove)

    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchend", handleMouseUp)
    container.addEventListener("touchcancel", handleMouseLeave)
    container.addEventListener("touchmove", handleTouchMove)

    return () => {
      container.removeEventListener("mousedown", handleMouseDown)
      container.removeEventListener("mouseleave", handleMouseLeave)
      container.removeEventListener("mouseup", handleMouseUp)
      container.removeEventListener("mousemove", handleMouseMove)

      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchend", handleMouseUp)
      container.removeEventListener("touchcancel", handleMouseLeave)
      container.removeEventListener("touchmove", handleTouchMove)
    }
  }, [categoriesRef.current])

  const renderEnhancedServiceCard = (service: Service) => {
    return (
      <motion.div
        key={service.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="group relative"
      >
        <div
          className="relative overflow-hidden rounded-xl border border-lavender-200/40 dark:border-lavender-800/30 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
          onClick={() => router.push(`/services/${service.id}`)}
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-lavender-50/50 via-white to-white dark:from-lavender-900/20 dark:via-gray-900 dark:to-gray-900 opacity-80"></div>

          {/* Refined grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9ImN1cnJlbnRDb2xvciIgZmlsbC1vcGFjaXR5PSIwLjAyIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6TTAgMGg0MHY0MEgwek0wIDBoNDB2NDBIMHoiLz48L2c+PC9nPjwvc3ZnPg==')] bg-[length:30px_30px] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9ImN1cnJlbnRDb2xvciIgZmlsbC1vcGFjaXR5PSIwLjAzIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6TTAgMGg0MHY0MEgwek0wIDBoNDB2NDBIMHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10 group-hover:opacity-30 transition-opacity duration-300"></div>

          {/* Match score badge */}
          {service.matchScore && (
            <div className="absolute top-4 right-4 z-10">
              <div className="flex items-center bg-lavender-600/90 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                >
                  <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <span>{service.matchScore}% Match</span>
              </div>
            </div>
          )}

          <div className="relative p-5">
            <div className="flex gap-4">
              {/* Service image */}
              <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-lavender-100 dark:bg-lavender-900/30"></div>
                <img
                  src={service.image || "/placeholder.svg"}
                  alt={service.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Service info */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-lavender-700 dark:group-hover:text-lavender-400 transition-colors duration-300">
                  {service.title}
                </h3>

                <div className="flex items-center mt-1 text-sm">
                  <span className="text-lavender-700 dark:text-lavender-400 font-medium">{service.price}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-600 dark:text-gray-400">{service.timeEstimate}</span>
                </div>

                <div className="flex items-center mt-1.5">
                  <div className="flex items-center">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {service.provider.rating}
                    </span>
                    <span className="ml-0.5 text-xs text-gray-500 dark:text-gray-400">
                      ({service.provider.reviews})
                    </span>
                  </div>

                  {service.provider.verified && (
                    <div className="ml-3 flex items-center text-xs font-medium text-lavender-700 dark:text-lavender-400">
                      <svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Verified
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Service description */}
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
              {service.description}
            </p>

            {/* Service tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {service.tags.slice(0, 3).map((tag, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="inline-block px-2 py-0.5 text-xs font-medium bg-lavender-100/80 dark:bg-lavender-900/30 text-lavender-800 dark:text-lavender-300 rounded-full"
                >
                  {tag}
                </motion.span>
              ))}
            </div>

            {/* Provider info */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative h-6 w-6 rounded-full overflow-hidden border border-lavender-200 dark:border-lavender-800">
                  <img
                    src={service.provider.avatar || "/placeholder.svg"}
                    alt={service.provider.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="ml-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                  {service.provider.name}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs font-medium text-lavender-700 dark:text-lavender-400 hover:text-lavender-800 dark:hover:text-lavender-300 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/messages?provider=${service.provider.id}`)
                }}
              >
                Contact
              </motion.button>
            </div>

            {/* Animated accent line */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-lavender-500 to-purple-500"
              initial={{ width: "0%" }}
              whileHover={{ width: "100%" }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </motion.div>
    )
  }

  // Add this function for voice recording toggle
  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // In a real implementation, this would start/stop voice recording
  }

  // Add this useEffect
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <section className="w-full pb-8 md:pb-12 relative overflow-hidden order-first z-20 -mt-8">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white/90 to-violet-50/80 dark:from-gray-900/90 dark:via-gray-900/95 dark:to-indigo-950/80 z-0" />

      {/* Enhanced grid pattern background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5MDkwOTAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY6aDE4di02SDM2em0wIDEydjZoMTh2LTZIMzZ6bTAtMTJ2NmgxOHYtNkgzNnptMCAxMnY2aDE4di02SDM2ek0yNCAzNHY2aDZ2LTZoLTZ6bTAtMzB2OmgxOHYtNkgyNHptMCAxMnY2aDE4di02SDM0ek0xMiAzNHY2aDZ2LTZoLTZ6bTAtMzB2OmgxOHYtNkgxMnptMCAxMnY2aDE4di02SDEyek0wIDM0djZoMTJ2LTZIMHptMC0zMHY2aDEydi02SDB6bTAgMTJ2OmgxOHYtNkgwem0wIDEydjZoMTh2LTZIMHptMCAxMnY2aDE4di02SDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] bg-[size:30px_30px] z-0 opacity-30" />

      <div className="w-full relative z-10 overflow-x-hidden px-0 mx-0">
        {/* AI Matchmaker Interface */}
        <motion.div
          className="w-full mx-0 px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
            {/* Enhanced background gradient with animated pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-indigo-600/15 to-purple-600/20 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMjI2NTkiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY6aDE4di02SDM2em0wIDEydjZoMTh2LTZIMzZ6bTAtMTJ2NmgxOHYtNkgzNnptMCAxMnY2aDE4di02SDM2ek0yNCAzNHY2aDZ2LTZoLTZ6bTAtMzB2OmgxOHYtNkgyNHptMCAxMnY2aDE4di02SDM0ek0xMiAzNHY2aDZ2LTZoLTZ6bTAtMzB2OmgxOHYtNkgxMnptMCAxMnY2aDE4di02SDEyek0wIDM0djZoMTJ2LTZIMHptMC0zMHY2aDEydi02SDB6bTAgMTJ2OmgxOHYtNkgwem0wIDEydjZoMTh2LTZIMHptMCAxMnY2aDE4di02SDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] animate-[pulse_15s_ease-in-out_infinite] opacity-70"></div>

            {/* Enhanced header content - simplified with icon in top left */}
            <div className="relative flex items-center justify-between p-5 bg-white dark:bg-gray-900 backdrop-blur-sm mb-0 mt-8">
              <div className="flex items-center">
                <LevlLogo className="h-16 w-16 transition-all shadow-[0_4px_8px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_8px_rgba(79,70,229,0.2),0_2px_4px_rgba(79,70,229,0.1)]" />
              </div>
              <div className="flex items-center gap-3">
                {/* Portal Button */}
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

            {/* Category cards section */}
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
                  {/* Add this CSS rule to hide the scrollbar */}
                  <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
                  <div className="flex space-x-4 snap-x snap-mandatory px-4 md:px-8 -ml-2 md:-ml-4 mr-4 md:mr-8">
                    {[
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
                    ].map((category, index) => (
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
translate-y-[-4px] hover:translate-y-[-8px] 
after:content-[''] after:absolute after:bottom-[-15px] after:left-[5%] after:right-[5%] after:h-[15px] after:bg-indigo-500/20 dark:after:bg-indigo-500/30 after:blur-xl after:rounded-full"
                        onClick={() => handleCategoryClick(category.serviceType)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat messages - Enhanced UI */}
            <div
              id="chat-container"
              ref={chatContainerRef}
              className="relative overflow-y-auto p-6 pb-16 min-h-[600px] bg-white dark:bg-gray-900 backdrop-blur-sm shadow-inner border-t border-indigo-100/20 dark:border-indigo-800/20 rounded-b-lg mt-0 pt-4"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(79, 70, 229, 0.2) transparent",
              }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-100/20 to-transparent dark:from-indigo-900/10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-indigo-100/20 to-transparent dark:from-indigo-900/10 pointer-events-none" />

              {/* Custom scrollbar styling */}
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
                div::-webkit-scrollbar-track {
                  background: transparent;
                }
              `}</style>
              <div className="space-y-6 w-full">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    {message.type === "user" && (
                      <div className="flex justify-end">
                        <div className="relative bg-gradient-to-br from-lavender-200/95 via-lavender-300/90 to-lavender-200/90 dark:from-lavender-950/95 dark:via-lavender-950/90 dark:to-lavender-950/90 backdrop-blur-sm rounded-2xl px-5 py-3 max-w-[80%] shadow-[0_14px_20px_-3px_rgba(79,70,229,0.3),0_6px_10px_-4px_rgba(79,70,229,0.2),0_-2px_8px_0px_rgba(255,255,255,0.15)] dark:shadow-[0_10px_15px_-3px_rgba(79,70,229,0.3),0_4px_6px_-4px_rgba(0,0,0,0.4),0_-2px_6px_0px_rgba(79,70,229,0.1)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-800/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 translate-y-[-2px] hover:translate-y-[-4px] transition-all duration-300 transform">
                          <p className="text-sm text-gray-800 dark:text-gray-100 relative z-10">{message.content}</p>
                          <div className="text-[10px] text-black dark:text-white text-right mt-1 relative z-10">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {message.type === "ai" && (
                      <div className="flex">
                        <div className="relative bg-gradient-to-br from-white/95 via-white/90 to-lavender-50/90 dark:from-gray-800/95 dark:via-gray-800/90 dark:to-lavender-950/90 backdrop-blur-sm rounded-2xl px-5 py-3 max-w-[80%] shadow-[0_14px_20px_-3px_rgba(79,70,229,0.3),0_6px_10px_-4px_rgba(79,70,229,0.2),0_-2px_8px_0px_rgba(255,255,255,0.15)] dark:shadow-[0_10px_15px_-3px_rgba(79,70,229,0.3),0_4px_6px_-4px_rgba(0,0,0,0.4),0_-2px_6px_0px_rgba(79,70,229,0.1)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 translate-y-[-4px] transition-all duration-300 transform">
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-lavender-500/8 via-purple-500/8 to-violet-500/8 dark:from-lavender-500/15 dark:via-purple-500/15 dark:to-violet-500/15 opacity-80"></div>
                          <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-2xl bg-gradient-to-t from-black/5 to-transparent dark:from-white/5"></div>

                          <p className="text-sm relative z-10">{message.content}</p>

                          {message.options && (
                            <div className="mt-4 flex flex-wrap gap-2 relative z-10">
                              {message.options.map((option) => (
                                <button
                                  key={option}
                                  className="px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 hover:bg-lavender-100/90 dark:hover:bg-lavender-900/30 rounded-full text-xs font-medium transition-all duration-200 border border-lavender-200/70 dark:border-lavender-700/50 hover:border-lavender-300 dark:hover:border-lavender-600/70 backdrop-blur-sm hover:shadow-md"
                                  onClick={() => handleOptionSelect(option)}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                          {message.services && (
                            <div className="mt-5 space-y-4 relative z-10">
                              {message.services.map((service) => (
                                <ProviderCard
                                  key={service.provider.id}
                                  provider={service.provider}
                                  onSelect={(providerId) => router.push(`/services/${service.id}`)}
                                  onViewServices={(providerId) => router.push(`/services/${service.id}`)}
                                  onContact={(providerId) => router.push(`/messages?provider=${providerId}`)}
                                  matchScore={service.matchScore}
                                />
                              ))}
                            </div>
                          )}
                          <div className="text-[10px] text-black dark:text-white mt-1 relative z-10">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* loading message type */}
                    {message.type === "loading" && (
                      <div className="flex">
                        <div className="flex items-center">
                          <LevlLogo className="h-12 w-12 mr-2" />
                          <div className="flex space-x-1.5 ml-1">
                            <motion.div
                              className="h-1 w-1 bg-primary rounded-full"
                              animate={{ scale: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                            />
                            <motion.div
                              className="h-1 w-1 bg-primary rounded-full"
                              animate={{ scale: [0.5, 1, 0.5] }}
                              transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                                delay: 0.2,
                              }}
                            />
                            <motion.div
                              className="h-1 w-1 bg-primary rounded-full"
                              animate={{ scale: [0.5, 1, 0.5] }}
                              transition={{
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "easeInOut",
                                delay: 0.4,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                {/* Messages end ref for scrolling */}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input area - Enhanced UI with Levl styling directly integrated */}
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
                <div className="relative flex-1 border-none" style={{ borderBottom: "none" }}>
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder={isTyping ? "AI is thinking..." : "Type your message..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    disabled={isTyping}
                    className="pl-4 pr-12 py-6 bg-white/80 dark:bg-gray-800/80 border-0
      focus:ring-0 focus:outline-none focus:border-0
      rounded-full shadow-[0_4px_12px_rgba(79,70,229,0.15)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.2)]
      dark:shadow-[0_4px_12px_rgba(79,70,229,0.2)] dark:hover:shadow-[0_6px_16px_rgba(79,70,229,0.25)]
      transform hover:-translate-y-1 transition-all duration-300"
                    style={{ borderBottom: "none" }}
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

// Initialize long-term memory outside the component
const serviceCategoryMap: { [key: string]: string } = {
  tvMounting: "Mounting",
  plumbing: "Plumbing",
  painting: "Painting",
  furniture: "Assembly",
  moving: "Moving",
  cleaning: "Cleaning",
  electrical: "Electrical",
  landscaping: "Landscaping",
  flooring: "Flooring",
  roofing: "Roofing",
}
