"use client"

// Mock forum data
const forumCategories = [
  { id: "all", name: "All Topics", count: 124 },
  { id: "general", name: "General Discussion", count: 42 },
  { id: "questions", name: "Questions & Help", count: 36 },
  { id: "showcase", name: "Project Showcase", count: 18 },
  { id: "resources", name: "Resources & Tools", count: 28 },
]

const mockTopics = [
  {
    id: 1,
    title: "Best practices for UI/UX portfolio presentation?",
    author: {
      name: "DesignPro",
      avatar: "/placeholder.svg?key=86ykz",
      reputation: 1250,
      badge: "Expert",
    },
    category: "questions",
    replies: 12,
    views: 342,
    likes: 25,
    lastActive: "2 hours ago",
    tags: ["portfolio", "ui-design", "career"],
    preview:
      "I'm preparing my portfolio for job applications and wondering what format works best for presenting UI/UX work. Should I focus on process or final designs?",
    pinned: true,
    solved: true,
    responses: [
      {
        id: 101,
        author: {
          name: "UXMaster",
          avatar: "/placeholder.svg?key=tcjal",
          reputation: 3420,
          badge: "Mentor",
        },
        time: "1 hour ago",
        content:
          "Focus on telling a story with your portfolio. For each project, outline: 1) The problem you were solving, 2) Your research and process, 3) Design iterations, and 4) Final solution with outcomes. Recruiters want to see your thinking process more than just pretty screens.",
        likes: 18,
        isBestAnswer: true,
      },
      {
        id: 102,
        author: {
          name: "DesignDirector",
          avatar: "/placeholder.svg?key=92zbq",
          reputation: 5680,
          badge: "Industry Leader",
        },
        time: "45 minutes ago",
        content:
          "I've reviewed hundreds of portfolios. The ones that stand out include measurable results. Did your redesign increase conversion? Improve user satisfaction? Include these metrics. Also, keep it concise - quality over quantity.",
        likes: 12,
      },
    ],
  },
  {
    id: 2,
    title: "How to handle complex animations in React?",
    author: {
      name: "ReactDeveloper",
      avatar: "/placeholder.svg?key=bdan8",
      reputation: 890,
      badge: "Rising Talent",
    },
    category: "questions",
    replies: 8,
    views: 215,
    likes: 15,
    lastActive: "5 hours ago",
    tags: ["react", "animations", "performance"],
    preview:
      "I'm working on a dashboard with multiple animated components and experiencing performance issues. What's the best approach for complex animations in React?",
    pinned: false,
    solved: false,
    responses: [
      {
        id: 201,
        author: {
          name: "AnimationGuru",
          avatar: "/placeholder.svg?key=uwdtk",
          reputation: 2340,
          badge: "Specialist",
        },
        time: "4 hours ago",
        content:
          "For complex animations in React, I recommend using Framer Motion or React Spring. They're optimized for performance and handle hardware acceleration. Also, make sure you're not re-rendering unnecessarily - use React.memo and useMemo for components with heavy animations.",
        likes: 9,
      },
    ],
  },
  {
    id: 3,
    title: "Transitioning from graphic design to UX design",
    author: {
      name: "GraphicArtist",
      avatar: "/placeholder.svg?key=5a2ld",
      reputation: 560,
      badge: "Member",
    },
    category: "general",
    replies: 15,
    views: 428,
    likes: 32,
    lastActive: "1 day ago",
    tags: ["career-change", "ux-design", "learning"],
    preview:
      "I've been working as a graphic designer for 5 years and want to transition to UX design. What skills should I focus on learning first? Any course recommendations?",
    pinned: false,
    solved: true,
    responses: [],
  },
]

// Trending topics
const trendingTopics = [
  { id: 1, title: "Getting started with Figma Auto Layout", views: 1240 },
  { id: 2, title: "How to price your freelance UX services", views: 980 },
  { id: 3, title: "Building a design system from scratch", views: 875 },
  { id: 4, title: "Portfolio review thread - May 2023", views: 750 },
]

// Active users
const activeUsers = [
  { name: "UXMaster", avatar: "/placeholder.svg?key=co5ga", status: "online" },
  { name: "DesignDirector", avatar: "/placeholder.svg?key=7aoy8", status: "online" },
  { name: "ReactDeveloper", avatar: "/placeholder.svg?key=flfk2", status: "away" },
  { name: "GraphicArtist", avatar: "/placeholder.svg?key=or5hl", status: "online" },
]

// Format time function
const formatTime = (time: string) => {
  return time
}

// Reputation badge component
const ReputationBadge = ({ badge }: { badge: string }) => {
  let color = "bg-gray-100 text-gray-800"

  if (badge === "Expert") {
    color = "bg-blue-100 text-blue-800"
  } else if (badge === "Mentor") {
    color = "bg-purple-100 text-purple-800"
  } else if (badge === "Industry Leader") {
    color = "bg-amber-100 text-amber-800"
  } else if (badge === "Rising Talent") {
    color = "bg-green-100 text-green-800"
  } else if (badge === "Specialist") {
    color = "bg-indigo-100 text-indigo-800"
  }

  return <span className={`text-xs px-2 py-0.5 rounded-full ${color} font-medium`}>{badge}</span>
}

export default function ForumComponent() {
  return <div>Forum Component</div>
}
