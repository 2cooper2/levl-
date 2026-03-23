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

// Seeded review ratings per author - whole numbers 1-5, mix of high and low counts
const authorReviewData: Record<string, { rating: number; reviewCount: number }> = {
  ToolEnthusiast: { rating: 4, reviewCount: 230 },
  HandyPro: { rating: 5, reviewCount: 1187 },
  DIYQueen: { rating: 5, reviewCount: 894 },
  FurnitureNewbie: { rating: 2, reviewCount: 14 },
  AssemblyExpert: { rating: 5, reviewCount: 1312 },
  DIYEnthusiast: { rating: 4, reviewCount: 117 },
  CarefulPacker: { rating: 3, reviewCount: 39 },
  MoveCoordinator: { rating: 5, reviewCount: 756 },
  AntiquesCollector: { rating: 4, reviewCount: 342 },
  DecorLover: { rating: 3, reviewCount: 26 },
  HardwareSpecialist: { rating: 5, reviewCount: 1245 },
  CleanFreak: { rating: 3, reviewCount: 41 },
  CleaningPro: { rating: 5, reviewCount: 803 },
  DIYPlumber: { rating: 4, reviewCount: 128 },
  PlumbingExpert: { rating: 5, reviewCount: 2389 },
  PaintingNewbie: { rating: 2, reviewCount: 12 },
  PaintContractor: { rating: 5, reviewCount: 1274 },
  DIYMounter: { rating: 3, reviewCount: 54 },
  ContractorPro: { rating: 5, reviewCount: 1628 },
  SpacePlanner: { rating: 4, reviewCount: 231 },
  InteriorDesigner: { rating: 5, reviewCount: 967 },
  CableHater: { rating: 2, reviewCount: 15 },
  AVInstaller: { rating: 5, reviewCount: 1198 },
  GreenThumb: { rating: 4, reviewCount: 122 },
  LandscaperPro: { rating: 5, reviewCount: 2341 },
  WFHWarrior: { rating: 4, reviewCount: 237 },
  OrganizationConsultant: { rating: 5, reviewCount: 489 },
  ToolNewbie: { rating: 2, reviewCount: 8 },
  RenovationRookie: { rating: 3, reviewCount: 28 },
  DogOwner: { rating: 4, reviewCount: 119 },
  You: { rating: 4, reviewCount: 52 },
  MilwaukeeFan: { rating: 5, reviewCount: 1421 },
  BudgetBuilder: { rating: 3, reviewCount: 65 },
  IKEAVeteran: { rating: 5, reviewCount: 876 },
  FirstTimer: { rating: 2, reviewCount: 7 },
  MovingDay: { rating: 4, reviewCount: 363 },
  BubbleWrapKing: { rating: 5, reviewCount: 584 },
  WallMaster: { rating: 5, reviewCount: 1152 },
  HomeRenovator: { rating: 5, reviewCount: 2508 },
  ShowerGuru: { rating: 4, reviewCount: 347 },
  SparkleQueen: { rating: 3, reviewCount: 42 },
  PipeWizard: { rating: 5, reviewCount: 1467 },
  WeekendWarrior: { rating: 4, reviewCount: 238 },
  EdgeMaster: { rating: 5, reviewCount: 1329 },
  RollerPro: { rating: 4, reviewCount: 491 },
  DrillSergeant: { rating: 5, reviewCount: 2553 },
  MasonryMike: { rating: 5, reviewCount: 667 },
  RoomPlanner: { rating: 4, reviewCount: 312 },
  TinySpaceLiving: { rating: 3, reviewCount: 89 },
  TechMountPro: { rating: 5, reviewCount: 1372 },
  NeatFreak: { rating: 4, reviewCount: 255 },
  TurfBuilder: { rating: 5, reviewCount: 1289 },
  ShadeLawnGuy: { rating: 3, reviewCount: 78 },
  DeskMinimalist: { rating: 5, reviewCount: 543 },
  ProductivityNerd: { rating: 3, reviewCount: 61 },
}

function getAuthorReview(name: string) {
  if (authorReviewData[name]) return authorReviewData[name]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  const rating = (Math.abs(hash) % 5) + 1
  const reviewCount = Math.abs(hash) % 500 + 10
  return { rating: Math.min(rating, 5), reviewCount }
}

