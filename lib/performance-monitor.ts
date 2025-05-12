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
      this.captureNavigationTiming()
      this.setupPageLoadListeners()
    }
  }

  private captureNavigationTiming() {
    window.addEventListener("load", () => {
      setTimeout(() => {
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
      }, 0)
    })
  }

  private setupPageLoadListeners() {
    // Capture LCP (Largest Contentful Paint)
    let lcpObserver: PerformanceObserver
    try {
      lcpObserver = new PerformanceObserver((entryList) => {
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
    } catch (e) {
      console.error("LCP observation not supported", e)
    }

    // Capture FID (First Input Delay)
    let fidObserver: PerformanceObserver
    try {
      fidObserver = new PerformanceObserver((entryList) => {
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
    } catch (e) {
      console.error("FID observation not supported", e)
    }

    // Capture CLS (Cumulative Layout Shift)
    let clsValue = 0
    const clsEntries: PerformanceEntry[] = []
    let sessionValue = 0
    let sessionEntries: PerformanceEntry[] = []

    let clsObserver: PerformanceObserver
    try {
      clsObserver = new PerformanceObserver((entryList) => {
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
    } catch (e) {
      console.error("CLS observation not supported", e)
    }
  }

  // Start timing for a custom metric
  startTiming(name: string): void {
    this.marks[name] = performance.now()
  }

  // End timing and record the metric
  endTiming(name: string, displayName?: string): void {
    if (this.marks[name]) {
      const duration = performance.now() - this.marks[name]
      this.recordMetric(name, {
        name: displayName || name,
        value: duration,
        unit: "ms",
      })
      delete this.marks[name]
    }
  }

  // Record a custom metric
  recordMetric(id: string, metric: PerformanceMetric): void {
    this.metrics[id] = metric

    // Optionally send to analytics or monitoring service
    if (process.env.NODE_ENV === "production") {
      this.reportMetricToAnalytics(id, metric)
    }
  }

  private reportMetricToAnalytics(id: string, metric: PerformanceMetric): void {
    // This would connect to your analytics service
    // Example: sending to a custom endpoint
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
    performanceMonitor.startTiming(`render_${componentName}`)
    return () => performanceMonitor.endTiming(`render_${componentName}`, `Render time for ${componentName}`)
  }
  return () => {}
}
