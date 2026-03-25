"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Star, Calendar } from "lucide-react"
import { motion } from "framer-motion"

export function StatsCards() {
  const stats = [
    {
      title: "Total Earnings",
      value: "$1,234.56",
      description: "This month",
      icon: DollarSign,
      change: "+12.5%",
      trend: "up",
    },
    {
      title: "Active Clients",
      value: "24",
      description: "Last 30 days",
      icon: Users,
      change: "+3",
      trend: "up",
    },
    {
      title: "Average Rating",
      value: "4.8",
      description: "From 56 reviews",
      icon: Star,
      change: "+0.2",
      trend: "up",
    },
    {
      title: "Upcoming Bookings",
      value: "12",
      description: "Next 7 days",
      icon: Calendar,
      change: "+5",
      trend: "up",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 p-1.5 text-primary">
                <stat.icon className="h-full w-full" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stat.description}
                <span className={`text-xs font-medium ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {stat.change}
                </span>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
