"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Mic, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AIMatchmakerInputProps {
  inputValue: string
  setInputValue: (value: string) => void
  handleSubmit: (e?: React.FormEvent) => void
  isTyping: boolean
}

export function AIMatchmakerInput({ inputValue, setInputValue, handleSubmit, isTyping }: AIMatchmakerInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
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
    setIsRecording(false)
    // Focus the input after voice input
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Handle voice recording toggle
  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  // Auto-focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Add a fixed position when the chat area is scrollable
  const [scrolled, setScrolled] = useState(false)

  // Add this useEffect to detect scrolling
  useEffect(() => {
    const chatContainer = document.getElementById("chat-container")

    if (chatContainer) {
      const handleScroll = () => {
        if (chatContainer.scrollTop > 50) {
          setScrolled(true)
        } else {
          setScrolled(false)
        }
      }

      chatContainer.addEventListener("scroll", handleScroll)
      return () => chatContainer.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-gradient-to-t from-background to-transparent pb-6 pt-3">
      <form onSubmit={onSubmit} className="flex items-center gap-2 max-w-4xl mx-auto relative px-4 py-3">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder={isTyping ? "AI is thinking..." : "Type your message..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isTyping}
            className="px-4 py-6 pl-12 bg-gradient-to-r from-background via-white/90 to-background dark:via-gray-800/90
          border-0 focus:ring-0 focus:border-0 outline-none
          rounded-full shadow-[0_4px_12px_rgba(79,70,229,0.15)] hover:shadow-[0_6px_16px_rgba(79,70,229,0.2)]
          dark:shadow-[0_4px_12px_rgba(79,70,229,0.2)] dark:hover:shadow-[0_6px_16px_rgba(79,70,229,0.25)]
          transition-all duration-200 pr-10"
          />

          {/* Paperclip button inside input */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-transparent dark:hover:bg-transparent rounded-full h-8 w-8"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          {inputValue && (
            <button
              type="button"
              onClick={() => setInputValue("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className={`rounded-full border-indigo-200/60 dark:border-indigo-800/50 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40
      ${
        isRecording
          ? "bg-red-500/10 text-red-500 border-red-200 dark:border-red-800 animate-pulse"
          : "text-indigo-500 dark:text-indigo-400"
      }`}
          onClick={toggleRecording}
          aria-label={isRecording ? "Stop recording" : "Start voice input"}
        >
          <Mic className="h-5 w-5" />
        </Button>

        <Button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className={`rounded-full px-4 py-2 h-11 min-w-11 transition-all duration-300 ${
            !inputValue.trim() || isTyping
              ? "bg-indigo-300/70 text-indigo-100/90 dark:bg-indigo-800/30 dark:text-indigo-400/50 shadow-none transform-none"
              : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-[0_4px_10px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_15px_rgba(79,70,229,0.4)] hover:-translate-y-[2px]"
          }`}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  )
}
