"use client"

import { Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LevlLogo } from "@/components/levl-logo"

interface AIMatchmakerHeaderProps {
  showPreferences: boolean
  setShowPreferences: (show: boolean) => void
  resetConversation: () => void
}

export function AIMatchmakerHeader({
  showPreferences,
  setShowPreferences,
  resetConversation,
}: AIMatchmakerHeaderProps) {
  return (
    <div className="relative flex items-center justify-between p-5 border-b border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm mb-0">
      <div className="flex items-center">
        <div className="relative">
          {/* Enhanced animated glow effect with pulsing rings */}
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-full blur-md opacity-70 animate-pulse"></div>
          <div className="absolute -inset-2 bg-gradient-to-r from-violet-400/20 to-indigo-600/20 rounded-full blur-lg animate-[pulse_3s_ease-in-out_infinite]"></div>
          <div className="absolute -inset-3 bg-gradient-to-r from-indigo-400/10 to-purple-600/10 rounded-full blur-xl animate-[pulse_4s_ease-in-out_infinite_1s]"></div>

          {/* LEVL logo with animated effects */}
          <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 p-[2px] shadow-lg shadow-indigo-500/30 group">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative h-full w-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center backdrop-blur-sm overflow-hidden">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-violet-500/10 animate-[spin_10s_linear_infinite]"></div>

              {/* Animated circuit pattern */}
              <div className="absolute inset-0 opacity-20 dark:opacity-30">
                <svg viewBox="0 0 24 24" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="0.4"
                    d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z"
                    className="text-indigo-600 dark:text-indigo-400 animate-[pulse_4s_ease-in-out_infinite]"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="0.4"
                    className="text-violet-600 dark:text-violet-400 animate-[pulse_3s_ease-in-out_infinite_0.5s]"
                  />
                  <path
                    d="M12 8v1M12 15v1M8 12h1M15 12h1"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="0.4"
                    className="text-purple-600 dark:text-purple-400 animate-[pulse_5s_ease-in-out_infinite_1s]"
                  />
                </svg>
              </div>

              {/* LEVL Logo */}
              <div className="relative z-10 h-7 w-7 transform transition-transform duration-300 group-hover:scale-110">
                <LevlLogo className="h-full w-full drop-shadow-md" />
              </div>
            </div>
          </div>
        </div>
        <div className="ml-4">
          <h3 className="font-bold text-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
            LEVL Service Matchmaker
          </h3>
          <div className="flex items-center text-xs font-medium">
            <span className="flex h-2.5 w-2.5 relative mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-green-600 dark:text-green-400">Active now</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-white/20 dark:hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
          onClick={() => setShowPreferences(!showPreferences)}
        >
          <Sliders className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-white/20 dark:hover:bg-gray-800/50 transition-colors backdrop-blur-sm"
          onClick={resetConversation}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </Button>
      </div>
    </div>
  )
}
