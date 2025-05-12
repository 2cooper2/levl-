type LogLevel = "debug" | "info" | "warn" | "error"

class Logger {
  private context: string
  private minLevel: LogLevel = "info"
  private isBrowser: boolean
  private logBuffer: Array<{ level: LogLevel; message: string; data?: any; timestamp: Date }> = []
  private bufferSize = 100

  constructor(context = "app") {
    this.context = context
    this.isBrowser = typeof window !== "undefined"

    // Set log level from environment
    if (process.env.LOG_LEVEL) {
      this.minLevel = process.env.LOG_LEVEL as LogLevel
    }

    // Flush logs when window is unloaded
    if (this.isBrowser) {
      window.addEventListener("beforeunload", () => {
        this.flushLogs()
      })
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    }

    return levels[level] >= levels[this.minLevel]
  }

  debug(message: string, data?: any): void {
    this.log("debug", message, data)
  }

  info(message: string, data?: any): void {
    this.log("info", message, data)
  }

  warn(message: string, data?: any): void {
    this.log("warn", message, data)
  }

  error(message: string, data?: any): void {
    this.log("error", message, data)
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return

    const timestamp = new Date()
    const formattedMessage = `[${timestamp.toISOString()}] [${level.toUpperCase()}] [${this.context}] ${message}`

    // Log to console
    if (this.isBrowser) {
      switch (level) {
        case "debug":
          console.debug(formattedMessage, data)
          break
        case "info":
          console.info(formattedMessage, data)
          break
        case "warn":
          console.warn(formattedMessage, data)
          break
        case "error":
          console.error(formattedMessage, data)
          break
      }

      // Add to buffer for potential server-side logging
      this.logBuffer.push({
        level,
        message,
        data,
        timestamp,
      })

      // Flush logs if buffer gets too large
      if (this.logBuffer.length >= this.bufferSize) {
        this.flushLogs()
      }
    } else {
      // Server-side logging
      const nodeConsole = console
      switch (level) {
        case "debug":
          nodeConsole.debug(formattedMessage, data)
          break
        case "info":
          nodeConsole.info(formattedMessage, data)
          break
        case "warn":
          nodeConsole.warn(formattedMessage, data)
          break
        case "error":
          nodeConsole.error(formattedMessage, data)
          break
      }
    }
  }

  private flushLogs(): void {
    if (!this.isBrowser || this.logBuffer.length === 0) return

    // Only send error and warn logs to server in production
    if (process.env.NODE_ENV === "production") {
      const logsToSend = this.logBuffer.filter((log) => log.level === "error" || log.level === "warn")

      if (logsToSend.length > 0) {
        this.sendLogsToServer(logsToSend)
      }
    }

    this.logBuffer = []
  }

  private sendLogsToServer(logs: Array<{ level: LogLevel; message: string; data?: any; timestamp: Date }>): void {
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        logs: logs.map((log) => ({
          level: log.level,
          message: log.message,
          data: log.data,
          timestamp: log.timestamp.toISOString(),
          context: this.context,
          userAgent: navigator.userAgent,
          url: window.location.href,
        })),
      })

      navigator.sendBeacon("/api/logs", data)
    } else {
      // Fallback to fetch if sendBeacon is not available
      const data = JSON.stringify({
        logs: logs.map((log) => ({
          level: log.level,
          message: log.message,
          data: log.data,
          timestamp: log.timestamp.toISOString(),
          context: this.context,
          userAgent: navigator.userAgent,
          url: window.location.href,
        })),
      })
      fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: data,
        keepalive: true, // Keep the request alive even if the page is unloaded
      }).catch((err) => {
        // Silent fail, as we can't do much here
        console.error("Failed to send logs to server", err)
      })
    }
  }

  // Create a child logger with a new context
  child(subContext: string): Logger {
    return new Logger(`${this.context}:${subContext}`)
  }
}

// Create a global logger instance
export const logger = new Logger()

// Create domain-specific loggers
export const authLogger = logger.child("auth")
export const apiLogger = logger.child("api")
export const dbLogger = logger.child("database")
export const paymentLogger = logger.child("payment")
