"use client"

import { useRef, useMemo, type JSX } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { ContactShadows, Environment, PerspectiveCamera } from "@react-three/drei"
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

// ─── Procedural texture helpers ───────────────────────────────────────────────
type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

function buildTex(fn: DrawFn, w = 512, h = 512, rep: [number, number] = [1, 1]): THREE.CanvasTexture {
  const el = document.createElement("canvas")
  el.width = w; el.height = h
  fn(el.getContext("2d")!, w, h)
  const t = new THREE.CanvasTexture(el)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(...rep)
  t.needsUpdate = true
  return t
}

function drawBrickColor(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#b89870"; ctx.fillRect(0, 0, w, h)
  const bw = 112, bh = 46, mg = 7
  const rows = Math.ceil(h / (bh + mg)) + 2
  for (let row = 0; row < rows; row++) {
    const y = row * (bh + mg)
    const ox = (row % 2 === 0) ? 0 : (bw + mg) * 0.5
    for (let col = -1; col < Math.ceil(w / (bw + mg)) + 2; col++) {
      const x = col * (bw + mg) + ox
      const rv = 148 + (Math.random() * 42) | 0
      const gv = (58 + (Math.random() * 30)) | 0
      const bv = (32 + (Math.random() * 24)) | 0
      ctx.fillStyle = `rgb(${rv},${gv},${bv})`
      ctx.fillRect(x + 1, y + 1, bw - 2, bh - 2)
      ctx.fillStyle = "rgba(255,255,255,0.13)"; ctx.fillRect(x + 2, y + 2, bw - 4, 3)
      ctx.fillStyle = "rgba(0,0,0,0.14)"; ctx.fillRect(x + 2, y + bh - 5, bw - 4, 4)
      for (let p = 0; p < 7; p++) {
        ctx.fillStyle = `rgba(${rv - 40},${gv - 25},${bv - 18},0.38)`
        ctx.beginPath(); ctx.arc(x + 6 + Math.random() * (bw - 12), y + 4 + Math.random() * (bh - 8), 1 + Math.random() * 1.8, 0, Math.PI * 2); ctx.fill()
      }
    }
  }
}

function drawBrickBump(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#1e1e1e"; ctx.fillRect(0, 0, w, h)
  const bw = 112, bh = 46, mg = 7
  const rows = Math.ceil(h / (bh + mg)) + 2
  for (let row = 0; row < rows; row++) {
    const y = row * (bh + mg)
    const ox = (row % 2 === 0) ? 0 : (bw + mg) * 0.5
    for (let col = -1; col < Math.ceil(w / (bw + mg)) + 2; col++) {
      const x = col * (bw + mg) + ox
      const v = (195 + (Math.random() * 40)) | 0
      ctx.fillStyle = `rgb(${v},${v},${v})`;  ctx.fillRect(x + 1, y + 1, bw - 2, bh - 2)
      ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(x + 1, y + 1, bw - 2, 2); ctx.fillRect(x + 1, y + bh - 3, bw - 2, 2)
    }
  }
}

function drawConcreteColor(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#7e7e7c"; ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 280; i++) {
    const r = (3 + Math.random() * 10) | 0
    const v = (48 + Math.random() * 52) | 0
    ctx.fillStyle = `rgba(${v},${v - 2},${v - 5},0.78)`
    ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, r, 0, Math.PI * 2); ctx.fill()
  }
  for (let i = 0; i < 16000; i++) {
    const v = (92 + Math.random() * 64) | 0
    ctx.fillStyle = `rgba(${v},${v},${v - 4},0.055)`; ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5)
  }
  ctx.strokeStyle = "rgba(40,38,35,0.4)"; ctx.lineWidth = 1.8
  ctx.beginPath(); ctx.moveTo(0, h * 0.5); ctx.lineTo(w, h * 0.5); ctx.stroke()
}

function drawConcreteBump(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#808080"; ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 280; i++) {
    const r = (3 + Math.random() * 10) | 0
    const v = (Math.random() > 0.5 ? 30 : 200)
    ctx.fillStyle = `rgba(${v},${v},${v},0.55)`
    ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, r, 0, Math.PI * 2); ctx.fill()
  }
}

