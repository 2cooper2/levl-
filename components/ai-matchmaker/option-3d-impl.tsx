"use client"

import { useRef, useMemo, useState, useEffect, type JSX } from "react"
import Image from "next/image"
import { Canvas, useFrame } from "@react-three/fiber"
import { ContactShadows, Environment, PerspectiveCamera, RoundedBox } from "@react-three/drei"
import { EffectComposer, Bloom, N8AO, ToneMapping, SMAA } from "@react-three/postprocessing"
import { ToneMappingMode } from "postprocessing"
import * as THREE from "three"

// ─── Brand palette ────────────────────────────────────────────────────────────
const C = {
  purple:     "#7c3aed",
  purpleDim:  "#4c1d95",
  purpleGlow: "#a855f7",
  gunmetal:   "#2a2d35",
  steelDark:  "#9ca0ae",
  steel:      "#c8ccd8",
  chrome:     "#dde0ee",
  ivory:      "#f0ede6",
  screen:     "#060810",
  green:      "#22c55e",
}

function smoothstep(t: number) { return t * t * (3 - 2 * t) }

// ─── PBR material factories ────────────────────────────────────────────────────
function mkChrome(roughness = 0.08): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: C.chrome, metalness: 0.98, roughness,
    clearcoat: 0.9, clearcoatRoughness: 0.06, envMapIntensity: 2.0,
  })
}
function mkGunmetal(roughness = 0.22): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: C.gunmetal, metalness: 0.92, roughness,
    clearcoat: 0.3, clearcoatRoughness: 0.18, envMapIntensity: 1.4,
  })
}
function mkBrushedSteel(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: C.steel, metalness: 0.9, roughness: 0.2,
    clearcoat: 0.4, clearcoatRoughness: 0.12, envMapIntensity: 1.8,
  })
}
function mkGold(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: "#c8902a", metalness: 0.98, roughness: 0.10,
    clearcoat: 0.9, clearcoatRoughness: 0.06, envMapIntensity: 2.4,
  })
}
function mkBrushedNickel(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: "#b8bcc8", metalness: 0.95, roughness: 0.18,
    clearcoat: 0.6, clearcoatRoughness: 0.10, envMapIntensity: 1.8,
  })
}

// ─── Procedural PBR wall-texture system ──────────────────────────────────────

/** Deterministic hash → 0..1 (GLSL-style, stable for any real inputs) */
function hash(a: number, b: number): number {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return n - Math.floor(n)
}

/** Smooth bicubic value noise */
function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x), yi = Math.floor(y)
  const xf = x - xi,        yf = y - yi
  const u  = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  const h00 = hash(xi,   yi),   h10 = hash(xi+1, yi)
  const h01 = hash(xi,   yi+1), h11 = hash(xi+1, yi+1)
  return h00*(1-u)*(1-v) + h10*u*(1-v) + h01*(1-u)*v + h11*u*v
}

/** Fractional Brownian Motion */
function fbm(x: number, y: number, oct: number, lac = 2.0, gain = 0.5): number {
  let val = 0, amp = 0.5, freq = 1, maxAmp = 0
  for (let i = 0; i < oct; i++) {
    val += valueNoise(x * freq, y * freq) * amp
    maxAmp += amp; freq *= lac; amp *= gain
  }
  return val / maxAmp
}

/** Voronoi — returns { d1, d2, id } for nearest / second-nearest cell center */
function voronoi(u: number, v: number, sx: number, sy: number) {
  const cx = u * sx, cy = v * sy
  const xi = Math.floor(cx), yi = Math.floor(cy)
  let d1 = 1e9, d2 = 1e9, id = 0
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = xi + dx, ny = yi + dy
      const px = nx + hash(nx * 7,  ny * 13)
      const py = ny + hash(nx * 17, ny * 31)
      const dist = Math.sqrt((cx - px) ** 2 + (cy - py) ** 2)
      if (dist < d1) { d2 = d1; d1 = dist; id = hash(nx * 5, ny * 11) }
      else if (dist < d2) { d2 = dist }
    }
  }
  return { d1, d2, id }
}

// ─── PBR map builder ─────────────────────────────────────────────────────────

type WallMaps = {
  albedo: THREE.CanvasTexture; displacement: THREE.CanvasTexture
  normal: THREE.CanvasTexture; roughness:    THREE.CanvasTexture
}

function toTex(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas)
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true; return t
}

/**
 * Generates 4 PBR maps (albedo, displacement, normal, roughness) from scalar functions.
 * Normal is Sobel-derived from the height field — always matches displacement perfectly.
 * NRM_STR controls how strongly height gradients encode into normals.
 */
function buildPBRMaps(
  S: number,
  NRM_STR: number,
  heightFn: (x: number, y: number) => number,
  colorFn:  (x: number, y: number, h: number) => [number, number, number],
  roughFn:  (x: number, y: number, h: number) => number,
): WallMaps {
  const H = new Float32Array(S * S)
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++)
      H[y * S + x] = heightFn(x, y)

  const mk = () => { const c = document.createElement("canvas"); c.width = c.height = S; return c }
  const aC = mk(), dC = mk(), nC = mk(), rC = mk()
  const aD = new ImageData(S, S), dD = new ImageData(S, S)
  const nD = new ImageData(S, S), rD = new ImageData(S, S)

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const h = H[y * S + x]
      const i = (y * S + x) * 4

      // Albedo
      const [r, g, b] = colorFn(x, y, h)
      aD.data[i] = r; aD.data[i+1] = g; aD.data[i+2] = b; aD.data[i+3] = 255

      // Displacement (linear grayscale height)
      const dv = Math.min(255, (h * 255) | 0)
      dD.data[i] = dv; dD.data[i+1] = dv; dD.data[i+2] = dv; dD.data[i+3] = 255

      // Normal map — Sobel gradient of height field
      const xl = H[y * S + Math.max(0, x - 1)],  xr = H[y * S + Math.min(S-1, x + 1)]
      const yu = H[Math.max(0, y-1) * S + x],     yd = H[Math.min(S-1, y+1) * S + x]
      const ddx = (xr - xl) * NRM_STR,            ddy = (yd - yu) * NRM_STR
      const len = Math.sqrt(ddx*ddx + ddy*ddy + 1)
      nD.data[i]   = ((-ddx / len * 0.5 + 0.5) * 255) | 0
      nD.data[i+1] = ((-ddy / len * 0.5 + 0.5) * 255) | 0
      nD.data[i+2] = ((1    / len * 0.5 + 0.5) * 255) | 0
      nD.data[i+3] = 255

      // Roughness
      const rv = Math.min(255, (roughFn(x, y, h) * 255) | 0)
      rD.data[i] = rv; rD.data[i+1] = rv; rD.data[i+2] = rv; rD.data[i+3] = 255
    }
  }

  aC.getContext("2d")!.putImageData(aD, 0, 0)
  dC.getContext("2d")!.putImageData(dD, 0, 0)
  nC.getContext("2d")!.putImageData(nD, 0, 0)
  rC.getContext("2d")!.putImageData(rD, 0, 0)
  return { albedo: toTex(aC), displacement: toTex(dC), normal: toTex(nC), roughness: toTex(rC) }
}

// ─── Per-material map generators ─────────────────────────────────────────────

/**
 * Brick — running-bond layout. Dark red + medium red palette (no tan/buff).
 * Darker grey mortar. Micro FBM + hash pits give bricks real surface roughness/chips.
 */
function makeBrickMaps(S: number): WallMaps {
  const BW = 112, BH = 46, MG = 7
  const PX = BW + MG, PY = BH + MG
  // Dark red + medium red only — no tan/buff
  const PALETTE: [number,number,number][] = [
    [178, 50, 24],   // light red-orange
    [162, 47, 27],   // medium red
    [148, 43, 23],   // medium-dark red
    [125, 38, 20],   // deep rustic red
    [140, 41, 22],   // dark-medium red
    [168, 49, 26],   // warm mid red
  ]
  const brickInfo = (x: number, y: number) => {
    const row = Math.floor(y / PY)
    const ox  = (row & 1) * PX * 0.5
    const lx  = ((x + ox) % PX + PX) % PX
    const ly  = y % PY
    const col = Math.floor((x + ox) / PX)
    return { row, col, lx, ly, mortar: lx >= BW || ly >= BH }
  }
  const heightFn = (x: number, y: number) => {
    const { row, col, lx, ly, mortar } = brickInfo(x, y)
    if (mortar) return 0.06
    // Surface micro-variation: FBM orange-peel + random chip pits
    const micro = fbm(x / S * 32, y / S * 32, 4) * 0.10
    const chip  = hash(Math.floor(lx / 3) + row * 97, Math.floor(ly / 3) + col * 137) < 0.04 ? 0.14 : 0
    return 0.76 + micro - chip
  }
  const colorFn = (x: number, y: number, _h: number): [number,number,number] => {
    const { row, col, lx, ly, mortar } = brickInfo(x, y)
    if (mortar) {
      // Darker neutral grey mortar
      const mv = (118 + hash(x * 3, y * 5) * 18) | 0
      return [mv, mv - 2, mv - 3]
    }
    const ci  = Math.floor(hash(row * 127 + 3, col * 251 + 7) * 6)
    const [br, bg, bb] = PALETTE[ci]
    const j   = (hash(row * 53, col * 89) * 40 - 20) | 0
    // Slight tonal variation from FBM (firing variation)
    const fire = (fbm(x / S * 8, y / S * 8, 3) * 20 - 10) | 0
    const ny  = ly / BH
    const shadow = ny < 0.10 ? (1 - ny / 0.10) * 0.38 : 0
    const hi     = ny > 0.92 ? ((ny - 0.92) / 0.08) * 30 : 0
    return [
      Math.max(0, Math.min(255, ((br + j + fire) * (1 - shadow) + hi) | 0)),
      Math.max(0, Math.min(255, ((bg + j * 0.5 + fire * 0.4) * (1 - shadow)) | 0)),
      Math.max(0, Math.min(255, ((bb + j * 0.3 + fire * 0.2) * (1 - shadow)) | 0)),
    ]
  }
  const roughFn = (x: number, y: number, _h: number) => {
    const { mortar } = brickInfo(x, y)
    // Bricks have significant surface roughness variation — chips and grit
    return mortar ? 0.94 : 0.68 + hash(x * 5, y * 7) * 0.24
  }
  return buildPBRMaps(S, 18, heightFn, colorFn, roughFn)
}

/**
 * Concrete — architectural exposed concrete (Tadao Ando / brutalist style).
 * Formwork panel grid with V-groove seams, tie holes at intersections, large
 * organic color blotches for moisture variation, fine aggregate micro-texture.
 */
function makeConcreteMap(S: number): WallMaps {
  // Groove half-width and tie hole radius scale with texture size
  const GW  = Math.max(3, (S / 170) | 0)   // groove width (6px @ 1024)
  const TR  = Math.max(12, (S / 40) | 0)   // tie hole radius (25px @ 1024)

  // Explicit seam positions — irregular spacing, not modulo
  const VS = [0.52 * S, 0.80 * S]              // 2 vertical seams — both past side face UV range (0–0.46)
  const HS = [S / 3, (S / 3) * 2]              // 2 horizontal seams — evenly spaced thirds

  // Distance to nearest seam line (vertical or horizontal)
  const seamDist = (x: number, y: number) => {
    const dx = Math.min(...VS.map(sx => Math.abs(x - sx)))
    const dy = Math.min(...HS.map(sy => Math.abs(y - sy)))
    return Math.min(dx, dy)
  }

  // Tie holes at every seam intersection
  const tieDist = (x: number, y: number) => {
    let best = 1e9
    for (const sx of VS)
      for (const sy of HS) {
        const d = Math.sqrt((x - sx) ** 2 + (y - sy) ** 2)
        if (d < best) best = d
      }
    return best
  }

  const heightFn = (x: number, y: number) => {
    const sd = seamDist(x, y)
    const td = tieDist(x, y)
    // V-groove seam — kept shallow
    const sH = sd < GW * 3 ? smoothstep(Math.min(1, sd / GW)) * 0.97 : 1.0
    // Circular tie hole — deep prominent depression
    const tH = td < TR ? smoothstep(td / TR) * 0.12 : 1.0
    // Fine aggregate micro-relief on panel face
    const fine = fbm(x / S * 30, y / S * 30, 2) * 0.07
    const face = Math.min(sH, tH)
    return face + (face > 0.70 ? fine : 0)
  }

  const colorFn = (x: number, y: number, _h: number): [number, number, number] => {
    const base = 134
    // Dominant large blotch variation — moisture/pour tone difference across panels
    const blotch  = (fbm(x / S * 1.1, y / S * 1.1, 5) - 0.50) * 54
    // Moisture-stain patches — only darkens (asymmetric)
    const moist   = Math.max(0, fbm(x / S * 2.6, y / S * 2.6, 3) - 0.54) * -38
    // Fine aggregate noise
    const grain   = (hash(x, y) - 0.50) * 7
    // Seam shadow — wider dark halo than groove itself
    const sd      = seamDist(x, y)
    const sDk     = sd < GW * 5 ? (1 - Math.min(1, sd / (GW * 5))) * 28 : 0
    // Tie hole shadow with subtle bright rim
    const td      = tieDist(x, y)
    const tDk     = td < TR + 14 ? Math.max(0, 1 - td / (TR + 14)) * 75 : 0
    const rim     = (td > TR * 0.78 && td < TR * 1.25) ? 16 : 0
    const v = (base + blotch + moist + grain - sDk - tDk + rim) | 0
    return [Math.max(0, Math.min(255, v)), Math.max(0, Math.min(255, v - 2)), Math.max(0, Math.min(255, v - 5))]
  }

  const roughFn = (_x: number, _y: number, h: number) => 0.68 + (1 - h) * 0.22
  return buildPBRMaps(S, 30, heightFn, colorFn, roughFn)
}

/**
 * Plaster — skip-trowel finish. Three FBM layers create large trowel blobs,
 * medium directional ridge marks, and fine surface grit. NO discrete pits.
 * The surface is organically uneven — raised blobs are smooth (0.66 rough),
 * recessed valleys are rough (0.94) — that contrast defines the look.
 */
function makePlasterMaps(S: number): WallMaps {
  const heightFn = (x: number, y: number) => {
    // Large trowel blob field — raised blobs with FBM^0.60 bias toward high values
    const large = Math.pow(fbm(x / S * 3.2, y / S * 3.2, 4), 0.60)
    // Medium marks — trowel stroke ridges at slightly different frequency
    const med   = fbm(x / S * 7.5, y / S * 7.5, 3) * 0.34
    // Fine surface grit — gives the sandy/rough micro-texture
    const fine  = fbm(x / S * 20,  y / S * 20,  2) * 0.16
    return large * 0.78 + med + fine
  }
  const colorFn = (_x: number, _y: number, h: number): [number,number,number] => {
    // Slightly darker warm sandy tan
    const base = 155 + h * 26
    return [Math.min(255, base | 0), Math.min(255, (base - 12) | 0), Math.min(255, (base - 28) | 0)]
  }
  // Peaks smooth (peaks = high h = 0.66 rough), valleys rough (low h = 0.94)
  const roughFn = (_x: number, _y: number, h: number) => 0.94 - h * 0.28
  // NRM_STR=90: FBM per-pixel gradients are ~0.005–0.02 — needs aggressive amplification
  // to produce visible surface normal variation under the raking light.
  return buildPBRMaps(S, 90, heightFn, colorFn, roughFn)
}

/**
 * Stone — Voronoi decomposition, random stone centers in grid, mortar joint from
 * distance field (d2−d1). Per-stone color and surface FBM seeded by stone ID.
 * Uses 256px texture — voronoi is evaluated once per pixel via pre-cache.
 */
function makeStoneMaps(S: number): WallMaps {
  const SX = 4, SY = 5
  // Pre-cache to avoid evaluating voronoi 3× per pixel
  const VOR = new Float32Array(S * S * 3)
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const u = x / S, v = y / S
      // Warp UV with FBM before voronoi — bends straight polygon edges into organic curves
      const wu = u + fbm(u * 2.8, v * 2.8, 3) * 0.18
      const wv = v + fbm(u * 2.8 + 5.3, v * 2.8 + 1.7, 3) * 0.18
      const { d1, d2, id } = voronoi(wu, wv, SX, SY)
      const i = (y * S + x) * 3; VOR[i] = d1; VOR[i+1] = d2; VOR[i+2] = id
    }
  // MG controls mortar width — larger = wider mortar groove
  const MG = 0.13
  const heightFn = (x: number, y: number) => {
    const i    = (y * S + x) * 3
    const edge = Math.min(1, (VOR[i+1] - VOR[i]) / MG)
    const t    = smoothstep(smoothstep(Math.min(1, edge / 0.72)))
    // Layered surface variation on stone faces — like plaster but less extreme
    const large = Math.pow(fbm(x / S * 3.5, y / S * 3.5, 4), 0.72) * 0.52
    const med   = fbm(x / S * 8.0, y / S * 8.0, 3) * 0.28
    const fine  = fbm(x / S * 18,  y / S * 18,  2) * 0.12
    // Only apply surface variation on stone face (t), not into mortar
    const surf  = (large + med + fine) * t
    const stoneH = 0.36 + surf
    return t * stoneH + (1 - t) * edge * 0.18
  }
  const colorFn = (x: number, y: number, _h: number): [number,number,number] => {
    const i      = (y * S + x) * 3
    const edge   = (VOR[i+1] - VOR[i]) / MG
    const t      = smoothstep(Math.min(1, edge / 0.5))
    if (t < 0.5) {
      const mv = (92 + edge * 55) | 0
      return [mv, mv - 3, mv - 7]
    }
    // Re-hash the id through two independent seeds to break smooth-id clustering
    const scramble = hash(Math.floor(VOR[i+2] * 1000) * 7 + 3, Math.floor(VOR[i+2] * 1000) * 13 + 97)
    const base = 108 + scramble * 58
    const surf = fbm(x / S * 10, y / S * 10, 3) * 24
    const v    = (base + surf) | 0
    return [Math.min(255, v), Math.min(255, v - 9), Math.min(255, v - 16)]
  }
  const roughFn = (x: number, y: number, _h: number) => {
    const i    = (y * S + x) * 3
    const edge = (VOR[i+1] - VOR[i]) / MG
    // Organic roughness variation via FBM — no grainy hash pattern
    return edge < 0.13 ? 0.96 : 0.68 + fbm(x / S * 5, y / S * 5, 2) * 0.22
  }
  return buildPBRMaps(S, 68, heightFn, colorFn, roughFn)
}

/**
 * Drywall — 4-octave fine FBM orange-peel, very low displacement, near-white warm tint.
 */
function makeDrywallMaps(S: number): WallMaps {
  const heightFn = (x: number, y: number) => 0.42 + fbm(x / S * 18, y / S * 18, 4) * 0.16
  const colorFn  = (_x: number, _y: number, h: number): [number,number,number] => {
    const v = (234 + h * 10) | 0
    return [Math.min(255, v), Math.min(255, v - 2), Math.min(255, v - 8)]
  }
  const roughFn = (_x: number, _y: number, h: number) => 0.87 - h * 0.06
  return buildPBRMaps(S, 5, heightFn, colorFn, roughFn)
}

// ─── Wall material config + hook ──────────────────────────────────────────────

type WallMaterial = "brick" | "concrete" | "plaster" | "stone" | "drywall"

interface WallCfg {
  builder: (s: number) => WallMaps; dispScale: number; normScale: number
  texSize: number; sideTint: string; sideRough: number
}
const WALL_CFG: Record<WallMaterial, WallCfg> = {
  brick:    { builder: makeBrickMaps,   dispScale: 0.09,  normScale: 1.8, texSize: 512, sideTint: "#7a3420", sideRough: 0.92 },
  concrete: { builder: makeConcreteMap, dispScale: 0.055, normScale: 1.8, texSize: 1024, sideTint: "#787872", sideRough: 0.94 },
  plaster:  { builder: makePlasterMaps, dispScale: 0.16,  normScale: 2.6, texSize: 512, sideTint: "#b09a84", sideRough: 0.97 },
  stone:    { builder: makeStoneMaps,   dispScale: 0.10,  normScale: 2.0, texSize: 1024, sideTint: "#686058", sideRough: 0.95 },
  drywall:  { builder: makeDrywallMaps, dispScale: 0.016, normScale: 0.6, texSize: 512, sideTint: "#9e9a94", sideRough: 0.96 },
}

