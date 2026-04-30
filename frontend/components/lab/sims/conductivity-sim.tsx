"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMemo, useRef, useState } from "react"
import { RotateCcw, Zap } from "lucide-react"
import * as THREE from "three"

type Setup = { battery: boolean; bulb: boolean; electrodes: boolean; beaker: boolean }

// Solution data with colors and conductivity
const solutionData: Record<string, { conductivity: number; color: string; label: string }> = {
  "Distilled Water": { conductivity: 0.03, color: "#e0f7fa", label: "Pure Water (Non-electrolyte)" },
  "Sugar Solution": { conductivity: 0.05, color: "#fff3e0", label: "Sugar (Covalent, no ions)" },
  "NaCl Solution": { conductivity: 0.9, color: "#e3f2fd", label: "NaCl (Strong electrolyte)" },
  Vinegar: { conductivity: 0.45, color: "#f3e5f5", label: "Vinegar (Weak electrolyte)" },
  HCl: { conductivity: 1, color: "#ffebee", label: "HCl (Strong acid, high ions)" },
  NaOH: { conductivity: 0.95, color: "#e8f5e9", label: "NaOH (Strong base, high ions)" },
}

// Animated electron flow showing current through wires
function ElectronFlow({ active, intensity }: { active: boolean; intensity: number }) {
  const electronsRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!electronsRef.current || !active || intensity <= 0) return
    const t = clock.elapsedTime * (1 + intensity * 2)

    electronsRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const offset = i * 0.15
      const cycle = ((t + offset) % 1)

      // Path: Battery (-) -> Left electrode -> Solution -> Right electrode -> Bulb -> Battery (+)
      let x, y, z, glowScale
      if (cycle < 0.3) {
        // Wire from battery to left electrode
        const segment = cycle / 0.3
        x = -1.05 + segment * 0.95
        y = 0.45 + segment * 0.3
        z = -0.3
      } else if (cycle < 0.5) {
        // Through solution between electrodes
        const segment = (cycle - 0.3) / 0.2
        x = -0.1 + segment * 0.2
        y = 0.75 + Math.sin(segment * Math.PI) * 0.05
        z = -0.25
      } else if (cycle < 0.7) {
        // Wire from right electrode to bulb
        const segment = (cycle - 0.5) / 0.2
        x = 0.1 + segment * 0.9
        y = 0.75 + segment * 0.35
        z = -0.3
      } else {
        // Return wire from bulb to battery
        const segment = (cycle - 0.7) / 0.3
        x = 1.0 - segment * 2.05
        y = 1.0 - segment * 0.55
        z = -0.3
      }

      mesh.position.set(x, y, z)
      glowScale = 1 + Math.sin(t * 10 + i) * 0.2
      mesh.scale.setScalar(glowScale)

      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1 + intensity
    })
  })

  if (!active || intensity <= 0) return null

  return (
    <group ref={electronsRef}>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.018, 10, 10]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </group>
  )
}

