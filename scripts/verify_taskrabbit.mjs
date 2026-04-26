// scripts/verify_taskrabbit.mjs
//
// Human-driven TaskRabbit credential verification (MVP test).
//
// Run:   npm run verify:tr
//
// Flow:
//   1. Opens a real Chromium window on taskrabbit.com/login
//   2. YOU log in manually (real typing → no bot detection / SMS block)
//   3. Press Enter in this terminal once you're on your dashboard
//   4. Script captures the page, navigates to a few likely tasker URLs,
//      and prints whatever numbers it can find
//   5. Saves the authenticated session to scripts/.tr_auth.json so future
//      runs skip login entirely
//
// This is the local mirror of the production architecture:
// production = hosted browser (Anon/Browserbase) embedded in Levl portal,
// user types into that, backend scrapes the same way once they're logged in.

import { chromium } from "playwright"
import readline from "node:readline/promises"
import path from "node:path"
import fs from "node:fs/promises"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STATE_FILE = path.join(__dirname, ".tr_auth.json")

console.log("\n▶ TaskRabbit credential verification (manual login mode)\n")

let storageStatePath
try {
  await fs.access(STATE_FILE)
  storageStatePath = STATE_FILE
  console.log("→ Found saved session — will try to reuse it\n")
} catch {
  console.log("→ No saved session — you'll need to log in manually this run\n")
}

const browser = await chromium.launch({
  headless: false,
  args: ["--start-maximized"],
})
const context = await browser.newContext({
  viewport: null,
  storageState: storageStatePath,
})
const page = await context.newPage()

async function snapshot(label) {
  const html = await page.content()
  const file = path.join(__dirname, `.tr_${label}.html`)
  await fs.writeFile(file, html)
  console.log(`   snapshot → scripts/.tr_${label}.html`)
}

async function pressEnterToContinue(message) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  await rl.question(message)
  rl.close()
}

const isLoginUrl = (url) => /\/login|\/sign[-_ ]?in/i.test(String(url))

try {
  // 1. Open TaskRabbit
  console.log("→ Opening taskrabbit.com")
  await page.goto("https://www.taskrabbit.com/", { waitUntil: "domcontentloaded" })

  // 2. If we're not authenticated, ask user to log in manually
  let needsLogin = true
  if (storageStatePath) {
    // Quick auth check — try /dashboard
    try {
      await page.goto("https://www.taskrabbit.com/dashboard", {
        waitUntil: "domcontentloaded",
        timeout: 15_000,
      })
      if (!isLoginUrl(page.url())) {
        needsLogin = false
        console.log("→ Saved session is still valid — skipping login\n")
      }
    } catch {}
  }

  if (needsLogin) {
    console.log("→ Navigating to login page")
    await page.goto("https://www.taskrabbit.com/login", { waitUntil: "domcontentloaded" })

    console.log("\n────────────────────────────────────────────────────────────────")
    console.log("  ACTION REQUIRED")
    console.log("  ──────────────")
    console.log("  1. Switch to the Chromium window that just opened.")
    console.log("  2. Log into TaskRabbit MANUALLY (type your email + password).")
    console.log("  3. Complete any SMS verification on your phone.")
    console.log("  4. When you're on your dashboard / tasker home,")
    console.log("     come back to THIS TERMINAL and press ENTER.")
    console.log("────────────────────────────────────────────────────────────────")

    await pressEnterToContinue("\n  → Press ENTER when you're logged in: ")

    if (isLoginUrl(page.url())) {
      console.log(`\n  ⚠ You're still on a login URL (${page.url()})`)
      console.log("    Make sure you're fully logged in before pressing Enter.\n")
      await pressEnterToContinue("  → Press ENTER again: ")
    }

    // Persist the authenticated session
    await context.storageState({ path: STATE_FILE })
    console.log(`\n→ Saved auth state to scripts/.tr_auth.json (next run skips login)\n`)
  }

  console.log("   logged-in url →", page.url())
  await snapshot("post_auth_landing")

  // 3. Try common tasker dashboard / profile destinations
  const candidates = [
    "https://www.taskrabbit.com/dashboard",
    "https://www.taskrabbit.com/profile",
    "https://www.taskrabbit.com/tasker/profile",
    "https://www.taskrabbit.com/tasker/dashboard",
    "https://www.taskrabbit.com/account",
  ]
  for (const url of candidates) {
    try {
      console.log(`→ Trying ${url}`)
      const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15_000 })
      console.log(`   landed on → ${page.url()} (status ${resp?.status()})`)
      const label = url.split("/").pop() || "page"
      await snapshot(label)
    } catch (e) {
      console.log(`   error → ${e.message}`)
    }
  }

  // 4. Loose extraction — patterns will need tuning per TR's actual DOM.
  const html = await page.content()
  const jobMatch = html.match(
    /(\d{1,3}(?:,\d{3})*)\s*(?:tasks\s+completed|completed\s+tasks|jobs\s+completed|tasks)/i,
  )
  const ratingMatch = html.match(/(\d\.\d{1,2})\s*(?:★|stars?|out\s+of\s+5|\/\s*5)/i)

  console.log("\n=== EXTRACTED (loose match — verify against snapshots) ===")
  console.log(`  Jobs:   ${jobMatch?.[1] ?? "(not found)"}`)
  console.log(`  Rating: ${ratingMatch?.[1] ?? "(not found)"}`)
  console.log()
  console.log("──────────────────────────────────────────────────────────────")
  console.log("  Now: navigate manually in the Chromium window to wherever")
  console.log("  YOUR job count + star rating actually appear on TR.")
  console.log("  Note the URL. When you're on that page, press ENTER here")
  console.log("  and I'll snapshot it for selector extraction.")
  console.log("──────────────────────────────────────────────────────────────")

  await pressEnterToContinue("\n  → Press ENTER once you're on your stats page: ")

  console.log("\n→ Capturing stats page")
  console.log("   url →", page.url())
  await snapshot("stats_page")

  // Re-run loose extraction on the stats page
  const html2 = await page.content()
  const jobMatch2 = html2.match(
    /(\d{1,3}(?:,\d{3})*)\s*(?:tasks\s+completed|completed\s+tasks|jobs\s+completed|tasks)/i,
  )
  const ratingMatch2 = html2.match(/(\d\.\d{1,2})\s*(?:★|stars?|out\s+of\s+5|\/\s*5)/i)

  console.log("\n=== EXTRACTED FROM STATS PAGE ===")
  console.log(`  Jobs:   ${jobMatch2?.[1] ?? "(not found)"}`)
  console.log(`  Rating: ${ratingMatch2?.[1] ?? "(not found)"}`)
  console.log()
  console.log("→ All snapshots saved to scripts/.tr_*.html (gitignored)")
  console.log("→ Closing browser in 10 seconds.\n")
  await page.waitForTimeout(10_000)
} catch (err) {
  console.error("\n✗ Error:", err.message)
  console.error("  Browser left open for 60s for inspection.\n")
  try {
    await snapshot("error")
  } catch {}
  await page.waitForTimeout(60_000)
  process.exitCode = 1
} finally {
  await browser.close()
}
