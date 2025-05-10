"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Award, TrendingUp } from "lucide-react"

// Renamed from SkillProgressDashboard to ProgressDashboard to match the expected export
export function ProgressDashboard({ userId }: { userId: string }) {
  const [skills, setSkills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSkill, setActiveSkill] = useState<string | null>(null)

  useEffect(() => {
    const fetchSkillProgress = async () => {
      setLoading(true)
      try {
        // Mock data for demonstration
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockSkills = [
          {
            id: "skill1",
            name: "Web Development",
            category: "Programming",
            level: 7,
            progress: 72,
            lastActivity: "2 days ago",
            trend: "up",
            history: [
              { date: "Jan", level: 3 },
              { date: "Feb", level: 4 },
              { date: "Mar", level: 4 },
              { date: "Apr", level: 5 },
              { date: "May", level: 6 },
              { date: "Jun", level: 7 },
            ],
          },
          {
            id: "skill2",
            name: "UX/UI Design",
            category: "Design",
            level: 5,
            progress: 48,
            lastActivity: "1 week ago",
            trend: "stable",
            history: [
              { date: "Jan", level: 2 },
              { date: "Feb", level: 3 },
              { date: "Mar", level: 3 },
              { date: "Apr", level: 4 },
              { date: "May", level: 5 },
              { date: "Jun", level: 5 },
            ],
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
  }, [userId, activeSkill])

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

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-[300px] bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Skill Progress Dashboard</h2>
        <p className="text-muted-foreground">Track your skill development and growth over time</p>
      </div>

      {skills.length > 0 ? (
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
                        <div className="text-sm text-muted-foreground">
                          <span>Level {skill.level}</span>
                          <span> • </span>
                          <span>{renderSkillLevel(skill.level)}</span>
                        </div>
                      </div>
                    </div>
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
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skill Detail Panel */}
          {selectedSkill && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedSkill.name}
                  <Badge variant="outline" className="ml-2">
                    {selectedSkill.category}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Level {selectedSkill.level} • {renderSkillLevel(selectedSkill.level)}
                </CardDescription>
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
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center py-10 bg-muted rounded-lg">
          <Award className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No skills tracked yet</h3>
          <p className="text-muted-foreground">Start tracking your skills to see your progress over time</p>
          <Button className="mt-4">Add Your First Skill</Button>
        </div>
      )}
    </div>
  )
}

// Also export the original component name for backward compatibility
export const SkillProgressDashboard = ProgressDashboard
