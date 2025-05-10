import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProgressDashboard } from "@/components/skill-tracking/progress-dashboard"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database.types"

// Create a server-side only Supabase client
const getServerSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase server credentials")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  })
}

export default async function SkillProgressPage() {
  const supabase = getServerSupabase()

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
