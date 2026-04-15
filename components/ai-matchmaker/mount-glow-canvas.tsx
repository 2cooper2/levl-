"use client"

/**
 * mount-glow-canvas.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight WebGL bloom layer for the mount-hybrid-preview.
 *
 * This is the "WebGL" half of the Blender+WebGL mix. It renders ONLY ambient
 * glow orbs tuned per-option — no heavy geometry, no shadows, no PBR maps.
 * The canvas sits ABOVE the Blender PNG with pointer-events:none so it never
 * blocks clicks, and mix-blend-mode:screen so bloom halos add to the image
 * rather than covering it.
 *
 * Per-option glow configs:
 *   TV/Monitor       — warm amber screen glow (sunset content) + purple LED strip
 *   Art/Picture Frame — soft warm painting-light halo
 *   Floating Shelves  — gentle warm ambient from shelf lighting
 *   Mirror            — cool silver specular highlight pulse
 *   Light Fixture     — hot amber bulb halo + warm cone bloom
 *
 * SCOPE: only used inside mount-hybrid-preview.tsx. No other file imports this.
 */

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"
import * as THREE from "three"

// ─── Per-option glow configuration ───────────────────────────────────────────

interface GlowOrb {
  pos:    [number, number, number]
  color:  string
  intensity: number   // emissiveIntensity on the sphere
  radius: number
  pulseSpeed?: number
  pulseAmp?:   number
}

interface GlowConfig {
  orbs:          GlowOrb[]
  bloomIntensity: number
  bloomThreshold: number
  bloomRadius:    number
}

const GLOW_CFG: Record<string, GlowConfig> = {
  "TV/Monitor": {
    bloomIntensity: 1.4,
    bloomThreshold: 0.55,
    bloomRadius:    0.85,
    orbs: [
      // Screen amber glow (sunset content)
      { pos: [0, 0.06, 0.12],    color: "#d87020", intensity: 3.2, radius: 0.55, pulseSpeed: 0.4, pulseAmp: 0.15 },
      // Purple LED strip at bottom
      { pos: [0, -0.46, 0.10],   color: "#9040f8", intensity: 4.0, radius: 0.12, pulseSpeed: 0.8, pulseAmp: 0.08 },
      // Cool blue screen top
      { pos: [0, 0.30, 0.10],    color: "#2050c0", intensity: 1.8, radius: 0.30, pulseSpeed: 0.3, pulseAmp: 0.10 },
    ],
  },
  "Art/Picture Frame": {
    bloomIntensity: 0.9,
    bloomThreshold: 0.60,
    bloomRadius:    0.70,
    orbs: [
      // Warm painting-light halo (picture-light above frame)
      { pos: [0, 0.58, 0.08],    color: "#f0c060", intensity: 2.4, radius: 0.18, pulseSpeed: 0.25, pulseAmp: 0.12 },
      // Soft ambient warmth over canvas
      { pos: [0, 0.02, 0.08],    color: "#d8a860", intensity: 1.2, radius: 0.50, pulseSpeed: 0.18, pulseAmp: 0.08 },
    ],
  },
  "Floating Shelves": {
    bloomIntensity: 0.8,
    bloomThreshold: 0.65,
    bloomRadius:    0.65,
    orbs: [
      // Warm under-shelf light glow
      { pos: [0,  0.52, 0.16],   color: "#f0d090", intensity: 1.6, radius: 0.22, pulseSpeed: 0.20, pulseAmp: 0.10 },
      { pos: [0, -0.08, 0.16],   color: "#f0d090", intensity: 1.4, radius: 0.22, pulseSpeed: 0.22, pulseAmp: 0.08 },
      { pos: [0, -0.60, 0.16],   color: "#f0d090", intensity: 1.2, radius: 0.20, pulseSpeed: 0.24, pulseAmp: 0.06 },
      // Gold vase accent
      { pos: [0.22, 0.60, 0.12], color: "#c8901c", intensity: 2.0, radius: 0.08, pulseSpeed: 0.30, pulseAmp: 0.12 },
    ],
  },
  "Mirror": {
    bloomIntensity: 1.2,
    bloomThreshold: 0.50,
    bloomRadius:    0.90,
    orbs: [
      // Silver specular highlight — pulses like a real mirror catching light
      { pos: [-0.25, 0.28, 0.06], color: "#d8e0f0", intensity: 3.5, radius: 0.12, pulseSpeed: 0.60, pulseAmp: 0.30 },
      { pos: [ 0.30,-0.20, 0.06], color: "#c8d8f0", intensity: 2.8, radius: 0.10, pulseSpeed: 0.45, pulseAmp: 0.25 },
      // Ambient cool-silver fill across glass
      { pos: [0, 0, 0.04],        color: "#b0c0e0", intensity: 1.0, radius: 0.55, pulseSpeed: 0.15, pulseAmp: 0.06 },
      // Gold corner accent glow
      { pos: [-0.52, 0.52, 0.06], color: "#c89020", intensity: 2.2, radius: 0.06, pulseSpeed: 0.35, pulseAmp: 0.15 },
      { pos: [ 0.52,-0.52, 0.06], color: "#c89020", intensity: 2.2, radius: 0.06, pulseSpeed: 0.38, pulseAmp: 0.15 },
    ],
  },
  "Light Fixture": {
    bloomIntensity: 2.2,
    bloomThreshold: 0.40,
    bloomRadius:    1.10,
    orbs: [
      // Hot amber bulb core
      { pos: [0, 0.47, 0.01],    color: "#ffe048", intensity: 6.0, radius: 0.06, pulseSpeed: 11.3, pulseAmp: 0.20 },
      // Warm cone bloom — light spreading through shade
      { pos: [0, 0.25, 0.01],    color: "#ffb030", intensity: 2.5, radius: 0.26, pulseSpeed: 0.30, pulseAmp: 0.08 },
      // Ambient warm halo
      { pos: [0, 0.48, 0.01],    color: "#ff8800", intensity: 1.8, radius: 0.45, pulseSpeed: 7.1,  pulseAmp: 0.15 },
      // Brass ring accent glow
      { pos: [0, 0.72, 0.01],    color: "#c8901c", intensity: 1.5, radius: 0.22, pulseSpeed: 0.25, pulseAmp: 0.05 },
    ],
  },
}

