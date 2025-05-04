import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormErrorProps {
  message?: string
  className?: string
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md bg-red-50 p-2.5 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400",
        className,
      )}
    >
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )
}
