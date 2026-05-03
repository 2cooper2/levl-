"use client"

import * as React from "react"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSend?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, onSend, ...props }, ref) => {
  return (
    <div className="relative w-full flex items-center">
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-full border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 px-3 py-2 pr-14 text-sm shadow-[0_15px_25px_-12px_rgba(0,0,0,0.25),0_8px_10px_-6px_rgba(0,0,0,0.1)] dark:shadow-[0_15px_25px_-12px_rgba(0,0,0,0.5),0_8px_10px_-6px_rgba(0,0,0,0.4)] !transform-none !transition-none !duration-0 !animate-none !motion-reduce file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
      <div
        className="absolute right-1 flex items-center justify-center h-8 w-8 rounded-full cursor-pointer overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 25% 30%, rgba(250,240,255,0.45) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(190,175,240,0.4) 0%, transparent 55%), radial-gradient(ellipse at 60% 50%, rgba(225,215,255,0.35) 0%, transparent 60%), linear-gradient(135deg, #ede8ff 0%, #d4ccff 100%)",
        }}
        onClick={onSend}
      >
        <Send className="h-4 w-4 text-white relative z-10" />
      </div>
    </div>
  )
})

Input.displayName = "Input"

export { Input }
