"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import {
  Award,
  CheckCircle,
  Star,
  Trophy,
  TrendingUp,
  Clock,
  Calendar,
  Target,
  ArrowRight,
  Sparkles,
} from "lucide-react"
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
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE", "#EDE9FE"],
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
    <div className="space-y-8 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-950 p-6 rounded-2xl">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Your Skill Journey
          </h2>
          <p className="text-muted-foreground">Track your progress and unlock achievements</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-card flex items-center gap-2 px-4 py-2 rounded-xl shadow-md border border-purple-200 dark:border-purple-800">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full p-1.5">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium">
              {completedCount}/{milestones.length} Completed
            </span>
          </div>

          <Button
            variant="outline"
            className="gap-2 bg-white/50 backdrop-blur-sm dark:bg-black/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl"
          >
            <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Set New Goal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 border-0 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 dark:from-purple-500/10 dark:to-indigo-500/10 rounded-xl"></div>
          <CardContent className="relative pt-6 z-10">
            <div className="mb-8">
              <div className="flex justify-between mb-2 items-center">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Overall Progress</span>
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-2.5 py-1 rounded-full text-white text-xs font-medium">
                  {totalProgress}%
                </div>
              </div>
              <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-1000 ease-in-out"
                  style={{ width: `${totalProgress}%` }}
                ></div>
              </div>
            </div>

            <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
              <div className="overflow-x-auto pb-2">
                <TabsList className="bg-purple-100/50 dark:bg-purple-900/20 p-1 rounded-xl mb-6 w-full grid grid-cols-4">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-md rounded-lg transition-all duration-200"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="skill"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-md rounded-lg transition-all duration-200"
                  >
                    <Star className="h-3.5 w-3.5 mr-1.5" />
                    Skills
                  </TabsTrigger>
                  <TabsTrigger
                    value="project"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-md rounded-lg transition-all duration-200"
                  >
                    <Target className="h-3.5 w-3.5 mr-1.5" />
                    Projects
                  </TabsTrigger>
                  <TabsTrigger
                    value="certification"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-md rounded-lg transition-all duration-200"
                  >
                    <Award className="h-3.5 w-3.5 mr-1.5" />
                    Certs
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="mt-0 space-y-4">
                <AnimatePresence>
                  {filteredMilestones.map((milestone) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3 }}
                      className="group"
                    >
                      <Card
                        className={`overflow-hidden border transition-all bg-white dark:bg-gray-900/50 hover:shadow-md ${
                          milestone.completed ? "border-l-4 border-l-green-500" : "border-l-4 border-l-purple-500"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className={`rounded-full p-1.5 ${
                                    milestone.completed
                                      ? "bg-green-100 dark:bg-green-900/30"
                                      : milestone.category === "skill"
                                        ? "bg-blue-100 dark:bg-blue-900/30"
                                        : milestone.category === "project"
                                          ? "bg-purple-100 dark:bg-purple-900/30"
                                          : "bg-yellow-100 dark:bg-yellow-900/30"
                                  }`}
                                >
                                  {milestone.completed ? (
                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  ) : (
                                    getCategoryIcon(milestone.category, "h-4 w-4")
                                  )}
                                </div>
                                <h3 className="font-semibold text-gray-800 dark:text-gray-200">{milestone.title}</h3>
                                <Badge
                                  variant={milestone.completed ? "outline" : "secondary"}
                                  className={`ml-auto md:ml-2 ${
                                    milestone.category === "skill"
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200"
                                      : milestone.category === "project"
                                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200"
                                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200"
                                  }`}
                                >
                                  {getCategoryLabel(milestone.category)}
                                </Badge>
                              </div>

                              <p className="text-sm text-gray-600 dark:text-gray-400">{milestone.description}</p>

                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                {milestone.dueDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Due: {formatDate(milestone.dueDate)}</span>
                                  </div>
                                )}

                                {milestone.reward && (
                                  <div className="flex items-center gap-1">
                                    {milestone.reward.type === "badge" && <Award className="h-3 w-3 text-yellow-500" />}
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
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-1">
                                      <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500 ease-in-out"
                                        style={{ width: `${milestone.progress}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-xs font-medium">{milestone.progress}%</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => completeMilestone(milestone.id)}
                                    disabled={milestone.progress < 100}
                                    className={`transition-all duration-300 ${
                                      milestone.progress === 100
                                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                                        : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                    }`}
                                  >
                                    {milestone.progress === 100 ? (
                                      <span className="flex items-center">
                                        Complete
                                        <Sparkles className="h-3.5 w-3.5 ml-1.5 text-yellow-300" />
                                      </span>
                                    ) : (
                                      "In Progress"
                                    )}
                                  </Button>
                                </>
                              ) : (
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="font-medium">Completed</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 dark:from-purple-500/10 dark:to-indigo-500/10 rounded-xl"></div>
          <CardContent className="relative pt-6 z-10">
            <h3 className="font-semibold mb-5 flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Upcoming Milestones
            </h3>

            <div className="space-y-4">
              {upcomingMilestones.length > 0 ? (
                upcomingMilestones.map((milestone) => (
                  <motion.div
                    key={milestone.id}
                    className="flex items-start gap-3 pb-3 border-b last:border-0 group"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div
                      className={`rounded-full p-1.5 ${
                        milestone.category === "skill"
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : milestone.category === "project"
                            ? "bg-purple-100 dark:bg-purple-900/30"
                            : "bg-yellow-100 dark:bg-yellow-900/30"
                      }`}
                    >
                      {getCategoryIcon(milestone.category, "h-4 w-4")}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                        {milestone.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {formatDate(milestone.dueDate!)}</span>
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                      {milestone.progress}%
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming milestones</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
                <Award className="h-4 w-4 text-yellow-500" />
                Recent Achievements
              </h3>

              <div className="flex flex-wrap gap-2">
                {milestones
                  .filter((m) => m.completed && m.reward?.type === "badge")
                  .slice(0, 3)
                  .map((milestone) => (
                    <motion.div
                      key={milestone.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 border border-purple-200 dark:border-purple-800"
                      whileHover={{ y: -5, scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {milestone.reward?.value}
                      </span>
                    </motion.div>
                  ))}

                {milestones.filter((m) => m.completed && m.reward?.type === "badge").length === 0 && (
                  <motion.div
                    className="w-full flex flex-col items-center gap-2 px-4 py-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-dashed border-purple-200 dark:border-purple-800"
                    whileHover={{ y: -2 }}
                  >
                    <Award className="h-8 w-8 text-purple-300 dark:text-purple-700" />
                    <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                      Complete milestones to earn badges
                    </p>
                  </motion.div>
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
      return <Star className={`${className} text-blue-600 dark:text-blue-400`} />
    case "project":
      return <Target className={`${className} text-purple-600 dark:text-purple-400`} />
    case "certification":
      return <Award className={`${className} text-yellow-600 dark:text-yellow-400`} />
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
