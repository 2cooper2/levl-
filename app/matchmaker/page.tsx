import type { Metadata } from "next"
import { MatchmakerProvider } from "@/context/matchmaker-context"
import { AIMatchmakerChat } from "@/components/ai-matchmaker/ai-matchmaker-chat"

export const metadata: Metadata = {
  title: "AI Service Matchmaker | LEVL",
  description: "Find the perfect service for your needs with our AI-powered matchmaker",
}

export default function MatchmakerPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-1">
        <MatchmakerProvider>
          <AIMatchmakerChat />
        </MatchmakerProvider>
      </div>
    </main>
  )
}
