"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"
import * as THREE from "three"

type DistSetup = {
  flask: boolean
  burner: boolean
  condenser: boolean
 receiver: boolean
  thermometer: boolean
}

// Realistic Bunsen burner flame with flickering
function BunsenFlame({ active, intensity }: { active: boolean; intensity: number }) {
  const flameRef = useRef<THREE.Group>(null)
  const innerFlameRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!flameRef.current || !active) return
    const t = clock.elapsedTime

    const flickerScale = 1 + Math.sin(t * 15) * 0.08 + Math.cos(t * 22) * 0.05
    flameRef.current.scale.set(flickerScale, 1 + Math.sin(t * 10) * 0.1 * intensity, flickerScale)

    if (innerFlameRef.current) {
      innerFlameRef.current.rotation.z = Math.sin(t * 4) * 0.03
    }
  })

  if (!active) return null

  return (
    <group ref={flameRef}>
      {/* Outer orange flame */}
      <mesh position={[-1.1, 0.62, -0.35]}>
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
      <mesh position={[-1.1, 0.7, -0.35]}>
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
      <mesh ref={innerFlameRef} position={[-1.1, 0.55, -0.35]}>
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

// Vapor rising from heated flask
function VaporParticles({ active, temp }: { active: boolean; temp: number }) {
  const particlesRef = useRef<THREE.Group>(null)
  const [particleData] = useState(() =>
    Array.from({ length: 15 }, (_, i) => ({
      x: -1.1 + (Math.random() - 0.5) * 0.3,
      z: -0.35 + (Math.random() - 0.5) * 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 0.5,
      size: 0.015 + Math.random() * 0.01,
    }))
  )

  useFrame(({ clock }) => {
    if (!particlesRef.current || !active || temp < 70) return
    const intensity = Math.min(1, (temp - 70) / 20)

    particlesRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const data = particleData[i]
      const t = clock.elapsedTime * data.speed + data.phase

      // Vapor rises up through flask neck
      const cycle = (t % 2.5) / 2.5
      const startY = 1.2
      const endY = 1.8

      mesh.position.y = startY + (endY - startY) * cycle
      mesh.position.x = data.x + Math.sin(t * 2) * 0.03
      mesh.position.z = data.z + Math.cos(t * 1.5) * 0.02

      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = 0.3 * intensity * (1 - cycle * 0.6)
    })
  })

  if (!active || temp < 65) return null

  return (
    <group ref={particlesRef}>
      {particleData.map((data, i) => (
        <mesh key={i} position={[data.x, 1.2, data.z]}>
          <sphereGeometry args={[data.size, 8, 8]} />
          <meshStandardMaterial
            color="#e0f2fe"
            transparent
            opacity={0}
            emissive="#e0f2fe"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}

// Condensation droplets on condenser surface
function CondensationDroplets({ active, temp }: { active: boolean; temp: number }) {
  const dropletsRef = useRef<THREE.Group>(null)
  // Use lazy state initialization to avoid impure function during render
  const [dropletData] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      u: Math.random(), // Position along condenser length
      angle: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
      size: 0.008 + Math.random() * 0.006,
    }))
  )

  useFrame(({ clock }) => {
    if (!dropletsRef.current || !active || temp < 75) return

    dropletsRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const data = dropletData[i]
      const t = clock.elapsedTime * 0.8 + data.phase

      // Droplets move down the condenser
      const cycle = (t % 3) / 3
      const condenserLength = 1.7
      const yBase = 1.35
      const y = yBase + condenserLength * (0.5 - cycle)

      // Position around condenser circumference
      const radius = 0.13
      const x = 0.22 + Math.cos(data.angle) * radius
      const z = -0.35 + Math.sin(data.angle) * radius

      mesh.position.set(x, y, z)

      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = 0.5 * Math.sin(cycle * Math.PI)
    })
  })

  if (!active || temp < 72) return null

  return (
    <group ref={dropletsRef}>
      {dropletData.map((data, i) => (
        <mesh key={i} position={[0.22, 1.35, -0.35]}>
          <sphereGeometry args={[data.size, 8, 8]} />
          <meshStandardMaterial
            color="#a5f3fc"
            transparent
            opacity={0}
            emissive="#67e8f9"
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </group>
  )
}

// Animated distillate dripping
function DistillateDrip({ active, temp, onDrip }: { active: boolean; temp: number; onDrip?: () => void }) {
  const dripRef = useRef<THREE.Mesh>(null)
  const [dripCount, setDripCount] = useState(0)

  useFrame(({ clock }) => {
    if (!dripRef.current || !active || temp < 78) return

    const t = clock.elapsedTime * 1.5
    const cycle = t % 2

    // Drop forms and falls
    if (cycle < 0.3) {
      // Growing at tip
      const scale = cycle / 0.3
      dripRef.current.scale.setScalar(0.5 + scale * 0.5)
      dripRef.current.position.y = 1.0 - cycle * 0.1
    } else if (cycle < 0.6) {
      // Falling
      const fallProgress = (cycle - 0.3) / 0.3
      dripRef.current.position.y = 0.9 - fallProgress * 0.4
      dripRef.current.scale.setScalar(1 - fallProgress * 0.3)
    } else {
      // Reset
      dripRef.current.position.y = 1.0
      dripRef.current.scale.setScalar(0)
    }
  })

  if (!active || temp < 78) return null

  return (
    <mesh ref={dripRef} position={[1.1, 1.0, -0.35]}>
      <sphereGeometry args={[0.02, 10, 10]} />
      <meshStandardMaterial
        color="#a5f3fc"
        transparent
        opacity={0.8}
        emissive="#67e8f9"
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

// Water flow animation in condenser jacket
function WaterFlow({ active }: { active: boolean }) {
  const flowRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Mesh[]>([])

  useFrame(({ clock }) => {
    if (!flowRef.current || !active) return

    const t = clock.elapsedTime * 2
    particlesRef.current.forEach((particle, i) => {
      if (!particle) return
      // Water flows through condenser jacket
      const cycle = ((t + i * 0.2) % 2) / 2
      const y = 1.35 + 0.8 * (0.5 - cycle)
      particle.position.y = y

      const mat = particle.material as THREE.MeshStandardMaterial
      mat.opacity = 0.4 * Math.sin(cycle * Math.PI)
    })
  })

  if (!active) return null

  return (
    <group ref={flowRef}>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) particlesRef.current[i] = el }}
          position={[0.22, 1.35, -0.35]}
        >
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial
            color="#0ea5e9"
            transparent
            opacity={0}
            emissive="#0284c7"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}

// Heat shimmer effect
function HeatShimmer({ active, temp }: { active: boolean; temp: number }) {
  const shimmerRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!shimmerRef.current || !active || temp < 60) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 5) * 0.1
    shimmerRef.current.scale.setScalar(pulse)
  })

  if (!active || temp < 60) return null

  const intensity = Math.min(0.5, (temp - 60) / 40)

  return (
    <mesh ref={shimmerRef} position={[-1.1, 0.9, -0.35]}>
      <sphereGeometry args={[0.6, 24, 24]} />
      <meshBasicMaterial color="#fb923c" transparent opacity={intensity * 0.15} />
    </mesh>
  )
}

