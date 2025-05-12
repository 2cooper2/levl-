"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useMatchmaker } from "@/context/matchmaker-context"
import type { ReasoningStep } from "@/types/matchmaker"

export function ReasoningVisualizer() {
  const { aiModel } = useMatchmaker()
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null)

  // Group reasoning steps by timestamp to show reasoning history
  const stepsByTime = aiModel.reasoningTrace.reduce<{
    [key: string]: {
      time: Date
      steps: ReasoningStep[]
    }
  }>((acc, step) => {
    // Group by minute for simplicity
    const timeKey = new Date(step.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })

    if (!acc[timeKey]) {
      acc[timeKey] = {
        time: step.timestamp,
        steps: [],
      }
    }

    acc[timeKey].steps.push(step)
    return acc
  }, {})

  // Sort by time, newest first
  const sortedTimeGroups = Object.entries(stepsByTime).sort(
    (a, b) => new Date(b[1].time).getTime() - new Date(a[1].time).getTime(),
  )

  if (aiModel.reasoningTrace.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <p>No reasoning data available yet.</p>
        <p className="text-sm mt-2">Start interacting with the AI to see its reasoning process.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold mb-4">AI Reasoning Process</h3>

      {sortedTimeGroups.map(([timeKey, group]) => (
        <div key={timeKey} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex justify-between items-center">
            <span className="font-medium text-sm">{timeKey}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {group.steps.length} reasoning {group.steps.length === 1 ? "step" : "steps"}
            </span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {group.steps.map((step) => (
              <div key={step.id} className="px-4 py-3">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedStepId(expandedStepId === step.id ? null : step.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        step.confidence >= 0.8
                          ? "bg-green-500"
                          : step.confidence >= 0.6
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    />
                    <span className="font-medium">{step.step}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                      {Math.round(step.confidence * 100)}% confidence
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform duration-200 ${
                        expandedStepId === step.id ? "transform rotate-180" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>

                {expandedStepId === step.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-2"
                  >
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded mb-2">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Reasoning:</div>
                      <p className="text-gray-700 dark:text-gray-300">{step.reasoning}</p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Conclusion:</div>
                      <p className="text-gray-800 dark:text-gray-200 font-medium">{step.conclusion}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
