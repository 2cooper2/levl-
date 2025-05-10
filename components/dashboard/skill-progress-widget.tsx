"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, ArrowUpRight, Award } from "lucide-react"
import Link from "next/link"

interface Skill {
  id: string
  name: string
  level: number
  progress: number
}

interface SkillProgressWidgetProps {
  userId: string
  limit?: number
}

export function SkillProgressWidget({ userId, limit = 3 }: SkillProgressWidgetProps) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true)
      try {
        // In a real app, you would fetch from an API
        // const response = await fetch(`/api/skill-progress?userId=${userId}&limit=${limit}`)
        // const data = await response.json()

        // Mock data for demonstration
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockSkills: Skill[] = [
          {
            id: "skill1",
            name: "Web Development",
            level: 7,
            progress: 72,
          },
          {
            id: "skill2",
            name: "UX/UI Design",
            level: 5,
            progress: 48,
          },
          {
            id: "skill3",
            name: "Data Analysis",
            level: 4,
            progress: 35,
          },
        ]

        setSkills(mockSkills.slice(0, limit))
      } catch (error) {
        console.error("Error fetching skills:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSkills()
  }, [userId, limit])

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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <BookOpen className="h-4 w-4 mr-2 text-primary" />
          Skill Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full mb-3" />
              </div>
            ))}
          </div>
        ) : skills.length > 0 ? (
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.id}>
                <div className="flex justify-between mb-1">
                  <div className="flex items-center">
                    <span className="font-medium">{skill.name}</span>
                    <div className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-sm">
                      Lvl {skill.level}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{renderSkillLevel(skill.level)}</span>
                </div>
                <div className="space-y-1">
                  <Progress value={skill.progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress to next level</span>
                    <span>{skill.progress}%</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-2 mt-2 border-t text-center">
              <Button variant="link" asChild className="gap-1">
                <Link href="/skill-progress">
                  View Full Skill Dashboard
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Award className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No skills tracked yet</p>
            <Button size="sm" asChild>
              <Link href="/skill-progress">Start Tracking Skills</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