function drawPlasterColor(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#ede7d5"; ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 70; i++) {
    const [x, y] = [Math.random() * w, Math.random() * h]
    const [rx, ry] = [20 + Math.random() * 35, 3 + Math.random() * 6]
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.random() * Math.PI)
    const v = (185 + Math.random() * 22) | 0
    ctx.fillStyle = `rgba(${v},${(v - 8) | 0},${(v - 18) | 0},0.42)`
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore()
  }
}

function drawStoneColor(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#b8b0a0"; ctx.fillRect(0, 0, w, h)
  const blocks = [
    { x: 2, y: 2, w: w * 0.46, h: h * 0.44 }, { x: w * 0.5, y: 2, w: w * 0.48, h: h * 0.40 },
    { x: 2, y: h * 0.48, w: w * 0.30, h: h * 0.50 }, { x: w * 0.34, y: h * 0.44, w: w * 0.36, h: h * 0.54 },
    { x: w * 0.74, y: h * 0.44, w: w * 0.24, h: h * 0.54 }, { x: 2, y: h * 0.44, w: w * 0.28, h: h * 0.02 },
  ]
  blocks.forEach(({ x, y, w: bw, h: bh }) => {
    const v = (128 + Math.random() * 32) | 0
    ctx.fillStyle = `rgb(${v},${(v - 6) | 0},${(v - 11) | 0})`; ctx.fillRect(x + 3, y + 3, bw - 6, bh - 6)
    ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(x + 4, y + 4, bw - 8, 5)
    for (let p = 0; p < 30; p++) {
      const pv = v + ((Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 20)) | 0
      ctx.fillStyle = `rgba(${pv},${pv - 5},${pv - 9},0.22)`; ctx.fillRect(x + 5 + Math.random() * (bw - 10), y + 5 + Math.random() * (bh - 10), 2, 2)
    }
  })
}

function drawDrywallColor(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#eeebe3"; ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 9000; i++) {
    const v = (195 + Math.random() * 32) | 0
    ctx.fillStyle = `rgba(${v},${v},${(v - 8) | 0},0.15)`;  ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1)
  }
  ctx.strokeStyle = "rgba(0,0,0,0.05)"; ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(0, h * 0.49); ctx.lineTo(w, h * 0.49); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, h * 0.51); ctx.lineTo(w, h * 0.51); ctx.stroke()
}

