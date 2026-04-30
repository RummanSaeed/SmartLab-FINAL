"use client"

import { useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import * as THREE from "three"

type Pair = {
  id: string
  reactants: string
  product: string
  requiresHeat: boolean
  heatThreshold: number
  visual: {
    start: string
    product: string
  }
}

const pairs: Pair[] = [
  {
    id: "mg-o2",
    reactants: "Magnesium + Oxygen",
    product: "Magnesium oxide (MgO)",
    requiresHeat: true,
    heatThreshold: 55,
    visual: { start: "#94a3b8", product: "#e2e8f0" },
  },
  {
    id: "fe-s",
    reactants: "Iron + Sulfur",
    product: "Iron sulfide (FeS)",
    requiresHeat: true,
    heatThreshold: 50,
    visual: { start: "#a3a3a3", product: "#111827" },
  },
  {
    id: "ca-o2",
    reactants: "Calcium + Oxygen",
    product: "Calcium oxide (CaO)",
    requiresHeat: true,
    heatThreshold: 55,
    visual: { start: "#d4d4d8", product: "#f8fafc" },
  },
]

export type CombinationSetup = {
  crucible: boolean
  burner: boolean
  tongs: boolean
  reactantA: boolean
  reactantB: boolean
}

// Realistic Bunsen burner flame with flickering
function BunsenFlame({ active, intensity }: { active: boolean; intensity: number }) {
  const flameRef = useRef<THREE.Group>(null)
  const innerFlameRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!flameRef.current || !active) return
    const t = clock.elapsedTime

    // Outer flame flicker
    const flickerScale = 1 + Math.sin(t * 12) * 0.08 + Math.cos(t * 18) * 0.05
    flameRef.current.scale.set(flickerScale, 1 + Math.sin(t * 8) * 0.1 * intensity, flickerScale)

    // Inner blue cone subtle movement
    if (innerFlameRef.current) {
      innerFlameRef.current.rotation.z = Math.sin(t * 4) * 0.03
    }
  })

  if (!active) return null

  return (
    <group ref={flameRef}>
      {/* Outer orange flame */}
      <mesh position={[0, 0.82, -0.3]}>
        <coneGeometry args={[0.12, 0.35 + intensity * 0.15, 24]} />
        <meshStandardMaterial
          color="#fb923c"
          emissive="#ea580c"
          emissiveIntensity={1.2 + intensity * 0.8}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Middle yellow flame */}
      <mesh position={[0, 0.9, -0.3]}>
        <coneGeometry args={[0.08, 0.25 + intensity * 0.1, 20]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#f59e0b"
          emissiveIntensity={1.8 + intensity}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Inner blue cone */}
      <mesh ref={innerFlameRef} position={[0, 0.75, -0.3]}>
        <coneGeometry args={[0.04, 0.15, 16]} />
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#1d4ed8"
          emissiveIntensity={3}
          transparent
          opacity={0.95}
        />
      </mesh>
    </group>
  )
}

