"use client"

import { useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import * as THREE from "three"

// Advanced Eureka Can with detailed glass and spout
function EurekaCan({ waterLevel, isOverflowing }: { waterLevel: number; isOverflowing: boolean }) {
  const waterRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (waterRef.current && isOverflowing) {
      // Water ripple effect when overflowing
      const time = state.clock.elapsedTime
      waterRef.current.position.y = 0.6 + waterLevel / 2 + Math.sin(time * 3) * 0.01
    }
  })

  return (
    <group position={[-1.2, 0, 0]}>
      {/* Main can body - glass cylinder with thickness */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.8, 0.7, 2.4, 32, 1, true]} />
        <meshPhysicalMaterial
          color="#e2e8f0"
          metalness={0.1}
          roughness={0.05}
          transmission={0.9}
          thickness={0.1}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner water */}
      <mesh ref={waterRef} position={[0, 0.6 + waterLevel / 2, 0]}>
        <cylinderGeometry args={[0.68, 0.68, waterLevel, 32]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.7} />
      </mesh>

      {/* Water surface with animation */}
      <mesh position={[0, 0.6 + waterLevel, 0]}>
        <cylinderGeometry args={[0.68, 0.68, 0.02, 32]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.5} />
      </mesh>

      {/* Metal base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.1, 32]} />
        <meshStandardMaterial color="#475569" metalness={0.6} />
      </mesh>

      {/* Metal rim */}
      <mesh position={[0, 2.35, 0]}>
        <torusGeometry args={[0.8, 0.06, 12, 48]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} />
      </mesh>

      {/* Spout with curved shape */}
      <group position={[0.85, 2.1, 0]} rotation={[0, 0, Math.PI / 5]}>
        {/* Spout body */}
        <mesh>
          <cylinderGeometry args={[0.1, 0.14, 0.5, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.5} />
        </mesh>
        {/* Spout opening */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.1, 16]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>

      {/* Overflow level indicator line */}
      <mesh position={[0, 1.2, 0.78]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.04, 0.02, 0.05]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0.4, 1.2, 0.78]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.02, 0.02]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* Labels */}
      <Text position={[0, 2.6, 0]} fontSize={0.12} color="#f8fafc" anchorX="center">
        Eureka Can
      </Text>
      <Text position={[0.9, 1.2, 0.9]} fontSize={0.1} color="#ef4444" anchorX="left">
        Overflow
      </Text>
    </group>
  )
}

// Advanced collection beaker with graduated markings
function GraduatedBeaker({ fillLevel, maxVolume }: { fillLevel: number; maxVolume: number }) {
  const actualFill = Math.min(fillLevel, 1.2)
  const fillPercent = (fillLevel / maxVolume) * 100

  return (
    <group position={[1.5, 0, 0.5]}>
      {/* Glass body */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.5, 0.4, 1.5, 32, 1, true]} />
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

      {/* Glass bottom */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 32]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.5} />
      </mesh>

      {/* Rim */}
      <mesh position={[0, 1.5, 0]}>
        <torusGeometry args={[0.5, 0.04, 10, 40]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      {/* Collected water with realistic look */}
      {actualFill > 0 && (
        <>
          <mesh position={[0, 0.1 + actualFill / 2, 0]}>
            <cylinderGeometry args={[0.38, 0.38, actualFill, 32]} />
            <meshStandardMaterial color="#0ea5e9" transparent opacity={0.75} />
          </mesh>
          {/* Water surface */}
          <mesh position={[0, 0.1 + actualFill, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.015, 32]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} />
          </mesh>
        </>
      )}

      {/* Graduated markings every 20ml */}
      {[0.2, 0.4, 0.6, 0.8, 1.0, 1.2].map((h, i) => (
        <group key={i}>
          <mesh position={[0.45, h, 0]} rotation={[0, 0, Math.PI / 2]}>
            <boxGeometry args={[0.08, 0.015, 0.02]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
          <Text position={[0.58, h, 0]} fontSize={0.06} color="#475569" anchorX="left">
            {(i + 1) * 20}ml
          </Text>
        </group>
      ))}

      {/* Beaker label */}
      <Text position={[0, 1.7, 0]} fontSize={0.1} color="#f8fafc" anchorX="center">
        Collection Beaker
      </Text>

      {/* Fill level indicator */}
      {actualFill > 0 && (
        <Text position={[0, 0.1 + actualFill + 0.15, 0]} fontSize={0.09} color="#0ea5e9" anchorX="center">
          {fillPercent.toFixed(0)}ml
        </Text>
      )}
    </group>
  )
}

