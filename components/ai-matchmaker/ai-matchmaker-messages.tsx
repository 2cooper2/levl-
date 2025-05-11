"use client"

import type React from "react"

import { forwardRef } from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { Message, Service } from "@/types/matchmaker"

interface AIMatchmakerMessagesProps {
  messages: Message[]
  handleOptionSelect: (option: string) => void
  handleFeedbackSelect: (option: string) => void
  messagesEndRef: React.RefObject<HTMLDivElement>
}

export const AIMatchmakerMessages = forwardRef<HTMLDivElement, AIMatchmakerMessagesProps>(
  ({ messages, handleOptionSelect, handleFeedbackSelect, messagesEndRef }, ref) => {
    const renderServiceCard = (service: Service) => {
      return (
        <div
          key={service.id}
          className="flex items-start space-x-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <div className="relative h-20 w-20 rounded-lg overflow-hidden shadow-md">
            <Image src={service.image || "/placeholder.svg"} alt={service.title} layout="fill" objectFit="cover" />
          </div>
          <div>
            <h5 className="font-medium text-sm">{service.title}</h5>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              <Star className="h-4 w-4 mr-1 text-amber-500" />
              <span>{service.provider.rating}</span>
              <span className="ml-1">({service.provider.reviews})</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {service.description.substring(0, 50)}
              {service.description.length > 50 ? "..." : ""}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-medium text-sm">{service.price}</span>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/80 dark:bg-gray-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-gray-200/70 dark:border-gray-700/70 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200"
              >
                View Details
              </Button>
            </div>
            {service.matchScore && (
              <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
                Match Score: <span className="text-indigo-600 dark:text-indigo-400">{service.matchScore}%</span>
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className="h-[500px] overflow-y-auto p-6 bg-gradient-to-b from-gray-50/80 to-white/90 dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-sm"
      >
        <div className="space-y-6 max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {message.type === "user" && (
                <div className="flex justify-end">
                  <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-tr-none px-5 py-3 max-w-[80%] shadow-lg shadow-indigo-500/20 relative">
                    <div className="absolute top-0 right-0 h-3 w-3 bg-indigo-600 transform translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                    <p className="text-sm">{message.content}</p>
                    <div className="text-[10px] text-white/70 text-right mt-1">
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
                  <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl rounded-tl-none px-5 py-3 max-w-[80%] shadow-lg border border-gray-100/50 dark:border-gray-700/50">
                    <div className="absolute top-0 left-0 h-3 w-3 bg-white/90 dark:bg-gray-800/90 border-l border-t border-gray-100/50 dark:border-gray-700/50 transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                    <p className="text-sm">{message.content}</p>
                    {message.options && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {message.options.map((option) => (
                          <button
                            key={option}
                            className="px-3 py-1.5 bg-gray-100/80 dark:bg-gray-700/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-full text-xs font-medium transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50 hover:border-indigo-300 dark:hover:border-indigo-700/50 backdrop-blur-sm hover:shadow-md"
                            onClick={() => handleOptionSelect(option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                    {message.services && (
                      <div className="mt-5 space-y-4">
                        {message.services.map((service) => renderServiceCard(service))}
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400 mt-1">
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
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-5 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
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
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-5 py-3 max-w-[80%] shadow-md border border-gray-100 dark:border-gray-700">
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
                    <div className="text-[10px] text-gray-400 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Date separator - show only when date changes */}
              {index > 0 &&
                new Date(message.timestamp).toDateString() !==
                  new Date(messages[index - 1].timestamp).toDateString() && (
                  <div className="flex justify-center my-6">
                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs px-3 py-1 rounded-full">
                      {new Date(message.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    )
  },
)

AIMatchmakerMessages.displayName = "AIMatchmakerMessages"
