import Link from "next/link"
import { Card } from "@/components/ui/enhanced-card"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md mx-auto p-8 text-center">
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-lavender-500">404</h1>
          <h2 className="text-2xl font-semibold mt-4 mb-2">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/matchmaker">Find Services</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
