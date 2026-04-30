"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"
import * as THREE from "three"

type SublimationSetup = {
  stand: boolean
  dish: boolean
  funnel: boolean
  cotton: boolean
  burner: boolean
}

// Realistic Bunsen burner flame with flickering
function BunsenFlame({ active, intensity }: { active: boolean; intensity: number }) {
  const flameRef = useRef<THREE.Group>(null)
  const innerFlameRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!flameRef.current || !active) return
    const t = clock.elapsedTime

    // Outer flame flicker
    const flickerScale = 1 + Math.sin(t * 15) * 0.08 + Math.cos(t * 22) * 0.05
    flameRef.current.scale.set(flickerScale, 1 + Math.sin(t * 10) * 0.1 * intensity, flickerScale)

    // Inner blue cone subtle movement
    if (innerFlameRef.current) {
      innerFlameRef.current.rotation.z = Math.sin(t * 4) * 0.03
    }
  })

  if (!active) return null

  return (
    <group ref={flameRef}>
      {/* Outer orange flame */}
      <mesh position={[0, 0.65, -0.35]}>
        <coneGeometry args={[0.11, 0.38, 24]} />
        <meshStandardMaterial
          color="#fb923c"
          emissive="#ea580c"
          emissiveIntensity={1.2 + intensity * 0.8}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Middle yellow flame */}
      <mesh position={[0, 0.72, -0.35]}>
        <coneGeometry args={[0.08, 0.28, 20]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#f59e0b"
          emissiveIntensity={1.8 + intensity}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Inner blue cone */}
      <mesh ref={innerFlameRef} position={[0, 0.58, -0.35]}>
        <coneGeometry args={[0.04, 0.16, 16]} />
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

// Realistic vapor/fume trails rising from dish
function VaporTrails({ active, progress }: { active: boolean; progress: number }) {
  const trailsRef = useRef<THREE.Group>(null)
  const particleData = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      x: (Math.random() - 0.5) * 0.5,
      z: -0.35 + (Math.random() - 0.5) * 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 0.6,
      size: 0.015 + Math.random() * 0.01,
    }))
  }, [])

  useFrame(({ clock }) => {
    if (!trailsRef.current || !active || progress < 0.15) return
    const intensity = Math.min(1, (progress - 0.15) * 2)

    trailsRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const data = particleData[i]
      const t = clock.elapsedTime * data.speed + data.phase

      // Particles rise and disperse
      const cycle = (t % 3) / 3
      const startY = 0.92
      const endY = 1.8

      mesh.position.y = startY + (endY - startY) * cycle
      mesh.position.x = data.x + Math.sin(t * 2) * 0.05 * cycle
      mesh.position.z = data.z + Math.cos(t * 1.5) * 0.03 * cycle

      // Fade as they rise
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = 0.35 * intensity * (1 - cycle * 0.7)
    })
  })

  if (!active || progress < 0.1) return null

  return (
    <group ref={trailsRef}>
      {particleData.map((data, i) => (
        <mesh key={i} position={[data.x, 0.9, data.z]}>
          <sphereGeometry args={[data.size, 8, 8]} />
          <meshStandardMaterial
            color="#e2e8f0"
            transparent
            opacity={0}
            emissive="#f1f5f9"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

// Crystal growth animation on funnel neck
function CrystalGrowth({ deposition }: { deposition: number }) {
  const crystalRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!crystalRef.current || deposition <= 0.1) return
    // Subtle shimmer on crystals
    const shimmer = 1 + Math.sin(clock.elapsedTime * 2) * 0.015
    crystalRef.current.scale.set(shimmer, 1, shimmer)
  })

  if (deposition <= 0) return null

  // Crystal grows with deposition
  const crystalHeight = Math.max(0.02, 0.12 * deposition)
  const crystalRadius = 0.09 + deposition * 0.04

  return (
    <group>
      {/* Main crystal deposit */}
      <mesh ref={crystalRef} position={[0, 1.58 + crystalHeight / 2, -0.35]}>
        <cylinderGeometry args={[crystalRadius, crystalRadius * 0.9, crystalHeight, 16]} />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.6}
          transparent
          opacity={0.85}
          emissive="#ffffff"
          emissiveIntensity={0.15 + deposition * 0.25}
        />
      </mesh>

      {/* Small crystal clusters */}
      {deposition > 0.3 && (
        <>
          <mesh position={[0.06, 1.55, -0.35]}>
            <sphereGeometry args={[0.025 * deposition, 8, 8]} />
            <meshStandardMaterial color="#f1f5f9" transparent opacity={0.7} />
          </mesh>
          <mesh position={[-0.05, 1.6, -0.35]}>
            <sphereGeometry args={[0.02 * deposition, 8, 8]} />
            <meshStandardMaterial color="#f1f5f9" transparent opacity={0.7} />
          </mesh>
        </>
      )}
    </group>
  )
}

