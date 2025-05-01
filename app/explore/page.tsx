import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { AnimatedGradientBackground } from "@/components/animated-gradient-background"

export const dynamic = "force-dynamic"

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedGradientBackground />
      <EnhancedMainNav />
      <main className="container py-16">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            Coming Soon
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            We're working on an exciting new way to explore services. Check back soon for our enhanced exploration
            experience.
          </p>
        </div>
      </main>
    </div>
  )
}
