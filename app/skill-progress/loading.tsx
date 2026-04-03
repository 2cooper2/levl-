import { Skeleton } from "@/components/ui/skeleton"

export default function SkillProgressLoading() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl md:col-span-2" />
          <Skeleton className="h-[250px] rounded-xl md:col-span-3" />
          <Skeleton className="h-[200px] rounded-xl md:col-span-3" />
          <Skeleton className="h-[150px] rounded-xl md:col-span-3" />
        </div>
      </div>
    </div>
  )
}
