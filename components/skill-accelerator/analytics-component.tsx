"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Download, Share2, Calendar, Activity, Target, Clock, Users, DollarSign, Award } from "lucide-react"

// Sample data for charts
const timeInvestmentData = [
  { name: "Learning", hours: 25 },
  { name: "Client Work", hours: 40 },
  { name: "Networking", hours: 10 },
  { name: "Admin", hours: 5 },
]

export function AnalyticsComponent() {
  const [timeRange, setTimeRange] = useState("6m")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleExport = () => {
    // In a real app, this would generate and download a report
    alert("Analytics report exported!")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Skill Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track your progress, earnings, and growth opportunities</p>
        </div>

        <div className="flex items-center gap-2">
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Skill Growth"
          value="+45%"
          description="vs. last period"
          trend="up"
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={isLoading}
        />

        <StatCard
          title="Earnings"
          value="$2,450"
          description="this period"
          trend="up"
          icon={<DollarSign className="h-4 w-4" />}
          isLoading={isLoading}
        />

        <StatCard
          title="Learning Hours"
          value="80"
          description="this period"
          trend="down"
          icon={<Clock className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>

      <Tabs defaultValue="progress">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="progress">
            <Activity className="h-4 w-4 mr-2" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="earnings">
            <DollarSign className="h-4 w-4 mr-2" />
            Earnings
          </TabsTrigger>
          <TabsTrigger value="skills">
            <Target className="h-4 w-4 mr-2" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="time">
            <Clock className="h-4 w-4 mr-2" />
            Time
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Learning Activity</CardTitle>
                <Badge variant="outline" className="ml-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  {timeRange === "1m"
                    ? "Last Month"
                    : timeRange === "3m"
                      ? "Last 3 Months"
                      : timeRange === "6m"
                        ? "Last 6 Months"
                        : "Last Year"}
                </Badge>
              </div>
              <CardDescription>Your learning activity and engagement metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <InsightCard
                  title="Growth Rate"
                  value="+15%"
                  description="Month-over-month growth"
                  trend="up"
                  isLoading={isLoading}
                />
                <InsightCard
                  title="Skill Gap"
                  value="-5%"
                  description="vs. top performers"
                  trend="down"
                  isLoading={isLoading}
                />
                <InsightCard
                  title="Projected Level"
                  value="Advanced"
                  description="in 3 months"
                  trend="neutral"
                  isLoading={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Your recent accomplishments and certifications</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3">
                      <div className="rounded-full bg-muted h-8 w-8"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                      <Award className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <h4 className="font-medium">Web Development Certification</h4>
                      <p className="text-sm text-muted-foreground">Completed 2 weeks ago</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Advanced
                    </Badge>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                      <Users className="h-5 w-5 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                      <h4 className="font-medium">10 Client Projects Completed</h4>
                      <p className="text-sm text-muted-foreground">Milestone reached</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Milestone
                    </Badge>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                      <Target className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div>
                      <h4 className="font-medium">UI/UX Design Fundamentals</h4>
                      <p className="text-sm text-muted-foreground">Completed 1 month ago</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Intermediate
                    </Badge>
                  </div>

                  <Button variant="outline" className="w-full mt-2">
                    View All Achievements
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Earnings Overview</CardTitle>
                <Badge variant="outline" className="ml-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  {timeRange === "1m"
                    ? "Last Month"
                    : timeRange === "3m"
                      ? "Last 3 Months"
                      : timeRange === "6m"
                        ? "Last 6 Months"
                        : "Last Year"}
                </Badge>
              </div>
              <CardDescription>Summary of your earnings and financial metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Earnings data visualization has been removed as requested.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  You can still access your earnings information in the profile section.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InsightCard
                  title="Total Earnings"
                  value="$2,450"
                  description="this period"
                  trend="up"
                  isLoading={isLoading}
                />
                <InsightCard
                  title="Growth Rate"
                  value="+12%"
                  description="vs previous period"
                  trend="up"
                  isLoading={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Skills Breakdown</CardTitle>
              <CardDescription>Distribution of your skills across different domains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {/* Placeholder for Skills Breakdown Chart */}
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Skills breakdown chart will be implemented here.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Time Investment</CardTitle>
              <CardDescription>How you're spending your time on different activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {/* Placeholder for Time Investment Chart */}
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Time investment chart will be implemented here.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  description: string
  trend: "up" | "down" | "neutral"
  icon: React.ReactNode
  isLoading: boolean
}

function StatCard({ title, value, description, trend, icon, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse bg-muted rounded-md h-5 w-24 mb-1"></div>
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {isLoading ? (
          <div className="animate-pulse bg-muted rounded-md h-3 w-16"></div>
        ) : (
          <p className="text-xs text-muted-foreground">
            <span className={trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : ""}>
              {trend === "up" ? "▲" : trend === "down" ? "▼" : ""}
            </span>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface InsightCardProps {
  title: string
  value: string
  description: string
  trend: "up" | "down" | "neutral"
  isLoading: boolean
}

function InsightCard({ title, value, description, trend, isLoading }: InsightCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse bg-muted rounded-md h-5 w-24 mb-1"></div>
        ) : (
          <div className="text-lg font-bold">{value}</div>
        )}
        {isLoading ? (
          <div className="animate-pulse bg-muted rounded-md h-3 w-16"></div>
        ) : (
          <p className="text-xs text-muted-foreground">
            <span className={trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : ""}>
              {trend === "up" ? "▲" : trend === "down" ? "▼" : ""}
            </span>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