// Heat shimmer effect around apparatus
function HeatShimmer({ active, progress }: { active: boolean; progress: number }) {
  const shimmerRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!shimmerRef.current || !active || progress < 0.1) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 4) * 0.08
    shimmerRef.current.scale.setScalar(pulse)
  })

  if (!active || progress < 0.1) return null

  const intensity = Math.min(0.5, progress * 0.6)

  return (
    <mesh ref={shimmerRef} position={[0, 0.9, -0.35]}>
      <cylinderGeometry args={[0.7, 0.7, 1.2, 32]} />
      <meshBasicMaterial color="#fb923c" transparent opacity={intensity * 0.15} />
    </mesh>
  )
}

// Sand and naphthalene mixture visualization
function MixtureVisualization({ progress, isNh4cl }: { progress: number; isNh4cl: boolean }) {
  const naphthaleneOpacity = Math.max(0, 1 - progress * 1.2)

  if (isNh4cl) {
    // NH4Cl - uniform white powder that sublimes
    return (
      <mesh position={[0, 0.9, -0.35]}>
        <cylinderGeometry args={[0.38, 0.4, 0.05, 22]} />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.95}
          transparent
          opacity={naphthaleneOpacity}
        />
      </mesh>
    )
  }

  // Sand + Naphthalene mixture - sand stays, naphthalene sublimes
  return (
    <group>
      {/* Sand layer (stays throughout) */}
      <mesh position={[0, 0.88, -0.35]}>
        <cylinderGeometry args={[0.38, 0.4, 0.03, 22]} />
        <meshStandardMaterial color="#d4a574" roughness={1} />
      </mesh>

      {/* Naphthalene chunks that sublimes (fades with progress) */}
      <mesh position={[-0.08, 0.92, -0.35]} visible={naphthaleneOpacity > 0.1}>
        <boxGeometry args={[0.1, 0.08, 0.08]} />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.8}
          transparent
          opacity={naphthaleneOpacity}
        />
      </mesh>
      <mesh position={[0.06, 0.93, -0.32]} visible={naphthaleneOpacity > 0.1}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.8}
          transparent
          opacity={naphthaleneOpacity}
        />
      </mesh>
      <mesh position={[0.04, 0.9, -0.38]} visible={naphthaleneOpacity > 0.1}>
        <boxGeometry args={[0.08, 0.06, 0.08]} />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.8}
          transparent
          opacity={naphthaleneOpacity}
        />
      </mesh>

      {/* Label */}
      <Text position={[0.5, 0.9, -0.35]} fontSize={0.04} color="#b08968" anchorX="left">
        Sand
      </Text>
      <Text position={[-0.1, 0.98, -0.35]} fontSize={0.04} color="#94a3b8" anchorX="center" visible={naphthaleneOpacity > 0.2}>
        Naphthalene
      </Text>
    </group>
  )
}

function SublimationScene({
  heating,
  progress,
  deposition,
  setup,
  isNh4cl,
}: {
  heating: boolean
  progress: number
  deposition: number
  setup: SublimationSetup
  isNh4cl: boolean
}) {
  const glow = 0.2 + progress * 1.5
  const heatIntensity = Math.min(1, progress * 1.5)

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} castShadow />
      <directionalLight position={[-3, 5, -2]} intensity={0.4} />
      <pointLight position={[0, 0.7, -0.4]} intensity={heating ? glow : 0.1} color="#fb923c" />

      {/* Lab bench */}
      <mesh position={[0, 0.05, -0.35]} receiveShadow>
        <boxGeometry args={[4, 0.1, 2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Retort stand base */}
      <group visible={setup.stand}>
        <mesh position={[0, 0.03, -0.35]}>
          <boxGeometry args={[1.6, 0.06, 1.4]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {/* Gauze mesh on stand */}
        <mesh position={[0, 0.65, -0.35]}>
          <boxGeometry args={[1.4, 0.02, 1.2]} />
          <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.6} />
        </mesh>
        {/* Wire mesh pattern */}
        <mesh position={[0, 0.66, -0.35]}>
          <boxGeometry args={[1.2, 0.005, 1]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Bunsen burner */}
      <group visible={setup.burner}>
        <mesh position={[0, 0.35, -0.35]}>
          <cylinderGeometry args={[0.16, 0.2, 0.35, 20]} />
          <meshStandardMaterial color="#64748b" metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.2, -0.35]}>
          <cylinderGeometry args={[0.22, 0.22, 0.05, 20]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      </group>

      {/* Animated flame */}
      <BunsenFlame active={heating && setup.burner} intensity={heatIntensity} />

      {/* Heat shimmer effect */}
      <HeatShimmer active={heating && setup.burner} progress={progress} />

      {/* China dish */}
      <group visible={setup.dish}>
        <mesh position={[0, 0.86, -0.35]} castShadow>
          <cylinderGeometry args={[0.45, 0.5, 0.14, 28]} />
          <meshStandardMaterial color="#d1d5db" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.935, -0.35]}>
          <torusGeometry args={[0.45, 0.015, 8, 28]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>

        {/* Mixture visualization */}
        <MixtureVisualization progress={progress} isNh4cl={isNh4cl} />
      </group>

      {/* Inverted funnel with better glass material */}
      <group visible={setup.funnel}>
        {/* Funnel body */}
        <mesh position={[0, 1.35, -0.35]}>
          <coneGeometry args={[0.62, 0.9, 32, 1, true]} />
          <meshPhysicalMaterial
            color="#e2e8f0"
            metalness={0.1}
            roughness={0.1}
            transmission={0.8}
            thickness={0.05}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Funnel stem */}
        <mesh position={[0, 1.82, -0.35]}>
          <cylinderGeometry args={[0.05, 0.06, 0.2, 20]} />
          <meshStandardMaterial color="#cbd5e1" transparent opacity={0.6} />
        </mesh>
        {/* Funnel rim */}
        <mesh position={[0, 1.8, -0.35]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.05, 0.008, 8, 20]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* Cotton plug */}
      <mesh position={[0, 1.92, -0.35]} visible={setup.cotton}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.95} />
      </mesh>

      {/* Crystal growth on funnel neck */}
      {setup.funnel && <CrystalGrowth deposition={deposition} />}

      {/* Vapor trails */}
      <VaporTrails active={heating && setup.dish && setup.funnel} progress={progress} />

      {/* Labels */}
      <Text position={[0, 2.3, -0.35]} fontSize={0.08} color="#f8fafc" anchorX="center">
        {isNh4cl ? "Ammonium Chloride Sublimation" : "Naphthalene Separation"}
      </Text>
      <Text position={[0.9, 0.3, -0.35]} fontSize={0.05} color="#94a3b8" anchorX="left">
        Bunsen Burner
      </Text>

      <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2.1} target={[0, 1, -0.35]} />
    </>
  )
}

