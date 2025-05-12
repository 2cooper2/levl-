"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { AIModelState, Message, Service, ReasoningStep } from "@/types/matchmaker"
import { detectIntent, analyzeSentiment } from "@/services/nlp-service"

// Define action types for the reducer
type MatchmakerAction =
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "REMOVE_MESSAGE"; payload: string }
  | { type: "SET_INPUT_VALUE"; payload: string }
  | { type: "SET_IS_TYPING"; payload: boolean }
  | { type: "SET_MATCHED_SERVICES"; payload: Service[] }
  | { type: "UPDATE_AI_MODEL"; payload: Partial<AIModelState> }
  | { type: "SET_CONVERSATION_STAGE"; payload: AIModelState["conversationContext"]["stage"] }
  | { type: "RESET" }

// Define the context state
interface MatchmakerContextState {
  messages: Message[]
  inputValue: string
  isTyping: boolean
  matchedServices: Service[]
  aiModel: AIModelState
  dispatch: React.Dispatch<MatchmakerAction>
  addUserMessage: (content: string) => void
  addAIMessage: (content: string, options?: string[], services?: Service[]) => void
  addFeedbackMessage: (content: string, feedbackOptions?: string[]) => void
  startTyping: (callback: () => void, delay?: number) => void
  processUserInput: (input: string) => Promise<void>
  resetConversation: () => void
}

// Initialize default context
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
}

// Initial welcome message
const initialMessages: Message[] = [
  {
    id: "welcome",
    type: "ai",
    content:
      "Hi there! I'm your AI service matchmaker. Please select one of the service cards above or tell me what kind of service you're looking for.",
    timestamp: new Date(),
  },
]

// Create the context
const MatchmakerContext = createContext<MatchmakerContextState | undefined>(undefined)

// Initial state
const initialState = {
  messages: initialMessages,
  inputValue: "",
  isTyping: false,
  matchedServices: [],
  aiModel: initialAIModel,
}

// Reducer function
function matchmakerReducer(state: typeof initialState, action: MatchmakerAction): typeof initialState {
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, messages: action.payload }
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] }
    case "REMOVE_MESSAGE":
      return {
        ...state,
        messages: state.messages.filter((msg) => msg.id !== action.payload),
      }
    case "SET_INPUT_VALUE":
      return { ...state, inputValue: action.payload }
    case "SET_IS_TYPING":
      return { ...state, isTyping: action.payload }
    case "SET_MATCHED_SERVICES":
      return { ...state, matchedServices: action.payload }
    case "UPDATE_AI_MODEL":
      return {
        ...state,
        aiModel: { ...state.aiModel, ...action.payload },
      }
    case "SET_CONVERSATION_STAGE":
      return {
        ...state,
        aiModel: {
          ...state.aiModel,
          conversationContext: {
            ...state.aiModel.conversationContext,
            stage: action.payload,
          },
        },
      }
    case "RESET":
      return {
        ...initialState,
        aiModel: {
          ...initialAIModel,
          enhancedReasoning: {
            ...initialAIModel.enhancedReasoning,
            contextualMemory: {
              ...initialAIModel.enhancedReasoning.contextualMemory,
              longTerm: state.aiModel.enhancedReasoning.contextualMemory.longTerm,
            },
          },
        },
      }
    default:
      return state
  }
}

// Provider component
export function MatchmakerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(matchmakerReducer, initialState)
  const { messages, inputValue, isTyping, matchedServices, aiModel } = state

  // Helper function to add a user message
  const addUserMessage = (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content,
      timestamp: new Date(),
    }
    dispatch({ type: "ADD_MESSAGE", payload: userMessage })
  }

  // Helper function to add an AI message
  const addAIMessage = (content: string, options?: string[], services?: Service[]) => {
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      type: "ai",
      content,
      timestamp: new Date(),
      options,
      services,
    }
    dispatch({ type: "ADD_MESSAGE", payload: aiMessage })
  }

  // Helper function to add a feedback message
  const addFeedbackMessage = (content: string, feedbackOptions?: string[]) => {
    const feedbackMessage: Message = {
      id: `feedback-${Date.now()}`,
      type: "feedback",
      content,
      timestamp: new Date(),
      feedbackOptions,
    }
    dispatch({ type: "ADD_MESSAGE", payload: feedbackMessage })
  }

  // Simulate AI typing
  const startTyping = (callback: () => void, delay = 1500) => {
    dispatch({ type: "SET_IS_TYPING", payload: true })
    const typingMessage: Message = {
      id: `typing-${Date.now()}`,
      type: "loading",
      content: "Thinking...",
      timestamp: new Date(),
    }
    dispatch({ type: "ADD_MESSAGE", payload: typingMessage })

    setTimeout(() => {
      dispatch({ type: "REMOVE_MESSAGE", payload: typingMessage.id })
      dispatch({ type: "SET_IS_TYPING", payload: false })
      callback()
    }, delay)
  }

  // Process user input with enhanced NLP
  const processUserInput = async (input: string) => {
    // Update conversation flow in contextual memory
    const updatedContextualMemory = {
      ...aiModel.enhancedReasoning.contextualMemory,
      conversationFlow: [...aiModel.enhancedReasoning.contextualMemory.conversationFlow, input],
    }

    dispatch({
      type: "UPDATE_AI_MODEL",
      payload: {
        enhancedReasoning: {
          ...aiModel.enhancedReasoning,
          contextualMemory: updatedContextualMemory,
        },
      },
    })

    try {
      // Convert messages to string format needed for intent detection
      const conversationHistory = messages
        .filter((msg) => msg.type === "user" || msg.type === "ai")
        .slice(-5)
        .map((msg) => msg.content)

      // Detect intent using NLP service
      const intent = await detectIntent(input, conversationHistory)

      // Analyze sentiment
      const sentiment = await analyzeSentiment(input)

      // Add reasoning step for intent detection
      const intentReasoningStep: ReasoningStep = {
        id: `intent-${Date.now()}`,
        step: "Intent Detection",
        reasoning: `Analyzed user input for intent: "${input}"`,
        conclusion: `Detected intent: ${intent.type} (${Math.round(intent.confidence * 100)}% confidence)`,
        confidence: intent.confidence,
        timestamp: new Date(),
      }

      // Update AI model with intent and reasoning
      dispatch({
        type: "UPDATE_AI_MODEL",
        payload: {
          lastUserIntent: intent,
          reasoningTrace: [...aiModel.reasoningTrace, intentReasoningStep],
        },
      })

      // Example of performing AI reasoning and updating the user model
      // This would be expanded based on your specific logic

      // In a real implementation, this would handle different conversation stages
      // and intents to provide appropriate responses
    } catch (error) {
      console.error("Error processing user input:", error)
      // Add a fallback error message
      addAIMessage("I'm having trouble understanding that. Could you please rephrase?")
    }
  }

  // Reset conversation but preserve long-term memory
  const resetConversation = () => {
    dispatch({ type: "RESET" })
  }

  // Provide the context value
  const contextValue: MatchmakerContextState = {
    messages,
    inputValue,
    isTyping,
    matchedServices,
    aiModel,
    dispatch,
    addUserMessage,
    addAIMessage,
    addFeedbackMessage,
    startTyping,
    processUserInput,
    resetConversation,
  }

  return <MatchmakerContext.Provider value={contextValue}>{children}</MatchmakerContext.Provider>
}

// Custom hook to use the matchmaker context
export function useMatchmaker() {
  const context = useContext(MatchmakerContext)
  if (context === undefined) {
    throw new Error("useMatchmaker must be used within a MatchmakerProvider")
  }
  return context
}
