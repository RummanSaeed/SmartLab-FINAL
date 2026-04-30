"use client"

import { useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import * as THREE from "three"

// Bunsen burner with adjustable flame
function BunsenBurner({ heatingOn }: { heatingOn: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.3, 24]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} />
      </mesh>
      {/* Gas tube */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} />
      </mesh>
      {/* Collar/air vent */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Flame */}
      {heatingOn && (
        <group>
          <mesh position={[0, 0.9, 0]}>
            <coneGeometry args={[0.04, 0.2, 16]} />
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={1} />
          </mesh>
          <mesh position={[0, 0.82, 0]}>
            <coneGeometry args={[0.02, 0.1, 16]} />
            <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={2} />
          </mesh>
          {/* Heat glow */}
          <pointLight position={[0, 1.2, 0]} intensity={2} color="#f97316" distance={2} />
        </group>
      )}
    </group>
  )
}

// Tripod stand with wire gauze
function TripodStand() {
  return (
    <group position={[0, 0.4, 0]}>
      {/* Three legs */}
      {[-120, 0, 120].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        return (
          <mesh
            key={i}
            position={[Math.cos(rad) * 0.4, 0.3, Math.sin(rad) * 0.4]}
            rotation={[0, 0, Math.cos(rad) * 0.3]}
          >
            <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        )
      })}
      {/* Top ring */}
      <mesh position={[0, 0.6, 0]}>
        <torusGeometry args={[0.4, 0.03, 8, 24]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      {/* Wire gauze */}
      <mesh position={[0, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.38, 32]} />
        <meshStandardMaterial color="#94a3b8" wireframe />
      </mesh>
    </group>
  )
}

