"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { VoiceInputButton } from "./voice-input-button"

interface AIMatchmakerInputProps {
  inputValue: string
  setInputValue: (value: string) => void
  handleSubmit: (e?: React.FormEvent) => void
  isTyping: boolean
}

export function AIMatchmakerInput({ inputValue, setInputValue, handleSubmit, isTyping }: AIMatchmakerInputProps) {
  const handleVoiceInput = (transcript: string) => {
    setInputValue(transcript)
    // Auto-submit after voice input
    setTimeout(() => {
      handleSubmit()
    }, 500)
  }

  return (
    <div className="border-t border-gray-200/50 dark:border-gray-800/50 p-4 backdrop-blur-sm bg-white/50 dark:bg-gray-900/50">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            className="w-full rounded-full border border-gray-300/70 dark:border-gray-700/70 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2.5 pr-24 text-sm shadow-md focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
          />

          {/* Voice input button */}
          <VoiceInputButton onTranscript={handleVoiceInput} disabled={isTyping} />

          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
            disabled={isTyping}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 22 2 11 13 11 22 2" />
            </svg>
          </Button>
        </div>
      </form>
    </div>
  )
}
