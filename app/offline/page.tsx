"use client"

import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <WifiOff className="h-24 w-24 text-muted-foreground mb-6" />
      <h1 className="text-4xl font-bold mb-4">You're offline</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        It looks like you've lost your internet connection. Some features may be unavailable until you're back online.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button asChild>
          <Link href="/">Try Homepage</Link>
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      </div>
    </div>
  )
}