// Particle fusion effect during reaction
function FusionParticles({ active, progress, startColor, productColor }: { active: boolean; progress: number; startColor: string; productColor: string }) {
  const particlesRef = useRef<THREE.Group>(null)
  const particleData = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      startX: (Math.random() - 0.5) * 0.3,
      startY: 0.4 + Math.random() * 0.2,
      startZ: -0.3 + (Math.random() - 0.5) * 0.2,
      speed: 0.5 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    }))
  }, [])

  useFrame(({ clock }) => {
    if (!particlesRef.current || !active || progress <= 0.1) return
    const intensity = Math.min(1, progress * 2)

    particlesRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const data = particleData[i]
      const t = clock.elapsedTime * data.speed + data.phase

      // Particles converge toward center as reaction progresses
      const convergence = Math.min(1, progress * 1.5)
      mesh.position.x = data.startX * (1 - convergence * 0.7)
      mesh.position.y = data.startY + Math.sin(t) * 0.03 * intensity + convergence * 0.1
      mesh.position.z = data.startZ * (1 - convergence * 0.5)

      // Color transition based on progress
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = 0.4 * intensity
    })
  })

  if (!active || progress <= 0) return null

  return (
    <group ref={particlesRef}>
      {particleData.map((_, i) => (
        <mesh key={i} position={[0, 0.5, -0.3]}>
          <sphereGeometry args={[0.006 + (i % 3) * 0.002, 8, 8]} />
          <meshStandardMaterial
            color={progress > 0.5 ? productColor : startColor}
            transparent
            opacity={0}
            emissive={progress > 0.5 ? productColor : startColor}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

// Heat glow effect around crucible
function HeatGlow({ active, progress }: { active: boolean; progress: number }) {
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!glowRef.current || !active || progress <= 0.1) return
    // Pulsing glow effect
    const pulse = 1 + Math.sin(clock.elapsedTime * 5) * 0.1
    glowRef.current.scale.setScalar(pulse)
  })

  if (!active || progress <= 0.1) return null

  const glowIntensity = Math.min(0.6, progress * 0.8)

  return (
    <mesh ref={glowRef} position={[0, 0.92, -0.3]}>
      <cylinderGeometry args={[0.35, 0.35, 0.4, 32]} />
      <meshBasicMaterial
        color="#fb923c"
        transparent
        opacity={glowIntensity * 0.3}
      />
    </mesh>
  )
}

// Product formation animation
function ProductFormation({ progress, productColor }: { progress: number; productColor: string }) {
  const productRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!productRef.current || progress <= 0.3) return
    // Subtle shimmer on product
    const shimmer = 1 + Math.sin(clock.elapsedTime * 3) * 0.02
    productRef.current.scale.set(shimmer, 1, shimmer)
  })

  const productHeight = Math.max(0.05, 0.18 * Math.min(1, progress * 1.2))
  const productOpacity = Math.min(0.9, progress * 1.1)

  return (
    <mesh ref={productRef} position={[0, 0.85 + productHeight / 2, -0.3]} visible={progress > 0.2}>
      <cylinderGeometry args={[0.16, 0.18, productHeight, 20]} />
      <meshStandardMaterial
        color={productColor}
        roughness={0.8}
        transparent
        opacity={productOpacity}
        emissive={productColor}
        emissiveIntensity={0.15 * progress}
      />
    </mesh>
  )
}

function Scene({ setup, progress, productColor, startColor, pair }: { setup: CombinationSetup; progress: number; productColor: string; startColor: string; pair: Pair }) {
  const flameOn = setup.burner && progress > 0.05
  const heatIntensity = Math.min(1, (progress - 0.1) * 2)

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 6, -3]} intensity={0.4} />

      {/* Lab bench */}
      <mesh position={[0, 0.05, -0.3]} receiveShadow>
        <boxGeometry args={[4, 0.1, 2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Bunsen burner */}
      <group visible={setup.burner}>
        <mesh position={[0, 0.42, -0.3]}>
          <cylinderGeometry args={[0.18, 0.24, 0.35, 20]} />
          <meshStandardMaterial color="#64748b" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.28, -0.3]}>
          <cylinderGeometry args={[0.22, 0.22, 0.05, 20]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      </group>

      {/* Animated flame */}
      <BunsenFlame active={flameOn} intensity={heatIntensity} />

      {/* Heat glow around crucible */}
      <HeatGlow active={flameOn} progress={progress} />

      {/* Crucible */}
      <group visible={setup.crucible}>
        {/* Crucible body */}
        <mesh position={[0, 0.92, -0.3]} castShadow>
          <cylinderGeometry args={[0.22, 0.26, 0.28, 24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} metalness={0.2} />
        </mesh>
        {/* Crucible rim */}
        <mesh position={[0, 1.06, -0.3]}>
          <torusGeometry args={[0.22, 0.015, 8, 24]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {/* Original reactants (fade as reaction progresses) */}
        <mesh position={[0, 0.85, -0.3]} visible={progress < 0.5}>
          <cylinderGeometry args={[0.15, 0.17, 0.12, 18]} />
          <meshStandardMaterial
            color={startColor}
            roughness={0.9}
            transparent
            opacity={1 - progress * 2}
          />
        </mesh>
      </group>

      {/* Product formation */}
      {setup.crucible && <ProductFormation progress={progress} productColor={productColor} />}

      {/* Fusion particles */}
      <FusionParticles
        active={setup.crucible && setup.burner}
        progress={progress}
        startColor={startColor}
        productColor={productColor}
      />

      {/* Reactant A container */}
      <group visible={setup.reactantA}>
        <mesh position={[-0.9, 0.35, -0.3]} castShadow>
          <boxGeometry args={[0.35, 0.08, 0.35]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[-0.9, 0.55, -0.3]}>
          <boxGeometry args={[0.3, 0.5, 0.3]} />
          <meshStandardMaterial color={pair.id === "mg-o2" ? "#94a3b8" : pair.id === "fe-s" ? "#a3a3a3" : "#d4d4d8"} roughness={0.8} />
        </mesh>
        <Text position={[-0.9, 0.9, -0.3]} fontSize={0.05} color="#f8fafc" anchorX="center">
          {pair.id === "mg-o2" ? "Mg" : pair.id === "fe-s" ? "Fe" : "Ca"}
        </Text>
      </group>

      {/* Reactant B container */}
      <group visible={setup.reactantB}>
        <mesh position={[0.9, 0.35, -0.3]} castShadow>
          <boxGeometry args={[0.35, 0.08, 0.35]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        <mesh position={[0.9, 0.55, -0.3]}>
          <boxGeometry args={[0.3, 0.5, 0.3]} />
          <meshStandardMaterial color={pair.id === "mg-o2" ? "#fcd34d" : pair.id === "fe-s" ? "#facc15" : "#fde68a"} roughness={0.8} />
        </mesh>
        <Text position={[0.9, 0.9, -0.3]} fontSize={0.05} color="#f8fafc" anchorX="center">
          {pair.id === "mg-o2" ? "O₂" : pair.id === "fe-s" ? "S" : "O₂"}
        </Text>
      </group>

      {/* Tongs */}
      <group visible={setup.tongs}>
        <mesh position={[1.25, 1.05, -0.15]} rotation={[0, 0, 0.55]}>
          <cylinderGeometry args={[0.012, 0.012, 1.1, 10]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.5} />
        </mesh>
        <mesh position={[1.28, 1.55, -0.15]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.15, 10]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* Labels */}
      <Text position={[0, 1.5, -0.3]} fontSize={0.07} color="#f8fafc" anchorX="center">
        {pair.reactants} → {pair.product}
      </Text>

      <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2.1} target={[0, 0.8, -0.3]} />
    </>
  )
}