// Professional retort stand with clamp
function RetortStand({ height = 4 }: { height?: number }) {
  return (
    <group position={[-1.2, 0, -0.8]}>
      {/* Heavy base */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.2, 0.3, 0.8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Base feet */}
      <mesh position={[-0.5, 0.05, 0.3]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.5, 0.05, 0.3]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[-0.5, 0.05, -0.3]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.5, 0.05, -0.3]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Vertical rod */}
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, height, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} />
      </mesh>

      {/* Clamp boss */}
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.2, 16]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Clamp arm */}
      <mesh position={[0.3, 3.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 16]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>

      {/* Clamp jaws */}
      <mesh position={[0.6, 3.3, 0]}>
        <boxGeometry args={[0.1, 0.04, 0.15]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0.6, 3.1, 0]}>
        <boxGeometry args={[0.1, 0.04, 0.15]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  )
}

// Advanced spring balance with realistic spring animation
function AdvancedSpringBalance({
  weight,
  maxWeight = 5,
}: {
  weight: number
  maxWeight?: number
}) {
  const springRef = useRef<THREE.Group>(null)
  const scalePercent = Math.min(weight / maxWeight, 1)
  const springExtension = scalePercent * 0.4

  useFrame(() => {
    if (springRef.current) {
      // Subtle oscillation when weight changes
      springRef.current.position.y = 2.2 - springExtension + Math.sin(Date.now() / 200) * 0.002
    }
  })

  return (
    <group position={[-0.6, 0, -0.8]}>
      {/* Main body casing */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.35, 1.8, 0.15]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Front scale plate */}
      <mesh position={[0, 2.5, 0.08]}>
        <boxGeometry args={[0.3, 1.6, 0.02]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Scale markings - Newtons */}
      {Array.from({ length: 11 }, (_, i) => (
        <group key={i}>
          <mesh position={[0.12, 1.8 + i * 0.14, 0.09]}>
            <boxGeometry args={[0.04, 0.008, 0.005]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
          <Text position={[0.18, 1.8 + i * 0.14, 0.1]} fontSize={0.05} color="#1e293b" anchorX="left">
            {i * (maxWeight / 10)}N
          </Text>
        </group>
      ))}

      {/* Red pointer */}
      <mesh position={[-0.08, 1.8 + scalePercent * 1.4, 0.1]}>
        <boxGeometry args={[0.18, 0.025, 0.01]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.3} />
      </mesh>

      {/* Pointer pivot */}
      <mesh position={[-0.15, 1.8 + scalePercent * 1.4, 0.09]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 16]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Top hook for stand */}
      <mesh position={[0, 3.45, 0]}>
        <torusGeometry args={[0.06, 0.02, 8, 24]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>

      {/* Animated spring */}
      <group ref={springRef} position={[0, 2.2 - springExtension, 0]}>
        {/* Coiled spring visualization */}
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} position={[0, i * 0.03, 0]}>
            <torusGeometry args={[0.04, 0.008, 6, 16]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
        ))}
      </group>

      {/* Bottom hook for object */}
      <mesh position={[0, 1.85 - springExtension, 0]}>
        <torusGeometry args={[0.05, 0.012, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Digital readout */}
      <Text position={[0.5, 2.5, 0]} fontSize={0.12} color="#f59e0b" anchorX="left">
        {weight.toFixed(3)} N
      </Text>
    </group>
  )
}

