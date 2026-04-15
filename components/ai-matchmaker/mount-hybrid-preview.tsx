"use client"

/**
 * mount-hybrid-preview.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * WebGL glow (bloom post-processing) + Blender path-traced PNG composite.
 * SCOPE: exclusively for the 5 "What would you like to mount?" options.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  Rendering layers (back → front)                                         │
 * │                                                                          │
 * │  1. WebGL scene with Bloom post-processing (always live)                 │
 * │       · Warm cream backdrop (MountWall)                                  │
 * │       · Full mount object geometry with emissive materials               │
 * │       · Bloom makes screen glow, bulb halo, mirror highlights shine      │
 * │                                                                          │
 * │  2. Blender PNG overlay (after running render_bridge.py)                 │
 * │       · RGBA transparent-bg path-traced render crossfades in             │
 * │       · Photorealistic geometry composited over the live glow layer      │
 * │       · Bloom from WebGL bleeds through transparent PNG edges            │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * SCOPE GUARANTEE: only imported by ai-service-matchmaker.tsx for the mount
 * question. Wall types, brackets, cables, TV measure — completely untouched.
 */

import {
  memo,
  useState,
  useEffect,
  useRef,
  Suspense,
  Component,
  type ReactNode,
} from "react"
import dynamic from "next/dynamic"

// ─── Scope ───────────────────────────────────────────────────────────────────

const MOUNT_ITEMS = new Set([
  "TV/Monitor",
  "Art/Picture Frame",
  "Floating Shelves",
  "Mirror",
  "Light Fixture",
])

const MOUNT_RENDERS: Record<string, string> = {
  "TV/Monitor":        "/assets/renders/tv-monitor.png",
  "Art/Picture Frame": "/assets/renders/art-frame.png",
  "Floating Shelves":  "/assets/renders/floating-shelves.png",
  "Mirror":            "/assets/renders/mirror.png",
  "Light Fixture":     "/assets/renders/light-fixture.png",
}

export function isMountItem(option: string): boolean {
  return MOUNT_ITEMS.has(option)
}

// ─── WebGL error boundary ─────────────────────────────────────────────────────

class MountWebGLBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

// Dynamic imports — ssr:false keeps all WebGL + post-processing off the server

const Option3DImpl = dynamic(
  () => import("./option-3d-impl").then(m => ({ default: m.Option3DImpl })),
  { ssr: false }
)

// Glow canvas — loads post-processing only on client
const MountGlowCanvas = dynamic(
  () => import("./mount-glow-canvas").then(m => ({ default: m.MountGlowCanvas })),
  { ssr: false }
)

// ─── MountHybridPreview ───────────────────────────────────────────────────────

type RenderState = "pending" | "loaded" | "failed"

export const MountHybridPreview = memo(function MountHybridPreview({
  option,
  className,
}: {
  option: string
  className?: string
}) {
  // Start true: new cards always appear scrolled into view
  const [canvasMounted, setCanvasMounted] = useState(true)
  const [frameActive, setFrameActive]     = useState(true)
  const [renderState, setRenderState]     = useState<RenderState>("pending")
  const [webglAlive, setWebglAlive]       = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const renderSrc = MOUNT_RENDERS[option]

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // Far observer — unmounts canvas when >500px off-screen, freeing WebGL context
    const farObs = new IntersectionObserver(
      ([entry]) => setCanvasMounted(entry.isIntersecting),
      { rootMargin: "500px 0px" }
    )
    // Exact observer — pauses frameloop when just outside viewport
    const exactObs = new IntersectionObserver(
      ([entry]) => setFrameActive(entry.isIntersecting),
      { rootMargin: "80px 0px" }
    )
    farObs.observe(el)
    exactObs.observe(el)
    return () => { farObs.disconnect(); exactObs.disconnect() }
  }, [])

  // Tear down the full WebGL scene 650ms after Blender PNG confirms loaded.
  // The glow canvas stays alive — it's lightweight and provides ambient bloom.
  useEffect(() => {
    if (renderState !== "loaded") return
    const t = window.setTimeout(() => setWebglAlive(false), 650)
    return () => window.clearTimeout(t)
  }, [renderState])

  const blenderLoaded = renderState === "loaded"
  const blenderFailed = renderState === "failed"

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className ?? ""}`}
      style={{ background: "#d6ccea" }}
    >
      <>
          {/* ── Layer 1: Full WebGL scene (fallback + transition base) ──────
              Alive until 650ms after Blender PNG confirms loaded.
              When Blender renders are missing, this is the permanent view.
              Has emissive materials that bloom will catch (TV screen glow,
              light fixture halo, mirror specular highlights).               */}
          {webglAlive && canvasMounted && (
            <div
              className="absolute inset-0"
              style={{
                opacity: blenderLoaded ? 0 : 1,
                transition: "opacity 0.40s ease",
              }}
            >
              <MountWebGLBoundary>
                <Suspense fallback={null}>
                  <Option3DImpl option={option} frameloop={frameActive ? "always" : "never"} />
                </Suspense>
              </MountWebGLBoundary>
            </div>
          )}

          {/* ── Layer 2: Bloom glow canvas ───────────────────────────────────
              Lightweight WebGL canvas — ONLY renders the ambient glow orbs.
              Sits above the Blender PNG so bloom halos bleed over the image.
              This is the "WebGL + Blender mix" — live glow on static render.
              Always visible (does not unmount when Blender PNG loads).       */}
          {blenderLoaded && (
            <div className="absolute inset-0 pointer-events-none">
              <MountWebGLBoundary>
                <Suspense fallback={null}>
                  <MountGlowCanvas option={option} />
                </Suspense>
              </MountWebGLBoundary>
            </div>
          )}

          {/* ── Layer 3: Blender render PNG ─────────────────────────────────
              RGBA 16-bit PNG, transparent bg (film_transparent: true).
              Transparent edges let the glow canvas bloom through the sides.
              Opaque areas: path-traced geometry with real GI + DOF shadows.  */}
          {renderSrc && !blenderFailed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={renderSrc}
              alt={option}
              className="absolute inset-0 w-full h-full pointer-events-none select-none"
              style={{
                objectFit: "contain",
                opacity: blenderLoaded ? 1 : 0,
                transition: "opacity 0.55s ease",
              }}
              onLoad={() => setRenderState("loaded")}
              onError={() => setRenderState("failed")}
            />
          )}
      </>
    </div>
  )
})
