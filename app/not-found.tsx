import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LevlLogo } from "@/components/levl-logo"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full max-w-[400px] flex-col items-center justify-center space-y-4 px-4 py-8 text-center">
        <LevlLogo className="h-12 w-12 text-primary" />
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/explore">Explore Services</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
