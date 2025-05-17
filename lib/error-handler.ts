type ErrorLogLevel = "error" | "warning" | "info"

interface ErrorLogOptions {
  level?: ErrorLogLevel
  context?: string
  userId?: string
  additionalData?: Record<string, any>
  shouldReport?: boolean
}

// Queue of errors to be sent to the server
const errorQueue: Array<{
  error: Error | string
  options: ErrorLogOptions
  timestamp: number
}> = []

// Flag to prevent infinite loops if the error logger itself errors
let isProcessingErrors = false

/**
 * Log client-side errors and optionally report them to the server
 */
export function logError(error: Error | string, options: ErrorLogOptions = {}) {
  const { level = "error", context = "client", shouldReport = true, ...rest } = options

  // Default console logging
  const errorObj = error instanceof Error ? error : new Error(error)
  console[level](errorObj, { context, ...rest })

  // If we're already processing errors or shouldn't report, stop here
  if (isProcessingErrors || !shouldReport) return

  // Add to queue for reporting
  errorQueue.push({
    error: errorObj,
    options: { level, context, ...rest },
    timestamp: Date.now(),
  })

  // Schedule processing if this is the first error
  if (errorQueue.length === 1) {
    setTimeout(processErrorQueue, 1000)
  }
}

// Process queued errors
async function processErrorQueue() {
  if (isProcessingErrors || errorQueue.length === 0) return

  isProcessingErrors = true

  try {
    // Take up to 10 errors at a time
    const batch = errorQueue.splice(0, 10)

    const logs = batch.map(({ error, options, timestamp }) => ({
      level: options.level || "error",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      data: {
        ...options.additionalData,
        userId: options.userId,
      },
      timestamp: new Date(timestamp).toISOString(),
      context: options.context || "client",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    }))

    // Only send logs if we're in a browser environment
    if (typeof window !== "undefined") {
      try {
        // Report errors to the server
        await fetch("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logs }),
        })
      } catch (reportError) {
        // If reporting fails, just log to console
        console.error("Failed to report errors:", reportError)
      }
    }
  } catch (e) {
    console.error("Error processing error queue:", e)
  } finally {
    isProcessingErrors = false

    // If there are more errors, process them after a delay
    if (errorQueue.length > 0) {
      setTimeout(processErrorQueue, 1000)
    }
  }
}

// Set up global error handler for uncaught exceptions
export function setupGlobalErrorHandler() {
  if (typeof window === "undefined") return

  // Capture uncaught exceptions
  window.addEventListener("error", (event) => {
    logError(event.error || event.message, {
      context: "window.onerror",
      additionalData: {
        fileName: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
      },
    })
  })

  // Capture unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))

    logError(error, {
      context: "unhandledrejection",
    })
  })
}
