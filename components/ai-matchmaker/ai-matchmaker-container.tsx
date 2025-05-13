"use client"

import { useState, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useMatchmaker } from "@/hooks/use-matchmaker"
import { AIMatchmakerMessages } from "@/components/ai-matchmaker/ai-matchmaker-messages"
import { AIMatchmakerInput } from "@/components/ai-matchmaker/ai-matchmaker-input"
import { AIMatchmakerHeader } from "@/components/ai-matchmaker/ai-matchmaker-header"
import { AIMatchmakerPreferences } from "@/components/ai-matchmaker/ai-matchmaker-preferences"
import { BookingFlow } from "@/components/ai-matchmaker/booking-flow"
import { ProviderMatching } from "@/components/ai-matchmaker/provider-matching"
import { VoiceInputButton } from "@/components/ai-matchmaker/voice-input-button"
import { LearningIndicator } from "@/components/ai-matchmaker/learning-indicator"
import { Card } from "@/components/ui/card"

export function AIMatchmakerContainer() {
  const {
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
    setShowProviderMatching, // Added setShowProviderMatching from useMatchmaker hook
    handleSubmit,
    handleOptionSelect,
    handleFeedbackSelect,
    resetConversation,
    handleBookingComplete,
    handleProviderSelect,
    setShowBookingFlow,
    handleLLMFeedback,
  } = useMatchmaker()

  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState({
    budget: "medium",
    timeframe: "flexible",
    quality: "high",
    experience: "experienced",
  })
  const [useGroqLLM, setUseGroqLLM] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Handle preference changes
  const handlePreferenceChange = (name: string, value: string) => {
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const applyPreferences = () => {
    // In a real app, this would trigger a re-evaluation of recommendations
    setShowPreferences(false)

    // Update user model with preferences
    if (aiModel && aiModel.userModel) {
      const updatedModel = { ...aiModel.userModel }

      // Map UI preferences to user model
      if (preferences.budget === "low") {
        updatedModel.budget.sensitivity = 8
      } else if (preferences.budget === "medium") {
        updatedModel.budget.sensitivity = 5
      } else if (preferences.budget === "high") {
        updatedModel.budget.sensitivity = 3
      }

      if (preferences.quality === "low") {
        updatedModel.quality.importance = 4
      } else if (preferences.quality === "medium") {
        updatedModel.quality.importance = 6
      } else if (preferences.quality === "high") {
        updatedModel.quality.importance = 8
      }

      if (preferences.timeframe === "urgent") {
        updatedModel.timing.urgency = 9
      } else if (preferences.timeframe === "soon") {
        updatedModel.timing.urgency = 6
      } else if (preferences.timeframe === "flexible") {
        updatedModel.timing.urgency = 3
      }
    }
  }

  // Toggle Groq LLM usage
  const toggleGroqLLM = () => {
    setUseGroqLLM(!useGroqLLM)
  }

  return (
    <section className="w-full pt-4 pb-8 md:pt-6 md:pb-12 relative overflow-hidden order-first z-20 px-0 mx-0">
      {/* LEVL Logo at the top */}
      <div className="flex justify-center mb-4 relative z-50">
        <div className="relative">
          {/* Enhanced animated glow effect with pulsing rings */}
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-full blur-md opacity-70 animate-pulse"></div>
          <div className="absolute -inset-2 bg-gradient-to-r from-violet-400/20 to-indigo-600/20 rounded-full blur-lg animate-[pulse_3s_ease-in-out_infinite]"></div>
          <div className="absolute -inset-3 bg-gradient-to-r from-indigo-400/10 to-purple-600/10 rounded-full blur-xl animate-[pulse_4s_ease-in-out_infinite_1s]"></div>

          {/* Enhanced logo with 3D effect and animated gradient */}
          <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/30 group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative h-full w-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center backdrop-blur-sm overflow-hidden">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-violet-500/10 animate-[spin_10s_linear_infinite]"></div>

              {/* LEVL Logo */}
              <div className="relative z-10 h-12 w-12 transform transition-transform duration-300 group-hover:scale-110 flex items-center justify-center">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8FA8E082-14C4-45EA-B6C8-4546E2E5148B_1_105_c-vkgBBR2PfAl9KdJIcEU2v2Zs5dPV6b.jpeg"
                  alt="LEVL Logo"
                  className="h-10 w-10 drop-shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="ml-3 self-center">
          <h2 className="font-bold text-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
            LEVL AI Assistant
          </h2>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-300">Your personal service matchmaker</div>
        </div>
      </div>
      {/* Enhanced background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 via-white/90 to-violet-50/80 dark:from-gray-900/90 dark:via-gray-900/95 dark:to-indigo-950/80 z-10" />

      {/* Enhanced grid pattern background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5MDkwOTAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2NmgxOHYtNkgzNnptMCAxMnY2aDE4di02SDM2em0wIDEydjZoMTh2LTZIMzZ6TTI0IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2NmgxOHYtNkgyNHptMCAxMnY2aDE4di02SDI0em0wIDEydjZoMTh2LTZIMjR6TTEyIDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2NmgxOHYtNkgxMnptMCAxMnY2aDE4di02SDEyem0wIDEydjZoMTh2LTZIMTJ6TTAgMzR2NmgxMnYtNkgwem0wLTMwdjZoMTJ2LTZIMHptMCAxMnY2aDE4di02SDB6bTAgMTJ2NmgxOHYtNkgwem0wIDEydjZoMTh2LTZIMHoiLz48L2c+PC9nPjwvc3ZnPg==')] bg-[size:30px_30px] z-10 opacity-30" />

      <div className="w-full relative z-20 overflow-x-hidden px-0 mx-0">
        {/* AI Matchmaker Interface */}
        <motion.div
          className="w-full mx-0 px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
            {/* Enhanced background gradient with animated pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-indigo-600/15 to-purple-600/20 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMjI2NTkiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2NmgxOHYtNkgzNnptMCAxMnY2aDE4di02SDM2em0wIDEydjZoMTh2LTZIMzZ6TTI0IDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2NmgxOHYtNkgyNHptMCAxMnY2aDE4di02SDI0em0wIDEydjZoMTh2LTZIMjR6TTEyIDM0djZoNnYtNmgtNnptMC0zMHY2aDZ2LTZoLTZ6bTAgMTJ2NmgxOHYtNkgxMnptMCAxMnY2aDE4di02SDEyem0wIDEydjZoMTh2LTZIMTJ6TTAgMzR2NmgxMnYtNkgwem0wLTMwdjZoMTJ2LTZIMHptMCAxMnY2aDE4di02SDB6bTAgMTJ2NmgxOHYtNkgwem0wIDEydjZoMTh2LTZIMHoiLz48L2c+PC9nPjwvc3ZnPg==')] animate-[pulse_15s_ease-in-out_infinite] opacity-70"></div>

            {/* Enhanced header content */}
            <AIMatchmakerHeader
              onTogglePreferences={() => setShowPreferences(!showPreferences)}
              useGroqLLM={useGroqLLM}
              onToggleGroqLLM={toggleGroqLLM}
            />

            {/* Preferences panel */}
            <AnimatePresence>
              {showPreferences && (
                <motion.div
                  className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AIMatchmakerPreferences
                    preferences={preferences}
                    onPreferenceChange={handlePreferenceChange}
                    onCancel={() => setShowPreferences(false)}
                    onApply={applyPreferences}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main content area - show booking flow or chat */}
            <AnimatePresence mode="wait">
              {showBookingFlow && selectedService ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative bg-white dark:bg-gray-900 p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-4 left-4"
                      onClick={() => setShowBookingFlow(false)}
                    >
                      Back to chat
                    </Button>
                    <BookingFlow service={selectedService} onComplete={handleBookingComplete} />
                  </div>
                </motion.div>
              ) : showProviderMatching ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProviderMatching
                    userModel={aiModel.userModel}
                    onProviderSelect={handleProviderSelect}
                    onBack={() => setShowProviderMatching(false)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Chat messages */}
                  <div
                    ref={chatContainerRef}
                    className="h-[500px] overflow-y-auto p-6 bg-gradient-to-b from-gray-50/80 to-white/90 dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-sm"
                  >
                    <div className="space-y-6 w-full mx-auto">
                      <AIMatchmakerMessages
                        messages={messages}
                        isTyping={isTyping}
                        matchedServices={matchedServices}
                        onOptionSelect={handleOptionSelect}
                        onFeedbackSelect={handleFeedbackSelect}
                        onLLMFeedback={handleLLMFeedback}
                        messagesEndRef={messagesEndRef}
                      />
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* New model info card */}
                  {useGroqLLM && (
                    <div className="px-6 pb-2">
                      <Card className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/30">
                        <div className="flex items-center text-xs text-indigo-700 dark:text-indigo-300">
                          <span>
                            <span className="font-semibold">Groq LLama-3 8B</span> - Powered by Groq's ultra-fast LLM
                            for enhanced, personalized responses
                          </span>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Input area */}
                  <div className="border-t border-gray-200/50 dark:border-gray-800/50 p-4 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50">
                    <AIMatchmakerInput
                      inputValue={inputValue}
                      setInputValue={setInputValue}
                      handleSubmit={handleSubmit}
                      isTyping={isTyping}
                    >
                      <VoiceInputButton onTranscript={setInputValue} disabled={isTyping} />
                    </AIMatchmakerInput>
                  </div>

                  {/* Learning indicator */}
                  <LearningIndicator aiModel={aiModel} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
