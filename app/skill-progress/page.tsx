export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProgressDashboard } from "@/components/skill-tracking/progress-dashboard"
import { createServerDatabaseClient } from "@/lib/database"

export default async function SkillProgressPage() {
  const supabase = createServerDatabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile to determine role
  const { data: userProfile } = await supabase.from("users").select("role").eq("id", user?.id).single()

  // Redirect clients away from this page
  if (!userProfile || userProfile.role !== "provider") {
    redirect("/dashboard")
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Skill Progress" text="Track and improve your professional skills." />
      <div className="grid gap-8">
        <ProgressDashboard />
      </div>
    </DashboardShell>
  )
}