function usePBRWall(colorFn: DrawFn, bumpFn: DrawFn | null, repeat: [number, number] = [1, 1]) {
  return useMemo(() => ({
    color: buildTex(colorFn, 512, 512, repeat),
    bump:  bumpFn ? buildTex(bumpFn, 512, 512, repeat) : null,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])
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
  const bezelMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#0d1016", metalness: 0.65, roughness: 0.2, clearcoat: 0.5, clearcoatRoughness: 0.08 }), []
  )
  const screenEmissive = useMemo(() => new THREE.Color("#0e2040"), [])
  return (
    <group>
      <mesh castShadow receiveShadow><boxGeometry args={[1.64, 0.97, 0.065]} /><primitive object={bezelMat} /></mesh>
      <mesh position={[0, 0.006, 0.034]}>
        <boxGeometry args={[1.52, 0.862, 0.003]} />
        <meshPhysicalMaterial color={C.screen} emissive={screenEmissive} emissiveIntensity={0.6}
          roughness={0.03} metalness={0.04} clearcoat={1} clearcoatRoughness={0.01} reflectivity={0.9} envMapIntensity={1.2} />
      </mesh>
      {/* Warm interior glow gradients */}
      <mesh position={[0.22, 0.18, 0.037]}>
        <planeGeometry args={[0.55, 0.28]} /><meshStandardMaterial color="#ffe8c0" transparent opacity={0.055} depthWrite={false} />
      </mesh>
      <mesh position={[0.30, 0.24, 0.037]}>
        <planeGeometry args={[0.36, 0.2]} /><meshStandardMaterial color="white" transparent opacity={0.045} depthWrite={false} />
      </mesh>
      {/* Branding LED strip */}
      <mesh position={[0, -0.462, 0.024]}>
        <boxGeometry args={[1.18, 0.007, 0.007]} />
        <meshStandardMaterial color={C.purple} emissive={C.purple} emissiveIntensity={2.2} />
      </mesh>
      <mesh position={[0.0, -0.462, 0.034]}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial color={C.green} emissive={C.green} emissiveIntensity={2.8} />
      </mesh>
      <mesh position={[0, 0.46, 0.034]} rotation={[Math.PI / 2, 0, 0]}>
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
  const grp      = useRef<THREE.Group>(null)
  const plateMat = useMemo(() => mkGunmetal(0.24), [])
  const spacerMat = useMemo(() => mkChrome(0.12), [])

  useFrame(({ clock }) => {
    if (grp.current) grp.current.position.y = Math.sin(clock.elapsedTime * 0.55) * 0.018
  })

  return (
    <group ref={grp}>
      <Wall color="#e6e2da" />
      <Floor />

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

      {/* TV — sits flush against bracket */}
      <group position={[0, 0, 0.060]}>
        <TVPanel />
      </group>

      <ContactShadows frames={1} position={[0, -0.64, -0.02]} blur={2.6} opacity={0.30} scale={3.0} color="#20102a" />
    </group>
  )
}

/**
 * TVSizeMeasureScene — animated diagonal tape measure.
 *
 * The tape grows from the top-left screen corner to the bottom-right over 2.6 s
 * (smoothstep eased), holds for 1.4 s, retracts over 1.0 s, then repeats.
 * The pivot group is anchored at the top-left corner so `scale.x` expansion
 * produces a correct left-to-right draw.  Tick marks and a measurement badge
 * ride inside the same group and animate with it.  The bottom-right anchor dot
 * fades in only when the tape fully arrives.
 * TV is wall-mounted on a slim plate to match the service context.
 */
function TVSizeMeasureScene() {
  const tapeGroupRef = useRef<THREE.Group>(null)
  const endDotRef    = useRef<THREE.Mesh>(null)

  const bezelMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#0d1016", metalness: 0.65, roughness: 0.20, clearcoat: 0.5, clearcoatRoughness: 0.08 }), []
  )
  const screenEmissive = useMemo(() => new THREE.Color("#0a1830"), [])
  const tapeMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({
      color: "#f5c518", emissive: "#8a6000", emissiveIntensity: 0.25,
      roughness: 0.12, metalness: 0.05,
      clearcoat: 1.0, clearcoatRoughness: 0.04,
      envMapIntensity: 1.6,
    }), []
  )
  const tickMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.6, transparent: true, opacity: 0.85, depthWrite: false }), []
  )
  const plateMat = useMemo(() => mkGunmetal(0.24), [])
  const spacerMat = useMemo(() => mkChrome(0.12), [])

  // Screen half-extents (matches TVPanel 1.52 × 0.862 screen)
  const sw = 0.760, sh = 0.431
  const diagLen   = Math.sqrt((2 * sw) ** 2 + (2 * sh) ** 2)
  // Angle: diagonal from top-left (-sw, +sh) to bottom-right (+sw, -sh)
  const diagAngle = Math.atan2(-(2 * sh), 2 * sw)

  const TICKS = 7
  // Y offset — screen center sits at y=0.056 (TVPanel offset)
  const SCR_Y = 0.056

  useFrame(({ clock }) => {
    // Cycle: 2.6 s draw | 1.4 s hold | 1.0 s retract | repeat = 5.0 s
    const CYCLE = 5.0
    const phase = clock.elapsedTime % CYCLE
    let t: number
    if (phase < 2.6)      t = smoothstep(phase / 2.6)
    else if (phase < 4.0) t = 1.0
    else                  t = smoothstep(1.0 - (phase - 4.0) / 1.0)

    if (tapeGroupRef.current) tapeGroupRef.current.scale.x = t

    if (endDotRef.current) {
      const m = endDotRef.current.material as THREE.MeshStandardMaterial
      m.opacity = t > 0.96 ? 1.0 : 0.0
    }
  })

  return (
    <group>
      <Wall color="#e4e0d8" />
      <Floor color="#d0ccc4" />

      {/* ── Wall bracket (behind TV) ── */}
      <mesh position={[0, 0, 0.006]} castShadow receiveShadow>
        <boxGeometry args={[0.32, 0.40, 0.022]} /><primitive object={plateMat} />
      </mesh>
      {([[-0.11,-0.11],[0.11,-0.11],[-0.11,0.11],[0.11,0.11]] as [number,number][]).map(([bx,by],i) => (
        <mesh key={i} position={[bx, by, 0.022]} castShadow>
          <cylinderGeometry args={[0.010, 0.010, 0.026, 10]} />
          <primitive object={spacerMat} />
        </mesh>
      ))}

      {/* ── TV bezel ── */}
      <mesh castShadow receiveShadow position={[0, 0, 0.040]}>
        <boxGeometry args={[1.76, 1.05, 0.065]} /><primitive object={bezelMat} />
      </mesh>
      {/* Screen glass */}
      <mesh position={[0, SCR_Y, 0.074]}>
        <boxGeometry args={[1.54, 0.875, 0.003]} />
        <meshPhysicalMaterial color={C.screen} emissive={screenEmissive} emissiveIntensity={0.55}
          roughness={0.03} metalness={0.04} clearcoat={1} clearcoatRoughness={0.01} envMapIntensity={0.9} />
      </mesh>
      {/* Purple LED strip */}
      <mesh position={[0, -0.484, 0.074]}>
        <boxGeometry args={[1.20, 0.007, 0.007]} />
        <meshStandardMaterial color={C.purple} emissive={C.purple} emissiveIntensity={2.0} />
      </mesh>

      {/* ── Top-left anchor dot (always visible) ── */}
      <mesh position={[-sw, sh + SCR_Y, 0.082]}>
        <sphereGeometry args={[0.024, 12, 12]} />
        <meshStandardMaterial color="#f5c518" emissive="#c89800" emissiveIntensity={1.0} />
      </mesh>

      {/* ── Animated tape group — pivot at top-left screen corner ── */}
      <group
        ref={tapeGroupRef}
        position={[-sw, sh + SCR_Y, 0.080]}
        rotation={[0, 0, diagAngle]}
      >
        {/* Tape body — left edge fixed at group origin, grows rightward */}
        <mesh position={[diagLen / 2, 0, 0]} castShadow>
          <boxGeometry args={[diagLen, 0.022, 0.005]} /><primitive object={tapeMat} />
        </mesh>
        {/* Tick marks at even intervals */}
        {Array.from({ length: TICKS }, (_, i) => {
          const frac = (i + 1) / (TICKS + 1)
          const isMid = i === Math.floor(TICKS / 2)
          return (
            <mesh key={i} position={[diagLen * frac, 0, 0.005]}>
              <boxGeometry args={[0.005, isMid ? 0.050 : 0.032, 0.003]} />
              <primitive object={tickMat} />
            </mesh>
          )
        })}
        {/* Measurement badge riding at 60 % of tape length */}
        <group position={[diagLen * 0.60, 0.042, 0.006]}>
          {/* Badge background */}
          <mesh castShadow>
            <boxGeometry args={[0.21, 0.080, 0.008]} />
            <meshStandardMaterial color="#f5c518" roughness={0.22} metalness={0.02} />
          </mesh>
          {/* Badge face (dark inset) */}
          <mesh position={[0, 0, 0.005]}>
            <boxGeometry args={[0.195, 0.064, 0.003]} />
            <meshStandardMaterial color="#1a1000" roughness={0.65} />
          </mesh>
          {/* Badge highlight strip (simulates printed text reflection) */}
          <mesh position={[-0.035, 0.008, 0.009]}>
            <boxGeometry args={[0.085, 0.012, 0.001]} />
            <meshStandardMaterial color="#f5c518" transparent opacity={0.55} depthWrite={false} />
          </mesh>
          <mesh position={[0.04, -0.006, 0.009]}>
            <boxGeometry args={[0.055, 0.010, 0.001]} />
            <meshStandardMaterial color="#f5c518" transparent opacity={0.40} depthWrite={false} />
          </mesh>
        </group>
      </group>

      {/* ── Bottom-right anchor dot (fades in when tape arrives) ── */}
      <mesh ref={endDotRef} position={[sw, -sh + SCR_Y, 0.082]}>
        <sphereGeometry args={[0.024, 12, 12]} />
        <meshStandardMaterial color="#f5c518" emissive="#c89800" emissiveIntensity={1.0}
          transparent opacity={0} depthWrite={false} />
      </mesh>

      <ContactShadows frames={1} position={[0, -0.62, 0.04]} blur={2.4} opacity={0.28} scale={3.0} color="#20102a" />
    </group>
  )
}