export function CombinationSim({ setup }: { setup: CombinationSetup }) {
  const [pairIdx, setPairIdx] = useState(0)
  const [heat, setHeat] = useState([20])
  const [mixed, setMixed] = useState(false)
  const [started, setStarted] = useState(false)

  const pair = pairs[pairIdx] || pairs[0]

  const setupReady = setup.crucible && setup.burner && setup.tongs && setup.reactantA && setup.reactantB

  const canReact = mixed && heat[0] >= pair.heatThreshold

  const progress = useMemo(() => {
    if (!started) return 0
    if (!canReact) return 0.15
    const p = Math.min(1, (heat[0] - pair.heatThreshold) / 45)
    return Number((0.15 + p * 0.85).toFixed(2))
  }, [started, canReact, heat, pair.heatThreshold])

  const productFormed = progress >= 0.95
  const productColor = productFormed ? pair.visual.product : pair.visual.start

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">Combination Reaction</div>
          <Badge variant="outline">combination</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1">Two reactants combine to form a single product.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Choose reactants</div>
          <div className="flex flex-wrap gap-2">
            {pairs.map((p, idx) => (
              <Button key={p.id} size="sm" variant={idx === pairIdx ? "default" : "outline"} onClick={() => { setPairIdx(idx); setStarted(false); setMixed(false) }}>
                {p.reactants}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Heat</span>
              <span>{heat[0]}%</span>
            </div>
            <Slider value={heat} min={0} max={100} step={1} onValueChange={setHeat} />
            <div className="text-xs text-muted-foreground">Heat threshold: {pair.heatThreshold}%</div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setMixed(true)} disabled={mixed}>
              Mix reactants
            </Button>
            <Button onClick={() => setStarted(true)} disabled={!mixed || started || !setupReady}>
              Start heating
            </Button>
            <Button variant="outline" onClick={() => { setStarted(false); setMixed(false) }}>
              Reset
            </Button>
          </div>

          {!setupReady && (
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
              Drag and place crucible, burner, tongs, and both reactants first.
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Observation</div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Equation (word)</div>
            <div className="mt-1 font-semibold">{pair.reactants} → {pair.product}</div>
          </div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Progress</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{Math.round(progress * 100)}%</div>
            <div className="mt-2 h-2 rounded bg-muted overflow-hidden">
              <div className="h-2 bg-primary" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {productFormed
                ? "Single product formed. Let it cool and record observations."
                : !started
                  ? "Mix reactants and start heating."
                  : canReact
                    ? "Combination reaction proceeding."
                    : "Insufficient heat: reaction is slow / not starting."}
            </div>
          </div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Visual</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-8 w-8 rounded" style={{ background: pair.visual.start }} />
              <div className="text-xs text-muted-foreground">→</div>
              <div className="h-8 w-8 rounded" style={{ background: productFormed ? pair.visual.product : pair.visual.start }} />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
            <Canvas camera={{ position: [0, 2.8, 5], fov: 45 }}>
              <Scene setup={setup} progress={progress} productColor={productColor} startColor={pair.visual.start} pair={pair} />
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  )
}
