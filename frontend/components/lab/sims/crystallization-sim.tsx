"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMemo, useRef, useState } from "react"
import { RotateCcw } from "lucide-react"
import type { Mesh } from "three"
import * as THREE from "three"

type Setup = { beaker: boolean; burner: boolean; dish: boolean; funnel: boolean }

// Realistic Bunsen burner flame with flickering
function BunsenFlame({ intensity }: { intensity: number }) {
  const flameRef = useRef<THREE.Group>(null)
  const innerFlameRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!flameRef.current || intensity <= 0) return
    const t = clock.elapsedTime

    const flickerScale = 1 + Math.sin(t * 15) * 0.08 + Math.cos(t * 22) * 0.05
    flameRef.current.scale.set(flickerScale, 1 + Math.sin(t * 10) * 0.1 * intensity, flickerScale)

    if (innerFlameRef.current) {
      innerFlameRef.current.rotation.z = Math.sin(t * 4) * 0.03
    }
  })

  if (intensity <= 0) return null

  return (
    <group ref={flameRef}>
      {/* Outer orange flame */}
      <mesh position={[-0.55, 0.62, -0.3]}>
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
      <mesh position={[-0.55, 0.7, -0.3]}>
        <coneGeometry args={[0.07, 0.28, 20]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#f59e0b"
          emissiveIntensity={1.8 + intensity}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Inner blue cone */}
      <mesh ref={innerFlameRef} position={[-0.55, 0.55, -0.3]}>
        <coneGeometry args={[0.035, 0.14, 16]} />
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

// Heat shimmer effect
function HeatShimmer({ intensity }: { intensity: number }) {
  const shimmerRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!shimmerRef.current || intensity <= 0) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 5) * 0.1
    shimmerRef.current.scale.setScalar(pulse)
  })

  if (intensity <= 0) return null

  return (
    <mesh ref={shimmerRef} position={[-0.55, 0.9, -0.3]}>
      <sphereGeometry args={[0.5, 24, 24]} />
      <meshBasicMaterial color="#fb923c" transparent opacity={intensity * 0.15} />
    </mesh>
  )
}

