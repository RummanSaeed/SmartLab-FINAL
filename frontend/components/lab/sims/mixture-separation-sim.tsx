"use client"

import { useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import * as THREE from "three"

type Stage = "mix" | "magnet" | "wash" | "dry"
const stages: Stage[] = ["mix", "magnet", "wash", "dry"]

// Lab work tray
function WorkTray() {
  return (
    <group position={[0, 0.5, 0]}>
      {/* Tray bottom */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 0.05, 2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Tray edges */}
      <mesh position={[-1.5, 0.1, 0]}>
        <boxGeometry args={[0.05, 0.2, 2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[1.5, 0.1, 0]}>
        <boxGeometry args={[0.05, 0.2, 2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 0.1, -1]}>
        <boxGeometry args={[3, 0.2, 0.05]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, 0.1, 1]}>
        <boxGeometry args={[3, 0.2, 0.05]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  )
}

// Sand particles (golden spheres)
function SandParticles({ count, spread }: { count: number; spread: number }) {
  const [particles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * spread,
      z: (Math.random() - 0.5) * spread,
      scale: 0.8 + Math.random() * 0.4,
    }))
  )

  return (
    <>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, 0.6, p.z]}>
          <sphereGeometry args={[0.025 * p.scale, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.9} />
        </mesh>
      ))}
    </>
  )
}

