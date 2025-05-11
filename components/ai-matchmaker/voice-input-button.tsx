"use client"

import { useState } from "react"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVoiceInput } from "@/hooks/use-voice-input"
import { useToast } from "@/components/ui/use-toast"

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

export function VoiceInputButton({ onTranscript, disabled = false }: VoiceInputButtonProps) {
  const { toast } = useToast()
  const [processing, setProcessing] = useState(false)

  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceInput({
    onResult: (text) => {
      setProcessing(true)
      // Small delay to show processing state
      setTimeout(() => {
        onTranscript(text)
        setProcessing(false)
      }, 500)
    },
    onError: (error) => {
      toast({
        title: "Voice Input Error",
        description: error,
        variant: "destructive",
      })
      setProcessing(false)
    },
  })

  if (!isSupported) {
    return null // Don't show the button if not supported
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={`absolute top-1/2 right-12 -translate-y-1/2 rounded-full transition-colors ${
        isListening
          ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          : "hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
      }`}
      onClick={isListening ? stopListening : startListening}
      disabled={disabled || processing}
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
    >
      {processing ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  )
}
