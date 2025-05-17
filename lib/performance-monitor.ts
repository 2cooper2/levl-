export interface PerformanceMetric {
  name: string
  value: number
  unit: string
}

class PerformanceMonitor {
  private metrics: Record<string, PerformanceMetric> = {}
  private marks: Record<string, number> = {}

  constructor() {
    if (typeof window !== "undefined") {
      try {
        this.captureNavigationTiming()
        this.setupPageLoadListeners()
      } catch (error) {
        console.error("Error initializing performance monitor:", error)
      }
    }
  }

  private captureNavigationTiming() {
    window.addEventListener("load", () => {
      setTimeout(() => {
        try {
          const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming

          if (navEntry) {
            this.recordMetric("timeToFirstByte", {
              name: "Time to First Byte",
              value: navEntry.responseStart - navEntry.requestStart,
              unit: "ms",
            })

            this.recordMetric("domLoad", {
              name: "DOM Content Loaded",
              value: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              unit: "ms",
            })

            this.recordMetric("pageLoad", {
              name: "Page Load Time",
              value: navEntry.loadEventEnd - navEntry.startTime,
              unit: "ms",
            })
          }
        } catch (error) {
          console.error("Error capturing navigation timing:", error)
        }
      }, 0)
    })
  }

  private setupPageLoadListeners() {
    // Capture LCP (Largest Contentful Paint)
    try {
      if ("PerformanceObserver" in window) {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          if (lastEntry) {
            this.recordMetric("lcp", {
              name: "Largest Contentful Paint",
              value: lastEntry.startTime,
              unit: "ms",
            })
          }
        })
        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true })
      }
    } catch (e) {
      console.error("LCP observation not supported", e)
    }

    // Capture FID (First Input Delay)
    try {
      if ("PerformanceObserver" in window) {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          entries.forEach((entry) => {
            if (entry.name === "first-input") {
              this.recordMetric("fid", {
                name: "First Input Delay",
                value: (entry as PerformanceEventTiming).processingStart - entry.startTime,
                unit: "ms",
              })
            }
          })
        })
        fidObserver.observe({ type: "first-input", buffered: true })
      }
    } catch (e) {
      console.error("FID observation not supported", e)
    }

    // Capture CLS (Cumulative Layout Shift)
    try {
      if ("PerformanceObserver" in window) {
        let clsValue = 0
        const clsEntries: PerformanceEntry[] = []
        let sessionValue = 0
        let sessionEntries: PerformanceEntry[] = []

        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries() as PerformanceEntry[]

          entries.forEach((entry) => {
            // Only count layout shifts without recent user input
            if (!(entry as any).hadRecentInput) {
              const value = (entry as any).value
              clsValue += value
              clsEntries.push(entry)

              // Start a new session if the entry's timestamp is more than 1 second after
              // the previous entry, or if it's the first entry
              const currentTime = entry.startTime
              const lastEntryTime = sessionEntries.length > 0 ? sessionEntries[sessionEntries.length - 1].startTime : 0

              if (sessionEntries.length === 0 || currentTime - lastEntryTime > 1000) {
                sessionValue = value
                sessionEntries = [entry]
              } else {
                sessionValue += value
                sessionEntries.push(entry)
              }

              // Record the maximum session value
              this.recordMetric("cls", {
                name: "Cumulative Layout Shift",
                value: sessionValue,
                unit: "",
              })
            }
          })
        })
        clsObserver.observe({ type: "layout-shift", buffered: true })
      }
    } catch (e) {
      console.error("CLS observation not supported", e)
    }
  }

  // Start timing for a custom metric
  startTiming(name: string): void {
    try {
      this.marks[name] = performance.now()
    } catch (error) {
      console.error(`Error starting timing for ${name}:`, error)
    }
  }

  // End timing and record the metric
  endTiming(name: string, displayName?: string): void {
    try {
      if (this.marks[name]) {
        const duration = performance.now() - this.marks[name]
        this.recordMetric(name, {
          name: displayName || name,
          value: duration,
          unit: "ms",
        })
        delete this.marks[name]
      }
    } catch (error) {
      console.error(`Error ending timing for ${name}:`, error)
    }
  }

  // Record a custom metric
  recordMetric(id: string, metric: PerformanceMetric): void {
    try {
      this.metrics[id] = metric

      // Optionally send to analytics or monitoring service
      if (process.env.NODE_ENV === "production") {
        this.reportMetricToAnalytics(id, metric)
      }
    } catch (error) {
      console.error(`Error recording metric ${id}:`, error)
    }
  }

  private reportMetricToAnalytics(id: string, metric: PerformanceMetric): void {
    // This would connect to your analytics service
    // Example: sending to a custom endpoint
    try {
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          metricId: id,
          name: metric.name,
          value: metric.value,
          unit: metric.unit,
          url: window.location.href,
          timestamp: Date.now(),
        })

        navigator.sendBeacon("/api/performance-metrics", data)
      }
    } catch (error) {
      console.error("Error reporting metric to analytics:", error)
    }
  }

  // Get all recorded metrics
  getMetrics(): Record<string, PerformanceMetric> {
    return this.metrics
  }

  // Get a specific metric
  getMetric(id: string): PerformanceMetric | undefined {
    return this.metrics[id]
  }
}

// Export a singleton instance
export const performanceMonitor = typeof window !== "undefined" ? new PerformanceMonitor() : null

// Helper function to measure component render time
export function useComponentPerformance(componentName: string) {
  if (performanceMonitor) {
    try {
      performanceMonitor.startTiming(`render_${componentName}`)
      return () => performanceMonitor.endTiming(`render_${componentName}`, `Render time for ${componentName}`)
    } catch (error) {
      console.error(`Error in useComponentPerformance for ${componentName}:`, error)
      return () => {}
    }
  }
  return () => {}
}
