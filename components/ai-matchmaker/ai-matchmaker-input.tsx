"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { VoiceInputButton } from "./voice-input-button"

interface AIMatchmakerInputProps {
  inputValue: string
  setInputValue: (value: string) => void
  handleSubmit: (e?: React.FormEvent) => void
  isTyping: boolean
}

export function AIMatchmakerInput({ inputValue, setInputValue, handleSubmit, isTyping }: AIMatchmakerInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle form submission
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isTyping) {
      handleSubmit(e)
    }
  }

  // Handle voice input
  const handleVoiceInput = (text: string) => {
    setInputValue(text)
    // Focus the input after voice input
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Auto-focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm transition-all duration-200 ${
        isFocused ? "shadow-md" : ""
      }`}
    >
      <form onSubmit={onSubmit} className="flex items-center space-x-2 max-w-screen-xl mx-auto">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isTyping}
            className="pr-10 py-4 sm:py-6 bg-gray-50/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 focus:border-transparent"
          />
        </div>

        <VoiceInputButton onVoiceInput={handleVoiceInput} disabled={isTyping} />

        <Button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className={`rounded-full ${
            !inputValue.trim() || isTyping
              ? "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
}
