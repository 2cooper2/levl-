"use client"

import type React from "react"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { LLMFeedback } from "./llm-feedback"
import type { Message } from "@/types/matchmaker"

interface AIMatchmakerMessagesProps {
  messages: Message[]
  isTyping?: boolean
  matchedServices?: any[]
  onOptionSelect: (option: string) => void
  onFeedbackSelect: (option: string) => void
  onLLMFeedback?: (rating: number, feedbackText?: string) => void
  messagesEndRef?: React.RefObject<HTMLDivElement>
}

export const AIMatchmakerMessages = forwardRef<HTMLDivElement, AIMatchmakerMessagesProps>(
  ({ messages, isTyping, matchedServices, onOptionSelect, onFeedbackSelect, onLLMFeedback, messagesEndRef }, ref) => {
    return (
      <div ref={ref} className="space-y-6">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            {message.type === "user" ? (
              <motion.div
                className="self-end bg-indigo-600 text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%] shadow-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm">{message.content}</p>
              </motion.div>
            ) : message.type === "ai" ? (
              <motion.div
                className="self-start bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-tl-none max-w-[80%] shadow-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm dark:text-gray-200">{message.content}</p>

                {message.services && message.services.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.services.map((service) => (
                      <div
                        key={service.id}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => onOptionSelect(`Book ${service.title}`)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-sm">{service.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{service.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">{service.price}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {service.provider.rating}★ ({service.provider.reviews})
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {message.options && message.options.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.options.map((option, index) => (
                      <button
                        key={index}
                        className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs px-3 py-1.5 rounded-full transition-colors"
                        onClick={() => onOptionSelect(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {/* Add LLM feedback component */}
                {onLLMFeedback && <LLMFeedback onFeedback={onLLMFeedback} />}
              </motion.div>
            ) : message.type === "feedback" ? (
              <motion.div
                className="self-center bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/30 px-4 py-2 rounded-xl max-w-[90%]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-center text-indigo-700 dark:text-indigo-300">{message.content}</p>

                {message.feedbackOptions && message.feedbackOptions.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {message.feedbackOptions.map((option, index) => (
                      <button
                        key={index}
                        className="bg-indigo-100 dark:bg-indigo-800/50 hover:bg-indigo-200 dark:hover:bg-indigo-700/50 text-indigo-700 dark:text-indigo-300 text-xs px-3 py-1.5 rounded-full transition-colors"
                        onClick={() => onFeedbackSelect(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : message.type === "loading" ? (
              <motion.div
                className="self-start bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-tl-none max-w-[80%] shadow-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div
                      className="h-2 w-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{message.content}</p>
                </div>
              </motion.div>
            ) : null}
          </div>
        ))}

        {messagesEndRef && <div ref={messagesEndRef} />}
      </div>
    )
  },
)

AIMatchmakerMessages.displayName = "AIMatchmakerMessages"