// Iron filings (silver metallic irregular shapes)
function IronFilings({ count, spread, stage }: { count: number; spread: number; stage: Stage }) {
  const filingsRef = useRef<THREE.Group>(null)

  const filings = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      x: (Math.random() - 0.5) * spread,
      z: (Math.random() - 0.5) * spread,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      scale: 0.5 + Math.random() * 0.5,
    }))
  }, [count, spread])

  useFrame(() => {
    if (filingsRef.current && stage === "magnet") {
      // Iron moves toward magnet position
      filingsRef.current.children.forEach((child) => {
        const mesh = child as THREE.Mesh
        const targetX = 1.2
        const targetZ = -0.8
        mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, targetX, 0.02)
        mesh.position.z = THREE.MathUtils.lerp(mesh.position.z, targetZ, 0.02)
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, 0.7, 0.02)
      })
    }
  })

  return (
    <group ref={filingsRef}>
      {filings.map((f, i) => (
        <mesh key={i} position={[f.x, 0.6, f.z]} rotation={[f.rotX, f.rotY, 0]}>
          <boxGeometry args={[0.03 * f.scale, 0.015 * f.scale, 0.02 * f.scale]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

// Horseshoe magnet with handle
function MagnetTool({ stage }: { stage: Stage }) {
  const magnetY = stage === "magnet" ? 1.2 : 0.9

  return (
    <group position={[1.8, magnetY, 0.5]}>
      {/* Magnet body - U shape */}
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[0.25, 0.08, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#ef4444" metalness={0.3} />
      </mesh>
      {/* North pole label */}
      <mesh position={[-0.25, 0.05, 0.05]}>
        <cylinderGeometry args={[0.06, 0.06, 0.2, 16]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <Text position={[-0.25, 0.25, 0.05]} fontSize={0.08} color="#f8fafc" anchorX="center">
        N
      </Text>
      {/* South pole label */}
      <mesh position={[0.25, 0.05, 0.05]}>
        <cylinderGeometry args={[0.06, 0.06, 0.2, 16]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <Text position={[0.25, 0.25, 0.05]} fontSize={0.08} color="#f8fafc" anchorX="center">
        S
      </Text>
      {/* Handle */}
      <mesh position={[0, -0.15, -0.15]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.4, 12]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  )
}

// Wash bottle
function WashBottle() {
  return (
    <group position={[-1.8, 0.8, 0.8]}>
      {/* Bottle body */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.5, 24]} />
        <meshStandardMaterial color="#22c55e" transparent opacity={0.6} />
      </mesh>
      {/* Liquid inside */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.3, 24]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.5} />
      </mesh>
      {/* Nozzle */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.15, 12]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      {/* Cap */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <Text position={[0, 0.2, 0.22]} fontSize={0.08} color="#f8fafc" anchorX="center">
        Wash
      </Text>
    </group>
  )
}

// Filter paper with iron pile
function IronPile({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <group position={[1.2, 0.6, -0.8]}>
      {/* Filter paper */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.25, 32]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>
      {/* Iron pile */}
      <mesh position={[0, 0.05, 0]}>
        <coneGeometry args={[0.15, 0.1, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
      <Text position={[0, 0.25, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        Iron
      </Text>
    </group>
  )
}

// Beaker for washing
function WashBeaker({ hasWater }: { hasWater: boolean }) {
  return (
    <group position={[-1.5, 0.6, -0.8]}>
      {/* Beaker */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.25, 0.2, 0.5, 24, 1, true]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 24]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {/* Water */}
      {hasWater && (
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.3, 24]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>
      )}
      {/* Label */}
      <Text position={[0.35, 0.3, 0]} fontSize={0.08} color="#94a3b8" anchorX="left">
        {hasWater ? "Rinse" : "Empty"}
      </Text>
    </group>
  )
}

// Main 3D scene
function SeparationScene({ ironFraction, stage }: { ironFraction: number; stage: Stage }) {
  const { camera } = useThree()

  useMemo(() => {
    camera.position.set(3, 3.5, 5)
    camera.lookAt(0, 0.8, 0)
  }, [camera])

  const sandCount = Math.max(20, Math.round((100 - ironFraction) / 2))
  const ironCount = Math.max(15, Math.round(ironFraction / 2))

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.5} />

      {/* Lab table */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[4, 4, 0.1, 64]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Equipment */}
      <WorkTray />
      <MagnetTool stage={stage} />
      <WashBottle />
      <WashBeaker hasWater={stage === "wash" || stage === "dry"} />
      <IronPile visible={stage !== "mix"} />

      {/* Mixture in tray */}
      <SandParticles count={stage === "mix" ? sandCount : sandCount / 3} spread={2} />
      <IronFilings
        count={stage === "mix" ? ironCount : stage === "magnet" ? ironCount : 0}
        spread={2}
        stage={stage}
      />

      {/* Labels */}
      <Text position={[-1.8, 1.5, 0.8]} fontSize={0.1} color="#22c55e" anchorX="center">
        Wash Bottle
      </Text>

      <Text position={[1.8, 1.8, 0.5]} fontSize={0.1} color="#ef4444" anchorX="center">
        Horseshoe Magnet
      </Text>

      <Text position={[0, 0.1, 1.3]} fontSize={0.12} color="#f8fafc" anchorX="center">
        Work Tray
      </Text>

      {/* Stage indicator */}
      <Text position={[0, 2.5, 0]} fontSize={0.15} color="#f59e0b" anchorX="center">
        {stage === "mix" && "🧲 Step 1: Mixture Ready"}
        {stage === "magnet" && "🧲 Step 2: Magnet Separation"}
        {stage === "wash" && "💧 Step 3: Washing Iron"}
        {stage === "dry" && "✓ Step 4: Dry & Weigh"}
      </Text>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={3}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0.8, 0]}
      />
    </>
  )
}

export function MixtureSeparationSim({ ironFraction }: { ironFraction: number }) {
  const [stageIndex, setStageIndex] = useState(0)
  const stage = stages[stageIndex]
  const [ranStep, setRanStep] = useState<boolean[]>([false, false, false, false])

  const status =
    stage === "mix"
      ? "Mixture ready"
      : stage === "magnet"
        ? "Iron pulled by magnet"
        : stage === "wash"
          ? "Washing stage"
          : "Dry separated sample"

  const theoreticalIron = useMemo(() => ironFraction, [ironFraction])
  const magnetRecovered = useMemo(() => (ranStep[1] ? theoreticalIron * 0.92 : 0), [ranStep, theoreticalIron])
  const washedRecovered = useMemo(() => (ranStep[2] ? magnetRecovered * 0.97 : magnetRecovered), [ranStep, magnetRecovered])
  const finalRecovered = useMemo(() => (ranStep[3] ? washedRecovered * 0.99 : washedRecovered), [ranStep, washedRecovered])
  const recoveryPercent = useMemo(
    () => (theoreticalIron > 0 ? (finalRecovered / theoreticalIron) * 100 : 0),
    [finalRecovered, theoreticalIron],
  )
  const purityPercent = useMemo(() => (ranStep[1] ? Math.min(99, 75 + ironFraction * 0.2) : 0), [ranStep, ironFraction])

  const runCurrentStep = () => {
    setRanStep((prev) => {
      const next = [...prev]
      next[stageIndex] = true
      return next
    })
    if (stageIndex < stages.length - 1) {
      setStageIndex((s) => s + 1)
    }
  }

  const resetAll = () => {
    setStageIndex(0)
    setRanStep([false, false, false, false])
  }

  return (
    <div className="h-full flex flex-col gap-3 overflow-auto pr-1">
      {/* Status */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          Iron: {ironFraction.toFixed(0)}%
        </Badge>
        <Badge variant="outline" className="gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Sand: {(100 - ironFraction).toFixed(0)}%
        </Badge>
        <Badge variant="secondary">{status}</Badge>
      </div>

      {/* 3D Viewport */}
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[350px]">
        <Canvas shadows camera={{ position: [3, 3.5, 5], fov: 45 }}>
          <SeparationScene ironFraction={ironFraction} stage={stage} />
        </Canvas>
      </div>

      {/* Step buttons */}
      <div className="grid grid-cols-4 gap-2">
        <Button onClick={() => setStageIndex(0)} variant={stage === "mix" ? "default" : "outline"} size="sm">
          1. Mix
        </Button>
        <Button
          onClick={() => setStageIndex(1)}
          variant={stage === "magnet" ? "default" : "outline"}
          disabled={!ranStep[0]}
          size="sm"
        >
          2. Magnet
        </Button>
        <Button
          onClick={() => setStageIndex(2)}
          variant={stage === "wash" ? "default" : "outline"}
          disabled={!ranStep[1]}
          size="sm"
        >
          3. Wash
        </Button>
        <Button
          onClick={() => setStageIndex(3)}
          variant={stage === "dry" ? "default" : "outline"}
          disabled={!ranStep[2]}
          size="sm"
        >
          4. Dry
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button onClick={runCurrentStep} size="sm">
          ▶ Run Step {stageIndex + 1}
        </Button>
        <Button variant="outline" onClick={resetAll} size="sm">
          ↺ Reset
        </Button>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="rounded-lg border border-border/60 bg-card/40 p-2">
          <div className="text-xs text-muted-foreground">Theoretical</div>
          <div className="text-lg font-semibold">{theoreticalIron.toFixed(1)}%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-2">
          <div className="text-xs text-muted-foreground">Recovered</div>
          <div className="text-lg font-semibold">{finalRecovered.toFixed(1)}%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-2">
          <div className="text-xs text-muted-foreground">Recovery</div>
          <div className="text-lg font-semibold text-green-400">{recoveryPercent.toFixed(1)}%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-2">
          <div className="text-xs text-muted-foreground">Purity</div>
          <div className="text-lg font-semibold text-blue-400">{purityPercent.toFixed(1)}%</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border border-border/60 bg-primary/5 p-3 text-sm">
        <p className="text-muted-foreground">
          <strong>Separation by Physical Method:</strong>{" "}
          {stage === "mix" && "Mixture of iron filings and sand is ready in the work tray."}
          {stage === "magnet" && "Use horseshoe magnet to attract iron. Iron moves toward magnet, sand stays."}
          {stage === "wash" && "Rinse separated iron with water to remove sand particles."}
          {stage === "dry" && "Dry the iron sample and calculate recovery percentage."}
        </p>
      </div>
    </div>
  )
}
