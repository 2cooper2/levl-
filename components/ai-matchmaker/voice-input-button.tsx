"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, StopCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoiceInputButtonProps {
  onVoiceInput: (text: string) => void
  disabled?: boolean
}

export function VoiceInputButton({ onVoiceInput, disabled = false }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if browser supports SpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex
          const result = event.results[current]
          const transcriptValue = result[0].transcript

          setTranscript(transcriptValue)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          if (isListening) {
            // Restart if we're still supposed to be listening
            recognitionRef.current.start()
          }
        }
      } else {
        setIsSupported(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isListening])

  // Toggle listening state
  const toggleListening = () => {
    if (!isSupported || disabled) return

    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Start listening
  const startListening = () => {
    setTranscript("")
    setIsListening(true)
    recognitionRef.current.start()
  }

  // Stop listening and submit transcript
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }

    setIsListening(false)

    if (transcript.trim()) {
      onVoiceInput(transcript.trim())
      setTranscript("")
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleListening}
        disabled={disabled}
        className={`rounded-full ${
          isListening
            ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        }`}
        aria-label={isListening ? "Stop voice input" : "Start voice input"}
      >
        {isListening ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[200px]"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="relative">
                  <div className="absolute -inset-0.5 rounded-full animate-ping bg-red-500/20"></div>
                  <div className="relative h-2 w-2 rounded-full bg-red-600"></div>
                </div>
                <span className="ml-2 text-sm font-medium">Listening...</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={stopListening}
                className="h-6 w-6 p-0 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <MicOff className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300 min-h-[20px] max-h-[60px] overflow-y-auto">
              {transcript || "Say something..."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