export function SublimationSim({
  heatRate,
  sampleMass,
  setup,
  substanceTitle,
}: {
  heatRate: number
  sampleMass: number
  setup: SublimationSetup
  substanceTitle?: string
}) {
  const [running, setRunning] = useState(false)
  const [time, setTime] = useState(0)
  const setupReady = setup.stand && setup.dish && setup.funnel && setup.cotton && setup.burner

  useEffect(() => {
    if (!setupReady && running) setRunning(false)
  }, [setupReady, running])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTime((t) => t + 0.1), 100)
    return () => clearInterval(id)
  }, [running])

  const isNh4cl = (substanceTitle || "").toLowerCase().includes("ammonium")
  const normalized = useMemo(() => Math.min(1, time / ((isNh4cl ? 18 : 22) / Math.max(1, heatRate))), [time, heatRate, isNh4cl])
  const deposition = useMemo(() => Math.max(0, Math.min(1, (normalized - 0.35) / 0.65)), [normalized])
  const separatedPct = useMemo(() => Number((deposition * 100).toFixed(1)), [deposition])
  const remainingPct = useMemo(() => Number((Math.max(0, 100 - separatedPct)).toFixed(1)), [separatedPct])
  const stateLabel = normalized < 0.2 ? "Heating mixture" : normalized < 0.55 ? "Sublimation in progress" : "Crystals depositing"

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline">Heat rate: {heatRate}x</Badge>
        <Badge variant="outline">Sample mass: {sampleMass.toFixed(1)} g</Badge>
        <Badge variant="outline">Elapsed: {time.toFixed(1)} s</Badge>
        <Badge variant="outline">{isNh4cl ? "Substance: Ammonium Chloride" : "Substance: Naphthalene"}</Badge>
        <Badge variant={running ? "default" : "secondary"}>{stateLabel}</Badge>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => setRunning(true)} disabled={running || !setupReady} className="gap-2">
          <Play className="w-4 h-4" />
          Start Heating
        </Button>
        <Button variant="destructive" onClick={() => setRunning(false)} disabled={!running} className="gap-2">
          <Pause className="w-4 h-4" />
          Stop
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            setRunning(false)
            setTime(0)
          }}
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {!setupReady && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
          Complete setup in Equipment tab: stand, china dish, funnel, cotton plug, and burner.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Sublimation progress</div>
          <div className="text-lg font-semibold">{(normalized * 100).toFixed(1)}%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">{isNh4cl ? "NH4Cl deposited" : "Naphthalene deposited"}</div>
          <div className="text-lg font-semibold">{separatedPct}%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Remaining in mixture</div>
          <div className="text-lg font-semibold">{remainingPct}%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Observation</div>
          <div className="text-sm font-semibold">
            {normalized > 0.55
              ? isNh4cl
                ? "White NH4Cl deposit visible at funnel neck"
                : "Naphthalene crystals visible at funnel neck"
              : "Continue heating gently"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[430px]">
        <Canvas camera={{ position: [0, 2.8, 4.8], fov: 48 }}>
          <SublimationScene heating={running} progress={normalized} deposition={deposition} setup={setup} isNh4cl={isNh4cl} />
        </Canvas>
      </div>

      <div className="rounded-lg border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
        {isNh4cl
          ? "Heat NH4Cl gently. White fumes rise and deposit as white sublimate on cooler funnel surface."
          : "Heat the mixture gently. Naphthalene sublimes first and re-deposits on the cooler funnel surface. Sand remains in the dish."}
      </div>
    </div>
  )
}
