"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMemo, useRef, useState } from "react"
import { RotateCcw, Play, Pause } from "lucide-react"
import * as THREE from "three"

type Setup = { testTube: boolean; copperSulfate: boolean; ironNail: boolean }

// Animated copper deposit growth on iron nail
function CopperDeposit({ progress }: { progress: number }) {
  const depositRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!depositRef.current || progress <= 0.2) return
    // Subtle shimmer effect on copper deposit
    const shimmer = 1 + Math.sin(clock.elapsedTime * 3) * 0.02
    depositRef.current.scale.setScalar(shimmer)
  })

  const depositHeight = 0.05 + progress * 0.18
  const depositRadius = 0.038 + progress * 0.015
  const depositOpacity = Math.min(1, progress * 1.5)

  return (
    <group ref={depositRef} visible={progress > 0.1}>
      {/* Main copper deposit layer */}
      <mesh position={[0.15, 0.58, -0.25]}>
        <cylinderGeometry args={[depositRadius, depositRadius + 0.005, depositHeight, 16]} />
        <meshStandardMaterial
          color="#b45309"
          metalness={0.8}
          roughness={0.3}
          emissive="#92400e"
          emissiveIntensity={0.1 * progress}
          transparent
          opacity={depositOpacity}
        />
      </mesh>

      {/* Copper crystalline texture - multiple small deposits */}
      {progress > 0.3 && Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = depositRadius + 0.008
        const x = 0.15 + Math.cos(angle) * radius
        const z = -0.25 + Math.sin(angle) * radius * 0.5
        const h = 0.02 + (progress - 0.3) * 0.04 * (1 + i % 3)
        return (
          <mesh key={i} position={[x, 0.55 + h / 2, z]}>
            <coneGeometry args={[0.008, h, 6]} />
            <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
          </mesh>
        )
      })}

      {/* Shiny copper highlight */}
      <mesh position={[0.15, 0.58, -0.22]}>
        <cylinderGeometry args={[depositRadius * 0.7, depositRadius * 0.7, depositHeight * 0.8, 12]} />
        <meshStandardMaterial color="#f59e0b" metalness={1} roughness={0.1} emissive="#fbbf24" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

