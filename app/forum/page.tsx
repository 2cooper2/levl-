import { ForumTab } from "@/components/forum/forum-tab"

export const metadata = {
  title: "Forum | LEVL",
  description: "Join our community forum to discuss topics, share knowledge, and connect with other users.",
}

export default function ForumPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
        <p className="text-gray-600">
          Join the conversation, ask questions, and share your knowledge with the LEVL community.
        </p>
      </div>

      <ForumTab />
    </div>
  )
}
