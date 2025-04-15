"use client"

import { useState } from "react"
import { LevlLoader } from "@/components/ui/levl-loader"
import { LoadingButton } from "@/components/ui/loading-button"
import {
  ServiceCardSkeleton,
  ProfileSkeleton,
  MessageSkeleton,
  DashboardStatsSkeleton,
} from "@/components/ui/skeleton-loaders"
import { Button } from "@/components/ui/button"

export default function LoadingDemo() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false)

  const handleLoadingDemo = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 3000)
  }

  const handleFullScreenDemo = () => {
    setIsFullScreenLoading(true)
    setTimeout(() => setIsFullScreenLoading(false), 3000)
  }

  return (
    <div className="container py-10 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-6">Levl Loading States</h1>
        <p className="text-muted-foreground mb-8">
          Custom, on-brand loading states and transitions for the Levl platform.
        </p>
      </div>

      {isFullScreenLoading && <LevlLoader fullScreen text="Loading your content..." size="lg" />}

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Branded Loaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 border rounded-lg bg-card">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium mb-4">Small</h3>
            <LevlLoader size="sm" />
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium mb-4">Medium</h3>
            <LevlLoader size="md" />
          </div>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium mb-4">Large</h3>
            <LevlLoader size="lg" />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <Button onClick={handleFullScreenDemo}>Show Full Screen Loader</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Loading Buttons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 border rounded-lg bg-card">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Default Button</h3>
            <LoadingButton isLoading={isLoading} loadingText="Loading..." onClick={handleLoadingDemo}>
              Click to Load
            </LoadingButton>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Variant Examples</h3>
            <div className="flex flex-wrap gap-3">
              <LoadingButton variant="secondary" isLoading={isLoading} onClick={handleLoadingDemo}>
                Secondary
              </LoadingButton>
              <LoadingButton variant="outline" isLoading={isLoading} onClick={handleLoadingDemo}>
                Outline
              </LoadingButton>
              <LoadingButton variant="destructive" isLoading={isLoading} onClick={handleLoadingDemo}>
                Destructive
              </LoadingButton>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Skeleton Loaders</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Service Card Skeleton</h3>
            <ServiceCardSkeleton className="max-w-md" />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Profile Skeleton</h3>
            <ProfileSkeleton className="max-w-md" />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Message Skeleton</h3>
            <div className="border rounded-lg p-4 max-w-md">
              <MessageSkeleton />
              <MessageSkeleton />
              <MessageSkeleton />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dashboard Stats Skeleton</h3>
            <DashboardStatsSkeleton />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How to Use</h2>
        <div className="p-6 border rounded-lg bg-card space-y-4">
          <p>Import these components to use throughout your application:</p>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code>{`
// For the branded loader
import { LevlLoader } from "@/components/ui/levl-loader"

// For loading buttons
import { LoadingButton } from "@/components/ui/loading-button"

// For skeleton loaders
import { 
  ServiceCardSkeleton, 
  ProfileSkeleton,
  MessageSkeleton,
  DashboardStatsSkeleton
} from "@/components/ui/skeleton-loaders"

// For page transitions
import { PageTransition } from "@/components/ui/page-transition"
            `}</code>
          </pre>
        </div>
      </section>
    </div>
  )
}
