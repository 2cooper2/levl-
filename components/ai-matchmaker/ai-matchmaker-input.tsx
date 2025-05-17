"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { VoiceInputButton } from "./voice-input-button"
import { useVoiceInput } from "@/hooks/use-voice-input"

export function AIMatchmakerInput({ onSendMessage }: { onSendMessage: (message: string) => void }) {
  const [input, setInput] = useState("")
  const { isListening, transcript, startListening, stopListening, isRecording } = useVoiceInput()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  // Use the transcript when voice input is done
  useEffect(() => {
    if (transcript && !isListening && transcript !== input) {
      setInput(transcript)
    }
  }, [transcript, isListening, input])

  // Handle transcript updates
  useEffect(() => {
    if (isRecording === false && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isRecording])

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <Input
        className="flex-1"
        placeholder="Describe what service you're looking for..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        ref={inputRef}
      />
      <VoiceInputButton isListening={isListening} onStartListening={startListening} onStopListening={stopListening} />
      <Button type="submit" size="icon" disabled={!input.trim()}>
        <Send className="h-4 w-4" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  )
}
