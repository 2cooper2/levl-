// Render the new LevlLogo SVG to PNG files at the sizes we need for
// favicon, iOS home-screen icon, and PWA manifest icon.
//
// Run: node scripts/render-icons.mjs

import sharp from "sharp"
import { writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")

// The SVG markup from components/levl-logo.tsx wrapped as a standalone document.
// viewBox 230 218 567 634 - we render the icon with a small lavender background
// box so the logo isn't visually clipped when displayed in a small square slot.
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="180 168 667 734" preserveAspectRatio="xMidYMid meet">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F4ECFB"/>
    </radialGradient>
    <radialGradient id="levl-grad-0" cx="30%" cy="25%" r="85%" fx="25%" fy="20%">
      <stop offset="0%" stop-color="#F5E8FE"/>
      <stop offset="8%" stop-color="#EDDAFB"/>
      <stop offset="20%" stop-color="#DCB7F8"/>
      <stop offset="35%" stop-color="#C388F4"/>
      <stop offset="55%" stop-color="#8943C3"/>
      <stop offset="78%" stop-color="#3D125F"/>
      <stop offset="100%" stop-color="#150428"/>
    </radialGradient>
    <radialGradient id="levl-grad-1" cx="30%" cy="25%" r="85%" fx="25%" fy="20%">
      <stop offset="0%" stop-color="#F8EEFE"/>
      <stop offset="8%" stop-color="#F0DFFC"/>
      <stop offset="20%" stop-color="#DDB9F8"/>
      <stop offset="38%" stop-color="#C388F4"/>
      <stop offset="58%" stop-color="#7F38B3"/>
      <stop offset="80%" stop-color="#33094F"/>
      <stop offset="100%" stop-color="#100322"/>
    </radialGradient>
    <radialGradient id="levl-grad-2" cx="30%" cy="25%" r="85%" fx="25%" fy="20%">
      <stop offset="0%" stop-color="#F8EEFE"/>
      <stop offset="8%" stop-color="#F0DFFC"/>
      <stop offset="20%" stop-color="#DDB9F8"/>
      <stop offset="38%" stop-color="#C388F4"/>
      <stop offset="58%" stop-color="#7F38B3"/>
      <stop offset="80%" stop-color="#33094F"/>
      <stop offset="100%" stop-color="#100322"/>
    </radialGradient>
    <radialGradient id="dot-backdrop" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2D0A4A" stop-opacity="1"/>
      <stop offset="95%" stop-color="#2D0A4A" stop-opacity="1"/>
      <stop offset="100%" stop-color="#2D0A4A" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="dot-sphere" cx="30%" cy="25%" r="75%" fx="25%" fy="20%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1"/>
      <stop offset="2%" stop-color="#FCF6FE" stop-opacity="1"/>
      <stop offset="8%" stop-color="#F2DFFD" stop-opacity="1"/>
      <stop offset="28%" stop-color="#C99AE8" stop-opacity="0.95"/>
      <stop offset="50%" stop-color="#C388F4" stop-opacity="0.7"/>
      <stop offset="68%" stop-color="#A766DA" stop-opacity="0.4"/>
      <stop offset="82%" stop-color="#C388F4" stop-opacity="0.18"/>
      <stop offset="93%" stop-color="#C388F4" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#C388F4" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x="180" y="168" width="667" height="734" fill="url(#bg)"/>
  <path fill="url(#levl-grad-0)" stroke="#DEBDF8" stroke-width="0.8" stroke-linejoin="miter" stroke-miterlimit="4" stroke-linecap="round" transform="translate(479,248)" d="M0,0 L5,2 L7,5 L4,28 L-22,210 L-30,267 L-33,276 L-40,282 L-56,293 L-68,302 L-84,315 L-95,324 L-103,332 L-111,339 L-124,352 L-131,360 L-141,371 L-152,385 L-165,403 L-169,408 L-172,407 L-171,396 L-144,209 L-126,83 L-123,73 L-115,67 L-83,48 L-63,36 L-37,21 L-14,8 Z"/>
  <path fill="url(#levl-grad-1)" stroke="#DEBDF8" stroke-width="0.8" stroke-linejoin="miter" stroke-miterlimit="4" stroke-linecap="round" transform="translate(730,376)" d="M0,0 A 31.5 31.5 0 1 1 -4,61 L-20,88 L-36,114 L-50,137 L-66,163 L-80,184 L-92,200 L-91,205 A 30 30 0 0 1 -140,233 L-170,249 L-186,258 L-188,258 A 27 27 0 0 1 -234,276 L-272,295 L-295,309 L-318,324 L-125,324 L-116,320 L-110,313 L-96,288 L-82,264 L-65,235 L-51,211 L-34,182 L-20,158 L-21,153 L-23,148 L-24,138 L-22,129 L-16,119 A 31 31 0 1 1 -2,170 L-12,188 L-25,210 L-38,232 L-51,254 L-68,283 L-85,312 L-100,338 L-119,370 L-130,388 L-137,394 L-144,397 L-355,398 L-378,399 L-396,402 L-423,411 L-437,419 L-450,430 L-462,441 L-469,446 L-470,443 L-464,432 L-454,417 L-444,404 L-432,391 L-407,366 L-399,359 L-385,347 L-371,336 L-355,324 L-339,313 L-321,301 L-301,288 L-288,280 L-270,270 L-248,259 L-238,255 A 25.5 25.5 0 0 1 -200,239 L-194,237 L-172,226 L-152,215 L-147,213 L-145,201 A 26.5 26.5 0 0 1 -106,186 L-104,182 L-92,165 L-79,145 L-66,124 L-54,104 L-39,79 L-21,49 L-22,44 L-24,39 L-25,28 A 32.5 32.5 0 0 1 0,0 Z"/>
  <path fill="url(#levl-grad-2)" stroke="#DEBDF8" stroke-width="0.8" stroke-linejoin="miter" stroke-miterlimit="4" stroke-linecap="round" transform="translate(537,490)" d="M0,0 L2,0 L4,10 L7,50 L7,72 L-14,85 L-41,101 L-70,118 L-89,130 L-107,142 L-127,156 L-146,170 L-162,182 L-173,191 L-186,202 L-198,213 L-208,222 L-233,247 L-242,258 L-253,272 L-257,273 L-258,270 L-251,250 L-240,227 L-226,203 L-215,185 L-205,172 L-192,156 L-180,143 L-173,135 L-155,117 L-147,110 L-136,100 L-125,91 L-111,80 L-93,67 L-78,57 L-42,33 L-28,23 L-15,13 L-2,2 Z"/>
  <circle cx="734.5" cy="407.7" r="30.5" fill="url(#dot-backdrop)"/>
  <circle cx="735.5" cy="516.6" r="30.5" fill="url(#dot-backdrop)"/>
  <circle cx="609.0" cy="587.5" r="30.0" fill="url(#dot-backdrop)"/>
  <circle cx="514.1" cy="634.7" r="26.0" fill="url(#dot-backdrop)"/>
  <circle cx="734.5" cy="407.7" r="30.5" fill="url(#dot-sphere)"/>
  <circle cx="735.5" cy="516.6" r="30.5" fill="url(#dot-sphere)"/>
  <circle cx="609.0" cy="587.5" r="30.0" fill="url(#dot-sphere)"/>
  <circle cx="514.1" cy="634.7" r="26.0" fill="url(#dot-sphere)"/>
</svg>`

const buf = Buffer.from(SVG)

// Save the SVG to public/icon.svg (browsers use this as scalable favicon)
writeFileSync(join(ROOT, "public", "icon.svg"), SVG)
console.log("✓ public/icon.svg")

// 180×180 — iOS home-screen icon
await sharp(buf, { density: 600 })
  .resize(180, 180)
  .png()
  .toFile(join(ROOT, "public", "apple-icon.png"))
console.log("✓ public/apple-icon.png (180×180)")

// 512×512 — PWA install icon
await sharp(buf, { density: 600 })
  .resize(512, 512)
  .png()
  .toFile(join(ROOT, "public", "levl-icon.png"))
console.log("✓ public/levl-icon.png (512×512)")

// 32×32 — browser tab favicon (saved as .png; layout.tsx will reference /icon.svg
// for modern browsers and /favicon.png as a fallback).
await sharp(buf, { density: 600 })
  .resize(32, 32)
  .png()
  .toFile(join(ROOT, "public", "favicon.png"))
console.log("✓ public/favicon.png (32×32)")

console.log("\nDone.")
