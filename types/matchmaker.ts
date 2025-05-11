// Service provider types
export interface ServiceProvider {
  id: number | string
  name: string
  avatar: string
  rating: number
  reviews: number
  verified: boolean
  responseTime: string
  completionRate: number
}

// Service types
export interface Service {
  id: number | string
  title: string
  category: string
  provider: ServiceProvider
  price: string
  timeEstimate: string
  description: string
  image: string
  tags: string[]
  matchScore?: number
  completedProjects: number
  satisfaction: number
}

// Message types
export type MessageType = "user" | "ai" | "service" | "options" | "loading" | "feedback"

export interface Message {
  id: string
  type: MessageType
  content: string
  timestamp: Date
  options?: string[]
  services?: Service[]
  feedbackOptions?: string[]
}

// User preference model
export interface UserPreferenceModel {
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
export interface ServiceSpecificQuestions {
  [key: string]: {
    questions: string[]
    options: { [key: string]: string[] }
    required: boolean[]
  }
}

// Enhanced reasoning engine
export interface EnhancedReasoning {
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

// AI model state
export interface AIModelState {
  reasoningTrace: ReasoningStep[]
  confidenceThreshold: number
  explorationFactor: number
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

// User intent
export interface UserIntent {
  type: "booking" | "comparison" | "information" | "save" | "general" | "refinement" | "feedback"
  confidence: number
  entities: string[]
  context?: string
  subIntents?: string[]
  contextualFactors?: Map<string, any>
}

// Reasoning step
export interface ReasoningStep {
  id: string
  step: string
  reasoning: string
  conclusion: string
  confidence: number
  timestamp: Date
}

// Service match
export interface ServiceMatch {
  service: Service
  matchScore: number
  matchReasons: {
    factor: string
    score: number
    explanation: string
  }[]
  confidenceScore: number
}

// Matching result
export interface MatchingResult {
  matches: ServiceMatch[]
  reasoning: ReasoningStep[]
  diversityScore: number
  coverageScore: number
}