function useWallPBR(material: WallMaterial) {
  const cfg = WALL_CFG[material]
  // Halve texture size on mobile to prevent GPU memory exhaustion
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const texSize = isMobile ? Math.max(256, cfg.texSize >> 1) : cfg.texSize
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const maps = useMemo(() => cfg.builder(texSize), [material])
  // Dispose GPU textures when this card unmounts
  useEffect(() => {
    return () => {
      maps.albedo.dispose()
      maps.displacement.dispose()
      maps.normal.dispose()
      maps.roughness.dispose()
    }
  }, [maps])
  return { maps, dispScale: cfg.dispScale, normScale: cfg.normScale, sideTint: cfg.sideTint, sideRough: cfg.sideRough }
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Screw({ p }: { p: [number, number, number] }) {
  const mat = useMemo(() => mkBrushedSteel(), [])
  const slotMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#18191f", metalness: 0.9, roughness: 0.25 }), [])
  return (
    <group position={p}>
      <mesh castShadow><cylinderGeometry args={[0.021, 0.018, 0.022, 12]} /><primitive object={mat} /></mesh>
      {[0, Math.PI / 2].map((r) => (
        <mesh key={r} position={[0, 0.012, 0]} rotation={[0, r, 0]} castShadow>
          <boxGeometry args={[0.029, 0.005, 0.006]} /><primitive object={slotMat} />
        </mesh>
      ))}
    </group>
  )
}

function WallPlate({ w = 0.28, h = 0.40 }: { w?: number; h?: number }) {
  const mat = useMemo(() => mkGunmetal(), [])
  return (
    <group>
      <mesh castShadow receiveShadow><boxGeometry args={[w, h, 0.026]} /><primitive object={mat} /></mesh>
      <mesh position={[0, 0, 0.014]}>
        <boxGeometry args={[w * 0.44, h * 0.07, 0.004]} />
        <meshStandardMaterial color="#14161c" metalness={0.92} roughness={0.12} />
      </mesh>
      {([[-1,-1],[1,-1],[-1,1],[1,1]] as [number,number][]).map(([sx, sy], i) => (
        <Screw key={i} p={[sx * w * 0.36, sy * h * 0.37, 0.013]} />
      ))}
    </group>
  )
}

/** Realistic US duplex outlet */
function Outlet({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.118, 0.165, 0.009]} />
        <meshStandardMaterial color="#f4f2ef" roughness={0.72} metalness={0.02} />
      </mesh>
      {([[0, 0.062],[0,-0.062]] as [number,number][]).map(([px,py],i) => (
        <mesh key={i} position={[px, py, 0.006]}>
          <cylinderGeometry args={[0.007, 0.006, 0.006, 8]} />
          <meshStandardMaterial color={C.steel} metalness={0.92} roughness={0.3} />
        </mesh>
      ))}
      {([-0.025, 0.025] as const).map((ox) => (
        <group key={ox} position={[ox, 0, 0.014]}>
          <mesh position={[0, 0.022, 0]}><boxGeometry args={[0.015, 0.026, 0.002]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
          <mesh position={[0, -0.008, 0]}><boxGeometry args={[0.015, 0.026, 0.002]} /><meshStandardMaterial color="#1a1a1a" /></mesh>
          <mesh position={[0, -0.038, 0]} rotation={[Math.PI/2, 0, 0]}>
            <cylinderGeometry args={[0.009, 0.009, 0.003, 8]} /><meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Full TV panel — bezel + glass with interior screen glow */
function TVPanel({ children }: { children?: React.ReactNode }) {
  const sideBezelMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: "#111214", metalness: 0.0, roughness: 0.10,
      clearcoat: 1.0, clearcoatRoughness: 0.06, envMapIntensity: 1.8,
    }), []
  )
  const screenTex = useMemo(() => getSunsetTex(), [])
  return (
    <group>
      {/* Bezel — black glossy plastic, smooth (no displacement) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.64, 0.97, 0.068]} />
        <primitive object={sideBezelMat} />
      </mesh>
      {/* Screen — sunset canvas texture with glass clearcoat */}
      <mesh position={[0, 0.006, 0.036]}>
        <boxGeometry args={[1.52, 0.862, 0.003]} />
        <meshPhysicalMaterial
          map={screenTex ?? undefined}
          emissive={new THREE.Color("#0a1828")}
          emissiveIntensity={0.35}
          roughness={0.04} metalness={0.0}
          clearcoat={1.0} clearcoatRoughness={0.008}
          envMapIntensity={0.8}
        />
      </mesh>
      {/* Screen ambient glow — warm light from sunset content */}
      <pointLight position={[0, 0.006, 0.12]} intensity={0.35} color="#d07820" distance={1.2} decay={2} />
      {/* Branding LED strip */}
      <mesh position={[0, -0.462, 0.026]}>
        <boxGeometry args={[1.18, 0.007, 0.007]} />
        <meshStandardMaterial color={C.purple} emissive={C.purple} emissiveIntensity={2.2} />
      </mesh>
      <mesh position={[0.0, -0.462, 0.036]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color={C.green} emissive={C.green} emissiveIntensity={2.8} />
      </mesh>
      {/* Camera notch */}
      <mesh position={[0, 0.46, 0.036]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.004, 10]} />
        <meshStandardMaterial color="#1a1c24" metalness={0.9} roughness={0.12} />
      </mesh>
      {children}
    </group>
  )
}

/**
 * Wall — thick box so it fills the frame from any camera angle.
 * Using a box (not plane) means the sides are also shaded surfaces,
 * never leaving a transparent void even on very wide aspect ratios.
 */
function Wall({ color = "#e8e4dd", tex }: { color?: string; tex?: THREE.Texture }) {
  return (
    <mesh receiveShadow position={[0, 0.2, -0.12]}>
      <boxGeometry args={[100, 100, 0.18]} />
      {tex
        ? <meshPhysicalMaterial map={tex} roughness={0.8} metalness={0.0} clearcoat={0.04} clearcoatRoughness={0.5} />
        : <meshPhysicalMaterial color={color} roughness={0.8} metalness={0.0} clearcoat={0.04} clearcoatRoughness={0.5} />}
    </mesh>
  )
}

/** Floor — wide enough to fill any aspect ratio at any camera position. */
function Floor({ color = "#d8d4cc" }: { color?: string }) {
  return (
    <mesh receiveShadow position={[0, -1.10, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100, 32, 32]} />
      <meshPhysicalMaterial color={color} roughness={0.8} metalness={0.0} clearcoat={0.06} clearcoatRoughness={0.6} />
    </mesh>
  )
}

function Lights() {
  return (
    <>
      <hemisphereLight args={["#cce4ff", "#f0ede6", 0.45]} />
      {/* Key light — warm overhead, strong enough to read chrome detail */}
      <directionalLight position={[3.5, 5.5, 4.5]} intensity={1.8} castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-near={0.1} shadow-camera-far={24}
        shadow-camera-left={-3.5} shadow-camera-right={3.5}
        shadow-camera-top={3.5} shadow-camera-bottom={-3.5}
        shadow-bias={-0.0006} shadow-normalBias={0.018} color="#fff2e8" />
      {/* Fill light — cool rim that separates gunmetal from background */}
      <directionalLight position={[-4, 2, 3]} intensity={0.6} color="#c8d8ff" />
      <pointLight position={[-3, -1.5, 3]} intensity={0.5} color="#ffe8cc" />
      <pointLight position={[2.5, 1, -1]} intensity={0.35} color="#c8a4ff" />
    </>
  )
}

// ─── Mount-scene backdrop utilities ──────────────────────────────────────────

/**
 * Procedural warm painted-wall texture (albedo + normal) for mount-item backdrops.
 * Module-level singleton — generated once, shared across all mount scenes.
 */
let _mountWallTex: { alb: THREE.DataTexture; nrm: THREE.DataTexture } | null = null
function getMountWallTex() {
  if (typeof window === "undefined") return null
  if (_mountWallTex) return _mountWallTex
  const S = 256
  const aData = new Uint8Array(S * S * 4)
  const nData = new Uint8Array(S * S * 4)
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S, v = y / S
      // Layered brush-stroke noise — large strokes + fine micro texture
      const stroke = fbm(u * 4.5, v * 4.5, 4, 2.0, 0.5)
      const micro  = fbm(u * 20,  v * 20,  2, 2.2, 0.4)
      const n = stroke * 0.72 + micro * 0.28
      // Warm ivory: base R=238 G=232 B=220
      const r = Math.min(255, Math.round(234 + n * 18))
      const g = Math.min(255, Math.round(228 + n * 14))
      const b = Math.min(255, Math.round(216 + n * 10))
      const i = (y * S + x) * 4
      aData[i] = r; aData[i+1] = g; aData[i+2] = b; aData[i+3] = 255
      // Subtle surface normals from brush-stroke gradient
      const eps = 1 / S
      const dx = fbm((u + eps) * 8, v * 8, 2) - fbm((u - eps) * 8, v * 8, 2)
      const dy = fbm(u * 8, (v + eps) * 8, 2) - fbm(u * 8, (v - eps) * 8, 2)
      const sc = 0.10
      nData[i]   = Math.round((-dx * sc + 0.5) * 255)
      nData[i+1] = Math.round((-dy * sc + 0.5) * 255)
      nData[i+2] = 255; nData[i+3] = 255
    }
  }
  const alb = new THREE.DataTexture(aData, S, S, THREE.RGBAFormat)
  const nrm = new THREE.DataTexture(nData, S, S, THREE.RGBAFormat)
  alb.colorSpace = THREE.SRGBColorSpace
  ;[alb, nrm].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.needsUpdate = true })
  _mountWallTex = { alb, nrm }
  return _mountWallTex
}

/**
 * Procedural oak wood-grain texture for shelf boards.
 * Module-level singleton.
 */
let _woodTex: THREE.DataTexture | null = null
function getWoodTex() {
  if (typeof window === "undefined") return null
  if (_woodTex) return _woodTex
  const S = 256
  const data = new Uint8Array(S * S * 4)
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const u = x / S, v = y / S
      // Horizontal grain + subtle ring lines
      const grain = fbm(u * 22, v * 2.8, 4, 2.0, 0.5)
      const ring  = Math.sin((u * 14 + grain * 4.5) * Math.PI * 2) * 0.5 + 0.5
      const knot  = valueNoise(u * 5, v * 1.2)
      const n = grain * 0.55 + ring * 0.32 + knot * 0.13
      // Oak: warm light-tan to medium-brown
      const r = Math.min(255, Math.round(152 + n * 68))
      const g = Math.min(255, Math.round(108 + n * 52))
      const b = Math.min(255, Math.round(64  + n * 32))
      const i = (y * S + x) * 4
      data[i] = r; data[i+1] = g; data[i+2] = b; data[i+3] = 255
    }
  }
  const tex = new THREE.DataTexture(data, S, S, THREE.RGBAFormat)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  _woodTex = tex
  return _woodTex
}

// ─── Mount item PBR map generators (chisel/carve approach) ───────────────────
// Same technique as wall types: buildPBRMaps() + subdivided geometry +
// displacementMap deforms vertices — raking light catches all the carved relief.

/**
 * makeFrameMoldingMaps — dark walnut picture-frame ogee/cove molding.
 * heightFn encodes the molding cross-section from inner opening outward:
 *   0.00–0.18: rise to ovolo bead
 *   0.18–0.55: concave cove (the "chisel scoop")
 *   0.55–0.78: rise to raised outer shoulder
 *   0.78–1.00: outer lip plateau
 * FBM grain rides on the profile for the wood texture feel.
 */
let _frameMoldingMaps: WallMaps | null = null
function makeFrameMoldingMaps(S = 512): WallMaps | null {
  if (typeof window === "undefined") return null
  if (_frameMoldingMaps) return _frameMoldingMaps

  // u=0 outer edge of bar → u=1 inner opening edge; v=0..1 along bar length.
  const heightFn = (x: number, y: number): number => {
    const u = x / S  // profile axis: 0=outer edge, 1=inner opening
    const v = y / S  // along bar (grain direction)
    // Flip so t=0 inner edge, t=1 outer edge (matches molding convention)
    const t = 1 - u
    let profile: number
    if      (t < 0.18) profile = 0.65 * smoothstep(t / 0.18)
    else if (t < 0.38) profile = 0.65 - 0.50 * smoothstep((t - 0.18) / 0.20)
    else if (t < 0.55) profile = 0.15
    else if (t < 0.78) profile = 0.15 + 0.70 * smoothstep((t - 0.55) / 0.23)
    else               profile = 0.85
    const grain = fbm(u * 20, v * 6, 4, 2, 0.5) * 0.07
    return Math.min(1, Math.max(0, profile + grain - 0.03))
  }

  const colorFn = (x: number, y: number, _h: number): [number, number, number] => {
    const u = x / S, v = y / S
    const n = fbm(u * 22, v * 6, 4, 2, 0.5) * 0.65 + valueNoise(u * 9, v * 2.5) * 0.35
    return [
      Math.min(255, Math.round(66  + n * 44)),
      Math.min(255, Math.round(40  + n * 28)),
      Math.min(255, Math.round(18  + n * 14)),
    ]
  }

  const roughFn = (_x: number, _y: number, h: number) => 0.50 + (1 - h) * 0.32

  _frameMoldingMaps = buildPBRMaps(S, 24, heightFn, colorFn, roughFn)
  return _frameMoldingMaps
}

/**
 * makeTVBezelMaps — premium brushed-plastic TV bezel.
 * heightFn: flat main face with chamfered inner edge (screen recession) +
 * horizontal micro-brush lines for the premium-plastic texture.
 */
let _tvBezelMaps: WallMaps | null = null
function makeTVBezelMaps(S = 512): WallMaps | null {
  if (typeof window === "undefined") return null
  if (_tvBezelMaps) return _tvBezelMaps

  const heightFn = (x: number, y: number): number => {
    const u = x / S, v = y / S
    // u = perpendicular-to-bar axis (0=inner/screen edge, 1=outer edge)
    // Chamfer: rises from 0 at inner edge to flat plateau
    const chamfer = u < 0.25 ? smoothstep(u / 0.25) * 0.45 : 0.45
    // Micro horizontal brush lines
    const brush = fbm(u * 3, v * 90, 2, 2, 0.5) * 0.038
    // Slight crown across face
    const crown = Math.sin(u * Math.PI) * 0.04
    return Math.min(1, Math.max(0, chamfer + brush + crown))
  }

  const colorFn = (x: number, y: number, _h: number): [number, number, number] => {
    const micro = fbm(x / S * 50, y / S * 3, 2, 2, 0.5) * 10
    const base = 16 + (micro | 0)
    return [base, base + 1, Math.min(255, base + 4)]
  }

  const roughFn = (x: number, y: number, _h: number) =>
    0.22 + fbm(x / S * 30, y / S * 2, 2, 2, 0.5) * 0.10

  _tvBezelMaps = buildPBRMaps(S, 16, heightFn, colorFn, roughFn)
  return _tvBezelMaps
}

/**
 * makeShelfReliefMaps — deep oak wood-grain displacement on shelf top face.
 * Annual rings (wavy bands) + ray pores + coarse grain waviness.
 * Raking key light catches the corrugated grain as real wood depth.
 */
let _shelfReliefMaps: WallMaps | null = null
function makeShelfReliefMaps(S = 512): WallMaps | null {
  if (typeof window === "undefined") return null
  if (_shelfReliefMaps) return _shelfReliefMaps

  const heightFn = (x: number, y: number): number => {
    const u = x / S, v = y / S
    const rings = Math.sin((u * 10 + fbm(u * 5, v * 2, 3) * 1.8) * Math.PI * 2) * 0.5 + 0.5
    const rays  = valueNoise(u * 55, v * 8) * 0.18
    const grain = fbm(u * 4, v * 28, 4, 2, 0.5) * 0.22
    return Math.min(1, Math.max(0, rings * 0.60 + rays + grain))
  }

  const colorFn = (x: number, y: number, h: number): [number, number, number] => {
    const n = h * 0.65 + fbm(x / S * 18, y / S * 5, 3) * 0.35
    return [
      Math.min(255, Math.round(162 + n * 58)),
      Math.min(255, Math.round(114 + n * 42)),
      Math.min(255, Math.round(58  + n * 26)),
    ]
  }

  const roughFn = (_x: number, _y: number, h: number) => 0.48 + (1 - h) * 0.28

  _shelfReliefMaps = buildPBRMaps(S, 13, heightFn, colorFn, roughFn)
  return _shelfReliefMaps
}

/**
 * makeMirrorFrameMaps — brushed silver concave-shoulder molding.
 * Same ogee silhouette as the wood frame but in cool silver:
 * directional brush marks run along the bar length.
 */
let _mirrorFrameMaps: WallMaps | null = null
function makeMirrorFrameMaps(S = 512): WallMaps | null {
  if (typeof window === "undefined") return null
  if (_mirrorFrameMaps) return _mirrorFrameMaps

  const heightFn = (x: number, y: number): number => {
    const u = x / S, v = y / S
    const t = 1 - u  // 0=inner opening, 1=outer edge
    let profile: number
    if      (t < 0.20) profile = smoothstep(t / 0.20) * 0.60
    else if (t < 0.42) profile = 0.60 - smoothstep((t - 0.20) / 0.22) * 0.52
    else if (t < 0.60) profile = 0.08
    else if (t < 0.80) profile = 0.08 + smoothstep((t - 0.60) / 0.20) * 0.82
    else               profile = 0.90
    const brush = fbm(v * 70, u * 2, 2, 2, 0.5) * 0.05
    return Math.min(1, Math.max(0, profile + brush))
  }

  const colorFn = (_x: number, y: number, h: number): [number, number, number] => {
    const v = y / S
    const b = fbm(v * 80, _x / S * 4, 2) * 28
    const base = Math.round(186 + h * 34 + b)
    return [Math.min(255, base - 5), Math.min(255, base), Math.min(255, base + 10)]
  }

  const roughFn = (_x: number, _y: number, h: number) => 0.10 + (1 - h) * 0.20

  _mirrorFrameMaps = buildPBRMaps(S, 20, heightFn, colorFn, roughFn)
  return _mirrorFrameMaps
}

// ─── Displaced bar helper ─────────────────────────────────────────────────────

/**
 * DisplacedBar — a subdivided plane that shows the chiseled molding relief.
 * Positioned at the front face of a frame/bezel bar.
 * The displacement map deforms vertices along +Z so raking light creates depth.
 */
function DisplacedBar({
  pos, size, maps, dispScale, normScale, metalness = 0.04, clearcoat = 0.18, rotZ = 0,
}: {
  pos:   [number, number, number]
  size:  [number, number]
  maps:  WallMaps
  dispScale:  number
  normScale:  number
  metalness?: number
  clearcoat?: number
  rotZ?: number
}) {
  return (
    <mesh position={pos} rotation={[0, 0, rotZ]} castShadow receiveShadow>
      <planeGeometry args={[size[0], size[1], 128, 64]} />
      <meshPhysicalMaterial
        map={maps.albedo}
        displacementMap={maps.displacement}
        displacementScale={dispScale}
        normalMap={maps.normal}
        normalScale={new THREE.Vector2(normScale, normScale)}
        roughnessMap={maps.roughness}
        roughness={1}
        metalness={metalness}
        clearcoat={clearcoat}
        clearcoatRoughness={0.40}
      />
    </mesh>
  )
}

/**
 * MountLookAtRig — locks the camera to look at the scene object center every frame.
 * Required because PerspectiveCamera with a side-offset position (x≠0) defaults to
 * looking along -Z, which shifts objects off-center. This mirrors WallCamRig exactly.
 */
function MountLookAtRig({ y = 0.0 }: { y?: number }) {
  useFrame(({ camera }) => { camera.lookAt(0, y, 0) })
  return null
}

/**
 * Lavender infinity-cove backdrop for mount-item scenes.
 * Matches the wall-type aesthetic: same #d6ccea background, same sphere cyclorama.
 */
function MountWall() {
  return (
    <>
      {/* Lavender background — matches wall type cards exactly */}
      <color attach="background" args={["#d6ccea"]} />
      {/* Sphere interior = seamless cyclorama — no visible wall/floor seam */}
      <mesh>
        <sphereGeometry args={[7, 32, 18]} />
        <meshStandardMaterial color="#c8bedf" roughness={1} metalness={0} side={THREE.BackSide} envMapIntensity={0} />
      </mesh>
      {/* Backing wall — subtle lavender-tinted painted surface behind objects */}
      <mesh receiveShadow position={[0, 0.2, -0.14]}>
        <boxGeometry args={[100, 100, 0.10]} />
        <meshPhysicalMaterial color="#cfc8e8" roughness={0.88} metalness={0.0} clearcoat={0.02} clearcoatRoughness={0.8} />
      </mesh>
    </>
  )
}

/** Lavender-tinted floor to match the wall-type aesthetic */
function MountFloor() {
  return (
    <mesh receiveShadow position={[0, -1.10, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100, 1, 1]} />
      <meshPhysicalMaterial color="#c4bdd8" roughness={0.72} metalness={0.02} clearcoat={0.08} clearcoatRoughness={0.55} />
    </mesh>
  )
}

/** Lighting rig matching the wall types: left raking + top key + lavender hemisphere */
function MountSceneLights() {
  return (
    <>
      {/* Lavender hemisphere — same as wall types for consistent aesthetic */}
      <hemisphereLight args={["#f0eaff", "#ffffff", 0.60]} />
      {/* Left raking — shallow angle catches every displaced edge and relief detail */}
      <directionalLight position={[-5, 2.0, 3.0]} intensity={1.70} color="#fff8f0" castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-near={0.1} shadow-camera-far={20}
        shadow-camera-left={-3} shadow-camera-right={3}
        shadow-camera-top={3} shadow-camera-bottom={-3}
        shadow-bias={-0.0004} shadow-normalBias={0.012} />
      {/* Top key — warm overhead fill */}
      <directionalLight position={[3.2, 5.0, 3.8]} intensity={1.30} color="#fff6ec" />
      {/* Soft lavender fill from right — prevents dead-black shadows */}
      <pointLight position={[2.5, 0.5, 2.0]} intensity={0.25} color="#e8e0f8" />
    </>
  )
}

// ─── Canvas texture generators (mount scenes) ─────────────────────────────────

/** Cinematic sunset landscape for the TV screen — generated once and cached */
let _sunsetTex: THREE.CanvasTexture | null = null
function getSunsetTex(): THREE.CanvasTexture | null {
  if (typeof window === "undefined") return null
  if (_sunsetTex) return _sunsetTex
  const W = 512, H = 290
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H
  const ctx = cv.getContext("2d")!

  // Sky gradient — deep night blue → warm orange → bright horizon
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.70)
  sky.addColorStop(0,    "#08122e")
  sky.addColorStop(0.30, "#12285c")
  sky.addColorStop(0.58, "#8a3810")
  sky.addColorStop(0.80, "#c85e10")
  sky.addColorStop(1,    "#f0a018")
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H * 0.70)

  // Sun glow halo
  const sg = ctx.createRadialGradient(W*0.54, H*0.53, 0, W*0.54, H*0.53, W*0.14)
  sg.addColorStop(0,    "#fff8c0"); sg.addColorStop(0.3, "#ffcc28")
  sg.addColorStop(0.7,  "rgba(255,140,0,0.30)"); sg.addColorStop(1, "rgba(255,80,0,0)")
  ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H * 0.70)

  // Sun disc
  ctx.fillStyle = "#ffe060"
  ctx.beginPath(); ctx.arc(W*0.54, H*0.52, W*0.038, 0, Math.PI*2); ctx.fill()

  // Mountain silhouette
  ctx.fillStyle = "#060c1a"
  ctx.beginPath()
  ctx.moveTo(0, H*0.70)
  ctx.lineTo(0,       H*0.54)
  ctx.lineTo(W*0.10,  H*0.46)
  ctx.lineTo(W*0.20,  H*0.52)
  ctx.lineTo(W*0.30,  H*0.38)  // main peak
  ctx.lineTo(W*0.40,  H*0.50)
  ctx.lineTo(W*0.52,  H*0.42)  // secondary peak
  ctx.lineTo(W*0.63,  H*0.54)
  ctx.lineTo(W*0.74,  H*0.40)  // right peak
  ctx.lineTo(W*0.88,  H*0.52)
  ctx.lineTo(W,       H*0.48)
  ctx.lineTo(W,       H*0.70)
  ctx.closePath(); ctx.fill()

  // Atmospheric haze at mountain base
  const haze = ctx.createLinearGradient(0, H*0.44, 0, H*0.70)
  haze.addColorStop(0, "rgba(60,30,10,0)"); haze.addColorStop(1, "rgba(60,30,10,0.22)")
  ctx.fillStyle = haze; ctx.fillRect(0, H*0.44, W, H*0.26)

  // Water
  const wtr = ctx.createLinearGradient(0, H*0.70, 0, H)
  wtr.addColorStop(0, "#060e1a"); wtr.addColorStop(1, "#020608")
  ctx.fillStyle = wtr; ctx.fillRect(0, H*0.70, W, H*0.30)

  // Golden water reflection
  for (let i = 0; i < 14; i++) {
    const wy = H*0.72 + i*6
    const hw = Math.max(2, (0.22 - i*0.013) * W)
    ctx.fillStyle = `rgba(240,150,28,${Math.max(0, 0.58 - i*0.038)})`
    ctx.fillRect(W*0.54 - hw, wy, hw*2, 2 + (i % 3 === 0 ? 1 : 0))
  }

  _sunsetTex = new THREE.CanvasTexture(cv)
  _sunsetTex.colorSpace = THREE.SRGBColorSpace
  _sunsetTex.needsUpdate = true
  return _sunsetTex
}

