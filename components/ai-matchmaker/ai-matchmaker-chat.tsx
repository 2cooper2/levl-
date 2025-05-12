"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Filter, Sliders, Star, Send, Mic, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMatchmaker } from "@/context/matchmaker-context"
import type { Service } from "@/types/matchmaker"
import { useMobile } from "@/hooks/use-mobile"
import { EnhancedCategoryCard } from "@/components/enhanced-category-card"
import { Briefcase, Wrench, Camera, Code, PaintBucket, Lightbulb } from "lucide-react"

export function AIMatchmakerChat() {
  const {
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
  } = useMatchmaker()

  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState({
    budget: "medium",
    timeframe: "flexible",
    quality: "high",
    experience: "experienced",
  })
  const [showReasoning, setShowReasoning] = useState(false)
  const isMobile = useMobile()
  const router = useRouter()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
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
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Handle user input submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (inputValue.trim() === "") return

    // Add user message to chat
    addUserMessage(inputValue)

    // Clear input
    dispatch({ type: "SET_INPUT_VALUE", payload: "" })

    // Process user input
    await handleProcessInput(inputValue)
  }

  // Handle processing of user input
  const handleProcessInput = async (input: string) => {
    // For demonstration purposes, we'll use a simple delay
    // In a real application, this would be replaced with actual NLP processing
    startTyping(async () => {
      // Process the input with AI reasoning
      await processUserInput(input)

      // For demonstration, we'll add a sample AI response
      // This would be replaced with actual response generation based on AI reasoning
      const sampleResponse =
        "I understand you're looking for a service. Could you tell me more about what you need help with?"
      addAIMessage(sampleResponse)
    })
  }

  // Handle option selection
  const handleOptionSelect = (option: string) => {
    addUserMessage(option)
    handleProcessInput(option)
  }

  // Handle feedback selection
  const handleFeedbackSelect = (option: string) => {
    addUserMessage(option)
    handleProcessInput(option)
  }

  // Render service card
  const renderServiceCard = (service: Service) => {
    return (
      <div
        key={service.id}
        className="flex items-start space-x-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      >
        <div className="relative h-20 w-20 rounded-lg overflow-hidden shadow-md">
          <Image src={service.image || "/placeholder.svg"} alt={service.title} fill style={{ objectFit: "cover" }} />
        </div>
        <div className="flex-1">
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
              onClick={() => router.push(`/services/${service.id}`)}
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
    <section className="w-full pt-4 pb-8 md:pt-6 md:pb-12 relative overflow-hidden order-first z-20">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white/90 to-violet-50/80 dark:from-gray-900/90 dark:via-gray-900/95 dark:to-indigo-950/80 z-0" />

      {/* Enhanced grid pattern background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5MDkwOTAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2NmgxOHYtNkgzNnptMCAxMnY2aDE4di02SDM2em0wIDEydjZoMTh2LTZIMzZ6TTI0IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2NmgxOHYtNkgyNHptMCAxMnY2aDE4di02SDI0em0wIDEydjZoMTh2LTZIMjR6TTEyIDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2NmgxOHYtNkgxMnptMCAxMnY2aDE4di02SDEyem0wIDEydjZoMTh2LTZIMTJ6TTAgMzR2NmgxMnYtNkgwem0wLTMwdjZoMTJ2LTZIMHptMCAxMnY2aDE4di02SDB6bTAgMTJ2NmgxOHYtNkgwem0wIDEydjZoMTh2LTZIMHoiLz48L2c+PC9nPjwvc3ZnPg==')] bg-[size:30px_30px] z-0 opacity-30" />

      <div className="container relative z-10">
        {/* AI Matchmaker Interface */}
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
            {/* Enhanced background gradient with animated pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-indigo-600/15 to-purple-600/20 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMjI2NTkiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2NmgxOHYtNkgzNnptMCAxMnY2aDE4di02SDM2em0wIDEydjZoMTh2LTZIMzZ6TTI0IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2NmgxOHYtNkgyNHptMCAxMnY2aDE4di02SDI0em0wIDEydjZoMTh2LTZIMjR6TTEyIDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2NmgxOHYtNkgxMnptMCAxMnY2aDE4di02SDEyem0wIDEydjZoMTh2LTZIMTJ6TTAgMzR2NmgxMnYtNkgwem0wLTMwdjZoMTJ2LTZIMHptMCAxMnY2aDE4di02SDB6bTAgMTJ2NmgxOHYtNkgwem0wIDEydjZoMTh2LTZIMHoiLz48L2c+PC9nPjwvc3ZnPg==')] animate-[pulse_15s_ease-in-out_infinite] opacity-70"></div>

            {/* Enhanced header content */}
            <div className="relative flex items-center justify-between p-5 border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm mb-0">
              <div className="flex items-center">
                <div className="relative">
                  {/* Enhanced animated glow effect with pulsing rings */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-full blur-md opacity-70 animate-pulse"></div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-violet-400/20 to-indigo-600/20 rounded-full blur-lg animate-[pulse_3s_ease-in-out_infinite]"></div>
                  <div className="absolute -inset-3 bg-gradient-to-r from-indigo-400/10 to-purple-600/10 rounded-full blur-xl animate-[pulse_4s_ease-in-out_infinite_1s]"></div>

                  {/* Enhanced bot avatar with 3D effect and animated gradient */}
                  <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/30 group">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative h-full w-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center backdrop-blur-sm overflow-hidden">
                      {/* Animated background effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-violet-500/10 animate-[spin_10s_linear_infinite]"></div>

                      {/* Animated circuit pattern */}
                      <div className="absolute inset-0 opacity-20 dark:opacity-30">
                        <svg viewBox="0 0 24 24" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="0.4"
                            d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"
                            className="text-indigo-600 dark:text-indigo-400 animate-[pulse_4s_ease-in-out_infinite]"
                          />
                          <circle
                            cx="12"
                            cy="12"
                            r="3"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="0.4"
                            className="text-violet-600 dark:text-violet-400 animate-[pulse_3s_ease-in-out_infinite_0.5s]"
                          />
                          <path
                            d="M12 8v1M12 15v1M8 12h1M15 12h1"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="0.4"
                            className="text-purple-600 dark:text-purple-400 animate-[pulse_5s_ease-in-out_infinite_1s]"
                          />
                        </svg>
                      </div>

                      {/* Enhanced robot icon with 3D effect */}
                      <div className="relative z-10 h-7 w-7 transform transition-transform duration-300 group-hover:scale-110">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="url(#ai-brain-gradient)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-full w-full drop-shadow-md"
                        >
                          <defs>
                            <linearGradient id="ai-brain-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#8b5cf6" />
                              <stop offset="50%" stopColor="#6366f1" />
                              <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                          </defs>
                          {/* Brain with circuit paths */}
                          <path d="M9.5 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
                          <path d="M14.5 4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
                          <path d="M17.5 11a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
                          <path d="M6.5 11a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
                          <path d="M12 22a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                          <path d="M10 7v3" />
                          <path d="M14 7v3" />
                          <path d="M9 17l1.5-3" />
                          <path d="M15 17l-1.5-3" />
                          <path d="M9 11h6" />
                          <path d="M17 14h-4" />
                          <path d="M7 14h4" />
                          {/* Pulse circles */}
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            className="opacity-10 animate-[pulse_3s_ease-in-out_infinite]"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
                    LEVL AI
                  </h3>
                  <div className="flex items-center text-xs font-medium">
                    <span className="flex h-2.5 w-2.5 relative mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <span className="text-green-600 dark:text-green-400">Active now</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-white/20 dark:hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
                        onClick={() => setShowReasoning(!showReasoning)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                          <path d="M12 9v4" />
                          <path d="M12 17v.01" />
                        </svg>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Show AI reasoning</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-white/20 dark:hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
                        onClick={() => setShowPreferences(!showPreferences)}
                      >
                        <Sliders className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Matchmaking preferences</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-white/20 dark:hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
                        onClick={resetConversation}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                        >
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                        </svg>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reset conversation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Service cards section */}
            <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-gray-50/80 via-white/80 to-gray-50/80 dark:from-gray-900/80 dark:via-gray-900/90 dark:to-gray-900/80">
              <div className="overflow-x-auto pb-2">
                <div className="flex space-x-3">
                  <EnhancedCategoryCard
                    icon={Wrench}
                    name="Home Services"
                    count={0}
                    index={0}
                    size="small"
                    className="w-32 h-32 flex-shrink-0"
                  />
                  <EnhancedCategoryCard
                    icon={Code}
                    name="Development"
                    count={0}
                    index={1}
                    size="small"
                    className="w-32 h-32 flex-shrink-0"
                  />
                  <EnhancedCategoryCard
                    icon={Camera}
                    name="Photography"
                    count={0}
                    index={2}
                    size="small"
                    className="w-32 h-32 flex-shrink-0"
                  />
                  <EnhancedCategoryCard
                    icon={PaintBucket}
                    name="Design"
                    count={0}
                    index={3}
                    size="small"
                    className="w-32 h-32 flex-shrink-0"
                  />
                  <EnhancedCategoryCard
                    icon={Briefcase}
                    name="Business"
                    count={0}
                    index={4}
                    size="small"
                    className="w-32 h-32 flex-shrink-0"
                  />
                  <EnhancedCategoryCard
                    icon={Lightbulb}
                    name="Marketing"
                    count={0}
                    index={5}
                    size="small"
                    className="w-32 h-32 flex-shrink-0"
                  />
                </div>
              </div>
            </div>

            {/* AI Reasoning Panel (collapsible) */}
            <AnimatePresence>
              {showReasoning && (
                <motion.div
                  className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400"
                        >
                          <path d="M18 6H5c-1 0-2 .5-2 2v3c0 1.5 1 2 2 2h13c1 0 2-.5 2-2V8c0-1.5-1-2-2-2Z" />
                          <path d="M18 13H5c-1 0-2 .5-2 2v3c0 1.5 1 2 2 2h13c1 0 2-.5 2-2v-3c0-1.5-1-2-2-2Z" />
                          <path d="M10 6v12" />
                        </svg>
                        AI Reasoning Process
                      </h4>
                      <Button variant="ghost" size="sm" onClick={() => setShowReasoning(false)} className="h-6 w-6 p-0">
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-xs">
                      {aiModel.reasoningTrace.length > 0 ? (
                        aiModel.reasoningTrace.map((step, index) => (
                          <div
                            key={step.id}
                            className="border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-indigo-600 dark:text-indigo-400">{step.step}</span>
                              <Badge variant="outline" className="text-[10px] h-4">
                                {Math.round(step.confidence * 100)}% confidence
                              </Badge>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mt-1 text-[11px]">{step.reasoning}</p>
                            <p className="text-gray-800 dark:text-gray-200 mt-1 font-medium">{step.conclusion}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-2">
                          No reasoning data available yet.
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preferences panel */}
            <AnimatePresence>
              {showPreferences && (
                <motion.div
                  className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-sm"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Filter className="h-4 w-4 mr-2" />
                      Matchmaking Preferences
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Budget Range</label>
                        <select
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          value={preferences.budget}
                          onChange={(e) => setPreferences({ ...preferences, budget: e.target.value })}
                        >
                          <option value="low">Budget-friendly</option>
                          <option value="medium">Mid-range</option>
                          <option value="high">Premium</option>
                          <option value="any">No preference</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Timeframe</label>
                        <select
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          value={preferences.timeframe}
                          onChange={(e) => setPreferences({ ...preferences, timeframe: e.target.value })}
                        >
                          <option value="urgent">As soon as as possible</option>
                          <option value="soon">Within a week</option>
                          <option value="planned">Within a month</option>
                          <option value="flexible">Flexible</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Quality Importance</label>
                        <select
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          value={preferences.quality}
                          onChange={(e) => setPreferences({ ...preferences, quality: e.target.value })}
                        >
                          <option value="high">Very important</option>
                          <option value="medium">Somewhat important</option>
                          <option value="low">Not very important</option>
                          <option value="any">No preference</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Provider Experience</label>
                        <select
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                          value={preferences.experience}
                          onChange={(e) => setPreferences({ ...preferences, experience: e.target.value })}
                        >
                          <option value="expert">Expert level</option>
                          <option value="experienced">Experienced</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="any">No preference</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => setShowPreferences(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setShowPreferences(false)
                          // Apply preferences
                          // For demo purposes
                        }}
                      >
                        Apply Preferences
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat messages */}
            <div
              ref={chatContainerRef}
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

            {/* Input area */}
            <div className="border-t border-gray-200/50 dark:border-gray-800/50 p-4 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50">
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    className="w-full rounded-full border border-gray-300/70 dark:border-gray-700/70 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2.5 pr-28 text-sm shadow-md focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(e) => dispatch({ type: "SET_INPUT_VALUE", payload: e.target.value })}
                    disabled={isTyping}
                  />
                  <div className="absolute top-1/2 right-2 -translate-y-1/2 flex">
                    {!isMobile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 mr-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                        disabled={isTyping}
                      >
                        <Mic className="h-4 w-4 text-gray-500" />
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                      disabled={isTyping || !inputValue.trim()}
                    >
                      <Send className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
