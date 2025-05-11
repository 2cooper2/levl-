"use client"

import { useState } from "react"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { useMatchmaker } from "@/hooks/use-matchmaker"
import { AIMatchmakerHeader } from "./ai-matchmaker-header"
import { AIMatchmakerMessages } from "./ai-matchmaker-messages"
import { AIMatchmakerInput } from "./ai-matchmaker-input"
import { AIMatchmakerPreferences } from "./ai-matchmaker-preferences"

export function AIMatchmakerContainer() {
  const {
    messages,
    inputValue,
    setInputValue,
    isTyping,
    matchedServices,
    categories,
    aiModel,
    handleSubmit,
    handleOptionSelect,
    handleFeedbackSelect,
    resetConversation,
  } = useMatchmaker()

  const [showPreferences, setShowPreferences] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    // Scroll when messages change
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  return (
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

        {/* Header */}
        <AIMatchmakerHeader
          showPreferences={showPreferences}
          setShowPreferences={setShowPreferences}
          resetConversation={resetConversation}
        />

        {/* Preferences panel */}
        <AIMatchmakerPreferences
          showPreferences={showPreferences}
          setShowPreferences={setShowPreferences}
          categories={categories}
          aiModel={aiModel}
        />

        {/* Messages */}
        <AIMatchmakerMessages
          ref={chatContainerRef}
          messages={messages}
          handleOptionSelect={handleOptionSelect}
          handleFeedbackSelect={handleFeedbackSelect}
          messagesEndRef={messagesEndRef}
        />

        {/* Input */}
        <AIMatchmakerInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSubmit={handleSubmit}
          isTyping={isTyping}
        />
      </div>
    </motion.div>
  )
}