// Enhanced vapor particles
function Vapor({ amount }: { amount: number }) {
  const vaporRef = useRef<THREE.Group>(null)
  const [bubbleData] = useState(() =>
    Array.from({ length: 15 }, (_, i) => ({
      x: -0.55 + (Math.random() - 0.5) * 0.3,
      z: -0.3 + (Math.random() - 0.5) * 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.4,
      size: 0.012 + Math.random() * 0.008,
    }))
  )

  useFrame(({ clock }) => {
    if (!vaporRef.current || amount <= 0) return

    vaporRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const data = particleData[i]
      const t = clock.elapsedTime * data.speed + data.phase

      const cycle = (t % 2.5) / 2.5
      const startY = 0.95
      const endY = 1.6

      mesh.position.y = startY + (endY - startY) * cycle
      mesh.position.x = data.x + Math.sin(t * 1.5) * 0.04
      mesh.position.z = data.z + Math.cos(t * 1.2) * 0.02

      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = amount * 0.4 * (1 - cycle * 0.5)
    })
  })

  if (amount <= 0) return null

  return (
    <group ref={vaporRef}>
      {particleData.map((data, i) => (
        <mesh key={i} position={[data.x, 0.95, data.z]}>
          <sphereGeometry args={[data.size, 8, 8]} />
          <meshStandardMaterial
            color="#e2e8f0"
            transparent
            opacity={0}
            emissive="#f1f5f9"
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </group>
  )
}

// Animated crystal cluster growth
function CrystalCluster({ amount, color }: { amount: number; color: string }) {
  const clusterRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!clusterRef.current || amount <= 0) return
    // Subtle shimmer on crystals
    const shimmer = 1 + Math.sin(clock.elapsedTime * 2) * 0.02
    clusterRef.current.children.forEach((child) => {
      const mesh = child as THREE.Mesh
      mesh.scale.set(shimmer, 1, shimmer)
    })
  })

  if (amount <= 0) return null

  return (
    <group ref={clusterRef}>
      {Array.from({ length: 20 }).map((_, i) => {
        const x = 0.45 + ((i % 6) - 2.5) * 0.06
        const z = -0.3 + (Math.floor(i / 6) - 1) * 0.06
        const h = 0.01 + amount * (0.06 + (i % 5) * 0.015)
        const delay = i * 0.05
        const visibleAmount = Math.max(0, Math.min(1, (amount - delay) / (1 - delay)))

        return (
          <mesh
            key={i}
            position={[x, 0.98 + h / 2, z]}
            visible={visibleAmount > 0}
            scale={[visibleAmount, visibleAmount, visibleAmount]}
          >
            <coneGeometry args={[0.015 + (i % 3) * 0.005, h, 6]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.1 + amount * 0.3}
              roughness={0.4}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Realistic beaker with solution
function Beaker({ visible, level, color }: { visible: boolean; level: number; color: string }) {
  if (!visible) return null

  return (
    <group position={[-0.55, 0, -0.3]}>
      {/* Glass body */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.31, 0.8, 26, 1, true]} />
        <meshPhysicalMaterial
          color="#e2e8f0"
          metalness={0.1}
          roughness={0.05}
          transmission={0.9}
          thickness={0.08}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.28, 22, 11, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#e2e8f0"
          metalness={0.1}
          roughness={0.05}
          transmission={0.9}
          thickness={0.08}
          transparent
          opacity={0.25}
        />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 1.35, 0]}>
        <torusGeometry args={[0.28, 0.006, 6, 26]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {/* Graduation marks */}
      {[0.7, 0.85, 1.0, 1.15, 1.3].map((y, i) => (
        <mesh key={i} position={[-0.22, y - 0.55, 0]}>
          <boxGeometry args={[0.04, 0.004, 0.004]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      ))}

      {/* Solution */}
      {level > 0 && (
        <>
          <mesh position={[0, 0.58 + level / 2, 0]}>
            <cylinderGeometry args={[0.23, 0.25, level, 22]} />
            <meshPhysicalMaterial
              color={color}
              metalness={0.1}
              roughness={0.1}
              transmission={0.6}
              thickness={0.05}
              transparent
              opacity={0.65}
              emissive={color}
              emissiveIntensity={0.15}
            />
          </mesh>
          {/* Meniscus */}
          <mesh position={[0, 0.58 + level, 0]}>
            <torusGeometry args={[0.2, 0.008, 6, 22]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color={color} transparent opacity={0.5} />
          </mesh>
        </>
      )}
    </group>
  )
}

// China dish with solution residue
function ChinaDish({ visible, crystalAmount, crystalColor }: { visible: boolean; crystalAmount: number; crystalColor: string }) {
  if (!visible) return null

  return (
    <group position={[0.45, 0, -0.3]}>
      {/* Dish body */}
      <mesh position={[0, 0.94, 0]}>
        <cylinderGeometry args={[0.35, 0.38, 0.12, 24]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.3} />
      </mesh>
      {/* Inner solution/crystal layer */}
      <mesh position={[0, 0.98, 0]}>
        <cylinderGeometry args={[0.3, 0.32, 0.03, 22]} />
        <meshStandardMaterial
          color={crystalColor}
          emissive={crystalColor}
          emissiveIntensity={0.15 + crystalAmount * 0.2}
        />
      </mesh>
      {/* Dish rim */}
      <mesh position={[0, 1.0, 0]}>
        <torusGeometry args={[0.35, 0.008, 6, 24]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>
    </group>
  )
}

// Glass funnel
function Funnel({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <group position={[0.45, 0, -0.3]}>
      {/* Funnel cone */}
      <mesh position={[0, 1.48, 0]}>
        <coneGeometry args={[0.4, 0.65, 24, 1, true]} />
        <meshPhysicalMaterial
          color="#e2e8f0"
          metalness={0.1}
          roughness={0.05}
          transmission={0.85}
          thickness={0.04}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Funnel stem */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.03, 0.02, 0.2, 12]} />
        <meshPhysicalMaterial
          color="#e2e8f0"
          metalness={0.1}
          roughness={0.05}
          transmission={0.8}
          thickness={0.03}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}

function Scene({
  setup,
  heat,
  cool,
  concentration,
  crystalColor,
  solutionTint,
}: {
  setup: Setup
  heat: number
  cool: number
  concentration: number
  crystalColor: string
  solutionTint: string
}) {
  const solutionLevel = Math.min(0.48, 0.3 + concentration * 0.2)
  const evap = Math.max(0, heat - 0.45)
  const crystal = Math.max(0, cool - 0.25)

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[-0.55, 0.7, -0.3]} intensity={heat > 0 ? 1.2 + heat : 0.15} color="#fb923c" />

      {/* Lab bench */}
      <mesh position={[0, 0.05, -0.32]} receiveShadow>
        <boxGeometry args={[4.0, 0.1, 2.0]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Retort stand base */}
      <group visible={setup.beaker}>
        <mesh position={[-0.55, 0.03, -0.3]}>
          <boxGeometry args={[0.9, 0.06, 0.7]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {/* Stand pole */}
        <mesh position={[-0.95, 0.7, -0.3]}>
          <cylinderGeometry args={[0.03, 0.03, 1.4, 10]} />
          <meshStandardMaterial color="#64748b" metalness={0.5} />
        </mesh>
        {/* Clamp */}
        <mesh position={[-0.7, 0.95, -0.3]}>
          <boxGeometry args={[0.12, 0.03, 0.25]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.4} />
        </mesh>
      </group>

      {/* Beaker with solution */}
      <Beaker visible={setup.beaker} level={solutionLevel} color={solutionTint} />

      {/* Bunsen burner */}
      <group visible={setup.burner}>
        <mesh position={[-0.55, 0.32, -0.3]}>
          <cylinderGeometry args={[0.16, 0.18, 0.3, 20]} />
          <meshStandardMaterial color="#64748b" metalness={0.5} />
        </mesh>
        <mesh position={[-0.55, 0.18, -0.3]}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 20]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      </group>

      {/* Animated flame */}
      <BunsenFlame intensity={heat} />

      {/* Heat shimmer */}
      <HeatShimmer intensity={heat} />

      {/* China dish with crystals */}
      <ChinaDish visible={setup.dish} crystalAmount={crystal} crystalColor={crystalColor} />

      {/* Crystal cluster */}
      <CrystalCluster amount={crystal} color={crystalColor} />

      {/* Funnel */}
      <Funnel visible={setup.funnel} />

      {/* Vapor from evaporation */}
      <Vapor amount={evap} />

      {/* Labels */}
      <Text position={[-0.55, 1.5, -0.3]} fontSize={0.05} color="#f8fafc" anchorX="center">
        Saturated Solution
      </Text>
      <Text position={[0.45, 1.35, -0.3]} fontSize={0.05} color="#f8fafc" anchorX="center">
        Crystal Dish
      </Text>
      <Text position={[-0.55, 0.15, 0.25]} fontSize={0.04} color="#94a3b8" anchorX="center">
        Bunsen Burner
      </Text>

      <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2.1} target={[0, 1, -0.3]} />
    </>
  )
}

export function CrystallizationSim({
  setup,
  practicalId,
  practicalTitle,
}: {
  setup: Setup
  practicalId?: string
  practicalTitle?: string
}) {
  const [heat, setHeat] = useState(0)
  const [cool, setCool] = useState(0)
  const [concentration, setConcentration] = useState(0.5)
  const ready = setup.beaker && setup.burner && setup.dish && setup.funnel
  const title = (practicalTitle || "").toLowerCase()
  const isGravimetric = practicalId === "hssc-chem-01" || title.includes("gravimetric")
  const label =
    isGravimetric
      ? "CuSO4 crystal growth (gravimetric style)"
      : "Crystallization"
  const crystalColor = isGravimetric ? "#93c5fd" : "#c4b5fd"
  const solutionTint = isGravimetric ? "#60a5fa" : "#93c5fd"

  const status = useMemo(() => {
    if (cool > 0.8) return "Crystals formed"
    if (heat > 0.6) return "Evaporation concentrating solution"
    return "Ready"
  }, [heat, cool])

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline">Concentration: {(concentration * 100).toFixed(0)}%</Badge>
        <Badge variant="outline">Heating: {(heat * 100).toFixed(0)}%</Badge>
        <Badge variant="outline">Cooling: {(cool * 100).toFixed(0)}%</Badge>
        <Badge variant="outline">{label}</Badge>
        <Badge variant={cool > 0.8 ? "default" : "secondary"}>{status}</Badge>
      </div>

      {!ready && <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">Place beaker, burner, dish and funnel first.</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Button disabled={!ready || heat >= 1} onClick={() => { setHeat((v) => Math.min(1, v + 0.15)); setConcentration((v) => Math.min(1, v + 0.08)) }}>Heat to evaporate</Button>
        <Button disabled={!ready || heat < 0.3 || cool >= 1} onClick={() => setCool((v) => Math.min(1, v + 0.18))}>Cool to crystallize</Button>
        <Button disabled={!ready} variant="outline" onClick={() => setConcentration((v) => Math.min(1, v + 0.06))}>Add saturated feed</Button>
        <Button variant="outline" className="gap-2" onClick={() => { setHeat(0); setCool(0); setConcentration(0.5) }}><RotateCcw className="w-4 h-4" /> Reset</Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[420px]">
        <Canvas camera={{ position: [0, 2.6, 5], fov: 48 }}>
          <Scene
            setup={setup}
            heat={heat}
            cool={cool}
            concentration={concentration}
            crystalColor={crystalColor}
            solutionTint={solutionTint}
          />
        </Canvas>
      </div>
    </div>
  )
}