// Animated bubbles for heating water
function HeatingBubbles({ active, temperature }: { active: boolean; temperature: number }) {
  const bubblesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!bubblesRef.current || !active) return
    const time = state.clock.elapsedTime
    bubblesRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      // Bubbles rise from bottom
      const speed = 0.5 + temperature / 100
      mesh.position.y = 0.2 + ((time * speed + i * 0.3) % 0.6)
      // Wobble side to side
      mesh.position.x = Math.sin(time * 3 + i) * 0.1
    })
  })

  if (!active || temperature <= 0) return null

  // More bubbles as temperature increases
  const bubbleCount = Math.min(8, Math.floor(temperature / 15))

  return (
    <group ref={bubblesRef} position={[0, 0, 0]}>
      {Array.from({ length: bubbleCount }, (_, i) => (
        <mesh key={i} position={[0, 0.2 + i * 0.1, 0]}>
          <sphereGeometry args={[0.015 + i * 0.005, 8, 8]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// Boiling bubbles (larger, faster)
function BoilingBubbles({ active }: { active: boolean }) {
  const bubblesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!bubblesRef.current || !active) return
    const time = state.clock.elapsedTime
    bubblesRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      // Fast rising bubbles
      mesh.position.y = 0.15 + ((time * 1.5 + i * 0.15) % 0.7)
      mesh.position.x = Math.sin(time * 5 + i * 2) * 0.15
      mesh.position.z = Math.cos(time * 4 + i) * 0.15
    })
  })

  if (!active) return null

  return (
    <group ref={bubblesRef}>
      {Array.from({ length: 15 }, (_, i) => (
        <mesh key={i} position={[(i % 5 - 2) * 0.1, 0.15, Math.floor(i / 5) * 0.1 - 0.1]}>
          <sphereGeometry args={[0.02 + Math.random() * 0.02, 8, 8]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

// Melting ice cubes with animation
function IceCubes({ temperature }: { temperature: number }) {
  const iceRef = useRef<THREE.Group>(null)

  // Calculate ice size based on temperature (-10 to 0)
  const meltFactor = Math.max(0, Math.min(1, (temperature + 10) / 10))
  const iceScale = 1 - meltFactor

  useFrame(() => {
    if (iceRef.current && meltFactor > 0 && meltFactor < 1) {
      // Shake slightly while melting
      iceRef.current.rotation.y = Math.sin(Date.now() / 500) * 0.05
    }
  })

  if (temperature >= 0) return null

  return (
    <group ref={iceRef}>
      {/* Ice cube 1 */}
      <mesh position={[-0.15, 0.25, 0.1]} scale={[iceScale, iceScale, iceScale]}>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.85} roughness={0.2} />
      </mesh>
      {/* Ice cube 2 */}
      <mesh position={[0.12, 0.2, -0.08]} scale={[iceScale * 0.9, iceScale * 0.9, iceScale * 0.9]}>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.85} roughness={0.2} />
      </mesh>
      {/* Ice cube 3 - smaller */}
      <mesh position={[0.05, 0.3, 0.15]} scale={[iceScale * 0.7, iceScale * 0.7, iceScale * 0.7]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#e0f2fe" transparent opacity={0.85} roughness={0.2} />
      </mesh>
      {/* Melting indicator */}
      {meltFactor > 0.3 && (
        <Text position={[0, 0.5, 0]} fontSize={0.08} color="#38bdf8" anchorX="center">
          Melting... {(meltFactor * 100).toFixed(0)}%
        </Text>
      )}
    </group>
  )
}

// Water surface with ripples
function WaterSurface({ temperature, state }: { temperature: number; state: string }) {
  const waterRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!waterRef.current) return
    const time = state.clock.elapsedTime
    // Gentle ripples, more when hot
    const amplitude = temperature > 80 ? 0.02 : 0.005
    waterRef.current.position.y = 0.4 + Math.sin(time * 2) * amplitude
  })

  if (state === "Steam") return null

  const waterColor = temperature < 0 ? "#93c5fd" : "#38bdf8"
  const opacity = temperature < 0 ? 0.3 : 0.5
  const waterLevel = temperature < 0 ? 0.35 : 0.45

  return (
    <mesh ref={waterRef} position={[0, waterLevel, 0]}>
      <cylinderGeometry args={[0.43, 0.43, 0.02, 32]} />
      <meshStandardMaterial color={waterColor} transparent opacity={opacity} />
    </mesh>
  )
}

// Real-time thermometer with accurate scaling
function Thermometer({ temperature }: { temperature: number }) {
  const tempY = 0.2 + (Math.min(Math.max(temperature, -10), 120) + 10) / 130 * 1.0

  return (
    <group position={[0.65, 0.8, 0]}>
      {/* Glass tube */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.4, 12]} />
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.3} />
      </mesh>
      {/* Bulb */}
      <mesh position={[0, -0.6, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      {/* Scale markings */}
      {[-10, 0, 20, 40, 60, 80, 100, 120].map((temp) => (
        <mesh key={temp} position={[0.04, -0.55 + (temp + 10) / 130 * 1.0, 0]}>
          <boxGeometry args={[0.03, 0.01, 0.01]} />
          <meshBasicMaterial color="#475569" />
        </mesh>
      ))}
      {/* Red liquid column */}
      <mesh position={[0, tempY / 2 - 0.55, 0]}>
        <cylinderGeometry args={[0.012, 0.012, tempY, 12]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.2} />
      </mesh>
      {/* Current temp reading */}
      <Text position={[0.15, tempY - 0.55, 0]} fontSize={0.1} color="#f59e0b" anchorX="left">
        {temperature.toFixed(1)}°C
      </Text>
    </group>
  )
}

// Beaker with substance and thermometer
function BeakerWithSubstance({
  temperature,
  state,
  heatingOn,
}: {
  temperature: number
  state: string
  heatingOn: boolean
}) {
  const beakerHeight = 1.2

  return (
    <group position={[0, 1.1, 0]}>
      {/* Beaker glass */}
      <mesh position={[0, beakerHeight / 2, 0]}>
        <cylinderGeometry args={[0.5, 0.45, beakerHeight, 32, 1, true]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Beaker bottom */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.1, 32]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.5} />
      </mesh>
      {/* Beaker rim */}
      <mesh position={[0, beakerHeight, 0]}>
        <torusGeometry args={[0.5, 0.03, 8, 32]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      {/* Water body (main volume) */}
      {state !== "Steam" && (
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.44, 0.42, 0.5, 32]} />
          <meshStandardMaterial color={temperature < 0 ? "#93c5fd" : "#38bdf8"} transparent opacity={0.4} />
        </mesh>
      )}

      {/* Animated water surface */}
      <WaterSurface temperature={temperature} state={state} />

      {/* Ice cubes (when frozen) */}
      <IceCubes temperature={temperature} />

      {/* Heating bubbles (when warming water) */}
      <HeatingBubbles active={heatingOn && temperature > 10 && temperature < 100} temperature={temperature} />

      {/* Boiling bubbles (at 100°C) */}
      <BoilingBubbles active={state === "Steam" || (heatingOn && temperature >= 95)} />

      {/* Thermometer */}
      <Thermometer temperature={temperature} />

      {/* State label */}
      <Text position={[-0.7, 0.6, 0]} fontSize={0.12} color="#f8fafc" anchorX="center">
        {state === "Ice" && "🧊 Solid"}
        {state === "Water" && "💧 Liquid"}
        {state === "Steam" && "☁️ Gas"}
      </Text>
    </group>
  )
}

// Steam/vapor particles
function SteamVapor({ active }: { active: boolean }) {
  const particlesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!particlesRef.current || !active) return
    const time = state.clock.elapsedTime
    particlesRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      mesh.position.y = 1.8 + ((time * 0.3 + i * 0.2) % 1) * 0.8
      mesh.position.x = Math.sin(time + i) * 0.1
      mesh.scale.setScalar(1 - ((time * 0.3 + i * 0.2) % 1))
    })
  })

  if (!active) return null

  return (
    <group ref={particlesRef} position={[0, 2.2, 0]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 1.8 + i * 0.2, 0]}>
          <sphereGeometry args={[0.08 + i * 0.02, 16, 16]} />
          <meshStandardMaterial color="#cbd5e1" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