// Ion animation in solution showing charge carriers
function IonCloud({ active, intensity, solutionColor }: { active: boolean; intensity: number; solutionColor: string }) {
  const cationsRef = useRef<THREE.Group>(null)
  const anionsRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!active || intensity <= 0) return
    const t = clock.elapsedTime

    // Cations (positive ions) - move toward negative electrode (left)
    if (cationsRef.current) {
      cationsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh
        const phase = (t * (0.2 + intensity * 0.5) + i * 0.13) % 1
        mesh.position.x = -0.15 + phase * 0.25
        mesh.position.y = 0.6 + ((i % 5) * 0.06) + Math.sin(t * 2 + i) * 0.02
        mesh.position.z = -0.3 + ((i % 3) - 1) * 0.04
        mesh.rotation.y = t * 0.5

        const mat = mesh.material as THREE.MeshStandardMaterial
        mat.emissiveIntensity = 0.3 + intensity * 0.7
        mat.opacity = 0.4 + intensity * 0.4
      })
    }

    // Anions (negative ions) - move toward positive electrode (right)
    if (anionsRef.current) {
      anionsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh
        const phase = (t * (0.2 + intensity * 0.5) + i * 0.13) % 1
        mesh.position.x = 0.1 - phase * 0.25
        mesh.position.y = 0.6 + ((i % 5) * 0.06) + Math.sin(t * 2 + i + 2) * 0.02
        mesh.position.z = -0.3 + ((i % 3) - 1) * 0.04
        mesh.rotation.y = -t * 0.5

        const mat = mesh.material as THREE.MeshStandardMaterial
        mat.emissiveIntensity = 0.3 + intensity * 0.7
        mat.opacity = 0.4 + intensity * 0.4
      })
    }
  })

  if (!active || intensity <= 0) return null

  return (
    <>
      {/* Cations (+) - shown in warm colors */}
      <group ref={cationsRef}>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i} position={[0, 0.6, -0.3]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <meshStandardMaterial
              color="#ff6b6b"
              emissive="#ff4757"
              emissiveIntensity={0.3}
              transparent
              opacity={0}
            />
          </mesh>
        ))}
      </group>
      {/* Anions (-) - shown in cool colors */}
      <group ref={anionsRef}>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i} position={[0, 0.6, -0.3]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshStandardMaterial
              color="#4ecdc4"
              emissive="#22d3ee"
              emissiveIntensity={0.3}
              transparent
              opacity={0}
            />
          </mesh>
        ))}
      </group>
    </>
  )
}