function ArtFrameScene() {
  const grp = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (grp.current) grp.current.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.010
  })
  const woodMat     = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2e1c0a", roughness: 0.65, metalness: 0.08 }), [])
  const matBoardMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f8f5ef", roughness: 0.88 }), [])
  const canvasMat   = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e8d8a8", roughness: 0.82 }), [])

  return (
    <group ref={grp}>
      <Wall color="#e4e0d8" />
      <Floor />
      {/* Outer frame */}
      <mesh castShadow receiveShadow><boxGeometry args={[1.30, 1.02, 0.072]} /><primitive object={woodMat} /></mesh>
      {/* Inner frame reveal */}
      <mesh position={[0, 0, 0.038]}>
        <boxGeometry args={[1.06, 0.80, 0.014]} /><meshStandardMaterial color="#1e0e04" roughness={0.5} metalness={0.06} />
      </mesh>
      {/* Mat board */}
      <mesh position={[0, 0, 0.046]}><boxGeometry args={[1.02, 0.76, 0.006]} /><primitive object={matBoardMat} /></mesh>
      {/* Canvas surface */}
      <mesh position={[0, 0, 0.052]}><boxGeometry args={[0.84, 0.62, 0.002]} /><primitive object={canvasMat} /></mesh>
      {/* Sky */}
      <mesh position={[0, 0.14, 0.055]}><boxGeometry args={[0.84, 0.28, 0.001]} /><meshStandardMaterial color="#a8c8e8" roughness={0.9} /></mesh>
      {/* Hills */}
      {([[-0.28, 0.04],[0, 0.06],[0.24, 0.02]] as [number,number][]).map(([mx,mh],i) => (
        <mesh key={i} position={[mx, mh, 0.056]}>
          <boxGeometry args={[0.30, 0.20 + mh, 0.001]} /><meshStandardMaterial color={`hsl(${200 + i*12},18%,${48+i*5}%)`} roughness={0.9} />
        </mesh>
      ))}
      {/* Tree masses */}
      {([[-0.32,0.0],[0.05,-0.02],[0.30,0.01]] as [number,number][]).map(([hx,hy],i) => (
        <mesh key={i} position={[hx, hy, 0.057]}>
          <boxGeometry args={[0.40, 0.22, 0.001]} /><meshStandardMaterial color={`hsl(${128+i*8},28%,${34+i*4}%)`} roughness={0.9} />
        </mesh>
      ))}
      {/* Water */}
      <mesh position={[0, -0.18, 0.057]}>
        <boxGeometry args={[0.84, 0.22, 0.001]} /><meshStandardMaterial color="#5a88b8" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Water shimmer lines */}
      {([-0.2, 0.05, 0.28] as const).map((wx,i) => (
        <mesh key={i} position={[wx, -0.14+i*0.028, 0.058]}>
          <boxGeometry args={[0.12+i*0.04, 0.005, 0.001]} /><meshStandardMaterial color="white" transparent opacity={0.35} roughness={0.2} depthWrite={false} />
        </mesh>
      ))}
      {/* Gold corner accents */}
      {([[-0.60,-0.46],[0.60,-0.46],[-0.60,0.46],[0.60,0.46]] as [number,number][]).map(([cx,cy],i) => (
        <mesh key={i} position={[cx, cy, 0.038]} castShadow>
          <boxGeometry args={[0.055, 0.055, 0.012]} /><meshStandardMaterial color="#c8a020" metalness={0.88} roughness={0.18} />
        </mesh>
      ))}
      {/* Hanging wire */}
      <mesh position={[0, 0.55, 0.034]}>
        <cylinderGeometry args={[0.003, 0.003, 0.38, 6]} /><meshStandardMaterial color={C.steel} metalness={0.96} roughness={0.28} />
      </mesh>
      <ContactShadows frames={1} position={[0, -0.64, -0.07]} blur={2.2} opacity={0.28} scale={3} color="#20102a" />
    </group>
  )
}

