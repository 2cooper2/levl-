"use client"
import { CircleAlert, ShieldAlert, Wifi, WifiOff } from "lucide-react"

export function ConnectionErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-white rounded-lg shadow-sm border border-red-100">
      <WifiOff className="w-12 h-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Connection Error</h3>
      <p className="text-gray-500 text-center mb-4">
        We're having trouble connecting to our services. Please check your internet connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
      >
        Retry
      </button>
    </div>
  )
}

export function AuthErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-white rounded-lg shadow-sm border border-red-100">
      <ShieldAlert className="w-12 h-12 text-amber-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
      <p className="text-gray-500 text-center mb-4">
        You need to be signed in to access this content. Please sign in and try again.
      </p>
      <button
        onClick={() => (window.location.href = "/auth/login")}
        className="px-4 py-2 bg-lavender-600 text-white rounded-md hover:bg-lavender-700 transition-colors"
      >
        Sign In
      </button>
    </div>
  )
}

export function DataLoadingErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-white rounded-lg shadow-sm border border-amber-100">
      <CircleAlert className="w-12 h-12 text-amber-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Data Loading Error</h3>
      <p className="text-gray-500 text-center mb-4">
        We couldn't load the data for this section. This may be temporary or there might be a problem with your account.
      </p>
      <div className="flex space-x-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
        >
          Retry
        </button>
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}

export function ServiceUnavailableFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-white rounded-lg shadow-sm border border-blue-100">
      <Wifi className="w-12 h-12 text-blue-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Service Unavailable</h3>
      <p className="text-gray-500 text-center mb-4">
        This service is temporarily unavailable. Our team has been notified and is working to restore it as soon as
        possible.
      </p>
      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Go Back
      </button>
    </div>
  )
}
