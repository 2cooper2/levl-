import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LevlLogo } from "@/components/levl-logo"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mb-6">
        <LevlLogo className="h-12 w-12 text-primary" />
      </div>

      <h1 className="mb-2 text-6xl font-bold">404</h1>
      <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>

      <p className="mb-8 max-w-md text-muted-foreground">
        The page you are looking for doesn't exist or has been moved.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Button asChild variant="outline">
          <Link href="/explore">
            <Search className="mr-2 h-4 w-4" />
            Explore services
          </Link>
        </Button>

        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Return home
          </Link>
        </Button>
      </div>
    </div>
  )
}