/** Ragdoll cat oil portrait for the art frame — generated once and cached */
let _paintingTex: THREE.CanvasTexture | null = null
function getPaintingTex(): THREE.CanvasTexture | null {
  if (typeof window === "undefined") return null
  if (_paintingTex) return _paintingTex

  // Canvas portrait — matches painting mesh 0.64×1.12 (ratio 0.5714)
  const W = 800, H = 1400
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H
  const ctx = cv.getContext("2d")!

  // ─── Seeded deterministic RNG ──────────────────────────────────────────
  let _seed = 251
  const rng = () => { _seed = (_seed * 1664525 + 1013904223) & 0xffffffff; return ((_seed >>> 0) / 0xffffffff) }

  // SCRATCH REWRITE — head/body unified, fur-first, 3D-render quality
  // Approach: soft underpaint establishes 3D form → thousands of directional
  // fur strokes bury the underpaint → only fur is visible, no shape outlines.

  // ─── Anatomy ────────────────────────────────────────────────────────────
  // Head and body positioned so they TOUCH — no gap, mane bridges the seam.
  // Head center Y + head half-height  ≈  Body center Y - body half-height
  const hx = W*0.500, hy = H*0.210   // head centre
  const hw = W*0.215, hh = H*0.108   // head half-width / half-height
  //   → head bottom = H*0.318 = 445 px
  const bx = W*0.500, by = H*0.476   // body centre  (moved up from 0.545)
  const brx = W*0.225, bry = H*0.158 // body half-width / half-height
  //   → body top  = H*0.318 = 445 px  (identical — they touch)

  ctx.lineCap = "round"

  // ─── Background ─────────────────────────────────────────────────────────
  ctx.fillStyle = "#0a0d12"; ctx.fillRect(0, 0, W, H)
  const bgSpot = ctx.createRadialGradient(W*0.50, H*0.40, 18, W*0.50, H*0.40, H*0.64)
  bgSpot.addColorStop(0,    "rgba(72,92,114,0.50)")
  bgSpot.addColorStop(0.50, "rgba(42,56,72,0.22)")
  bgSpot.addColorStop(1,    "rgba(0,0,0,0)")
  ctx.fillStyle = bgSpot; ctx.fillRect(0, 0, W, H)
  // Canvas linen texture
  for (let i = 0; i < 300; i++) {
    const y0 = rng()*H
    ctx.strokeStyle = `rgba(${46+rng()*18|0},${52+rng()*16|0},${60+rng()*14|0},${rng()*0.042})`
    ctx.lineWidth = 1+rng()*2.4
    ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0+(rng()-0.5)*3); ctx.stroke()
  }

  // ─── TAIL ───────────────────────────────────────────────────────────────
  // Blue-grey, wrapping right side of body, base joins body
  const tSx = bx+brx*0.74, tSy = by+bry*0.30
  const tEx = bx+brx*1.14, tEy = by-bry*0.86
  const tC1x = bx+brx*1.62, tC1y = by+bry*0.10
  const tC2x = bx+brx*1.82, tC2y = by-bry*0.58
  // Shadow
  ctx.strokeStyle = "rgba(0,0,0,0.44)"; ctx.lineWidth = 38
  ctx.beginPath(); ctx.moveTo(tSx,tSy); ctx.bezierCurveTo(tC1x,tC1y,tC2x,tC2y,tEx,tEy); ctx.stroke()
  // Tail body gradient (white at body junction → steel blue-grey → dark tip)
  const tailG = ctx.createLinearGradient(tSx,tSy,tEx,tEy)
  tailG.addColorStop(0,    "#dddad4"); tailG.addColorStop(0.28, "#7a8fa0")
  tailG.addColorStop(0.75, "#566070"); tailG.addColorStop(1,    "#3c4858")
  ctx.strokeStyle = tailG; ctx.lineWidth = 28
  ctx.beginPath(); ctx.moveTo(tSx,tSy); ctx.bezierCurveTo(tC1x,tC1y,tC2x,tC2y,tEx,tEy); ctx.stroke()
  // Highlight sheen
  const tailSh = ctx.createLinearGradient(tSx,tSy,tEx,tEy)
  tailSh.addColorStop(0, "rgba(228,224,218,0.38)"); tailSh.addColorStop(0.3, "rgba(152,178,200,0.32)"); tailSh.addColorStop(1, "rgba(92,112,134,0.15)")
  ctx.strokeStyle = tailSh; ctx.lineWidth = 10
  ctx.beginPath(); ctx.moveTo(tSx-4,tSy-2); ctx.bezierCurveTo(tC1x-4,tC1y-2,tC2x-4,tC2y-4,tEx-3,tEy-2); ctx.stroke()
  // Tail fur — perpendicular directional strokes following curve
  for (let i = 0; i < 220; i++) {
    const t = rng()
    const mt = 1-t, mt2 = mt*mt, mt3 = mt2*mt, t2 = t*t, t3 = t2*t
    const px = mt3*tSx + 3*mt2*t*tC1x + 3*mt*t2*tC2x + t3*tEx + (rng()-0.5)*20
    const py = mt3*tSy + 3*mt2*t*tC1y + 3*mt*t2*tC2y + t3*tEy + (rng()-0.5)*20
    const dpx = 3*(mt2*(tC1x-tSx)+2*mt*t*(tC2x-tC1x)+t2*(tEx-tC2x))
    const dpy = 3*(mt2*(tC1y-tSy)+2*mt*t*(tC2y-tC1y)+t2*(tEy-tC2y))
    const ang = Math.atan2(dpy,dpx) + Math.PI*0.5 + (rng()-0.5)*0.52
    const isBase = t < 0.26
    const r = isBase ? (210+rng()*20|0) : (88+rng()*26|0)
    const g = isBase ? (207+rng()*16|0) : (104+rng()*22|0)
    const b = isBase ? (200+rng()*14|0) : (120+rng()*24|0)
    ctx.strokeStyle = `rgba(${r},${g},${b},${0.12+rng()*0.26})`; ctx.lineWidth = 0.9+rng()*1.5
    ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+Math.cos(ang)*(8+rng()*16), py+Math.sin(ang)*(8+rng()*16)); ctx.stroke()
  }

  // ─── HIND LEGS ──────────────────────────────────────────────────────────
  // White, rounded bumps flanking the body base — built entirely with fur
  const paintHindLeg = (side: number) => {
    const lx = bx + side*brx*0.84, ly = by+bry*0.62
    const lrx = brx*0.32, lry = bry*0.52
    // Soft drop shadow (large, blurred)
    const shG = ctx.createRadialGradient(lx+side*4, ly+8, 4, lx, ly, lrx*1.4)
    shG.addColorStop(0, "rgba(0,0,0,0.44)"); shG.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = shG; ctx.fillRect(lx-lrx*1.5,ly-lry*0.6,lrx*3,lry*2.0)
    // 3D underpaint (very soft, barely visible under fur)
    const baseG = ctx.createRadialGradient(lx-side*lrx*0.28, ly-lry*0.28, 4, lx, ly, lrx*1.10)
    baseG.addColorStop(0,   "rgba(255,255,255,0.30)")
    baseG.addColorStop(0.60,"rgba(230,228,222,0.18)")
    baseG.addColorStop(1,   "rgba(160,156,148,0.10)")
    ctx.fillStyle = baseG; ctx.beginPath(); ctx.ellipse(lx,ly,lrx,lry,side*0.08,0,Math.PI*2); ctx.fill()
    // Dense fur strokes — white, lit upper-left
    for (let i = 0; i < 420; i++) {
      const fx = lx + (rng()-0.5)*lrx*2.14
      const fy = ly + (rng()-0.5)*lry*2.14
      if (Math.hypot((fx-lx)/lrx,(fy-ly)/lry) > 1.06) continue
      const xF = (fx-lx)/lrx, yF = (fy-ly)/lry
      // Lighting: bright upper-left, dark lower-right
      const lit = Math.max(0.15, 0.5 - xF*side*0.3 - yF*0.28 + 0.3)
      const ang = Math.atan2(fy-(ly-lry*0.26),fx-lx) + (rng()-0.5)*0.42
      const v = (185+lit*65)|0
      ctx.strokeStyle = `rgba(${v},${v-1},${v-4},${0.07+rng()*lit*0.26})`; ctx.lineWidth = 0.8+rng()*1.3
      ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(fx+Math.cos(ang)*(7+rng()*17), fy+Math.sin(ang)*(7+rng()*17)); ctx.stroke()
    }
    // Paw — flat, wider than leg, with toe knuckles
    const pawY = ly + lry*0.84
    for (let i = 0; i < 120; i++) {
      const fx = lx+(rng()-0.5)*lrx*1.44, fy = pawY+(rng()-0.5)*lry*0.28
      if (Math.abs(fx-lx)>lrx*0.72||Math.abs(fy-pawY)>lry*0.15) continue
      const ang = (rng()-0.5)*0.45
      const v = (208+rng()*36|0)
      ctx.strokeStyle = `rgba(${v},${v-1},${v-3},${0.10+rng()*0.22})`; ctx.lineWidth = 0.8+rng()*1.2
      ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(fx+Math.cos(ang)*(5+rng()*11), fy+Math.sin(ang)*(5+rng()*11)); ctx.stroke()
    }
    for (let t=-1.5; t<=1.6; t++) {
      ctx.strokeStyle = "rgba(162,158,150,0.48)"; ctx.lineWidth = 0.9
      ctx.beginPath(); ctx.arc(lx+t*lrx*0.27, pawY, lrx*0.15, 0, Math.PI*2); ctx.stroke()
    }
    ctx.fillStyle = "rgba(196,82,98,0.24)"
    ctx.beginPath(); ctx.ellipse(lx,pawY+lry*0.06,lrx*0.46,lry*0.13,0,0,Math.PI*2); ctx.fill()
  }
  paintHindLeg(-1); paintHindLeg(1)

  // ─── BODY ───────────────────────────────────────────────────────────────
  // White chest/front, blue-grey saddle on sides. Built with fur strokes.
  // Soft shadow
  const bodySh = ctx.createRadialGradient(bx+4, by+10, 8, bx, by, brx*1.2)
  bodySh.addColorStop(0.72, "rgba(0,0,0,0)"); bodySh.addColorStop(0.94, "rgba(0,0,0,0.50)"); bodySh.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = bodySh; ctx.fillRect(bx-brx*1.3,by-bry*1.2,brx*2.6,bry*2.6)
  // Subsurface form underpaint (very soft)
  const bodyForm = ctx.createRadialGradient(bx-brx*0.14, by-bry*0.22, brx*0.10, bx, by, brx*1.08)
  bodyForm.addColorStop(0,    "rgba(245,244,240,0.34)")
  bodyForm.addColorStop(0.48, "rgba(230,228,222,0.20)")
  bodyForm.addColorStop(0.76, "rgba(148,168,188,0.20)")
  bodyForm.addColorStop(1,    "rgba(62,78,96,0.28)")
  ctx.fillStyle = bodyForm; ctx.beginPath(); ctx.ellipse(bx,by,brx,bry,0,0,Math.PI*2); ctx.fill()
  // Dense fur strokes
  for (let i = 0; i < 3400; i++) {
    const fx = bx + (rng()-0.5)*brx*2.20
    const fy = by + (rng()-0.5)*bry*2.20
    const dx = (fx-bx)/brx, dy = (fy-by)/bry
    if (dx*dx+dy*dy > 1.08) continue
    const sideFrac = Math.abs(dx)
    const ang = Math.atan2(fy-(by-bry*0.24),fx-bx) + (rng()-0.5)*0.46
    const len = 8+rng()*20
    let r: number, g: number, b: number, a: number
    if (sideFrac < 0.44) {
      // White chest
      const yLit = Math.max(0.2, 0.6 - dy*0.20)
      r=235+rng()*14|0; g=233+rng()*12|0; b=228+rng()*10|0; a=(0.09+rng()*0.26)*yLit
    } else if (sideFrac < 0.70) {
      // Transition
      const tf = (sideFrac-0.44)/0.26
      r=(235-tf*148+rng()*18)|0; g=(232-tf*136+rng()*16)|0; b=(226-tf*114+rng()*16)|0; a=0.12+rng()*0.28
    } else {
      // Blue-grey saddle
      r=84+rng()*28|0; g=94+rng()*24|0; b=110+rng()*26|0; a=0.14+rng()*0.32
    }
    ctx.strokeStyle = `rgba(${r},${g},${b},${a})`; ctx.lineWidth = 0.8+rng()*1.3
    ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(fx+Math.cos(ang)*len, fy+Math.sin(ang)*len); ctx.stroke()
  }
  // Rim light (warm amber backlit glow on body edge)
  const rimG = ctx.createRadialGradient(bx,by,brx*0.52,bx,by,brx*1.08)
  rimG.addColorStop(0.72,"rgba(0,0,0,0)"); rimG.addColorStop(0.90,"rgba(175,138,82,0.11)"); rimG.addColorStop(1,"rgba(0,0,0,0)")
  ctx.fillStyle = rimG; ctx.fillRect(bx-brx*1.2,by-bry*1.2,brx*2.4,bry*2.4)

  // ─── FRONT LEGS ─────────────────────────────────────────────────────────
  // White, cylindrically lit, flowing straight down from lower body
  const paintFrontLeg = (side: number) => {
    const lx = bx+side*brx*0.34
    const lyTop = by+bry*0.72, lyBot = lyTop + H*0.108
    const lw = brx*0.22
    // Soft shadow
    ctx.fillStyle = "rgba(0,0,0,0.28)"
    ctx.beginPath()
    ctx.moveTo(lx-lw+4,lyTop+3); ctx.lineTo(lx+lw+4,lyTop+3)
    ctx.bezierCurveTo(lx+lw+4,lyBot+3,lx+lw*1.14+4,lyBot+6,lx,lyBot+6)
    ctx.bezierCurveTo(lx-lw*1.14+4,lyBot+6,lx-lw+4,lyBot+3,lx-lw+4,lyTop+3)
    ctx.fill()
    // Subsurface underpaint
    const legBase = ctx.createLinearGradient(lx-lw,0,lx+lw,0)
    legBase.addColorStop(0,    "rgba(185,182,176,0.20)")
    legBase.addColorStop(0.22, "rgba(238,236,230,0.22)")
    legBase.addColorStop(0.50, "rgba(255,255,255,0.26)")
    legBase.addColorStop(0.78, "rgba(220,218,212,0.20)")
    legBase.addColorStop(1,    "rgba(172,168,162,0.18)")
    ctx.fillStyle = legBase
    ctx.beginPath()
    ctx.moveTo(lx-lw,lyTop); ctx.lineTo(lx+lw,lyTop)
    ctx.bezierCurveTo(lx+lw,lyBot,lx+lw*1.12,lyBot+3,lx,lyBot+3)
    ctx.bezierCurveTo(lx-lw*1.12,lyBot+3,lx-lw,lyBot,lx-lw,lyTop)
    ctx.fill()
    // Fur strokes
    for (let i = 0; i < 180; i++) {
      const fy = lyTop+rng()*(lyBot-lyTop)
      const fx = lx+(rng()-0.5)*lw*2.12
      if (Math.abs(fx-lx)>lw*1.05) continue
      const xF = (fx-lx)/lw
      const litF = Math.max(0.12, 0.55-xF*0.44)
      const v = (192+litF*58)|0
      const ang = -Math.PI*0.5+(rng()-0.5)*0.22
      ctx.strokeStyle = `rgba(${v},${v-1},${v-4},${0.08+rng()*0.24})`; ctx.lineWidth = 0.8+rng()*1.2
      ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(fx+Math.cos(ang)*(6+rng()*14), fy+Math.sin(ang)*(6+rng()*14)); ctx.stroke()
    }
    // Paw
    const pawY = lyBot+3
    for (let i = 0; i < 80; i++) {
      const fx = lx+(rng()-0.5)*lw*2.0, fy = pawY+(rng()-0.5)*lw*0.64
      if (Math.abs(fx-lx)>lw*1.0||Math.abs(fy-pawY)>lw*0.58) continue
      const ang = (rng()-0.5)*0.48
      const v = 212+rng()*32|0
      ctx.strokeStyle = `rgba(${v},${v-1},${v-3},${0.10+rng()*0.22})`; ctx.lineWidth = 0.8+rng()*1.1
      ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(fx+Math.cos(ang)*(4+rng()*10), fy+Math.sin(ang)*(4+rng()*10)); ctx.stroke()
    }
    ;[-0.4,0,0.4].forEach(t => {
      ctx.strokeStyle="rgba(144,140,132,0.44)"; ctx.lineWidth=0.9
      ctx.beginPath(); ctx.moveTo(lx+t*lw*0.72,pawY-lw*0.35); ctx.lineTo(lx+t*lw*0.72,pawY+lw*0.10); ctx.stroke()
    })
    ctx.fillStyle="rgba(196,82,98,0.26)"; ctx.beginPath(); ctx.ellipse(lx,pawY+3,lw*0.56,lw*0.25,0,0,Math.PI*2); ctx.fill()
  }
  paintFrontLeg(-1); paintFrontLeg(1)

  // ─── MANE / RUFF ────────────────────────────────────────────────────────
  // THE CRITICAL CONNECTOR: mane center placed right at the head/body seam,
  // large enough to completely fill any visual gap and extend wide as a proper
  // ragdoll ruff. Cream = warm off-white, NOT pure white.
  // mCy placed at the exact seam point (hy+hh == by-bry == H*0.318)
  const mCx = bx, mCy = hy + hh + (by-bry-(hy+hh))*0.5  // midpoint of seam
  const mRx = brx*1.18, mRy = bry*1.42  // big oval, taller than wide to bridge gap

  // Shadow rim
  const maneSh = ctx.createRadialGradient(mCx+4, mCy+6, 8, mCx, mCy, mRx*1.0)
  maneSh.addColorStop(0.55,"rgba(0,0,0,0)"); maneSh.addColorStop(0.82,"rgba(0,0,0,0.30)"); maneSh.addColorStop(1,"rgba(0,0,0,0)")
  ctx.fillStyle = maneSh; ctx.fillRect(mCx-mRx*1.1,mCy-mRy*1.1,mRx*2.2,mRy*2.2)
  // Warm cream underpaint
  const maneBase = ctx.createRadialGradient(mCx-mRx*0.12, mCy-mRy*0.32, mRx*0.08, mCx, mCy, mRx*1.05)
  maneBase.addColorStop(0,    "rgba(252,242,220,0.52)")
  maneBase.addColorStop(0.38, "rgba(244,232,204,0.34)")
  maneBase.addColorStop(0.70, "rgba(228,210,168,0.22)")
  maneBase.addColorStop(0.90, "rgba(200,176,128,0.12)")
  maneBase.addColorStop(1,    "rgba(0,0,0,0)")
  ctx.fillStyle = maneBase; ctx.beginPath(); ctx.ellipse(mCx,mCy,mRx,mRy,0,0,Math.PI*2); ctx.fill()
  // Dense cream fur strokes — the mane form is defined by these strokes
  for (let i = 0; i < 1600; i++) {
    const fx = mCx+(rng()-0.5)*mRx*2.24
    const fy = mCy+(rng()-0.5)*mRy*2.24
    const dx = (fx-mCx)/mRx, dy = (fy-mCy)/mRy
    if (dx*dx+dy*dy > 1.06) continue
    const angToNeck = Math.atan2(fy-(mCy-mRy*0.20), fx-mCx)
    const ang = angToNeck + (rng()-0.5)*0.44
    const len = 14+rng()*34
    // Cream lighting: bright upper-left
    const litF = Math.max(0.2, 0.52-dx*0.28-dy*0.22)
    const r2=(218+litF*32)|0, g2=(196+litF*26)|0, b3=(152+litF*16)|0
    ctx.strokeStyle = `rgba(${r2},${g2},${b3},${0.08+rng()*0.22})`; ctx.lineWidth = 0.9+rng()*1.8
    ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(fx+Math.cos(ang)*len, fy+Math.sin(ang)*len); ctx.stroke()
  }
  // Long side wisps (the fringe that extends past body edges)
  ;[-1,1].forEach(side => {
    for (let i = 0; i < 160; i++) {
      const fx = mCx+side*(mRx*0.64+rng()*mRx*0.58)
      const fy = mCy-mRy*0.28+rng()*mRy*1.10
      const ang = side*(Math.PI*0.13+rng()*0.30)
      const r2=(206+rng()*30)|0, g2=(183+rng()*26)|0, b3=(142+rng()*18)|0
      ctx.strokeStyle = `rgba(${r2},${g2},${b3},${0.07+rng()*0.18})`; ctx.lineWidth = 1.0+rng()*1.9
      ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(fx+Math.cos(ang)*(20+rng()*48), fy+Math.sin(ang)*(20+rng()*48)); ctx.stroke()
    }
  })

  // ─── EARS ───────────────────────────────────────────────────────────────
  // Steel blue-grey, moderate size, wide-set. Built entirely with fur strokes.
  const paintEar = (side: number) => {
    const ex = hx+side*hw*0.76, ey = hy-hh*0.58
    const ew = hw*0.25, eh = hh*0.70
    // Outer ear fur (blue-grey)
    for (let i = 0; i < 200; i++) {
      const fx2 = ex+(rng()-0.5)*ew*2.20
      const fy2 = ey+(rng()-0.5)*eh*2.20
      const dx2=(fx2-ex)/ew, dy2=(fy2-ey)/eh
      if (dx2*dx2+dy2*dy2 > 1.02) continue
      if (fy2 > ey+eh*0.20) continue  // ear base clip
      // V-shape approximation: reject points outside ear triangle
      const relX = Math.abs(fx2-ex)/ew, relY = -(fy2-ey)/eh  // 0=base,1=tip
      if (relX > 0.85-relY*0.60) continue
      const isLit = side*(fx2-ex) < 0  // inner edge catches light
      const r = isLit ? (104+rng()*30|0) : (72+rng()*22|0)
      const g = isLit ? (122+rng()*24|0) : (84+rng()*18|0)
      const b = isLit ? (142+rng()*26|0) : (100+rng()*22|0)
      const ang = -Math.PI*0.5+(rng()-0.5)*0.38
      ctx.strokeStyle = `rgba(${r},${g},${b},${0.18+rng()*0.40})`; ctx.lineWidth = 0.7+rng()*1.0
      ctx.beginPath(); ctx.moveTo(fx2,fy2); ctx.lineTo(fx2+Math.cos(ang)*6, fy2+Math.sin(ang)*6); ctx.stroke()
    }
    // Inner ear (warm rose-pink)
    for (let i = 0; i < 80; i++) {
      const fx2 = ex+side*(rng()-0.5)*ew*0.90
      const fy2 = ey-eh*0.68+rng()*eh*0.70
      if (fy2 > ey+eh*0.10) continue
      const ang = -Math.PI*0.5+(rng()-0.5)*0.38
      ctx.strokeStyle = `rgba(178,88,80,${0.10+rng()*0.22})`; ctx.lineWidth = 0.6+rng()*0.9
      ctx.beginPath(); ctx.moveTo(fx2,fy2); ctx.lineTo(fx2+Math.cos(ang)*5, fy2-3-rng()*7); ctx.stroke()
    }
  }
  paintEar(-1); paintEar(1)

  // ─── HEAD ───────────────────────────────────────────────────────────────
  // Blue-grey outer face, white muzzle blaze. Head center at hy=H*0.210,
  // which places the head bottom at H*0.318 — touching the body top exactly.
  // The mane drawn above wraps up behind the chin and ear bases, ensuring
  // a seamless visual connection — no gap, no floating.

  // Subsurface underpaint (sets 3D form — very low opacity, fur covers it)
  const headForm = ctx.createRadialGradient(hx-hw*0.16, hy-hh*0.20, hw*0.06, hx, hy, hw*1.06)
  headForm.addColorStop(0,    "rgba(132,158,182,0.52)")
  headForm.addColorStop(0.44, "rgba(98,120,142,0.30)")
  headForm.addColorStop(0.80, "rgba(64,80,100,0.38)")
  headForm.addColorStop(1,    "rgba(22,28,38,0.50)")
  ctx.fillStyle = headForm; ctx.beginPath(); ctx.ellipse(hx,hy,hw,hh,0,0,Math.PI*2); ctx.fill()

  // Muzzle blaze underpaint (white zone — soft gradient)
  const blazeTopY = hy - hh*0.04
  const noseY    = hy + hh*0.24
  const chinY    = hy + hh*0.88
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(hx, chinY)
  ctx.bezierCurveTo(hx+hw*0.52,chinY, hx+hw*0.50,noseY+hh*0.20, hx+hw*0.38,noseY+hh*0.04)
  ctx.bezierCurveTo(hx+hw*0.28,noseY-hh*0.08, hx+hw*0.16,blazeTopY, hx,blazeTopY)
  ctx.bezierCurveTo(hx-hw*0.16,blazeTopY, hx-hw*0.28,noseY-hh*0.08, hx-hw*0.38,noseY+hh*0.04)
  ctx.bezierCurveTo(hx-hw*0.50,noseY+hh*0.20, hx-hw*0.52,chinY, hx,chinY)
  ctx.closePath(); ctx.clip()
  const blazeUp = ctx.createRadialGradient(hx, hy+hh*0.32, 0, hx, hy+hh*0.32, hw*0.80)
  blazeUp.addColorStop(0,    "rgba(255,255,255,0.80)")
  blazeUp.addColorStop(0.45, "rgba(242,240,234,0.48)")
  blazeUp.addColorStop(0.88, "rgba(218,215,208,0.16)")
  blazeUp.addColorStop(1,    "rgba(0,0,0,0)")
  ctx.fillStyle = blazeUp; ctx.fillRect(hx-hw,hy-hh,hw*2,hh*2)
  ctx.restore()

  // Blaze mask for fur
  const inBlaze = (fx: number, fy: number): boolean => {
    const relY = (fy-hy)/hh
    if (relY < -0.04) return false
    const t = (relY+0.04)/(0.88+0.04)
    return Math.abs(fx-hx) < hw*(0.16+t*0.38)
  }

  // Blue-grey outer face fur — dense, directional
  for (let i = 0; i < 2200; i++) {
    const fx = hx+(rng()-0.5)*hw*2.14
    const fy = hy+(rng()-0.5)*hh*2.14
    if (Math.hypot((fx-hx)/hw,(fy-hy)/hh) > 1.04) continue
    if (inBlaze(fx,fy)) continue
    const ang = Math.atan2(fy-(hy+hh*0.18),fx-hx) + (rng()-0.5)*0.48
    const len = 3+rng()*11
    const xF=(fx-hx)/hw, yF=(fy-hy)/hh
    const litF = Math.max(0, -xF*0.38 - yF*0.28 + 0.52)
    const r=(92+litF*60+rng()*26)|0, g=(108+litF*52+rng()*22)|0, b=(126+litF*46+rng()*24)|0
    ctx.strokeStyle = `rgba(${r},${g},${b},${0.18+rng()*0.40})`; ctx.lineWidth = 0.6+rng()*1.0
    ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(fx+Math.cos(ang)*len, fy+Math.sin(ang)*len); ctx.stroke()
  }
  // White fur in blaze zone
  for (let i = 0; i < 700; i++) {
    const fx = hx+(rng()-0.5)*hw*1.08
    const fy = hy+(rng()-0.5)*hh*2.0
    if (Math.hypot((fx-hx)/hw,(fy-hy)/hh) > 0.98) continue
    if (!inBlaze(fx,fy)) continue
    const ang = Math.atan2(fy-(hy+hh*0.34),fx-hx) + (rng()-0.5)*0.42
    ctx.strokeStyle = `rgba(235,232,226,${0.12+rng()*0.28})`; ctx.lineWidth = 0.6+rng()*1.0
    ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(fx+Math.cos(ang)*(3+rng()*10), fy+Math.sin(ang)*(3+rng()*10)); ctx.stroke()
  }

  // ─── EYES — large vivid sapphire (ragdoll hallmark) ─────────────────────
  const eyeY   = hy - hh*0.090
  const eyeRx  = hw*0.216, eyeRy = hh*0.192
  const eyeSep = hw*0.374

  const drawEye = (ex: number) => {
    const tilt = ex < hx ? 0.09 : -0.09
    ctx.fillStyle="rgba(6,8,18,0.80)"; ctx.beginPath(); ctx.ellipse(ex,eyeY+eyeRy*0.12,eyeRx*1.16,eyeRy*1.15,tilt,0,Math.PI*2); ctx.fill()
    ctx.fillStyle="#f0ede5"; ctx.beginPath(); ctx.ellipse(ex,eyeY,eyeRx,eyeRy,tilt,0,Math.PI*2); ctx.fill()
    const irisG = ctx.createRadialGradient(ex-eyeRx*0.20,eyeY-eyeRy*0.20,0,ex,eyeY,eyeRx*0.90)
    irisG.addColorStop(0,"#58a8f8"); irisG.addColorStop(0.30,"#2278e8"); irisG.addColorStop(0.68,"#1450c4"); irisG.addColorStop(1,"#061038")
    ctx.fillStyle=irisG; ctx.beginPath(); ctx.ellipse(ex,eyeY,eyeRx*0.86,eyeRy*0.84,tilt,0,Math.PI*2); ctx.fill()
    for (let s=0;s<30;s++) {
      const a=(s/30)*Math.PI*2+tilt
      ctx.strokeStyle=`rgba(130,205,255,${0.05+(s%3===0?0.12:0)+(s%7===0?0.09:0)})`; ctx.lineWidth=0.65
      ctx.beginPath(); ctx.moveTo(ex+Math.cos(a)*eyeRx*0.22,eyeY+Math.sin(a)*eyeRy*0.22); ctx.lineTo(ex+Math.cos(a)*eyeRx*0.84,eyeY+Math.sin(a)*eyeRy*0.84); ctx.stroke()
    }
    const lG = ctx.createRadialGradient(ex,eyeY,eyeRx*0.68,ex,eyeY,eyeRx*0.90)
    lG.addColorStop(0,"rgba(0,0,0,0)"); lG.addColorStop(1,"rgba(2,4,20,0.94)")
    ctx.fillStyle=lG; ctx.beginPath(); ctx.ellipse(ex,eyeY,eyeRx*0.88,eyeRy*0.86,tilt,0,Math.PI*2); ctx.fill()
    ctx.fillStyle="#020106"; ctx.beginPath(); ctx.ellipse(ex,eyeY,eyeRx*0.23,eyeRy*0.49,tilt,0,Math.PI*2); ctx.fill()
    ctx.fillStyle="rgba(6,8,22,0.84)"; ctx.beginPath(); ctx.ellipse(ex,eyeY-eyeRy*0.26,eyeRx*1.02,eyeRy*0.48,tilt,Math.PI,Math.PI*2); ctx.fill()
    ctx.fillStyle="rgba(255,255,255,0.97)"
    ctx.save(); ctx.translate(ex,eyeY); ctx.rotate(tilt-0.42)
    ctx.beginPath(); ctx.ellipse(-eyeRx*0.26,-eyeRy*0.30,eyeRx*0.22,eyeRy*0.14,0,0,Math.PI*2); ctx.fill()
    ctx.restore()
    ctx.fillStyle="rgba(255,255,255,0.58)"; ctx.beginPath(); ctx.arc(ex+eyeRx*0.34,eyeY+eyeRy*0.26,eyeRx*0.07,0,Math.PI*2); ctx.fill()
    ctx.strokeStyle="rgba(8,10,26,0.92)"; ctx.lineWidth=1.8; ctx.beginPath(); ctx.ellipse(ex,eyeY,eyeRx,eyeRy,tilt,0,Math.PI*2); ctx.stroke()
    ctx.strokeStyle="rgba(2,4,16,0.96)"; ctx.lineWidth=2.2; ctx.beginPath(); ctx.ellipse(ex,eyeY-eyeRy*0.13,eyeRx*1.02,eyeRy*0.68,tilt,Math.PI,Math.PI*2); ctx.stroke()
  }
  drawEye(hx-eyeSep); drawEye(hx+eyeSep)

  // ─── NOSE ───────────────────────────────────────────────────────────────
  const nx = hx, ny = hy+hh*0.238
  const noseG = ctx.createRadialGradient(nx-4,ny-4,1,nx,ny,hw*0.106)
  noseG.addColorStop(0,"#f09098"); noseG.addColorStop(0.50,"#d06878"); noseG.addColorStop(1,"#a84858")
  ctx.fillStyle=noseG
  ctx.beginPath(); ctx.moveTo(nx,ny-hh*0.086)
  ctx.bezierCurveTo(nx-hw*0.108,ny-hh*0.026,nx-hw*0.118,ny+hh*0.058,nx,ny+hh*0.086)
  ctx.bezierCurveTo(nx+hw*0.118,ny+hh*0.058,nx+hw*0.108,ny-hh*0.026,nx,ny-hh*0.086)
  ctx.closePath(); ctx.fill()
  ctx.fillStyle="rgba(255,210,220,0.48)"; ctx.beginPath(); ctx.ellipse(nx-4,ny-hh*0.030,hw*0.038,hh*0.020,0,0,Math.PI*2); ctx.fill()
  ctx.strokeStyle="rgba(100,55,60,0.58)"; ctx.lineWidth=1.2; ctx.lineCap="round"
  ctx.beginPath(); ctx.moveTo(nx,ny+hh*0.086); ctx.lineTo(nx,ny+hh*0.175); ctx.stroke()
  ctx.strokeStyle="rgba(88,48,54,0.74)"; ctx.lineWidth=1.5
  const my = ny+hh*0.175
  ;[-1,1].forEach(s => {
    ctx.beginPath(); ctx.moveTo(nx,my)
    ctx.bezierCurveTo(nx+s*hw*0.088,my+hh*0.064,nx+s*hw*0.198,my+hh*0.145,nx+s*hw*0.268,my+hh*0.076)
    ctx.stroke()
  })

  // ─── WHISKER PADS ───────────────────────────────────────────────────────
  ;[-1,1].forEach(s => {
    const wpx=hx+s*hw*0.30, wpy=ny-hh*0.022
    const wpG=ctx.createRadialGradient(wpx-s*6,wpy-5,3,wpx,wpy,hw*0.27)
    wpG.addColorStop(0,"rgba(195,192,186,0.50)"); wpG.addColorStop(0.6,"rgba(170,166,158,0.18)"); wpG.addColorStop(1,"rgba(0,0,0,0)")
    ctx.fillStyle=wpG; ctx.beginPath(); ctx.ellipse(wpx,wpy,hw*0.27,hh*0.20,s*0.06,0,Math.PI*2); ctx.fill()
    for (let row=0;row<3;row++) for (let col=0;col<3;col++) {
      ctx.fillStyle="rgba(150,144,134,0.70)"; ctx.beginPath(); ctx.arc(wpx+s*(col-1)*6.5,wpy+(row-1)*6.0,1.2,0,Math.PI*2); ctx.fill()
    }
  })

  // ─── WHISKERS ───────────────────────────────────────────────────────────
  const whiskers: number[][] = [
    [hx-hw*0.10,ny+hh*0.02, hx-hw*0.58,ny-hh*0.02, hx-hw*1.10,ny-hh*0.06],
    [hx-hw*0.10,ny+hh*0.09, hx-hw*0.56,ny+hh*0.09, hx-hw*1.12,ny+hh*0.14],
    [hx-hw*0.10,ny+hh*0.17, hx-hw*0.52,ny+hh*0.22, hx-hw*1.04,ny+hh*0.36],
    [hx+hw*0.10,ny+hh*0.02, hx+hw*0.58,ny-hh*0.02, hx+hw*1.10,ny-hh*0.06],
    [hx+hw*0.10,ny+hh*0.09, hx+hw*0.56,ny+hh*0.09, hx+hw*1.12,ny+hh*0.14],
    [hx+hw*0.10,ny+hh*0.17, hx+hw*0.52,ny+hh*0.22, hx+hw*1.04,ny+hh*0.36],
  ]
  whiskers.forEach(([x1,y1,cx2,cy2,x2,y2]) => {
    ctx.strokeStyle="rgba(0,0,0,0.22)"; ctx.lineWidth=0.9
    ctx.beginPath(); ctx.moveTo(x1,y1+1.5); ctx.quadraticCurveTo(cx2,cy2+1.5,x2,y2+1.5); ctx.stroke()
    ctx.strokeStyle="rgba(255,254,246,0.96)"; ctx.lineWidth=0.88
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.quadraticCurveTo(cx2,cy2,x2,y2); ctx.stroke()
  })
  ;[-1,1].forEach(s => {
    ctx.strokeStyle="rgba(255,252,240,0.66)"; ctx.lineWidth=0.75
    ctx.beginPath(); ctx.moveTo(hx+s*hw*0.20,hy-hh*0.47)
    ctx.quadraticCurveTo(hx+s*hw*0.52,hy-hh*0.59,hx+s*hw*0.74,hy-hh*0.51); ctx.stroke()
  })

  // ─── VIGNETTE ───────────────────────────────────────────────────────────
  const vig=ctx.createRadialGradient(W*0.50,H*0.42,H*0.22,W*0.50,H*0.42,H*0.80)
  vig.addColorStop(0,"rgba(0,0,0,0)"); vig.addColorStop(0.60,"rgba(0,0,0,0.06)"); vig.addColorStop(1,"rgba(0,0,0,0.66)")
  ctx.fillStyle=vig; ctx.fillRect(0,0,W,H)

  _paintingTex = new THREE.CanvasTexture(cv)
  _paintingTex.colorSpace = THREE.SRGBColorSpace
  _paintingTex.needsUpdate = true
  return _paintingTex
}


