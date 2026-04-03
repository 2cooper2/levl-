"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/enhanced-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/ui/date-range-picker"

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  })
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)

        // This would be replaced with a real API call in production
        // For now, let's simulate data
        setTimeout(() => {
          const simulatedData = {
            users: {
              total: 1250,
              newToday: 42,
              activeToday: 385,
              growth: 12.5,
            },
            services: {
              total: 450,
              listed: 425,
              categories: {
                "Home Improvement": 120,
                Technology: 95,
                "Personal Services": 110,
                Professional: 68,
                Other: 57,
              },
            },
            bookings: {
              total: 875,
              pending: 45,
              completed: 720,
              cancelled: 110,
              revenue: 87500,
            },
            performance: {
              averageResponseTime: 245, // ms
              serverErrors: 12,
              pageLoadTime: 1.2, // seconds
            },
            topProviders: [
              { id: 1, name: "Tech Solutions Inc.", bookings: 45, revenue: 12000, rating: 4.8 },
              { id: 2, name: "Home Repair Experts", bookings: 38, revenue: 9500, rating: 4.7 },
              { id: 3, name: "Professional Photography", bookings: 32, revenue: 8000, rating: 4.9 },
              { id: 4, name: "Interior Design Studio", bookings: 29, revenue: 14500, rating: 4.6 },
              { id: 5, name: "Web Development Agency", bookings: 27, revenue: 13500, rating: 4.5 },
            ],
            topServices: [
              { id: 1, name: "Website Development", bookings: 56, revenue: 28000 },
              { id: 2, name: "Home Painting", bookings: 48, revenue: 14400 },
              { id: 3, name: "TV Mounting", bookings: 42, revenue: 6300 },
              { id: 4, name: "Professional Photoshoot", bookings: 39, revenue: 11700 },
              { id: 5, name: "Smart Home Setup", bookings: 35, revenue: 10500 },
            ],
            dailyStats: Array.from({ length: 30 }, (_, i) => {
              const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
              return {
                date: date.toISOString().split("T")[0],
                users: Math.floor(Math.random() * 40) + 20,
                bookings: Math.floor(Math.random() * 20) + 10,
                revenue: Math.floor(Math.random() * 2000) + 1000,
              }
            }),
          }

          setAnalyticsData(simulatedData)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange])

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p>No analytics data available.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <DateRangePicker value={dateRange} onValueChange={setDateRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.users.total}</div>
            <p className="text-xs text-green-500 flex items-center mt-1">
              <span className="mr-1">↑</span> {analyticsData.users.growth}% growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.users.activeToday}</div>
            <p className="text-xs text-gray-500 mt-1">{analyticsData.users.newToday} new today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.bookings.total}</div>
            <p className="text-xs text-gray-500 mt-1">{analyticsData.bookings.completed} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(analyticsData.bookings.revenue / 1000).toFixed(1)}k</div>
            <p className="text-xs text-gray-500 mt-1">From {analyticsData.bookings.completed} completed bookings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Average Response Time</h3>
                <p className="text-xl">{analyticsData.performance.averageResponseTime} ms</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Server Errors (30d)</h3>
                <p className="text-xl">{analyticsData.performance.serverErrors}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Avg. Page Load Time</h3>
                <p className="text-xl">{analyticsData.performance.pageLoadTime} sec</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Uptime</h3>
                <p className="text-xl">99.98%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analyticsData.services.categories).map(([category, count]) => (
                <div key={category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                      className="bg-lavender-600 h-2.5 rounded-full"
                      style={{ width: `${((count as number) / analyticsData.services.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <Tabs defaultValue="topProviders">
          <TabsList className="mb-4">
            <TabsTrigger value="topProviders">Top Providers</TabsTrigger>
            <TabsTrigger value="topServices">Top Services</TabsTrigger>
          </TabsList>

          <TabsContent value="topProviders">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Providers</CardTitle>
                <CardDescription>Based on bookings and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Provider</th>
                        <th className="text-center py-3 px-4">Bookings</th>
                        <th className="text-center py-3 px-4">Revenue</th>
                        <th className="text-center py-3 px-4">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.topProviders.map((provider) => (
                        <tr key={provider.id} className="border-b">
                          <td className="py-3 px-4">{provider.name}</td>
                          <td className="text-center py-3 px-4">{provider.bookings}</td>
                          <td className="text-center py-3 px-4">${provider.revenue}</td>
                          <td className="text-center py-3 px-4">{provider.rating}/5.0</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topServices">
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Services</CardTitle>
                <CardDescription>Based on number of bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Service</th>
                        <th className="text-center py-3 px-4">Bookings</th>
                        <th className="text-center py-3 px-4">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.topServices.map((service) => (
                        <tr key={service.id} className="border-b">
                          <td className="py-3 px-4">{service.name}</td>
                          <td className="text-center py-3 px-4">{service.bookings}</td>
                          <td className="text-center py-3 px-4">${service.revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
