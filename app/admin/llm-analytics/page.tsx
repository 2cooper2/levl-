"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getLLMUsageMetrics, getLLMFeedbackStats } from "@/services/llm-analytics-service"
import type { LLMUsageMetrics, LLMFeedbackStats } from "@/services/llm-analytics-service"

export default function LLMAnalyticsDashboard() {
  const [usageMetrics, setUsageMetrics] = useState<LLMUsageMetrics | null>(null)
  const [feedbackStats, setFeedbackStats] = useState<LLMFeedbackStats | null>(null)
  const [timeRange, setTimeRange] = useState<string>("7d")
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Calculate date range based on selected time range
        const endDate = new Date()
        const startDate = new Date()

        switch (timeRange) {
          case "24h":
            startDate.setDate(startDate.getDate() - 1)
            break
          case "7d":
            startDate.setDate(startDate.getDate() - 7)
            break
          case "30d":
            startDate.setDate(startDate.getDate() - 30)
            break
          case "90d":
            startDate.setDate(startDate.getDate() - 90)
            break
          default:
            startDate.setDate(startDate.getDate() - 7)
        }

        // Fetch metrics and stats
        const metrics = await getLLMUsageMetrics(startDate, endDate)
        const stats = await getLLMFeedbackStats()

        setUsageMetrics(metrics)
        setFeedbackStats(stats)
      } catch (error) {
        console.error("Error fetching LLM analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [timeRange])

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">LLM Analytics Dashboard</h1>

        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="usage">
        <TabsList className="mb-6">
          <TabsTrigger value="usage">Usage Metrics</TabsTrigger>
          <TabsTrigger value="feedback">Feedback Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="usage">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : usageMetrics ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Requests</CardTitle>
                  <CardDescription>Number of LLM API calls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{usageMetrics.totalRequests}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Tokens</CardTitle>
                  <CardDescription>Total tokens consumed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{usageMetrics.totalTokens.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avg. Tokens per Request</CardTitle>
                  <CardDescription>Average token usage per request</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {Math.round(usageMetrics.averageTokensPerRequest).toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Requests by Model</CardTitle>
                  <CardDescription>Distribution of requests across models</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(usageMetrics.requestsByModel).map(([model, count]) => (
                      <div key={model} className="flex justify-between items-center">
                        <div className="font-medium">{model}</div>
                        <div className="flex items-center">
                          <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-indigo-600 h-2.5 rounded-full"
                              style={{
                                width: `${(count / usageMetrics.totalRequests) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span>{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Token Usage by Model</CardTitle>
                  <CardDescription>Token consumption by model</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(usageMetrics.tokensByModel).map(([model, tokens]) => (
                      <div key={model} className="flex justify-between">
                        <span>{model}</span>
                        <span className="font-medium">{tokens.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Requests Over Time</CardTitle>
                  <CardDescription>Daily request volume</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {/* In a real implementation, you would use a chart library here */}
                  <div className="h-full flex items-end justify-between">
                    {usageMetrics.requestsOverTime.map((day) => (
                      <div key={day.date} className="flex flex-col items-center">
                        <div
                          className="w-10 bg-indigo-600 rounded-t"
                          style={{
                            height: `${(day.count / Math.max(...usageMetrics.requestsOverTime.map((d) => d.count))) * 200}px`,
                          }}
                        ></div>
                        <div className="text-xs mt-2 rotate-45 origin-left">
                          {new Date(day.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p>No usage data available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="feedback">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : feedbackStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Average Rating</CardTitle>
                  <CardDescription>User satisfaction with LLM responses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-4xl font-bold mr-2">{feedbackStats.averageRating.toFixed(1)}</div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-6 h-6 ${
                            star <= Math.round(feedbackStats.averageRating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Based on {feedbackStats.totalFeedback} ratings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                  <CardDescription>Breakdown of user ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center">
                        <div className="w-4 mr-2">{rating}</div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                          <div
                            className={`h-2.5 rounded-full ${
                              rating > 3 ? "bg-green-600" : rating === 3 ? "bg-yellow-400" : "bg-red-600"
                            }`}
                            style={{
                              width: `${
                                (feedbackStats.ratingDistribution[rating] / feedbackStats.totalFeedback) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="w-10 text-right">{feedbackStats.ratingDistribution[rating] || 0}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p>No feedback data available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