// Solid body with material-specific properties
function AdvancedSolidBody({
  volumeCm3,
  massG,
  immersed,
  position,
}: {
  volumeCm3: number
  massG: number
  immersed: boolean
  position: [number, number, number]
}) {
  const size = Math.pow(volumeCm3, 1 / 3) / 10
  const density = massG / volumeCm3

  // Material properties based on density
  let materialProps = {
    color: "#f59e0b",
    metalness: 0.3,
    roughness: 0.4,
    name: "Unknown",
  }

  if (density > 10) {
    materialProps = { color: "#94a3b8", metalness: 0.9, roughness: 0.2, name: "Lead" }
  } else if (density > 8) {
    materialProps = { color: "#64748b", metalness: 0.8, roughness: 0.3, name: "Steel/Iron" }
  } else if (density > 7) {
    materialProps = { color: "#b45309", metalness: 0.7, roughness: 0.25, name: "Brass" }
  } else if (density > 2.5) {
    materialProps = { color: "#d97706", metalness: 0.6, roughness: 0.3, name: "Copper" }
  } else if (density > 2) {
    materialProps = { color: "#22c55e", metalness: 0.5, roughness: 0.35, name: "Aluminum" }
  } else if (density > 1) {
    materialProps = { color: "#a8a29e", metalness: 0.2, roughness: 0.5, name: "Plastic" }
  }

  return (
    <group position={position}>
      {/* Connection string to balance */}
      <line>
        <bufferGeometry
          attach="geometry"
          setFromPoints={[new THREE.Vector3(0, size / 2, 0), new THREE.Vector3(0, 1.3, 0)]}
        />
        <lineBasicMaterial color="#cbd5e1" linewidth={2} />
      </line>

      {/* The solid body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color={materialProps.color}
          metalness={materialProps.metalness}
          roughness={materialProps.roughness}
        />
      </mesh>

      {/* Material label */}
      <Text position={[size / 2 + 0.2, 0.2, 0]} fontSize={0.09} color="#f8fafc" anchorX="left">
        {materialProps.name}
      </Text>

      {/* Mass label */}
      <Text position={[size / 2 + 0.2, 0, 0]} fontSize={0.08} color="#fbbf24" anchorX="left">
        {massG}g
      </Text>

      {/* Volume label */}
      <Text position={[size / 2 + 0.2, -0.2, 0]} fontSize={0.07} color="#94a3b8" anchorX="left">
        {volumeCm3}cm³
      </Text>

      {/* Density indicator */}
      <Text position={[0, -size / 2 - 0.2, 0]} fontSize={0.08} color="#38bdf8" anchorX="center">
        ρ = {density.toFixed(2)} g/cm³
      </Text>

      {/* Immersion effect - water line on object */}
      {immersed && (
        <mesh position={[0, 0, size / 2 + 0.02]}>
          <circleGeometry args={[0.06, 16]} />
          <meshBasicMaterial color="#0ea5e9" />
        </mesh>
      )}
    </group>
  )
}

