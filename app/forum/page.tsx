import { ForumTab } from "@/components/forum/forum-tab"
import { LevlLogo } from "@/components/levl-logo"

export const metadata = {
  title: "Forum | LEVL",
  description: "Join our community forum to discuss topics, share knowledge, and connect with other users.",
}

export default function ForumPage() {
  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-6xl">
      <div className="flex items-center px-5 pt-5 pb-1">
        <LevlLogo className="h-16 w-16 transition-all shadow-[0_2px_4px_rgba(66,60,86,0.17),0_6px_16px_rgba(62,56,82,0.15),0_14px_32px_rgba(56,50,76,0.13)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.38),0_6px_16px_rgba(0,0,0,0.29),0_14px_32px_rgba(0,0,0,0.20)] translate-y-[-2px]" />
      </div>

      <ForumTab />
    </div>
  )
}