// ─── Camera rigs ──────────────────────────────────────────────────────────────

/**
 * TiltingCamRig — tight framing throughout.
 * Side view (x=2.0, z=0.55) is close enough to read every hardware detail.
 * Front view (z=2.20) gives an intimate TV-fill frame.
 * Cycle: 4.5 s side | 2 s pan | 4 s front | 2 s return = 12.5 s
 */
function TiltingCamRig() {
  const startRef = useRef<number | null>(null)
  useFrame(({ camera, clock }) => {
    if (startRef.current === null) startRef.current = clock.elapsedTime
    const cycle = (clock.elapsedTime - startRef.current) % 12.5
    let x: number, z: number
    if (cycle < 4.5) {
      x = 1.75; z = 0.48              // intimate side — full hardware detail
    } else if (cycle < 6.5) {
      const p = smoothstep((cycle - 4.5) / 2.0)
      x = 1.75 * (1 - p); z = 0.48 + p * 1.32
    } else if (cycle < 10.5) {
      x = 0; z = 1.80                 // close front view — TV fills frame
    } else if (cycle < 12.5) {
      const p = smoothstep((cycle - 10.5) / 2.0)
      x = 1.75 * p; z = 1.80 - p * 1.32
    } else {
      x = 1.75; z = 0.48
    }
    camera.position.set(x, 0.15, z)
    camera.lookAt(0, 0.06, 0)
  })
  return null
}

/**
 * FullMotionCamRig — tight cinematic framing.
 * Side view (x=1.75, z=0.55) shows full IK arm depth close-up.
 * Front view (z=2.20) fills frame with TV.
 * Cycle: 5 s side | 2 s pan | 3.5 s front | 2 s return = 12.5 s
 */
function FullMotionCamRig() {
  const startRef = useRef<number | null>(null)
  useFrame(({ camera, clock }) => {
    if (startRef.current === null) startRef.current = clock.elapsedTime
    const cycle = (clock.elapsedTime - startRef.current) % 12.5
    let x: number, z: number
    if (cycle < 5.0) {
      x = 1.55; z = 0.48              // intimate side — IK arm kinematics fully readable
    } else if (cycle < 7.0) {
      const p = smoothstep((cycle - 5.0) / 2.0)
      x = 1.55 * (1 - p); z = 0.48 + p * 1.32
    } else if (cycle < 10.5) {
      x = 0; z = 1.80                 // close front — TV fills frame edge-to-edge
    } else if (cycle < 12.5) {
      const p = smoothstep((cycle - 10.5) / 2.0)
      x = 1.55 * p; z = 1.80 - p * 1.32
    } else {
      x = 1.55; z = 0.48
    }
    camera.position.set(x, 0.22, z)
    camera.lookAt(0, 0, 0)
  })
  return null
}

// ─── Mount-type scenes ────────────────────────────────────────────────────────

function FixedScene() {
  const chromeMat = useMemo(() => mkChrome(0.12), [])
  return (
    <group>
      <Wall />
      <WallPlate />
      {([-0.62, 0.62] as const).map((x) => (
        <group key={x} position={[x, 0, 0.06]}>
          <mesh castShadow><boxGeometry args={[0.06, 0.06, 0.18]} /><primitive object={chromeMat} /></mesh>
          {[-0.06, -0.02, 0.02, 0.06].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <boxGeometry args={[0.062, 0.003, 0.18]} />
              <meshPhysicalMaterial color="#b0b4c0" metalness={0.9} roughness={0.2} clearcoat={0.3} clearcoatRoughness={0.15} />
            </mesh>
          ))}
        </group>
      ))}
      <group position={[0, 0, 0.21]}><TVPanel /></group>
      <ContactShadows frames={1} position={[0, -0.88, -0.06]} blur={2.8} opacity={0.32} scale={3.5} color="#20102a" />
    </group>
  )
}

/**
 * TiltingScene — full mechanical side-view rig.
 * TiltingCamRig animates camera: side profile → cinematic pan → front.
 * A horizontal pivot bar with PBR chrome/gunmetal hardware sits between wall
 * plate and VESA adapter.  TV tilts ±18° on x-axis (the intended motion).
 * A purple arc indicator traces the tilt travel arc.
 */
function TiltingScene() {
  const tvRef      = useRef<THREE.Group>(null)
  const chromeMat  = useMemo(() => mkChrome(0.10), [])
  const gungMat    = useMemo(() => mkGunmetal(0.20), [])
  const axleMat    = useMemo(() => mkBrushedNickel(), [])

  useFrame(({ clock }) => {
    const θ = Math.sin(clock.elapsedTime * 0.68) * 0.30
    if (tvRef.current) tvRef.current.rotation.x = θ
  })

  return (
    <group>
      {/* Solid wall slab for side-view depth */}
      <mesh receiveShadow position={[0, 0, -0.12]}>
        <boxGeometry args={[100, 100, 0.18]} />
        <meshPhysicalMaterial color="#e8e4dd" roughness={0.8} metalness={0.0} clearcoat={0.04} clearcoatRoughness={0.5} />
      </mesh>
      {/* Floor */}
      <Floor color="#d4d0c8" />

      {/* Wall mounting plate */}
      <mesh position={[0, 0, -0.02]} castShadow>
        <boxGeometry args={[0.30, 0.42, 0.038]} /><primitive object={gungMat} />
      </mesh>
      {([[-0.10,0.16],[0.10,0.16],[-0.10,-0.16],[0.10,-0.16]] as [number,number][]).map(([hx,hy],i) => (
        <Screw key={i} p={[hx, hy, 0.020]} />
      ))}

      {/* Horizontal pivot rail */}
      <mesh position={[0, 0, 0.04]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.032, 0.032, 1.38, 18]} /><primitive object={chromeMat} />
      </mesh>
      {/* Pivot hub collars */}
      {([-0.57, 0.57] as const).map((x) => (
        <group key={x} position={[x, 0, 0.04]}>
          <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.056, 0.056, 0.044, 18]} />
            <meshPhysicalMaterial color={C.gunmetal} metalness={0.92} roughness={0.18} clearcoat={0.3} envMapIntensity={1.4} />
          </mesh>
          {/* Locking bolt */}
          <mesh position={[0, 0.062, 0.01]} castShadow>
            <cylinderGeometry args={[0.009, 0.008, 0.022, 8]} /><primitive object={axleMat} />
          </mesh>
        </group>
      ))}

      {/* VESA adapter plate */}
      <mesh position={[0, 0, 0.112]} castShadow>
        <boxGeometry args={[1.12, 0.32, 0.030]} /><primitive object={gungMat} />
      </mesh>
      {/* Tilt adjustment lever */}
      <mesh position={[0.60, 0.14, 0.105]} castShadow>
        <cylinderGeometry args={[0.012, 0.010, 0.08, 10]} />
        <meshPhysicalMaterial color="#c8902a" metalness={0.98} roughness={0.12} envMapIntensity={2.4} />
      </mesh>
      {([[-0.40,0.12],[0.40,0.12],[-0.40,-0.12],[0.40,-0.12]] as [number,number][]).map(([hx,hy],i) => (
        <Screw key={i} p={[hx, hy, 0.128]} />
      ))}

      {/* Purple tilt-arc indicator (shown from side) */}
      <mesh position={[0.82, 0, 0.18]} rotation={[0, 0, Math.PI * 0.5]}>
        <torusGeometry args={[0.22, 0.0055, 8, 36, Math.PI * 0.58]} />
        <meshStandardMaterial color={C.purple} emissive={C.purple} emissiveIntensity={1.4} transparent opacity={0.80} />
      </mesh>

      {/* TV — tilts on x-axis */}
      <group ref={tvRef} position={[0, 0, 0.30]}><TVPanel /></group>

      <TiltingCamRig />
      <ContactShadows frames={1} position={[0, -0.88, -0.06]} blur={2.8} opacity={0.32} scale={3.5} color="#20102a" />
    </group>
  )
}

function FullMotionScene() {
  const arm1Ref = useRef<THREE.Group>(null)
  const arm2Ref = useRef<THREE.Group>(null)
  const tvRef   = useRef<THREE.Group>(null)

  const armMat  = useMemo(() => mkGunmetal(0.24), [])
  const railMat = useMemo(() => mkBrushedSteel(), [])
  const jntMat  = useMemo(() => mkChrome(0.09), [])

  useFrame(({ clock }) => {
    const t  = clock.elapsedTime
    const sw = Math.sin(t * 0.42)
    const θ1 =  sw * 1.02
    const θ2 = Math.sin(t * 0.42 + 0.9) * 0.73
    const tvY = -(θ1 + θ2 * 0.55)
    if (arm1Ref.current) arm1Ref.current.rotation.y = θ1
    if (arm2Ref.current) arm2Ref.current.rotation.y = θ2
    if (tvRef.current)   tvRef.current.rotation.y   = tvY
  })

  return (
    <group>
      <Wall />
      <WallPlate w={0.26} h={0.38} />
      <FullMotionCamRig />

      <group ref={arm1Ref} position={[0, 0, 0.04]}>
        <mesh castShadow><boxGeometry args={[0.088, 0.066, 0.50]} /><primitive object={armMat} /></mesh>
        {([-0.024, 0.024] as const).map((y) => (
          <mesh key={y} position={[0, y, 0]} castShadow>
            <boxGeometry args={[0.018, 0.014, 0.49]} /><primitive object={railMat} />
          </mesh>
        ))}
        {/* Elbow joint ball */}
        <mesh position={[0, 0, 0.26]} castShadow>
          <sphereGeometry args={[0.052, 14, 14]} /><primitive object={jntMat} />
        </mesh>

        <group ref={arm2Ref} position={[0, 0, 0.30]}>
          <mesh castShadow><boxGeometry args={[0.078, 0.060, 0.42]} /><primitive object={armMat} /></mesh>
          {([-0.022, 0.022] as const).map((y) => (
            <mesh key={y} position={[0, y, 0]} castShadow>
              <boxGeometry args={[0.016, 0.012, 0.41]} /><primitive object={railMat} />
            </mesh>
          ))}
          {/* Wrist joint */}
          <mesh position={[0, 0, 0.22]} castShadow>
            <sphereGeometry args={[0.050, 14, 14]} /><primitive object={jntMat} />
          </mesh>
          {/* VESA adapter plate */}
          <mesh position={[0, 0, 0.265]} castShadow>
            <boxGeometry args={[0.09, 0.30, 0.045]} /><primitive object={armMat} />
          </mesh>
          {([[-0.03,0.10],[0.03,0.10],[-0.03,-0.10],[0.03,-0.10]] as [number,number][]).map(([hx, hy], i) => (
            <Screw key={i} p={[hx, hy, 0.29]} />
          ))}
          <group ref={tvRef} position={[0, 0, 0.36]}><TVPanel /></group>
        </group>
      </group>

      <mesh position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.40, 0.005, 8, 48, Math.PI * 1.35]} />
        <meshStandardMaterial color={C.purple} emissive={C.purple} emissiveIntensity={1.0} transparent opacity={0.62} />
      </mesh>
      <ContactShadows frames={1} position={[0, -0.88, -0.06]} blur={3.2} opacity={0.35} scale={4} color="#20102a" />
    </group>
  )
}

/**
 * CeilingScene — commercial-grade ceiling projector/TV mount.
 * Geometry hierarchy: ceiling slab → T-track flange → adjustment rings (3) →
 * heavy-gauge pole with cable channel → mid-clamp collar → lower pivot housing →
 * gimbal tilt arm → VESA quick-release plate → TV (gentle sway).
 */
