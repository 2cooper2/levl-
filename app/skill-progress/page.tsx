"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { MilestoneComponent } from "@/components/skill-accelerator/milestone-component"
import { AnalyticsComponent } from "@/components/skill-accelerator/analytics-component"
import ForumComponent from "@/components/skill-accelerator/forum-component"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, BookOpen, Briefcase, MessageSquare, TrendingUp } from "lucide-react"

export default function SkillProgressPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Skill Accelerator</h1>
          <p className="text-muted-foreground">
            Track your progress, connect with mentors, and accelerate your skill development
          </p>
        </div>

        <div className="flex flex-col space-y-6">
          <div className="overflow-x-auto pb-2">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="inline-flex h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="overview"
                  className="inline-flex items-center justify-center rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground ring-offset-background transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="learning"
                  className="inline-flex items-center justify-center rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground ring-offset-background transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Learning
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="inline-flex items-center justify-center rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground ring-offset-background transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Projects
                </TabsTrigger>
                <TabsTrigger
                  value="forum"
                  className="inline-flex items-center justify-center rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground ring-offset-background transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Forum
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="inline-flex items-center justify-center rounded-none border-b-2 border-b-transparent bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground ring-offset-background transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-6">
                <MilestoneComponent />
              </TabsContent>
              <TabsContent value="learning" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Learning Resources</h2>
                    <p className="text-muted-foreground mb-6">
                      Access curated learning resources to accelerate your skill development
                    </p>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {/* Learning resources would go here */}
                      <div className="p-6 border rounded-lg">
                        <h3 className="font-medium mb-2">Web Development Fundamentals</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Learn the core concepts of modern web development
                        </p>
                        <Button variant="outline" size="sm">
                          Start Learning
                        </Button>
                      </div>
                      <div className="p-6 border rounded-lg">
                        <h3 className="font-medium mb-2">JavaScript Mastery</h3>
                        <p className="text-sm text-muted-foreground mb-4">Advanced JavaScript concepts and patterns</p>
                        <Button variant="outline" size="sm">
                          Start Learning
                        </Button>
                      </div>
                      <div className="p-6 border rounded-lg">
                        <h3 className="font-medium mb-2">UI/UX Design Principles</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Create beautiful and functional user interfaces
                        </p>
                        <Button variant="outline" size="sm">
                          Start Learning
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="projects" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Your Projects</h2>
                    <p className="text-muted-foreground mb-6">
                      Track your project progress and showcase your portfolio
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Projects would go here */}
                      <div className="p-6 border rounded-lg">
                        <h3 className="font-medium mb-2">Personal Portfolio Website</h3>
                        <p className="text-sm text-muted-foreground mb-4">Progress: 75% complete</p>
                        <Button variant="outline" size="sm">
                          Continue Project
                        </Button>
                      </div>
                      <div className="p-6 border rounded-lg">
                        <h3 className="font-medium mb-2">E-commerce App</h3>
                        <p className="text-sm text-muted-foreground mb-4">Progress: 40% complete</p>
                        <Button variant="outline" size="sm">
                          Continue Project
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="forum" className="mt-6">
                <ForumComponent />
              </TabsContent>
              <TabsContent value="analytics" className="mt-6">
                <AnalyticsComponent />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
