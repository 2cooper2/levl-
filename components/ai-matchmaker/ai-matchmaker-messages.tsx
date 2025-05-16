"use client"

import type React from "react"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { LLMFeedback } from "./llm-feedback"
import type { Message } from "@/types/matchmaker"
import { LevlLogo } from "@/components/levl-logo"

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
                className="self-end bg-gradient-to-br from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%] shadow-[0_10px_15px_-3px_rgba(79,70,229,0.3),0_4px_6px_-4px_rgba(79,70,229,0.4)] border border-indigo-400 transform hover:translate-y-[-2px] hover:shadow-[0_14px_20px_-6px_rgba(79,70,229,0.4),0_6px_8px_-5px_rgba(79,70,229,0.5)] transition-all duration-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  filter: "drop-shadow(0 4px 3px rgba(79, 70, 229, 0.15))",
                }}
              >
                <p className="text-sm">{message.content}</p>
              </motion.div>
            ) : message.type === "ai" ? (
              <motion.div
                className="self-start bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 px-4 py-2 rounded-2xl rounded-tl-none max-w-[80%] shadow-[0_15px_25px_-12px_rgba(0,0,0,0.25),0_8px_10px_-6px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_25px_-12px_rgba(0,0,0,0.5),0_8px_10px_-6px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-600 transform hover:translate-y-[-2px] hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.3),0_10px_15px_-8px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.6),0_10px_15px_-8px_rgba(0,0,0,0.5)] transition-all duration-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  filter: "drop-shadow(0 10px 8px rgba(0, 0, 0, 0.15))",
                }}
              >
                <p className="text-sm dark:text-gray-200">{message.content}</p>

                {message.services && message.services.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.services.map((service) => (
                      <div
                        key={service.id}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer shadow-sm"
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
                        className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-xs px-3 py-1.5 rounded-full transition-colors shadow-sm"
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
                className="self-center bg-gradient-to-br from-indigo-50 to-indigo-100/80 dark:from-indigo-900/40 dark:to-indigo-800/30 px-4 py-2 rounded-xl max-w-[90%] shadow-[0_10px_15px_-3px_rgba(79,70,229,0.1),0_4px_6px_-4px_rgba(79,70,229,0.1)] dark:shadow-[0_10px_15px_-3px_rgba(79,70,229,0.15),0_4px_6px_-4px_rgba(79,70,229,0.1)] border border-indigo-100 dark:border-indigo-700/30 transform hover:translate-y-[-2px] hover:shadow-[0_14px_20px_-6px_rgba(79,70,229,0.15),0_6px_8px_-5px_rgba(79,70,229,0.1)] transition-all duration-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  filter: "drop-shadow(0 4px 3px rgba(79, 70, 229, 0.07))",
                }}
              >
                <p className="text-sm text-center text-indigo-700 dark:text-indigo-300">{message.content}</p>

                {message.feedbackOptions && message.feedbackOptions.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {message.feedbackOptions.map((option, index) => (
                      <button
                        key={index}
                        className="bg-indigo-100 dark:bg-indigo-800/50 hover:bg-indigo-200 dark:hover:bg-indigo-700/50 text-indigo-700 dark:text-indigo-300 text-xs px-3 py-1.5 rounded-full transition-colors shadow-sm"
                        onClick={() => onFeedbackSelect(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : message.type === "loading" ? (
              <div className="flex items-center space-x-3">
                <div className="bg-white dark:bg-gray-200 p-1 rounded-xl shadow-md h-14 w-14 flex items-center justify-center">
                  <div className="h-12 w-12">
                    <LevlLogo />
                  </div>
                </div>
                <motion.div
                  className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-[0_15px_25px_-12px_rgba(0,0,0,0.25),0_8px_10px_-6px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_25px_-12px_rgba(0,0,0,0.5),0_8px_10px_-6px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-600 transform hover:translate-y-[-2px] hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.3),0_10px_15px_-8px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_20px_30px_-10px_rgba(0,0,0,0.6),0_10px_15px_-8px_rgba(0,0,0,0.5)] transition-all duration-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    filter: "drop-shadow(0 10px 8px rgba(0, 0, 0, 0.15))",
                  }}
                >
                  <div className="flex space-x-2 items-center">
                    <div
                      className="h-2.5 w-2.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="h-2.5 w-2.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="h-2.5 w-2.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </motion.div>
              </div>
            ) : null}
          </div>
        ))}

        {messagesEndRef && <div ref={messagesEndRef} />}
      </div>
    )
  },
)

AIMatchmakerMessages.displayName = "AIMatchmakerMessages"