function CeilingScene() {
  const tvRef     = useRef<THREE.Group>(null)
  const chromeMat = useMemo(() => mkChrome(0.07), [])
  const gungMat   = useMemo(() => mkGunmetal(0.20), [])
  const nickelMat = useMemo(() => mkBrushedNickel(), [])
  const goldMat   = useMemo(() => mkGold(), [])

  useFrame(({ clock }) => {
    if (tvRef.current) {
      tvRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.44) * 0.028
      tvRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.34) * 0.038 + 0.16
    }
  })

  return (
    <group>
      {/* Ceiling slab */}
      <mesh receiveShadow position={[0, 1.30, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100, 16, 16]} />
        <meshPhysicalMaterial color="#f0ece4" roughness={0.8} metalness={0.0} clearcoat={0.05} clearcoatRoughness={0.6} />
      </mesh>
      {/* Ceiling cornice strip */}
      <mesh position={[0, 1.285, -0.01]}>
        <boxGeometry args={[100, 0.028, 0.058]} />
        <meshPhysicalMaterial color="#e8e4dc" roughness={0.8} metalness={0.0} />
      </mesh>
      <Wall />
      <Floor color="#d2cec6" />

      {/* ── T-track ceiling flange plate ── */}
      <mesh position={[0, 1.26, 0.01]} castShadow>
        <boxGeometry args={[0.38, 0.04, 0.38]} /><primitive object={gungMat} />
      </mesh>
      {/* Flange bolt holes × 4 */}
      {([[-0.13,0.13],[0.13,0.13],[-0.13,-0.13],[0.13,-0.13]] as [number,number][]).map(([sx,sz],i) => (
        <mesh key={i} position={[sx, 1.264, sz]} castShadow>
          <cylinderGeometry args={[0.016, 0.014, 0.032, 10]} /><primitive object={chromeMat} />
        </mesh>
      ))}
      {/* Flange collar ring */}
      <mesh position={[0, 1.245, 0.01]} castShadow rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.078, 0.012, 12, 24]} /><primitive object={nickelMat} />
      </mesh>

      {/* ── Adjustment rings (tension / levelling) × 3 ── */}
      {([1.08, 0.86, 0.65] as const).map((y, i) => (
        <group key={i} position={[0, y, 0.01]}>
          <mesh castShadow rotation={[Math.PI/2, 0, 0]}>
            <torusGeometry args={[0.042, 0.008 + i * 0.002, 10, 20]} />
            <primitive object={i === 1 ? goldMat : chromeMat} />
          </mesh>
          {/* Set-screw */}
          <mesh position={[0.044, 0, 0.02]} castShadow>
            <cylinderGeometry args={[0.006, 0.005, 0.014, 8]} /><primitive object={nickelMat} />
          </mesh>
        </group>
      ))}

      {/* ── Main pole — 25 mm dia, 1.28 m long ── */}
      <mesh position={[0, 0.62, 0.01]} castShadow>
        <cylinderGeometry args={[0.028, 0.028, 1.24, 20]} /><primitive object={chromeMat} />
      </mesh>
      {/* Cable channel groove on pole */}
      <mesh position={[0.020, 0.62, 0.01]} castShadow>
        <boxGeometry args={[0.008, 1.22, 0.016]} />
        <meshStandardMaterial color="#111316" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Cable clip at 60 % height */}
      <mesh position={[0, 0.84, 0.032]} castShadow rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.032, 0.007, 8, 16, Math.PI * 1.5]} />
        <primitive object={nickelMat} />
      </mesh>

      {/* ── Mid-shaft safety collar ── */}
      <mesh position={[0, 0.50, 0.01]} castShadow>
        <cylinderGeometry args={[0.048, 0.044, 0.062, 20]} /><primitive object={gungMat} />
      </mesh>
      <mesh position={[0, 0.500, 0.01]} castShadow rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.048, 0.006, 8, 20]} /><primitive object={chromeMat} />
      </mesh>

      {/* ── Lower pivot housing ── */}
      <mesh position={[0, 0.020, 0.01]} castShadow>
        <cylinderGeometry args={[0.078, 0.070, 0.095, 22]} /><primitive object={gungMat} />
      </mesh>
      {/* Housing detail rings */}
      <mesh position={[0, 0.068, 0.01]} castShadow rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.078, 0.006, 8, 22]} /><primitive object={chromeMat} />
      </mesh>
      <mesh position={[0, -0.032, 0.01]} castShadow rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.072, 0.006, 8, 22]} /><primitive object={chromeMat} />
      </mesh>
      {/* Pivot eyes (left/right) */}
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[s * 0.092, 0.020, 0.01]} castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.022, 0.022, 0.032, 14]} /><primitive object={chromeMat} />
        </mesh>
      ))}

      {/* ── Gimbal tilt arm ── */}
      <mesh position={[0, -0.052, 0.01]} castShadow>
        <boxGeometry args={[0.24, 0.032, 0.19]} /><primitive object={gungMat} />
      </mesh>
      {/* Tilt lock bolts */}
      {([-0.08, 0.08] as const).map((x) => (
        <mesh key={x} position={[x, -0.036, 0.10]} castShadow>
          <cylinderGeometry args={[0.010, 0.009, 0.022, 8]} /><primitive object={nickelMat} />
        </mesh>
      ))}

      {/* ── VESA quick-release adapter ── */}
      <mesh position={[0, -0.100, 0.01]} castShadow>
        <boxGeometry args={[0.26, 0.034, 0.22]} /><primitive object={gungMat} />
      </mesh>
      {([[-0.095,0.080],[0.095,0.080],[-0.095,-0.080],[0.095,-0.080]] as [number,number][]).map(([hx,hz],i) => (
        <Screw key={i} p={[hx, -0.085, hz]} />
      ))}
      {/* Spring-loaded locking detent */}
      <mesh position={[0, -0.086, 0.10]} castShadow>
        <cylinderGeometry args={[0.014, 0.013, 0.018, 10]} /><primitive object={goldMat} />
      </mesh>

      {/* ── TV with gentle pendulum sway ── */}
      <group ref={tvRef} position={[0, -0.18, 0.01]}><TVPanel /></group>

      <ContactShadows frames={1} position={[0, -0.98, -0.06]} blur={2.5} opacity={0.28} scale={3.5} color="#20102a" />
    </group>
  )
}

// ─── "What to mount" item scenes ──────────────────────────────────────────────

/**
 * TVItemScene — TV wall-mounted (no stand).
 * Shows the TV in its actual installed context: flat against the wall on a
 * slim fixed-bracket, with a subtle float animation.  This better represents
 * the service than a consumer desk-stand.
 */
function TVItemScene() {
  const grp       = useRef<THREE.Group>(null)
  const plateMat  = useMemo(() => mkGunmetal(0.24), [])
  const spacerMat = useMemo(() => mkChrome(0.12), [])

  useFrame(({ clock }) => {
    if (grp.current) grp.current.position.y = Math.sin(clock.elapsedTime * 0.55) * 0.018
  })

  return (
    <group ref={grp}>
      <MountLookAtRig y={0.05} />
      <MountWall />
      <MountFloor />
      <MountSceneLights />

      {/* Slim fixed wall-bracket plate (hidden behind TV) */}
      <mesh position={[0, 0, 0.010]} castShadow receiveShadow>
        <boxGeometry args={[0.30, 0.38, 0.026]} />
        <primitive object={plateMat} />
      </mesh>
      {/* VESA spacer standoffs ×4 */}
      {([[-0.10,-0.10],[0.10,-0.10],[-0.10,0.10],[0.10,0.10]] as [number,number][]).map(([bx,by],i) => (
        <mesh key={i} position={[bx, by, 0.028]} castShadow>
          <cylinderGeometry args={[0.011, 0.011, 0.030, 10]} />
          <primitive object={spacerMat} />
        </mesh>
      ))}
      {/* Mounting screws on bracket corners */}
      {([[-0.12,-0.16],[0.12,-0.16],[-0.12,0.16],[0.12,0.16]] as [number,number][]).map(([sx,sy],i) => (
        <Screw key={i} p={[sx, sy, 0.024]} />
      ))}

      {/* TV — sunset texture rendered on screen via TVPanel */}
      <group position={[0, 0, 0.060]}>
        <TVPanel />
      </group>

      <ContactShadows frames={1} position={[0, -0.64, -0.02]} blur={2.6} opacity={0.32} scale={3.0} color="#20102a" />
    </group>
  )
}

/**
 * Tape measure canvas texture — ONE-FOOT repeating tile.
 *
 * Tile represents 12 inches so each inch gets ~85 px (W=1024).
 * Marks are big enough to be clearly visible in 3-D at typical view distance.
 * Use with tex.wrapS = RepeatWrapping + tex.repeat.set(55/12, 1) on the mesh.
 *
 *  x = 0         → RED full-height foot mark (repeats at x = W)
 *  x = n * px/in → BLACK inch mark + number (n = 1..11)
 *  half-inch      → medium black mark
 *  quarter-inch   → short black mark
 *  eighth-inch    → tiny black mark
 */
let _tapeTex: THREE.CanvasTexture | null = null
function getTapeTex(): THREE.CanvasTexture | null {
  if (typeof window === "undefined") return null
  if (_tapeTex) return _tapeTex

  // One foot tile: 1024 × 128 px.  Each inch ≈ 85 px — comfortably readable.
  const W = 1024, H = 128
  const INCHES = 12
  const PX = W / INCHES               // pixels per inch ≈ 85.3
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H
  const ctx = cv.getContext("2d")!

  // ── Background ────────────────────────────────────────────────────────────
  ctx.fillStyle = "#f5c200"
  ctx.fillRect(0, 0, W, H)

  // Top & bottom dark-gold edge strips (the tape's rolled edge)
  const EDGE = 7
  ctx.fillStyle = "#b38a00"
  ctx.fillRect(0, 0, W, EDGE)
  ctx.fillRect(0, H - EDGE, W, EDGE)

  const BODY_TOP = EDGE, BODY_H = H - EDGE * 2

  // ── Eighth-inch marks (tiny, ~14% body height) ────────────────────────────
  for (let e = 1; e < INCHES * 8; e++) {
    if (e % 2 === 0) continue          // quarters handled below
    const x = Math.round((e / 8) * PX)
    ctx.fillStyle = "#555555"
    ctx.fillRect(x - 1, BODY_TOP, 2, Math.round(BODY_H * 0.14))
  }

  // ── Quarter-inch marks (~24%) ─────────────────────────────────────────────
  for (let q = 1; q < INCHES * 4; q++) {
    if (q % 2 === 0) continue          // halves handled below
    const x = Math.round((q / 4) * PX)
    ctx.fillStyle = "#333333"
    ctx.fillRect(x - 1, BODY_TOP, 2, Math.round(BODY_H * 0.24))
  }

  // ── Half-inch marks (~40%) ────────────────────────────────────────────────
  for (let h = 1; h < INCHES * 2; h++) {
    if (h % 2 === 0) continue          // inches handled below
    const x = Math.round((h / 2) * PX)
    ctx.fillStyle = "#111111"
    ctx.fillRect(x - 2, BODY_TOP, 3, Math.round(BODY_H * 0.40))
  }

  // ── Inch marks (1–11) with numbers (~60%) ────────────────────────────────
  ctx.textAlign = "left"
  ctx.textBaseline = "top"
  for (let i = 1; i < INCHES; i++) {
    const x = Math.round(i * PX)
    const mH = Math.round(BODY_H * 0.60)
    ctx.fillStyle = "#111111"
    ctx.fillRect(x - 2, BODY_TOP, 4, mH)
    // Number — rotated 90° so it reads along the tape length
    ctx.save()
    ctx.translate(x + 5, BODY_TOP + 4)
    ctx.font = "bold 18px Arial"
    ctx.fillStyle = "#111111"
    ctx.fillText(`${i}`, 0, 0)
    ctx.restore()
  }

  // ── Foot mark at x=0 (full-height red) ────────────────────────────────────
  // This appears at every repeat boundary (i.e. every foot).
  ctx.fillStyle = "#cc0000"
  ctx.fillRect(0, BODY_TOP, 5, BODY_H)
  // Also right edge so the seam is continuous when tiling
  ctx.fillRect(W - 2, BODY_TOP, 5, BODY_H)

  const tex = new THREE.CanvasTexture(cv)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.anisotropy = 16
  _tapeTex = tex
  return tex
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _getLivingRoomTex_unused(): THREE.CanvasTexture {
  // Unused — keeping for reference. Apartment HDR env handles reflection.
  const cv = document.createElement("canvas"); cv.width = 2; cv.height = 2
  return new THREE.CanvasTexture(cv) // early return — rest is dead reference code
  // @ts-ignore unreachable
  const W = 1024, H = 576
  const _cv2 = document.createElement("canvas")
  _cv2.width = W; _cv2.height = H
  const ctx = _cv2.getContext("2d")!

  // ── Ceiling — bright white/cream top ─────────────────────────────────────
  const ceilG = ctx.createLinearGradient(0, 0, 0, H * 0.20)
  ceilG.addColorStop(0, "#e8e4dc")
  ceilG.addColorStop(1, "#d8d0c4")
  ctx.fillStyle = ceilG; ctx.fillRect(0, 0, W, H * 0.20)

  // ── Back wall — warm greige/tan ────────────────────────────────────────────
  const wallG = ctx.createLinearGradient(0, H * 0.20, 0, H * 0.72)
  wallG.addColorStop(0, "#c8bfb0")
  wallG.addColorStop(1, "#b8afa0")
  ctx.fillStyle = wallG; ctx.fillRect(0, H * 0.20, W, H * 0.52)

  // ── Floor — warm hardwood ─────────────────────────────────────────────────
  const floorG = ctx.createLinearGradient(0, H * 0.72, 0, H)
  floorG.addColorStop(0, "#8a7255")
  floorG.addColorStop(1, "#6e5c44")
  ctx.fillStyle = floorG; ctx.fillRect(0, H * 0.72, W, H * 0.28)
  // Subtle floor planks (light lines)
  ctx.strokeStyle = "rgba(100,82,60,0.35)"; ctx.lineWidth = 1
  for (let y = H * 0.73; y < H; y += H * 0.04) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }
  // Floor gloss near the viewer
  const floorSheen = ctx.createLinearGradient(W * 0.25, H * 0.72, W * 0.75, H * 0.72)
  floorSheen.addColorStop(0, "rgba(255,255,255,0)")
  floorSheen.addColorStop(0.5, "rgba(255,255,255,0.07)")
  floorSheen.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = floorSheen; ctx.fillRect(0, H * 0.72, W, H * 0.06)

  // ── Large windows — right side wall, bright daylight ─────────────────────
  // Window glow on wall
  const winGlow = ctx.createRadialGradient(W * 0.88, H * 0.35, 0, W * 0.88, H * 0.35, W * 0.45)
  winGlow.addColorStop(0, "rgba(210,225,245,0.55)")
  winGlow.addColorStop(0.4, "rgba(200,218,238,0.20)")
  winGlow.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = winGlow; ctx.fillRect(0, 0, W, H)
  // Two window panels side by side
  ctx.fillStyle = "#b8cfe0"
  ctx.fillRect(W * 0.80, H * 0.08, W * 0.085, H * 0.52)
  ctx.fillRect(W * 0.895, H * 0.08, W * 0.085, H * 0.52)
  // Horizontal pane divider
  ctx.fillStyle = "#9ab8cc"
  ctx.fillRect(W * 0.80, H * 0.08 + (H * 0.52 * 0.5) - 3, W * 0.18, 6)
  // Window frame trim (cream)
  ctx.strokeStyle = "#d4cfc6"; ctx.lineWidth = 5
  ctx.strokeRect(W * 0.80, H * 0.08, W * 0.18, H * 0.52)
  ctx.strokeRect(W * 0.80, H * 0.08, W * 0.085, H * 0.52)
  // Window light wash across wall
  const winWash = ctx.createLinearGradient(W * 0.80, 0, W * 0.40, 0)
  winWash.addColorStop(0, "rgba(220,232,248,0.28)")
  winWash.addColorStop(1, "rgba(220,232,248,0)")
  ctx.fillStyle = winWash; ctx.fillRect(0, H * 0.20, W, H * 0.52)
  // Light patch on floor from window
  const floorLight = ctx.createLinearGradient(W * 0.55, H * 0.72, W * 0.90, H * 0.72)
  floorLight.addColorStop(0, "rgba(200,218,235,0)")
  floorLight.addColorStop(0.5, "rgba(200,218,235,0.22)")
  floorLight.addColorStop(1, "rgba(200,218,235,0.08)")
  ctx.fillStyle = floorLight; ctx.fillRect(W * 0.50, H * 0.72, W * 0.50, H * 0.28)

  // ── Floor lamp — left of sofa ─────────────────────────────────────────────
  const lpX = W * 0.21
  ctx.strokeStyle = "#8a7e6e"; ctx.lineWidth = 5
  ctx.beginPath(); ctx.moveTo(lpX, H * 0.92); ctx.lineTo(lpX, H * 0.22); ctx.stroke()
  ctx.fillStyle = "#7a6e5c"
  ctx.fillRect(lpX - 20, H * 0.91, 40, 12)
  ctx.fillRect(lpX - 14, H * 0.90, 28, 6)
  // Shade
  ctx.fillStyle = "#c8b890"
  ctx.beginPath()
  ctx.moveTo(lpX - 18, H * 0.22); ctx.lineTo(lpX + 18, H * 0.22)
  ctx.lineTo(lpX + 30, H * 0.36); ctx.lineTo(lpX - 30, H * 0.36)
  ctx.closePath(); ctx.fill()
  // Shade trim
  ctx.strokeStyle = "#b0a278"; ctx.lineWidth = 2
  ctx.strokeRect(lpX - 18, H * 0.22, 48, H * 0.14)
  // Warm lamp glow on wall/ceiling
  const lglow = ctx.createRadialGradient(lpX, H * 0.29, 0, lpX, H * 0.29, W * 0.22)
  lglow.addColorStop(0, "rgba(255,210,130,0.30)")
  lglow.addColorStop(0.5, "rgba(255,190,100,0.10)")
  lglow.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = lglow; ctx.fillRect(0, 0, W, H)
  // Lamp glow downward on floor
  const lfloor = ctx.createRadialGradient(lpX, H * 0.93, 0, lpX, H * 0.93, W * 0.11)
  lfloor.addColorStop(0, "rgba(255,200,120,0.18)")
  lfloor.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = lfloor; ctx.fillRect(0, 0, W, H)

  // ── Bookshelf — left wall ─────────────────────────────────────────────────
  const shX = W * 0.0, shW = W * 0.12
  ctx.fillStyle = "#6a5240"
  ctx.fillRect(shX, H * 0.10, shW, H * 0.72)
  // Side trim
  ctx.fillStyle = "#7a6250"
  ctx.fillRect(shX + shW - 8, H * 0.10, 8, H * 0.72)
  // Shelf boards
  ;[0.28, 0.46, 0.64].forEach(sy => {
    ctx.fillStyle = "#7a6048"
    ctx.fillRect(shX, H * sy, shW, H * 0.025)
    ctx.fillStyle = "#8a7058"
    ctx.fillRect(shX, H * sy, shW, H * 0.006)
  })
  // Books on each shelf — realistic colors
  const bkPal: [number,number,number][] = [
    [168,94,60],[72,102,148],[94,132,72],[164,100,60],
    [88,72,152],[136,112,58],[64,120,110],[156,82,90],
  ]
  ;[0.10, 0.30, 0.48, 0.66].forEach((sy, si) => {
    let bx = shX + 4
    let bi = si * 2
    while (bx < shX + shW - 4) {
      const bw = 10 + (bi * 4.1 % 8)
      const bh = H * (0.10 + (bi % 3) * 0.028)
      const [r,g,b] = bkPal[bi % bkPal.length]
      ctx.fillStyle = `rgb(${r},${g},${b})`
      ctx.fillRect(bx, H * sy + H * 0.025 - bh, bw - 1, bh)
      bx += bw; bi++
      if (bx >= shX + shW - 4) break
    }
  })
  // Decorative item on top shelf
  ctx.fillStyle = "#4e7850"
  ctx.beginPath()
  ctx.ellipse(shX + shW * 0.38, H * 0.14, W * 0.018, H * 0.05, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = "#6a5240"
  ctx.fillRect(shX + shW * 0.28, H * 0.175, W * 0.022, H * 0.032)

  // ── Sofa — center, the main furniture piece ───────────────────────────────
  // Sofa back (tall)
  ctx.fillStyle = "#6e7880"   // blue-gray linen
  ctx.fillRect(W * 0.28, H * 0.48, W * 0.46, H * 0.16)
  // Sofa seat
  ctx.fillStyle = "#788490"
  ctx.fillRect(W * 0.28, H * 0.63, W * 0.46, H * 0.22)
  // Three cushions on seat
  for (let i = 0; i < 3; i++) {
    const cx = W * 0.29 + i * W * 0.150
    ctx.fillStyle = i % 2 === 0 ? "#788490" : "#6e8090"
    ctx.fillRect(cx + 2, H * 0.635, W * 0.146, H * 0.20)
    // Cushion shadow/crease
    ctx.strokeStyle = "rgba(50,60,72,0.30)"; ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(cx + 2, H * 0.64); ctx.lineTo(cx + W * 0.146, H * 0.64); ctx.stroke()
  }
  // Armrests
  ctx.fillStyle = "#606c78"
  ctx.fillRect(W * 0.25, H * 0.50, W * 0.05, H * 0.32)
  ctx.fillRect(W * 0.72, H * 0.50, W * 0.05, H * 0.32)
  // Sofa legs
  ctx.fillStyle = "#504030"
  ;[W * 0.29, W * 0.44, W * 0.59, W * 0.72].forEach(lx =>
    ctx.fillRect(lx, H * 0.84, 8, H * 0.06)
  )
  // Accent throw pillow (warm terra cotta)
  ctx.fillStyle = "#c07850"
  ctx.fillRect(W * 0.32, H * 0.52, W * 0.075, H * 0.105)
  ctx.strokeStyle = "#a86440"; ctx.lineWidth = 1.5
  ctx.strokeRect(W * 0.32, H * 0.52, W * 0.075, H * 0.105)
  // Second pillow (cream)
  ctx.fillStyle = "#dcd4c0"
  ctx.fillRect(W * 0.56, H * 0.52, W * 0.068, H * 0.10)

  // ── Coffee table — glass top, dark walnut legs ────────────────────────────
  const tY = H * 0.78
  // Table top
  ctx.fillStyle = "rgba(110,90,65,0.80)"
  ctx.fillRect(W * 0.33, tY, W * 0.32, H * 0.048)
  // Glass top sheen
  const tHL = ctx.createLinearGradient(W * 0.33, tY, W * 0.65, tY)
  tHL.addColorStop(0, "rgba(255,255,255,0)")
  tHL.addColorStop(0.3, "rgba(255,255,255,0.12)")
  tHL.addColorStop(0.7, "rgba(255,255,255,0.06)")
  tHL.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = tHL; ctx.fillRect(W * 0.33, tY, W * 0.32, H * 0.014)
  // Legs
  ctx.fillStyle = "#50402e"
  ;[W * 0.35, W * 0.60].forEach(lx => ctx.fillRect(lx, tY + H * 0.048, 7, H * 0.058))
  ;[W * 0.47].forEach(lx => ctx.fillRect(lx, tY + H * 0.048, 7, H * 0.058))
  // Remote on table
  ctx.fillStyle = "#2a2a2a"; ctx.fillRect(W * 0.37, tY + H * 0.01, W * 0.045, H * 0.022)
  // Book on table
  ctx.fillStyle = "#b8a870"; ctx.fillRect(W * 0.44, tY + H * 0.006, W * 0.052, H * 0.028)
  ctx.strokeStyle = "#a89860"; ctx.lineWidth = 1
  ctx.strokeRect(W * 0.44, tY + H * 0.006, W * 0.052, H * 0.028)

  // ── Area rug under table ──────────────────────────────────────────────────
  const rugG = ctx.createRadialGradient(W * 0.48, H * 0.82, 0, W * 0.48, H * 0.82, W * 0.26)
  rugG.addColorStop(0, "rgba(148,124,100,0.32)")
  rugG.addColorStop(0.6, "rgba(128,104,84,0.16)")
  rugG.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = rugG; ctx.fillRect(W * 0.18, H * 0.72, W * 0.60, H * 0.28)
  // Rug edge detail
  ctx.strokeStyle = "rgba(160,134,108,0.22)"; ctx.lineWidth = 3
  ctx.strokeRect(W * 0.22, H * 0.73, W * 0.52, H * 0.22)

  // ── TV stand hint (bottom center, dark) ───────────────────────────────────
  ctx.fillStyle = "#3a3028"
  ctx.fillRect(W * 0.38, H * 0.68, W * 0.24, H * 0.04)
  ctx.fillStyle = "#302820"
  ctx.fillRect(W * 0.43, H * 0.70, W * 0.05, H * 0.02)
  ctx.fillRect(W * 0.52, H * 0.70, W * 0.05, H * 0.02)

  // ── Wall sconce / artwork above sofa ─────────────────────────────────────
  ctx.fillStyle = "#a09080"
  ctx.fillRect(W * 0.40, H * 0.26, W * 0.18, H * 0.16)
  ctx.fillStyle = "#b8a890"
  ctx.fillRect(W * 0.43, H * 0.28, W * 0.12, H * 0.12)
  ctx.strokeStyle = "#908070"; ctx.lineWidth = 2
  ctx.strokeRect(W * 0.40, H * 0.26, W * 0.18, H * 0.16)

  // ── Vignette — darkens edges, adds TV-reflection mood ────────────────────
  const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.15, W * 0.5, H * 0.5, H * 0.70)
  vig.addColorStop(0, "rgba(0,0,0,0)")
  vig.addColorStop(1, "rgba(0,0,0,0.50)")
  ctx.fillStyle = vig; ctx.fillRect(0, 0, W, H)
  // Extra darkening at very edges
  const edgeDark = ctx.createLinearGradient(0, 0, W * 0.12, 0)
  edgeDark.addColorStop(0, "rgba(0,0,0,0.40)")
  edgeDark.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = edgeDark; ctx.fillRect(0, 0, W * 0.12, H)
  const edgeDark2 = ctx.createLinearGradient(W, 0, W * 0.75, 0)
  edgeDark2.addColorStop(0, "rgba(0,0,0,0.40)")
  edgeDark2.addColorStop(1, "rgba(0,0,0,0)")
  ctx.fillStyle = edgeDark2; ctx.fillRect(W * 0.75, 0, W * 0.25, H)

  return new THREE.CanvasTexture(_cv2)
}