function DistillationScene({
  running,
  setup,
  tempHead,
  distillateMl,
}: {
  running: boolean
  setup: DistSetup
  tempHead: number
  distillateMl: number
}) {
  const flow = running && tempHead > 78
  const receiverLevel = Math.min(0.5, distillateMl / 150)
  const heatIntensity = Math.min(1, tempHead / 100)

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[-1.1, 0.7, -0.35]} intensity={running ? 1.5 + heatIntensity : 0.1} color="#fb923c" />

      {/* Lab bench */}
      <mesh position={[0, 0.05, -0.4]} receiveShadow>
        <boxGeometry args={[5, 0.1, 2.2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Retort stand base */}
      <group visible={setup.flask}>
        <mesh position={[-1.1, 0.03, -0.35]}>
          <boxGeometry args={[1.2, 0.06, 0.9]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {/* Stand pole */}
        <mesh position={[-1.6, 0.8, -0.35]}>
          <cylinderGeometry args={[0.04, 0.04, 1.6, 12]} />
          <meshStandardMaterial color="#64748b" metalness={0.5} />
        </mesh>
        {/* Clamp holding flask */}
        <mesh position={[-1.25, 1.0, -0.35]}>
          <boxGeometry args={[0.15, 0.04, 0.3]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.4} />
        </mesh>
      </group>

      {/* Distillation flask with realistic glass */}
      <group visible={setup.flask}>
        {/* Flask body */}
        <mesh position={[-1.1, 1.0, -0.35]} castShadow>
          <sphereGeometry args={[0.42, 32, 32]} />
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
        {/* Flask neck */}
        <mesh position={[-0.86, 1.34, -0.35]} rotation={[0, 0, -0.9]}>
          <cylinderGeometry args={[0.09, 0.09, 0.58, 24]} />
          <meshPhysicalMaterial
            color="#e2e8f0"
            metalness={0.1}
            roughness={0.05}
            transmission={0.9}
            thickness={0.06}
            transparent
            opacity={0.3}
          />
        </mesh>
        {/* Liquid in flask */}
        <mesh position={[-1.1, 0.82, -0.35]}>
          <sphereGeometry args={[0.27, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
          <meshStandardMaterial
            color={tempHead > 78 ? "#bae6fd" : "#93c5fd"}
            transparent
            opacity={0.65}
            emissive="#67e8f9"
            emissiveIntensity={0.1}
          />
        </mesh>
      </group>

      {/* Bunsen burner */}
      <group visible={setup.burner}>
        <mesh position={[-1.1, 0.32, -0.35]}>
          <cylinderGeometry args={[0.16, 0.2, 0.3, 20]} />
          <meshStandardMaterial color="#64748b" metalness={0.5} />
        </mesh>
        <mesh position={[-1.1, 0.18, -0.35]}>
          <cylinderGeometry args={[0.22, 0.22, 0.05, 20]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      </group>

      {/* Animated flame */}
      <BunsenFlame active={running && setup.burner} intensity={heatIntensity} />

      {/* Heat shimmer */}
      <HeatShimmer active={running && setup.burner} temp={tempHead} />

      {/* Vapor from flask */}
      <VaporParticles active={running && setup.flask} temp={tempHead} />

      {/* Condenser with realistic glass */}
      <group visible={setup.condenser}>
        {/* Outer jacket */}
        <mesh position={[0.22, 1.35, -0.35]} rotation={[0, 0, -0.18]}>
          <cylinderGeometry args={[0.12, 0.12, 1.7, 32]} />
          <meshPhysicalMaterial
            color="#e2e8f0"
            metalness={0.1}
            roughness={0.05}
            transmission={0.8}
            thickness={0.05}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Inner tube */}
        <mesh position={[0.22, 1.35, -0.35]} rotation={[0, 0, -0.18]}>
          <cylinderGeometry args={[0.05, 0.05, 1.72, 24]} />
          <meshPhysicalMaterial
            color="#67e8f9"
            metalness={0.1}
            roughness={0.1}
            transmission={0.6}
            thickness={0.03}
            transparent
            opacity={0.4}
          />
        </mesh>
        {/* Water inlets/outlets */}
        <mesh position={[0.55, 1.75, -0.35]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.04, 0.04, 0.25, 12]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[-0.1, 0.95, -0.35]} rotation={[0, 0, -0.1]}>
          <cylinderGeometry args={[0.04, 0.04, 0.25, 12]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>

      {/* Water flow in condenser */}
      <WaterFlow active={running && setup.condenser} />

      {/* Condensation droplets */}
      <CondensationDroplets active={running && setup.condenser} temp={tempHead} />

      {/* Receiver with realistic glass */}
      <group visible={setup.receiver}>
        <mesh position={[1.55, 0.95, -0.35]} castShadow>
          <cylinderGeometry args={[0.25, 0.28, 0.95, 28]} />
          <meshPhysicalMaterial
            color="#e2e8f0"
            metalness={0.1}
            roughness={0.05}
            transmission={0.9}
            thickness={0.06}
            transparent
            opacity={0.25}
          />
        </mesh>
        {/* Distillate liquid */}
        <mesh position={[1.55, 0.5 + receiverLevel / 2, -0.35]} visible={distillateMl > 0}>
          <cylinderGeometry args={[0.21, 0.23, receiverLevel, 24]} />
          <meshStandardMaterial
            color="#a5f3fc"
            transparent
            opacity={0.7}
            emissive="#67e8f9"
            emissiveIntensity={0.15}
          />
        </mesh>
      </group>

      {/* Distillate dripping */}
      <DistillateDrip active={flow && setup.condenser && setup.receiver} temp={tempHead} />

      {/* Thermometer at head */}
      <group visible={setup.thermometer}>
        <mesh position={[-0.6, 1.55, -0.33]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 12]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[-0.6, 1.4, -0.33]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        {/* Mercury column */}
        <mesh
          position={[-0.6, 1.25 + ((Math.min(100, Math.max(20, tempHead)) - 20) / 80) * 0.35, -0.33]}
        >
          <cylinderGeometry args={[0.008, 0.008, 0.4, 12]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.3} />
        </mesh>
        {/* Temperature markings */}
        <Text position={[-0.45, 1.6, -0.33]} fontSize={0.04} color="#94a3b8" anchorX="left">
          {tempHead.toFixed(1)}°C
        </Text>
      </group>

      {/* Labels */}
      <Text position={[-1.1, 1.8, -0.35]} fontSize={0.06} color="#f8fafc" anchorX="center">
        Distillation Flask
      </Text>
      <Text position={[0.22, 2.4, -0.35]} fontSize={0.06} color="#f8fafc" anchorX="center">
        Condenser
      </Text>
      <Text position={[1.55, 1.6, -0.35]} fontSize={0.06} color="#f8fafc" anchorX="center">
        Receiver
      </Text>

      <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2.1} target={[0.2, 1.2, -0.35]} />
    </>
  )
}

export function DistillationSim({
  heatRate,
  alcoholPercent,
  setup,
}: {
  heatRate: number
  alcoholPercent: number
  setup: DistSetup
}) {
  const [running, setRunning] = useState(false)
  const [time, setTime] = useState(0)
  const [distillateMl, setDistillateMl] = useState(0)

  const setupReady = setup.flask && setup.burner && setup.condenser && setup.receiver && setup.thermometer
  const tempHead = useMemo(() => {
    const t = 20 + time * (heatRate / 2.5)
    return Math.min(95, t)
  }, [time, heatRate])
  const collecting = running && tempHead >= 72

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTime((v) => v + 0.1), 100)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (!collecting) return
    const id = setInterval(() => {
      setDistillateMl((v) => Math.min(100, v + 0.8 + heatRate * 0.08))
    }, 180)
    return () => clearInterval(id)
  }, [collecting, heatRate])

  useEffect(() => {
    if (!setupReady && running) setRunning(false)
  }, [setupReady, running])

  const purityOut = useMemo(() => {
    const base = 85 + alcoholPercent * 0.12
    const penalty = Math.max(0, (tempHead - 82) * 0.7)
    return Math.max(70, Math.min(98, base - penalty))
  }, [alcoholPercent, tempHead])

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline">Head Temp: {tempHead.toFixed(1)}°C</Badge>
        <Badge variant="outline">Feed alcohol: {alcoholPercent.toFixed(0)}%</Badge>
        <Badge variant="outline">Distillate: {distillateMl.toFixed(1)} mL</Badge>
        <Badge variant={collecting ? "default" : "secondary"}>{collecting ? "Collecting distillate" : "Heating phase"}</Badge>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => setRunning(true)} disabled={running || !setupReady} className="gap-2">
          <Play className="w-4 h-4" />
          Start Distillation
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
            setDistillateMl(0)
          }}
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {!setupReady && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
          Complete setup first: flask, burner, condenser, receiver, thermometer.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Head temperature</div>
          <div className="text-lg font-semibold">{tempHead.toFixed(1)}°C</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Distillate collected</div>
          <div className="text-lg font-semibold">{distillateMl.toFixed(1)} mL</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Estimated distillate purity</div>
          <div className="text-lg font-semibold">{purityOut.toFixed(1)}%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Observation</div>
          <div className="text-sm font-semibold">{collecting ? "Steady droplets from condenser tip" : "No condensate yet"}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[440px]">
        <Canvas camera={{ position: [0.2, 2.7, 5.2], fov: 48 }}>
          <DistillationScene running={running} setup={setup} tempHead={tempHead} distillateMl={distillateMl} />
        </Canvas>
      </div>
    </div>
  )
}

