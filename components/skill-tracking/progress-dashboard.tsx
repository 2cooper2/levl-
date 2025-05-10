"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart2,
  LineChartIcon,
  Award,
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle2,
  BookOpen,
  Target,
  ArrowUpRight,
  ChevronRight,
  Zap,
} from "lucide-react"

interface SkillProgressProps {
  userId: string
}

interface Skill {
  id: string
  name: string
  category: string
  level: number
  progress: number
  lastActivity: string
  trend: "up" | "down" | "stable"
  milestones: {
    id: string
    title: string
    completed: boolean
    date?: string
  }[]
  history: {
    date: string
    level: number
  }[]
  nextMilestone?: {
    title: string
    description: string
    estimatedCompletion: string
  }
  relatedSkills: string[]
}

export function SkillProgressDashboard({ userId }: SkillProgressProps) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSkill, setActiveSkill] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")

  useEffect(() => {
    const fetchSkillProgress = async () => {
      setLoading(true)
      try {
        // In a real app, you would fetch from an API
        // const response = await fetch(`/api/skill-progress?userId=${userId}&timeRange=${timeRange}`)
        // const data = await response.json()

        // Mock data for demonstration
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockSkills: Skill[] = [
          {
            id: "skill1",
            name: "Web Development",
            category: "Programming",
            level: 7,
            progress: 72,
            lastActivity: "2 days ago",
            trend: "up",
            milestones: [
              { id: "m1", title: "Complete HTML/CSS Basics", completed: true, date: "2023-01-15" },
              { id: "m2", title: "Master JavaScript Fundamentals", completed: true, date: "2023-03-10" },
              { id: "m3", title: "Build First React Application", completed: true, date: "2023-05-22" },
              { id: "m4", title: "Develop Full-Stack Project", completed: false },
              { id: "m5", title: "Deploy to Production", completed: false },
            ],
            history: [
              { date: "Jan", level: 3 },
              { date: "Feb", level: 4 },
              { date: "Mar", level: 4 },
              { date: "Apr", level: 5 },
              { date: "May", level: 6 },
              { date: "Jun", level: 7 },
            ],
            nextMilestone: {
              title: "Develop Full-Stack Project",
              description: "Create a complete application with frontend and backend components",
              estimatedCompletion: "August 2023",
            },
            relatedSkills: ["React", "Node.js", "Database Design"],
          },
          {
            id: "skill2",
            name: "UX/UI Design",
            category: "Design",
            level: 5,
            progress: 48,
            lastActivity: "1 week ago",
            trend: "stable",
            milestones: [
              { id: "m1", title: "Learn Design Principles", completed: true, date: "2023-02-05" },
              { id: "m2", title: "Master Figma Basics", completed: true, date: "2023-04-12" },
              { id: "m3", title: "Create First Prototype", completed: false },
              { id: "m4", title: "Conduct User Testing", completed: false },
              { id: "m5", title: "Build Design System", completed: false },
            ],
            history: [
              { date: "Jan", level: 2 },
              { date: "Feb", level: 3 },
              { date: "Mar", level: 3 },
              { date: "Apr", level: 4 },
              { date: "May", level: 5 },
              { date: "Jun", level: 5 },
            ],
            nextMilestone: {
              title: "Create First Prototype",
              description: "Design and build an interactive prototype for a mobile application",
              estimatedCompletion: "July 2023",
            },
            relatedSkills: ["Wireframing", "User Research", "Visual Design"],
          },
          {
            id: "skill3",
            name: "Data Analysis",
            category: "Data Science",
            level: 4,
            progress: 35,
            lastActivity: "3 days ago",
            trend: "up",
            milestones: [
              { id: "m1", title: "Learn Excel Advanced Features", completed: true, date: "2023-03-18" },
              { id: "m2", title: "Master SQL Basics", completed: true, date: "2023-05-02" },
              { id: "m3", title: "Analyze First Dataset", completed: false },
              { id: "m4", title: "Create Data Visualizations", completed: false },
              { id: "m5", title: "Build Predictive Model", completed: false },
            ],
            history: [
              { date: "Jan", level: 1 },
              { date: "Feb", level: 2 },
              { date: "Mar", level: 2 },
              { date: "Apr", level: 3 },
              { date: "May", level: 3 },
              { date: "Jun", level: 4 },
            ],
            nextMilestone: {
              title: "Analyze First Dataset",
              description: "Perform comprehensive analysis on a real-world dataset",
              estimatedCompletion: "July 2023",
            },
            relatedSkills: ["SQL", "Statistics", "Data Visualization"],
          },
        ]

        setSkills(mockSkills)
        if (!activeSkill && mockSkills.length > 0) {
          setActiveSkill(mockSkills[0].id)
        }
      } catch (error) {
        console.error("Error fetching skill progress:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSkillProgress()
  }, [userId, timeRange, activeSkill])

  const selectedSkill = skills.find((skill) => skill.id === activeSkill)

  const renderSkillLevel = (level: number) => {
    const levels = [
      "Novice",
      "Beginner",
      "Intermediate",
      "Competent",
      "Proficient",
      "Advanced",
      "Expert",
      "Master",
      "Authority",
      "Thought Leader",
    ]
    return levels[level - 1] || "Unknown"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Skill Progress Dashboard</h2>
          <p className="text-muted-foreground">Track your skill development and growth over time</p>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <BarChart2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl md:col-span-2" />
          <Skeleton className="h-[250px] rounded-xl md:col-span-3" />
        </div>
      ) : skills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Skill Selection Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Your Skills</CardTitle>
              <CardDescription>Select a skill to view detailed progress</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {skills.map((skill) => (
                  <button
                    key={skill.id}
                    onClick={() => setActiveSkill(skill.id)}
                    className={`w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors ${
                      activeSkill === skill.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-10 rounded-full ${
                          skill.trend === "up"
                            ? "bg-green-500"
                            : skill.trend === "down"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                        }`}
                      />
                      <div>
                        <div className="font-medium">{skill.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <span>Level {skill.level}</span>
                          <span>•</span>
                          <span>{renderSkillLevel(skill.level)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${
                          skill.trend === "up"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : skill.trend === "down"
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-yellow-200 bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {skill.trend === "up" ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : skill.trend === "down" ? (
                          <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                        ) : (
                          <TrendingUp className="h-3 w-3 mr-1 rotate-90" />
                        )}
                        {skill.trend === "up" ? "Growing" : skill.trend === "down" ? "Declining" : "Stable"}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skill Detail Panel */}
          {selectedSkill && (
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {selectedSkill.name}
                    <Badge variant="outline" className="ml-2">
                      {selectedSkill.category}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Level {selectedSkill.level} • {renderSkillLevel(selectedSkill.level)}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Last activity</div>
                  <div className="font-medium">{selectedSkill.lastActivity}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to next level</span>
                    <span className="font-medium">{selectedSkill.progress}%</span>
                  </div>
                  <Progress value={selectedSkill.progress} className="h-2" />
                </div>

                {/* Skill Growth Chart */}
                <div className="h-[200px] mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedSkill.history}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip
                        formatter={(value) => [`Level ${value}`, "Skill Level"]}
                        labelFormatter={(label) => `${label} ${new Date().getFullYear()}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="level"
                        stroke="#8884d8"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Next Milestone */}
                {selectedSkill.nextMilestone && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Next Milestone: {selectedSkill.nextMilestone.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{selectedSkill.nextMilestone.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Estimated completion: {selectedSkill.nextMilestone.estimatedCompletion}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Milestones Panel */}
          {selectedSkill && (
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-primary" />
                  Skill Milestones
                </CardTitle>
                <CardDescription>Track your progress through key skill development milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-muted" />

                  <div className="space-y-6">
                    {selectedSkill.milestones.map((milestone, index) => (
                      <div key={milestone.id} className="relative pl-10">
                        {/* Timeline dot */}
                        <div
                          className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${
                            milestone.completed
                              ? "bg-green-100 text-green-700 border-2 border-green-500"
                              : "bg-muted text-muted-foreground border-2 border-muted-foreground"
                          }`}
                        >
                          {milestone.completed ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-medium">{index + 1}</span>
                          )}
                        </div>

                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className={`p-4 rounded-lg ${
                            milestone.completed ? "bg-green-50 border border-green-100" : "bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{milestone.title}</h4>
                            {milestone.completed ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
                            ) : (
                              <Badge variant="outline">In Progress</Badge>
                            )}
                          </div>
                          {milestone.date && (
                            <div className="flex items-center text-sm text-muted-foreground mt-2">
                              <Calendar className="h-4 w-4 mr-1" />
                              {milestone.completed ? "Completed on" : "Target completion"}: {milestone.date}
                            </div>
                          )}
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Skills */}
          {selectedSkill && (
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Related Skills
                </CardTitle>
                <CardDescription>
                  Skills that complement and enhance your {selectedSkill.name} abilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedSkill.relatedSkills.map((skill, index) => (
                    <Card key={index} className="bg-muted/30">
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{skill}</h4>
                          <p className="text-sm text-muted-foreground">Complementary skill</p>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Recommendations */}
          {selectedSkill && (
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary" />
                  Recommended Learning Resources
                </CardTitle>
                <CardDescription>
                  Curated resources to help you advance your {selectedSkill.name} skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      title: "Advanced Techniques Masterclass",
                      type: "Course",
                      provider: "Levl Academy",
                      duration: "8 hours",
                      level: "Intermediate to Advanced",
                    },
                    {
                      title: "Practical Projects Workshop",
                      type: "Workshop",
                      provider: "Skill Accelerator",
                      duration: "Weekend intensive",
                      level: "All levels",
                    },
                    {
                      title: "Industry Expert Mentoring",
                      type: "Mentorship",
                      provider: "Professional Network",
                      duration: "3 months",
                      level: "Advanced",
                    },
                  ].map((resource, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="h-2 bg-primary" />
                      <CardContent className="p-4 pt-5">
                        <Badge className="mb-2">{resource.type}</Badge>
                        <h4 className="font-semibold">{resource.title}</h4>
                        <div className="text-sm text-muted-foreground mt-1">
                          <div>Provider: {resource.provider}</div>
                          <div>Duration: {resource.duration}</div>
                          <div>Level: {resource.level}</div>
                        </div>
                        <Button className="w-full mt-3" size="sm">
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center py-10 bg-muted rounded-lg">
          <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No skills tracked yet</h3>
          <p className="text-muted-foreground">Start tracking your skills to see your progress over time</p>
          <Button className="mt-4">Add Your First Skill</Button>
        </div>
      )}
    </div>
  )
}

// Add the missing export that's required for deployment
export const ProgressDashboard = SkillProgressDashboard
