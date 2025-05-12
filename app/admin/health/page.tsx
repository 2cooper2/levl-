"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/enhanced-card"
import { Button } from "@/components/ui/button"

interface HealthCheck {
  status: string
  timestamp: string
  uptime: number
  version: string
  checks: Record<string, { status: "ok" | "error"; message?: string; time?: number }>
  responseTime: number
}

export default function HealthDashboard() {
  const [healthData, setHealthData] = useState<HealthCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshInterval, setRefreshInterval] = useState<number | null>(30000) // 30 seconds

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/health")

      if (!response.ok) {
        throw new Error(`Health check failed with status: ${response.status}`)
      }

      const data = await response.json()
      setHealthData(data)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthData()

    // Set up automatic refresh
    let intervalId: NodeJS.Timeout | null = null

    if (refreshInterval) {
      intervalId = setInterval(fetchHealthData, refreshInterval)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [refreshInterval])

  const toggleRefresh = () => {
    setRefreshInterval(refreshInterval ? null : 30000)
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System Health</h1>
        <div className="flex gap-4">
          <Button onClick={fetchHealthData} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh Now"}
          </Button>
          <Button variant="outline" onClick={toggleRefresh}>
            {refreshInterval ? "Disable Auto-refresh" : "Enable Auto-refresh"}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-300 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </CardContent>
        </Card>
      )}

      {healthData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card
              className={
                healthData.status === "healthy"
                  ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                  : "border-red-300 bg-red-50 dark:bg-red-900/20"
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthData.status === "healthy" ? "Healthy" : "Unhealthy"}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Last checked: {new Date(healthData.timestamp).toLocaleTimeString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor(healthData.uptime / 3600)}h {Math.floor((healthData.uptime % 3600) / 60)}m
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Since last restart</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthData.responseTime}ms</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Health check duration</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Version</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthData.version}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current application version</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>System Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(healthData.checks).map(([name, check]) => (
                  <Card key={name} className={check.status === "ok" ? "border-green-200" : "border-red-200"}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            check.status === "ok" ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span>{check.status === "ok" ? "Operational" : "Error"}</span>
                      </div>
                      {check.time && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Response time: {check.time}ms</p>
                      )}
                      {check.message && <p className="text-xs mt-1 overflow-hidden text-ellipsis">{check.message}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!healthData && !error && (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading health data...</div>
        </div>
      )}
    </div>
  )
}