function ShelvesScene() {
  const grp = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (grp.current) grp.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.018
  })
  const shelfMat     = useMemo(() => new THREE.MeshStandardMaterial({ color: "#8a6230", roughness: 0.60, metalness: 0.04 }), [])
  const shelfEdgeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#a07840", roughness: 0.45, metalness: 0.06 }), [])
  const brkMat       = useMemo(() => mkGunmetal(0.22), [])
  const goldMat      = useMemo(() => mkGold(), [])

  return (
    <group ref={grp}>
      <Wall color="#e6e2da" />
      <Floor />
      {([0.52, -0.08, -0.60] as const).map((y, si) => (
        <group key={si} position={[0, y, 0.04]}>
          <mesh castShadow receiveShadow><boxGeometry args={[1.48, 0.052, 0.24]} /><primitive object={shelfMat} /></mesh>
          <mesh position={[0, 0.026, 0.12]}><boxGeometry args={[1.48, 0.016, 0.006]} /><primitive object={shelfEdgeMat} /></mesh>
          {[-0.5,-0.3,-0.1,0.1,0.3,0.5].map((gx) => (
            <mesh key={gx} position={[gx, 0.028, 0]}>
              <boxGeometry args={[0.009, 0.001, 0.23]} /><meshStandardMaterial color="#6a4820" transparent opacity={0.28} roughness={1} />
            </mesh>
          ))}
          {([-0.62, 0.62] as const).map((x) => (
            <group key={x} position={[x, -0.01, 0]}>
              <mesh castShadow><boxGeometry args={[0.022, 0.128, 0.022]} /><primitive object={brkMat} /></mesh>
              <mesh position={[0, -0.062, -0.095]} castShadow><boxGeometry args={[0.022, 0.022, 0.17]} /><primitive object={brkMat} /></mesh>
              <mesh position={[0, -0.038, -0.040]} rotation={[Math.PI * 0.85, 0, 0]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.092, 4]} /><primitive object={brkMat} />
              </mesh>
              <Screw p={[0, 0.050, 0.012]} /><Screw p={[0, -0.054, -0.155]} />
            </group>
          ))}
          {si === 0 && (
            <>
              {[["#2e4a80",0.18,-0.44],["#8b2020",0.15,-0.30],["#1e5a2e",0.17,-0.16],["#4a3a10",0.14,-0.02]].map(([col,ht,bx]) => (
                <mesh key={String(bx)} position={[bx as number, (ht as number)/2 + 0.025, 0.02]} castShadow>
                  <boxGeometry args={[0.062, ht as number, 0.048]} /><meshStandardMaterial color={col as string} roughness={0.7} />
                </mesh>
              ))}
              <mesh position={[0.22, 0.08, 0.02]} castShadow>
                <cylinderGeometry args={[0.022, 0.030, 0.16, 14]} /><primitive object={goldMat} />
              </mesh>
            </>
          )}
          {si === 1 && (
            <>
              <mesh position={[-0.30, 0.065, 0.02]} castShadow>
                <sphereGeometry args={[0.058, 16, 16]} /><meshStandardMaterial color="#c49a3a" metalness={0.55} roughness={0.32} />
              </mesh>
              <mesh position={[0.24, 0.055, 0.02]} castShadow>
                <boxGeometry args={[0.11, 0.09, 0.012]} /><meshStandardMaterial color="#2a1808" roughness={0.68} />
              </mesh>
              <mesh position={[0.24, 0.055, 0.028]}>
                <boxGeometry args={[0.082, 0.066, 0.002]} /><meshStandardMaterial color="#b8c8d8" roughness={0.5} />
              </mesh>
              <mesh position={[-0.05, 0.055, 0.02]} castShadow>
                <cylinderGeometry args={[0.030, 0.025, 0.11, 14]} /><meshStandardMaterial color="#a06040" roughness={0.78} />
              </mesh>
              <mesh position={[-0.05, 0.12, 0.02]}>
                <sphereGeometry args={[0.040, 10, 10]} /><meshStandardMaterial color="#2a6020" roughness={0.88} />
              </mesh>
            </>
          )}
          {si === 2 && (
            <>
              {([-0.28, 0, 0.28] as const).map((cx,i) => (
                <group key={i} position={[cx, 0, 0.02]}>
                  <mesh castShadow>
                    <cylinderGeometry args={[0.020, 0.016, 0.085 + i*0.03, 12]} />
                    <primitive object={i===1 ? goldMat : brkMat} />
                  </mesh>
                  <mesh position={[0, 0.055 + i*0.016, 0]}>
                    <cylinderGeometry args={[0.012, 0.012, 0.06, 10]} /><meshStandardMaterial color="#f8f0e0" roughness={0.88} />
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
  const mirrorRef = useRef<THREE.Mesh>(null)
  const frameGold = useMemo(() => mkGold(), [])
  const frameMat  = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#a8a4b0", metalness: 0.92, roughness: 0.08, clearcoat: 0.8, clearcoatRoughness: 0.06, envMapIntensity: 2.2 }), []
  )

  useFrame(({ clock }) => {
    if (mirrorRef.current) {
      const m = mirrorRef.current.material as THREE.MeshPhysicalMaterial
      m.envMapIntensity = 1.8 + Math.sin(clock.elapsedTime * 0.7) * 0.35
    }
  })

  const sz = 0.94

  return (
    <group>
      <Wall color="#dddad2" />
      <Floor color="#ccc8c0" />
      {/* Frame bars */}
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
      {/* Gold corner accents */}
      {([[-1,-1],[1,-1],[-1,1],[1,1]] as [number,number][]).map(([cx,cy],i) => (
        <mesh key={i} position={[cx*(sz*0.5+0.055), cy*(sz*0.5+0.055), 0.038]} castShadow>
          <boxGeometry args={[0.11, 0.11, 0.072]} /><primitive object={frameGold} />
        </mesh>
      ))}
      {/* Mirror backing */}
      <mesh position={[0, 0, 0.035]}>
        <boxGeometry args={[sz + 0.04, sz + 0.04, 0.012]} /><meshStandardMaterial color="#88858e" metalness={0.88} roughness={0.12} />
      </mesh>
      {/* Mirror glass — high-reflectivity PBR */}
      <mesh ref={mirrorRef} position={[0, 0, 0.046]}>
        <boxGeometry args={[sz, sz, 0.006]} />
        <meshPhysicalMaterial color="#d0d8e4" metalness={0.98} roughness={0.010}
          reflectivity={1} clearcoat={1} clearcoatRoughness={0.005} envMapIntensity={2.0} />
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
      <Wall color="#e2dfd7" />
      <mesh receiveShadow position={[0, 1.40, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100, 16, 16]} /><meshPhysicalMaterial color="#f0ece4" roughness={0.8} metalness={0.0} clearcoat={0.05} clearcoatRoughness={0.6} />
      </mesh>
      <Floor color="#cac6be" />
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

function WallTexScene({
  colorFn, bumpFn, roughness = 0.8, metalness = 0,
  bumpScale = 0.07, repeat = [1, 1] as [number, number],
}: {
  colorFn: DrawFn; bumpFn?: DrawFn | null
  roughness?: number; metalness?: number; bumpScale?: number
  repeat?: [number, number]
}) {
  const { color, bump } = usePBRWall(colorFn, bumpFn ?? null, repeat)
  return (
    <group>
      <mesh receiveShadow position={[0, 0.2, -0.12]}>
        <planeGeometry args={[10, 10, 64, 64]} />
        <meshPhysicalMaterial
          map={color}
          bumpMap={bump ?? undefined}
          bumpScale={bumpScale}
          displacementMap={bump ?? undefined}
          displacementScale={bumpScale * 0.9}
          roughness={roughness}
          metalness={metalness}
          clearcoat={0.03}
          clearcoatRoughness={0.55}
          envMapIntensity={0.8}
        />
      </mesh>
      {/* Background fill box — catches any viewport edges beyond the plane */}
      <mesh receiveShadow position={[0, 0.2, -0.20]}>
        <boxGeometry args={[100, 100, 0.04]} />
        <meshPhysicalMaterial color="#e2ddd6" roughness={0.8} metalness={0.0} />
      </mesh>
      <Floor color="#ccc8c0" />
      {/* Subtle edge trim */}
      <mesh position={[0, 1.4, -0.02]}><boxGeometry args={[100, 0.018, 0.10]} /><meshPhysicalMaterial color="#1a1714" roughness={0.8} metalness={0.1} /></mesh>
    </group>
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
  // Intimate close-up — z=1.8 across the board for maximum detail
  mount:   { pos: [0,    0.10, 1.80], fov: 44 } as CamCfg,
  wall:    { pos: [0.10, 0.18, 1.80], fov: 46 } as CamCfg,
  item:    { pos: [0,    0.06, 1.80], fov: 44 } as CamCfg,
  cable:   { pos: [0,   -0.04, 1.80], fov: 46 } as CamCfg,
  ceil:    { pos: [0.06, 0.28, 1.95], fov: 48 } as CamCfg,
  // CamRig scenes: initial pos matches the rig's starting side-view frame
  fullmo:  { pos: [1.55, 0.22, 0.48], fov: 50 } as CamCfg,
  tilt:    { pos: [1.75, 0.15, 0.48], fov: 48 } as CamCfg,
  mirror:  { pos: [0,    0.06, 1.80], fov: 46 } as CamCfg,
  light:   { pos: [0,    0.16, 1.80], fov: 46 } as CamCfg,
  measure: { pos: [0,    0.04, 1.80], fov: 44 } as CamCfg,
}

function resolveScene(option: string): { scene: JSX.Element; cam: CamCfg; env: string } {
  switch (option) {
    case "TV/Monitor":
      return { scene: <TVItemScene />, cam: CAM.item, env: "apartment" }
    case "Art/Picture Frame":
      return { scene: <ArtFrameScene />, cam: CAM.item, env: "apartment" }
    case "Floating Shelves":
      return { scene: <ShelvesScene />, cam: { pos: [0, 0.05, 2.50], fov: 54 }, env: "apartment" }
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
      return { scene: <WallTexScene colorFn={drawDrywallColor} bumpFn={null} roughness={0.90} bumpScale={0.03} />, cam: CAM.wall, env: "city" }
    case "Brick":
      return { scene: <WallTexScene colorFn={drawBrickColor} bumpFn={drawBrickBump} roughness={0.80} bumpScale={0.09} repeat={[2, 1.5]} />, cam: CAM.wall, env: "city" }
    case "Concrete":
      return { scene: <WallTexScene colorFn={drawConcreteColor} bumpFn={drawConcreteBump} roughness={0.94} metalness={0.02} bumpScale={0.07} />, cam: CAM.wall, env: "city" }
    case "Plaster":
      return { scene: <WallTexScene colorFn={drawPlasterColor} bumpFn={null} roughness={0.86} bumpScale={0.04} />, cam: CAM.wall, env: "city" }
    case "Stone":
      return { scene: <WallTexScene colorFn={drawStoneColor} bumpFn={null} roughness={0.91} bumpScale={0.08} repeat={[1.5, 1.5]} />, cam: CAM.wall, env: "city" }
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
  cam, scene, thumbnail = false,
}: {
  cam: CamCfg; scene: JSX.Element; thumbnail?: boolean
}) {
  return (
    <Canvas
      shadows={!thumbnail}
      dpr={thumbnail ? 1 : [1, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: "high-performance",
      }}
      style={{ width: "100%", height: "100%" }}
      performance={{ min: 1, debounce: 200 }}
    >
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
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow
            shadow-mapSize={[1024, 1024]} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#818cf8" />
          <Lights />
        </>
      )}

      {scene}
      <Environment preset="city" />
    </Canvas>
  )
}

// ─── Public exports ───────────────────────────────────────────────────────────

export function Option3DImpl({
  option, thumbnail,
}: {
  option: string; thumbnail?: boolean
}) {
  const { scene, cam } = resolveScene(option)
  return <SceneCanvas cam={cam} scene={scene} thumbnail={thumbnail} />
}

/**
 * TVSizeMeasure — standalone export for the "What size is your TV?" section.
 * Drop this anywhere with a fixed height (e.g. h-56 / h-64).
 */
export function TVSizeMeasure() {
  const { scene, cam } = resolveScene("__tv_measure")
  return <SceneCanvas cam={cam} env="city" scene={scene} />
}
