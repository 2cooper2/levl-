import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">Loading service creator...</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Please wait while we prepare your experience</p>
      </div>
    </div>
  )
}