/** Keeps camera aimed at the center of the TV bezel every frame. */
function MeasureCamRig() {
  useFrame(({ camera }) => { camera.lookAt(0, 0, 0) })
  return null
}

/**
 * TVSizeMeasureScene — animated diagonal tape measure with housing + hook.
 *
 * Layout:
 *  · Silver L-bracket hook fixed at top-left screen corner.
 *  · Red plastic housing travels with the tape end (updated in useFrame).
 *    Housing center = tape_end + HW/2 - TAPE_INSIDE so tape visibly enters
 *    the case through the slot on the hook-facing side.
 *  · Canvas texture: one-foot repeating tile with clearly-readable marks.
 */
const NMARKS = 80

function TVSizeMeasureScene() {
  const tapeGroupRef  = useRef<THREE.Group>(null)
  const marksGroupRef = useRef<THREE.Group>(null)
  const housingRef    = useRef<THREE.Group>(null)


  // Screen edge vignette — black fade around all 4 edges, transparent center
  const screenVignetteTex = useMemo(() => {
    const W = 512, H = 288
    const canvas = document.createElement("canvas")
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext("2d")!
    ctx.clearRect(0, 0, W, H)
    const edge = 0.06  // very narrow — just at the border junction
    // Top edge
    const gT = ctx.createLinearGradient(0, 0, 0, H * edge)
    gT.addColorStop(0,   "rgba(0,0,0,0.55)")
    gT.addColorStop(1,   "rgba(0,0,0,0.00)")
    ctx.fillStyle = gT; ctx.fillRect(0, 0, W, H * edge)
    // Bottom edge
    const gB = ctx.createLinearGradient(0, H, 0, H * (1 - edge))
    gB.addColorStop(0,   "rgba(0,0,0,0.55)")
    gB.addColorStop(1,   "rgba(0,0,0,0.00)")
    ctx.fillStyle = gB; ctx.fillRect(0, H * (1 - edge), W, H)
    // Left edge
    const gL = ctx.createLinearGradient(0, 0, W * edge, 0)
    gL.addColorStop(0,   "rgba(0,0,0,0.55)")
    gL.addColorStop(1,   "rgba(0,0,0,0.00)")
    ctx.fillStyle = gL; ctx.fillRect(0, 0, W * edge, H)
    // Right edge
    const gR = ctx.createLinearGradient(W, 0, W * (1 - edge), 0)
    gR.addColorStop(0,   "rgba(0,0,0,0.55)")
    gR.addColorStop(1,   "rgba(0,0,0,0.00)")
    ctx.fillStyle = gR; ctx.fillRect(W * (1 - edge), 0, W, H)
    const tex = new THREE.CanvasTexture(canvas)
    return tex
  }, [])

  const bezelMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: "#111214", metalness: 0.0, roughness: 0.10,
      clearcoat: 1.0, clearcoatRoughness: 0.06, envMapIntensity: 1.8,
    }), []
  )
  const bezelChromeMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#c0c8d8", metalness: 0.90, roughness: 0.18,
    clearcoat: 0.55, clearcoatRoughness: 0.20, envMapIntensity: 1.2,
  }), [])
  const screenEmissive = useMemo(() => new THREE.Color("#0a1830"), [])

  // ── Tape materials ─────────────────────────────────────────────────────────
  // MeshBasicMaterial = unlit, perfectly flat yellow — eliminates lighting wrinkle
  const tapeFaceMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#f5c200" }), [])
  const tickBlackMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#111111", roughness: 0.5 }), []
  )
  const tickRedMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#cc0000", roughness: 0.5 }), []
  )

  // ── Housing materials — RED ────────────────────────────────────────────────
  const housingMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: "#c01010", roughness: 0.28, metalness: 0.05,
      clearcoat: 0.55, clearcoatRoughness: 0.10,
    }), []
  )
  const housingClipMat   = useMemo(() => new THREE.MeshStandardMaterial({ color: "#aaaaaa", roughness: 0.22, metalness: 0.88 }), [])

  // ── Hook — polished chrome ─────────────────────────────────────────────────
  const hookMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#c8cdd8", metalness: 0.55, roughness: 0.06,
    clearcoat: 0.8, clearcoatRoughness: 0.04, envMapIntensity: 1.6,
  }), [])

  // ── Geometry constants ─────────────────────────────────────────────────────
  const SCR_Y     = 0        // screen centered on bezel
  const sw = 1.00, sh = 0.56
  // Hook sits on the OUTER bezel corner (bezel is 2.20 × 1.24 centred at 0,0)
  const hookX = -1.10, hookY = 0.62
  // Tape starts from the same outer corner and ends at the opposite outer corner
  const startX = hookX, startY = hookY
  const endX   =  1.10, endY   = -0.62
  const diagLen   = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2)
  const diagAngle = Math.atan2(endY - startY, endX - startX)
  const cosA = Math.cos(diagAngle), sinA = Math.sin(diagAngle)

  const TAPE_H = 0.058  // tape face height

  // Housing dimensions (local X = along tape diagonal)
  const HW = 0.128  // length along tape
  const HH = 0.106  // height perpendicular to tape
  const HD = 0.072  // depth into screen
  const HCZ = 0.082 + HD * 0.5
  const TAPE_INSIDE    = HW * 0.38  // how far tape enters the housing
  const TAPE_OVERSHOOT = 0.096      // housing travels this far past the end corner at t=1
  const tapeFullLen    = diagLen + TAPE_OVERSHOOT - TAPE_INSIDE  // tape visible length at t=1
  const markSpan       = tapeFullLen + HW  // marks extend into housing body so last mark sits flush at slot face

  useFrame(({ clock }) => {
    const CYCLE = 5.2
    const phase = clock.elapsedTime % CYCLE
    let t: number
    if (phase < 3.0)      t = smoothstep(phase / 3.0)
    else if (phase < 3.8) t = 1.0
    else                  t = smoothstep(1.0 - (phase - 3.8) / 1.4)

    // extTip   = where the tape physically ends (it enters housing by TAPE_INSIDE)
    // slotFace = housing left face = extTip - TAPE_INSIDE
    // Housing center d = slotFace + HW/2
    // Tape scale = extTip / diagLen  →  tape always butts against housing slot
    const extTip   = (diagLen + TAPE_OVERSHOOT) * t   // tape end incl. overshoot
    const slotFace = extTip - TAPE_INSIDE              // housing left (slot) face

    if (tapeGroupRef.current)
      tapeGroupRef.current.scale.x = Math.max(0, extTip / diagLen)

    // Marks visible up to one spacing ahead of the slot face.
    // Marks beyond slotFace are inside the housing — depth-tested away automatically.
    if (marksGroupRef.current) {
      const markSpacing = markSpan / NMARKS
      marksGroupRef.current.children.forEach((child) => {
        child.visible = child.position.x <= slotFace + markSpacing
      })
    }

    if (housingRef.current) {
      const d = slotFace + HW * 0.5   // housing center = slot face + half-width
      housingRef.current.position.set(startX + cosA * d, startY + sinA * d, HCZ)
    }
  })

  return (
    <group>
      <MeasureCamRig />

      {/* ── Levl Void — deep lavender cyclorama with dramatic depth ─────── */}
      <color attach="background" args={["#b8aed4"]} />
      {/* Outer void sphere — very dark at poles, mid-lavender at equator */}
      <mesh scale={[18, 18, 18]}>
        <sphereGeometry args={[1, 48, 24]} />
        <meshStandardMaterial color="#8a7eb0" roughness={1} metalness={0} side={THREE.BackSide} envMapIntensity={0} />
      </mesh>
      {/* Inner glow sphere — brighter lavender closer to scene, creates depth gradient */}
      <mesh scale={[7, 7, 7]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshStandardMaterial color="#cec6e8" roughness={1} metalness={0} side={THREE.BackSide} envMapIntensity={0} transparent opacity={0.55} />
      </mesh>
      <Wall color="#c0b8dc" />
      <Floor color="#b8b0d4" />

      {/* ── Levl Void lighting — strong rake creates deep directional shadows ── */}
      {/* Very dark ambient so shadows read strongly */}
      <hemisphereLight args={["#d8d0f0", "#9080c0", 0.35]} />
      {/* Primary left rake — sharp directional shadow across background wall */}
      <directionalLight position={[-4, 3.0, 4.0]} intensity={2.80} color="#fff4ee" castShadow
        shadow-mapSize={[2048, 2048]} shadow-camera-near={0.1} shadow-camera-far={22}
        shadow-camera-left={-4} shadow-camera-right={4}
        shadow-camera-top={4} shadow-camera-bottom={-4}
        shadow-bias={-0.0003} shadow-normalBias={0.010} />
      {/* Top-right rim — edge highlight on bezel + housing */}
      <directionalLight position={[4, 6, 2]} intensity={0.90} color="#ffffff" />
      {/* Deep lavender fill from below-right — keeps shadows purple not black */}
      <pointLight position={[1.8, -0.8, 2.5]} intensity={0.55} color="#c8b8f0" />


      {/* ── TV bezel ── */}
      <mesh castShadow receiveShadow position={[0, 0, 0.040]}>
        <boxGeometry args={[2.20, 1.24, 0.065]} /><primitive object={bezelMat} />
      </mesh>
      {/* Screen glass */}
      <mesh position={[0, SCR_Y, 0.074]}>
        <boxGeometry args={[2.00, 1.12, 0.003]} />
        <meshPhysicalMaterial color={C.screen} emissive={screenEmissive} emissiveIntensity={0.55}
          roughness={0.45} metalness={0.0} clearcoat={0} envMapIntensity={0} />
      </mesh>

      {/* ── Chrome hairline perimeter edge — all 4 sides of bezel face ────── */}
      {/* Vertical sides behind (z=0.0726), shortened so they don't reach corners */}
      <mesh position={[-1.098, 0, 0.0726]}>
        <boxGeometry args={[0.004, 1.228, 0.0005]} /><primitive object={bezelChromeMat} />
      </mesh>
      <mesh position={[1.098, 0, 0.0726]}>
        <boxGeometry args={[0.004, 1.228, 0.0005]} /><primitive object={bezelChromeMat} />
      </mesh>
      {/* Horizontal top/bottom in front (z=0.0728), full width to own corners cleanly */}
      <mesh position={[0, 0.618, 0.0728]}>
        <boxGeometry args={[2.210, 0.004, 0.0005]} /><primitive object={bezelChromeMat} />
      </mesh>
      <mesh position={[0, -0.618, 0.0728]}>
        <boxGeometry args={[2.210, 0.004, 0.0005]} /><primitive object={bezelChromeMat} />
      </mesh>

      {/* ── Screen-edge inset ring — single plane behind screen glass ──────────
          Sits at z=0.0740: in front of bezel face (0.0725) but behind screen
          glass front face (0.0755). Screen glass covers the center; the 0.022
          border peeks out on all 4 sides as one seamless rectangle — no corners,
          no seams, no z-fighting. meshBasicMaterial = unlit, zero gradient.     */}
      <mesh position={[0, 0, 0.0740]}>
        <planeGeometry args={[2.044, 1.164]} />
        <meshBasicMaterial color="#040506" />
      </mesh>

      {/* ── Screen vignette — black fade blended into edges, transparent center */}
      <mesh position={[0, SCR_Y, 0.0759]}>
        <planeGeometry args={[2.00, 1.12]} />
        <meshBasicMaterial map={screenVignetteTex} transparent depthWrite={false} />
      </mesh>

      {/* ── Bottom chin — brushed chrome accent bar ─────────────────────────
          Centered horizontal bar in the chin area below the screen.          */}
      <mesh position={[0, -0.595, 0.0727]}>
        <boxGeometry args={[1.40, 0.007, 0.0008]} /><primitive object={bezelChromeMat} />
      </mesh>

      {/* ── Power indicator — small red standby light on bezel chin ──────── */}
      <mesh position={[0, -0.595, 0.0728]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.001, 16]} />
        <meshStandardMaterial color="#ff1010" emissive="#ff0000" emissiveIntensity={3.0} roughness={1} metalness={0} />
      </mesh>

      {/* ══ Silver hook — fixed at OUTER top-left bezel corner ══════════════
          Chrome L-bracket sits on the physical outside corner of the TV housing.
          Return lip hooks over the corner edge so the tape can't slip off.   */}
      <group position={[hookX, hookY, 0.087]} rotation={[0, 0, diagAngle]}>
        {/* Back plate */}
        <mesh castShadow>
          <boxGeometry args={[0.020, TAPE_H + 0.016, 0.005]} />
          <primitive object={hookMat} />
        </mesh>
        {/* Return lip — catches the corner */}
        <mesh position={[-0.011, 0, -0.007]}>
          <boxGeometry args={[0.006, TAPE_H + 0.016, 0.018]} />
          <primitive object={hookMat} />
        </mesh>
        {/* Top prong (small notch that seats against the bezel edge) */}
        <mesh position={[-0.006, (TAPE_H + 0.016) * 0.5 + 0.001, -0.004]}>
          <boxGeometry args={[0.018, 0.005, 0.014]} />
          <primitive object={hookMat} />
        </mesh>
      </group>

      {/* ── Animated tape — scales in X only (yellow face, no marks) ────────── */}
      <group
        ref={tapeGroupRef}
        position={[startX, startY, 0.084]}
        rotation={[0, 0, diagAngle]}
      >
        <mesh position={[diagLen / 2, 0, 0]}>
          <planeGeometry args={[diagLen, TAPE_H]} />
          <primitive object={tapeFaceMat} />
        </mesh>
      </group>

      {/* ── Marks — separate group, NOT scaled, fixed world positions ──────────
          Each mark is toggled visible/invisible in useFrame based on how far
          the tape has extended, so they appear to emerge from the housing.   */}
      <group
        ref={marksGroupRef}
        position={[startX, startY, 0.088]}
        rotation={[0, 0, diagAngle]}
      >
        {Array.from({ length: NMARKS }, (_, i) => {
          const frac   = (i + 0.9) / NMARKS  // spans into housing body — housing hides marks past slotFace
          const isFoot = (i + 1) % 5 === 0
          const isHalf = (i + 1) % 2 === 0 && !isFoot
          const markH  = isFoot ? TAPE_H * 0.82 : isHalf ? TAPE_H * 0.58 : TAPE_H * 0.40
          return (
            <mesh key={i} visible={false} position={[markSpan * frac, 0, 0]}>
              <boxGeometry args={[0.005, markH, 0.001]} />
              <primitive object={isFoot ? tickRedMat : tickBlackMat} />
            </mesh>
          )
        })}
      </group>

      {/* ══ Red housing — travels with tape end (position set in useFrame) ═══
          Aligned with tape diagonal (rotation={diagAngle}).
          Tape enters through the slot on the hook-side face (local -X).     */}
      <group ref={housingRef} rotation={[0, 0, diagAngle]}>
        {/* Main red body — rounded corners */}
        <RoundedBox args={[HW, HH, HD]} radius={0.014} smoothness={4} castShadow receiveShadow>
          <primitive object={housingMat} />
        </RoundedBox>

        {/* Tape entry slot — dark channel on hook-side face */}
        <mesh position={[-HW * 0.5 + 0.001, 0, 0]}>
          <boxGeometry args={[0.006, TAPE_H + 0.010, HD * 0.50]} />
          <meshStandardMaterial color="#3a0000" roughness={0.95} />
        </mesh>

        {/* Front-face detail: subtle white highlight line only */}
        <mesh position={[0, HH * 0.14, HD * 0.5 + 0.004]}>
          <boxGeometry args={[HW * 0.70, 0.007, 0.001]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.30} depthWrite={false} />
        </mesh>

        {/* ── Top face: red base + black rubber grip ridges ─────────────── */}
        <mesh position={[0, HH * 0.5 + 0.004, 0]}>
          <boxGeometry args={[HW * 0.86, 0.008, HD * 0.78]} />
          <primitive object={housingMat} />
        </mesh>
        {Array.from({ length: 6 }, (_, i) => {
          const x = (i / 5 - 0.5) * HW * 0.72
          return (
            <mesh key={i} position={[x, HH * 0.5 + 0.010, 0]}>
              <boxGeometry args={[0.008, 0.007, HD * 0.68]} />
              <meshStandardMaterial color="#111111" roughness={0.98} metalness={0} />
            </mesh>
          )
        })}

        {/* ── Bottom face: same red base + black rubber grip ridges ──────── */}
        <mesh position={[0, -HH * 0.5 - 0.004, 0]}>
          <boxGeometry args={[HW * 0.86, 0.008, HD * 0.78]} />
          <primitive object={housingMat} />
        </mesh>
        {Array.from({ length: 6 }, (_, i) => {
          const x = (i / 5 - 0.5) * HW * 0.72
          return (
            <mesh key={i} position={[x, -HH * 0.5 - 0.010, 0]}>
              <boxGeometry args={[0.008, 0.007, HD * 0.68]} />
              <meshStandardMaterial color="#111111" roughness={0.98} metalness={0} />
            </mesh>
          )
        })}

        {/* Belt clip on back */}
        <mesh position={[HW * 0.26, HH * 0.05, -HD * 0.5 - 0.012]} castShadow>
          <boxGeometry args={[0.013, HH * 0.74, 0.020]} />
          <primitive object={housingClipMat} />
        </mesh>
        {/* Clip bow */}
        <mesh position={[HW * 0.26, HH * 0.44, -HD * 0.5 - 0.005]}>
          <boxGeometry args={[0.013, 0.016, 0.010]} />
          <primitive object={housingClipMat} />
        </mesh>
      </group>

      {/* Shadow handled by directional light castShadow — housing + bezel + wall all configured */}
    </group>
  )
}

function ArtFrameScene() {
  const grp = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (grp.current) grp.current.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.010
  })
  const woodTex = useMemo(() => getWoodTex(), [])
  const woodMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: woodTex ?? undefined,
    color: "#5a3418",  // tints the grain toward dark walnut
    roughness: 0.58, metalness: 0.06,
  }), [woodTex])
  const matBoardMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f4f1eb", roughness: 0.92 }), [])
  const goldAccent  = useMemo(() => mkGold(), [])
  const goldShadow  = useMemo(() => mkGold(), [])  // for corner ornaments
  void goldShadow
  const paintingTex = useMemo(() => getPaintingTex(), [])
  const frameMaps   = useMemo(() => makeFrameMoldingMaps(), [])

  // Frame geometry: portrait — outer 1.04×1.52, inner opening 0.78×1.26
  // Bar widths: left/right = 0.13, top/bottom = 0.13
  const FZ = 0.047  // displaced plane z — just in front of box front face (0.045)

  return (
    <group ref={grp}>
      <MountLookAtRig y={0.0} />
      <MountWall />
      <MountFloor />
      <MountSceneLights />

      {/* Outer walnut frame body — portrait format */}
      <mesh castShadow receiveShadow><boxGeometry args={[1.04, 1.52, 0.090]} /><primitive object={woodMat} /></mesh>

      {/* Chiseled molding — 4 DisplacedBars for portrait frame */}
      {frameMaps && <>
        {/* Left bar */}
        <DisplacedBar pos={[-0.455, 0, FZ]} size={[0.13, 1.26]} maps={frameMaps} dispScale={0.050} normScale={5.5} />
        {/* Right bar */}
        <DisplacedBar pos={[ 0.455, 0, FZ]} size={[0.13, 1.26]} maps={frameMaps} dispScale={0.050} normScale={5.5} />
        {/* Top bar */}
        <DisplacedBar pos={[0,  0.695, FZ]} size={[0.13, 1.04]} maps={frameMaps} dispScale={0.050} normScale={5.5} rotZ={Math.PI / 2} />
        {/* Bottom bar */}
        <DisplacedBar pos={[0, -0.695, FZ]} size={[0.13, 1.04]} maps={frameMaps} dispScale={0.050} normScale={5.5} rotZ={Math.PI / 2} />
      </>}

      {/* Shadow reveal behind mat board */}
      <mesh position={[0, 0, 0.044]}>
        <boxGeometry args={[0.84, 1.32, 0.012]} /><meshStandardMaterial color="#130804" roughness={0.45} metalness={0.04} />
      </mesh>
      {/* Mat board */}
      <mesh position={[0, 0, 0.052]}><boxGeometry args={[0.78, 1.26, 0.006]} /><primitive object={matBoardMat} /></mesh>
      {/* Painting — portrait canvas texture */}
      <mesh position={[0, 0, 0.058]}>
        <boxGeometry args={[0.64, 1.12, 0.005]} />
        <meshStandardMaterial map={paintingTex ?? undefined} roughness={0.90} />
      </mesh>
      {/* Gold corner ornaments */}
      {([[-0.46,-0.70],[0.46,-0.70],[-0.46,0.70],[0.46,0.70]] as [number,number][]).map(([cx,cy],i) => (
        <mesh key={i} position={[cx, cy, 0.044]} castShadow>
          <boxGeometry args={[0.065, 0.065, 0.018]} /><primitive object={goldAccent} />
        </mesh>
      ))}
      <ContactShadows frames={1} position={[0, -0.90, -0.07]} blur={2.4} opacity={0.32} scale={3} color="#20102a" />
    </group>
  )
}

