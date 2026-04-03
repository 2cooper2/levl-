import { NextResponse } from "next/server"
import { createServerDatabaseClient } from "@/lib/database"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")
  const timeRange = url.searchParams.get("timeRange") || "month"

  try {
    const supabase = createServerDatabaseClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Get the current user if userId not provided
    let currentUserId = userId
    if (!currentUserId) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error("Auth error:", authError)
        return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
      }

      if (user) {
        currentUserId = user.id
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
    }

    // Get user skills
    const { data: skills, error: skillsError } = await supabase
      .from("user_skills")
      .select(
        `
        id,
        skill_id,
        level,
        progress,
        last_activity_at,
        created_at,
        updated_at,
        skills (
          id,
          name,
          category
        )
      `,
      )
      .eq("user_id", currentUserId)

    if (skillsError) {
      console.error("Error fetching skills:", skillsError)
      return NextResponse.json({ error: skillsError.message }, { status: 500 })
    }

    // Get skill milestones
    const { data: milestones, error: milestonesError } = await supabase
      .from("skill_milestones")
      .select(
        `
        id,
        skill_id,
        title,
        description,
        is_completed,
        completed_at,
        target_completion_date
      `,
      )
      .eq("user_id", currentUserId)

    if (milestonesError) {
      console.error("Error fetching milestones:", milestonesError)
      return NextResponse.json({ error: milestonesError.message }, { status: 500 })
    }

    // Get skill progress history
    const { data: history, error: historyError } = await supabase
      .from("skill_progress_history")
      .select(
        `
        id,
        skill_id,
        level,
        progress,
        created_at
      `,
      )
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: true })

    if (historyError) {
      console.error("Error fetching progress history:", historyError)
      return NextResponse.json({ error: historyError.message }, { status: 500 })
    }

    // Process the data to format it for the frontend
    const formattedSkills = skills.map((skill) => {
      // Get milestones for this skill
      const skillMilestones = milestones.filter((m) => m.skill_id === skill.skill_id)

      // Get history for this skill
      const skillHistory = history.filter((h) => h.skill_id === skill.skill_id)

      // Calculate trend based on history
      let trend: "up" | "down" | "stable" = "stable"
      if (skillHistory.length >= 2) {
        const recentEntries = skillHistory.slice(-2)
        if (recentEntries[1].level > recentEntries[0].level) {
          trend = "up"
        } else if (recentEntries[1].level < recentEntries[0].level) {
          trend = "down"
        }
      }

      // Format history data for charts based on time range
      let formattedHistory = []
      if (timeRange === "week") {
        // Last 7 days
        formattedHistory = formatDailyHistory(skillHistory, 7)
      } else if (timeRange === "month") {
        // Last 30 days
        formattedHistory = formatWeeklyHistory(skillHistory, 4)
      } else {
        // Last year
        formattedHistory = formatMonthlyHistory(skillHistory, 12)
      }

      return {
        id: skill.id,
        name: skill.skills.name,
        category: skill.skills.category,
        level: skill.level,
        progress: skill.progress,
        lastActivity: formatLastActivity(skill.last_activity_at),
        trend,
        milestones: skillMilestones.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          completed: m.is_completed,
          date: m.is_completed ? formatDate(m.completed_at) : formatDate(m.target_completion_date),
        })),
        history: formattedHistory,
        nextMilestone: skillMilestones.find((m) => !m.is_completed)
          ? {
              title: skillMilestones.find((m) => !m.is_completed)!.title,
              description: skillMilestones.find((m) => !m.is_completed)!.description,
              estimatedCompletion: formatDate(skillMilestones.find((m) => !m.is_completed)!.target_completion_date),
            }
          : undefined,
      }
    })

    return NextResponse.json({
      skills: formattedSkills,
    })
  } catch (error: any) {
    console.error("Unexpected error in skill progress API:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}

// Helper functions for formatting data
function formatLastActivity(date: string): string {
  const activityDate = new Date(date)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - activityDate.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return "Today"
  } else if (diffDays === 1) {
    return "Yesterday"
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`
  } else {
    const months = Math.floor(diffDays / 30)
    return `${months} ${months === 1 ? "month" : "months"} ago`
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatDailyHistory(history: any[], days: number): any[] {
  const result = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dateStr = date.toLocaleDateString("en-US", { weekday: "short" })

    // Find entries for this day
    const dayEntries = history.filter((entry) => {
      const entryDate = new Date(entry.created_at)
      return (
        entryDate.getDate() === date.getDate() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getFullYear() === date.getFullYear()
      )
    })

    // Use the latest entry for the day, or the previous day's level if no entries
    let level = result.length > 0 ? result[result.length - 1].level : 0
    if (dayEntries.length > 0) {
      level = dayEntries[dayEntries.length - 1].level
    }

    result.push({
      date: dateStr,
      level,
    })
  }

  return result
}

function formatWeeklyHistory(history: any[], weeks: number): any[] {
  const result = []
  const now = new Date()

  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i * 7)
    const weekStr = `Week ${weeks - i}`

    // Find entries for this week
    const weekEntries = history.filter((entry) => {
      const entryDate = new Date(entry.created_at)
      const diffTime = Math.abs(date.getTime() - entryDate.getTime())
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      return diffDays < 7
    })

    // Use the latest entry for the week, or the previous week's level if no entries
    let level = result.length > 0 ? result[result.length - 1].level : 0
    if (weekEntries.length > 0) {
      level = weekEntries[weekEntries.length - 1].level
    }

    result.push({
      date: weekStr,
      level,
    })
  }

  return result
}

function formatMonthlyHistory(history: any[], months: number): any[] {
  const result = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setMonth(date.getMonth() - i)
    const monthStr = date.toLocaleDateString("en-US", { month: "short" })

    // Find entries for this month
    const monthEntries = history.filter((entry) => {
      const entryDate = new Date(entry.created_at)
      return entryDate.getMonth() === date.getMonth() && entryDate.getFullYear() === date.getFullYear()
    })

    // Use the latest entry for the month, or the previous month's level if no entries
    let level = result.length > 0 ? result[result.length - 1].level : 0
    if (monthEntries.length > 0) {
      level = monthEntries[monthEntries.length - 1].level
    }

    result.push({
      date: monthStr,
      level,
    })
  }

  return result
}
