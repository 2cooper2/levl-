"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import {
  fetchServices,
  fetchCategories,
  saveUserPreferences,
  fetchUserPreferences,
  logMatchmakerInteraction,
} from "@/services/matchmaker-service"
import {
  getPersonalizedRecommendations,
  updateRecommendationModel,
  generateDiverseAlternatives,
} from "@/services/recommendation-service"
import { detectIntent } from "@/services/nlp-service"
import type { Service, Message, AIModelState, UserIntent } from "@/types/matchmaker"

// Initial AI model state
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
      "Hi there! I'm your LEVL service matchmaker. I can help you find the perfect service for your needs. What are you looking for today?",
    timestamp: new Date(),
    options: [
      "I need help mounting a TV",
      "I need furniture assembly",
      "I need home painting",
      "I need smart home setup",
      "Something else",
    ],
  },
]

export function useMatchmaker() {
  const { toast } = useToast()
  const { user } = useAuth()

  // State
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [matchedServices, setMatchedServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [aiModel, setAIModel] = useState<AIModelState>(initialAIModel)
  const [allServices, setAllServices] = useState<Service[]>([])
  const [showBookingFlow, setShowBookingFlow] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showProviderMatching, setShowProviderMatching] = useState(false)

  // Load categories and services on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load categories
        const categoriesData = await fetchCategories()
        setCategories(categoriesData)

        // Load some initial services
        const servicesData = await fetchServices(undefined, 20)
        setAllServices(servicesData)

        // If user is logged in, load their preferences
        if (user?.id) {
          const userPrefs = await fetchUserPreferences(user.id)
          if (userPrefs) {
            setAIModel((prevModel) => ({
              ...prevModel,
              userModel: {
                ...prevModel.userModel,
                ...userPrefs,
              },
              enhancedReasoning: {
                ...prevModel.enhancedReasoning,
                contextualMemory: {
                  ...prevModel.enhancedReasoning.contextualMemory,
                  longTerm: new Map(Object.entries(userPrefs)),
                },
              },
            }))

            // Personalize welcome message if we have category preferences
            if (userPrefs.categories && userPrefs.categories.size > 0) {
              const topCategory = Array.from(userPrefs.categories.entries()).sort((a, b) => b[1] - a[1])[0]

              if (topCategory && topCategory[1] > 0.6) {
                setMessages([
                  {
                    id: "welcome-personalized",
                    type: "ai",
                    content: `Welcome back! I see you've been interested in ${topCategory[0]} services before. What can I help you find today?`,
                    timestamp: new Date(),
                    options: [
                      `Show me ${topCategory[0]} services`,
                      "I need something different today",
                      "Show me my recent recommendations",
                    ],
                  },
                ])
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
        toast({
          title: "Error",
          description: "Failed to load initial data. Please try again later.",
          variant: "destructive",
        })
      }
    }

    loadInitialData()
  }, [user?.id, toast])

  // Save user preferences when they change significantly
  useEffect(() => {
    const savePreferences = async () => {
      if (!user?.id) return

      // Only save if we have meaningful preferences
      if (
        aiModel.userModel.categories.size > 0 ||
        aiModel.userModel.budget.sensitivity !== 5 ||
        aiModel.userModel.quality.importance !== 7 ||
        aiModel.userModel.requirements.explicit.length > 0
      ) {
        await saveUserPreferences(user.id, aiModel.userModel)
      }
    }

    // Debounce the save operation
    const timeoutId = setTimeout(savePreferences, 2000)
    return () => clearTimeout(timeoutId)
  }, [aiModel.userModel, user?.id])

  // Simulate AI typing
  const simulateTyping = useCallback((callback: () => void, delay = 1500) => {
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
  }, [])

  // Process user input with enhanced NLP
  const processUserInput = useCallback(
    async (input: string) => {
      // Log the interaction
      if (user?.id) {
        logMatchmakerInteraction(user.id, "user_message", { message: input })
      }

      // Update conversation flow in contextual memory
      setAIModel((prevModel) => {
        const updatedModel = { ...prevModel }
        updatedModel.enhancedReasoning.contextualMemory.conversationFlow.push(input)
        return updatedModel
      })

      // Get conversation history for context
      const conversationHistory = aiModel.enhancedReasoning.contextualMemory.conversationFlow.slice(-5)

      try {
        // Analyze user input with NLP
        simulateTyping(async () => {
          // Detect intent
          const intent = await detectIntent(input, conversationHistory)

          // Update AI model with detected intent
          setAIModel((prevModel) => ({
            ...prevModel,
            lastUserIntent: intent,
            conversationContext: {
              ...prevModel.conversationContext,
              depth: prevModel.conversationContext.depth + 1,
            },
          }))

          // Handle different intents
          if (intent.type === "booking" || intent.entities.includes("book") || input.toLowerCase().includes("book")) {
            // Handle booking intent
            handleBookingIntent(intent)
          } else if (intent.type === "comparison" || input.toLowerCase().includes("compare")) {
            // Handle comparison intent
            handleComparisonIntent(intent)
          } else if (
            intent.entities.some((entity) => categories.some((cat) => cat.name.toLowerCase() === entity.toLowerCase()))
          ) {
            // Handle category-specific intent
            handleCategoryIntent(intent)
          } else if (
            intent.contextualFactors.has("implicitBudgetConcern") ||
            input.toLowerCase().includes("price") ||
            input.toLowerCase().includes("cost")
          ) {
            // Handle budget concern
            handleBudgetConcern(intent)
          } else if (
            intent.type === "information" ||
            input.toLowerCase().includes("provider") ||
            input.toLowerCase().includes("professional")
          ) {
            // Handle provider information request
            handleProviderInfoRequest(intent)
          } else {
            // Default recommendation flow
            const recommendations = await getPersonalizedRecommendations(
              user?.id || null,
              aiModel.userModel,
              undefined,
              3,
            )

            setMatchedServices(recommendations.map((rec) => rec.service))

            const aiMessage: Message = {
              id: `ai-${Date.now()}`,
              type: "ai",
              content: "Based on what you're looking for, here are some services that might be a good fit:",
              timestamp: new Date(),
              services: recommendations.map((rec) => rec.service),
            }

            setMessages((prev) => [...prev, aiMessage])

            // Ask for feedback
            setTimeout(() => {
              const feedbackMessage: Message = {
                id: `feedback-${Date.now()}`,
                type: "feedback",
                content: "How do these recommendations look?",
                timestamp: new Date(),
                feedbackOptions: [
                  "Perfect!",
                  "Show me more options",
                  "These aren't quite right",
                  "Can you explain why you recommended these?",
                ],
              }

              setMessages((prev) => [...prev, feedbackMessage])
            }, 1000)
          }
        }, 2000)
      } catch (error) {
        console.error("Error processing user input:", error)

        // Fallback response
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: "I'm sorry, I had trouble understanding that. Could you rephrase or try a different question?",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiMessage])
      }
    },
    [aiModel, categories, simulateTyping, user?.id],
  )

  // Handle booking intent
  const handleBookingIntent = useCallback(
    (intent: UserIntent) => {
      // If we have matched services, offer to book one
      if (matchedServices.length > 0) {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: "I'd be happy to help you book a service. Which one would you like to book?",
          timestamp: new Date(),
          services: matchedServices,
        }

        setMessages((prev) => [...prev, aiMessage])
      } else {
        // If no matched services yet, ask for preferences
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: "I'd be happy to help you book a service. What type of service are you looking for?",
          timestamp: new Date(),
          options: categories.slice(0, 5).map((cat) => cat.name),
        }

        setMessages((prev) => [...prev, aiMessage])
      }
    },
    [matchedServices, categories],
  )

  // Handle comparison intent
  const handleComparisonIntent = useCallback(
    (intent: UserIntent) => {
      if (matchedServices.length >= 2) {
        const comparisonText = generateComparisonText(matchedServices.slice(0, 3))

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: `Here's a comparison of the services:\n\n${comparisonText}\n\nWould you like to book one of these services?`,
          timestamp: new Date(),
          options: [
            ...matchedServices.slice(0, 3).map((service) => `Book ${service.title}`),
            "Show me different options",
            "I need more information",
          ],
        }

        setMessages((prev) => [...prev, aiMessage])
      } else {
        // Not enough services to compare
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: "I need to find a few options before I can compare them. What type of service are you looking for?",
          timestamp: new Date(),
          options: categories.slice(0, 5).map((cat) => cat.name),
        }

        setMessages((prev) => [...prev, aiMessage])
      }
    },
    [matchedServices, categories],
  )

  // Handle category intent
  const handleCategoryIntent = useCallback(
    async (intent: UserIntent) => {
      // Find matching category
      const categoryEntity = intent.entities.find((entity) =>
        categories.some((cat) => cat.name.toLowerCase() === entity.toLowerCase()),
      )

      if (categoryEntity) {
        const category = categories.find((cat) => cat.name.toLowerCase() === categoryEntity.toLowerCase())

        if (category) {
          // Update user model with category preference
          setAIModel((prevModel) => {
            const updatedModel = { ...prevModel }
            updatedModel.userModel.categories.set(category.name, 0.9)
            return updatedModel
          })

          // Get recommendations for this category
          const recommendations = await getPersonalizedRecommendations(
            user?.id || null,
            {
              ...aiModel.userModel,
              categories: new Map([[category.name, 0.9]]),
            },
            category.id,
            3,
          )

          setMatchedServices(recommendations.map((rec) => rec.service))

          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            type: "ai",
            content: `Here are some great ${category.name} services that might meet your needs:`,
            timestamp: new Date(),
            services: recommendations.map((rec) => rec.service),
          }

          setMessages((prev) => [...prev, aiMessage])

          // Ask for feedback
          setTimeout(() => {
            const feedbackMessage: Message = {
              id: `feedback-${Date.now()}`,
              type: "feedback",
              content: "How do these recommendations look?",
              timestamp: new Date(),
              feedbackOptions: [
                "Perfect!",
                "Show me more options",
                "These aren't quite right",
                "I'd like to see providers instead of services",
              ],
            }

            setMessages((prev) => [...prev, feedbackMessage])
          }, 1000)
        }
      }
    },
    [categories, aiModel.userModel, user?.id],
  )

  // Handle budget concern
  const handleBudgetConcern = useCallback(
    async (intent: UserIntent) => {
      // Update user model with higher budget sensitivity
      setAIModel((prevModel) => {
        const updatedModel = { ...prevModel }
        updatedModel.userModel.budget.sensitivity = Math.min(10, updatedModel.userModel.budget.sensitivity + 2)
        return updatedModel
      })

      // Get more affordable recommendations
      const recommendations = await getPersonalizedRecommendations(
        user?.id || null,
        {
          ...aiModel.userModel,
          budget: {
            ...aiModel.userModel.budget,
            sensitivity: 8,
          },
        },
        undefined,
        3,
      )

      setMatchedServices(recommendations.map((rec) => rec.service))

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: "I understand budget is important to you. Here are some more affordable options:",
        timestamp: new Date(),
        services: recommendations.map((rec) => rec.service),
      }

      setMessages((prev) => [...prev, aiMessage])
    },
    [aiModel.userModel, user?.id],
  )

  // Handle provider information request
  const handleProviderInfoRequest = useCallback(async (intent: UserIntent) => {
    setShowProviderMatching(true)

    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      type: "ai",
      content:
        "I'd be happy to help you find the right service provider. Let me show you some top providers that match your needs:",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, aiMessage])
  }, [])

  // Generate comparison text
  const generateComparisonText = useCallback((services: Service[]) => {
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

    // Time estimate comparison
    comparison += "\n| Time Estimate | "
    services.forEach((service) => {
      comparison += `${service.timeEstimate} | `
    })

    // Category comparison
    comparison += "\n| Category | "
    services.forEach((service) => {
      comparison += `${service.category} | `
    })

    return comparison
  }, [])

  // Handle user message submission
  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
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
    },
    [inputValue, processUserInput],
  )

  // Handle option selection
  const handleOptionSelect = useCallback(
    (option: string) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: "user",
        content: option,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])

      // Check if this is a booking option
      if (option.startsWith("Book ") && matchedServices.length > 0) {
        const serviceName = option.substring(5)
        const service = matchedServices.find((s) => s.title === serviceName)

        if (service) {
          setSelectedService(service)
          setShowBookingFlow(true)
          return
        }
      }

      processUserInput(option)
    },
    [processUserInput, matchedServices],
  )

  // Handle feedback selection
  const handleFeedbackSelect = useCallback(
    async (option: string) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: "user",
        content: option,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])

      // Handle specific feedback options
      if (option === "Show me more options") {
        simulateTyping(async () => {
          // Generate diverse alternatives
          const diverseAlternatives = await generateDiverseAlternatives(
            matchedServices.map((service) => ({
              service,
              matchScore: service.matchScore || 80,
              matchReasons: [
                {
                  factor: "Base Match",
                  score: service.matchScore || 80,
                  explanation: "Base match score",
                },
              ],
              confidenceScore: 0.7,
            })),
            aiModel.userModel,
            "balanced",
          )

          setMatchedServices(diverseAlternatives.map((alt) => alt.service))

          const aiMessage: Message = {
            id: `ai-${Date.now()}`,
            type: "ai",
            content: "Here are some alternative options that might interest you:",
            timestamp: new Date(),
            services: diverseAlternatives.map((alt) => alt.service),
          }

          setMessages((prev) => [...prev, aiMessage])
        })
      } else if (option === "Perfect!") {
        // Update user model with positive feedback
        if (user?.id && matchedServices.length > 0) {
          const updatedModel = await updateRecommendationModel(
            user.id,
            matchedServices[0].id.toString(),
            "positive",
            aiModel.userModel,
          )

          setAIModel((prevModel) => ({
            ...prevModel,
            userModel: updatedModel,
          }))
        }

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: "Great! Would you like to book one of these services now?",
          timestamp: new Date(),
          options: [
            ...matchedServices.slice(0, 3).map((service) => `Book ${service.title}`),
            "Not right now",
            "Show me provider profiles instead",
          ],
        }

        setMessages((prev) => [...prev, aiMessage])
      } else if (option === "These aren't quite right") {
        // Update user model with negative feedback
        if (user?.id && matchedServices.length > 0) {
          const updatedModel = await updateRecommendationModel(
            user.id,
            matchedServices[0].id.toString(),
            "negative",
            aiModel.userModel,
          )

          setAIModel((prevModel) => ({
            ...prevModel,
            userModel: updatedModel,
          }))
        }

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: "I'm sorry these weren't quite right. Could you tell me more about what you're looking for?",
          timestamp: new Date(),
          options: [
            "I need something more affordable",
            "I need higher quality options",
            "I need a different type of service",
            "Show me provider profiles instead",
          ],
        }

        setMessages((prev) => [...prev, aiMessage])
      } else if (option === "I'd like to see providers instead of services") {
        setShowProviderMatching(true)

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: "ai",
          content: "Sure, let me show you some top providers that match your needs:",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiMessage])
      } else {
        // Process as regular input
        processUserInput(option)
      }
    },
    [processUserInput, matchedServices, aiModel.userModel, user?.id, simulateTyping],
  )

  // Handle booking completion
  const handleBookingComplete = useCallback(() => {
    setShowBookingFlow(false)
    setSelectedService(null)

    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      type: "ai",
      content: "Your booking has been confirmed! Is there anything else I can help you with today?",
      timestamp: new Date(),
      options: ["Find another service", "No, that's all for now", "Give me some tips for preparing for my service"],
    }

    setMessages((prev) => [...prev, aiMessage])
  }, [])

  // Handle provider selection
  const handleProviderSelect = useCallback((providerId: string) => {
    // In a real app, this would navigate to the provider profile
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      type: "ai",
      content: `I'll take you to the provider's profile page. Would you like to see their services first?`,
      timestamp: new Date(),
      options: ["Yes, show me their services", "No, take me to their profile", "I'd like to contact them directly"],
    }

    setMessages((prev) => [...prev, aiMessage])
    setShowProviderMatching(false)
  }, [])

  // Reset conversation
  const resetConversation = useCallback(() => {
    // Store some long-term memory before resetting
    const longTermMemory = new Map(aiModel.enhancedReasoning.contextualMemory.longTerm)

    // Store category preferences in long-term memory
    aiModel.userModel.categories.forEach((confidence, category) => {
      if (confidence > 0.6) {
        longTermMemory.set(`category_preference:${category}`, confidence)
      }
    })

    // Reset conversation state
    setMessages(initialMessages)
    setInputValue("")
    setIsTyping(false)
    setMatchedServices([])
    setShowBookingFlow(false)
    setSelectedService(null)
    setShowProviderMatching(false)

    // Reset AI model but preserve long-term memory
    setAIModel({
      ...initialAIModel,
      enhancedReasoning: {
        ...initialAIModel.enhancedReasoning,
        contextualMemory: {
          ...initialAIModel.enhancedReasoning.contextualMemory,
          longTerm: longTermMemory,
        },
      },
    })
  }, [aiModel])

  return {
    messages,
    inputValue,
    setInputValue,
    isTyping,
    matchedServices,
    categories,
    aiModel,
    showBookingFlow,
    selectedService,
    showProviderMatching,
    handleSubmit,
    handleOptionSelect,
    handleFeedbackSelect,
    resetConversation,
    handleBookingComplete,
    handleProviderSelect,
    setShowBookingFlow,
  }
}
