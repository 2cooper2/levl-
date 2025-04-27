"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { Award, CheckCircle, Star, Trophy, TrendingUp, Clock, Calendar, Target } from "lucide-react"
import confetti from "canvas-confetti"

interface Milestone {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate?: string
  progress: number
  category: "skill" | "project" | "certification"
  reward?: {
    type: "badge" | "points" | "certificate"
    value: string | number
  }
}

export function MilestoneComponent() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // In a real app, this would fetch from an API
    const demoMilestones: Milestone[] = [
      {
        id: "1",
        title: "Complete Intro to Web Development",
        description: "Finish all modules of the introductory web development course",
        completed: true,
        progress: 100,
        category: "skill",
        dueDate: "2023-04-15",
        reward: {
          type: "badge",
          value: "Web Foundations",
        },
      },
      {
        id: "2",
        title: "Build First Client Project",
        description: "Complete your first paid project for a real client",
        completed: false,
        progress: 75,
        category: "project",
        dueDate: "2023-05-20",
        reward: {
          type: "points",
          value: 500,
        },
      },
      {
        id: "3",
        title: "JavaScript Advanced Concepts",
        description: "Master closures, promises, and async/await patterns",
        completed: false,
        progress: 60,
        category: "skill",
        dueDate: "2023-06-10",
        reward: {
          type: "badge",
          value: "JS Ninja",
        },
      },
      {
        id: "4",
        title: "React Certification",
        description: "Pass the official React developer certification exam",
        completed: false,
        progress: 30,
        category: "certification",
        dueDate: "2023-07-30",
        reward: {
          type: "certificate",
          value: "React Developer",
        },
      },
      {
        id: "5",
        title: "Portfolio Website",
        description: "Create a professional portfolio showcasing your work",
        completed: false,
        progress: 45,
        category: "project",
        dueDate: "2023-06-25",
        reward: {
          type: "points",
          value: 300,
        },
      },
    ]

    setMilestones(demoMilestones)
  }, [])

  const completeMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((milestone) => (milestone.id === id ? { ...milestone, completed: true, progress: 100 } : milestone)),
    )

    // Trigger confetti animation
    setShowConfetti(true)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })

    setTimeout(() => setShowConfetti(false), 2000)
  }

  const filteredMilestones = activeTab === "all" ? milestones : milestones.filter((m) => m.category === activeTab)

  const completedCount = milestones.filter((m) => m.completed).length
  const totalProgress = milestones.length
    ? Math.round(milestones.reduce((acc, m) => acc + m.progress, 0) / milestones.length)
    : 0

  const upcomingMilestones = [...milestones]
    .filter((m) => !m.completed && m.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Your Skill Journey</h2>
          <p className="text-muted-foreground">Track your progress and unlock achievements</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-muted p-2 rounded-md flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-medium">
              {completedCount}/{milestones.length} Completed
            </span>
          </div>

          <Button variant="outline" className="gap-2">
            <Target className="h-4 w-4" />
            Set New Goal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1 md:col-span-2">
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Overall Progress</span>
                <span className="text-sm font-medium">{totalProgress}%</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>

            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="skill">Skills</TabsTrigger>
                <TabsTrigger value="project">Projects</TabsTrigger>
                <TabsTrigger value="certification">Certifications</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <AnimatePresence>
                  <div className="space-y-4">
                    {filteredMilestones.map((milestone) => (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card
                          className={`overflow-hidden transition-all ${milestone.completed ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {milestone.completed ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    getCategoryIcon(milestone.category)
                                  )}
                                  <h3 className="font-semibold">{milestone.title}</h3>
                                  <Badge
                                    variant={milestone.completed ? "outline" : "secondary"}
                                    className="ml-auto md:ml-2"
                                  >
                                    {getCategoryLabel(milestone.category)}
                                  </Badge>
                                </div>

                                <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  {milestone.dueDate && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>Due: {formatDate(milestone.dueDate)}</span>
                                    </div>
                                  )}

                                  {milestone.reward && (
                                    <div className="flex items-center gap-1">
                                      {milestone.reward.type === "badge" && (
                                        <Award className="h-3 w-3 text-yellow-500" />
                                      )}
                                      {milestone.reward.type === "points" && (
                                        <TrendingUp className="h-3 w-3 text-blue-500" />
                                      )}
                                      {milestone.reward.type === "certificate" && (
                                        <Trophy className="h-3 w-3 text-purple-500" />
                                      )}
                                      <span>
                                        Reward:{" "}
                                        {typeof milestone.reward.value === "number"
                                          ? `${milestone.reward.value} points`
                                          : milestone.reward.value}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col md:items-end gap-2 min-w-[120px]">
                                {!milestone.completed ? (
                                  <>
                                    <div className="w-full flex items-center gap-2">
                                      <Progress value={milestone.progress} className="h-2 flex-1" />
                                      <span className="text-xs font-medium">{milestone.progress}%</span>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => completeMilestone(milestone.id)}
                                      disabled={milestone.progress < 100}
                                    >
                                      {milestone.progress === 100 ? "Complete" : "In Progress"}
                                    </Button>
                                  </>
                                ) : (
                                  <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="h-5 w-5" />
                                    <span className="font-medium">Completed</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Upcoming Milestones
            </h3>

            <div className="space-y-4">
              {upcomingMilestones.length > 0 ? (
                upcomingMilestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    {getCategoryIcon(milestone.category, "h-5 w-5")}
                    <div>
                      <h4 className="font-medium text-sm">{milestone.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {formatDate(milestone.dueDate!)}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {milestone.progress}%
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming milestones</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                Recent Achievements
              </h3>

              <div className="flex flex-wrap gap-2">
                {milestones
                  .filter((m) => m.completed && m.reward?.type === "badge")
                  .slice(0, 3)
                  .map((milestone) => (
                    <div key={milestone.id} className="flex items-center gap-2 bg-muted p-2 rounded-md">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{milestone.reward?.value}</span>
                    </div>
                  ))}

                {milestones.filter((m) => m.completed && m.reward?.type === "badge").length === 0 && (
                  <p className="text-sm text-muted-foreground">Complete milestones to earn badges</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getCategoryIcon(category: string, className = "h-4 w-4") {
  switch (category) {
    case "skill":
      return <Star className={`${className} text-blue-500`} />
    case "project":
      return <Target className={`${className} text-purple-500`} />
    case "certification":
      return <Award className={`${className} text-yellow-500`} />
    default:
      return <CheckCircle className={className} />
  }
}

function getCategoryLabel(category: string) {
  switch (category) {
    case "skill":
      return "Skill"
    case "project":
      return "Project"
    case "certification":
      return "Certification"
    default:
      return category
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}