function ShelvesScene() {
  const grp = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (grp.current) grp.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.018
  })
  const woodTex      = useMemo(() => getWoodTex(), [])
  const shelfSideMat = useMemo(() => new THREE.MeshStandardMaterial({
    map: woodTex ?? undefined,
    color: "#9a7240",
    roughness: 0.55, metalness: 0.04,
  }), [woodTex])
  const shelfEdgeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c09860", roughness: 0.38, metalness: 0.06 }), [])
  const brkMat       = useMemo(() => mkGunmetal(0.22), [])
  const goldMat      = useMemo(() => mkGold(), [])
  const shelfRelief  = useMemo(() => makeShelfReliefMaps(), [])

  return (
    <group ref={grp}>
      <MountLookAtRig y={-0.04} />
      <MountWall />
      <MountFloor />
      <MountSceneLights />
      {/* Shelf thickness constant — thicker boards look more substantial */}
      {([0.52, -0.08, -0.60] as const).map((y, si) => (
        <group key={si} position={[0, y, 0.04]}>
          {/* Shelf board — thick solid oak. Top face (mat-2) has displaced grain relief. */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.48, 0.072, 0.26, 128, 2, 32]} />
            <primitive attach="material-0" object={shelfSideMat} />
            <primitive attach="material-1" object={shelfSideMat} />
            {shelfRelief ? (
              <meshPhysicalMaterial attach="material-2"
                map={shelfRelief.albedo}
                displacementMap={shelfRelief.displacement}
                displacementScale={0.022}
                normalMap={shelfRelief.normal}
                normalScale={new THREE.Vector2(3.5, 3.5)}
                roughnessMap={shelfRelief.roughness}
                roughness={1} metalness={0.02}
                clearcoat={0.22} clearcoatRoughness={0.40}
              />
            ) : (
              <primitive attach="material-2" object={shelfSideMat} />
            )}
            {/* Front face — warm walnut edge grain strip */}
            <meshStandardMaterial attach="material-4" color="#b07c44" roughness={0.42} metalness={0.05} />
            <primitive attach="material-3" object={shelfSideMat} />
            <primitive attach="material-5" object={shelfSideMat} />
          </mesh>
          {/* L-bracket supports — chunky steel angle brackets */}
          {([-0.62, 0.62] as const).map((x) => (
            <group key={x} position={[x, -0.010, 0]}>
              {/* Vertical arm */}
              <mesh castShadow><boxGeometry args={[0.030, 0.160, 0.030]} /><primitive object={brkMat} /></mesh>
              {/* Horizontal arm into wall */}
              <mesh position={[0, -0.072, -0.100]} castShadow><boxGeometry args={[0.030, 0.030, 0.180]} /><primitive object={brkMat} /></mesh>
              {/* Gusset plate */}
              <mesh position={[0, -0.040, -0.046]} rotation={[Math.PI * 0.80, 0, 0]} castShadow>
                <boxGeometry args={[0.022, 0.095, 0.012]} /><primitive object={brkMat} />
              </mesh>
              <Screw p={[0, 0.060, 0.016]} /><Screw p={[0, -0.060, -0.168]} />
            </group>
          ))}
          {si === 0 && (
            <>
              {/* Curated book stack — staggered heights, warm colour palette */}
              {([["#1a3a6e",0.200,-0.45],["#7a1a1a",0.172,-0.37],["#1a4a22",0.188,-0.30],["#3a2808",0.155,-0.22],["#5a3a80",0.168,-0.14]] as [string,number,number][]).map(([col,ht,bx]) => (
                <mesh key={bx} position={[bx, ht/2 + 0.036, 0.020]} castShadow>
                  <boxGeometry args={[0.058, ht, 0.048]} /><meshStandardMaterial color={col} roughness={0.72} />
                </mesh>
              ))}
              {/* Gold sculptural vase */}
              <mesh position={[0.26, 0.106, 0.020]} castShadow>
                <cylinderGeometry args={[0.014, 0.034, 0.18, 18]} /><primitive object={goldMat} />
              </mesh>
              <mesh position={[0.26, 0.200, 0.020]} castShadow>
                <sphereGeometry args={[0.022, 12, 12]} /><primitive object={goldMat} />
              </mesh>
            </>
          )}
          {si === 1 && (
            <>
              {/* Ceramic orb — matte white */}
              <mesh position={[-0.35, 0.075, 0.020]} castShadow>
                <sphereGeometry args={[0.066, 20, 20]} />
                <meshPhysicalMaterial color="#f0ece4" roughness={0.80} metalness={0.0} clearcoat={0.15} clearcoatRoughness={0.40} />
              </mesh>
              {/* Small framed photo */}
              <mesh position={[0.20, 0.072, 0.020]} castShadow>
                <boxGeometry args={[0.12, 0.098, 0.014]} /><meshStandardMaterial color="#2a1a10" roughness={0.55} />
              </mesh>
              <mesh position={[0.20, 0.072, 0.028]}>
                <boxGeometry args={[0.092, 0.072, 0.002]} /><meshStandardMaterial color="#d8e0e8" roughness={0.5} />
              </mesh>
              {/* Terracotta pot + plant */}
              <mesh position={[-0.06, 0.068, 0.020]} castShadow>
                <cylinderGeometry args={[0.032, 0.026, 0.10, 16]} /><meshStandardMaterial color="#b86040" roughness={0.82} />
              </mesh>
              <mesh position={[-0.06, 0.135, 0.020]}>
                <sphereGeometry args={[0.044, 12, 12]} /><meshStandardMaterial color="#226818" roughness={0.90} />
              </mesh>
            </>
          )}
          {si === 2 && (
            <>
              {/* Trio of taper candles — brass holders, white candles */}
              {([-0.30, -0.05, 0.22] as const).map((cx,i) => (
                <group key={i} position={[cx, 0, 0.020]}>
                  {/* Brass candleholder */}
                  <mesh castShadow>
                    <cylinderGeometry args={[0.024, 0.020, 0.028, 14]} />
                    <primitive object={goldMat} />
                  </mesh>
                  {/* Candle body — white */}
                  <mesh position={[0, 0.036 + (i*0.024), 0]} castShadow>
                    <cylinderGeometry args={[0.014, 0.014, 0.080 + i*0.040, 10]} />
                    <meshStandardMaterial color="#f4f0e8" roughness={0.78} />
                  </mesh>
                  {/* Flame — warm emissive */}
                  <mesh position={[0, 0.090 + (i*0.042), 0]}>
                    <sphereGeometry args={[0.010, 8, 8]} />
                    <meshStandardMaterial color="#ffcc40" emissive="#ff8800" emissiveIntensity={2.8} transparent opacity={0.88} depthWrite={false} />
                  </mesh>
                </group>
              ))}
            </>
          )}
        </group>
      ))}
      <ContactShadows frames={1} position={[0, -0.82, -0.06]} blur={2.5} opacity={0.28} scale={3.5} color="#20102a" />
    </group>
  )
}

function MirrorScene() {
  const mirrorRef  = useRef<THREE.Mesh>(null)
  const frameGold  = useMemo(() => mkGold(), [])
  const frameMat   = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#a8a4b0", metalness: 0.92, roughness: 0.08, clearcoat: 0.8, clearcoatRoughness: 0.06, envMapIntensity: 2.2 }), []
  )
  const mirrorFrameMaps = useMemo(() => makeMirrorFrameMaps(), [])

  useFrame(({ clock }) => {
    if (mirrorRef.current) {
      const m = mirrorRef.current.material as THREE.MeshPhysicalMaterial
      m.envMapIntensity = 4.2 + Math.sin(clock.elapsedTime * 0.6) * 0.40
    }
  })

  const sz = 0.94
  const FZ = 0.049  // displaced plane z — just in front of frame bar front face (0.0475)

  return (
    <group>
      <MountLookAtRig y={0.0} />
      <MountWall />
      <MountFloor />
      <MountSceneLights />
      {/* Frame bars — solid boxes for sides/depth, displaced planes for the chiseled front face */}
      <mesh position={[0, sz * 0.5 + 0.055, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[sz + 0.22, 0.11, 0.055]} /><primitive object={frameMat} />
      </mesh>
      <mesh position={[0, -(sz * 0.5 + 0.055), 0.02]} castShadow receiveShadow>
        <boxGeometry args={[sz + 0.22, 0.11, 0.055]} /><primitive object={frameMat} />
      </mesh>
      <mesh position={[-(sz * 0.5 + 0.055), 0, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.11, sz, 0.055]} /><primitive object={frameMat} />
      </mesh>
      <mesh position={[sz * 0.5 + 0.055, 0, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.11, sz, 0.055]} /><primitive object={frameMat} />
      </mesh>
      {/* Displaced brushed-silver molding relief overlaid on each bar face */}
      {mirrorFrameMaps && <>
        <DisplacedBar pos={[-(sz*0.5+0.055), 0, FZ]} size={[0.11, sz]}       maps={mirrorFrameMaps} dispScale={0.038} normScale={5.5} metalness={0.88} clearcoat={0.9} />
        <DisplacedBar pos={[ sz*0.5+0.055,  0, FZ]} size={[0.11, sz]}        maps={mirrorFrameMaps} dispScale={0.038} normScale={5.5} metalness={0.88} clearcoat={0.9} />
        <DisplacedBar pos={[0,  sz*0.5+0.055, FZ]} size={[0.11, sz+0.22]}   maps={mirrorFrameMaps} dispScale={0.038} normScale={5.5} metalness={0.88} clearcoat={0.9} rotZ={Math.PI/2} />
        <DisplacedBar pos={[0, -(sz*0.5+0.055), FZ]} size={[0.11, sz+0.22]} maps={mirrorFrameMaps} dispScale={0.038} normScale={5.5} metalness={0.88} clearcoat={0.9} rotZ={Math.PI/2} />
      </>}
      {/* Gold corner accents */}
      {([[-1,-1],[1,-1],[-1,1],[1,1]] as [number,number][]).map(([cx,cy],i) => (
        <mesh key={i} position={[cx*(sz*0.5+0.055), cy*(sz*0.5+0.055), 0.038]} castShadow>
          <boxGeometry args={[0.11, 0.11, 0.072]} /><primitive object={frameGold} />
        </mesh>
      ))}
      {/* Mirror silver backing — bright polished silver substrate */}
      <mesh position={[0, 0, 0.028]}>
        <boxGeometry args={[sz + 0.02, sz + 0.02, 0.010]} />
        <meshPhysicalMaterial color="#c8ccd8" metalness={1.0} roughness={0.0} envMapIntensity={3.0} />
      </mesh>
      {/* Mirror glass — maximally reflective, slightly cool blue tint like real silver mirror */}
      <mesh ref={mirrorRef} position={[0, 0, 0.042]}>
        <boxGeometry args={[sz, sz, 0.005]} />
        <meshPhysicalMaterial
          color="#dce4f0"
          metalness={1.0}
          roughness={0.001}
          envMapIntensity={4.5}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          ior={1.52}
        />
      </mesh>
      {/* Hanging bracket */}
      <mesh position={[0, sz * 0.5 + 0.11, 0.05]} castShadow>
        <boxGeometry args={[0.12, 0.032, 0.032]} />
        <meshPhysicalMaterial color={C.gunmetal} metalness={0.92} roughness={0.20} clearcoat={0.3} />
      </mesh>
      <ContactShadows frames={1} position={[0, -(sz*0.5+0.20), -0.06]} blur={2.4} opacity={0.26} scale={3} color="#20102a" />
    </group>
  )
}

function LightFixtureScene() {
  const glowRef  = useRef<THREE.PointLight>(null)
  const chromeMat = useMemo(() => mkChrome(0.06), [])
  const brassMat  = useMemo(() => mkGold(), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const flicker = 0.92 + Math.sin(t * 11.3) * 0.02 + Math.sin(t * 7.1) * 0.015
    if (glowRef.current) glowRef.current.intensity = 2.8 * flicker
  })

  return (
    <group>
      <MountLookAtRig y={0.72} />
      <MountWall />
      <MountSceneLights />
      {/* Ceiling — lavender-tinted plaster */}
      <mesh receiveShadow position={[0, 1.40, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100, 16, 16]} />
        <meshPhysicalMaterial color="#cfc8e8" roughness={0.82} metalness={0.0} clearcoat={0.04} clearcoatRoughness={0.6} />
      </mesh>
      <MountFloor />
      <mesh position={[0, 1.34, 0.01]} castShadow><cylinderGeometry args={[0.10, 0.095, 0.030, 20]} /><primitive object={chromeMat} /></mesh>
      <mesh position={[0, 1.32, 0.01]} castShadow>
        <sphereGeometry args={[0.098, 18, 9, 0, Math.PI * 2, 0, Math.PI * 0.5]} /><primitive object={brassMat} />
      </mesh>
      <mesh position={[0, 1.04, 0.01]} castShadow><cylinderGeometry args={[0.009, 0.009, 0.60, 10]} /><primitive object={chromeMat} /></mesh>
      <mesh position={[0, 0.72, 0.01]} castShadow rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.195, 0.014, 10, 28]} /><primitive object={brassMat} />
      </mesh>
      <mesh position={[0, 0.48, 0.01]} castShadow>
        <cylinderGeometry args={[0.22, 0.20, 0.45, 28, 1, true]} />
        <meshPhysicalMaterial color="#f4ede0" roughness={0.85} side={THREE.DoubleSide} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0, 0.245, 0.01]} castShadow rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.202, 0.012, 10, 28]} /><primitive object={brassMat} />
      </mesh>
      <mesh position={[0, 0.52, 0.01]} castShadow><cylinderGeometry args={[0.024, 0.018, 0.055, 14]} /><primitive object={chromeMat} /></mesh>
      <mesh position={[0, 0.47, 0.01]}>
        <sphereGeometry args={[0.048, 16, 16]} />
        <meshStandardMaterial color="#ffe8a0" emissive="#ffcc40" emissiveIntensity={3.2} transparent opacity={0.88} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.46, 0.01]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.012, 0.003, 8, 20]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ff8800" emissiveIntensity={4} />
      </mesh>
      <pointLight ref={glowRef} position={[0, 0.46, 0.01]} intensity={2.8} color="#ffe060" distance={4.5} decay={2} castShadow shadow-mapSize={[512, 512]} />
      <pointLight position={[0, 0.90, 0.01]} intensity={0.5} color="#ffe8c0" distance={2.0} decay={2} />
      <ContactShadows frames={1} position={[0, -0.88, -0.06]} blur={3.0} opacity={0.30} scale={4} color="#1a0808" />
    </group>
  )
}

// ─── Wall-texture scenes ──────────────────────────────────────────────────────

/**
 * Hairline outline for drywall — BackSide box just 0.02m larger than the block
 * on each axis. Produces a ~1–2px soft rim that prevents the near-white block
 * from disappearing into the lavender background. Barely visible intentionally.
 */

/** Snaps camera to look at block center every frame — keeps all wall types consistently framed. */
function WallCamRig() {
  useFrame(({ camera }) => { camera.lookAt(0, 0.25, 0) })
  return null
}

function WallTexScene({ material }: { material: WallMaterial }) {
  const { maps, dispScale, normScale, sideTint, sideRough } = useWallPBR(material)

  const albedo = maps.albedo

  // Side face (+x) UV continuity — block depth varies by material
  // Drywall is thin (0.30m); all others are 0.85m.
  const blockDepth  = material === "drywall" ? 0.30 : 0.85
  const sideFaceRpt = blockDepth / 1.85
  const sideA = useMemo(() => {
    const t = maps.albedo.clone(); t.repeat.set(sideFaceRpt, 1); t.offset.set(0, 0); t.needsUpdate = true; return t
  }, [maps])
  const sideN = useMemo(() => {
    const t = maps.normal.clone();      t.repeat.set(sideFaceRpt, 1); t.offset.set(0, 0); t.needsUpdate = true; return t
  }, [maps])
  const sideR = useMemo(() => {
    const t = maps.roughness.clone();    t.repeat.set(sideFaceRpt, 1); t.offset.set(0, 0); t.needsUpdate = true; return t
  }, [maps])
  const sideD = useMemo(() => {
    const t = maps.displacement.clone(); t.repeat.set(sideFaceRpt, 1); t.offset.set(0, 0); t.needsUpdate = true; return t
  }, [maps])

  // Dispose cloned side textures on unmount
  useEffect(() => {
    return () => { sideA.dispose(); sideN.dispose(); sideR.dispose(); sideD.dispose() }
  }, [sideA, sideN, sideR, sideD])

  return (
    <>
      <WallCamRig />

      {/* ── Levl Void — darker lavender infinity cove ───────────────────── */}
      <color attach="background" args={["#b8b2cc"]} />
      <mesh>
        <sphereGeometry args={[7, 32, 18]} />
        <meshStandardMaterial color="#b0a8c4" roughness={1} metalness={0} side={THREE.BackSide} envMapIntensity={0} />
      </mesh>

      {/* ── Levl Void lighting — strong directional rake, dark ambient ───── */}
      {/* Very dark hemisphere so shadows read deep and directional */}
      <hemisphereLight args={["#c8c0e0", "#8070a8", 0.30]} />
      {/* Primary left rake — sharp shadows across mortar joints */}
      <directionalLight position={[-5, 3.0, 4.0]} intensity={2.60} color="#fff4ee" castShadow
        shadow-mapSize={typeof window !== "undefined" && window.innerWidth < 768 ? [512, 512] : [1024, 1024]}
        shadow-camera-near={0.1} shadow-camera-far={20}
        shadow-camera-left={-4} shadow-camera-right={4}
        shadow-camera-top={4} shadow-camera-bottom={-4}
        shadow-bias={-0.0003} />
      {/* Top-right rim — edge highlight on block */}
      <directionalLight position={[4, 6, 2]} intensity={0.80} color="#ffffff" />
      {/* Deep lavender fill — keeps shadows purple not black */}
      <pointLight position={[1.8, -0.8, 2.5]} intensity={0.45} color="#c8b8f0" />
      {/* Plaster only — extra shallow rake from opposite side to pop trowel relief */}
      {material === "plaster" && (
        <directionalLight position={[5, 0.8, 3.0]} intensity={1.20} color="#fff0e8" />
      )}

      {/* ── Block floats 0.25 units above the shadow plane ──────────────── */}
      {/* Floating gap gives the ContactShadow visual presence / sense of lift */}
      <ContactShadows
        frames={1}
        position={[0, -1.40, 0]}
        scale={4}
        blur={2.8}
        opacity={0.55}
        far={2.0}
        color="#1e1438"
      />

      {/*
        ── Wall block — per-face materials ──────────────────────────────────
        Box face order in Three.js: right(+x)=0, left(-x)=1, top(+y)=2,
        bottom(-y)=3, front(+z)=4, back(-z)=5.

        Front (+z, mat-4): full PBR — albedo + displacement + normal + roughness.
        Right (+x, mat-0): albedo + normal, NO displacement — shows the material's
          texture/colour on the depth face without the stretch/smear artifact that
          displacement causes on the low-poly side segments. For brick this naturally
          maps horizontal mortar courses; for stone it shows the stone palette, etc.
        Top  (+y, mat-2): albedo + roughness, no displacement — clean flat top.
        Unseen faces: solid sideTint so the render stays cheap.
      */}
      <group position={[0, 0.25, 0]} rotation={[0, -0.16, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.85, 2.70, blockDepth, 128, 160, material === "stone" ? 58 : 2]} />
          {/* right side */}
          {material === "stone" ? (
            <meshStandardMaterial attach="material-0"
              map={sideA}
              displacementMap={sideD}
              displacementScale={dispScale}
              displacementBias={-dispScale * 0.5}
              normalMap={sideN}
              normalScale={new THREE.Vector2(normScale, normScale)}
              roughnessMap={sideR}
              roughness={1} metalness={0} envMapIntensity={0}
            />
          ) : (
            <meshStandardMaterial attach="material-0"
              map={sideA}
              normalMap={sideN}
              normalScale={new THREE.Vector2(normScale * 0.6, normScale * 0.6)}
              roughnessMap={sideR}
              roughness={1} metalness={0}
            />
          )}
          {/* left — not visible */}
          <meshStandardMaterial attach="material-1" color={sideTint} roughness={sideRough} metalness={0} />
          {/* top */}
          {material === "stone" ? (
            <meshStandardMaterial attach="material-2"
              map={albedo}
              normalMap={maps.normal}
              normalScale={new THREE.Vector2(normScale * 0.5, normScale * 0.5)}
              roughnessMap={maps.roughness}
              roughness={1} metalness={0}
            />
          ) : (
            <meshStandardMaterial attach="material-2"
              map={albedo}
              roughnessMap={maps.roughness}
              roughness={1} metalness={0}
            />
          )}
          {/* bottom — not visible */}
          <meshStandardMaterial attach="material-3" color={sideTint} roughness={sideRough} metalness={0} />
          {/* FRONT — full PBR */}
          <meshStandardMaterial attach="material-4"
            map={albedo}
            displacementMap={maps.displacement}
            displacementScale={dispScale}
            displacementBias={material === "stone" || material === "concrete" ? -dispScale * 1.1 : -dispScale * 0.5}
            normalMap={maps.normal}
            normalScale={new THREE.Vector2(normScale, normScale)}
            roughnessMap={maps.roughness}
            roughness={1} metalness={0}
          />
          {/* back — not visible */}
          <meshStandardMaterial attach="material-5" color={sideTint} roughness={sideRough} metalness={0} />
        </mesh>

        {material === "drywall" && (
          <mesh>
            <boxGeometry args={[1.89, 2.74, blockDepth + 0.04]} />
            <meshBasicMaterial color="#5a5068" transparent opacity={0.07} side={THREE.BackSide} depthWrite={false} />
          </mesh>
        )}
      </group>

    </>
  )
}

function MetalStudsScene() {
  const chromeMat = useMemo(() => mkChrome(0.12), [])
  const gungMat   = useMemo(() => mkGunmetal(0.22), [])
  return (
    <group>
      <Wall />
      {/* Top/bottom tracks */}
      <mesh position={[0, 1.12, 0]} castShadow receiveShadow><boxGeometry args={[3.5, 0.052, 0.09]} /><primitive object={chromeMat} /></mesh>
      <mesh position={[0, -1.12, 0]} castShadow receiveShadow><boxGeometry args={[3.5, 0.052, 0.09]} /><primitive object={chromeMat} /></mesh>
      {([-0.96, 0, 0.96] as const).map((x) => (
        <group key={x} position={[x, 0, 0]}>
          {/* Stud web */}
          <mesh castShadow><boxGeometry args={[0.064, 2.22, 0.042]} /><primitive object={chromeMat} /></mesh>
          {/* Flanges */}
          {([0.046, -0.046] as const).map((z) => (
            <mesh key={z} position={[0, 0, z]} castShadow><boxGeometry args={[0.064, 2.22, 0.030]} /><primitive object={gungMat} /></mesh>
          ))}
          {/* Knock-outs */}
          {([-0.5, 0, 0.5] as const).map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.022, 0.022, 0.044, 10]} />
              <meshStandardMaterial color="#1a1c24" metalness={0.88} roughness={0.15} />
            </mesh>
          ))}
          <Screw p={[0, 0.95, 0.024]} /><Screw p={[0, -0.95, 0.024]} />
        </group>
      ))}
      <ContactShadows frames={1} position={[0, -1.15, -0.06]} blur={2.5} opacity={0.28} scale={4} color="#20102a" />
    </group>
  )
}

// ─── Cable management scenes ──────────────────────────────────────────────────

/**
 * HiddenCableScene — dramatic architectural cutaway.
 *
 * Two full stud bays are exposed via a translucent drywall face (MeshPhysical
 * with clearcoat + low opacity).  Four cable types (power 10 mm, HDMI 8 mm,
 * ethernet 5 mm, coax 7 mm) thread through notched fire-blocks.  Entry and
 * exit grommets cap the holes.  Two independent signal pulses travel at
 * different speeds along the cable bundle so the viewer can track each
 * signal individually.  TV sits above; duplex outlet sits at the base.
 */
