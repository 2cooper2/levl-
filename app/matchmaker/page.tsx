import type { Metadata } from "next"
import { AIMatchmakerContainer } from "@/components/ai-matchmaker/ai-matchmaker-container"

export const metadata: Metadata = {
  title: "AI Service Matchmaker | LEVL",
  description: "Find the perfect service for your needs with our AI-powered matchmaker",
}

export default function MatchmakerPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">LEVL Service Matchmaker</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Our AI-powered matchmaker will help you find the perfect service for your needs. Just tell us what you're
          looking for, and we'll do the rest.
        </p>
      </div>

      <AIMatchmakerContainer />
    </div>
  )
}
