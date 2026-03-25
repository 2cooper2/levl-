import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function ProfileLoading() {
  return (
    <div className="container max-w-4xl py-10">
      <Skeleton className="mb-6 h-10 w-48" />

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        {/* Profile sidebar skeleton */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="text-center w-full">
                  <Skeleton className="mx-auto h-6 w-32" />
                  <Skeleton className="mx-auto mt-2 h-4 w-40" />
                  <Skeleton className="mx-auto mt-3 h-5 w-24 rounded-full" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 pb-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>

        {/* Profile content skeleton */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-32" />
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-40" />
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Logout button skeleton */}
      <div className="mt-10 flex justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    </div>
  )
}