function HiddenCableScene() {
  const p1Ref = useRef<THREE.Mesh>(null)
  const p2Ref = useRef<THREE.Mesh>(null)
  const p3Ref = useRef<THREE.Mesh>(null)

  // Pulse positions: y travels from grommet-top to outlet grommet-bottom
  const PULSE_TOP = 0.30
  const PULSE_TRAVEL = 1.42

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const advance = (speed: number, offset: number) => ((t * speed + offset) % 1.0)

    const drives = [
      { ref: p1Ref, a: advance(0.65, 0.0),  col: C.purpleGlow, sz: 0.022, ei: 3.2 },
      { ref: p2Ref, a: advance(0.65, 0.42), col: C.purple,     sz: 0.016, ei: 2.6 },
      { ref: p3Ref, a: advance(0.80, 0.71), col: "#60a5fa",    sz: 0.013, ei: 2.4 },
    ]
    drives.forEach(({ ref, a, col, sz, ei }) => {
      if (!ref.current) return
      ref.current.position.y = PULSE_TOP - a * PULSE_TRAVEL
      const m = ref.current.material as THREE.MeshStandardMaterial
      m.color.set(col); m.emissive.set(col); m.emissiveIntensity = ei
      m.opacity = a < 0.90 ? 0.92 : 0
    })
  })

  // Four cable specs: power (thick), HDMI (medium), ethernet (slim), coax (medium-slim)
  const cableSpecs = useMemo(() => [
    { ox: -0.068, r: 0.0105, col: "#181818",  seg: 30 },  // power
    { ox: -0.020, r: 0.0085, col: "#2a2a34",  seg: 26 },  // HDMI
    { ox:  0.024, r: 0.0055, col: "#1a3a6a",  seg: 24 },  // ethernet (blue jacket)
    { ox:  0.062, r: 0.0075, col: "#383430",  seg: 26 },  // coax
  ], [])

  const cableGeos = useMemo(() => cableSpecs.map(({ ox, r, seg }) => {
    const pts = [
      new THREE.Vector3(ox,         PULSE_TOP,           -0.085),
      new THREE.Vector3(ox + 0.008, PULSE_TOP - 0.30,   -0.095),
      new THREE.Vector3(ox - 0.006, PULSE_TOP - 0.64,   -0.088),
      new THREE.Vector3(ox + 0.004, PULSE_TOP - 1.00,   -0.092),
      new THREE.Vector3(ox,         PULSE_TOP - PULSE_TRAVEL, -0.086),
    ]
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, 8, false)
  }), [cableSpecs])

  const grommetMat = useMemo(() => mkGunmetal(0.28), [])

  return (
    <group>
      <Wall color="#e0ddd5" />
      <Floor color="#ccc8c2" />

      {/* ── Translucent drywall face over the cutaway bay ── */}
      <mesh position={[0, -0.28, -0.020]}>
        <boxGeometry args={[0.80, 1.72, 0.095]} />
        <meshPhysicalMaterial
          color="#f0ede6" roughness={0.82} transparent opacity={0.22}
          depthWrite={false} side={THREE.DoubleSide}
          clearcoat={0.55} clearcoatRoughness={0.08} envMapIntensity={0.6}
        />
      </mesh>
      {/* Cutaway perimeter outline (darkened drywall edge) */}
      {([
        [0,  0.86,  0.04, 0.80, 0.014],   // top edge
        [0, -1.14,  0.04, 0.80, 0.014],   // bottom edge
        [-0.40, -0.28, 0.04, 0.014, 1.72], // left edge
        [ 0.40, -0.28, 0.04, 0.014, 1.72], // right edge
      ] as [number,number,number,number,number][]).map(([x,y,z,w,h], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[w, h, 0.012]} />
          <meshStandardMaterial color="#b4b0a8" roughness={0.88} />
        </mesh>
      ))}

      {/* ── Left and right king studs ── */}
      {([-0.36, 0.36] as const).map(sx => (
        <group key={sx} position={[sx, -0.28, -0.112]}>
          <mesh castShadow>
            <boxGeometry args={[0.038, 1.68, 0.089]} />
            <meshStandardMaterial color="#d2c49a" roughness={0.80} />
          </mesh>
          {/* Wood grain streaks */}
          {[-0.55, -0.18, 0.20, 0.55].map(gy => (
            <mesh key={gy} position={[0, gy, 0.046]}>
              <boxGeometry args={[0.036, 0.003, 0.001]} />
              <meshStandardMaterial color="#b8a880" roughness={1} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── Middle cripple stud (cable runs alongside it) ── */}
      <group position={[0, -0.28, -0.112]}>
        <mesh castShadow>
          <boxGeometry args={[0.038, 1.68, 0.089]} />
          <meshStandardMaterial color="#cebe94" roughness={0.82} />
        </mesh>
      </group>

      {/* ── Fire blocks × 2 (mid-cavity horizontal braces) ── */}
      {([-0.10, -0.52] as const).map((fy, fi) => (
        <group key={fi} position={[0, fy, -0.112]}>
          <mesh castShadow>
            <boxGeometry args={[0.68, 0.040, 0.089]} />
            <meshStandardMaterial color="#c8ba90" roughness={0.82} />
          </mesh>
          {/* Cable notch cutout (visual only — dark slot) */}
          <mesh position={[0, 0, 0.050]}>
            <boxGeometry args={[0.12, 0.040, 0.012]} />
            <meshStandardMaterial color="#1a1610" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* ── Entry grommet (top of cavity) ── */}
      <mesh position={[0, PULSE_TOP + 0.02, -0.065]} castShadow rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.052, 0.010, 10, 22]} />
        <primitive object={grommetMat} />
      </mesh>

      {/* ── Exit grommet (bottom of cavity) ── */}
      <mesh position={[0, PULSE_TOP - PULSE_TRAVEL - 0.02, -0.065]} castShadow rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.052, 0.010, 10, 22]} />
        <primitive object={grommetMat} />
      </mesh>

      {/* ── Four routed cables ── */}
      {cableGeos.map((geo, i) => (
        <mesh key={i} geometry={geo} castShadow>
          <meshStandardMaterial color={cableSpecs[i].col} roughness={0.58} metalness={0.06} />
        </mesh>
      ))}

      {/* ── Signal pulses (3 independent) ── */}
      {[p1Ref, p2Ref, p3Ref].map((r, i) => (
        <mesh key={i} ref={r} position={[0, PULSE_TOP, -0.088]}>
          <sphereGeometry args={[i === 0 ? 0.022 : 0.015, 10, 10]} />
          <meshStandardMaterial color={C.purpleGlow} emissive={C.purpleGlow} emissiveIntensity={3}
            transparent opacity={0.9} depthWrite={false} />
        </mesh>
      ))}

      {/* ── Wall mount plate + TV ── */}
      <WallPlate w={0.22} h={0.28} />
      <group position={[0, 0.16, 0.18]}><TVPanel /></group>

      {/* ── Outlet low on wall ── */}
      <Outlet position={[0, -1.02, -0.065]} />

      <ContactShadows frames={1} position={[0, -1.10, -0.06]} blur={2.8} opacity={0.30} scale={3.5} color="#20102a" />
    </group>
  )
}

/**
 * CableCoversScene — photorealistic D-channel raceway.
 *
 * The raceway body uses a proper U-profile cross-section (back plate + two
 * side walls + snap-on clearcoat lid) instead of a single box.  Three cable
 * colours are visible through the semi-transparent lid.  The animation is a
 * continuous loop: the raceway installs from just below the TV outlet and
 * slides down to the floor outlet over 2.4 s, holds for 1.5 s, then resets
 * and repeats — giving the client a permanent "how it installs" demonstration.
 * Mounting screws are placed at 200 mm intervals along the back plate.
 */
function CableCoversScene() {
  const racewayRef = useRef<THREE.Group>(null)

  // Raceway travels from just below TV (y≈-0.04) to just above outlet (y≈-0.94)
  const RACEWAY_TOP  = -0.04
  const RACEWAY_BOT  = -0.94
  const RACEWAY_H    =  RACEWAY_BOT - RACEWAY_TOP   // negative (travel downward)
  const RACEWAY_MID  = (RACEWAY_TOP + RACEWAY_BOT) / 2

  const bodyMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#f2efea", roughness: 0.44, metalness: 0.01,
    clearcoat: 0.78, clearcoatRoughness: 0.09,
  }), [])
  const lidMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#fefefe", roughness: 0.14, metalness: 0.0,
    clearcoat: 0.95, clearcoatRoughness: 0.04,
    transparent: true, opacity: 0.93,
  }), [])
  const screwMat = useMemo(() => mkBrushedSteel(), [])

  const totalH = Math.abs(RACEWAY_H)   // 0.90 m

  useFrame(({ clock }) => {
    if (!racewayRef.current) return
    // Cycle: 2.4 s install → 1.5 s hold → instant reset → repeat
    const CYCLE = 3.9
    const t = clock.elapsedTime % CYCLE
    const frac = t < 2.4 ? smoothstep(t / 2.4) : 1.0
    // Start clipped at top, extend to full height
    racewayRef.current.scale.y = frac
    // Keep top edge pinned at RACEWAY_TOP by shifting pivot
    racewayRef.current.position.y = RACEWAY_TOP + (RACEWAY_H * frac) / 2
  })

  // Screw positions along the back (evenly spaced)
  const screwYs = useMemo(() => {
    const n = 5
    return Array.from({ length: n }, (_, i) => (i / (n - 1)) * totalH - totalH / 2)
  }, [totalH])

  // Internal cable geometry (3 cables inside the channel)
  const internalCables = useMemo(() => {
    const colors = ["#141414", "#1e2030", "#2a2030"]
    const radii  = [0.0068, 0.0055, 0.0048]
    return colors.map((col, i) => {
      const ox = (i - 1) * 0.014
      const pts = [
        new THREE.Vector3(ox,  totalH / 2, -0.002),
        new THREE.Vector3(ox,  0,          -0.002),
        new THREE.Vector3(ox, -totalH / 2, -0.002),
      ]
      return {
        geo: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, radii[i], 7, false),
        col,
      }
    })
  }, [totalH])

  return (
    <group>
      <Wall />
      <Floor />
      <WallPlate w={0.22} h={0.28} />
      <group position={[0, 0.16, 0.18]}><TVPanel /></group>

      {/* ── Raceway assembly (animated) ── */}
      <group ref={racewayRef} position={[0, RACEWAY_MID, 0]}>
        {/* Back plate */}
        <mesh castShadow position={[0, 0, -0.014]}>
          <boxGeometry args={[0.082, totalH, 0.010]} />
          <primitive object={bodyMat} />
        </mesh>
        {/* Left side wall */}
        <mesh castShadow position={[-0.036, 0, 0.006]}>
          <boxGeometry args={[0.010, totalH, 0.040]} />
          <primitive object={bodyMat} />
        </mesh>
        {/* Right side wall */}
        <mesh castShadow position={[0.036, 0, 0.006]}>
          <boxGeometry args={[0.010, totalH, 0.040]} />
          <primitive object={bodyMat} />
        </mesh>
        {/* Snap-on lid (clearcoat, slightly proud) */}
        <mesh castShadow position={[0, 0, 0.030]}>
          <boxGeometry args={[0.072, totalH, 0.016]} />
          <primitive object={lidMat} />
        </mesh>
        {/* Lid centre seam */}
        <mesh position={[0, 0, 0.040]}>
          <boxGeometry args={[0.006, totalH, 0.001]} />
          <meshStandardMaterial color="white" transparent opacity={0.35} depthWrite={false} />
        </mesh>
        {/* End caps */}
        {([-1, 1] as const).map(s => (
          <mesh key={s} castShadow position={[0, s * (totalH / 2 + 0.010), 0.010]}>
            <boxGeometry args={[0.082, 0.022, 0.058]} />
            <primitive object={bodyMat} />
          </mesh>
        ))}
        {/* Mounting screws */}
        {screwYs.map((sy, i) => <Screw key={i} p={[0, sy, -0.010]} />)}
        {/* Internal cables */}
        {internalCables.map(({ geo, col }, i) => (
          <mesh key={i} geometry={geo}>
            <meshStandardMaterial color={col} roughness={0.62} metalness={0.08} />
          </mesh>
        ))}
      </group>

      {/* ── Short cable stub from TV to top of raceway ── */}
      {([-0.018, 0, 0.018] as const).map((ox, i) => {
        const pts = [
          new THREE.Vector3(ox, -0.44, 0.18),
          new THREE.Vector3(ox, -0.58, 0.08),
          new THREE.Vector3(ox, RACEWAY_TOP, 0.00),
        ]
        const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.007 - i * 0.001, 7, false)
        return (
          <mesh key={i} geometry={geo} castShadow>
            <meshStandardMaterial color={["#141414","#1e2030","#2a2030"][i]} roughness={0.60} metalness={0.08} />
          </mesh>
        )
      })}

      <Outlet position={[0.08, -1.00, -0.065]} />
      <ContactShadows frames={1} position={[0, -1.08, -0.06]} blur={2.5} opacity={0.28} scale={3.5} color="#20102a" />
    </group>
  )
}

/**
 * VisibleCablesScene — mouse-driven physics sway.
 *
 * Five cables (power ×2, HDMI, ethernet, aux) are modelled with true catenary
 * curves.  Each cable mesh is wrapped in its own pivot group positioned at the
 * TV connection point so that mouse-driven rotation produces a correct
 * pendulum swing from the anchor.  `useFrame` reads `mouse.x / mouse.y` from
 * R3F state and blends it with a low-frequency idle oscillation so the cables
 * always feel alive even when the cursor is still.  Strain-relief collars cap
 * both ends of every cable.
 */
function VisibleCablesScene() {
  // One ref per cable pivot group
  const pivotRefs = [
    useRef<THREE.Group>(null), useRef<THREE.Group>(null),
    useRef<THREE.Group>(null), useRef<THREE.Group>(null),
    useRef<THREE.Group>(null),
  ]

  // Cable connection point at bottom of TVPanel (TV sits at y=0.16, TVPanel h=0.97)
  const TV_BOTTOM_Y = 0.16 - 0.97 / 2   // ≈ -0.325

  const specs = useMemo(() => [
    { col: "#0d0d0f", r: 0.0115, ox: -0.10, phase: 0.0,  flex: 1.10 }, // power A
    { col: "#111118", r: 0.0115, ox: -0.04, phase: 0.55, flex: 0.90 }, // power B
    { col: "#1a1a22", r: 0.0085, ox:  0.02, phase: 1.10, flex: 1.20 }, // HDMI
    { col: "#1a3566", r: 0.0060, ox:  0.07, phase: 1.65, flex: 0.85 }, // ethernet
    { col: "#28241e", r: 0.0050, ox:  0.11, phase: 2.20, flex: 0.95 }, // aux
  ], [])

  // Cable length from TV bottom to outlet; pivot is at TV bottom connection
  const CABLE_DROP = 0.78   // metres of catenary travel

  const tubes = useMemo(() => specs.map(({ ox, r, flex }) => {
    const sag = 0.055 * flex
    const pts = [
      new THREE.Vector3(ox * 0.2,  0,            0.19),
      new THREE.Vector3(ox * 0.4, -0.18,          0.12),
      new THREE.Vector3(ox * flex * 0.6, -CABLE_DROP * 0.46 + sag, 0.05),
      new THREE.Vector3(ox * 0.3, -CABLE_DROP * 0.76, -0.02),
      new THREE.Vector3(ox * 0.1, -CABLE_DROP,    -0.06),
    ]
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 36, r, 8, false)
  }), [specs])

  const strainMat = useMemo(() => mkGunmetal(0.26), [])

  useFrame(({ clock, mouse }) => {
    const t = clock.elapsedTime
    pivotRefs.forEach((ref, i) => {
      if (!ref.current) return
      const ph = specs[i].phase
      // Idle oscillation — slow, realistic pendulum
      const idleZ = Math.sin(t * 0.28 + ph) * 0.018
      const idleX = Math.cos(t * 0.20 + ph) * 0.010
      // Mouse influence — scaled so full-screen mouse sweep gives ±8° swing
      const mouseZ = mouse.x * 0.14
      const mouseX = -mouse.y * 0.06
      ref.current.rotation.z = idleZ + mouseZ
      ref.current.rotation.x = idleX + mouseX
    })
  })

  return (
    <group>
      <Wall />
      <Floor />
      <WallPlate w={0.22} h={0.28} />
      <group position={[0, 0.16, 0.18]}><TVPanel /></group>

      {/* ── Per-cable pivot groups anchored at TV bottom connection ── */}
      {specs.map((spec, i) => (
        <group key={i} ref={pivotRefs[i]} position={[0, TV_BOTTOM_Y, 0]}>
          {/* Cable tube */}
          <mesh geometry={tubes[i]} castShadow>
            <meshStandardMaterial color={spec.col} roughness={0.60} metalness={0.10} />
          </mesh>
          {/* Strain relief collar — top */}
          <mesh position={[spec.ox * 0.25, -0.010, 0.18]} castShadow>
            <cylinderGeometry args={[spec.r * 1.65, spec.r * 1.65, 0.022, 10]} />
            <primitive object={strainMat} />
          </mesh>
          {/* Strain relief collar — bottom (outlet end) */}
          <mesh position={[spec.ox * 0.12, -CABLE_DROP + 0.010, -0.055]} castShadow>
            <cylinderGeometry args={[spec.r * 1.55, spec.r * 1.55, 0.018, 10]} />
            <primitive object={strainMat} />
          </mesh>
        </group>
      ))}

      {/* ── Cable tie midpoint — bunches cables together ── */}
      <mesh position={[0.02, TV_BOTTOM_Y - CABLE_DROP * 0.50, 0.04]} castShadow
            rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.026, 0.004, 8, 16]} />
        <meshStandardMaterial color="#1c1c24" metalness={0.82} roughness={0.20} />
      </mesh>

      <Outlet position={[0.04, -1.02, -0.065]} />
      <ContactShadows frames={1} position={[0, -1.08, -0.06]} blur={2.8} opacity={0.32} scale={3.5} color="#20102a" />
    </group>
  )
}

// ─── Scene dispatch ───────────────────────────────────────────────────────────

type CamCfg = { pos: [number, number, number]; fov: number }

const CAM = {
  mount:   { pos: [0,    0.10, 1.80], fov: 44 } as CamCfg,
  wall:    { pos: [2.60, 0.72, 4.50], fov: 42 } as CamCfg,
  item:    { pos: [0.85, 0.06, 1.90], fov: 50 } as CamCfg,
  cable:   { pos: [0,   -0.04, 1.80], fov: 46 } as CamCfg,
  ceil:    { pos: [0.06, 0.28, 1.95], fov: 48 } as CamCfg,
  fullmo:  { pos: [1.55, 0.22, 0.48], fov: 50 } as CamCfg,
  tilt:    { pos: [1.75, 0.15, 0.48], fov: 48 } as CamCfg,
  mirror:  { pos: [0.80, 0.04, 1.85], fov: 50 } as CamCfg,
  light:   { pos: [0.70, 0.72, 1.80], fov: 50 } as CamCfg,
  measure: { pos: [0,    0.04, 2.10], fov: 44 } as CamCfg,
}

function resolveScene(option: string): { scene: JSX.Element; cam: CamCfg; env: string } {
  switch (option) {
    case "TV/Monitor":
      return { scene: <TVItemScene />, cam: CAM.item, env: "apartment" }
    case "Art/Picture Frame":
      return { scene: <ArtFrameScene />, cam: CAM.item, env: "apartment" }
    case "Floating Shelves":
      return { scene: <ShelvesScene />, cam: { pos: [0.90, 0.00, 2.10], fov: 52 }, env: "apartment" }
    case "Mirror":
      return { scene: <MirrorScene />, cam: CAM.mirror, env: "apartment" }
    case "Light Fixture":
      return { scene: <LightFixtureScene />, cam: CAM.light, env: "apartment" }
    case "Fixed (flat against wall)":
      return { scene: <FixedScene />, cam: CAM.mount, env: "city" }
    case "Tilting (angle adjustment)":
      return { scene: <TiltingScene />, cam: CAM.tilt, env: "city" }
    case "Full-motion/Articulating (swivel and tilt)":
      return { scene: <FullMotionScene />, cam: CAM.fullmo, env: "city" }
    case "Ceiling mount":
      return { scene: <CeilingScene />, cam: CAM.ceil, env: "city" }
    case "Drywall/Sheetrock":
      return { scene: <WallTexScene material="drywall"   />, cam: CAM.wall, env: "apartment" }
    case "Brick":
      return { scene: <WallTexScene material="brick"     />, cam: CAM.wall, env: "apartment" }
    case "Concrete":
      return { scene: <WallTexScene material="concrete"  />, cam: CAM.wall, env: "apartment" }
    case "Plaster":
      return { scene: <WallTexScene material="plaster"   />, cam: CAM.wall, env: "apartment" }
    case "Stone":
      return { scene: <WallTexScene material="stone"     />, cam: CAM.wall, env: "apartment" }
    case "Metal studs":
      return { scene: <MetalStudsScene />, cam: CAM.wall, env: "city" }
    case "Yes, hide all cables in wall":
      return { scene: <HiddenCableScene />, cam: CAM.cable, env: "apartment" }
    case "Yes, use cable covers":
      return { scene: <CableCoversScene />, cam: CAM.cable, env: "apartment" }
    case "No, cables visible is fine":
      return { scene: <VisibleCablesScene />, cam: CAM.cable, env: "apartment" }
    case "__tv_measure":
      return { scene: <TVSizeMeasureScene />, cam: CAM.measure, env: "apartment" }
    default:
      return { scene: <></>, cam: CAM.wall, env: "city" }
  }
}

// ─── Shared Canvas wrapper ────────────────────────────────────────────────────

function SceneCanvas({
  cam, scene, thumbnail = false, env = "city", frameloop = "always",
}: {
  cam: CamCfg; scene: JSX.Element; thumbnail?: boolean; env?: string; frameloop?: "always" | "demand" | "never"
}) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  // HDR: 4K desktop / 2K mobile — sharper reflections on metallic materials
  const hdr = env === "apartment"
    ? (isMobile ? "/hdri/lebombo_2k.hdr"          : "/hdri/lebombo_4k.hdr")
    : (isMobile ? "/hdri/potsdamer_platz_2k.hdr"   : "/hdri/potsdamer_platz_4k.hdr")

  return (
    <Canvas
      shadows={!thumbnail}
      dpr={thumbnail ? 1 : (isMobile ? [1, 1.5] : [1, 2])}
      frameloop={frameloop}
      gl={{
        // NoToneMapping — postprocessing ToneMapping effect handles it after bloom
        antialias: !isMobile,  // SMAA handles AA on desktop; built-in on mobile
        toneMapping: THREE.NoToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: "high-performance",
      }}
      performance={{ min: 0.5 }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Default bg — individual scenes override this with their own <color> */}
      <color attach="background" args={["#f9f8f6"]} />
      <PerspectiveCamera makeDefault position={cam.pos} fov={cam.fov} near={0.05} far={200} />

      {thumbnail ? (
        <>
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 4]} intensity={1.4} color="#fff2e8" />
          <pointLight position={[-3, -1, 3]} intensity={0.3} color="#c8a4ff" />
        </>
      ) : (
        <>
          <ambientLight intensity={0.45} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} castShadow
            shadow-mapSize={isMobile ? [1024, 1024] : [2048, 2048]} />
          <pointLight position={[-10, -10, -10]} intensity={0.4} color="#818cf8" />
          <Lights />
        </>
      )}

      {scene}
      <Environment files={hdr} />

      {/* ── Post-processing ── */}
      {!thumbnail && (
        <EffectComposer multisampling={0}>
          {/* ACES filmic tone mapping — applied after bloom so HDR values bloom correctly */}
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          {/* Bloom — catches emissive/specular highlights, chrome, TV screens, light halos */}
          <Bloom
            luminanceThreshold={isMobile ? 0.45 : 0.30}
            luminanceSmoothing={0.85}
            intensity={isMobile ? 0.35 : 0.60}
            radius={isMobile ? 0.60 : 0.80}
            mipmapBlur
          />
          {/* N8AO — screen-space ambient occlusion (desktop only, too heavy for mobile) */}
          {!isMobile && (
            <N8AO
              quality="high"
              aoRadius={2.5}
              intensity={1.8}
              distanceFalloff={1.2}
              color="black"
            />
          )}
          {/* SMAA — high-quality antialiasing (desktop only) */}
          {!isMobile && <SMAA />}
        </EffectComposer>
      )}
    </Canvas>
  )
}

// ─── Public exports ───────────────────────────────────────────────────────────

// Static scenes have no animation — use frameloop="demand" so GPU renders once and stops
const STATIC_SCENES = new Set([
  "Drywall/Sheetrock", "Brick", "Concrete", "Plaster", "Stone", "Metal studs",
  "Fixed (flat against wall)",
])

export function Option3DImpl({
  option, thumbnail, frameloop = "always",
}: {
  option: string; thumbnail?: boolean; frameloop?: "always" | "demand" | "never"
}) {
  const { scene, cam, env } = resolveScene(option)
  // When caller says "always", downgrade to "demand" for static scenes to free GPU
  const effectiveFrameloop = frameloop === "always" && STATIC_SCENES.has(option)
    ? "demand"
    : frameloop
  return <SceneCanvas cam={cam} scene={scene} thumbnail={thumbnail} env={env} frameloop={effectiveFrameloop} />
}

/**
 * TVSizeMeasure — standalone export for the "What size is your TV?" section.
 * Drop this anywhere with a fixed height (e.g. h-56 / h-64).
 */
export function TVSizeMeasure() {
  const { scene, cam } = resolveScene("__tv_measure")
  return <SceneCanvas cam={cam} env="city" scene={scene} />
}
