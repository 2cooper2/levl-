import type { Metadata } from "next"
import { MatchmakerProvider } from "@/context/matchmaker-context"
import { ReasoningVisualizer } from "@/components/ai-matchmaker/reasoning-visualizer"

export const metadata: Metadata = {
  title: "AI Reasoning Analysis | LEVL",
  description: "Analyze the AI reasoning process behind service recommendations",
}

export default function ReasoningAnalysisPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">AI Reasoning Analysis</h1>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md">
          <MatchmakerProvider>
            <ReasoningVisualizer />
          </MatchmakerProvider>
        </div>
      </div>
    </main>
  )
}
