"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, Zap, Calendar } from "lucide-react"
import { LevlLogo } from "@/components/levl-logo"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { ServicesList } from "@/components/dashboard/services-list"

// Lightweight background
function SimpleLevlBackground() {
  return <div className="fixed inset-0 -z-10 bg-gradient-to-b from-purple-500/10 to-background" />
}

// Skeleton loaders for a smoother experience
function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ServicesListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex justify-between items-center mt-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function RecentActivitySkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  return (
    <>
      <SimpleLevlBackground />

      <div className="container mx-auto py-6 px-4 md:px-6 relative z-10">
        {/* Simple header - loads immediately */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10">
              <LevlLogo className="h-full w-full" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary">Your Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back to your Levl workspace</p>
            </div>
          </div>

          <Button className="group" size="sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade to Pro
          </Button>
        </div>

        {/* Stats cards - with fallback */}
        <div className="mb-6">
          <React.Suspense fallback={<StatsCardsSkeleton />}>
            <StatsCards />
          </React.Suspense>
        </div>

        {/* Main content - with fallback */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <DashboardHeader
              heading="Your Services"
              text="Manage and track your service offerings"
              actions={
                <Button size="sm">
                  <Zap className="mr-2 h-4 w-4" />
                  New Service
                </Button>
              }
            />
            <div className="mt-4">
              <React.Suspense fallback={<ServicesListSkeleton />}>
                <ServicesList />
              </React.Suspense>
            </div>
          </div>

          <div className="space-y-6">
            {/* Upcoming calendar - static for fast loading */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">Upcoming</CardTitle>
                  </div>
                  <Badge variant="outline">This Week</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {[
                    { time: "Today, 2:00 PM", title: "Client Meeting", client: "Sarah Chen" },
                    { time: "Tomorrow, 10:00 AM", title: "Project Review", client: "Alex Morgan" },
                    { time: "Friday, 3:30 PM", title: "Delivery Call", client: "James Wilson" },
                  ].map((event, i) => (
                    <div key={i} className="p-3">
                      <p className="text-xs text-primary font-medium">{event.time}</p>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-muted-foreground">with {event.client}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Growth insights - static for fast loading */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Growth Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Profile Views</span>
                    <div className="flex items-center">
                      <span className="font-medium">248</span>
                      <span className="text-xs text-green-500 ml-1">+12%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "65%" }}></div>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm">Conversion Rate</span>
                    <div className="flex items-center">
                      <span className="font-medium">5.2%</span>
                      <span className="text-xs text-green-500 ml-1">+0.8%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "42%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pro upgrade card - static for fast loading */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Upgrade to Pro</h3>
                    <p className="text-sm text-muted-foreground">Unlock premium features</p>
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent activity - with fallback */}
        <div>
          <DashboardHeader heading="Recent Activity" text="Stay updated with your latest interactions" />
          <div className="mt-4">
            <React.Suspense fallback={<RecentActivitySkeleton />}>
              <RecentActivity />
            </React.Suspense>
          </div>
        </div>
      </div>
    </>
  )
}