// Ion exchange particles animation
function IonExchangeParticles({ active, progress }: { active: boolean; progress: number }) {
  const particlesRef = useRef<THREE.Group>(null)
  const particleData = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      x: (Math.random() - 0.5) * 0.3,
      y: 0.4 + Math.random() * 0.3,
      z: -0.3 + (Math.random() - 0.5) * 0.2,
      speed: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }))
  }, [])

  useFrame(({ clock }) => {
    if (!particlesRef.current || !active || progress <= 0) return
    particlesRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const data = particleData[i]
      // Iron ions (Fe²⁺) moving away from nail
      const t = clock.elapsedTime * data.speed + data.phase
      const awayProgress = Math.min(1, progress * 2)
      mesh.position.x = 0.15 + data.x * (1 + Math.sin(t) * 0.3) + awayProgress * 0.1 * Math.sin(t * 0.5)
      mesh.position.y = data.y + Math.sin(t * 1.5) * 0.05
      mesh.position.z = data.z + Math.cos(t) * 0.02
      // Fade out as reaction completes
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = Math.max(0.2, 0.6 - progress * 0.4)
    })
  })

  if (!active || progress <= 0) return null

  return (
    <group ref={particlesRef}>
      {/* Fe²⁺ ions (greenish-gray) moving away */}
      {particleData.slice(0, 10).map((_, i) => (
        <mesh key={`fe-${i}`} position={[0.15, 0.6, -0.25]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color="#65a30d" transparent opacity={0.6} emissive="#84cc16" emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Cu²⁺ ions (blue) moving toward nail */}
      {particleData.slice(10).map((_, i) => (
        <mesh key={`cu-${i}`} position={[0.15, 0.6, -0.25]}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} emissive="#60a5fa" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

// Solution color transition effect
function SolutionEffect({ progress }: { progress: number }) {
  const solutionRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!solutionRef.current) return
    // Subtle surface ripple
    solutionRef.current.position.y = 0.66 + Math.sin(clock.elapsedTime * 2) * 0.002
  })

  // Color transition: Blue (CuSO4) → Green (FeSO4)
  // Start: rgb(120, 180, 240) - bright blue
  // End: rgb(120, 200, 140) - pale green
  const r = 120
  const g = 180 + progress * 20
  const b = 240 - progress * 100
  const solutionColor = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`

  // Solution becomes slightly more transparent as iron sulfate forms
  const opacity = 0.6 - progress * 0.1

  return (
    <mesh ref={solutionRef} position={[0, 0.66, -0.3]}>
      <cylinderGeometry args={[0.26, 0.28, 0.56, 24]} />
      <meshStandardMaterial
        color={solutionColor}
        transparent
        opacity={opacity}
        emissive={solutionColor}
        emissiveIntensity={0.05 + progress * 0.02}
      />
    </mesh>
  )
}

// Reaction bubbles near the nail
function ReactionBubbles({ active, progress }: { active: boolean; progress: number }) {
  const bubblesRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!bubblesRef.current || !active || progress <= 0) return
    bubblesRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const t = clock.elapsedTime * (0.8 + i * 0.1) + i
      // Bubbles rise from the reaction site
      const startY = 0.55
      const endY = 0.85
      const cycle = (t % 2) / 2
      mesh.position.y = startY + (endY - startY) * cycle
      mesh.position.x = 0.15 + Math.sin(t * 2) * 0.04
      mesh.position.z = -0.25 + Math.cos(t * 1.5) * 0.02
      // Fade as they rise
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = 0.4 * (1 - cycle)
    })
  })

  if (!active || progress <= 0) return null

  return (
    <group ref={bubblesRef}>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0.15, 0.55, -0.25]}>
          <sphereGeometry args={[0.006 + (i % 3) * 0.003, 8, 8]} />
          <meshStandardMaterial color="#fef3c7" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

// Advanced 3D scene
function Scene({ setup, progress, isRunning }: { setup: Setup; progress: number; isRunning: boolean }) {
  const solutionBlue = Math.max(0, 1 - progress * 0.7)

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 6, -3]} intensity={0.4} />
      <pointLight position={[0.3, 1.2, 0]} intensity={0.6} color="#fbbf24" />

      {/* Lab bench */}
      <mesh position={[0, 0.05, -0.3]} receiveShadow>
        <boxGeometry args={[4, 0.1, 2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Test tube with realistic glass */}
      <group visible={setup.testTube}>
        {/* Glass body */}
        <mesh position={[0, 0.95, -0.3]}>
          <cylinderGeometry args={[0.32, 0.36, 1.0, 32, 1, true]} />
          <meshPhysicalMaterial
            color="#e2e8f0"
            metalness={0.1}
            roughness={0.05}
            transmission={0.9}
            thickness={0.1}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Glass bottom */}
        <mesh position={[0, 0.45, -0.3]}>
          <sphereGeometry args={[0.32, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#e2e8f0"
            metalness={0.1}
            roughness={0.05}
            transmission={0.9}
            thickness={0.1}
            transparent
            opacity={0.25}
          />
        </mesh>
        {/* Rim */}
        <mesh position={[0, 1.45, -0.3]}>
          <torusGeometry args={[0.32, 0.02, 8, 32]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      {/* Copper sulfate solution with dynamic color */}
      {setup.copperSulfate && <SolutionEffect progress={progress} />}

      {/* Iron nail with realistic metal */}
      <group visible={setup.ironNail}>
        {/* Nail body */}
        <mesh position={[0.15, 0.87, -0.25]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.55, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Nail head */}
        <mesh position={[0.15, 1.16, -0.25]} castShadow>
          <cylinderGeometry args={[0.05, 0.03, 0.03, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.5} />
        </mesh>
        {/* Corrosion/rust on nail (increases as reaction progresses) */}
        <mesh position={[0.15, 0.58, -0.25]} visible={progress > 0.1}>
          <cylinderGeometry args={[0.032, 0.032, 0.08, 12]} />
          <meshStandardMaterial
            color="#7c2d12"
            metalness={0.3}
            roughness={0.8}
            transparent
            opacity={progress * 0.6}
          />
        </mesh>
      </group>

      {/* Copper deposit animation */}
      {setup.ironNail && <CopperDeposit progress={progress} />}

      {/* Ion exchange particles */}
      <IonExchangeParticles active={setup.copperSulfate && setup.ironNail && isRunning} progress={progress} />

      {/* Reaction bubbles */}
      <ReactionBubbles active={isRunning && progress < 1} progress={progress} />

      {/* Labels */}
      <Text position={[-0.5, 1.6, -0.3]} fontSize={0.08} color="#f8fafc" anchorX="center">
        Displacement: Fe + CuSO₄ → FeSO₄ + Cu
      </Text>
      <Text position={[0.5, 0.3, -0.3]} fontSize={0.06} color="#94a3b8" anchorX="center">
        Copper deposit on iron nail
      </Text>

      <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2.1} target={[0, 0.8, -0.3]} />
    </>
  )
}

export function DisplacementSim({ setup }: { setup: Setup }) {
  const [progress, setProgress] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const ready = setup.testTube && setup.copperSulfate && setup.ironNail

  const status = useMemo(() => {
    if (!ready) return "Setup required"
    if (progress >= 1) return "✅ Reaction complete - Iron displaced copper"
    if (progress > 0.7) return "🔵 Solution turning pale green (FeSO₄)"
    if (progress > 0.4) return "🟠 Copper deposit visible on nail"
    if (progress > 0) return "⚡ Displacement reaction in progress"
    return "⏳ Ready to start reaction"
  }, [progress, ready])

  const stepReaction = () => {
    setIsRunning(true)
    setProgress((v) => {
      const next = Math.min(1, v + 0.15)
      if (next >= 1) setIsRunning(false)
      return next
    })
  }

  const reset = () => {
    setProgress(0)
    setIsRunning(false)
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={stepReaction} disabled={!ready || progress >= 1} className="gap-2">
          <Play className="w-4 h-4" /> Advance Reaction
        </Button>
        <Button variant="secondary" onClick={() => setIsRunning(!isRunning)} disabled={!ready || progress <= 0 || progress >= 1} className="gap-2">
          {isRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Resume</>}
        </Button>
        <Button variant="outline" className="gap-2" onClick={reset}>
          <RotateCcw className="w-4 h-4" /> Reset
        </Button>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline">Solution: {progress < 0.5 ? "Blue CuSO₄" : "Green FeSO₄"}</Badge>
        <Badge variant="outline">Copper deposit: {(progress * 100).toFixed(0)}%</Badge>
        <Badge variant={progress >= 1 ? "default" : "secondary"}>{status}</Badge>
      </div>

      {!ready && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
          🔧 Place test tube, copper sulfate solution, and iron nail to begin the displacement reaction.
        </div>
      )}

      {/* Measurements */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Solution color</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-4 h-4 rounded" style={{ background: progress > 0.5 ? "#86efac" : "#60a5fa" }} />
            <span className="text-sm font-semibold">{progress > 0.5 ? "Pale green" : "Blue"}</span>
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Reaction progress</div>
          <div className="text-lg font-semibold">{(progress * 100).toFixed(0)}%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Observation</div>
          <div className="text-sm font-semibold">
            {progress >= 1 ? "Complete displacement" : progress > 0.4 ? "Copper visible" : "Reaction active"}
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Chemical change</div>
          <div className="text-sm font-semibold text-cyan-400">
            Fe + Cu²⁺ → Fe²⁺ + Cu
          </div>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden flex-1 min-h-[420px]">
        <Canvas shadows camera={{ position: [1.5, 2.5, 4], fov: 45 }}>
          <Scene setup={setup} progress={progress} isRunning={isRunning} />
        </Canvas>
      </div>

      {/* Educational info */}
      <div className="rounded-lg border border-border/60 bg-primary/5 p-3 text-sm">
        <p className="text-muted-foreground">
          <strong className="text-foreground">Displacement Reaction:</strong> Iron (more reactive) displaces copper from copper sulfate solution.{" "}
          <span className="text-cyan-400">
            {progress >= 1
              ? "✅ Complete! Iron nail coated with copper, solution now contains iron(II) sulfate."
              : progress > 0
                ? "🔬 Observe: Copper deposits forming on iron nail, blue color fading to pale green."
                : "⬇️ Click 'Advance Reaction' to see the displacement process in action."}
          </span>
        </p>
      </div>
    </div>
  )
}
