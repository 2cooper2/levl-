"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  MessageSquare,
  TrendingUp,
  Star,
  Filter,
  PlusCircle,
  Sparkles,
  Target,
  WrenchIcon as ScrewDriver,
  Hammer,
  Layers,
  ThumbsUp,
  Eye,
  ArrowRight,
  CheckCircle,
  Truck,
  Droplet,
  Scissors,
  PaintBucket,
} from "lucide-react"
import { useRouter } from "next/navigation"

// Seeded review ratings per author - mix of high, mid, and low ratings
const authorReviewData: Record<string, { rating: number; reviewCount: number }> = {
  ToolEnthusiast: { rating: 4.1, reviewCount: 23 },
  HandyPro: { rating: 5, reviewCount: 487 },
  DIYQueen: { rating: 4.8, reviewCount: 94 },
  FurnitureNewbie: { rating: 2.3, reviewCount: 4 },
  AssemblyExpert: { rating: 5, reviewCount: 612 },
  DIYEnthusiast: { rating: 3.8, reviewCount: 17 },
  CarefulPacker: { rating: 3.2, reviewCount: 9 },
  MoveCoordinator: { rating: 5, reviewCount: 356 },
  AntiquesCollector: { rating: 4.6, reviewCount: 142 },
  DecorLover: { rating: 2.8, reviewCount: 6 },
  HardwareSpecialist: { rating: 5, reviewCount: 745 },
  CleanFreak: { rating: 3.5, reviewCount: 11 },
  CleaningPro: { rating: 4.9, reviewCount: 403 },
  DIYPlumber: { rating: 4.1, reviewCount: 28 },
  PlumbingExpert: { rating: 5, reviewCount: 889 },
  PaintingNewbie: { rating: 1.9, reviewCount: 2 },
  PaintContractor: { rating: 5, reviewCount: 574 },
  DIYMounter: { rating: 3.4, reviewCount: 14 },
  ContractorPro: { rating: 4.7, reviewCount: 328 },
  SpacePlanner: { rating: 4.3, reviewCount: 31 },
  InteriorDesigner: { rating: 5, reviewCount: 467 },
  CableHater: { rating: 2.6, reviewCount: 5 },
  AVInstaller: { rating: 4.9, reviewCount: 398 },
  GreenThumb: { rating: 3.9, reviewCount: 22 },
  LandscaperPro: { rating: 5, reviewCount: 741 },
  WFHWarrior: { rating: 4.4, reviewCount: 37 },
  OrganizationConsultant: { rating: 4.8, reviewCount: 189 },
  ToolNewbie: { rating: 2.1, reviewCount: 3 },
  RenovationRookie: { rating: 3.6, reviewCount: 8 },
  DogOwner: { rating: 4.2, reviewCount: 19 },
  You: { rating: 4.5, reviewCount: 12 },
  PowerToolPro: { rating: 5, reviewCount: 523 },
  DrillMaster: { rating: 4.6, reviewCount: 214 },
  IKEAHacker: { rating: 4.9, reviewCount: 371 },
  FlatpackKing: { rating: 3.1, reviewCount: 15 },
  MovingDay: { rating: 4.4, reviewCount: 88 },
  BubbleWrapFan: { rating: 2.9, reviewCount: 7 },
  WallMountKing: { rating: 5, reviewCount: 634 },
  DrywallDoctor: { rating: 4.3, reviewCount: 176 },
  ShowerGuru: { rating: 4.7, reviewCount: 245 },
  SparkleQueen: { rating: 3.4, reviewCount: 19 },
  PipeWrench: { rating: 5, reviewCount: 512 },
  LeakFixer: { rating: 4.2, reviewCount: 67 },
  BrushStroke: { rating: 4.8, reviewCount: 298 },
  ColorWheel: { rating: 3.7, reviewCount: 24 },
  MasonryMaster: { rating: 5, reviewCount: 451 },
  ConcreteKid: { rating: 2.5, reviewCount: 8 },
  RoomPlanner: { rating: 4.5, reviewCount: 112 },
  MeasureTwice: { rating: 4.1, reviewCount: 53 },
  WireNinja: { rating: 5, reviewCount: 387 },
  TechSetup: { rating: 3.8, reviewCount: 41 },
  TurfMaster: { rating: 4.9, reviewCount: 503 },
  YardWork101: { rating: 3.3, reviewCount: 12 },
  DeskSetup: { rating: 4.6, reviewCount: 156 },
  ProductivityGuru: { rating: 5, reviewCount: 421 },
}

function getAuthorReview(name: string) {
  if (authorReviewData[name]) return authorReviewData[name]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const rating = Math.round(((Math.abs(hash) % 41) / 10 + 1) * 10) / 10
  const reviewCount = Math.abs(hash) % 300 + 1
  return { rating: Math.min(rating, 5), reviewCount }
}

