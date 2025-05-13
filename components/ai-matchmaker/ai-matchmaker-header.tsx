"use client"
import { Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface AIMatchmakerHeaderProps {
  onTogglePreferences: () => void
  useGroqLLM: boolean
  onToggleGroqLLM: () => void
}

export function AIMatchmakerHeader({ onTogglePreferences, useGroqLLM, onToggleGroqLLM }: AIMatchmakerHeaderProps) {
  return (
    <div className="relative flex items-center justify-between p-5 border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm mb-0">
      <div className="flex items-center">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Chat controls</div>
      </div>
      <div className="flex items-center gap-2">
        {/* Groq LLM toggle */}
        <div className="flex items-center space-x-2 mr-2">
          <Switch
            id="groq-toggle"
            checked={useGroqLLM}
            onCheckedChange={onToggleGroqLLM}
            className="data-[state=checked]:bg-indigo-600"
          />
          <Label htmlFor="groq-toggle" className="text-xs cursor-pointer">
            Groq LLM
          </Label>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-white/20 dark:hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
          onClick={onTogglePreferences}
          title="Preferences"
        >
          <Sliders className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
