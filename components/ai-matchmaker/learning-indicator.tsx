"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Brain } from "lucide-react"
import { useState, useEffect } from "react"
import type { AIModelState } from "@/types/matchmaker"

interface LearningIndicatorProps {
  aiModel: AIModelState
  previousModel?: AIModelState
}

export function LearningIndicator({ aiModel, previousModel }: LearningIndicatorProps) {
  const [isLearning, setIsLearning] = useState(false)
  const [learningType, setLearningType] = useState<"category" | "budget" | "quality" | "general">("general")

  useEffect(() => {
    // Skip if no previous model to compare
    if (!previousModel) return

    // Check if the model has changed significantly
    let detected = false
    let type: "category" | "budget" | "quality" | "general" = "general"

    // Check for category learning
    if (previousModel && aiModel.userModel.categories.size !== previousModel.userModel.categories.size) {
      detected = true
      type = "category"
    }
    // Check for budget preference learning
    else if (
      previousModel &&
      Math.abs(aiModel.userModel.budget.sensitivity - previousModel.userModel.budget.sensitivity) > 1
    ) {
      detected = true
      type = "budget"
    }
    // Check for quality preference learning
    else if (
      previousModel &&
      Math.abs(aiModel.userModel.quality.importance - previousModel.userModel.quality.importance) > 1
    ) {
      detected = true
      type = "quality"
    }

    if (detected) {
      setLearningType(type)
      setIsLearning(true)

      // Hide after 3 seconds
      const timer = setTimeout(() => {
        setIsLearning(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [aiModel, previousModel])

  return (
    <AnimatePresence>
      {isLearning && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-16 right-4 z-50 px-3 py-2 rounded-md shadow-lg flex items-center"
          style={{
            background: getLearningBgColor(learningType),
            border: `1px solid ${getLearningBorderColor(learningType)}`,
          }}
        >
          <Brain className="h-4 w-4 mr-2" style={{ color: getLearningIconColor(learningType) }} />
          <span className="text-xs font-medium" style={{ color: getLearningTextColor(learningType) }}>
            {getLearningMessage(learningType)}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Helper functions for styling based on learning type
function getLearningBgColor(type: "category" | "budget" | "quality" | "general"): string {
  switch (type) {
    case "category":
      return "rgba(79, 70, 229, 0.1)"
    case "budget":
      return "rgba(16, 185, 129, 0.1)"
    case "quality":
      return "rgba(245, 158, 11, 0.1)"
    default:
      return "rgba(99, 102, 241, 0.1)"
  }
}

function getLearningBorderColor(type: "category" | "budget" | "quality" | "general"): string {
  switch (type) {
    case "category":
      return "rgba(79, 70, 229, 0.3)"
    case "budget":
      return "rgba(16, 185, 129, 0.3)"
    case "quality":
      return "rgba(245, 158, 11, 0.3)"
    default:
      return "rgba(99, 102, 241, 0.3)"
  }
}

function getLearningIconColor(type: "category" | "budget" | "quality" | "general"): string {
  switch (type) {
    case "category":
      return "#4F46E5"
    case "budget":
      return "#10B981"
    case "quality":
      return "#F59E0B"
    default:
      return "#6366F1"
  }
}

function getLearningTextColor(type: "category" | "budget" | "quality" | "general"): string {
  switch (type) {
    case "category":
      return "#4F46E5"
    case "budget":
      return "#10B981"
    case "quality":
      return "#F59E0B"
    default:
      return "#6366F1"
  }
}

function getLearningMessage(type: "category" | "budget" | "quality" | "general"): string {
  switch (type) {
    case "category":
      return "Learning your category preferences..."
    case "budget":
      return "Learning your budget preferences..."
    case "quality":
      return "Learning your quality preferences..."
    default:
      return "Learning your preferences..."
  }
}
