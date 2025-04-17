"use client"

import { EnhancedMainNav } from "@/components/enhanced-main-nav"
import { BackgroundPattern } from "@/components/background-pattern"

export default function ProvidersPage() {
  return (
    <div className="min-h-screen bg-background">
      <EnhancedMainNav />
      <main className="container py-10">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Become a Provider</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join our platform and offer your services to clients worldwide. Showcase your skills, set your own rates,
            and grow your business.
          </p>
          <BackgroundPattern className="opacity-30" />
        </div>
      </main>
    </div>
  )
}
