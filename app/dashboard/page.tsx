"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { ServicesList } from "@/components/dashboard/services-list"
import { MessagesList } from "@/components/dashboard/messages-list"
import { BookingsList } from "@/components/dashboard/bookings-list"
import { ArrowRight, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { DynamicPricingAssistant } from "@/components/dashboard/dynamic-pricing-assistant"

export default function DashboardPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Dashboard"
        text="Manage your services, bookings, and messages."
        actions={
          <Button className="gap-1 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
            <Plus className="h-4 w-4" /> New Service
          </Button>
        }
      />
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">My Services</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <StatsCards />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent activity across the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>
            <div className="col-span-3 flex flex-col gap-4">
              <DynamicPricingAssistant />
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Bookings</CardTitle>
                  <CardDescription>Your scheduled bookings for the next 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingsList limit={5} />
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/dashboard/bookings">
                      View all bookings
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="services" className="space-y-4">
          <div className="flex justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">My Services</h2>
              <p className="text-muted-foreground">Manage and update your service listings.</p>
            </div>
            <Button className="gap-1 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
              <Plus className="h-4 w-4" /> New Service
            </Button>
          </div>
          <ServicesList />
        </TabsContent>
        <TabsContent value="bookings" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
            <p className="text-muted-foreground">Manage your upcoming and past bookings.</p>
          </div>
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              <BookingsList status="upcoming" />
            </TabsContent>
            <TabsContent value="pending">
              <BookingsList status="pending" />
            </TabsContent>
            <TabsContent value="completed">
              <BookingsList status="completed" />
            </TabsContent>
          </Tabs>
        </TabsContent>
        <TabsContent value="messages" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
            <p className="text-muted-foreground">Communicate with your clients and service providers.</p>
          </div>
          <MessagesList />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
