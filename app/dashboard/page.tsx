"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { ServicesList } from "@/components/dashboard/services-list"
import { BookingsList } from "@/components/dashboard/bookings-list"
import { MessagesList } from "@/components/dashboard/messages-list"
import { EnhancedDashboardHeader } from "@/components/dashboard/enhanced-dashboard-header"
import { TransactionHistory } from "@/components/dashboard/transaction-history"
import { SkillProgressWidget } from "@/components/dashboard/skill-progress-widget"
import { RecommendationWidget } from "@/components/dashboard/recommendation-widget"
// Remove imports for deleted components
// import { SkillChallenges } from "@/components/community/skill-challenges"
// import { AssessmentTool } from "@/components/skill-assessment/assessment-tool"
// import { CollaborationHub } from "@/components/collaboration/collaboration-hub"
// import { MarketplaceAnalytics } from "@/components/provider/marketplace-analytics"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <EnhancedDashboardHeader heading="Dashboard" text="Manage your services, bookings, and messages." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCards />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RecentActivity className="col-span-4" />
        <ServicesList className="col-span-3" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <BookingsList className="col-span-4" />
        <MessagesList className="col-span-3" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TransactionHistory />
        <SkillProgressWidget />
      </div>
      <div className="grid gap-4 md:grid-cols-1">
        <RecommendationWidget />
      </div>
      {/* Remove references to deleted components */}
      {/* <div className="grid gap-4 md:grid-cols-2">
        <SkillChallenges />
        <AssessmentTool />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <CollaborationHub />
        <MarketplaceAnalytics />
      </div> */}
    </DashboardShell>
  )
}
