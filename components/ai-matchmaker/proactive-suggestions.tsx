"use client"

import type { AIModelState, UserIntent } from "@/types/matchmaker"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { Lightbulb, X } from "lucide-react"

interface ProactiveSuggestionsProps {
  aiModel: AIModelState
  lastUserInput?: string
  lastIntent?: UserIntent
  onSuggestionSelect: (suggestion: string) => void
  disabled?: boolean
}

export function ProactiveSuggestions({
  aiModel,
  lastUserInput,
  lastIntent,
  onSuggestionSelect,
  disabled = false,
}: ProactiveSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [currentGroup, setCurrentGroup] = useState<"general" | "contextual" | "personal">("general")

  // Generate suggestions based on the current AI model state
  useEffect(() => {
    if (disabled) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Wait a moment before showing suggestions to avoid disrupting the chat flow
    const timer = setTimeout(() => {
      const newSuggestions = generateContextualSuggestions(aiModel, lastUserInput, lastIntent)

      if (newSuggestions.length > 0) {
        setSuggestions(newSuggestions)
        setShowSuggestions(true)

        // Determine suggestion type for styling
        if (aiModel.userModel.categories.size > 0 || aiModel.userModel.history.viewedServices.length > 0) {
          setCurrentGroup("personal")
        } else if (aiModel.conversationContext.depth > 1) {
          setCurrentGroup("contextual")
        } else {
          setCurrentGroup("general")
        }
      } else {
        setShowSuggestions(false)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [aiModel, lastUserInput, lastIntent, disabled])

  // Handle clicking a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect(suggestion)
    setShowSuggestions(false)
  }

  // Handle dismissing suggestions
  const handleDismiss = () => {
    setShowSuggestions(false)
  }

  if (!showSuggestions || suggestions.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        className="mt-6 mb-2"
      >
        <div className={`rounded-lg p-3 ${getBgClass(currentGroup)}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-sm">
              <Lightbulb className={`h-4 w-4 mr-1.5 ${getIconClass(currentGroup)}`} />
              <span className={`font-medium ${getTitleClass(currentGroup)}`}>{getSuggestionTitle(currentGroup)}</span>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={`suggestion-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${getButtonClass(currentGroup)}`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Generate contextual suggestions based on AI model state
function generateContextualSuggestions(
  aiModel: AIModelState,
  lastUserInput?: string,
  lastIntent?: UserIntent,
): string[] {
  const { conversationContext, userModel } = aiModel
  const { stage, depth } = conversationContext

  // Don't show suggestions if we're in the initial greeting
  if (stage === "initial" && depth < 1) {
    return []
  }

  // Different suggestions based on conversation stage
  switch (stage) {
    case "understanding":
      return [
        "I need something affordable",
        "Quality is important to me",
        "I need this done quickly",
        "Show me the most popular options",
      ]

    case "service-specific":
      // Return service-specific prompts based on the current service type
      if (conversationContext.currentServiceType === "tvMounting") {
        return [
          "What size TVs can you mount?",
          "Can you hide the cables in the wall?",
          "Do you provide the wall mount?",
          "How long does TV mounting usually take?",
        ]
      } else if (conversationContext.currentServiceType === "plumbing") {
        return [
          "Can you handle emergency situations?",
          "Do you work on weekends?",
          "What plumbing issues do you specialize in?",
          "Do you offer any warranty?",
        ]
      } else {
        return [
          "What's included in the service?",
          "How experienced are your providers?",
          "Is there a satisfaction guarantee?",
          "Can I see reviews from past clients?",
        ]
      }

    case "recommending":
      return [
        "Can you recommend something more affordable?",
        "I'd like higher quality options",
        "Show me more providers",
        "Can you explain these recommendations?",
      ]

    case "refining":
      return [
        "This looks better",
        "Still not what I'm looking for",
        "Let me be more specific",
        "These are good, tell me more details",
      ]

    case "finalizing":
      return [
        "I'd like to book this service",
        "Can I save these options for later?",
        "Compare the top two options",
        "What's your recommendation?",
      ]

    default:
      // Personalized suggestions based on user model
      if (userModel.categories.size > 0) {
        // Suggest based on user's preferred categories
        const topCategory = Array.from(userModel.categories.entries()).sort((a, b) => b[1] - a[1])[0]

        if (topCategory && topCategory[1] > 0.6) {
          return [
            `Show me more ${topCategory[0]} services`,
            `Who are your best ${topCategory[0]} providers?`,
            `What's included in ${topCategory[0]} services?`,
            "I'm looking for something different today",
          ]
        }
      }

      // Default suggestions
      return [
        "What services are most popular?",
        "How does your service matching work?",
        "Can you recommend providers near me?",
        "Tell me about your satisfaction guarantee",
      ]
  }
}

// Helper functions for styling
function getBgClass(group: "general" | "contextual" | "personal"): string {
  switch (group) {
    case "personal":
      return "bg-indigo-50/80 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/30"
    case "contextual":
      return "bg-violet-50/80 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800/30"
    default:
      return "bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/30"
  }
}

function getIconClass(group: "general" | "contextual" | "personal"): string {
  switch (group) {
    case "personal":
      return "text-indigo-500 dark:text-indigo-400"
    case "contextual":
      return "text-violet-500 dark:text-violet-400"
    default:
      return "text-amber-500 dark:text-amber-400"
  }
}

function getTitleClass(group: "general" | "contextual" | "personal"): string {
  switch (group) {
    case "personal":
      return "text-indigo-700 dark:text-indigo-300"
    case "contextual":
      return "text-violet-700 dark:text-violet-300"
    default:
      return "text-gray-700 dark:text-gray-300"
  }
}

function getButtonClass(group: "general" | "contextual" | "personal"): string {
  switch (group) {
    case "personal":
      return "bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700"
    case "contextual":
      return "bg-white dark:bg-gray-800 border border-violet-200 dark:border-violet-800/50 hover:bg-violet-100 dark:hover:bg-violet-900/50 hover:border-violet-300 dark:hover:border-violet-700"
    default:
      return "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
  }
}

function getSuggestionTitle(group: "general" | "contextual" | "personal"): string {
  switch (group) {
    case "personal":
      return "Personalized Suggestions"
    case "contextual":
      return "You might want to ask"
    default:
      return "Suggested questions"
  }
}