function ReviewStarBadge({ authorName }: { authorName: string }) {
  const { rating, reviewCount } = getAuthorReview(authorName)
  const displayRating = rating === 5 ? "5" : rating.toFixed(1)

  // Color tiers based on rating
  const starFill = rating >= 4.5 ? "#7C3AED" : rating >= 3.5 ? "#8B5CF6" : rating >= 2.5 ? "#A78BFA" : "#C4B5FD"
  const starStroke = rating >= 4.5 ? "#6D28D9" : rating >= 3.5 ? "#7C3AED" : rating >= 2.5 ? "#8B5CF6" : "#A78BFA"
  const glowColor = rating >= 4.5 ? "rgba(124, 58, 237, 0.3)" : "rgba(139, 92, 246, 0.15)"

  return (
    <span className="inline-flex items-center gap-1 ml-2">
      {/* Star with rating inside - larger, with depth */}
      <span
        className="relative inline-flex items-center justify-center shrink-0"
        style={{
          width: 26,
          height: 26,
          filter: `drop-shadow(0 1px 2px ${glowColor})`,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shadow layer */}
          <path
            d="M12 2L14.9 8.6L22 9.3L16.8 14L18.2 21L12 17.5L5.8 21L7.2 14L2 9.3L9.1 8.6L12 2Z"
            fill="rgba(0,0,0,0.1)"
            transform="translate(0.5, 0.5)"
          />
          {/* Main star fill */}
          <path
            d="M12 2L14.9 8.6L22 9.3L16.8 14L18.2 21L12 17.5L5.8 21L7.2 14L2 9.3L9.1 8.6L12 2Z"
            fill={starFill}
            stroke={starStroke}
            strokeWidth="0.75"
            strokeLinejoin="round"
          />
          {/* Inner highlight for 3D depth */}
          <path
            d="M12 4.5L14.1 9.2L19.2 9.7L15.4 13.1L16.5 18.1L12 15.5L7.5 18.1L8.6 13.1L4.8 9.7L9.9 9.2L12 4.5Z"
            fill="rgba(255,255,255,0.15)"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-white font-extrabold leading-none"
          style={{
            fontSize: rating === 5 ? 9.5 : 8,
            textShadow: "0 1px 1px rgba(0,0,0,0.25)",
            paddingTop: 1,
          }}
        >
          {displayRating}
        </span>
      </span>
      {/* Review count */}
      <span
        className="text-xs font-bold leading-none"
        style={{ color: starFill }}
      >
        {reviewCount}
      </span>
    </span>
  )
}

// Define forumTopics
const forumTopics = [
  {
    id: 1,
    title: "Best power drill for home DIY projects under $150?",
    author: "ToolEnthusiast",
    replies: 14,
    likes: 32,
    lastActive: "2 hours ago",
    tags: ["tools", "power-tools", "recommendations"],
    preview:
      "I'm looking to invest in a quality power drill for various home projects. Need something versatile with good battery life that won't break the bank. Any recommendations under $150?",
    responses: [
      {
        author: "HandyPro",
        time: "1 hour ago",
        content:
          "The DeWalt 20V MAX has been my go-to for years. Great battery life, comes with multiple bits, and you can often find it on sale for around $130. Perfect balance of quality and price for home DIY.",
        likes: 8,
      },
      {
        author: "DIYQueen",
        time: "30 minutes ago",
        content:
          "If you want something lighter, the Bosch 12V is excellent for home use. Very comfortable grip and enough power for most household tasks. The battery lasts forever and it's usually around $120.",
        likes: 5,
      },
      {
        author: "PowerToolPro",
        time: "25 minutes ago",
        content:
          "Can't go wrong with the Milwaukee M18. It's slightly above budget at $160 but the brushless motor makes it last 3x longer. I've used mine on over 200 jobs and it still runs like new.",
        likes: 12,
      },
      {
        author: "DrillMaster",
        time: "15 minutes ago",
        content:
          "For under $150 the Ryobi ONE+ HP is actually really underrated. The brushless version has serious torque and the battery system is compatible with 300+ Ryobi tools if you want to expand later.",
        likes: 4,
      },
      {
        author: "ToolNewbie",
        time: "10 minutes ago",
        content:
          "I just bought a cheap one from Harbor Freight and it works fine for hanging shelves. Do you really need to spend $150?",
        likes: 1,
      },
    ],
  },
  {
    id: 2,
    title: "Tips for assembling IKEA furniture efficiently?",
    author: "FurnitureNewbie",
    replies: 8,
    likes: 15,
    lastActive: "3 days ago",
    tags: ["assembly", "furniture", "tools"],
    preview:
      "Just bought several IKEA pieces for my new apartment. Any tips for assembling them quickly and correctly? Tools I should have on hand?",
    responses: [
      {
        author: "AssemblyExpert",
        time: "3 days ago",
        content:
          "Get a quality electric screwdriver with multiple bits - it's a game changer. Sort all hardware by type before starting, and always build drawers last.",
        likes: 7,
      },
      {
        author: "DIYEnthusiast",
        time: "3 days ago",
        content:
          "Follow the instructions in order! And use a rubber mallet instead of a hammer to avoid damaging the pieces. Also, those little IKEA wrenches are terrible - use your own tools.",
        likes: 2,
      },
      {
        author: "IKEAHacker",
        time: "2 days ago",
        content:
          "Pro tip: lay out ALL the pieces first and check the parts list before you even start. I've assembled over 300 IKEA pieces and the #1 mistake people make is skipping a step then having to disassemble. Also, wood glue on the dowels makes everything way sturdier.",
        likes: 15,
      },
      {
        author: "FlatpackKing",
        time: "2 days ago",
        content:
          "Honestly the instructions are usually fine if you just take your time. I always put on a podcast and don't rush it. The KALLAX is the easiest to start with.",
        likes: 3,
      },
    ],
  },
  {
    id: 3,
    title: "Best packing materials for fragile items?",
    author: "CarefulPacker",
    replies: 5,
    likes: 10,
    lastActive: "1 week ago",
    tags: ["moving", "packing", "fragile"],
    preview:
      "I have several valuable glass and ceramic items to pack for an upcoming move. What packing materials provide the best protection beyond basic bubble wrap?",
    responses: [
      {
        author: "MoveCoordinator",
        time: "1 week ago",
        content:
          "Dish packing kits with cell dividers are excellent for glassware. For odd-shaped items, expandable foam bags that conform to the shape are worth the investment.",
        likes: 4,
      },
      {
        author: "AntiquesCollector",
        time: "1 week ago",
        content:
          "I double-box my valuable items with foam inserts between boxes. Also, microfiber cloths work better than newspaper as they don't leave print residue.",
        likes: 1,
      },
      {
        author: "MovingDay",
        time: "6 days ago",
        content:
          "Packing peanuts are messy and shift during transport. Use crumpled packing paper tightly around each item and fill every gap in the box. If the box rattles when you shake it, it needs more padding.",
        likes: 6,
      },
      {
        author: "BubbleWrapFan",
        time: "5 days ago",
        content:
          "I just use towels and blankets I already own. Saves money and they cushion things pretty well. Worked fine for my last move.",
        likes: 2,
      },
    ],
  },
  {
    id: 4,
    title: "Best anchors for hanging heavy mirrors on drywall?",
    author: "DecorLover",
    replies: 4,
    likes: 6,
    lastActive: "5 days ago",
    tags: ["mounting", "hardware", "drywall"],
    preview:
      "I have a 40-pound decorative mirror to hang on drywall. What anchors would you recommend that won't fail over time? Studs aren't in the right position.",
    responses: [
      {
        author: "HardwareSpecialist",
        time: "5 days ago",
        content:
          "Toggle bolts are your best option for heavy items on drywall. The TOGGLER SnapSkru has a 65lb rating per anchor - I'd use at least two for your mirror.",
        likes: 3,
      },
      {
        author: "WallMountKing",
        time: "5 days ago",
        content:
          "Always try to hit at least one stud if possible - even a single stud anchor point plus one toggle bolt is way more secure than two toggle bolts alone. Use a stud finder with deep scan mode. For a 40lb mirror, I'd use a French cleat system mounted to the stud.",
        likes: 11,
      },
      {
        author: "DrywallDoctor",
        time: "4 days ago",
        content:
          "The Hillman WallDog screws are also decent for medium-weight items and don't require pre-drilling. But for 40lbs, definitely go toggle bolts or find a stud. I've seen too many mirrors crash down from cheap plastic anchors.",
        likes: 7,
      },
      {
        author: "FurnitureNewbie",
        time: "4 days ago",
        content:
          "I used command strips for my mirror and it fell off after a week. Don't be like me lol. Toggle bolts are the way to go.",
        likes: 4,
      },
    ],
  },
  {
    id: 5,
    title: "Most effective cleaning solution for shower glass?",
    author: "CleanFreak",
    replies: 7,
    likes: 12,
    lastActive: "2 days ago",
    tags: ["cleaning", "bathroom", "glass"],
    preview:
      "My shower glass gets cloudy with hard water stains no matter what I try. What cleaning products or DIY solutions actually work for stubborn mineral buildup?",
    responses: [
      {
        author: "CleaningPro",
        time: "2 days ago",
        content:
          "Equal parts white vinegar and Dawn dish soap, heated slightly and sprayed on. Let sit for 30 minutes, then scrub with a non-scratch sponge. Follow with a squeegee after each shower.",
        likes: 5,
      },
      {
        author: "ShowerGuru",
        time: "2 days ago",
        content:
          "Bar Keepers Friend makes a spray specifically for glass. It cuts through hard water stains like nothing else. Apply, wait 5 min, wipe off. Then apply Rain-X to the clean glass - water will bead right off and stains build up way slower.",
        likes: 9,
      },
      {
        author: "SparkleQueen",
        time: "1 day ago",
        content:
          "I tried the vinegar thing and it worked okay but the smell was horrible. Honestly I just use a Magic Eraser now and it does a decent enough job.",
        likes: 2,
      },
    ],
  },
  {
    id: 6,
    title: "Tools needed for basic plumbing repairs?",
    author: "DIYPlumber",
    replies: 9,
    likes: 18,
    lastActive: "1 day ago",
    tags: ["plumbing", "tools", "repairs"],
    preview:
      "Want to handle simple plumbing issues myself. What's a good starter tool kit for tasks like fixing leaky faucets, unclogging drains, and replacing p-traps?",
    responses: [
      {
        author: "PlumbingExpert",
        time: "1 day ago",
        content:
          "Must-haves: adjustable wrench, pipe wrench, basin wrench, plunger, drain snake, plumber's tape, and a good set of screwdrivers. Add channel locks and a hacksaw for plastic pipes.",
        likes: 7,
      },
      {
        author: "PipeWrench",
        time: "1 day ago",
        content:
          "Don't forget a headlamp - you'll be working under sinks in dark cabinets. Also get a tube of plumber's putty and silicone caulk. For drain clogs, a hand auger is 10x better than chemical drain cleaners which can damage pipes.",
        likes: 10,
      },
      {
        author: "LeakFixer",
        time: "20 hours ago",
        content:
          "YouTube is your best friend for plumbing. I learned to replace my entire kitchen faucet from a 15-minute video. Just make sure you turn off the water supply first - learned that the hard way.",
        likes: 5,
      },
    ],
  },
  {
    id: 7,
    title: "Best technique for painting clean edges without tape?",
    author: "PaintingNewbie",
    replies: 15,
    likes: 22,
    lastActive: "3 days ago",
    tags: ["painting", "techniques", "edges"],
    preview:
      "I'm tired of paint bleeding under tape. Are there techniques for cutting in edges freehand with professional results? What brush works best for this?",
    responses: [
      {
        author: "PaintContractor",
        time: "3 days ago",
        content:
          'Use a 2-2.5" angled sash brush with quality bristles. Hold it like a pencil, load only the first 1/3 of bristles, and pull the brush along the edge with steady pressure. Practice makes perfect!',
        likes: 12,
      },
      {
        author: "BrushStroke",
        time: "3 days ago",
        content:
          "Frog Tape is way better than regular blue tape if you do want to use tape - it has a paint-block technology that prevents bleeding. But if you want to go freehand, the Purdy XL Glide angled brush is the industry standard. Dip, tap, don't wipe.",
        likes: 8,
      },
      {
        author: "ColorWheel",
        time: "2 days ago",
        content:
          "I tried cutting in freehand and it looked terrible. Some of us just don't have steady hands. I went back to tape and Frog Tape works way better than the blue stuff.",
        likes: 3,
      },
      {
        author: "PaintingNewbie",
        time: "2 days ago",
        content:
          "Thanks everyone! I'm going to try the angled brush technique on a closet first before I tackle the living room. Practice wall here I come.",
        likes: 2,
      },
    ],
  },
  {
    id: 8,
    title: "Best drill bits for concrete walls?",
    author: "DIYMounter",
    replies: 6,
    likes: 9,
    lastActive: "4 days ago",
    tags: ["drilling", "concrete", "tools"],
    preview:
      "Need to mount several items on concrete walls. Regular bits aren't working. What type of drill bits should I use, and do I need a hammer drill or will my regular drill work?",
    responses: [
      {
        author: "ContractorPro",
        time: "4 days ago",
        content:
          "You need carbide-tipped masonry bits and ideally a hammer drill. For occasional use, Bosch Multipurpose bits work well. For many holes, invest in a rotary hammer drill - your arms will thank you.",
        likes: 4,
      },
      {
        author: "MasonryMaster",
        time: "4 days ago",
        content:
          "SDS-plus bits in a rotary hammer are the gold standard for concrete. Don't even bother with regular drill bits - you'll burn through them and overheat your drill. Bosch and Hilti make the best SDS bits. Start with a smaller pilot hole then step up to your final size.",
        likes: 13,
      },
      {
        author: "ConcreteKid",
        time: "3 days ago",
        content:
          "I tried using a regular drill with masonry bits and it took forever. Ended up renting a hammer drill from Home Depot for $40/day and it was so much easier.",
        likes: 3,
      },
    ],
  },
  {
    id: 9,
    title: "How to properly measure for furniture before buying?",
    author: "SpacePlanner",
    replies: 11,
    likes: 17,
    lastActive: "2 days ago",
    tags: ["furniture", "measuring", "planning"],
    preview:
      "I've made mistakes buying furniture that didn't fit my space well. What's the best approach to measuring rooms and planning furniture layout before purchasing?",
    responses: [
      {
        author: "InteriorDesigner",
        time: "2 days ago",
        content:
          "Create a floor plan with all measurements, including windows, doors, and their swing paths. Account for walking paths (min 30\"). Use painter's tape on the floor to visualize size. Don't forget to measure doorways for delivery!",
        likes: 8,
      },
      {
        author: "RoomPlanner",
        time: "2 days ago",
        content:
          "The RoomSketcher app is amazing for this. You input your room dimensions and can drag furniture to scale. Saved me from buying a couch that would have blocked my hallway. It's free for basic use.",
        likes: 6,
      },
      {
        author: "MeasureTwice",
        time: "1 day ago",
        content:
          "Always measure the diagonal of doorways and stairwells too, not just width and height. I once couldn't get a mattress up my stairs because of a tight turn, even though the numbers on paper looked fine.",
        likes: 4,
      },
    ],
  },
  {
    id: 10,
    title: "In-wall cable management solutions for mounted TVs?",
    author: "CableHater",
    replies: 8,
    likes: 14,
    lastActive: "6 days ago",
    tags: ["mounting", "cables", "organization"],
    preview:
      "What are the best products for running TV cables through walls? Looking for something that's code-compliant and relatively easy to install for a DIYer.",
    responses: [
      {
        author: "AVInstaller",
        time: "6 days ago",
        content:
          "Legrand's in-wall power and cable management kits are excellent and code-compliant. They include everything you need and are fairly straightforward to install if you're comfortable cutting drywall.",
        likes: 6,
      },
      {
        author: "WireNinja",
        time: "5 days ago",
        content:
          "The DataComm recessed media plate kit is another great option. Use a fish tape or glow rod to pull cables through the wall. Remember: power cables MUST go through a proper in-wall rated power kit - you can't just run a regular extension cord through the wall, it's a fire code violation.",
        likes: 14,
      },
      {
        author: "TechSetup",
        time: "5 days ago",
        content:
          "If you don't want to go in-wall, the SimpleCord cable concealer channels are a decent surface-mount alternative. You can paint them to match your wall. Not as clean as in-wall but way easier to install.",
        likes: 3,
      },
    ],
  },
  {
    id: 11,
    title: "Best grass seed for shady areas?",
    author: "GreenThumb",
    replies: 7,
    likes: 11,
    lastActive: "5 days ago",
    tags: ["landscaping", "lawn", "shade"],
    preview:
      "Part of my yard gets only 2-3 hours of direct sunlight. Regular grass seed isn't thriving there. What varieties work best in shady conditions in the Northeast?",
    responses: [
      {
        author: "LandscaperPro",
        time: "5 days ago",
        content:
          "Fine fescues are your best bet for shade. Look for a mix with Creeping Red Fescue, Chewings Fescue, and Hard Fescue. Jonathan Green's Shady Nooks blend has worked well for my clients.",
        likes: 6,
      },
      {
        author: "TurfMaster",
        time: "4 days ago",
        content:
          "In the Northeast, I'd also consider overseeding with perennial ryegrass for quick establishment, then the fescue will fill in over time. Make sure you aerate first and top-dress with compost. Seed-to-soil contact is everything. Water lightly twice a day until germination.",
        likes: 11,
      },
      {
        author: "YardWork101",
        time: "4 days ago",
        content:
          "Have you considered just doing a ground cover like clover instead? It stays green in shade, doesn't need mowing, and is way less maintenance than grass.",
        likes: 3,
      },
    ],
  },
  {
    id: 12,
    title: "Space-saving home office organization ideas?",
    author: "WFHWarrior",
    replies: 10,
    likes: 19,
    lastActive: "3 days ago",
    tags: ["organization", "home-office", "small-space"],
    preview:
      "My home office is tiny (8x8 ft). Looking for creative storage and organization solutions that maximize the limited space while keeping everything accessible.",
    responses: [
      {
        author: "OrganizationConsultant",
        time: "3 days ago",
        content:
          "Wall-mounted monitor arms free up desk space. Use vertical storage with floating shelves. A pegboard system for frequently used items keeps them accessible without cluttering your desk.",
        likes: 7,
      },
      {
        author: "DeskSetup",
        time: "2 days ago",
        content:
          "Under-desk cable trays are a must - they instantly make your space look cleaner. I also recommend a clamp-on desk shelf for your monitor to free up the actual desk surface. IKEA ALEX drawers fit perfectly in a small space too.",
        likes: 5,
      },
      {
        author: "ProductivityGuru",
        time: "2 days ago",
        content:
          "Vertical space is your best friend in an 8x8. Wall-mounted fold-down desk + wall shelves above + good lighting. I transformed a closet into a home office using this approach. Also get a small filing cabinet on wheels that slides under the desk.",
        likes: 9,
      },
    ],
  },
]

export function ForumTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTopic, setActiveTopic] = useState<number | null>(null)
  const [topics, setTopics] = useState(forumTopics)
  const [isLoading, setIsLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")
  const [showNewTopicForm, setShowNewTopicForm] = useState(false)
  const [newTopicTitle, setNewTopicTitle] = useState("")
  const [newTopicContent, setNewTopicContent] = useState("")
  const [newTopicTags, setNewTopicTags] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [userVotes, setUserVotes] = useState<Record<string, Record<string, boolean>>>({})
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [replyContent, setReplyContent] = useState("")
  const [expandedTags, setExpandedTags] = useState(false)
  const [userBookmarks, setUserBookmarks] = useState<number[]>([])
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({})

  const [viewMode, setViewMode] = useState<"card" | "compact">("card")
  const [showUserTooltip, setShowUserTooltip] = useState<number | null>(null)

  const categoriesRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content:
        "Hey there! I'm Levl, your AI assistant. I'm here to help you find the right service provider for your needs. What are you looking for today?",
      timestamp: new Date(),
      options: ["Mounting a TV", "Moving", "Painting", "Furniture Assembly"],
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredTopics = topics
    .filter((topic) => {
      const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeCategory === "all" || topic.tags.includes(activeCategory)
      const matchesBookmark = showOnlyBookmarked ? userBookmarks.includes(topic.id) : true
      return matchesSearch && matchesCategory && matchesBookmark
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
      } else if (sortBy === "popular") {
        return b.likes - a.likes
      } else if (sortBy === "replies") {
        return b.replies - a.replies
      }
      return 0
    })

  const loadMoreTopics = () => {
    setIsLoading(true)
    setTimeout(() => {
      // Simulate loading more topics
      const newTopics = [
        {
          id: topics.length + 1,
          title: "Recommended power tools for a beginner DIYer?",
          author: "ToolNewbie",
          replies: 8,
          likes: 14,
          lastActive: "6 days ago",
          tags: ["tools", "beginner", "recommendations"],
          preview:
            "Setting up my first home workshop. What are the essential power tools I should invest in first? Looking for quality but budget-friendly options.",
          responses: [
            {
              author: "PowerToolPro",
              time: "5 days ago",
              content:
                "Start with a drill/driver, circular saw, and orbital sander. Those three will cover 80% of projects. Ryobi ONE+ system is great for beginners because the batteries are interchangeable across all their tools.",
              likes: 9,
            },
            {
              author: "HandyPro",
              time: "5 days ago",
              content:
                "Add a jigsaw and a good set of clamps to that list. Clamps are the most underrated tool in any workshop. You can never have too many.",
              likes: 6,
            },
            {
              author: "ContractorPro",
              time: "4 days ago",
              content:
                "Don't overlook a quality workbench and good lighting. A stable surface and being able to see what you're doing makes everything easier and safer.",
              likes: 4,
            },
          ],
        },
        {
          id: topics.length + 2,
          title: "Best way to remove old wallpaper without damaging walls?",
          author: "RenovationRookie",
          replies: 11,
          likes: 19,
          lastActive: "3 days ago",
          tags: ["wallpaper", "removal", "walls"],
          preview:
            "Bought a house with outdated wallpaper in several rooms. What's the most effective method to remove it without damaging the drywall underneath?",
          responses: [
            {
              author: "PaintContractor",
              time: "3 days ago",
              content:
                "Score the wallpaper with a Paper Tiger tool, then spray with a 50/50 vinegar-water solution. Let it soak 15 minutes, then use a wide putty knife at a low angle. Work in sections. A wallpaper steamer works even better for stubborn adhesive.",
              likes: 11,
            },
            {
              author: "BrushStroke",
              time: "2 days ago",
              content:
                "DIF wallpaper remover concentrate is the best product I've used. Mix it in a pump sprayer and be generous. The key is patience - let the solution do the work instead of forcing it with the scraper.",
              likes: 7,
            },
            {
              author: "DecorLover",
              time: "2 days ago",
              content:
                "I used a fabric softener and hot water mix and it worked surprisingly well! Just be careful not to gouge the drywall with your scraper.",
              likes: 3,
            },
          ],
        },
        {
          id: topics.length + 3,
          title: "Recommendations for cordless vacuum for pet hair?",
          author: "DogOwner",
          replies: 7,
          likes: 16,
          lastActive: "4 days ago",
          tags: ["cleaning", "vacuum", "pets"],
          preview:
            "Have two shedding dogs and hardwood floors with area rugs. Need a powerful cordless vacuum specifically good for pet hair. Budget around $300.",
          responses: [
            {
              author: "CleaningPro",
              time: "4 days ago",
              content:
                "Dyson V12 Detect Slim is excellent for pet hair and within your budget. The laser dust detection is amazing for seeing pet hair on hardwood. Battery lasts about 60 minutes on low which is plenty for most homes.",
              likes: 8,
            },
            {
              author: "SparkleQueen",
              time: "3 days ago",
              content:
                "Samsung Jet 75 Pet is a solid alternative to Dyson at a lower price. It comes with a pet hair turbo brush and the dustbin is easy to empty without touching the gross stuff.",
              likes: 4,
            },
            {
              author: "CleanFreak",
              time: "3 days ago",
              content:
                "Get a robot vacuum too if you can - running a Roomba daily between your main vacuuming sessions makes a huge difference with shedding dogs. The iRobot j7+ handles pet hair really well.",
              likes: 6,
            },
          ],
        },
      ]
      setTopics([...topics, ...newTopics])
      setIsLoading(false)
    }, 1000)
  }

  const handleCreateTopic = () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return

    const newTopic = {
      id: Math.floor(Math.random() * 1000) + 10,
      title: newTopicTitle,
      author: "You",
      replies: 0,
      likes: 0,
      lastActive: "Just now",
      tags: newTopicTags.split(",").map((tag) => tag.trim().toLowerCase()),
      preview: newTopicContent,
      responses: [],
    }

    setTopics([newTopic, ...topics])
    setNewTopicTitle("")
    setNewTopicContent("")
    setNewTopicTags("")
    setShowNewTopicForm(false)

    // Show success notification
    setNotificationMessage("Topic created successfully!")
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const handleVote = (topicId: number, responseIndex: number | null, type: "up" | "down") => {
    // Create a unique ID for the vote target
    const targetId = responseIndex !== null ? `${topicId}-${responseIndex}` : `${topicId}`

    // Check if user has already voted
    const hasVoted = userVotes[targetId]?.[type]

    // Update user votes state
    setUserVotes((prev) => {
      const newVotes = { ...prev }
      if (!newVotes[targetId]) newVotes[targetId] = {}

      // If already voted this type, remove vote
      if (hasVoted) {
        newVotes[targetId][type] = false
      }
      // If voted opposite type, switch vote
      else if (newVotes[targetId][type === "up" ? "down" : "up"]) {
        newVotes[targetId][type === "up" ? "down" : "up"] = false
        newVotes[targetId][type] = true
      }
      // New vote
      else {
        newVotes[targetId][type] = true
      }

      return newVotes
    })

    // Update topic/response likes count
    setTopics((prev) => {
      return prev.map((topic) => {
        if (topic.id === topicId) {
          if (responseIndex === null) {
            // Voting on the topic itself
            let newLikes = topic.likes
            if (hasVoted && type === "up") newLikes--
            else if (!hasVoted && type === "up") newLikes++
            else if (hasVoted && type === "down") newLikes++
            else if (!hasVoted && type === "down") newLikes--

            return { ...topic, likes: newLikes }
          } else {
            // Voting on a response
            const newResponses = [...(topic.responses || [])]
            if (newResponses[responseIndex]) {
              let newLikes = newResponses[responseIndex].likes
              if (hasVoted && type === "up") newLikes--
              else if (!hasVoted && type === "up") newLikes++
              else if (hasVoted && type === "down") newLikes++
              else if (!hasVoted && type === "down") newLikes--

              newResponses[responseIndex] = { ...newResponses[responseIndex], likes: newLikes }
            }
            return { ...topic, responses: newResponses }
          }
        }
        return topic
      })
    })
  }

  const handleReply = (topicId: number) => {
    if (!replyContent.trim()) return

    setTopics((prev) => {
      return prev.map((topic) => {
        if (topic.id === topicId) {
          const newResponses = [
            ...(topic.responses || []),
            {
              author: "You",
              time: "Just now",
              content: replyContent,
              likes: 0,
            },
          ]
          return {
            ...topic,
            responses: newResponses,
            replies: topic.replies + 1,
            lastActive: "Just now",
          }
        }
        return topic
      })
    })

    setReplyContent("")

    // Show success notification
    setNotificationMessage("Reply posted successfully!")
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const toggleBookmark = (topicId: number) => {
    setUserBookmarks((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((id) => id !== topicId)
      } else {
        return [...prev, topicId]
      }
    })

    // Show notification
    setNotificationMessage(userBookmarks.includes(topicId) ? "Bookmark removed" : "Topic bookmarked!")
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const categories = [
    { id: "all", name: "All Topics", icon: <Layers className="h-3.5 w-3.5" /> },
    { id: "mounting", name: "Mounting", icon: <Hammer className="h-3.5 w-3.5" /> },
    { id: "painting", name: "Painting", icon: <PaintBucket className="h-3.5 w-3.5" /> },
    { id: "tools", name: "Tools", icon: <ScrewDriver className="h-3.5 w-3.5" /> },
    { id: "furniture", name: "Furniture", icon: <Truck className="h-3.5 w-3.5" /> },
    { id: "cleaning", name: "Cleaning", icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: "plumbing", name: "Plumbing", icon: <Droplet className="h-3.5 w-3.5" /> },
    { id: "landscaping", name: "Landscaping", icon: <Scissors className="h-3.5 w-3.5" /> },
  ]

  const allTags = Array.from(new Set(topics.flatMap((topic) => topic.tags)))
    .filter((tag) => !categories.some((cat) => cat.id === tag))
    .slice(0, expandedTags ? undefined : 5)

  const handleCategoryClick = (category: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        type: "user",
        content: `I'm looking for ${category} services.`,
        timestamp: new Date(),
      },
      {
        id: Date.now() + 1,
        type: "loading",
        content: "Levl is searching for the best matches...",
        timestamp: new Date(),
      },
    ])

    setTimeout(() => {
      setMessages((prevMessages) => {
        const loadingMessageIndex = prevMessages.findIndex((msg) => msg.type === "loading")
        const newMessages = [...prevMessages]
        if (loadingMessageIndex !== -1) {
          newMessages.splice(loadingMessageIndex, 1, {
            id: Date.now() + 2,
            type: "ai",
            content: `Okay, I found some great ${category} service providers for you!`,
            timestamp: new Date(),
            services: [
              {
                id: 1,
                provider: {
                  id: "provider1",
                  name: "John's Handyman Services",
                  rating: 4.5,
                  reviews: 120,
                  image: "/placeholder-service.jpg",
                  category: "Mounting",
                },
                matchScore: 0.85,
              },
              {
                id: 2,
                provider: {
                  id: "provider2",
                  name: "Jane's Moving Co.",
                  rating: 4.2,
                  reviews: 85,
                  image: "/placeholder-service.jpg",
                  category: "Moving",
                },
                matchScore: 0.78,
              },
            ],
          })
        }
        return newMessages
      })
      scrollToBottom()
    }, 2000)
  }

  const handleOptionSelect = (option: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), type: "user", content: option, timestamp: new Date() },
      { id: Date.now() + 1, type: "loading", content: "Levl is searching...", timestamp: new Date() },
    ])

    setTimeout(() => {
      setMessages((prevMessages) => {
        const loadingMessageIndex = prevMessages.findIndex((msg) => msg.type === "loading")
        const newMessages = [...prevMessages]
        if (loadingMessageIndex !== -1) {
          newMessages.splice(loadingMessageIndex, 1, {
            id: Date.now() + 2,
            type: "ai",
            content: `Great choice! Here are some top-rated providers for ${option.toLowerCase()}.`,
            timestamp: new Date(),
            services: [
              {
                id: 1,
                provider: {
                  id: "provider1",
                  name: "John's Handyman Services",
                  rating: 4.5,
                  reviews: 120,
                  image: "/placeholder-service.jpg",
                  category: "Mounting",
                },
                matchScore: 0.85,
              },
              {
                id: 2,
                provider: {
                  id: "provider2",
                  name: "Jane's Moving Co.",
                  rating: 4.2,
                  reviews: 85,
                  image: "/placeholder-service.jpg",
                  category: "Moving",
                },
                matchScore: 0.78,
              },
            ],
          })
        }
        return newMessages
      })
      scrollToBottom()
    }, 2000)
  }

  const handleServiceSelect = (serviceId: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        type: "ai",
        content: `You selected service with ID: ${serviceId}. Do you want to proceed with this provider?`,
        timestamp: new Date(),
        feedbackOptions: ["Yes", "No"],
      },
    ])
    scrollToBottom()
  }

  const handleFeedbackSelect = (feedback: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), type: "feedback", content: `You selected: ${feedback}`, timestamp: new Date() },
    ])
    scrollToBottom()
  }

  const sendMessage = async (message: string) => {
    setIsTyping(true)
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), type: "user", content: message, timestamp: new Date() },
    ])
    setInputValue("")

    // Simulate AI response after a short delay
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now() + 1,
          type: "ai",
          content: `Thanks for your message! I'm processing your request: "${message}"`,
          timestamp: new Date(),
        },
      ])
      setIsTyping(false)
      scrollToBottom()
    }, 1500)
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (inputValue.trim()) {
      await sendMessage(inputValue)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="space-y-4 pb-8 bg-gradient-to-b from-lavender-50/50 via-white to-lavender-100/30 min-h-screen">
      {/* Notification toast */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-lavender-400 to-lavender-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center"
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with search and new topic button - Enhanced with Levl UI/UX */}
      <div className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground transition-all relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]">
        {/* Decorative elements exactly like category cards */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-lavender-400/10 to-transparent rounded-bl-full transform transition-transform duration-700 group-hover:scale-110"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-tr from-lavender-500/15 to-transparent rounded-tr-full transform transition-transform duration-700 group-hover:scale-110"></div>
        <div
          className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-60"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(233,213,255,0.3) 1px, transparent 1px), radial-gradient(circle at 70% 60%, rgba(233,213,255,0.25) 1px, transparent 1px)",
            backgroundSize: "20px 20px, 25px 25px",
          }}
        ></div>

        {/* Animated accent line exactly like category cards */}
        <div className="absolute h-[2px] w-1/3 bg-gradient-to-r from-transparent via-lavender-400/60 to-transparent top-0 left-0 animate-shimmer"></div>

        {/* Additional decorative elements from category cards */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-lavender-300/5 to-transparent rounded-tl-full"></div>
        <div className="absolute top-1/2 left-0 w-12 h-24 bg-gradient-to-r from-lavender-400/5 to-transparent"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-lavender-500/70 transition-colors duration-200" />
            </div>
            <Input
              type="text"
              placeholder="Search forum topics..."
              className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-lavender-200 focus:border-lavender-400/60 focus:ring-2 focus:ring-lavender-300/30 bg-white/80 transition-all duration-200 text-sm placeholder:text-gray-400"
              value={searchQuery}
              onChange={handleSearch}
            />
            <motion.div
              className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: searchQuery ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                className="h-5 w-5 bg-lavender-100 rounded-full flex items-center justify-center text-lavender-500 hover:bg-lavender-200 transition-colors"
                onClick={() => setSearchQuery("")}
              >
                <span className="sr-only">Clear search</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </button>
            </motion.div>
          </div>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-lavender-300 to-lavender-500 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-lavender-400/20"
            onClick={() => setShowNewTopicForm(true)}
          >
            <PlusCircle className="h-4 w-4 transition-transform duration-300" />
            <span>New Topic</span>
          </button>
        </div>

        {/* Forum categories */}
        <div className="flex flex-wrap gap-2 mb-2 relative z-10">
          {["All Topics", "Recommendations", "How-To", "Tips & Tricks", "Product Reviews", "DIY Projects"].map(
            (category) => (
              <button
                key={category}
                className={`px-3 py-1.5 text-xs rounded-full transition-all duration-200 ${
                  category === "All Topics"
                    ? "bg-lavender-100/80 text-lavender-700 font-medium border-2 border-lavender-300/40"
                    : "bg-lavender-50 text-gray-600 border border-lavender-200/50"
                }`}
              >
                {category}
              </button>
            ),
          )}
        </div>

        {/* Sort options */}
        <div className="flex items-center justify-between text-xs text-gray-500 relative z-10">
          <div className="flex items-center gap-3">
            <span className="font-medium">Sort by:</span>
            <div className="flex items-center gap-3">
              {["Latest", "Popular", "Unanswered"].map((option, index) => (
                <button
                  key={option}
                  className={`transition-colors duration-200 ${index === 0 ? "text-lavender-600 font-medium" : ""}`}
                  onClick={() => setSortBy(index === 0 ? "recent" : index === 1 ? "popular" : "replies")}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-3 w-3 text-lavender-500" />
            <span>Filters</span>
          </div>
        </div>
      </div>

      {/* New Topic Form */}
      <AnimatePresence>
        {showNewTopicForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground transition-all relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] mb-4"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_10px_10px,rgba(var(--primary-rgb),0.4)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-lavender-600" />
              Create New Discussion
            </h3>

            <div className="space-y-3">
              <div className="relative">
                <Input
                  placeholder="Topic title"
                  className="text-sm bg-white/5 dark:bg-black/20 border-white/10 pr-16"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                  {newTopicTitle.length}/100
                </div>
              </div>

              <div className="relative">
                <textarea
                  placeholder="What would you like to discuss?"
                  className="w-full h-24 px-3 py-2 text-sm bg-white/5 dark:bg-black/20 rounded-md border border-white/10 focus:border-lavender-500/50 focus:ring-1 focus:ring-lavender-400/30 outline-none transition-colors resize-none text-gray-800"
                  value={newTopicContent}
                  onChange={(e) => setNewTopicContent(e.target.value)}
                />
                <div className="absolute right-2 bottom-2 text-xs text-gray-500">{newTopicContent.length}/500</div>
              </div>

              <div className="flex items-center">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Target className="h-3.5 w-3.5 text-lavender-500/60" />
                  </div>
                  <Input
                    placeholder="Tags (comma separated)"
                    className="pl-10 text-sm bg-white/5 dark:bg-black/20 border-white/10"
                    value={newTopicTags}
                    onChange={(e) => setNewTopicTags(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">Use tags to help others find your topic</div>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1 text-xs bg-gradient-to-r from-lavender-300 to-lavender-500 hover:from-lavender-400 hover:to-lavender-600 text-white"
                  onClick={handleCreateTopic}
                  disabled={!newTopicTitle.trim() || !newTopicContent.trim()}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Post Topic
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category tabs - Enhanced with Levl UI/UX */}
      <div className="flex overflow-x-auto pb-2 -mx-1 px-1 hide-scrollbar space-x-2 mb-2 relative">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-lavender-400/30 to-transparent"></div>

        {categories.map((category) => (
          <motion.button
            key={category.id}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all duration-300 flex items-center relative ${
              activeCategory === category.id
                ? "bg-gradient-to-r from-lavender-400 to-lavender-600 text-white shadow-lg shadow-lavender-400/20"
                : "bg-white/90 text-gray-700 hover:bg-lavender-50 border border-lavender-200/70"
            }`}
            onClick={() => setActiveCategory(category.id)}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="mr-1.5">{category.icon}</span>
            {category.name}
            {activeCategory === category.id && (
              <>
                <span className="ml-1.5 flex items-center">
                  <motion.div
                    className="h-1.5 w-1.5 rounded-full bg-white"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                  />
                </span>
                <motion.div
                  className="absolute inset-0 rounded-full opacity-0"
                  animate={{
                    boxShadow: [
                      "0 0 0px 0px rgba(147, 112, 219, 0)",
                      "0 0 8px 2px rgba(147, 112, 219, 0.3)",
                      "0 0 0px 0px rgba(147,  112, 219, 0)",
                    ],
                    opacity: [0, 0.7, 0],
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </>
            )}
          </motion.button>
        ))}
      </div>

      {/* Trending Topics - Enhanced with Levl UI/UX */}
      <div className="flex flex-col p-6 rounded-xl border bg-card text-card-foreground transition-all group relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] mb-3">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-lavender-400/10 to-transparent rounded-bl-full transform transition-transform duration-700 group-hover:scale-110"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-lavender-500/15 to-transparent rounded-tr-full transform transition-transform duration-700 group-hover:scale-110"></div>
        <div
          className="absolute inset-0 opacity-30 transition-opacity duration-500"
          style={{
            background: "radial-gradient(circle at 30% 20%, rgba(233,213,255,0.2) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>

        {/* Animated accent line */}
        <div className="absolute h-[2px] w-1/3 bg-gradient-to-r from-transparent via-lavender-400/60 to-transparent top-0 left-0 animate-shimmer"></div>

        <div className="flex items-center justify-between mb-3 relative z-10">
          <h4 className="text-sm font-semibold text-gray-800 flex items-center">
            <div className="h-6 w-6 rounded-full bg-gradient-to-r from-lavender-300 to-lavender-400 flex items-center justify-center mr-2 shadow-sm shadow-lavender-300/30">
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Trending Discussions
            </span>
          </h4>
          <motion.button
            whileHover={{ scale: 1.05, x: 2 }}
            whileTap={{ scale: 0.95 }}
            className="text-xs text-lavender-600 flex items-center font-medium px-2 py-1 rounded-full bg-lavender-50/80 border border-lavender-200/50 hover:bg-lavender-100/80 transition-colors duration-200"
          >
            View All <ArrowRight className="h-3 w-3 ml-1" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {[
            {
              title: "Best drill bits for different wall materials",
              views: 342,
              hot: true,
              time: "3h ago",
              replies: 18,
            },
            {
              title: "Top-rated paint brands for bathroom humidity",
              views: 289,
              hot: false,
              time: "5h ago",
              replies: 12,
            },
            { title: "Cable management solutions for mounted TVs", views: 215, hot: false, time: "1d ago", replies: 9 },
            { title: "Most durable anchors for heavy mirrors", views: 198, hot: true, time: "2d ago", replies: 14 },
          ].map((topic, i) => (
            <motion.div
              key={i}
              className="group/card cursor-pointer bg-white/70 hover:bg-white rounded-lg p-3 border border-lavender-200/30 hover:border-lavender-300/50 transition-all duration-200 relative overflow-hidden"
              whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(147, 51, 234, 0.08)" }}
            >
              {/* Card accent */}
              <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-lavender-300/40 via-lavender-400/20 to-lavender-300/40 rounded-l-lg"></div>

              <div className="flex justify-between items-start pl-2">
                <div className="text-sm text-gray-800 group-hover/card:text-lavender-700 transition-colors line-clamp-1 font-medium">
                  {topic.title}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pl-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center text-xs text-gray-500">
                    <Eye className="h-3 w-3 mr-1 text-lavender-400" />
                    <span>{topic.views}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <MessageSquare className="h-3 w-3 mr-1 text-lavender-400" />
                    <span>{topic.replies}</span>
                  </div>
                </div>

                <div className="flex items-center">
                  {topic.hot && (
                    <span className="mr-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-lavender-100 text-lavender-700 font-medium">
                      <TrendingUp className="h-2 w-2 mr-0.5" /> Hot
                    </span>
                  )}
                  <div className="text-xs text-gray-400">{topic.time}</div>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-lavender-300 to-lavender-400 transform scale-x-0 group-hover/card:scale-x-100 transition-transform duration-300 origin-left"></div>
            </motion.div>
          ))}
        </div>

        {/* Add this to your globals.css or inline style */}
        <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-shimmer {
          animation: shimmer 6s infinite;
        }
      `}</style>
      </div>

      {/* Topics list */}
      <div className="space-y-4 mb-8">
        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className={`${
                viewMode === "card" ? "p-6" : "p-5"
              } flex flex-col rounded-xl border bg-card text-card-foreground cursor-pointer group relative overflow-visible bg-gradient-to-br from-lavender-50/95 via-white/90 to-lavender-100/90 backdrop-blur-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),0_10px_20px_-5px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.05)] border-t border-l border-r border-lavender-200/70 dark:border-t dark:border-l dark:border-r dark:border-lavender-700/40 border-b-2 border-b-lavender-300/80 dark:border-b-2 dark:border-b-lavender-700/80 transform translate-y-0 translateZ-0 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] ${activeTopic === topic.id ? "border-lavender-400/60 bg-lavender-50/40" : "hover:border-lavender-300/60"}
${viewMode === "card" ? "min-h-[240px]" : "min-h-[120px]"}`}
              onClick={() => setActiveTopic(activeTopic === topic.id ? null : topic.id)}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-lavender-400/10 to-transparent rounded-bl-full transform transition-transform duration-700 group-hover:scale-110"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-lavender-500/10 to-transparent rounded-tr-full transform transition-transform duration-700 group-hover:scale-110"></div>

              {/* Animated accent line */}
              <div
                className={`absolute h-[3px] w-1/2 bg-gradient-to-r from-transparent via-lavender-500/70 to-transparent top-0 left-0 ${activeTopic === topic.id ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
              ></div>

              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_10px_10px,rgba(var(--primary-rgb),0.4)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

              {/* Bookmark button with enhanced styling */}
              <div
                className="absolute top-3 right-3 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleBookmark(topic.id)
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.2, rotate: userBookmarks.includes(topic.id) ? 0 : 20 }}
                  whileTap={{ scale: 0.9 }}
                  className={`h-8 w-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                    userBookmarks.includes(topic.id)
                      ? "bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-md shadow-yellow-200/30"
                      : "bg-white/80 hover:bg-white shadow-sm hover:shadow-md"
                  }`}
                >
                  <Star
                    className={`h-4 w-4 ${
                      userBookmarks.includes(topic.id)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-lavender-400 hover:text-lavender-500"
                    }`}
                  />
                </motion.button>
              </div>

              {viewMode === "card" ? (
                <>
                  <div className="flex justify-between items-start pr-8">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="text-base font-medium text-gray-800 group-hover:text-lavender-700 transition-colors duration-200">
                          {topic.title}
                        </div>
                        {topic.replies > 10 && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-lavender-100 text-lavender-700 rounded-full flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" /> Hot
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {topic.tags.map((tag) => (
                          <div
                            key={tag}
                            className="px-2.5 py-0.5 rounded-full bg-white/80 text-xs flex items-center text-lavender-700 font-medium border border-lavender-200/70 shadow-sm hover:bg-lavender-50 hover:border-lavender-300/70 transition-all duration-200"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-lavender-400 mr-1.5"></span>
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="text-gray-500 font-medium">{topic.lastActive}</div>
                      <div className="flex items-center justify-end mt-1.5 space-x-3">
                        <div className="flex items-center px-2 py-1 rounded-full bg-white/70 border border-lavender-200/50 shadow-sm">
                          <MessageSquare className="h-3 w-3 mr-1 text-lavender-500" />
                          <span className="text-gray-700 font-medium">{topic.replies}</span>
                        </div>
                        <div className="flex items-center px-2 py-1 rounded-full bg-white/70 border border-lavender-200/50 shadow-sm">
                          <ThumbsUp className="h-3 w-3 mr-1 text-lavender-500" />
                          <span className="text-gray-700 font-medium">{topic.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview text with enhanced styling */}
                  <div className="mt-4 text-sm text-gray-600 leading-relaxed bg-white/50 p-3 rounded-lg border border-lavender-100/50 hover:bg-white/80 transition-all duration-200">
                    <p className="md:line-clamp-2 line-clamp-none">{topic.preview}</p>
                  </div>

                  {/* Author info with enhanced styling */}
                  <div
                    className="flex items-center mt-5 pt-4 border-t border-lavender-200/30"
                    onMouseEnter={() => setShowUserTooltip(topic.id)}
                    onMouseLeave={() => setShowUserTooltip(null)}
                  >
                    <div className="relative">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-r from-lavender-300 to-lavender-400 flex items-center justify-center text-sm font-bold text-white border border-lavender-200/50 shadow-md">
                        {topic.author.charAt(0)}
                      </div>

                      {/* User tooltip with enhanced styling */}
                      {showUserTooltip === topic.id && (
                        <motion.div
                          className="absolute bottom-full left-0 mb-2 w-60 bg-white rounded-lg shadow-xl p-4 z-50 border border-lavender-200"
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2, type: "spring", stiffness: 500 }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-lavender-400 to-lavender-500 flex items-center justify-center text-base font-bold text-white shadow-md">
                              {topic.author.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center font-medium text-gray-800">
                                {topic.author}
                                <ReviewStarBadge authorName={topic.author} />
                              </div>
                              <div className="text-xs text-gray-500">Member since 2023</div>
                              <div className="flex items-center mt-2 text-xs text-gray-600">
                                <div className="flex items-center bg-lavender-50 px-2 py-1 rounded-full">
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                                  <span>4.8</span>
                                </div>
                                <span className="mx-1.5">•</span>
                                <div className="flex items-center bg-lavender-50 px-2 py-1 rounded-full">
                                  <MessageSquare className="h-3 w-3 text-lavender-500 mr-1" />
                                  <span>42 topics</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-b border-r border-lavender-200 transform rotate-45"></div>
                        </motion.div>
                      )}
                    </div>
                    <div className="ml-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">{topic.author}</span>
                        <ReviewStarBadge authorName={topic.author} />
                      </div>
                      <div className="text-xs text-gray-500">Active contributor</div>
                    </div>
                  </div>

                  {/* Expanded topic with responses - enhanced styling */}
                  {activeTopic === topic.id && (
                    <div className="mt-5 pt-5 border-t border-lavender-200/30">
                      <div className="space-y-4 mt-2 overflow-visible">
                        {topic.responses && topic.responses.length > 0 ? (
                          <>
                            {(expandedComments[topic.id]
                              ? topic.responses
                              : topic.responses.slice(0, 3)
                            ).map((response, index) => (
                              <div
                                key={index}
                                className="bg-white/80 rounded-lg p-4 shadow-sm border border-lavender-100/50"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center">
                                      <div className="h-7 w-7 rounded-full bg-gradient-to-r from-lavender-300 to-lavender-400 flex items-center justify-center text-sm font-bold text-white border border-lavender-200/50 shadow-md mr-2">
                                        {response.author.charAt(0)}
                                      </div>
                                      <span className="text-sm font-medium text-gray-700">{response.author}</span>
                                      <ReviewStarBadge authorName={response.author} />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{response.time}</div>
                                    <div className="mt-2 text-gray-600">{response.content}</div>
                                  </div>
                                  <div className="flex items-center">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className={`flex items-center px-2 py-1 rounded-full transition-colors duration-200 ${
                                        userVotes[`${topic.id}-${index}`]?.up
                                          ? "bg-lavender-100 text-lavender-700"
                                          : "bg-white/70 text-gray-600 hover:bg-lavender-50"
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleVote(topic.id, index, "up")
                                      }}
                                    >
                                      <ThumbsUp className="h-3 w-3 mr-1" />
                                      <span>{response.likes}</span>
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className={`ml-2 flex items-center px-2 py-1 rounded-full transition-colors duration-200 ${
                                        userVotes[`${topic.id}-${index}`]?.down
                                          ? "bg-red-100 text-red-700"
                                          : "bg-white/70 text-gray-600 hover:bg-red-50"
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleVote(topic.id, index, "down")
                                      }}
                                    >
                                      <ThumbsUp className="h-3 w-3 mr-1 transform rotate-180" />
                                    </motion.button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {topic.responses.length > 3 && !expandedComments[topic.id] && (
                              <button
                                className="w-full py-2.5 text-sm font-medium text-lavender-600 hover:text-lavender-700 bg-lavender-50/80 hover:bg-lavender-100/80 rounded-lg border border-lavender-200/50 transition-all duration-200 flex items-center justify-center gap-1.5"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setExpandedComments((prev) => ({ ...prev, [topic.id]: true }))
                                }}
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                Show {topic.responses.length - 3} more {topic.responses.length - 3 === 1 ? "reply" : "replies"}
                              </button>
                            )}
                            {topic.responses.length > 3 && expandedComments[topic.id] && (
                              <button
                                className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-gray-600 bg-gray-50/80 hover:bg-gray-100/80 rounded-lg border border-gray-200/50 transition-all duration-200 flex items-center justify-center gap-1.5"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setExpandedComments((prev) => ({ ...prev, [topic.id]: false }))
                                }}
                              >
                                Show less
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="text-gray-500">No responses yet. Be the first to reply!</div>
                        )}
                      </div>

                      {/* Reply input */}
                      <div className="mt-5">
                        <textarea
                          placeholder="Write your reply..."
                          className="w-full h-20 px-3 py-2 text-sm bg-white/5 dark:bg-black/20 rounded-md border border-white/10 focus:border-lavender-500/50 focus:ring-1 focus:ring-lavender-400/30 outline-none transition-colors resize-none text-gray-800"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="gap-1 text-xs bg-gradient-to-r from-lavender-300 to-lavender-500 hover:from-lavender-400 hover:to-lavender-600 text-white"
                            onClick={() => handleReply(topic.id)}
                            disabled={!replyContent.trim()}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Post Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-base font-medium text-gray-800 group-hover:text-lavender-700 transition-colors duration-200">
                      {topic.title}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-1">{topic.preview}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-gray-500 font-medium">{topic.lastActive}</div>
                    <div className="flex items-center justify-end mt-1.5 space-x-3">
                      <div className="flex items-center px-2 py-1 rounded-full bg-white/70 border border-lavender-200/50 shadow-sm">
                        <MessageSquare className="h-3 w-3 mr-1 text-lavender-500" />
                        <span className="text-gray-700 font-medium">{topic.replies}</span>
                      </div>
                      <div className="flex items-center px-2 py-1 rounded-full bg-white/70 border border-lavender-200/50 shadow-sm">
                        <ThumbsUp className="h-3 w-3 mr-1 text-lavender-500" />
                        <span className="text-gray-700 font-medium">{topic.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-gray-500">No topics found.</div>
        )}
        {isLoading && <div className="text-center">Loading more topics...</div>}
        {!isLoading && filteredTopics.length > 0 && (
          <div className="text-center">
            <Button variant="outline" onClick={loadMoreTopics}>
              Load More Topics
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