// Glowing bulb with intensity-based brightness
function LightBulb({ active, intensity }: { active: boolean; intensity: number }) {
  const bulbRef = useRef<THREE.Group>(null)
  const filamentRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!bulbRef.current || !active) return

    // Flicker effect based on intensity
    if (intensity > 0) {
      const flicker = 1 + Math.sin(clock.elapsedTime * (8 + intensity * 8)) * 0.06
      bulbRef.current.scale.setScalar(flicker)
    }
  })

  if (!active) return null

  const glowColor = intensity > 0.7 ? "#fef3c7" : intensity > 0.2 ? "#fde68a" : "#d1d5db"
  const emissiveIntensity = intensity * 3

  return (
    <group ref={bulbRef} position={[1.0, 1.15, -0.3]}>
      {/* Bulb glass */}
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshPhysicalMaterial
          color="#e2e8f0"
          metalness={0.1}
          roughness={0.05}
          transmission={0.9}
          thickness={0.04}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Filament glow */}
      <mesh ref={filamentRef} scale={[intensity * 1.5, intensity * 1.5, intensity * 1.5]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={glowColor}
          emissive="#facc15"
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Bulb base */}
      <mesh position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.2, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Screw threads */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, -0.28 + i * 0.03, 0]}>
          <torusGeometry args={[0.095 - i * 0.005, 0.008, 6, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

// Battery with +/- terminals
function Battery({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <group position={[-1.05, 0, -0.3]}>
      {/* Battery body */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.55, 0.4, 0.3]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Positive terminal (+) */}
      <mesh position={[0.28, 0.68, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.08, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} />
      </mesh>
      {/* Negative terminal (-) */}
      <mesh position={[-0.28, 0.68, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.08, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} />
      </mesh>
      {/* Battery label */}
      <mesh position={[0, 0.45, 0.16]}>
        <planeGeometry args={[0.4, 0.2]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  )
}

// Wire connections between components
function Wires({ setup, active }: { setup: Setup; active: boolean }) {
  if (!setup.battery || !setup.bulb) return null

  const wireColor = active ? "#fbbf24" : "#64748b"
  const wireEmissive = active ? "#f59e0b" : "#000000"

  return (
    <>
      {/* Wire from battery (+) to left electrode */}
      {setup.electrodes && (
        <mesh position={[-0.5, 0.7, -0.3]}>
          <cylinderGeometry args={[0.008, 0.008, 0.7, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={wireColor}
            emissive={wireEmissive}
            emissiveIntensity={active ? 0.5 : 0}
            metalness={0.6}
          />
        </mesh>
      )}
      {/* Wire from right electrode to bulb */}
      {setup.electrodes && (
        <mesh position={[0.55, 0.95, -0.3]}>
          <cylinderGeometry args={[0.008, 0.008, 0.6, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={wireColor}
            emissive={wireEmissive}
            emissiveIntensity={active ? 0.5 : 0}
            metalness={0.6}
          />
        </mesh>
      )}
      {/* Wire from bulb back to battery (-) */}
      <mesh position={[0, 0.55, -0.3]}>
        <cylinderGeometry args={[0.008, 0.008, 2.1, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={wireColor}
          emissive={wireEmissive}
          emissiveIntensity={active ? 0.5 : 0}
          metalness={0.6}
        />
      </mesh>
    </>
  )
}

// Electrodes dipping into solution
function Electrodes({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <group>
      {/* Left electrode (negative) */}
      <group position={[-0.1, 0.6, -0.25]}>
        <mesh>
          <cylinderGeometry args={[0.015, 0.015, 0.5, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Dip mark */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.12, 12]} />
          <meshStandardMaterial color="#64748b" metalness={0.6} />
        </mesh>
      </group>
      {/* Right electrode (positive) */}
      <group position={[0.1, 0.6, -0.25]}>
        <mesh>
          <cylinderGeometry args={[0.015, 0.015, 0.5, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Dip mark */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.12, 12]} />
          <meshStandardMaterial color="#64748b" metalness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

// Beaker with solution
function Beaker({ active, solutionColor }: { active: boolean; solutionColor: string }) {
  if (!active) return null

  return (
    <group position={[0, 0, -0.3]}>
      {/* Glass body */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.36, 0.9, 26, 1, true]} />
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
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.32, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
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
      <mesh position={[0, 1.4, 0]}>
        <torusGeometry args={[0.32, 0.006, 6, 26]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      {/* Solution */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.27, 0.29, 0.48, 24]} />
        <meshPhysicalMaterial
          color={solutionColor}
          metalness={0.1}
          roughness={0.1}
          transmission={0.6}
          thickness={0.05}
          transparent
          opacity={0.7}
          emissive={solutionColor}
          emissiveIntensity={0.1}
        />
      </mesh>
      {/* Meniscus */}
      <mesh position={[0, 0.96, 0]}>
        <torusGeometry args={[0.24, 0.008, 6, 24]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color={solutionColor} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

// Circuit status indicator
function CircuitStatus({ ready, intensity }: { ready: boolean; intensity: number }) {
  if (!ready) return null

  const statusText = intensity > 0.7 ? "STRONG CONDUCTOR" : intensity > 0.2 ? "WEAK CONDUCTOR" : "NON-CONDUCTOR"
  const statusColor = intensity > 0.7 ? "#22c55e" : intensity > 0.2 ? "#f59e0b" : "#ef4444"

  return (
    <group position={[0, 1.85, -0.3]}>
      <Text fontSize={0.06} color={statusColor} anchorX="center" fontWeight="bold">
        {statusText}
      </Text>
      <Text position={[0, -0.08, 0]} fontSize={0.04} color="#94a3b8" anchorX="center">
        {intensity > 0 ? "Current flowing through solution" : "No ions to carry current"}
      </Text>
    </group>
  )
}

// Main 3D Scene
function Scene({
  setup,
  intensity,
  solutionColor,
  solutionName,
}: {
  setup: Setup
  intensity: number
  solutionColor: string
  solutionName: string
}) {
  const ready = setup.battery && setup.bulb && setup.electrodes && setup.beaker

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[1.0, 1.3, -0.3]} intensity={ready && intensity > 0 ? 1.5 : 0.2} color="#fde68a" />

      {/* Lab bench */}
      <mesh position={[0, 0.05, -0.32]} receiveShadow>
        <boxGeometry args={[4.0, 0.1, 1.8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Components */}
      <Battery active={setup.battery} />
      <Beaker active={setup.beaker} solutionColor={solutionColor} />
      <Electrodes active={setup.electrodes} />
      <LightBulb active={setup.bulb} intensity={ready ? intensity : 0} />
      <Wires setup={setup} active={ready && intensity > 0} />

      {/* Animated effects */}
      <ElectronFlow active={ready && intensity > 0} intensity={intensity} />
      <IonCloud active={ready && intensity > 0} intensity={intensity} solutionColor={solutionColor} />

      {/* Labels */}
      <Text position={[-1.05, 0.15, -0.3]} fontSize={0.04} color="#94a3b8" anchorX="center">
        BATTERY (-) (+)
      </Text>
      <Text position={[0, 0.2, 0.1]} fontSize={0.04} color="#94a3b8" anchorX="center">
        {solutionName}
      </Text>
      <Text position={[1.0, 0.75, -0.3]} fontSize={0.04} color="#94a3b8" anchorX="center">
        TEST BULB
      </Text>
      <Text position={[-0.1, 0.95, -0.15]} fontSize={0.03} color="#ef4444" anchorX="center">
        -
      </Text>
      <Text position={[0.1, 0.95, -0.15]} fontSize={0.03} color="#22c55e" anchorX="center">
        +
      </Text>

      {/* Status display */}
      <CircuitStatus ready={ready} intensity={intensity} />

      <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2.1} target={[0, 1, -0.3]} />
    </>
  )
}

// Main component
export function ConductivitySim({ setup }: { setup: Setup }) {
  const [solution, setSolution] = useState("Distilled Water")
  const ready = setup.battery && setup.bulb && setup.electrodes && setup.beaker

  const solutionInfo = solutionData[solution]
  const intensity = solutionInfo.conductivity
  const status = intensity > 0.7 ? "Strong electrolyte" : intensity > 0.2 ? "Weak electrolyte" : "Non-conductor"
  const statusColor = intensity > 0.7 ? "bg-green-500" : intensity > 0.2 ? "bg-yellow-500" : "bg-red-500"

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      {/* Status bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline" className="text-base">
          <Zap className="w-4 h-4 mr-1" />
          {solution}
        </Badge>
        <Badge variant="outline">Conductivity: {(intensity * 100).toFixed(0)}%</Badge>
        <div className={`px-3 py-1 rounded-full text-sm font-medium text-white ${statusColor}`}>
          {status}
        </div>
      </div>

      {/* Explanation */}
      <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm">
        <p className="font-medium text-blue-300 mb-1">How it works:</p>
        <p className="text-muted-foreground">
          1. Battery sends electrons through the circuit<br />
          2. Electrodes dip into the solution<br />
          3. <strong>Ions in solution</strong> carry current between electrodes<br />
          4. More ions = brighter bulb = better conductor
        </p>
      </div>

      {!ready && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
          Place all components: Battery, Beaker with solution, Electrodes, and Test Bulb to complete the circuit.
        </div>
      )}

      {/* Solution selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {Object.entries(solutionData).map(([name, data]) => (
          <Button
            key={name}
            disabled={!ready}
            variant={solution === name ? "default" : "outline"}
            onClick={() => setSolution(name)}
            className="text-left justify-start h-auto py-2"
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">{name}</span>
              <span className="text-xs opacity-70">
                {data.conductivity > 0.7 ? "Strong" : data.conductivity > 0.2 ? "Weak" : "None"} conduction
              </span>
            </div>
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="gap-2" onClick={() => setSolution("Distilled Water")}>
          <RotateCcw className="w-4 h-4" /> Reset
        </Button>
      </div>

      {/* 3D View */}
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[420px]">
        <Canvas camera={{ position: [0, 2.2, 4.5], fov: 50 }}>
          <Scene
            setup={setup}
            intensity={ready ? intensity : 0}
            solutionColor={solutionInfo.color}
            solutionName={solutionInfo.label}
          />
        </Canvas>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-400"></span>
          <span>Red = Cations (+) moving left</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
          <span>Cyan = Anions (-) moving right</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
          <span>Yellow = Electrons in wires</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-300"></span>
          <span>Bulb glows when current flows</span>
        </div>
      </div>
    </div>
  )
}
