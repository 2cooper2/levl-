import { Skeleton } from "@/components/ui/skeleton"

export default function ForumLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>

      <div className="space-y-4">
        {/* Header skeleton */}
        <Skeleton className="h-20 w-full rounded-xl" />

        {/* Category tabs skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full flex-shrink-0" />
          ))}
        </div>

        {/* Trending topics skeleton */}
        <Skeleton className="h-40 w-full rounded-xl" />

        {/* Topics list skeleton */}
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}

        {/* Load more button skeleton */}
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}