// Animated water flow from spout
function AnimatedWaterFlow({ active, volume }: { active: boolean; volume: number }) {
  const flowRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!flowRef.current || !active) return
    const time = state.clock.elapsedTime
    // Pulsing water stream
    flowRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      mesh.scale.x = 1 + Math.sin(time * 10 + i) * 0.1
      mesh.scale.z = 1 + Math.cos(time * 8 + i) * 0.1
    })
  })

  if (!active) return null

  return (
    <group ref={flowRef}>
      {/* Main stream */}
      <mesh position={[0.35, 1.4, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.06, 0.08, 0.9, 12]} />
        <meshStandardMaterial color="#0ea5e9" transparent opacity={0.7} />
      </mesh>
      {/* Stream segments for animation */}
      {[0, 0.2, 0.4, 0.6].map((offset, i) => (
        <mesh key={i} position={[0.35 + offset * 0.5, 1.4 - offset * 0.5, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <cylinderGeometry args={[0.04, 0.06, 0.25, 8]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// Splash effect when water hits beaker
function SplashEffect({ active }: { active: boolean }) {
  const splashRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!splashRef.current || !active) return
    const time = state.clock.elapsedTime
    splashRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      // Droplets bounce
      mesh.position.y = 0.5 + Math.abs(Math.sin(time * 5 + i)) * 0.2
      mesh.position.x = (i - 2) * 0.05 + Math.sin(time * 3 + i) * 0.02
    })
  })

  if (!active) return null

  return (
    <group ref={splashRef} position={[1.5, 0.3, 0.5]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[(i - 2) * 0.06, 0.5, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// Upthrust force arrow visualization
function ForceArrows({ upthrust, weight, immersed }: { upthrust: number; weight: number; immersed: boolean }) {
  if (!immersed) return null

  const arrowScale = Math.min(upthrust / 2, 0.5)

  return (
    <group position={[-1.2, 1, 0]}>
      {/* Upthrust arrow (upward) */}
      <group position={[0, 0.3, 0]}>
        <mesh position={[0, arrowScale / 2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, arrowScale, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, arrowScale, 0]}>
          <coneGeometry args={[0.06, 0.12, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.3} />
        </mesh>
        <Text position={[0.15, arrowScale / 2, 0]} fontSize={0.08} color="#22c55e" anchorX="left">
          Upthrust
        </Text>
      </group>

      {/* Weight arrow (downward) */}
      <group position={[0.3, 0, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, -0.5, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.06, 0.12, 8]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        <Text position={[0.15, -0.25, 0]} fontSize={0.08} color="#ef4444" anchorX="left">
          Weight
        </Text>
      </group>
    </group>
  )
}

// Lab bench surface
function LabBench() {
  return (
    <group>
      {/* Main surface */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 5]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Edge trim */}
      <mesh position={[0, -0.1, 2.45]}>
        <boxGeometry args={[8, 0.08, 0.1]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, -0.1, -2.45]}>
        <boxGeometry args={[8, 0.08, 0.1]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[3.95, -0.1, 0]}>
        <boxGeometry args={[0.1, 0.08, 5]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[-3.95, -0.1, 0]}>
        <boxGeometry args={[0.1, 0.08, 5]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  )
}

// Main 3D scene
type SceneProps = {
  massG: number
  volumeCm3: number
  immersed: boolean
  upthrust: number
  weight: number
}

function AdvancedArchimedesScene({ massG, volumeCm3, immersed, upthrust, weight }: SceneProps) {
  const { camera } = useThree()
  const bodyRef = useRef<THREE.Group>(null)

  useMemo(() => {
    camera.position.set(3, 3.5, 6)
    camera.lookAt(0, 1.2, 0)
  }, [camera])

  // Water level at overflow point
  const waterLevel = 1.2

  // Target Y position for the body
  const targetY = immersed ? 0.75 : 2.3

  useFrame(() => {
    if (bodyRef.current) {
      // Smooth animation with slight oscillation when submerged
      const baseY = THREE.MathUtils.lerp(bodyRef.current.position.y, targetY, 0.08)
      const oscillation = immersed ? Math.sin(Date.now() / 500) * 0.005 : 0
      bodyRef.current.position.y = baseY + oscillation
    }
  })

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.3} castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-5, 8, -3]} intensity={0.4} />
      <pointLight position={[0, 4, 2]} intensity={0.5} color="#60a5fa" />

      {/* Lab environment */}
      <LabBench />

      {/* Equipment */}
      <EurekaCan waterLevel={waterLevel} isOverflowing={immersed} />
      <GraduatedBeaker fillLevel={immersed ? volumeCm3 : 0} maxVolume={volumeCm3 * 1.2} />
      <RetortStand height={4} />
      <AdvancedSpringBalance weight={immersed ? weight - upthrust : weight} maxWeight={5} />

      {/* The test object - positioned relative to balance */}
      <group ref={bodyRef} position={[-0.6, targetY, -0.8]}>
        <AdvancedSolidBody
          volumeCm3={volumeCm3}
          massG={massG}
          immersed={immersed}
          position={[0, 0, 0]}
        />
      </group>

      {/* Water flow effects */}
      <AnimatedWaterFlow active={immersed} volume={volumeCm3} />
      <SplashEffect active={immersed} />

      {/* Force visualization */}
      <ForceArrows upthrust={upthrust} weight={weight} immersed={immersed} />

      {/* Labels and annotations */}
      <Text position={[0, 3.5, 0]} fontSize={0.18} color="#f8fafc" anchorX="center" fontWeight="bold">
        Archimedes' Principle - Density Measurement
      </Text>

      <Text position={[-1.2, 0.1, 1]} fontSize={0.1} color="#94a3b8" anchorX="center">
        Overflow Can (Eureka Can)
      </Text>

      <Text position={[1.5, 0.1, 1.2]} fontSize={0.1} color="#94a3b8" anchorX="center">
        Measuring Beaker
      </Text>

      {/* Displaced volume indicator */}
      {immersed && (
        <Text position={[1.5, 0.8, 1.2]} fontSize={0.11} color="#0ea5e9" anchorX="center">
          Displaced: {volumeCm3} cm³
        </Text>
      )}

      {/* Principle formula */}
      <Text position={[2.5, 2.5, 0]} fontSize={0.09} color="#fbbf24" anchorX="center" maxWidth={1.5}>
        Upthrust = Weight of displaced fluid{"\n"}
        ρ_object = m / V
      </Text>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={3}
        maxDistance={12}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1.5, 0]}
      />
    </>
  )
}

export function ArchimedesDensitySim({
  massG,
  volumeCm3,
}: {
  massG: number
  volumeCm3: number
}) {
  const [immersed, setImmersed] = useState(false)

  // Physics calculations
  const density = massG / Math.max(volumeCm3, 0.0001)
  const upthrustN = (volumeCm3 / 1000000) * 1000 * 9.8
  const weightAirN = (massG / 1000) * 9.8
  const apparentWeightN = Math.max(0, weightAirN - upthrustN)

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          size="sm"
          variant={immersed ? "default" : "secondary"}
          onClick={() => setImmersed((v) => !v)}
          className="gap-2"
        >
          {immersed ? "⬆️ Lift Body" : "⬇️ Immerse Body"}
        </Button>
        <Badge variant="outline" className="gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Mass: {massG}g
        </Badge>
        <Badge variant="outline" className="gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          Volume: {volumeCm3}cm³
        </Badge>
        <Badge variant="secondary">Density: {density.toFixed(2)} g/cm³</Badge>
      </div>

      {/* Real-time measurements */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="rounded-lg border border-border/60 bg-card/40 p-2">
          <div className="text-xs text-muted-foreground">Weight in Air</div>
          <div className="text-lg font-semibold text-amber-400">{weightAirN.toFixed(3)} N</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-2">
          <div className="text-xs text-muted-foreground">Apparent Weight</div>
          <div className="text-lg font-semibold text-cyan-400">
            {immersed ? apparentWeightN.toFixed(3) : "--"} N
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-2">
          <div className="text-xs text-muted-foreground">Upthrust (Buoyancy)</div>
          <div className="text-lg font-semibold text-green-400">
            {immersed ? upthrustN.toFixed(3) : "--"} N
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-2">
          <div className="text-xs text-muted-foreground">Displaced Volume</div>
          <div className="text-lg font-semibold text-blue-400">
            {immersed ? `${volumeCm3} cm³` : "--"}
          </div>
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden flex-1 min-h-[450px]">
        <Canvas shadows camera={{ position: [3, 3.5, 6], fov: 45 }}>
          <AdvancedArchimedesScene
            massG={massG}
            volumeCm3={volumeCm3}
            immersed={immersed}
            upthrust={upthrustN}
            weight={weightAirN}
          />
        </Canvas>
      </div>

      {/* Educational content */}
      <div className="rounded-lg border border-border/60 bg-primary/5 p-3 text-sm">
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Archimedes' Principle:</strong>{" "}
          When a body is fully immersed in a fluid, it experiences an upward buoyant force (upthrust) equal to the weight of the fluid displaced.
          <span className={immersed ? "text-green-400" : "text-amber-400 ml-1"}>
            {immersed ? (
              <>
                ✅ Object immersed! Water overflows into the beaker.{" "}
                <strong>Upthrust = {upthrustN.toFixed(3)}N</strong> = Weight of {volumeCm3}cm³ water.{" "}
                <strong>Density ρ = {massG}g / {volumeCm3}cm³ = {density.toFixed(2)} g/cm³</strong>
              </>
            ) : (
              <>⬇️ Click "Immerse Body" to see the principle in action with animated water flow and force visualization.</>
            )}
          </span>
        </p>
      </div>
    </div>
  )
}
