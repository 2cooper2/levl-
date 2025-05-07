import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { AnimatedGradientBackground } from "@/components/animated-gradient-background"
import ExploreClient from "./explore-client"

export const dynamic = "force-dynamic"

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedGradientBackground />
      <EnhancedMainNav />
      <main className="container py-8 relative z-10">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
          Explore Services
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mb-8">
          Discover talented professionals and services to help you reach your goals.
        </p>
        <ExploreClient />
      </main>
    </div>
  )
}
