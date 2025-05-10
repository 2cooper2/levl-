import { Skeleton } from "@/components/ui/skeleton"
import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { AnimatedGradientBackground } from "@/components/animated-gradient-background"

export default function AddServiceLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnimatedGradientBackground />
      <EnhancedMainNav />

      <main className="flex-1 container py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <Skeleton className="h-10 w-[300px] mx-auto" />
            <Skeleton className="h-5 w-[400px] mx-auto mt-2" />
          </div>

          {/* Progress Bar Skeleton */}
          <div className="mb-10 relative">
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-between mt-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>

          <div className="bg-card border rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                    {Array(8)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-lg" />
                      ))}
                  </div>
                </div>

                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