// Lab table surface
function LabTable() {
  return (
    <mesh position={[0, -0.05, 0]} receiveShadow>
      <cylinderGeometry args={[3, 3, 0.1, 64]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
  )
}

// Main 3D scene
function HeatingScene({
  temperature,
  heatingOn,
  state,
}: {
  temperature: number
  heatingOn: boolean
  state: string
}) {
  const { camera } = useThree()

  useMemo(() => {
    camera.position.set(3, 3, 5)
    camera.lookAt(0, 1.2, 0)
  }, [camera])

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 6, -3]} intensity={0.5} />

      <LabTable />
      <BunsenBurner heatingOn={heatingOn} />
      <TripodStand />
      <BeakerWithSubstance temperature={temperature} state={state} heatingOn={heatingOn} />
      <SteamVapor active={state === "Steam" && heatingOn} />

      {/* Labels */}
      <Text position={[-1.2, 2.8, 0]} fontSize={0.15} color="#f8fafc" anchorX="center">
        Heating Curve Experiment
      </Text>

      <Text position={[0, -0.3, 0.8]} fontSize={0.1} color="#94a3b8" anchorX="center">
        Bunsen Burner
      </Text>

      <Text position={[0.9, 1.8, 0]} fontSize={0.1} color="#94a3b8" anchorX="left">
        Thermometer
      </Text>

      <Text position={[-0.6, 1.8, 0]} fontSize={0.12} color="#f8fafc" anchorX="center">
        {state}
      </Text>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={3}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 1.2, 0]}
      />
    </>
  )
}

export function HeatingCurveSim({
  heatRate,
  totalTime,
}: {
  heatRate: number
  totalTime: number
}) {
  const [heatingOn, setHeatingOn] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  // Simulate temperature change
  const rawTemp = -5 + heatRate * currentTime
  const temperature = Math.min(120, heatingOn ? rawTemp : Math.max(-5, rawTemp - 20))
  const state = temperature < 0 ? "Ice" : temperature < 100 ? "Water" : "Steam"

  // Auto-increment time when heating
  useMemo(() => {
    if (heatingOn && currentTime < totalTime) {
      const interval = setInterval(() => {
        setCurrentTime((t) => Math.min(t + 0.1, totalTime))
      }, 100)
      return () => clearInterval(interval)
    }
  }, [heatingOn, currentTime, totalTime])

  const reset = () => {
    setCurrentTime(0)
    setHeatingOn(false)
  }

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant={heatingOn ? "destructive" : "secondary"}
          onClick={() => setHeatingOn((v) => !v)}
        >
          {heatingOn ? "🔥 Stop Heating" : "🔥 Start Heating"}
        </Button>
        <Button size="sm" variant="outline" onClick={reset}>
          Reset
        </Button>
        <Badge variant="outline" className="gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          Heat rate: {heatRate}°C/min
        </Badge>
        <Badge variant="outline">
          Time: {currentTime.toFixed(1)} / {totalTime} min
        </Badge>
      </div>

      {/* Measurements */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="secondary"
          className={
            state === "Ice"
              ? "bg-blue-500/20"
              : state === "Water"
                ? "bg-cyan-500/20"
                : "bg-green-500/20"
          }
        >
          <span className="mr-1">
            {state === "Ice" ? "🧊" : state === "Water" ? "💧" : "☁️"}
          </span>
          {state}: {temperature.toFixed(1)}°C
        </Badge>
        {state === "Steam" && (
          <Badge variant="outline" className="bg-green-500/20">
            Boiling point reached!
          </Badge>
        )}
      </div>

      {/* 3D Viewport */}
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden flex-1 min-h-[400px]">
        <Canvas shadows camera={{ position: [3, 3, 5], fov: 45 }}>
          <HeatingScene temperature={temperature} heatingOn={heatingOn} state={state} />
        </Canvas>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border border-border/60 bg-primary/5 p-3 text-sm">
        <p className="text-muted-foreground">
          <strong>Heating Curve:</strong> Watch real-time phase changes as heat is applied.
          <span className={state === "Ice" ? "text-blue-400 ml-1" : state === "Water" ? "text-cyan-400 ml-1" : "text-green-400 ml-1"}>
            {heatingOn
              ? state === "Ice"
                ? " 🔥 Heating ice... watch ice cubes shrink and shake as they melt!"
                : state === "Water"
                  ? temperature < 50
                    ? " 🫧 Water warming up... small bubbles forming at bottom!"
                    : temperature < 90
                      ? " 💨 Getting hotter... more bubbles rising faster!"
                      : " 🌡️ Almost boiling... bubbles becoming vigorous!"
                  : " ♨️ BOILING! Rapid bubble formation - water turning to steam!"
              : state === "Ice"
                ? " 🧊 Ice frozen solid. Click 'Start Heating' to begin."
                : state === "Water"
                  ? " 💧 Liquid water. Continue heating to reach boiling point."
                  : " ☁️ Steam/gas phase. Water is evaporating rapidly!"}
          </span>
        </p>
      </div>
    </div>
  )
}
