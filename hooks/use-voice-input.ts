"use client"

import { useState, useEffect, useCallback } from "react"

interface UseVoiceInputProps {
  onResult: (transcript: string) => void
  onError?: (error: string) => void
  language?: string
  continuous?: boolean
  autoStart?: boolean
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
    resultIndex: number
  }
  interface SpeechRecognitionResultList extends Array<SpeechRecognitionResult> {}
  interface SpeechRecognitionResult extends Array<SpeechRecognitionAlternative> {
    isFinal: boolean
  }
  interface SpeechRecognitionAlternative {
    transcript: string
    confidence: number
  }
  interface SpeechRecognitionErrorEvent extends Event {
    error: string
  }
}

export function useVoiceInput({
  onResult,
  onError,
  language = "en-US",
  continuous = false,
  autoStart = false,
}: UseVoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if browser supports speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = continuous
        recognitionInstance.interimResults = true
        recognitionInstance.lang = language

        setRecognition(recognitionInstance)
        setIsSupported(true)

        // Auto-start if enabled
        if (autoStart) {
          startListening(recognitionInstance)
        }
      } else {
        setIsSupported(false)
        if (onError) {
          onError("Speech recognition is not supported in this browser")
        }
      }
    }

    return () => {
      if (recognition) {
        recognition.abort()
      }
    }
  }, [continuous, language, autoStart, onError])

  // Set up event handlers
  useEffect(() => {
    if (!recognition) return

    const handleResult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      const currentTranscript = finalTranscript || interimTranscript
      setTranscript(currentTranscript)

      if (finalTranscript && !continuous) {
        onResult(finalTranscript)
        stopListening()
      } else if (continuous && finalTranscript) {
        onResult(finalTranscript)
      }
    }

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      if (onError) {
        onError(event.error)
      }
      setIsListening(false)
    }

    const handleEnd = () => {
      setIsListening(false)
    }

    recognition.onresult = handleResult
    recognition.onerror = handleError
    recognition.onend = handleEnd

    return () => {
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
    }
  }, [recognition, continuous, onResult, onError])

  // Start listening
  const startListening = useCallback(
    (instance?: SpeechRecognition) => {
      const recognitionInstance = instance || recognition

      if (recognitionInstance) {
        try {
          recognitionInstance.start()
          setIsListening(true)
          setTranscript("")
        } catch (error) {
          console.error("Error starting speech recognition:", error)
          if (onError) {
            onError("Failed to start speech recognition")
          }
        }
      }
    },
    [recognition, onError],
  )

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }, [recognition])

  return {
    isListening,
    transcript,
    startListening: () => startListening(),
    stopListening,
    isSupported,
  }
}
