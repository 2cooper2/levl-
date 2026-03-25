"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/enhanced-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle } from "lucide-react"

interface ChecklistItem {
  id: string
  category: string
  title: string
  description: string
  completed: boolean
  automated?: boolean
  autoStatus?: "pass" | "fail" | "pending"
  criticalForLaunch: boolean
}

export default function LaunchChecklist() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "security-1",
      category: "Security",
      title: "Authentication System",
      description: "Verify that the authentication system works properly for all user types.",
      completed: true,
      automated: true,
      autoStatus: "pass",
      criticalForLaunch: true,
    },
    {
      id: "security-2",
      category: "Security",
      title: "Authorization Checks",
      description: "Ensure that authorization checks are in place for all protected routes.",
      completed: true,
      criticalForLaunch: true,
    },
    {
      id: "security-3",
      category: "Security",
      title: "Data Encryption",
      description: "Confirm that sensitive data is encrypted both in transit and at rest.",
      completed: true,
      automated: true,
      autoStatus: "pass",
      criticalForLaunch: true,
    },
    {
      id: "payments-1",
      category: "Payments",
      title: "Payment Processing",
      description: "Test the complete payment flow with test cards.",
      completed: true,
      criticalForLaunch: true,
    },
    {
      id: "payments-2",
      category: "Payments",
      title: "Refund Process",
      description: "Verify that refunds can be processed correctly.",
      completed: true,
      criticalForLaunch: true,
    },
    {
      id: "payments-3",
      category: "Payments",
      title: "Stripe Webhook Setup",
      description: "Ensure Stripe webhooks are properly configured for payment events.",
      completed: true,
      criticalForLaunch: true,
    },
    {
      id: "legal-1",
      category: "Legal",
      title: "Terms of Service",
      description: "Ensure the Terms of Service is up-to-date and accessible.",
      completed: true,
      criticalForLaunch: true,
    },
    {
      id: "legal-2",
      category: "Legal",
      title: "Privacy Policy",
      description: "Verify that the Privacy Policy complies with relevant regulations.",
      completed: true,
      criticalForLaunch: true,
    },
    {
      id: "seo-1",
      category: "SEO & Analytics",
      title: "Meta Tags",
      description: "Confirm that all pages have appropriate meta tags for SEO.",
      completed: true,
      criticalForLaunch: false,
    },
    {
      id: "seo-2",
      category: "SEO & Analytics",
      title: "Analytics Integration",
      description: "Verify that analytics tracking is working correctly.",
      completed: true,
      criticalForLaunch: false,
    },
    {
      id: "perf-1",
      category: "Performance",
      title: "Page Speed",
      description: "Ensure that all pages load within acceptable time limits.",
      completed: true,
      automated: true,
      autoStatus: "pass",
      criticalForLaunch: true,
    },
    {
      id: "perf-2",
      category: "Performance",
      title: "Mobile Responsiveness",
      description: "Verify that the site works well on all device sizes.",
      completed: true,
      criticalForLaunch: true,
    },
    {
      id: "backup-1",
      category: "Backup & Recovery",
      title: "Database Backups",
      description: "Confirm that automated database backups are configured.",
      completed: true,
      criticalForLaunch: true,
    },
    {
      id: "backup-2",
      category: "Backup & Recovery",
      title: "Recovery Process",
      description: "Test the recovery process from backups.",
      completed: true,
      criticalForLaunch: true,
    },
    {
      id: "content-1",
      category: "Content",
      title: "Content Review",
      description: "Review all content for accuracy and consistency.",
      completed: true,
      criticalForLaunch: false,
    },
    {
      id: "access-1",
      category: "Accessibility",
      title: "WCAG Compliance",
      description: "Ensure the site meets WCAG 2.1 AA standards.",
      completed: true,
      automated: true,
      autoStatus: "pass",
      criticalForLaunch: false,
    },
    {
      id: "testing-1",
      category: "Testing",
      title: "Cross-browser Testing",
      description: "Verify functionality across all major browsers.",
      completed: true,
      criticalForLaunch: true,
    },
    {
      id: "testing-2",
      category: "Testing",
      title: "User Flow Testing",
      description: "Test all critical user flows end-to-end.",
      completed: true,
      criticalForLaunch: true,
    },
    {
      id: "email-1",
      category: "Communication",
      title: "Email Templates",
      description: "Verify all transactional email templates.",
      completed: true,
      criticalForLaunch: true,
    },
    {
      id: "monitoring-1",
      category: "Monitoring",
      title: "Error Monitoring",
      description: "Set up error monitoring and alerting.",
      completed: true,
      criticalForLaunch: true,
    },
  ])

  const toggleItemCompletion = (id: string) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const categorizedItems = checklist.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, ChecklistItem[]>,
  )

  const completedCount = checklist.filter((item) => item.completed).length
  const totalCount = checklist.length
  const completionPercentage = Math.round((completedCount / totalCount) * 100)

  const criticalItemsComplete = checklist.filter((item) => item.criticalForLaunch).every((item) => item.completed)

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Launch Readiness Checklist</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track and verify all items required for a successful launch
          </p>
        </div>

        <div className="flex gap-4">
          <Button variant={criticalItemsComplete ? "default" : "outline"}>
            {criticalItemsComplete ? "✓ Ready for Launch" : "Not Ready for Launch"}
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between mb-1">
              <span>Overall completion: {completionPercentage}%</span>
              <span>
                {completedCount}/{totalCount} tasks completed
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {Object.entries(categorizedItems).map(([category, items]) => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{category}</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <Card
                key={item.id}
                className={item.completed ? "border-green-200" : item.criticalForLaunch ? "border-amber-200" : ""}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-none pt-1">
                      {item.automated ? (
                        <div className="w-6 h-6">
                          {item.autoStatus === "pass" ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : item.autoStatus === "fail" ? (
                            <XCircle className="h-6 w-6 text-red-500" />
                          ) : (
                            <div className="h-6 w-6 rounded-full border-2 border-gray-300 animate-pulse" />
                          )}
                        </div>
                      ) : (
                        <Checkbox
                          id={item.id}
                          checked={item.completed}
                          onCheckedChange={() => toggleItemCompletion(item.id)}
                        />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <label htmlFor={item.id} className="font-medium cursor-pointer flex items-center">
                        {item.title}
                        {item.criticalForLaunch && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 rounded">
                            Critical
                          </span>
                        )}
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
