"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Add import for EnhancedCategoryCard
import { EnhancedCategoryCard } from "@/components/enhanced-category-card"
import {
  Briefcase,
  Tv,
  Droplet,
  SprayCanIcon as Spray,
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

  if (lowerInput.includes("quality") || lowerInput.includes("good") || lowerInput.includes("reliable")) {
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
    flexibility: number // 0-10 scale
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
    options: string[]
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
    lastRecommendations: number[]
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
    content: "Hi there! I'm your AI service matchmaker. Please select one of the service cards above to get started.",
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
        "15-30 years",
        "Over 30 years",
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
        "New installation",
        "Replacement",
        "Repair",
        "Inspection",
        "Maintenance",
      ],
      "What is the approximate size of your roof?": [
        "Small (under 1,500 sq ft)",
        "Medium (1,500-2,500 sq ft)",
        "Large (2,500-4,000 sq ft)",
        "Very large (4,000+ sq ft)",
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

// Map service type to category
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

export function AIServiceMatchmaker() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showMatchmaker, setShowMatchmaker] = useState(true) // Changed to true to show by default
  const [matchedServices, setMatchedServices] = useState<Service[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [conversationStage, setConversationStage] = useState<
    "initial" | "understanding" | "service-specific" | "recommending" | "refining" | "finalizing"
  >("initial")

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
  const [aiModel, setAIModel] = useState<AIModelState>({
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
        longTerm: new Map(),
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
        anticipationFactors: ["budget_constraints", "quality_expectations", "time_sensitivity", "special_requirements"],
        interventionLevel: "medium",
      },
    },
  })

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

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    try {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        })
        // Prevent page from scrolling
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollIntoView({ block: "nearest" })
          }
        }, 100)
      }
    } catch (error) {
      console.error("Error scrolling to bottom:", error)
    }
  }

  useEffect(() => {
    // Only scroll if the chat is open AND we have more than the initial welcome message
    if (showMatchmaker && messages.length > 1) {
      scrollToBottom()
    }
  }, [messages, showMatchmaker])

  // Simulate AI typing
  const simulateTyping = (callback: () => void, delay = 1500) => {
    setIsTyping(true)
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      type: "loading",
      content: "Thinking...",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, typingMessage])

    setTimeout(() => {
      setMessages((prev) => prev.filter((msg) => msg.id !== typingMessage.id))
      setIsTyping(false)
      callback()
    }, delay)
  }

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

    // Process user input and generate AI response
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

  // Add this function after the existing detectUserIntent function
  const detectAdvancedIntent = (
    input: string,
    messages,
    userModel: UserPreferenceModel,
    contextualMemory: EnhancedReasoning["contextualMemory"],
  ): UserIntent & { subIntents: string[]; contextualFactors: Map<string, any> } => {
    // Get basic intent first
    const basicIntent = detectUserIntent(input)

    // Initialize enhanced result
    const enhancedIntent = {
      ...basicIntent,
      subIntents: [] as string[],
      contextualFactors: new Map<string, any>(),
    }

    const inputLower = input.toLowerCase()

    // Detect multiple intents in a single message
    if (inputLower.includes("but") || inputLower.includes("also") || inputLower.includes("and")) {
      // Message might contain multiple intents
      const segments = input.split(/\s+(?:but|also|and)\s+/i)

      if (segments.length > 1) {
        segments.slice(1).forEach((segment) => {
          const segmentIntent = detectUserIntent(segment)
          if (segmentIntent.type !== "general" && segmentIntent.confidence > 0.6) {
            enhancedIntent.subIntents.push(segmentIntent.type)
            // Merge entities
            segmentIntent.entities.forEach((entity) => {
              if (!enhancedIntent.entities.includes(entity)) {
                enhancedIntent.entities.push(entity)
              }
            })
          }
        })
      }
    }

    // Consider conversation context
    const conversationHistory = messages
    if (conversationHistory.length > 1) {
      const recentMessages = conversationHistory.slice(-3)
      const recentUserMessages = recentMessages.filter((msg) => msg.type === "user")

      // Check for follow-up questions
      if (
        recentUserMessages.length > 0 &&
        (inputLower.includes("what about") ||
          inputLower.includes("how about") ||
          inputLower.startsWith("and") ||
          inputLower.length < 15)
      ) {
        enhancedIntent.contextualFactors.set("isFollowUp", true)

        // Inherit entities from previous messages if this is a short follow-up
        if (inputLower.length < 15 && !enhancedIntent.entities.length) {
          recentUserMessages.forEach((msg) => {
            const prevIntent = detectUserIntent(msg.content)
            prevIntent.entities.forEach((entity) => {
              if (!enhancedIntent.entities.includes(entity)) {
                enhancedIntent.entities.push(entity)
              }
            })
          })
        }
      }
    }

    // Consider user model for contextual understanding
    if (userModel.budget.sensitivity > 7) {
      enhancedIntent.contextualFactors.set("budgetSensitive", true)
    }

    if (userModel.quality.importance > 7) {
      enhancedIntent.contextualFactors.set("qualitySensitive", true)
    }

    if (userModel.timing.urgency > 7) {
      enhancedIntent.contextualFactors.set("timeSensitive", true)
    }

    // Detect implicit intents
    if (
      !enhancedIntent.contextualFactors.has("budgetSensitive") &&
      (inputLower.includes("expensive") || inputLower.includes("cost") || inputLower.includes("price"))
    ) {
      enhancedIntent.contextualFactors.set("implicitBudgetConcern", true)
    }

    if (
      !enhancedIntent.contextualFactors.has("qualitySensitive") &&
      (inputLower.includes("quality") || inputLower.includes("best") || inputLower.includes("good"))
    ) {
      enhancedIntent.contextualFactors.set("implicitQualityConcern", true)
    }

    // Store in contextual memory
    contextualMemory.shortTerm.set("lastIntent", enhancedIntent)

    return enhancedIntent
  }

  // Replace the existing processUserInput function with this enhanced version
  const processUserInput = (input: string) => {
    // Update conversation flow in contextual memory
    aiModel.enhancedReasoning.contextualMemory.conversationFlow.push(input)

    // Analyze user input with advanced NLP
    const enhancedIntent = detectAdvancedIntent(
      input,
      messages,
      aiModel.userModel,
      aiModel.enhancedReasoning.contextualMemory,
    )

    // Update user model based on input with adaptive learning
    const updatedUserModel = updateUserModelWithAdaptiveLearning(
      aiModel.userModel,
      input,
      enhancedIntent,
      aiModel.conversationContext,
      aiModel.enhancedReasoning.adaptivePersonalization,
    )

    // Perform multi-step reasoning
    const reasoningSteps = performMultiStepReasoning(
      input,
      enhancedIntent,
      updatedUserModel,
      aiModel.conversationContext,
      aiModel.enhancedReasoning,
    )

    // Update AI model state with enhanced reasoning
    setAIModel((prevModel) => ({
      ...prevModel,
      lastUserIntent: enhancedIntent,
      userModel: updatedUserModel,
      reasoningTrace: [...prevModel.reasoningTrace, ...reasoningSteps],
      enhancedReasoning: {
        ...prevModel.enhancedReasoning,
        contextualMemory: {
          ...prevModel.enhancedReasoning.contextualMemory,
          shortTerm: new Map([
            ...Array.from(prevModel.enhancedReasoning.contextualMemory || new Map()),
            ["lastProcessedInput", input],
            ["lastIntent", enhancedIntent],
          ]),
        },
      },
    }))

    // Store user input with enhanced analysis
    setUserContextHistory((prev) => [
      ...prev,
      {
        query: input,
        timestamp: new Date(),
        intent: enhancedIntent.type,
        entities: enhancedIntent.entities,
        sentiment: analyzeSentiment(input).type,
        subIntents: enhancedIntent.subIntents,
        contextualFactors: Array.from(enhancedIntent.contextualFactors.keys()),
      },
    ])

    // Determine processing complexity for more realistic AI behavior
    const complexity = determineQueryComplexity(input, aiModel.conversationContext.stage)

    // Check if AI should be proactive based on context
    const shouldBeProactive = shouldTakeProactiveAction(
      enhancedIntent,
      aiModel.userModel,
      aiModel.conversationContext,
      aiModel.enhancedReasoning.proactiveCapabilities,
    )

    // Simulate AI thinking
    simulateTyping(() => {
      // Process based on conversation stage with enhanced decision making
      processConversationStage(input, enhancedIntent, shouldBeProactive)
    }, complexity)
  }

  // Add these new functions before the return statement

  // Enhanced user model update with adaptive learning
  const updateUserModelWithAdaptiveLearning = (
    currentModel: UserPreferenceModel,
    input: string,
    intent: UserIntent & { subIntents: string[]; contextualFactors: Map<string, any> },
    context: AIModelState["conversationContext"],
    adaptivePersonalization: EnhancedReasoning["adaptivePersonalization"],
  ): UserPreferenceModel => {
    // Start with basic update
    const updatedModel = updateUserModel(currentModel, input, intent, context)

    // Apply adaptive learning
    const learningRate = adaptivePersonalization.learningRate

    // Dynamically adjust weights based on user interaction patterns
    intent.entities.forEach((entity) => {
      if (services.some((s) => s.category === entity)) {
        // It's a valid category - apply stronger learning for repeated mentions
        const currentWeight = adaptivePersonalization.preferenceWeights.get(`category:${entity}`) || 1.0
        const newWeight = Math.min(3.0, currentWeight + learningRate)
        adaptivePersonalization.preferenceWeights.set(`category:${entity}`, newWeight)

        // Apply weighted learning to the category confidence
        const currentConfidence = updatedModel.categories.get(entity) || 0
        const weightedIncrement = 0.2 * newWeight
        const newConfidence = Math.min(0.98, currentConfidence + weightedIncrement)
        updatedModel.categories.set(entity, newConfidence)
      }
    })

    // Adapt to implicit signals
    if (intent.contextualFactors.has("implicitBudgetConcern")) {
      updatedModel.budget.sensitivity = Math.min(10, updatedModel.budget.sensitivity + learningRate * 2)
    }

    if (intent.contextualFactors.has("implicitQualityConcern")) {
      updatedModel.quality.importance = Math.min(10, updatedModel.quality.importance + learningRate * 2)
    }

    // Learn from feedback more aggressively
    if (intent.type === "feedback") {
      const sentiment = analyzeSentiment(input)

      if (sentiment.type === "positive" && sentiment.confidence > 0.7) {
        // Reinforce current preferences that led to positive feedback
        updatedModel.history.satisfactionTrend.push(0.9)

        // Strengthen weights for categories in last recommendations
        context.lastRecommendations.forEach((serviceId) => {
          const service = services.find((s) => s.id === serviceId)
          if (service) {
            const currentConfidence = updatedModel.categories.get(service.category) || 0
            updatedModel.categories.set(service.category, Math.min(0.95, currentConfidence + learningRate))
          }
        })
      } else if (sentiment.type === "negative" && sentiment.confidence > 0.6) {
        // Learn more aggressively from negative feedback
        updatedModel.history.satisfactionTrend.push(-0.8)
        updatedModel.history.refinementIterations += 1

        // Extract specific concerns for targeted learning
        const concerns = extractUserConcerns(input)
        concerns.forEach((concern) => {
          if (concern === "price") {
            updatedModel.budget.sensitivity = Math.min(10, updatedModel.budget.sensitivity + learningRate * 3)
          } else if (concern === "quality") {
            updatedModel.quality.importance = Math.min(10, updatedModel.quality.importance + learningRate * 3)
          } else if (concern === "timing") {
            updatedModel.timing.urgency = Math.min(10, updatedModel.timing.urgency + learningRate * 3)
          }
        })
      }
    }

    return updatedModel
  }

  // Multi-step reasoning process
  const performMultiStepReasoning = (
    input: string,
    intent: UserIntent & { subIntents: string[]; contextualFactors: Map<string, any> },
    userModel: UserPreferenceModel,
    context: AIModelState["conversationContext"],
    enhancedReasoning: EnhancedReasoning,
  ): ReasoningStep[] => {
    const reasoningSteps: ReasoningStep[] = []
    const reasoningId = `reasoning-${Date.now()}`

    // Step 1: Intent analysis with confidence
    reasoningSteps.push({
      id: `${reasoningId}-intent`,
      step: "Intent Analysis",
      reasoning: `Analyzed user input: "${input.substring(0, 50)}${input.length > 50 ? "..." : ""}"`,
      conclusion: `Primary intent: ${intent.type} (${Math.round(intent.confidence * 100)}% confidence)${
        intent.subIntents.length ? `, Sub-intents: ${intent.subIntents.join(", ")}` : ""
      }`,
      confidence: intent.confidence,
      timestamp: new Date(),
    })

    // Step 2: Context integration
    const contextualFactors = Array.from(intent.contextualFactors.entries())
    if (contextualFactors.length > 0 || context.depth > 0) {
      reasoningSteps.push({
        id: `${reasoningId}-context`,
        step: "Context Integration",
        reasoning: `Considering conversation context (stage: ${context.stage}, depth: ${context.depth})${
          contextualFactors.length ? ` and contextual factors: ${contextualFactors.map(([k, v]) => k).join(", ")}` : ""
        }`,
        conclusion: contextualFactors.length
          ? `User input should be interpreted in context of previous conversation and detected factors`
          : `Continuing conversation flow in ${context.stage} stage`,
        confidence: 0.85,
        timestamp: new Date(),
      })
    }

    // Step 3: User model evaluation
    const userModelInsights = []

    if (userModel.categories.size > 0) {
      const topCategory = Array.from(userModel.categories.entries()).sort((a, b) => b[1] - a[1])[0]
      if (topCategory && topCategory[1] > 0.6) {
        userModelInsights.push(
          `Strong preference for ${topCategory[0]} (${Math.round(topCategory[1] * 100)}% confidence)`,
        )
      }
    }

    if (userModel.budget.sensitivity > 7) {
      userModelInsights.push(`High budget sensitivity (${userModel.budget.sensitivity}/10)`)
    }

    if (userModel.quality.importance > 7) {
      userModelInsights.push(`High quality importance (${userModel.quality.importance}/10)`)
    }

    if (userModel.timing.urgency > 7) {
      userModelInsights.push(`High time urgency (${userModel.timing.urgency}/10)`)
    }

    if (userModelInsights.length > 0) {
      reasoningSteps.push({
        id: `${reasoningId}-user-model`,
        step: "User Model Evaluation",
        reasoning: `Analyzing current user preference model after ${userModel.history.interactionCount} interactions`,
        conclusion: `Key user preferences: ${userModelInsights.join("; ")}`,
        confidence: 0.9,
        timestamp: new Date(),
      })
    }

    // Step 4: Decision planning
    if (enhancedReasoning.reasoningCapabilities.chainOfThought) {
      let decisionPlan = ""
      let decisionConfidence = 0.7

      switch (context.stage) {
        case "initial":
          decisionPlan = "Begin understanding user needs through structured questions"
          decisionConfidence = 0.95
          break
        case "understanding":
          decisionPlan = "Continue gathering user preferences to build comprehensive model"
          decisionConfidence = 0.9
          break
        case "recommending":
          if (intent.type === "feedback") {
            const sentiment = analyzeSentiment(input)
            if (sentiment.type === "positive") {
              decisionPlan = "User is satisfied with recommendations; move to finalizing stage"
              decisionConfidence = 0.85
            } else {
              decisionPlan = "User needs refined recommendations; identify specific concerns"
              decisionConfidence = 0.8
            }
          } else {
            decisionPlan = "Provide personalized recommendations based on current user model"
            decisionConfidence = 0.85
          }
          break
        case "refining":
          decisionPlan = "Generate refined recommendations addressing user concerns"
          decisionConfidence = 0.8
          break
        case "finalizing":
          if (intent.type === "booking" || intent.subIntents.includes("booking")) {
            decisionPlan = "User wants to book; facilitate service selection and booking process"
            decisionConfidence = 0.9
          } else if (intent.type === "comparison" || intent.subIntents.includes("comparison")) {
            decisionPlan = "User wants to compare options; provide detailed comparison"
            decisionConfidence = 0.85
          } else {
            decisionPlan = "Guide user to final decision or provide additional information"
            decisionConfidence = 0.75
          }
          break
      }

      reasoningSteps.push({
        id: `${reasoningId}-decision`,
        step: "Decision Planning",
        reasoning: `Planning next action based on conversation stage (${context.stage}) and user intent (${intent.type})`,
        conclusion: decisionPlan,
        confidence: decisionConfidence,
        timestamp: new Date(),
      })
    }

    // Step 5: Self-critique (if enabled)
    if (enhancedReasoning.reasoningCapabilities.selfCritique && context.stage !== "initial") {
      // Evaluate quality of current understanding and recommendations
      const critiqueFocus =
        context.stage === "recommending" || context.stage === "refining" ? "recommendations" : "user understanding"

      const critiqueConcerns = []

      // Check for potential gaps in understanding
      if (userModel.categories.size === 0 && context.stage !== "understanding") {
        critiqueConcerns.push("No clear category preference detected")
      }

      if (userModel.requirements.explicit.length === 0 && context.stage !== "understanding") {
        critiqueConcerns.push("No explicit requirements captured")
      }

      if (userModel.history.satisfactionTrend.length > 0) {
        const recentSatisfaction = userModel.history.satisfactionTrend.slice(-3)
        const avgSatisfaction = recentSatisfaction.reduce((sum, val) => sum + val, 0) / recentSatisfaction.length

        if (avgSatisfaction < 0) {
          critiqueConcerns.push("Recent user satisfaction is negative")
        }
      }

      if (critiqueConcerns.length > 0) {
        reasoningSteps.push({
          id: `${reasoningId}-critique`,
          step: "Self-Critique",
          reasoning: `Evaluating quality of current ${critiqueFocus}`,
          conclusion: `Potential concerns: ${critiqueConcerns.join("; ")}. Will adjust approach accordingly.`,
          confidence: 0.75,
          timestamp: new Date(),
        })
      }
    }

    return reasoningSteps
  }

  // Determine if AI should take proactive action
  const shouldTakeProactiveAction = (
    intent: UserIntent & { subIntents: string[]; contextualFactors: Map<string, any> },
    userModel: UserPreferenceModel,
    context: AIModelState["conversationContext"],
    proactiveCapabilities: EnhancedReasoning["proactiveCapabilities"],
  ): boolean => {
    // Base threshold from configuration
    let threshold = proactiveCapabilities.suggestionThreshold

    // Adjust threshold based on intervention level
    if (proactiveCapabilities.interventionLevel === "high") {
      threshold -= 0.15
    } else if (proactiveCapabilities.interventionLevel === "low") {
      threshold += 0.15
    }

    // Factors that might trigger proactive behavior
    let proactiveScore = 0

    // 1. Low confidence in user intent suggests AI should be more proactive
    if (intent.confidence < 0.6) {
      proactiveScore += 0.2
    }

    // 2. If we're in refining stage with multiple refinement iterations
    if (context.stage === "refining" && userModel.history.refinementIterations > 1) {
      proactiveScore += 0.25 // User is struggling to find what they want
    }

    // 3. If user has expressed frustration
    const recentSatisfaction = userModel.history.satisfactionTrend.slice(-2)
    if (recentSatisfaction.length > 0 && recentSatisfaction.some((score) => score < -0.5)) {
      proactiveScore += 0.3 // User is frustrated, AI should be more helpful
    }

    // 4. If we have strong understanding of user needs but they're not making progress
    if (userModel.categories.size > 0 && context.stage === "finalizing" && intent.type === "general") {
      proactiveScore += 0.2 // We know what they want but they're not moving forward
    }

    // 5. If user has been in the same stage for too long
    if (context.depth > 3 && context.stage !== "finalizing") {
      proactiveScore += 0.15 // User might be stuck
    }

    return proactiveScore > threshold
  }

  // Process conversation based on stage with enhanced decision making
  const processConversationStage = (
    input: string,
    enhancedIntent: UserIntent & { subIntents: string[]; contextualFactors: Map<string, any> },
    shouldBeProactive: boolean,
  ) => {
    const currentStage = aiModel.conversationContext.stage

    // Handle proactive interventions if needed
    if (shouldBeProactive) {
      // AI takes initiative based on context
      if (currentStage === "understanding" && aiModel.conversationContext.depth > 2) {
        // We've asked enough questions, move to recommendations proactively
        handleProactiveRecommendation()
        return
      }

      if (currentStage === "recommending" && enhancedIntent.contextualFactors.has("implicitBudgetConcern")) {
        // User mentioned budget concerns without explicitly asking for cheaper options
        handleProactiveBudgetRefinement(input)
        return
      }

      if (currentStage === "finalizing" && aiModel.conversationContext.depth > 2) {
        // User seems indecisive, offer proactive guidance
        handleProactiveGuidance()
        return
      }
    }

    // Normal conversation flow with enhanced processing
    if (currentStage === "initial") {
      // Enhanced initial stage handling
      handleInitialStage(input, enhancedIntent)
    } else if (currentStage === "service-specific") {
      // Handle service-specific questions
      handleServiceSpecificQuestions(input)
    } else if (currentStage === "understanding") {
      // Enhanced understanding stage
      handleUnderstandingStage(input, enhancedIntent)
    } else if (currentStage === "recommending") {
      // Enhanced recommendation stage
      handleRecommendingStage(input, enhancedIntent)
    } else if (currentStage === "refining") {
      // Enhanced refining stage
      handleRefiningStage(input, enhancedIntent)
    } else if (currentStage === "finalizing") {
      // Enhanced finalizing stage
      handleFinalizingStage(input, enhancedIntent)
    }
  }

  // Add these handler functions for each conversation stage
  const handleInitialStage = (
    input: string,
    enhancedIntent: UserIntent & { subIntents: string[]; contextualFactors: Map<string, any> },
  ) => {
    // Detect service type from input
    let serviceType = null

    if (input.toLowerCase().includes("tv") || input.toLowerCase().includes("mount")) {
      serviceType = "tvMounting"
    } else if (
      input.toLowerCase().includes("plumb") ||
      input.toLowerCase().includes("leak") ||
      input.toLowerCase().includes("pipe")
    ) {
      serviceType = "plumbing"
    } else if (
      input.toLowerCase().includes("paint") ||
      input.toLowerCase().includes("wall") ||
      input.toLowerCase().includes("color")
    ) {
      serviceType = "painting"
    } else if (
      input.toLowerCase().includes("furniture") ||
      input.toLowerCase().includes("assemble") ||
      input.toLowerCase().includes("assembly")
    ) {
      serviceType = "furniture"
    }

    // If we detected a specific service type, go to service-specific questions
    if (serviceType) {
      setAIModel((prevModel) => ({
        ...prevModel,
        conversationContext: {
          ...prevModel.conversationContext,
          stage: "service-specific",
          depth: 1,
          currentServiceType: serviceType,
          currentServiceQuestion: 0,
        },
        reasoningTrace: [
          ...prevModel.reasoningTrace,
          {
            id: `stage-${Date.now()}`,
            step: "Stage Transition",
            reasoning: `Detected ${serviceType} request, moving to service-specific questions`,
            conclusion: "Transitioning to service-specific questions stage",
            confidence: 0.95,
            timestamp: new Date(),
          },
        ],
      }))

      // Ask the first service-specific question
      const firstQuestion = serviceSpecificQuestions[serviceType].questions[0]
      const options = serviceSpecificQuestions[serviceType].options[firstQuestion]

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: `I'll help you find the perfect ${
          serviceType === "tvMounting"
            ? "TV mounting"
            : serviceType === "plumbing"
              ? "plumbing"
              : serviceType === "painting"
                ? "painting"
                : "furniture assembly"
        } service. ${firstQuestion}`,
        timestamp: new Date(),
        options: options,
      }

      setMessages((prev) => [...prev, aiMessage])
    } else {
      // Continue with general questions as before
      setAIModel((prevModel) => ({
        ...prevModel,
        conversationContext: {
          ...prevModel.conversationContext,
          stage: "understanding",
          depth: 1,
        },
        reasoningTrace: [
          ...prevModel.reasoningTrace,
          {
            id: `stage-${Date.now()}`,
            step: "Stage Transition",
            reasoning: "Initial greeting completed, moving to understanding user needs",
            conclusion: "Transitioning to understanding stage",
            confidence: 0.95,
            timestamp: new Date(),
          },
        ],
      }))

      // Check if we can extract category from initial input
      let detectedCategory = null
      enhancedIntent.entities.forEach((entity) => {
        if (services.some((s) => s.category === entity)) {
          detectedCategory = entity
        }
      })

      // Personalize first question based on detected intent
      let firstQuestion = questions[0] // Default first question about budget
      let options = ["Budget-friendly", "Mid-range", "Premium", "No preference"]

      if (detectedCategory) {
        // If category is detected, acknowledge it and still ask about budget
        firstQuestion = `Great, I see you're interested in ${detectedCategory.toLowerCase()} services. What's your budget range for this?`
      } else if (enhancedIntent.contextualFactors.has("implicitBudgetConcern")) {
        // If budget is mentioned, skip to timing question
        firstQuestion = questions[1]
        options = ["As soon as possible", "Within a week", "Within a month", "Flexible"]
        setCurrentQuestion(1) // Skip the budget question
      } else if (enhancedIntent.contextualFactors.has("implicitQualityConcern")) {
        // If quality is mentioned, acknowledge it in budget question
        firstQuestion = "I understand quality is important to you. What's your budget range for this service?"
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: firstQuestion,
        timestamp: new Date(),
        options: options,
      }

      setMessages((prev) => [...prev, aiMessage])
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  // Add this new function to handle service-specific questions
  const handleServiceSpecificQuestions = (input: string) => {
    const serviceType = aiModel.conversationContext.currentServiceType

    if (!serviceType || !serviceSpecificQuestions[serviceType]) {
      // Fallback to understanding stage if something went wrong
      handleUnderstandingStage(input, {
        type: "general",
        confidence: 0.5,
        entities: [],
        subIntents: [],
        contextualFactors: new Map(),
      })
      return
    }

    // Store the answer to the current question
    const currentQuestion =
      serviceSpecificQuestions[serviceType].questions[aiModel.conversationContext.currentServiceQuestion]

    setAIModel((prevModel) => ({
      ...prevModel,
      conversationContext: {
        ...prevModel.conversationContext,
        serviceSpecificAnswers: new Map([
          ...Array.from(prevModel.conversationContext.serviceSpecificAnswers.entries()),
          [currentQuestion, input],
        ]),
        currentServiceQuestion: prevModel.conversationContext.currentServiceQuestion + 1,
      },
    }))

    // Check if we have more service-specific questions
    const nextQuestionIndex = aiModel.conversationContext.currentServiceQuestion + 1

    if (nextQuestionIndex < serviceSpecificQuestions[serviceType].questions.length) {
      // Ask the next service-specific question
      const nextQuestion = serviceSpecificQuestions[serviceType].questions[nextQuestionIndex]
      const options = serviceSpecificQuestions[serviceType].options[nextQuestion]

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: nextQuestion,
        timestamp: new Date(),
        options: options,
      }

      setMessages((prev) => [...prev, aiMessage])
    } else {
      // We've asked all service-specific questions, move to recommendations
      simulateThinkingWithReasoning(() => {
        // Update user model with service-specific information
        setAIModel((prevModel) => {
          const updatedModel = { ...prevModel }

          // Set the category based on service type
          const categoryMap: { [key: string]: string } = {
            tvMounting: "Mounting",
            plumbing: "Plumbing",
            painting: "Painting",
            furniture: "Assembly",
          }

          const category = categoryMap[serviceType]
          if (category) {
            updatedModel.userModel.categories.set(category, 0.95) // High confidence in category
          }

          // Add service-specific requirements to user model
          prevModel.conversationContext.serviceSpecificAnswers.forEach((answer, question) => {
            updatedModel.userModel.requirements.explicit.push(`${question}: ${answer}`)
          })

          return {
            ...updatedModel,
            conversationContext: {
              ...updatedModel.conversationContext,
              stage: "recommending",
              depth: updatedModel.conversationContext.depth + 1,
            },
          }
        })

        // Generate recommendations filtered by the specific service type
        generateServiceSpecificRecommendations()
      }, "complex")
    }
  }

  // Add this new function to generate service-specific recommendations
  const generateServiceSpecificRecommendations = () => {
    const serviceType = aiModel.conversationContext.currentServiceType

    if (!serviceType) {
      // Fallback to regular recommendations if something went wrong
      generateEnhancedRecommendations()
      return
    }

    // Map service type to category
    const categoryMap: { [key: string]: string } = {
      tvMounting: "Mounting",
      plumbing: "Plumbing",
      painting: "Painting",
      furniture: "Assembly",
      moving: "Moving",
      cleaning: "Cleaning",
      electrical: "Electrical",
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

    const category = serviceCategoryMap[serviceType]

    // Create Caydon Cooper as the first service provider
    const caydonCooper = {
      id: 999,
      title: `Premium ${category} Service`,
      category: category,
      provider: {
        id: 999,
        name: "Caydon Cooper",
        avatar: "/professional-avatar.png",
        rating: 5.0,
        reviews: 187,
        verified: true,
        responseTime: "< 30 minutes",
        completionRate: 99,
      },
      price: "$95",
      timeEstimate: "1-3 hours",
      description: `Expert ${category.toLowerCase()} service with premium quality and attention to detail. Satisfaction guaranteed.`,
      image: "/professional-avatar.png",
      tags: [`Professional ${category}`, "Premium Service", "Highly Rated"],
      matchScore: 98,
      completedProjects: 250,
      satisfaction: 99,
    }

    // Filter services by the specific category
    const filteredServices = services.filter((service) => service.category === category)

    // If we don't have enough services for this category, add some generic ones
    if (filteredServices.length < 4) {
      for (let i = filteredServices.length; i < 4; i++) {
        filteredServices.push({
          id: 1000 + i,
          title: `${category} Service ${i + 1}`,
          category: category,
          provider: {
            id: 1000 + i,
            name: `${category} Expert ${i + 1}`,
            avatar: "/professional-expert-avatar.png",
            rating: 4.7 + Math.random() * 0.3,
            reviews: 50 + Math.floor(Math.random() * 100),
            verified: Math.random() > 0.3,
            responseTime: "< 2 hours",
            completionRate: 94 + Math.floor(Math.random() * 6),
          },
          price: `$${70 + Math.floor(Math.random() * 50)}`,
          timeEstimate: "2-4 hours",
          description: `Professional ${category.toLowerCase()} service with great quality and customer service.`,
          image: "/professional-expert-avatar.png",
          tags: [`${category} Service`, "Professional", "Experienced"],
          matchScore: 85 + Math.floor(Math.random() * 10),
          completedProjects: 100 + Math.floor(Math.random() * 100),
          satisfaction: 90 + Math.floor(Math.random() * 10),
        })
      }
    }

    // Calculate match scores based on service-specific answers
    const matchedServices = filteredServices
      .map((service) => {
        let matchScore = 85 // Start with a high base score since we're already category-matched

        // Adjust score based on service-specific answers
        aiModel.conversationContext.serviceSpecificAnswers.forEach((answer, question) => {
          // Example scoring logic - this would be more sophisticated in a real implementation
          if (serviceType === "tvMounting") {
            if (
              question.includes("wall") &&
              answer.includes("Brick") &&
              service.description.toLowerCase().includes("brick")
            ) {
              matchScore += 5
            }
            if (
              question.includes("mount") &&
              answer.includes("need") &&
              service.description.toLowerCase().includes("mount included")
            ) {
              matchScore += 5
            }
            if (
              question.includes("cable") &&
              answer.includes("Yes") &&
              service.description.toLowerCase().includes("cable management")
            ) {
              matchScore += 5
            }
          }
          // Similar logic for other service types
        })

        // Cap at 100
        matchScore = Math.min(100, matchScore)

        return {
          ...service,
          matchScore,
        }
      })
      .sort((a, b) => b.matchScore - a.matchScore)

    // Add Caydon Cooper as the first option
    const finalServices = [caydonCooper, ...matchedServices.slice(0, 4)]

    setMatchedServices(finalServices)

    // Generate a personalized intro based on the service type
    const serviceTypeDisplay =
      serviceType === "tvMounting"
        ? "TV mounting"
        : serviceType === "furniture"
          ? "furniture assembly"
          : serviceType.charAt(0).toUpperCase() + serviceType.slice(1)

    const introMessage = `Based on your ${serviceTypeDisplay} requirements, here are the best professional service providers for you:`

    const recommendationMessage: Message = {
      id: `ai-${Date.now()}`,
      type: "ai",
      content: introMessage,
      timestamp: new Date(),
      services: finalServices,
    }

    setMessages((prev) => [...prev, recommendationMessage])

    // Ask for feedback
    // Ask for feedback
  }

  // Enhanced handlers for the remaining conversation stages
  const handleRecommendingStage = (
    input: string,
    enhancedIntent: UserIntent & { subIntents: string[]; contextualFactors: Map<string, any> },
  ) => {
    // Handle feedback on recommendations with enhanced understanding
    const sentiment = analyzeSentiment(input)

    if (enhancedIntent.type === "feedback" && sentiment.type === "positive") {
      // Positive feedback - move to finalizing with personalized next steps
      setAIModel((prevModel) => ({
        ...prevModel,
        conversationContext: {
          ...prevModel.conversationContext,
          stage: "finalizing",
          depth: prevModel.conversationContext.depth + 1,
        },
        userModel: {
          ...prevModel.userModel,
          history: {
            ...prevModel.userModel.history,
            satisfactionTrend: [...prevModel.userModel.history.satisfactionTrend, 0.8],
          },
        },
      }))

      // Determine most relevant next steps based on user model
      const nextStepOptions = ["Book a service"]

      // If user has shown interest in multiple categories, suggest comparison
      if (aiModel.userModel.categories.size > 1) {
        nextStepOptions.push("Compare top options")
      }

      // If user has high quality importance, suggest learning more
      if (aiModel.userModel.quality.importance > 6) {
        nextStepOptions.push("Learn more details")
      }

      // Add save option as fallback
      nextStepOptions.push("Save for later")

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: "Great! I'm glad these recommendations work for you. What would you like to do next?",
        timestamp: new Date(),
        options: nextStepOptions,
      }

      setMessages((prev) => [...prev, aiMessage])
    } else if (
      input.toLowerCase().includes("more options") ||
      input.toLowerCase().includes("show me more") ||
      enhancedIntent.subIntents.includes("more")
    ) {
      // Generate diverse alternatives with enhanced diversity
      const diverseResult = generateEnhancedDiverseAlternatives(
        matchedServices.map((service) => ({
          service,
          matchScore: service.matchScore,
          matchReasons: [{ factor: "Base Match", score: service.matchScore, explanation: "Base match score" }],
          confidenceScore: 0.7,
        })),
        services,
        aiModel.userModel,
        aiModel.enhancedReasoning,
      )

      // Update AI model with reasoning trace
      setAIModel((prevModel) => ({
        ...prevModel,
        reasoningTrace: [...prevModel.reasoningTrace, ...diverseResult.reasoning],
        conversationContext: {
          ...prevModel.conversationContext,
          lastRecommendations: diverseResult.matches.slice(0, 3).map((match) => match.service.id),
        },
      }))

      // Personalize the message based on what kind of diversity we're showing
      let diversityMessage = "Here are some additional options with different characteristics that might interest you:"

      if (diverseResult.diversityFocus === "category") {
        diversityMessage = "Here are some alternative service types that might also meet your needs:"
      } else if (diverseResult.diversityFocus === "price") {
        diversityMessage = "Here are some options at different price points that might interest you:"
      } else if (diverseResult.diversityFocus === "quality") {
        diversityMessage = "Here are some options with different quality/price tradeoffs:"
      }

      const moreOptionsMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: diversityMessage,
        timestamp: new Date(),
        services: diverseResult.matches.map((match) => ({
          ...match.service,
          matchScore: match.matchScore,
        })),
      }

      setMessages((prev) => [...prev, moreOptionsMessage])

      // Ask for feedback with context-aware options
      setTimeout(() => {
        const feedbackMessage: Message = {
          id: `feedback-${Date.now()}`,
          type: "feedback",
          content: "How do these additional options look?",
          timestamp: new Date(),
          feedbackOptions: [
            "These are better!",
            "I need something different",
            "Let's go back to the first options",
            "Can you compare these with the previous ones?",
          ],
        }

        setMessages((prev) => [...prev, feedbackMessage])
      }, 1000)
    } else if (
      input.toLowerCase().includes("explain") ||
      input.toLowerCase().includes("why") ||
      enhancedIntent.type === "information"
    ) {
      // Generate enhanced explanation with more personalization
      const explanation = generateEnhancedPersonalizedExplanation(
        matchedServices.map((service) => ({
          service,
          matchScore: service.matchScore,
          matchReasons: [
            {
              factor: "Category Match",
              score: 20,
              explanation: `Matches your interest in ${service.category} services`,
            },
            {
              factor: "Provider Quality",
              score: Math.floor((service.provider.rating - 4) * 10),
              explanation: `${service.provider.rating}★ rating from ${service.provider.reviews} reviews`,
            },
            { factor: "Price Compatibility", score: 10, explanation: `Priced at ${service.price}` },
          ],
          confidenceScore: 0.8,
        })),
        aiModel.userModel,
        aiModel.reasoningTrace,
        aiModel.enhancedReasoning,
      )

      // Update AI model
      setAIModel((prevModel) => ({
        ...prevModel,
        conversationContext: {
          ...prevModel.conversationContext,
          explanationProvided: true,
        },
      }))

      const explanationMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: explanation,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, explanationMessage])

      // Ask what they'd like to do next with personalized options
      setTimeout(() => {
        const nextStepMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: "Would you like to proceed with one of these options or see alternatives?",
          timestamp: new Date(),
          options: ["Book a service", "Show me more options", "I need something different"],
        }

        setMessages((prev) => [...prev, nextStepMessage])
      }, 1500)
    } else {
      // Refine recommendations based on feedback with enhanced understanding
      setAIModel((prevModel) => ({
        ...prevModel,
        conversationContext: {
          ...prevModel.conversationContext,
          stage: "refining",
          depth: prevModel.conversationContext.depth + 1,
        },
        userModel: {
          ...prevModel.userModel,
          history: {
            ...prevModel.userModel.history,
            refinementIterations: prevModel.userModel.history.refinementIterations + 1,
          },
        },
      }))

      // Extract concerns from feedback with enhanced NLP
      const concerns = extractEnhancedUserConcerns(input, enhancedIntent)

      // Generate a highly personalized refinement question
      const refinementQuestion = generateEnhancedPersonalizedRefinementQuestion(
        concerns,
        aiModel.userModel.history.refinementIterations,
        enhancedIntent,
        aiModel.enhancedReasoning,
      )

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: refinementQuestion,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    }
  }

  // Enhanced function to extract user concerns
  const extractEnhancedUserConcerns = (
    input: string,
    enhancedIntent: UserIntent & { subIntents: string[]; contextualFactors: Map<string, any> },
  ): string[] => {
    const concerns = extractUserConcerns(input) // Start with basic concerns
    const inputLower = input.toLowerCase()

    // Add concerns from contextual factors
    if (enhancedIntent.contextualFactors.has("implicitBudgetConcern")) {
      if (!concerns.includes("price")) concerns.push("price")
    }

    if (enhancedIntent.contextualFactors.has("implicitQualityConcern")) {
      if (!concerns.includes("quality")) concerns.push("quality")
    }

    if (enhancedIntent.contextualFactors.has("timeSensitive")) {
      if (!concerns.includes("timing")) concerns.push("timing")
    }

    // Look for more specific concerns
    if (inputLower.includes("experience") || inputLower.includes("expertise") || inputLower.includes("qualified")) {
      if (!concerns.includes("expertise")) concerns.push("expertise")
    }

    if (inputLower.includes("guarantee") || inputLower.includes("warranty") || inputLower.includes("reliable")) {
      if (!concerns.includes("reliability")) concerns.push("reliability")
    }

    if (inputLower.includes("location") || inputLower.includes("distance") || inputLower.includes("nearby")) {
      if (!concerns.includes("location")) concerns.push("location")
    }

    if (inputLower.includes("specific") || inputLower.includes("exactly") || inputLower.includes("precisely")) {
      if (!concerns.includes("specificity")) concerns.push("specificity")
    }

    return concerns.length > 0 ? concerns : ["general"]
  }

  // Enhanced personalized refinement question
  const generateEnhancedPersonalizedRefinementQuestion = (
    concerns: string[],
    refinementIterations: number,
    enhancedIntent: UserIntent & { subIntents: string[]; contextualFactors: Map<string, any> },
    enhancedReasoning: EnhancedReasoning,
  ): string => {
    // If this is a repeat refinement, acknowledge that with more empathy
    if (refinementIterations > 1) {
      // For multiple refinements, be more specific and empathetic
      if (concerns.includes("price")) {
        return "I understand price is really important to you. Could you tell me your specific budget range so I can find the most affordable options that still meet your needs? For example, is there a maximum amount you're comfortable spending?"
      }

      if (concerns.includes("quality")) {
        return "I see you're looking for higher quality services. Could you tell me which specific aspects of quality matter most to you - is it provider experience, ratings, customer reviews, or something else?"
      }

      if (concerns.includes("timing")) {
        return "Let me find options that better fit your schedule. When exactly do you need this service completed, and is there a specific day or time that works best for you?"
      }

      if (concerns.includes("expertise")) {
        return "I understand you want someone with specific expertise. Could you tell me what qualifications or experience level you're looking for in a service provider?"
      }

      if (concerns.includes("reliability")) {
        return "Reliability seems important to you. Are you looking for services with guarantees, warranties, or providers with particularly high completion rates?"
      }

      if (concerns.includes("relevance")) {
        return "I apologize for misunderstanding your needs. Could you describe exactly what type of service you're looking for, perhaps with some examples of what you have in mind?"
      }

      return "I apologize that my recommendations still aren't meeting your needs. Could you tell me more specifically what you're looking for in an ideal service provider?"
    }

    // First refinement attempt - more conversational and natural
    if (concerns.includes("price")) {
      return "I understand price is important to you. Could you tell me more about your budget constraints so I can find better matches? What price range would you consider reasonable for this service?"
    }

    if (concerns.includes("quality")) {
      return "I see you're looking for higher quality. Could you tell me more about what specific qualifications or experience level you're looking for? What aspects of quality matter most to you?"
    }

    if (concerns.includes("timing")) {
      return "Let me find options that better fit your schedule. When exactly do you need this service completed? Is this something urgent or do you have some flexibility?"
    }

    if (concerns.includes("expertise")) {
      return "Expertise seems important for this service. What specific skills or experience should the provider have to meet your needs?"
    }

    if (concerns.includes("reliability")) {
      return "I understand reliability is important. Are you looking for providers with guarantees, high ratings, or specific credentials to ensure quality work?"
    }

    if (concerns.includes("relevance")) {
      return "I understand these options aren't quite what you're looking for. Could you provide more details about the specific service you need? What would make a service perfect for your situation?"
    }

    // Check if we can infer anything from the enhanced intent
    if (enhancedIntent.entities.length > 0) {
      const categoryEntities = enhancedIntent.entities.filter((entity) =>
        services.some((service) => service.category === entity),
      )

      if (categoryEntities.length > 0) {
        return `I see you might be interested in ${categoryEntities[0]} services. Could you tell me more about what specific ${categoryEntities[0].toLowerCase()} service you're looking for and what matters most to you about it?`
      }
    }

    return "I understand these aren't quite what you're looking for. Could you tell me more about what you need so I can find better matches? What aspects are most important to you?"
  }

  // Enhanced function to generate diverse alternatives
  const generateEnhancedDiverseAlternatives = (
    currentMatches: ServiceMatch[],
    allServices: Service[],
    userModel: UserPreferenceModel,
    enhancedReasoning: EnhancedReasoning,
  ): MatchingResult & { diversityFocus: string } => {
    // Start with basic diverse alternatives
    const basicResult = generateDiverseAlternativesFn(currentMatches, allServices, userModel)

    // Determine what kind of diversity to focus on based on user model and context
    let diversityFocus = "balanced"

    // Check user model for clues about what kind of diversity to prioritize
    if (userModel.budget.sensitivity > 7) {
      // User is budget sensitive, focus on price diversity
      diversityFocus = "price"
    } else if (userModel.quality.importance > 7) {
      // User values quality, focus on quality diversity
      diversityFocus = "quality"
    } else if (userModel.categories.size > 0) {
      // User has category preferences, focus on category diversity
      diversityFocus = "category"
    }

    // Apply diversity focus to enhance results
    let enhancedMatches = [...basicResult.matches]

    if (diversityFocus === "price") {
      // Ensure we have a good spread of price points
      const priceRanges = new Map<string, number>() // low, medium, high -> count

      enhancedMatches.forEach((match) => {
        const price = Number.parseFloat(match.service.price.replace(/[^0-9.]/g, ""))
        const priceRange = price < 80 ? "low" : price < 120 ? "medium" : "high"
        priceRanges.set(priceRange, (priceRanges.get(priceRange) || 0) + 1)
      })

      // Find underrepresented price ranges
      const missingRanges = ["low", "medium", "high"].filter(
        (range) => !priceRanges.has(range) || (priceRanges.get(range) || 0) < 1,
      )

      if (missingRanges.length > 0) {
        // Find services in missing price ranges
        const remainingServices = allServices.filter(
          (service) => !enhancedMatches.some((match) => match.service.id === service.id),
        )

        missingRanges.forEach((range) => {
          const minPrice = range === "low" ? 0 : range === "medium" ? 80 : 120
          const maxPrice = range === "low" ? 80 : range === "medium" ? 120 : 1000

          const servicesInRange = remainingServices.filter((service) => {
            const price = Number.parseFloat(service.price.replace(/[^0-9.]/g, ""))
            return price >= minPrice && price < maxPrice
          })

          if (servicesInRange.length > 0) {
            // Find best match in this price range
            const bestMatch = servicesInRange
              .map((service) => {
                let score = 50

                // Quality score
                score += (service.provider.rating - 4) * 10

                // Category score
                if (userModel.categories.has(service.category)) {
                  score += 15
                }

                return { service, score }
              })
              .sort((a, b) => b.score - a.score)[0]

            // Add to enhanced matches if not already included
            if (!enhancedMatches.some((match) => match.service.id === bestMatch.service.id)) {
              enhancedMatches.push({
                service: bestMatch.service,
                matchScore: Math.min(85, bestMatch.score),
                matchReasons: [
                  {
                    factor: "Price Diversity",
                    score: 20,
                    explanation: `${range.charAt(0).toUpperCase() + range.slice(1)}-priced option at ${
                      bestMatch.service.price
                    }`,
                  },
                  {
                    factor: "Provider Quality",
                    score: Math.floor((bestMatch.service.provider.rating - 4) * 10),
                    explanation: `${bestMatch.service.provider.rating}★ rating from ${bestMatch.service.provider.reviews} reviews`,
                  },
                ],
                confidenceScore: 0.7,
              })
            }
          }
        })
      }
    } else if (diversityFocus === "category") {
      // Ensure we have diversity in categories
      const categories = new Set(enhancedMatches.map((match) => match.service.category))

      // Find categories not represented
      const allCategories = new Set(allServices.map((service) => service.category))
      const missingCategories = Array.from(allCategories).filter((category) => !categories.has(category))

      if (missingCategories.length > 0) {
        // Find services in missing categories
        const remainingServices = allServices.filter(
          (service) =>
            !enhancedMatches.some((match) => match.service.id === service.id) &&
            missingCategories.includes(service.category),
        )

        if (remainingServices.length > 0) {
          // Find best match in a missing category
          const bestMatch = remainingServices
            .map((service) => {
              let score = 50

              // Quality score
              score += (service.provider.rating - 4) * 10

              // Price score (inverse of budget sensitivity)
              const price = Number.parseFloat(service.price.replace(/[^0-9.]/g, ""))
              score += (10 - userModel.budget.sensitivity) * (price / 100)

              return { service, score }
            })
            .sort((a, b) => b.score - a.score)[0]

          // Add to enhanced matches
          enhancedMatches.push({
            service: bestMatch.service,
            matchScore: Math.min(80, bestMatch.score),
            matchReasons: [
              {
                factor: "Category Diversity",
                score: 20,
                explanation: `Alternative service type (${bestMatch.service.category})`,
              },
              {
                factor: "Provider Quality",
                score: Math.floor((bestMatch.service.provider.rating - 4) * 10),
                explanation: `${bestMatch.service.provider.rating}★ rating from ${bestMatch.service.provider.reviews} reviews`,
              },
            ],
            confidenceScore: 0.7,
          })
        }
      }
    }

    // Ensure we don't have more than 3 matches
    if (enhancedMatches.length > 3) {
      enhancedMatches = enhancedMatches.slice(0, 3)
    }

    // Ensure diversityFocus is defined
    if (!diversityFocus) {
      diversityFocus = "balanced"
    }

    // Add reasoning step about diversity focus
    const diversityReasoning: ReasoningStep = {
      id: `diversity-${Date.now()}`,
      step: "Diversity Enhancement",
      reasoning: `Applied ${diversityFocus} diversity focus based on user preferences and context`,
      conclusion: `Generated diverse alternatives with emphasis on ${diversityFocus} diversity`,
      confidence: 0.85,
      timestamp: new Date(),
    }

    return {
      ...basicResult,
      matches: enhancedMatches,
      reasoning: [...basicResult.reasoning, diversityReasoning],
      diversityFocus,
    }
  }

  // Enhanced personalized explanation
  const generateEnhancedPersonalizedExplanation = (
    matches: ServiceMatch[],
    userModel: UserPreferenceModel,
    reasoning: ReasoningStep[],
    enhancedReasoning: EnhancedReasoning,
  ): string => {
    // Start with basic explanation
    let explanation = generatePersonalizedExplanation(matches, userModel, reasoning)

    // Enhance the explanation with more personalized insights
    if (matches.length > 0) {
      const topMatch = matches[0]

      // Add more detailed reasoning based on enhanced reasoning capabilities
      if (enhancedReasoning.reasoningCapabilities.chainOfThought) {
        explanation += "\n\n**Why This Matches Your Needs:**\n"

        // Add specific insights based on user model
        if (userModel.budget.sensitivity > 7 && topMatch.service.price.replace(/[^0-9.]/g, "") < 100) {
          explanation += `\n• This option is budget-friendly at ${topMatch.service.price}, which aligns with your focus on affordability.`
        }

        if (userModel.quality.importance > 7 && topMatch.service.provider.rating > 4.7) {
          explanation += `\n• With a ${topMatch.service.provider.rating}★ rating from ${topMatch.service.provider.reviews} reviews, this provider meets your high quality standards.`
        }

        if (userModel.timing.urgency > 7 && topMatch.service.provider.responseTime.includes("1 hour")) {
          explanation += `\n• The provider's quick response time (${topMatch.service.provider.responseTime}) matches your need for timely service.`
        }

        // Add completion rate if it's high
        if (topMatch.service.provider.completionRate > 95) {
          explanation += `\n• This provider has an excellent track record with a ${topMatch.service.provider.completionRate}% completion rate.`
        }

        // Add project experience if available
        if (topMatch.service.completedProjects > 100) {
          explanation += `\n• With ${topMatch.service.completedProjects}+ completed projects, this provider brings substantial experience.`
        }
      }

      // Add comparison with alternatives if we have multiple matches
      if (matches.length > 1 && enhancedReasoning.reasoningCapabilities.selfCritique) {
        explanation += "\n\n**How These Options Compare:**\n"

        // Compare price points
        const prices = matches.map((match) => Number.parseFloat(match.service.price.replace(/[^0-9.]/g, "")))
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)

        if (maxPrice - minPrice > 20) {
          explanation += `\n• Price range: The options range from ${
            matches.find((m) => Number.parseFloat(m.service.price.replace(/[^0-9.]/g, "")) === minPrice)?.service.price
          } to ${matches.find((m) => Number.parseFloat(m.service.price.replace(/[^0-9.]/g, "")) === maxPrice)?.service.price}.`
        }

        // Compare ratings
        const ratings = matches.map((match) => match.service.provider.rating)
        const minRating = Math.min(...ratings)
        const maxRating = Math.max(...ratings)

        if (maxRating - minRating > 0.2) {
          explanation += `\n• Provider ratings: The providers range from ${minRating}★ to ${maxRating}★.`
        }

        // Compare response times if they differ
        const quickestResponse = matches.find((match) => match.service.provider.responseTime.includes("1 hour"))
        if (quickestResponse) {
          explanation += `\n• ${quickestResponse.service.provider.name} offers the quickest response time at ${quickestResponse.service.provider.responseTime}.`
        }
      }

      // Add confidence statement with more nuance
      const confidenceLevel =
        topMatch.confidenceScore > 0.9
          ? "highly confident"
          : topMatch.confidenceScore > 0.8
            ? "very confident"
            : topMatch.confidenceScore > 0.7
              ? "confident"
              : topMatch.confidenceScore > 0.6
                ? "reasonably confident"
                : "moderately confident"

      explanation += `\n\nBased on your specific preferences and my analysis, I'm ${confidenceLevel} that these recommendations align with your needs.`

      // Add next steps guidance
      explanation +=
        "\n\nWould you like to book one of these services, see more options, or learn more specific details about any of them?"
    }

    return explanation
  }

  // Handle refining stage with enhanced capabilities
  const handleRefiningStage = (
    input: string,
    enhancedIntent: UserIntent & { subIntents: string[]; contextualFactors: Map<string, any> },
  ) => {
    // Generate refined recommendations with enhanced understanding
    simulateThinkingWithReasoning(() => {
      // Update user model with refinement input using adaptive learning
      const refinedUserModel = updateUserModelWithAdaptiveLearning(
        aiModel.userModel,
        input,
        enhancedIntent,
        aiModel.conversationContext,
        aiModel.enhancedReasoning.adaptivePersonalization,
      )

      // Generate new recommendations with updated model and enhanced reasoning
      const refinedResult = matchServicesWithReasoning(services, refinedUserModel)

      // Apply personalization boost based on adaptive learning
      const personalizedMatches = refinedResult.matches.map((match) => {
        let personalizedScore = match.matchScore

        // Apply preference weights from adaptive learning
        if (
          aiModel.enhancedReasoning.adaptivePersonalization.preferenceWeights.has(`category:${match.service.category}`)
        ) {
          const weight =
            aiModel.enhancedReasoning.adaptivePersonalization.preferenceWeights.get(
              `category:${match.service.category}`,
            ) || 1.0
          personalizedScore = Math.min(100, personalizedScore * (1 + (weight - 1) * 0.2))
        }

        return {
          ...match,
          matchScore: Math.round(personalizedScore),
        }
      })

      // Sort by personalized score
      personalizedMatches.sort((a, b) => b.matchScore - a.matchScore)

      // Update AI model
      setAIModel((prevModel) => ({
        ...prevModel,
        userModel: refinedUserModel,
        reasoningTrace: [...prevModel.reasoningTrace, ...refinedResult.reasoning],
        conversationContext: {
          ...prevModel.conversationContext,
          stage: "finalizing",
          depth: prevModel.conversationContext.depth + 1,
          lastRecommendations: personalizedMatches.slice(0, 3).map((match) => match.service.id),
        },
      }))

      setMatchedServices(
        personalizedMatches.map((match) => ({
          ...match.service,
          matchScore: match.matchScore,
        })),
      )

      // Generate personalized refinement intro based on user model and refinement history
      let refinementIntro = generateRefinementResponseIntro(refinedUserModel.history.refinementIterations)

      // Add personalized touches based on what changed in the user model
      if (refinedUserModel.budget.sensitivity > aiModel.userModel.budget.sensitivity + 1) {
        refinementIntro =
          "Based on your feedback about budget, I've found these more affordable options that should better match your needs:"
      } else if (refinedUserModel.quality.importance > aiModel.userModel.quality.importance + 1) {
        refinementIntro =
          "I understand quality is important to you. Here are some higher-quality options that should better meet your standards:"
      } else if (refinedUserModel.timing.urgency > aiModel.userModel.timing.urgency + 1) {
        refinementIntro = "Given your time constraints, I've prioritized services with quick response times:"
      }

      const refinedMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: refinementIntro,
        timestamp: new Date(),
        services: personalizedMatches.slice(0, 3).map((match) => ({
          ...match.service,
          matchScore: match.matchScore,
        })),
      }

      setMessages((prev) => [...prev, refinedMessage])

      // Ask for feedback with personalized options based on refinement history
      setTimeout(() => {
        const feedbackOptions = ["Much better!", "Still not right"]

        // Add contextual options based on refinement history
        if (refinedUserModel.history.refinementIterations > 1) {
          feedbackOptions.push("Can you explain these recommendations?")
          feedbackOptions.push("I'll contact support for help")
        } else {
          feedbackOptions.push("Can you show me more variety?")
          feedbackOptions.push("I'd like to compare these options")
        }

        const feedbackMessage: Message = {
          id: `feedback-${Date.now()}`,
          type: "feedback",
          content: "How do these refined options look?",
          timestamp: new Date(),
          feedbackOptions: feedbackOptions,
        }

        setMessages((prev) => [...prev, feedbackMessage])
      }, 1000)
    }, "complex")
  }

  // Handle finalizing stage with enhanced capabilities
  const handleFinalizingStage = (
    input: string,
    enhancedIntent: UserIntent & { subIntents: string[]; contextualFactors: Map<string, any> },
  ) => {
    // Handle final decision with enhanced understanding
    const primaryIntent = enhancedIntent.type
    const subIntents = enhancedIntent.subIntents

    // Check for booking intent in primary or sub-intents
    if (primaryIntent === "booking" || subIntents.includes("booking") || input.toLowerCase().includes("book")) {
      // Determine which service they want to book
      let serviceToBook: Service | undefined

      // Check if they mentioned a specific service
      for (const service of matchedServices) {
        if (input.toLowerCase().includes(service.title.toLowerCase())) {
          serviceToBook = service
          break
        }
      }

      // If no specific service mentioned, use the top match
      if (!serviceToBook && matchedServices.length > 0) {
        serviceToBook = matchedServices[0]
      }

      const bookingMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: serviceToBook
          ? `Great! I'll take you to the booking page for "${serviceToBook.title}" provided by ${serviceToBook.provider.name}.`
          : "Great! I'll take you to the booking page for your selected service.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, bookingMessage])

      // In a real app, this would redirect to the booking page
      setTimeout(() => {
        router.push(serviceToBook ? `/services/${serviceToBook.id}` : "/services/1")
      }, 2000)
    } else if (
      primaryIntent === "comparison" ||
      subIntents.includes("comparison") ||
      input.toLowerCase().includes("compare")
    ) {
      // Set comparison mode with enhanced comparison
      setAIModel((prevModel) => ({
        ...prevModel,
        conversationContext: {
          ...prevModel.conversationContext,
          comparisonMode: true,
        },
      }))

      // Generate enhanced comparison with more details
      const comparisonContent = generateEnhancedServiceComparison(
        matchedServices.slice(0, Math.min(3, matchedServices.length)),
      )

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: `Here's a detailed comparison of the top options:\n\n${comparisonContent}`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])

      // Follow up with personalized recommendation
      setTimeout(() => {
        // Determine which service best matches their preferences
        const topMatch = matchedServices.sort((a, b) => b.matchScore - a.matchScore)[0]

        const followUpMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: `Based on your preferences, "${topMatch.title}" seems to be the best match for you. Would you like to book this service or learn more about any of the options?`,
          timestamp: new Date(),
          options: [
            `Book ${topMatch.title}`,
            ...matchedServices
              .slice(0, Math.min(3, matchedServices.length))
              .filter((service) => service.id !== topMatch.id)
              .map((service) => `Book ${service.title}`),
            "I need more information",
          ],
        }

        setMessages((prev) => [...prev, followUpMessage])
      }, 1500)
    } else if (
      primaryIntent === "information" ||
      subIntents.includes("information") ||
      input.toLowerCase().includes("learn more") ||
      input.toLowerCase().includes("details")
    ) {
      // Determine which service they want to learn about
      let serviceToDetail: Service | undefined

      // Check if they mentioned a specific service
      for (const service of matchedServices) {
        if (input.toLowerCase().includes(service.title.toLowerCase())) {
          serviceToDetail = service
          break
        }
      }

      if (serviceToDetail) {
        // Generate detailed information about the specific service
        const detailedInfo = generateEnhancedServiceDetails(serviceToDetail)

        const detailMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: detailedInfo,
          timestamp: new Date(),
          options: ["Book this service", "Compare with other options", "Go back to all recommendations"],
        }

        setMessages((prev) => [...prev, detailMessage])
      } else {
        // Ask which service they want to learn about
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content:
            "I'd be happy to provide more details about these services. Which one would you like to learn more about?",
          timestamp: new Date(),
          options: matchedServices.slice(0, 3).map((service) => `Learn about "${service.title}"`),
        }

        setMessages((prev) => [...prev, aiMessage])
      }
    } else if (primaryIntent === "save" || subIntents.includes("save") || input.toLowerCase().includes("save")) {
      // Enhanced save functionality with next steps
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content:
          "I've saved these recommendations for you. You can access them anytime from your saved items. Would you like me to send you an email with these recommendations for future reference?",
        timestamp: new Date(),
        options: ["Yes, email me the recommendations", "No thanks", "Find another service", "Talk to a human agent"],
      }

      setMessages((prev) => [...prev, aiMessage])
    } else {
      // Enhanced general follow-up with personalized suggestions
      const topMatch = matchedServices.length > 0 ? matchedServices[0] : null

      const nextStepOptions = ["Find another service", "No, that's all for now"]

      // Add personalized options based on user model
      if (topMatch) {
        nextStepOptions.unshift(`Book ${topMatch.title}`)

        if (matchedServices.length > 1) {
          nextStepOptions.unshift("Compare top options")
        }
      }

      // Add support option if we've been through multiple iterations
      if (aiModel.userModel.history.refinementIterations > 1) {
        nextStepOptions.push("Talk to a human agent")
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: "Is there anything else I can help you with today?",
        timestamp: new Date(),
        options: nextStepOptions,
      }

      setMessages((prev) => [...prev, aiMessage])
    }
  }

  // Generate enhanced service comparison
  const generateEnhancedServiceComparison = (services: Service[]): string => {
    if (services.length < 2) {
      return "I need at least two services to compare."
    }

    let comparison = "| Feature | "
    services.forEach((service) => {
      comparison += `${service.title} | `
    })
    comparison += "\n|---|"
    services.forEach(() => {
      comparison += "---|"
    })

    // Price comparison
    comparison += "\n| Price | "
    services.forEach((service) => {
      comparison += `${service.price} | `
    })

    // Provider rating comparison
    comparison += "\n| Provider Rating | "
    services.forEach((service) => {
      comparison += `${service.provider.rating}★ (${service.provider.reviews} reviews) | `
    })

    // Response time comparison
    comparison += "\n| Response Time | "
    services.forEach((service) => {
      comparison += `${service.provider.responseTime} | `
    })

    // Completion rate comparison
    comparison += "\n| Completion Rate | "
    services.forEach((service) => {
      comparison += `${service.provider.completionRate}% | `
    })

    // Category comparison
    comparison += "\n| Category | "
    services.forEach((service) => {
      comparison += `${service.category} | `
    })

    // Match score comparison
    comparison += "\n| Match Score | "
    services.forEach((service) => {
      comparison += `${service.matchScore}% | `
    })

    // Add more detailed comparisons

    // Completed projects comparison
    comparison += "\n| Completed Projects | "
    services.forEach((service) => {
      comparison += `${service.completedProjects}+ | `
    })

    // Customer satisfaction comparison
    comparison += "\n| Customer Satisfaction | "
    services.forEach((service) => {
      comparison += `${service.satisfaction}% | `
    })

    // Service description summary
    comparison += "\n| Service Description | "
    services.forEach((service) => {
      // Truncate description to keep table readable
      const shortDesc =
        service.description.length > 50 ? service.description.substring(0, 50) + "..." : service.description
      comparison += `${shortDesc} | `
    })

    // Time estimate comparison
    comparison += "\n| Time Estimate | "
    services.forEach((service) => {
      comparison += `${service.timeEstimate} | `
    })

    return comparison
  }

  // Generate enhanced service details
  const generateEnhancedServiceDetails = (service: Service): string => {
    return `
# ${service.title}

**Provider:** ${service.provider.name} (${service.provider.rating}★ from ${service.provider.reviews} reviews)
${service.provider.verified ? "✓ Verified Provider" : ""}

**Price:** ${service.price}
**Estimated Time:** ${service.timeEstimate}
**Category:** ${service.category}
**Match Score:** ${service.matchScore}%

## Service Description
${service.description}

## Provider Details
- Response Time: ${service.provider.responseTime}
- Completion Rate: ${service.provider.completionRate}%
- Completed Projects: ${service.completedProjects}+
- Customer Satisfaction: ${service.satisfaction}%

## What's Included
${service.tags.map((tag) => `- ${tag}`).join("\n")}

Would you like to book this service or compare it with other options?
`
  }

  // Reset conversation with enhanced memory
  const resetConversation = () => {
    // Store some long-term memory before resetting
    const longTermMemory = new Map(aiModel.enhancedReasoning.contextualMemory)

    // Store category preferences in long-term memory
    aiModel.userModel.categories.forEach((confidence, category) => {
      if (confidence > 0.6) {
        longTermMemory.set(`category_preference:${category}`, confidence)
      }
    })

    // Store budget sensitivity in long-term memory if it's significant
    if (aiModel.userModel.budget.sensitivity !== 5) {
      longTermMemory.set("budget_sensitivity", aiModel.userModel.budget.sensitivity)
    }

    // Store quality importance in long-term memory if it's significant
    if (aiModel.userModel.quality.importance !== 7) {
      longTermMemory.set("quality_importance", aiModel.userModel.quality.importance)
    }

    // Reset conversation state
    setMessages(initialMessages)
    setInputValue("")
    setIsTyping(false)
    setMatchedServices([])
    setCurrentQuestion(0)
    setConversationStage("initial")
    setUserContextHistory([])
    setDetectedPreferences({
      category: null,
      budget: null,
      timeframe: null,
      experienceImportance: null,
      hasSpecificRequirements: false,
      specificRequirements: null,
    })

    // Reset AI model but preserve long-term memory
    setAIModel({
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
          longTerm: longTermMemory, // Preserve long-term memory
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
          anticipationFactors: [
            "budget_constraints",
            "quality_expectations",
            "time_sensitivity",
            "special_requirements",
          ],
          interventionLevel: "medium",
        },
      },
    })
  }

  const handleFeedbackSelect = (option: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: option,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    processUserInput(option)
  }

  const simulateThinkingWithReasoning = (callback: () => void, complexity: string) => {
    const delay = determineQueryComplexity("", complexity)
    simulateTyping(callback, delay)
  }

  const categoriesRef = useRef<HTMLDivElement>(null)

  // Handle category card click
  const handleCategoryClick = (serviceType: string) => {
    // Reset conversation first
    setMessages([])
    setInputValue("")
    setIsTyping(false)
    setMatchedServices([])

    // Set AI model to service-specific questions stage
    setAIModel((prevModel) => ({
      ...prevModel,
      conversationContext: {
        ...prevModel.conversationContext,
        stage: "service-specific",
        depth: 1,
        currentServiceType: serviceType,
        currentServiceQuestion: 0,
        serviceSpecificAnswers: new Map(),
      },
      reasoningTrace: [
        {
          id: `stage-${Date.now()}`,
          step: "Stage Transition",
          reasoning: `User selected ${serviceType} category, moving to service-specific questions`,
          conclusion: "Transitioning to service-specific questions stage",
          confidence: 0.95,
          timestamp: new Date(),
        },
      ],
    }))

    // Ask the first service-specific question
    if (serviceSpecificQuestions[serviceType]) {
      const firstQuestion = serviceSpecificQuestions[serviceType].questions[0]
      const options = serviceSpecificQuestions[serviceType].options[firstQuestion]

      const serviceTypeDisplay =
        serviceType === "tvMounting"
          ? "TV mounting"
          : serviceType === "furniture"
            ? "furniture assembly"
            : serviceType.charAt(0).toUpperCase() + serviceType.slice(1)

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: `I'll help you find the perfect ${serviceTypeDisplay} service. ${firstQuestion}`,
        timestamp: new Date(),
        options: options,
      }

      setMessages((prev) => [...prev, aiMessage])
    }
  }

  // Handle horizontal scrolling for categories
  const scrollCategories = (direction: "left" | "right") => {
    if (categoriesRef.current) {
      const scrollAmount = 200 // Adjust as needed
      const currentScroll = categoriesRef.current.scrollLeft

      categoriesRef.current.scrollTo({
        left: direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: "smooth",
      })
    }
  }

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
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
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

  const processQuestionAnswer = (questionIndex: number, answer: string) => {
    // Update user model based on the answer
    setAIModel((prevModel) => {
      const updatedModel = { ...prevModel }

      switch (questionIndex) {
        case 0:
          // Budget question
          if (answer.toLowerCase().includes("budget-friendly")) {
            updatedModel.userModel.budget.sensitivity = 8
          } else if (answer.toLowerCase().includes("mid-range")) {
            updatedModel.userModel.budget.sensitivity = 5
          } else if (answer.toLowerCase().includes("premium")) {
            updatedModel.userModel.budget.sensitivity = 2
          } else {
            updatedModel.userModel.budget.sensitivity = 5
          }
          break
        case 1:
          // Timeframe question
          if (answer.toLowerCase().includes("as soon as possible")) {
            updatedModel.userModel.timing.urgency = 8
          } else if (answer.toLowerCase().includes("within a week")) {
            updatedModel.userModel.timing.urgency = 6
          } else if (answer.toLowerCase().includes("within a month")) {
            updatedModel.userModel.timing.urgency = 4
          } else {
            updatedModel.userModel.timing.urgency = 5
          }
          break
        case 2:
          // Experience question
          if (answer.toLowerCase().includes("very important")) {
            updatedModel.userModel.quality.importance = 8
          } else if (answer.toLowerCase().includes("somewhat important")) {
            updatedModel.userModel.quality.importance = 6
          } else if (answer.toLowerCase().includes("not very important")) {
            updatedModel.userModel.quality.importance = 4
          } else {
            updatedModel.userModel.quality.importance = 5
          }
          break
        case 3:
          // Specific requirements question
          if (answer.toLowerCase().includes("yes")) {
            updatedModel.userModel.requirements.explicit.push("Specific requirements")
          }
          break
      }

      return updatedModel
    })
  }

  // Proactive action handlers
  const handleProactiveRecommendation = () => {
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      type: "ai",
      content:
        "I've gathered enough information to provide some recommendations. Here are some services that might be a good fit for you:",
      timestamp: new Date(),
      services: services.slice(0, 3),
    }

    setMessages((prev) => [...prev, aiMessage])
    setAIModel((prevModel) => ({
      ...prevModel,
      conversationContext: {
        ...prevModel.conversationContext,
        stage: "recommending",
        depth: prevModel.conversationContext.depth + 1,
      },
    }))
  }

  const handleProactiveBudgetRefinement = (input: string) => {
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      type: "ai",
      content: "I noticed you mentioned budget concerns. Would you like me to prioritize more affordable options?",
      timestamp: new Date(),
      options: ["Yes, show me cheaper options", "No, continue with current options"],
    }

    setMessages((prev) => [...prev, aiMessage])
  }

  const handleProactiveGuidance = () => {
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      type: "ai",
      content:
        "I see you're having trouble deciding. Would you like me to highlight the best option based on your preferences?",
      timestamp: new Date(),
      options: ["Yes, highlight the best option", "No, I'll decide myself"],
    }

    setMessages((prev) => [...prev, aiMessage])
  }

  const handleUnderstandingStage = (
    input: string,
    enhancedIntent: UserIntent & { subIntents: string[]; contextualFactors: Map<string, any> },
  ) => {
    // Enhanced understanding stage logic here
    // For example, you can add more sophisticated intent recognition and user model updates
    // For now, let's just move to the recommending stage
    setAIModel((prevModel) => ({
      ...prevModel,
      conversationContext: {
        ...prevModel.conversationContext,
        stage: "recommending",
        depth: prevModel.conversationContext.depth + 1,
      },
    }))

    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      type: "ai",
      content: "Okay, I think I have a good understanding of your needs. Here are some recommendations:",
      timestamp: new Date(),
      services: services.slice(0, 3),
    }

    setMessages((prev) => [...prev, aiMessage])
  }

  const generateEnhancedRecommendations = () => {
    // Enhanced recommendation generation logic here
    // For example, you can use more sophisticated matching algorithms and personalization techniques
    // For now, let's just generate some random recommendations
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      type: "ai",
      content: "Here are some enhanced recommendations based on your preferences:",
      timestamp: new Date(),
      services: services.slice(0, 3),
    }

    setMessages((prev) => [...prev, aiMessage])
  }

  // Add this function after the renderEnhancedServiceCard function
  const renderShowMoreButton = () => {
    return (
      <div
        className="flex justify-center items-center mt-4 cursor-pointer"
        onClick={() => {
          // Generate more recommendations
          const moreServices = services.filter((s) => !matchedServices.some((ms) => ms.id === s.id)).slice(0, 3)

          if (moreServices.length > 0) {
            setMatchedServices([...matchedServices, ...moreServices])
          }
        }}
      >
        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-md hover:bg-indigo-700 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </div>
    )
  }

  const handleServiceSelect = (serviceId: number) => {
    // Navigate to the service details page
    router.push(`/services/${serviceId}`)
  }

  const handleCompare = (serviceId: number) => {
    // Implement comparison logic here
    console.log(`Compare service with ID: ${serviceId}`)
  }

  const [filteredServices, setFilteredServices] = useState<Service[]>(services.slice(0, 3))

  return (
    <section className="w-full pb-8 md:pb-12 relative overflow-hidden order-first z-20 -mt-8">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white/90 to-violet-50/80 dark:from-gray-900/90 dark:via-gray-900/95 dark:to-indigo-950/80 z-0" />

      {/* Enhanced grid pattern background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5MDkwOTAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY6aDE4di02SDM2em0wIDEydjZoMTh2LTZIMzZ6bTAtMTJ2NmgxOHYtNkgzNnptMCIDEydjZoMTh2LTZIMzZ6TTI0IDM0djZoNnYtNmgtNnptMC0zMHY6aDE4di02SDI0em0wIDEydjZoMTh2LTZIMjR6TTEyIDM0djZoNnYtNmgtNnptMC0zMHY6aDE4di02SDEyem0wIDEydjZoMTh2LTZIMTJ6TTAgMzR2NmgxMnYtNkgwem0wLTMwdjZoMTJ2LTZIMHptMCAxMnY6aDE4di02SDB6bTAgMTJ2NmgxOHYtNkgwem0wIDEydjZoMTh2LTZIMHoiLz48L2c+PC9nPjwvc3ZnPg==')] bg-[size:30px_30px] z-0 opacity-30" />

      <div className="w-full relative z-10 overflow-x-hidden px-0 mx-0">
        {/* AI Matchmaker Interface */}
        <motion.div
          className="w-full mx-0 px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
            {/* Enhanced background gradient with animated pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-indigo-600/15 to-purple-600/20 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMjI2NTkiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY6aDE4di02SDM2em0wIDEydjZoMTh2LTZIMzZ6bTAtMTJ2NmgxOHYtNkgzNnptMCIDEydjZoMTh2LTZIMzZ6TTI0IDM0djZoNnYtNmgtNnptMC0zMHY6aDE4di02SDI0em0wIDEydjZoMTh2LTZIMjR6TTEyIDM0djZoNnYtNmgtNnptMC0zMHY6aDE4di02SDEyem0wIDEydjZoMTh2LTZIMTJ6TTAgMzR2NmgxMnYtNkgwem0wLTMwdjZoMTJ2LTZIMHptMCAxMnY6aDE4di02SDB6bTAgMTJ2NmgxOHYtNkgwem0wIDEydjZoMTh2LTZIMHoiLz48L2c+PC9nPjwvc3ZnPg==')] animate-[pulse_15s_ease-in-out_infinite] opacity-70"></div>

            {/* Enhanced header content - simplified with icon in top left */}
            <div className="relative flex items-center justify-between p-5 border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm mb-0 mt-8">
              <div className="flex items-center">
                <LevlLogo className="h-16 w-16 transition-all shadow-[0_4px_8px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_8px_rgba(79,70,229,0.2),0_2px_4px_rgba(79,70,229,0.1)]" />
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Profile
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  About
                </Link>
                <Link
                  href="/forum"
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Forum
                </Link>
              </div>
            </div>

            <div className="border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-gray-50/80 via-white/80 to-gray-50/80 dark:from-gray-900/80 dark:via-gray-900/90 dark:to-gray-900/80">
              <div className="relative overflow-hidden w-full">
                <div
                  className="overflow-x-auto pb-2 pt-2 scrollbar-hide w-full"
                  ref={categoriesRef}
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {/* Add this CSS rule to hide the scrollbar */}
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  <div className="flex space-x-4 pb-2 px-6 snap-x snap-mandatory scroll-pl-6 scroll-pr-6 scroll-smooth">
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
                        className="w-36 h-36 flex-shrink-0 my-2 mx-1 transform-gpu hover:translate-y-0"
                        onClick={() => handleCategoryClick(category.serviceType)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat messages - Enhanced UI */}
            <div
              ref={chatContainerRef}
              className="relative h-[500px] overflow-y-auto p-6 bg-gradient-to-b from-gray-50/80 via-indigo-50/10 to-white/90 dark:from-gray-900/90 dark:via-indigo-950/20 dark:to-gray-950/80 backdrop-blur-sm shadow-inner border-t border-b border-indigo-100/20 dark:border-indigo-800/20"
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
                        <div className="relative bg-gradient-to-br from-lavender-200/95 via-lavender-300/90 to-lavender-200/90 dark:from-lavender-950/95 dark:via-lavender-950/90 dark:to-lavender-950/90 backdrop-blur-sm rounded-2xl px-5 py-3 max-w-[80%] shadow-[0_10px_15px_-3px_rgba(139,92,246,0.2),0_4px_6px_-4px_rgba(139,92,246,0.2),0_-2px_6px_0px_rgba(255,255,255,0.1)] dark:shadow-[0_10px_15px_-3px_rgba(139,92,246,0.3),0_4px_6px_-4px_rgba(0,0,0,0.4),0_-2px_6px_0px_rgba(139,92,246,0.1)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-800/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 translate-y-[-2px] hover:translate-y-[-4px] transition-all duration-300 transform">
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
                        <div className="relative bg-gradient-to-br from-white/95 via-white/90 to-indigo-50/90 dark:from-gray-800/95 dark:via-gray-800/90 dark:to-indigo-950/90 backdrop-blur-sm rounded-2xl px-5 py-3 max-w-[80%] shadow-[0_10px_15px_-3px_rgba(79,70,229,0.2),0_4px_6px_-4px_rgba(79,70,229,0.2),0_-2px_6px_0px_rgba(255,255,255,0.1)] dark:shadow-[0_10px_15px_-3px_rgba(79,70,229,0.3),0_4px_6px_-4px_rgba(0,0,0,0.4),0_-2px_6px_0px_rgba(79,70,229,0.1)] border-t border-l border-r border-indigo-100/70 dark:border-t dark:border-l dark:border-r dark:border-indigo-700/40 border-b-2 border-b-indigo-200/80 dark:border-b-2 dark:border-b-indigo-800/80 translate-y-[-2px] hover:translate-y-[-4px] transition-all duration-300 transform hover:shadow-[0_14px_20px_-3px_rgba(79,70,229,0.3),0_6px_10px_-4px_rgba(79,70,229,0.2),0_-2px_8px_0px_rgba(255,255,255,0.15)]">
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/8 via-purple-500/8 to-violet-500/8 dark:from-indigo-500/15 dark:via-purple-500/15 dark:to-violet-500/15 opacity-80"></div>
                          <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-2xl bg-gradient-to-t from-black/5 to-transparent dark:from-white/5"></div>

                          <p className="text-sm relative z-10">{message.content}</p>

                          {message.options && (
                            <div className="mt-4 flex flex-wrap gap-2 relative z-10">
                              {message.options.map((option) => (
                                <button
                                  key={option}
                                  className="px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 hover:bg-indigo-100/90 dark:hover:bg-indigo-900/30 rounded-full text-xs font-medium transition-all duration-200 border border-indigo-200/70 dark:border-indigo-700/50 hover:border-indigo-300 dark:hover:border-indigo-600/70 backdrop-blur-sm hover:shadow-md"
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
                                  onSelect={(providerId) => handleServiceSelect(service.id)}
                                  onViewServices={(providerId) => handleServiceSelect(service.id)}
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

                    {message.type === "loading" && (
                      <div className="flex">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
                          <div className="flex items-center">
                            <div className="flex space-x-1">
                              <motion.div
                                className="h-2 w-2 bg-primary rounded-full"
                                animate={{ scale: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                              />
                              <motion.div
                                className="h-2 w-2 bg-primary rounded-full"
                                animate={{ scale: [0.5, 1, 0.5] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "easeInOut",
                                  delay: 0.2,
                                }}
                              />
                              <motion.div
                                className="h-2 w-2 bg-primary rounded-full"
                                animate={{ scale: [0.5, 1, 0.5] }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "easeInOut",
                                  delay: 0.4,
                                }}
                              />
                            </div>
                            <p className="ml-3 text-sm text-gray-500">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {message.type === "feedback" && (
                      <div className="flex">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-3 max-w-[80%] shadow-md border border-gray-100 dark:border-gray-700">
                          <p className="text-sm">{message.content}</p>
                          {message.feedbackOptions && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {message.feedbackOptions.map((option) => (
                                <button
                                  key={option}
                                  className="px-3 py-1.5 bg-gray-100/80 dark:bg-gray-700/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-full text-xs font-medium transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50 hover:border-indigo-300 dark:hover:border-indigo-700/50 backdrop-blur-sm hover:shadow-md"
                                  onClick={() => handleFeedbackSelect(option)}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input area - Enhanced UI */}
            <form
              onSubmit={handleSubmit}
              className="relative p-4 border-t border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-gray-50/80 via-white/80 to-gray-50/80 dark:from-gray-900/80 dark:via-gray-900/90 dark:to-gray-900/80 backdrop-blur-sm -mt-16 z-10 shadow-lg"
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full pl-5 pr-16 py-3 bg-white/90 dark:bg-gray-800/90 rounded-full border border-gray-300 dark:border-gray-700 shadow-md hover:shadow-lg focus:shadow-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 text-sm text-gray-700 dark:text-gray-200 backdrop-blur-sm"
                />
                <button
                  type="submit"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full px-4 py-2 text-sm transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isTyping}
                >
                  {isTyping ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
