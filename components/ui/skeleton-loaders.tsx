import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface SkeletonProps {
  className?: string
}

export function ServiceCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden animate-pulse-subtle", className)}>
      <div className="aspect-video bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-9 w-1/3 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden animate-pulse-subtle", className)}>
      <div className="h-24 bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
      </div>
      <div className="p-4 pt-0">
        <div className="flex flex-col items-center -mt-12">
          <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
          <div className="space-y-3 text-center mt-3 w-full">
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
            <div className="flex justify-center space-x-2 pt-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MessageSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-start gap-3 py-3 animate-pulse-subtle", className)}>
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-1/6" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

export function DashboardStatsSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4 animate-pulse-subtle">
          <div className="flex justify-between items-start">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-1/2 mt-3" />
          <Skeleton className="h-3 w-full mt-3" />
        </div>
      ))}
    </div>
  )
}
