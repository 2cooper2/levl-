import ExploreContent from "./explore-content"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { AnimatedGradientBackground } from "@/components/animated-gradient-background"

export const dynamic = "force-dynamic"

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedGradientBackground />
      <EnhancedMainNav />
      <ExploreContent />
    </div>
  )
}
