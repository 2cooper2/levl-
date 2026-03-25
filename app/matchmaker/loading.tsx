import { Skeleton } from "@/components/ui/skeleton"

export default function MatchmakerLoading() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-4 w-full mx-auto mb-2" />
        <Skeleton className="h-4 w-5/6 mx-auto" />
      </div>

      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-[600px] w-full rounded-2xl" />
      </div>
    </div>
  )
}