// ─── Glow orb mesh ────────────────────────────────────────────────────────────

function GlowOrb({ orb }: { orb: GlowOrb }) {
  const ref = useRef<THREE.Mesh>(null)
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color:            orb.color,
    emissive:         new THREE.Color(orb.color),
    emissiveIntensity: orb.intensity,
    transparent:      true,
    opacity:          0.0,   // fully transparent geometry — only bloom is visible
    depthWrite:       false,
  }), [orb.color, orb.intensity])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    const speed = orb.pulseSpeed ?? 0.5
    const amp   = orb.pulseAmp   ?? 0.10
    const pulse = 1 + Math.sin(t * speed) * amp
    ;(ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity = orb.intensity * pulse
  })

  return (
    <mesh ref={ref} position={orb.pos}>
      <sphereGeometry args={[orb.radius, 10, 10]} />
      <primitive object={mat} />
    </mesh>
  )
}

// ─── Glow scene ───────────────────────────────────────────────────────────────

function GlowScene({ cfg }: { cfg: GlowConfig }) {
  return (
    <>
      {cfg.orbs.map((orb, i) => <GlowOrb key={i} orb={orb} />)}
      <EffectComposer>
        <Bloom
          intensity={cfg.bloomIntensity}
          luminanceThreshold={cfg.bloomThreshold}
          luminanceSmoothing={0.9}
          radius={cfg.bloomRadius}
          blendFunction={BlendFunction.SCREEN}
        />
      </EffectComposer>
    </>
  )
}

// ─── Public export ────────────────────────────────────────────────────────────

export function MountGlowCanvas({ option }: { option: string }) {
  const cfg = GLOW_CFG[option]
  if (!cfg) return null

  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      gl={{
        antialias:        false,
        alpha:            true,   // transparent canvas — bloom halos only
        powerPreference:  "default",
        toneMapping:      THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ width: "100%", height: "100%", mixBlendMode: "screen" }}
      camera={{ position: [0, 0.06, 1.80], fov: 44 }}
      performance={{ min: 0.5, debounce: 300 }}
    >
      <GlowScene cfg={cfg} />
    </Canvas>
  )
}
