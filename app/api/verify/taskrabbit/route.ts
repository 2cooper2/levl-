import { NextResponse } from "next/server"
import crypto from "node:crypto"

// POST /api/verify/taskrabbit
//
// Two-phase verification flow:
//
//   Phase 1 ─ preview:
//     body  → { action: "preview", url }
//     reply → { profile, ownershipCode }
//   Phase 2 ─ confirm:
//     body  → { action: "confirm", url, code }
//     reply → { profile, ownershipVerified: true } if the code appears anywhere
//             in the profile's description / category descriptions, else 403
//
// Public TaskRabbit profile pages are scrapable by anyone, so the
// ownership-code step proves the verifying user actually controls the account
// (only the account owner can edit the About-me / skill descriptions).

export const runtime = "nodejs"

type VerifiedSkill = {
  name: string
  taskCount: number
  ratingAverage: number | null
  ratingReviews: number
  rate: string | null
  description: string
}

type VerifiedProfile = {
  platform: "taskrabbit"
  profileUrl: string
  displayName: string
  avatarUrl: string | null
  ratingAverage: number
  ratingReviews: number
  taskCount: number
  metroName: string
  vehiclesDisplay: string | null
  description: string
  taskerSince: string | null
  idVerified: boolean
  skills: VerifiedSkill[]
  verifiedAt: string
}

const ALLOWED_HOSTS = new Set(["tr.co", "www.taskrabbit.com", "taskrabbit.com"])

// Avoid easily-confused characters (0/O, 1/I/L)
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
function generateOwnershipCode(): string {
  const bytes = crypto.randomBytes(4)
  let suffix = ""
  for (let i = 0; i < 4; i++) {
    suffix += CODE_CHARS[bytes[i] % CODE_CHARS.length]
  }
  return `LEVL-${suffix}`
}

function parseReviewCount(s: string | undefined | null): number {
  if (!s) return 0
  // Explicit "no reviews" copy from TR — must short-circuit so the digits in
  // sibling text like "1 task (no reviews yet)" don't get picked up.
  if (/no reviews/i.test(s)) return 0
  // Match "N reviews" / "N review" — accept comma-grouped or plain digits.
  const m = s.match(/([\d,]+)\s+reviews?/i)
  return m ? parseInt(m[1].replace(/,/g, ""), 10) : 0
}

function extractTaskerSince(attributes: Array<{ label: string }>): string | null {
  for (const a of attributes ?? []) {
    const m = a?.label?.match(/Tasker since\s+(\d{4})/i)
    if (m) return m[1]
  }
  return null
}

function extractIdVerified(attributes: Array<{ label: string }>): boolean {
  return (attributes ?? []).some((a) => /ID Verified/i.test(a?.label ?? ""))
}

function buildProfile(bff: any, finalUrl: string): VerifiedProfile {
  const skills: VerifiedSkill[] = Array.isArray(bff.categories)
    ? bff.categories.map((c: any) => ({
        name: c?.name ?? "",
        taskCount: typeof c?.categoryTaskCount === "number" ? c.categoryTaskCount : 0,
        ratingAverage: c?.rating?.average ? parseFloat(c.rating.average) : null,
        ratingReviews: parseReviewCount(c?.rating?.totalReviews),
        rate: c?.posterRateDisplay ?? null,
        description: c?.description ?? "",
      }))
    : []
  return {
    platform: "taskrabbit",
    profileUrl: finalUrl,
    displayName: bff.displayName,
    avatarUrl: bff.avatarUrl ?? null,
    ratingAverage: bff.rating?.average ? parseFloat(bff.rating.average) : 0,
    ratingReviews: parseReviewCount(bff.rating?.totalReviews),
    taskCount: bff.taskCount,
    metroName: bff.metroName ?? "",
    vehiclesDisplay: bff.vehiclesDisplay ?? null,
    description: bff.description ?? "",
    taskerSince: extractTaskerSince(bff.attributes ?? []),
    idVerified: extractIdVerified(bff.attributes ?? []),
    skills,
    verifiedAt: new Date().toISOString(),
  }
}

async function fetchAndParse(url: URL): Promise<{ bff: any; finalUrl: string } | { error: string; status: number }> {
  let html: string
  let finalUrl: string
  try {
    const resp = await fetch(url.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
      },
      redirect: "follow",
      // Bust any caches so the proof-of-ownership re-fetch picks up freshly-saved
      // edits to the user's TR profile.
      cache: "no-store",
    })
    if (!resp.ok) return { error: `TaskRabbit returned ${resp.status}`, status: 502 }
    html = await resp.text()
    finalUrl = resp.url
  } catch (err: any) {
    return { error: `Failed to fetch profile: ${err.message ?? "unknown"}`, status: 502 }
  }

  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)
  if (!m) {
    return {
      error: "Couldn't find profile data on the page (TR may have changed their layout)",
      status: 502,
    }
  }
  let bff: any
  try {
    bff = JSON.parse(m[1])?.props?.pageProps?.page?.bff
  } catch {
    return { error: "Failed to parse profile data", status: 502 }
  }
  if (!bff || typeof bff.taskCount !== "number" || !bff.displayName) {
    return {
      error: "Profile data missing expected fields — is this a tasker profile URL?",
      status: 502,
    }
  }
  return { bff, finalUrl }
}

function descriptionHaystack(bff: any): string {
  const parts: string[] = []
  if (typeof bff.description === "string") parts.push(bff.description)
  if (typeof bff.displayName === "string") parts.push(bff.displayName)
  if (Array.isArray(bff.categories)) {
    for (const c of bff.categories) {
      if (typeof c?.description === "string") parts.push(c.description)
    }
  }
  return parts.join("\n")
}

export async function POST(req: Request) {
  let body: { action?: string; url?: string; code?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const action = body.action ?? "preview"
  const raw = body.url?.trim()
  if (!raw) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  let url: URL
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`)
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
  }
  if (!ALLOWED_HOSTS.has(url.hostname.toLowerCase())) {
    return NextResponse.json(
      { error: "URL must be a tr.co or taskrabbit.com link" },
      { status: 400 },
    )
  }

  const result = await fetchAndParse(url)
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  const profile = buildProfile(result.bff, result.finalUrl)

  if (action === "preview") {
    return NextResponse.json({
      profile,
      ownershipCode: generateOwnershipCode(),
    })
  }

  if (action === "confirm") {
    const code = body.code?.trim()
    if (!code || !/^LEVL-[A-Z0-9]{4}$/.test(code)) {
      return NextResponse.json({ error: "Missing or invalid ownership code" }, { status: 400 })
    }
    const haystack = descriptionHaystack(result.bff)
    if (!haystack.includes(code)) {
      return NextResponse.json(
        {
          error: `Couldn't find ${code} on the profile. Make sure you saved the change in TaskRabbit and try again.`,
          ownershipVerified: false,
        },
        { status: 403 },
      )
    }
    return NextResponse.json({ profile, ownershipVerified: true })
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
}
