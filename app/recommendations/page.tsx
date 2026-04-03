import type { Metadata } from "next"
import { SmartRecommendations } from "@/components/smart-recommendations"

export const metadata: Metadata = {
  title: "Personalized Recommendations | Levl",
  description: "Discover services tailored to your needs and preferences",
}

export default function RecommendationsPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Personalized Recommendations</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover services tailored to your skills, interests, and career goals. Our AI-powered recommendation engine
            analyzes your profile and activity to suggest the most relevant opportunities.
          </p>
        </div>

        <SmartRecommendations limit={6} showFeedback={true} />

        <div className="mt-16 bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">How Our Recommendations Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-700 p-5 rounded-lg shadow-sm">
              <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Profile Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We analyze your skills, interests, and career goals to understand what matters to you.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-5 rounded-lg shadow-sm">
              <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Behavioral Insights</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your interactions with services and content help us refine our understanding of your preferences.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-5 rounded-lg shadow-sm">
              <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Continuous Learning</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your feedback helps our system improve over time, making recommendations increasingly relevant.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