function ReviewStarBadge({ authorName }: { authorName: string }) {
  const { rating, reviewCount } = getAuthorReview(authorName)

  return (
    <span className="inline-flex items-center gap-1 ml-1.5">
      <span
        className="relative inline-flex items-center justify-center"
        style={{
          width: 24,
          height: 24,
          filter: "drop-shadow(0 2px 3px rgba(124, 58, 237, 0.5)) drop-shadow(0 1px 1px rgba(124, 58, 237, 0.3))",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={`sg-${authorName}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="40%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>
            <linearGradient id={`ss-${authorName}`} x1="20%" y1="0%" x2="80%" y2="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <path
            d="M12 2L14.9 8.6L22 9.3L16.8 14L18.2 21L12 17.5L5.8 21L7.2 14L2 9.3L9.1 8.6L12 2Z"
            fill={`url(#sg-${authorName})`}
            stroke="#5B21B6"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          <path
            d="M12 2L14.9 8.6L22 9.3L16.8 14L18.2 21L12 17.5L5.8 21L7.2 14L2 9.3L9.1 8.6L12 2Z"
            fill={`url(#ss-${authorName})`}
          />
          <path
            d="M12 5L13.8 9L18 9.4L14.9 12.2L15.7 16.5L12 14.4L8.3 16.5L9.1 12.2L6 9.4L10.2 9L12 5Z"
            fill="rgba(255,255,255,0.1)"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-black text-white"
          style={{
            fontSize: 11,
            lineHeight: 1,
            paddingTop: 1,
            textShadow: "0 1px 2px rgba(0,0,0,0.35)",
          }}
        >
          {rating}
        </span>
      </span>
      <span className="text-xs font-bold" style={{ color: "#7C3AED" }}>
        ({reviewCount.toLocaleString()})
      </span>
    </span>
  )
}

// Define forumTopics
const forumTopics = [
  {
    id: 1,
    title: "What drill are you guys running on residential jobs under $150?",
    author: "ToolEnthusiast",
    replies: 14,
    likes: 32,
    lastActive: "2 hours ago",
    tags: ["tools", "power-tools", "recommendations"],
    preview:
      "Need a solid backup drill for lighter residential work - hanging fixtures, cabinet installs, general repairs. Something with decent battery life that I can toss in the van without worrying about it. What are you guys running?",
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
        author: "MilwaukeeFan",
        time: "45 minutes ago",
        content:
          "Milwaukee M18 Fuel is hands down the best in that range. More torque than DeWalt, and the brushless motor means it'll last you a decade. I've used mine on everything from drywall to deck screws.",
        likes: 11,
      },
      {
        author: "BudgetBuilder",
        time: "20 minutes ago",
        content:
          "Honestly, for under $150 the Ryobi ONE+ is underrated. Not as powerful as the big brands, but the battery works with 200+ tools in their system. Great starter ecosystem.",
        likes: 3,
      },
      {
        author: "ContractorPro",
        time: "15 minutes ago",
        content:
          "Whatever you pick, make sure you get one with a brushless motor. They run cooler, last longer, and deliver more consistent power. The extra $20-30 is always worth it.",
        likes: 6,
      },
      {
        author: "DrillSergeant",
        time: "10 minutes ago",
        content:
          "I test drills for a living. At the $150 price point, the Makita XFD131 is unbeatable for precision work. Lighter than Milwaukee, better chuck than DeWalt. The variable speed trigger is the smoothest I've used.",
        likes: 14,
      },
      {
        author: "HomeRenovator",
        time: "10 minutes ago",
        content:
          "One thing nobody mentions: get a drill with a built-in LED light. When you're working inside cabinets or under sinks, that light is a lifesaver. Both DeWalt and Milwaukee have great ones.",
        likes: 7,
      },
      {
        author: "WallMaster",
        time: "8 minutes ago",
        content:
          "If you're going to be drilling into masonry at all, spend the extra and get a hammer drill combo. The DeWalt DCD996 is just above your budget but it does everything - wood, metal, and concrete.",
        likes: 9,
      },
      {
        author: "WeekendWarrior",
        time: "5 minutes ago",
        content:
          "Bought the Ryobi based on this thread two months ago. No regrets. Already added the circular saw and impact driver to the collection. The battery ecosystem argument is real.",
        likes: 4,
      },
      {
        author: "FirstTimer",
        time: "3 minutes ago",
        content:
          "This is so helpful! Going with the DeWalt 20V MAX. Quick question though - should I get the kit with two batteries or is one enough to start?",
        likes: 1,
      },
    ],
  },
  {
    id: 2,
    title: "Fastest way to knock out flat-pack furniture assembly jobs?",
    author: "FurnitureNewbie",
    replies: 8,
    likes: 15,
    lastActive: "3 days ago",
    tags: ["assembly", "furniture", "tools"],
    preview:
      "Getting more clients asking for IKEA and flat-pack assembly. What's your workflow to get through these fast without callbacks? Any tools that speed things up beyond the basic Allen key?",
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
        author: "IKEAVeteran",
        time: "2 days ago",
        content:
          "I've assembled over 50 IKEA pieces. My biggest tip: lay out ALL the parts and check the inventory list first. Nothing worse than getting halfway through and finding a missing dowel. Also, wood glue on cam locks makes them rock solid.",
        likes: 14,
      },
      {
        author: "FirstTimer",
        time: "2 days ago",
        content:
          "Just did my first KALLAX and it took me 3 hours lol. Wish I'd read this thread first. The electric screwdriver tip is gold.",
        likes: 1,
      },
      {
        author: "HomeRenovator",
        time: "1 day ago",
        content:
          "Pro tip: build everything on a large piece of cardboard. Protects your floors and makes it easy to slide the finished piece into position. Also invest in a right-angle drill attachment for tight spots.",
        likes: 9,
      },
      {
        author: "DrillSergeant",
        time: "1 day ago",
        content:
          "Biggest mistake people make: overtightening cam locks. They only need a quarter turn once they click. Overtighten and you strip the particle board. Also, never use a power drill on cam locks.",
        likes: 6,
      },
      {
        author: "ContractorPro",
        time: "20 hours ago",
        content:
          "For the PAX wardrobes specifically - build them on the floor then tilt up. Way easier than trying to build vertically. Get a friend to help with the tilt, those things are heavy.",
        likes: 10,
      },
      {
        author: "MovingDay",
        time: "18 hours ago",
        content:
          "If you have multiple pieces, assemble them in order of complexity. Start with the easiest one to build confidence. KALLAX is great for beginners, save the PAX or BESTA for last.",
        likes: 3,
      },
      {
        author: "WallMaster",
        time: "15 hours ago",
        content:
          "Always anchor tall furniture to the wall. IKEA includes the hardware for a reason. I've seen a fully loaded KALLAX topple over - not pretty. Takes 5 minutes and could save a life.",
        likes: 15,
      },
      {
        author: "BudgetBuilder",
        time: "12 hours ago",
        content:
          "Hot tip: check the as-is section at IKEA for display models that are already assembled. Got a HEMNES dresser for 60% off. Just had to disassemble and reassemble at home.",
        likes: 2,
      },
    ],
  },
  {
    id: 3,
    title: "How are you guys packing fragile items on moving jobs?",
    author: "CarefulPacker",
    replies: 5,
    likes: 10,
    lastActive: "1 week ago",
    tags: ["moving", "packing", "fragile"],
    preview:
      "Had a claim last month for a broken antique vase during a residential move. Need to tighten up my packing process for fragile items. What materials and techniques are you running to avoid damage callbacks?",
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
          "Packing peanuts are messy and shift around. Use crumpled packing paper to fill voids instead - it stays in place better. For plates, stack vertically like records, not flat. They're much stronger on their edge.",
        likes: 7,
      },
      {
        author: "BubbleWrapKing",
        time: "5 days ago",
        content:
          "Forget regular bubble wrap - get the self-sealing bubble pouches. They save so much time. I moved 200+ wine glasses across the country with zero breaks using them plus cell divider boxes.",
        likes: 12,
      },
      {
        author: "FirstTimer",
        time: "4 days ago",
        content:
          "Would regular towels and t-shirts work for wrapping dishes? Trying to save money on packing materials for my first move.",
        likes: 0,
      },
      {
        author: "HomeRenovator",
        time: "3 days ago",
        content:
          "Towels and t-shirts work great for casual moves! Just make sure there's padding between every item. Pro tip: stuff socks inside glasses and mugs for extra cushioning from the inside out.",
        likes: 8,
      },
      {
        author: "MoveCoordinator",
        time: "3 days ago",
        content:
          "For anyone moving long distance: label fragile boxes on ALL sides, not just the top. Movers stack boxes and if they can't see the label from every angle, your grandmother's china might end up under 50lbs of books.",
        likes: 12,
      },
      {
        author: "HandyPro",
        time: "2 days ago",
        content:
          "Dish barrel boxes from U-Haul are worth every penny. Double-walled and extra tall so you can pack plates vertically with dividers. Spent $15 on boxes and saved thousands in potential breakage.",
        likes: 5,
      },
      {
        author: "WeekendWarrior",
        time: "2 days ago",
        content:
          "We wrapped everything in packing paper, then put it in the dishwasher racks - the racks act as perfect dividers. Moved an entire kitchen with zero breaks using this method.",
        likes: 4,
      },
      {
        author: "CleaningPro",
        time: "1 day ago",
        content:
          "Don't forget about your bathroom! Mirrors, perfume bottles, and ceramic soap dispensers are just as fragile. I use the same packing techniques for bathroom items as I do for kitchen.",
        likes: 2,
      },
    ],
  },
  {
    id: 4,
    title: "What anchors are you trusting for 40lb+ mounts on drywall?",
    author: "DecorLover",
    replies: 4,
    likes: 6,
    lastActive: "5 days ago",
    tags: ["mounting", "hardware", "drywall"],
    preview:
      "Got a job tomorrow - client wants a 40lb decorative mirror centered on a wall with no studs behind it. What anchors are you guys using for heavy drywall-only mounts? Can't afford a callback on this one.",
    responses: [
      {
        author: "HardwareSpecialist",
        time: "5 days ago",
        content:
          "Toggle bolts are your best option for heavy items on drywall. The TOGGLER SnapSkru has a 65lb rating per anchor - I'd use at least two for your mirror.",
        likes: 3,
      },
      {
        author: "WallMaster",
        time: "4 days ago",
        content:
          "For 40 lbs you definitely want snap toggles, not plastic anchors. I've seen too many mirrors crash down from cheap drywall anchors. Also use a level and measure twice - a crooked heavy mirror is a pain to reposition.",
        likes: 8,
      },
      {
        author: "HomeRenovator",
        time: "4 days ago",
        content:
          "If you can reach even one stud, use a French cleat system. One side on the stud, the other side with toggle bolts. Distributes weight evenly and makes it easy to level. I hang all my heavy pieces this way.",
        likes: 15,
      },
      {
        author: "BudgetBuilder",
        time: "3 days ago",
        content:
          "I used the 3M Command strips rated for 16lbs each - used 4 of them for a 30lb mirror and it's been fine for 6 months. Probably not ideal for 40lbs though.",
        likes: 2,
      },
      {
        author: "DrillSergeant",
        time: "2 days ago",
        content:
          "Use a stud finder with AC wire detection. Last thing you want is to drill into an electrical wire. The Franklin ProSensor is the most accurate consumer stud finder I've tested.",
        likes: 11,
      },
      {
        author: "MasonryMike",
        time: "2 days ago",
        content:
          "If your wall is plaster over lath (common in older homes), toggle bolts won't work the same. You need molly bolts designed for plaster or find the wood lath strips behind. Knock on the wall - plaster sounds different than drywall.",
        likes: 7,
      },
      {
        author: "IKEAVeteran",
        time: "1 day ago",
        content:
          "IKEA sells anti-tip wall anchors that work great for mirrors too. They come with the hardware and a template. I've hung 3 heavy mirrors with them, all still solid after 2 years.",
        likes: 4,
      },
      {
        author: "AntiquesCollector",
        time: "1 day ago",
        content:
          "For antique or ornate mirrors, consider a picture rail system. No holes in the wall at all - the mirror hangs from a rail at the ceiling. Adjustable height and easy to reposition. Museums use this method.",
        likes: 9,
      },
      {
        author: "FirstTimer",
        time: "22 hours ago",
        content:
          "Update: used toggle bolts as suggested + found one stud. Mirror has been up for a week and feels rock solid. Thanks everyone!",
        likes: 6,
      },
    ],
  },
  {
    id: 5,
    title: "What's actually cutting through hard water on shower glass for you guys?",
    author: "CleanFreak",
    replies: 7,
    likes: 12,
    lastActive: "2 days ago",
    tags: ["cleaning", "bathroom", "glass"],
    preview:
      "Client keeps calling me back about cloudy shower glass after a bathroom reno. I've tried vinegar solutions but they're not cutting it on heavy mineral buildup. What products are you guys actually using on jobs?",
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
          "Bar Keeper's Friend makes a spray specifically for glass shower doors. It cuts through hard water like nothing else. Apply, wait 5 minutes, wipe. For prevention, apply Rain-X to your shower glass - water just beads off.",
        likes: 9,
      },
      {
        author: "SparkleQueen",
        time: "1 day ago",
        content:
          "I tried the vinegar thing and it didn't really work for me. Ended up buying a magic eraser and that was way easier honestly. Not sure if it scratches glass though?",
        likes: 1,
      },
      {
        author: "HomeRenovator",
        time: "1 day ago",
        content:
          "Magic erasers are fine on glass but they wear out fast on textured surfaces. For heavy mineral buildup, get a pumice stone specifically made for glass - they work incredibly well and won't scratch tempered glass.",
        likes: 7,
      },
      {
        author: "HandyPro",
        time: "1 day ago",
        content:
          "Prevention is key. After every shower, hit the glass with a squeegee - takes 30 seconds. I haven't had to deep clean my shower glass in 6 months since starting this habit.",
        likes: 10,
      },
      {
        author: "PlumbingExpert",
        time: "20 hours ago",
        content:
          "Hard water is the root cause. If you're constantly fighting buildup, consider a whole-house water softener or at least a shower head filter. Fixes the problem at the source rather than treating symptoms.",
        likes: 13,
      },
      {
        author: "BubbleWrapKing",
        time: "18 hours ago",
        content:
          "Dryer sheets! Seriously. Wet a dryer sheet and rub the glass - the anti-static coating repels water and prevents spots. Cheap and works surprisingly well between deep cleans.",
        likes: 3,
      },
      {
        author: "NeatFreak",
        time: "15 hours ago",
        content:
          "I use a daily shower spray (Method brand) right after showering. Just spray and walk away, no wiping. Combined with a monthly deep clean, my glass stays crystal clear. Way easier than waiting for buildup.",
        likes: 6,
      },
      {
        author: "DIYQueen",
        time: "12 hours ago",
        content:
          "For anyone with really bad hard water stains that nothing else removes: CLR (Calcium Lime Rust) remover. Apply with a sponge, wait 2 minutes, wipe off. Night and day difference. Just ventilate well.",
        likes: 8,
      },
    ],
  },
  {
    id: 6,
    title: "What's in your plumbing tool bag for residential service calls?",
    author: "DIYPlumber",
    replies: 9,
    likes: 18,
    lastActive: "1 day ago",
    tags: ["plumbing", "tools", "repairs"],
    preview:
      "Expanding into basic plumbing repairs - faucet swaps, drain clearing, p-trap replacements. What tools are you guys keeping in the van for standard residential plumbing calls? Trying to build out my kit.",
    responses: [
      {
        author: "PlumbingExpert",
        time: "1 day ago",
        content:
          "Must-haves: adjustable wrench, pipe wrench, basin wrench, plunger, drain snake, plumber's tape, and a good set of screwdrivers. Add channel locks and a hacksaw for plastic pipes.",
        likes: 7,
      },
      {
        author: "PipeWizard",
        time: "1 day ago",
        content:
          "Don't forget a headlamp and a bucket! You'll be working in dark cabinets and water WILL spill. Also get a tube of plumber's grease - makes reassembly of faucet cartridges so much easier.",
        likes: 11,
      },
      {
        author: "WeekendWarrior",
        time: "20 hours ago",
        content:
          "I'd add a toilet auger to that list. Different from a regular drain snake and specifically designed for toilet clogs. Saved me a $200 plumber visit last month.",
        likes: 4,
      },
      {
        author: "BudgetBuilder",
        time: "18 hours ago",
        content:
          "YouTube is your best friend for plumbing. Watch the repair video BEFORE you start taking things apart. Ask me how I know lol.",
        likes: 6,
      },
      {
        author: "HomeRenovator",
        time: "16 hours ago",
        content:
          "Add a propane torch and solder to that list if you have copper pipes. Learning to sweat a copper joint takes 10 minutes and saves you hundreds vs calling a plumber for every small repair.",
        likes: 8,
      },
      {
        author: "ShowerGuru",
        time: "14 hours ago",
        content:
          "A basin wrench is the most important tool nobody buys. Trying to tighten faucet nuts without one is pure torture. The Husky telescoping basin wrench from Home Depot is $15 and worth every cent.",
        likes: 11,
      },
      {
        author: "DrillSergeant",
        time: "12 hours ago",
        content:
          "Teflon tape tip: wrap it clockwise (when looking at the thread end-on). Most people wrap it the wrong direction and it unravels when you screw the fitting on. Also, 3-5 wraps is plenty.",
        likes: 14,
      },
      {
        author: "MasonryMike",
        time: "10 hours ago",
        content:
          "Know where your main water shutoff is BEFORE you start any plumbing project. Also, open faucets downstream to drain pressure before disconnecting anything. Learned that one the wet way.",
        likes: 5,
      },
      {
        author: "ContractorPro",
        time: "8 hours ago",
        content:
          "Invest in a good pair of channel locks (Channellock brand, made in USA). The cheap ones slip and round off fittings. My 430s have lasted 15 years of daily professional use.",
        likes: 9,
      },
    ],
  },
  {
    id: 7,
    title: "How are you cutting in clean lines without tape on paint jobs?",
    author: "PaintingNewbie",
    replies: 15,
    likes: 22,
    lastActive: "3 days ago",
    tags: ["painting", "techniques", "edges"],
    preview:
      "Taping every ceiling line is killing my time on interior jobs. I see experienced painters freehand cutting in perfect lines. What brush and technique are you using to get clean edges without tape?",
    responses: [
      {
        author: "PaintContractor",
        time: "3 days ago",
        content:
          'Use a 2-2.5" angled sash brush with quality bristles. Hold it like a pencil, load only the first 1/3 of bristles, and pull the brush along the edge with steady pressure. Practice makes perfect!',
        likes: 12,
      },
      {
        author: "EdgeMaster",
        time: "3 days ago",
        content:
          "The Wooster Shortcut is the best brush for cutting in, period. The angled handle gives you way more control. Also, slightly dampen the brush before loading paint - it flows much smoother along the edge.",
        likes: 18,
      },
      {
        author: "RollerPro",
        time: "2 days ago",
        content:
          "If you absolutely can't freehand, try the Accubrush edge painter. It's a roller with a shield that runs along the ceiling line. Not perfect, but way faster than tape for straight edges.",
        likes: 5,
      },
      {
        author: "FirstTimer",
        time: "2 days ago",
        content:
          "I've been practicing on cardboard boxes like someone suggested and it really does help. My lines are getting much cleaner after just 30 minutes of practice.",
        likes: 3,
      },
      {
        author: "HomeRenovator",
        time: "1 day ago",
        content:
          "The secret nobody tells you: slightly overlap your cut-in line with the roller. This blends the brush texture into the roller texture so you don't see where one ends and the other begins.",
        likes: 12,
      },
      {
        author: "MilwaukeeFan",
        time: "1 day ago",
        content:
          "Purdy XL Glide is the GOAT brush for cutting in. More expensive than the Wooster but the bristle tips are insanely fine. One coat coverage on every pass. Worth the $15 price tag.",
        likes: 7,
      },
      {
        author: "WallMaster",
        time: "20 hours ago",
        content:
          "Temperature matters. Paint too cold and it drags, too warm and it dries before you can work it. 65-75F is the sweet spot. I won't paint if the room is outside that range.",
        likes: 5,
      },
      {
        author: "DIYQueen",
        time: "16 hours ago",
        content:
          "For ceilings: paint the ceiling first, then cut in your wall color over any ceiling paint that got on the wall. Way easier than trying to cut a straight line looking up.",
        likes: 9,
      },
      {
        author: "DrillSergeant",
        time: "12 hours ago",
        content:
          "If you're painting multiple rooms the same color, don't clean your brush between rooms. Wrap it in plastic wrap or a wet paper towel. Saves time and your brush lasts longer.",
        likes: 4,
      },
    ],
  },
  {
    id: 8,
    title: "What bits and setup are you running for concrete anchor jobs?",
    author: "DIYMounter",
    replies: 6,
    likes: 9,
    lastActive: "4 days ago",
    tags: ["drilling", "concrete", "tools"],
    preview:
      "Got a commercial job with 50+ mounts into poured concrete walls. My regular hammer drill is burning through bits. What SDS+ setup and bits are you guys running for high-volume concrete work?",
    responses: [
      {
        author: "ContractorPro",
        time: "4 days ago",
        content:
          "You need carbide-tipped masonry bits and ideally a hammer drill. For occasional use, Bosch Multipurpose bits work well. For many holes, invest in a rotary hammer drill - your arms will thank you.",
        likes: 4,
      },
      {
        author: "DrillSergeant",
        time: "3 days ago",
        content:
          "SDS+ rotary hammer is the way to go for concrete. Night and day difference from a regular hammer drill. You can rent one from Home Depot for about $40/day if you don't want to buy. Bosch and Hilti make the best ones.",
        likes: 13,
      },
      {
        author: "MasonryMike",
        time: "3 days ago",
        content:
          "Important tip: use the right speed. Slower RPM with more hammer action for concrete. Fast RPM burns out bits. Also, pull the bit out periodically to clear dust from the hole - it reduces friction and heat.",
        likes: 8,
      },
      {
        author: "WeekendWarrior",
        time: "2 days ago",
        content:
          "Learned the hard way that you need a different anchor for concrete vs. drywall. Tapcon screws are great for concrete - they cut their own threads. Just make sure you drill the pilot hole the exact size specified.",
        likes: 5,
      },
      {
        author: "WallMaster",
        time: "1 day ago",
        content:
          "Wear a proper N95 mask when drilling concrete. Silica dust is no joke - it causes permanent lung damage. Also safety glasses. A piece of concrete in your eye will ruin your whole week.",
        likes: 16,
      },
      {
        author: "HomeRenovator",
        time: "1 day ago",
        content:
          "Tape a small ziplock bag below the drill point to catch dust. Or have someone hold a vacuum nozzle right next to the bit while you drill. Keeps cleanup minimal especially on finished walls.",
        likes: 6,
      },
      {
        author: "HandyPro",
        time: "20 hours ago",
        content:
          "For mounting TV brackets on concrete, use sleeve anchors instead of Tapcons. They have much higher shear strength which matters when you're hanging 50+ lbs that sticks out from the wall.",
        likes: 10,
      },
      {
        author: "BudgetBuilder",
        time: "18 hours ago",
        content:
          "The Harbor Freight SDS+ rotary hammer is surprisingly decent for occasional use. $50 vs $200+ for Bosch. Mine has done about 100 holes in concrete basement walls and still going strong.",
        likes: 3,
      },
      {
        author: "PlumbingExpert",
        time: "15 hours ago",
        content:
          "Before drilling into concrete floors, check for radiant heating pipes or embedded electrical conduit. A thermal camera or wire tracer can save you from a very expensive mistake.",
        likes: 8,
      },
    ],
  },
  {
    id: 9,
    title: "How are you handling measurement and layout for furniture install jobs?",
    author: "SpacePlanner",
    replies: 11,
    likes: 17,
    lastActive: "2 days ago",
    tags: ["furniture", "measuring", "planning"],
    preview:
      "Had a client order a sectional that didn't fit through their doorframe. Now I'm doing pre-purchase measuring as a service. What's your process for room measurement and furniture layout planning on jobs?",
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
          "The free app 'MagicPlan' lets you scan your room with your phone camera and creates a floor plan automatically. Then you can drag furniture templates into it. Saved me from buying a couch that was 4 inches too wide.",
        likes: 10,
      },
      {
        author: "TinySpaceLiving",
        time: "1 day ago",
        content:
          "Biggest mistake people make is not accounting for door swing and drawer pull-out space. That 36\" dresser needs 36\" of clearance in front of it. Use cardboard cutouts on the floor to simulate furniture before buying.",
        likes: 4,
      },
      {
        author: "MovingDay",
        time: "1 day ago",
        content:
          "Always measure the diagonal of doorways too, not just width and height. That's what determines if your sofa can actually get through. Had to return a beautiful sectional because of a 29\" doorframe.",
        likes: 7,
      },
      {
        author: "HomeRenovator",
        time: "1 day ago",
        content:
          "IKEA's online planner is free and surprisingly accurate for kitchen and bedroom layouts. You can drag real products into a 3D room model. Saved me from ordering a bed that wouldn't fit past my staircase.",
        likes: 11,
      },
      {
        author: "HandyPro",
        time: "20 hours ago",
        content:
          "Measure twice, buy once. Also account for baseboards - they add 0.5-0.75 inches. A king bed frame that technically fits your wall measurement might not actually fit once you account for baseboards on both sides.",
        likes: 8,
      },
      {
        author: "ContractorPro",
        time: "18 hours ago",
        content:
          "For open floor plans, use area rugs to define zones BEFORE buying furniture. Place the rugs first, then measure within those zones. Gives you a much better sense of scale than just tape on the floor.",
        likes: 5,
      },
      {
        author: "DIYQueen",
        time: "15 hours ago",
        content:
          "Don't forget ceiling height if you're buying tall bookcases or armoires. Standard is 8ft but older homes can be 7.5ft or less. Also measure ceiling fans and light fixtures that hang down.",
        likes: 6,
      },
      {
        author: "BudgetBuilder",
        time: "12 hours ago",
        content:
          "Facebook Marketplace tip: always ask for dimensions from the seller, and bring a tape measure. Listings are often wrong. Learned this after driving 45 minutes for a 'queen' bed frame that was actually full size.",
        likes: 3,
      },
    ],
  },
  {
    id: 10,
    title: "What cable management kits are you using for TV mount jobs?",
    author: "CableHater",
    replies: 8,
    likes: 14,
    lastActive: "6 days ago",
    tags: ["mounting", "cables", "organization"],
    preview:
      "Doing a lot of TV mounting jobs lately and clients always want clean cable runs. What in-wall cable management kits are you guys using that are code-compliant and fast to install?",
    responses: [
      {
        author: "AVInstaller",
        time: "6 days ago",
        content:
          "Legrand's in-wall power and cable management kits are excellent and code-compliant. They include everything you need and are fairly straightforward to install if you're comfortable cutting drywall.",
        likes: 6,
      },
      {
        author: "TechMountPro",
        time: "5 days ago",
        content:
          "One thing people miss: you can NOT run power cables through walls without a proper power bridge kit. It's an electrical code violation. HDMI and speaker wire are fine, but power needs a code-compliant solution like the PowerBridge TWO-CK.",
        likes: 14,
      },
      {
        author: "NeatFreak",
        time: "5 days ago",
        content:
          "If you don't want to cut into walls, the SimpleCord cable cover kit looks surprisingly clean. Paint it to match your wall color. My wife couldn't even tell which wall had the cables.",
        likes: 4,
      },
      {
        author: "HomeRenovator",
        time: "4 days ago",
        content:
          "Pro tip: run a pull string through the wall first using a fish tape. Then attach all your cables to it and pull them through at once. Saves you from fighting each cable through individually.",
        likes: 9,
      },
      {
        author: "ContractorPro",
        time: "3 days ago",
        content:
          "For renters who can't cut walls: get a flat HDMI cable and run it behind the baseboard. Pop the baseboard off, hot glue the cable to the wall, snap the baseboard back on. Completely invisible.",
        likes: 12,
      },
      {
        author: "DrillSergeant",
        time: "3 days ago",
        content:
          "Label every single cable before you hide it. Use a label maker or colored electrical tape. Future you will be incredibly thankful when you need to swap one cable out of a bundle of 8.",
        likes: 7,
      },
      {
        author: "WeekendWarrior",
        time: "2 days ago",
        content:
          "Velcro cable ties are way better than zip ties. You can adjust, add, or remove cables without cutting anything. I buy the rolls from Amazon and cut to length. Game changer for behind the TV.",
        likes: 5,
      },
      {
        author: "WallMaster",
        time: "2 days ago",
        content:
          "If your TV is above a fireplace, there's usually a gap between the mantel and the wall. You can often run cables through that gap without any wall cutting. Check with a flashlight first.",
        likes: 8,
      },
      {
        author: "BudgetBuilder",
        time: "1 day ago",
        content:
          "The cheapest solution: a $3 paintable cord cover from Walmart. I ran one from my TV to the outlet, painted it the same color as my wall, and honestly you can barely see it. Not perfect but 90% there.",
        likes: 4,
      },
    ],
  },
  {
    id: 11,
    title: "What seed mix are you guys throwing down on shaded lawn jobs?",
    author: "GreenThumb",
    replies: 7,
    likes: 11,
    lastActive: "5 days ago",
    tags: ["landscaping", "lawn", "shade"],
    preview:
      "Got a landscaping client with heavy tree cover - maybe 2-3 hours of direct sun. Standard seed mixes keep failing. What shade-tolerant blends are you running in the Northeast that actually establish?",
    responses: [
      {
        author: "LandscaperPro",
        time: "5 days ago",
        content:
          "Fine fescues are your best bet for shade. Look for a mix with Creeping Red Fescue, Chewings Fescue, and Hard Fescue. Jonathan Green's Shady Nooks blend has worked well for my clients.",
        likes: 6,
      },
      {
        author: "TurfBuilder",
        time: "4 days ago",
        content:
          "In the Northeast, I've had great results with Pennington Dense Shade mix. The key is also improving soil drainage in shady areas - leaves tend to accumulate and create acidic, compacted soil. Top dress with compost before seeding.",
        likes: 10,
      },
      {
        author: "ShadeLawnGuy",
        time: "3 days ago",
        content:
          "Also consider how much foot traffic the area gets. Fine fescues don't handle heavy traffic well. If kids play there, you might want to look at shade-tolerant St. Augustine or just go with a ground cover like clover.",
        likes: 3,
      },
      {
        author: "WeekendWarrior",
        time: "3 days ago",
        content:
          "I gave up on grass in my heavily shaded area and planted hostas and ferns instead. Looks way better than patchy grass ever did. Sometimes the answer isn't a different grass seed - it's embracing the shade.",
        likes: 8,
      },
      {
        author: "HomeRenovator",
        time: "2 days ago",
        content:
          "If you do go with fescue, overseed every fall. Shade grass thins out over time and needs reinforcement. I do this every September and my shaded lawn looks better each year.",
        likes: 6,
      },
      {
        author: "HandyPro",
        time: "2 days ago",
        content:
          "Raise your mower height in shaded areas to at least 3.5-4 inches. Taller grass blades capture more sunlight. Most people mow shade areas too short which weakens the grass even more.",
        likes: 10,
      },
      {
        author: "ContractorPro",
        time: "1 day ago",
        content:
          "Consider thinning tree branches to let more light through rather than fighting with shade-tolerant grass. A certified arborist can selectively prune to improve light by 30-40% without hurting the tree.",
        likes: 13,
      },
      {
        author: "DIYQueen",
        time: "1 day ago",
        content:
          "Micro clover mixed with fescue is my favorite combo for shade. The clover fixes nitrogen so you don't need to fertilize, stays green year-round, and fills in any thin spots. Looks beautiful too.",
        likes: 7,
      },
      {
        author: "FirstTimer",
        time: "20 hours ago",
        content:
          "Tried the clover suggestion from last month - it's already sprouting and looks great mixed in with the fescue. Way easier than I expected. Just rake, seed, and water.",
        likes: 3,
      },
    ],
  },
  {
    id: 12,
    title: "Best storage solutions you've built for small home offices?",
    author: "WFHWarrior",
    replies: 10,
    likes: 19,
    lastActive: "3 days ago",
    tags: ["organization", "home-office", "small-space"],
    preview:
      "Getting a lot of requests for home office builds in tight spaces - closet conversions, 8x8 rooms, etc. What storage and organization solutions are you guys installing that clients love? Need ideas beyond basic shelving.",
    responses: [
      {
        author: "OrganizationConsultant",
        time: "3 days ago",
        content:
          "Wall-mounted monitor arms free up desk space. Use vertical storage with floating shelves. A pegboard system for frequently used items keeps them accessible without cluttering your desk.",
        likes: 7,
      },
      {
        author: "DeskMinimalist",
        time: "2 days ago",
        content:
          "Magnetic cable clips on the side of your desk keep charging cables tidy. I also use a under-desk drawer (ALEX from IKEA) and a headphone hook. My 8x8 office looks twice the size now because the desk is always clear.",
        likes: 11,
      },
      {
        author: "ProductivityNerd",
        time: "2 days ago",
        content:
          "Vertical file organizers on the wall save a ton of desk space. Also, get a power strip with USB ports that mounts under the desk. Keeps everything off the floor and out of sight.",
        likes: 3,
      },
      {
        author: "TinySpaceLiving",
        time: "1 day ago",
        content:
          "A fold-down wall desk changed my life. When I'm done working, I fold it up and my office becomes a guest room. IKEA NORBERG is $50 and holds a laptop + monitor easily.",
        likes: 9,
      },
      {
        author: "HomeRenovator",
        time: "1 day ago",
        content:
          "Install a single floating shelf above your monitor at eye level. Put your webcam, small plant, and a few reference books there. Clears desk space AND looks professional on video calls.",
        likes: 8,
      },
      {
        author: "HandyPro",
        time: "20 hours ago",
        content:
          "Acoustic panels on the wall behind you serve double duty: they improve sound for calls AND act as a visual backdrop. The felt ones from Amazon are $30 for a 6-pack and easy to install.",
        likes: 11,
      },
      {
        author: "ContractorPro",
        time: "18 hours ago",
        content:
          "If you're in a closet office setup, add a small USB fan for ventilation. Those spaces get hot fast with a computer running. A clip-on fan aimed at you makes all the difference.",
        likes: 5,
      },
      {
        author: "DrillSergeant",
        time: "15 hours ago",
        content:
          "French cleats on the wall behind your desk. You can hang shelves, tool holders, file organizers - all interchangeable and reconfigurable. One afternoon to install, lifetime of flexibility.",
        likes: 14,
      },
      {
        author: "WeekendWarrior",
        time: "12 hours ago",
        content:
          "Don't forget lighting! A small LED desk lamp with adjustable color temperature reduces eye strain massively. I use the BenQ ScreenBar - clips to your monitor and doesn't take any desk space at all.",
        likes: 6,
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
          responses: [],
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
          responses: [],
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
          responses: [],
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
          {["All Topics", "Recommendations", "How-To", "Tips & Tricks", "Product Reviews"].map(
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

                  {/* Author original post */}
                  <div
                    className="mt-5 pt-4 border-t border-lavender-200/30"
                    onMouseEnter={() => setShowUserTooltip(topic.id)}
                    onMouseLeave={() => setShowUserTooltip(null)}
                  >
                    <div className="flex items-start">
                      <div className="relative flex-shrink-0">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-r from-lavender-300 to-lavender-400 flex items-center justify-center text-sm font-bold text-white border border-lavender-200/50 shadow-md">
                          {topic.author.charAt(0)}
                        </div>

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
                      <div className="ml-2 flex-1 min-w-0">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700">{topic.author}</span>
                          <ReviewStarBadge authorName={topic.author} />
                        </div>
                        <div className="text-xs text-gray-500">Active contributor</div>
                        <div className="mt-2 text-sm text-gray-600 leading-relaxed">{topic.preview}</div>
                      </div>
                    </div>
                  </div>

                  {/* First 3 comments always visible in topic box */}
                  {topic.responses && topic.responses.length > 0 && (
                    <div className="space-y-3 mt-4">
                      {topic.responses.slice(0, 3).map((response, index) => (
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

                      {/* Show More button - shows 7 more comments */}
                      {topic.responses.length > 3 && !expandedComments[topic.id] && (
                        <button
                          className="w-full py-2.5 px-4 rounded-lg border border-lavender-200/60 bg-lavender-50/50 text-sm font-medium text-lavender-700 hover:bg-lavender-100/60 hover:border-lavender-300/60 transition-colors duration-200 flex items-center justify-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedComments((prev) => ({ ...prev, [topic.id]: true }))
                          }}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Show {Math.min(topic.responses.length - 3, 7)} more {Math.min(topic.responses.length - 3, 7) === 1 ? "reply" : "replies"}
                        </button>
                      )}

                      {/* Expanded comments - 7 more after the initial 3 */}
                      {expandedComments[topic.id] && topic.responses.slice(3, 10).map((response, idx) => {
                        const index = idx + 3
                        return (
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
                        )
                      })}
                    </div>
                  )}

                  {/* Reply input - always visible at bottom of topic box */}
                  {activeTopic === topic.id && (
                    <div className="mt-5 pt-5 border-t border-lavender-200/30">
                      <div className="mt-0">
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
