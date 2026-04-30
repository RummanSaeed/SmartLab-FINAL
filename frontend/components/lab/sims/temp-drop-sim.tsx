"use client"

import { useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import * as THREE from "three"

type Solute = {
  id: string
  name: string
  typicalDeltaPer10g: number
  note: string
  crystalColor: string
}

const solutes: Solute[] = [
  { id: "nh4no3", name: "Ammonium nitrate (NH₄NO₃)", typicalDeltaPer10g: -3.5, note: "Strongly endothermic dissolution", crystalColor: "#ffffff" },
  { id: "nh4cl", name: "Ammonium chloride (NH₄Cl)", typicalDeltaPer10g: -1.5, note: "Moderately endothermic dissolution", crystalColor: "#f8fafc" },
  { id: "kno3", name: "Potassium nitrate (KNO₃)", typicalDeltaPer10g: -2.0, note: "Endothermic dissolution", crystalColor: "#e2e8f0" },
]

type TempDropSetup = {
  beaker: boolean
  thermometer: boolean
  stirrer: boolean
  solute: boolean
}

// Cold vapor effect when temperature drops
function ColdVapor({ active, intensity }: { active: boolean; intensity: number }) {
  const vaporRef = useRef<THREE.Group>(null)

  const particleData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      x: (Math.random() - 0.5) * 0.4,
      z: -0.3 + (Math.random() - 0.5) * 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.3,
    }))
  }, [])

  useFrame(({ clock }) => {
    if (!vaporRef.current || !active || intensity <= 0) return

    vaporRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const data = particleData[i]
      const t = clock.elapsedTime * data.speed + data.phase

      const cycle = (t % 2) / 2
      mesh.position.y = 1.3 + cycle * 0.5
      mesh.position.x = data.x + Math.sin(t * 1.2) * 0.03
      mesh.position.z = data.z + Math.cos(t * 0.8) * 0.02

      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = intensity * 0.4 * (1 - cycle * 0.5)
    })
  })

  if (!active || intensity <= 0) return null

  return (
    <group ref={vaporRef}>
      {particleData.map((data, i) => (
        <mesh key={i} position={[data.x, 1.3, data.z]}>
          <sphereGeometry args={[0.015 + (i % 3) * 0.005, 8, 8]} />
          <meshStandardMaterial
            color="#bae6fd"
            transparent
            opacity={0}
            emissive="#7dd3fc"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

// Animated solute crystals that dissolve
function SoluteCrystals({ active, dissolving, crystalColor, mass }: { active: boolean; dissolving: boolean; crystalColor: string; mass: number }) {
  const crystalsRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!crystalsRef.current || !active) return

    // Rotation animation while dissolving
    if (dissolving) {
      crystalsRef.current.rotation.y = clock.elapsedTime * 0.5
      crystalsRef.current.position.y = 0.55 + Math.sin(clock.elapsedTime * 2) * 0.02
    }
  })

  if (!active) return null

  const crystalCount = Math.min(15, Math.max(5, Math.floor(mass / 2)))
  const opacity = dissolving ? 0.3 : 1
  const scale = dissolving ? 0.6 : 1

  return (
    <group ref={crystalsRef} position={[0.8, 0.55, -0.25]}>
      {Array.from({ length: crystalCount }).map((_, i) => {
        const x = ((i % 5) - 2) * 0.06
        const z = (Math.floor(i / 5) - 1) * 0.06
        const y = (i % 3) * 0.04
        return (
          <mesh
            key={i}
            position={[x, y, z]}
            scale={[scale, scale, scale]}
          >
            <boxGeometry args={[0.025, 0.025, 0.025]} />
            <meshStandardMaterial
              color={crystalColor}
              transparent
              opacity={opacity}
              roughness={0.4}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// Dissolving particles animation
function DissolvingParticles({ active, intensity, liquidLevel }: { active: boolean; intensity: number; liquidLevel: number }) {
  const particlesRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!particlesRef.current || !active || intensity <= 0) return
    const t = clock.elapsedTime * 2

    particlesRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const cycle = ((t + i * 0.1) % 1)
      const startY = 0.55
      const endY = 0.55 + liquidLevel

      mesh.position.y = startY + (endY - startY) * cycle
      mesh.position.x = (Math.random() - 0.5) * 0.3
      mesh.position.z = -0.3 + (Math.random() - 0.5) * 0.15

      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = intensity * 0.6 * (1 - cycle)
    })
  })

  if (!active || intensity <= 0) return null

  return (
    <group ref={particlesRef}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} position={[0, 0.55, -0.3]}>
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshStandardMaterial color="#f8fafc" transparent opacity={0} />
        </mesh>
      ))}
    </group>
  )
}

// Animated stirring rod
function StirringRod({ active, mixing }: { active: boolean; mixing: boolean }) {
  const rodRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!rodRef.current || !active) return

    if (mixing) {
      // Stirring motion - circular
      const t = clock.elapsedTime * 8
      rodRef.current.rotation.z = 0.35 + Math.sin(t) * 0.15
      rodRef.current.position.x = -0.42 + Math.cos(t) * 0.05
      rodRef.current.position.z = -0.2 + Math.sin(t) * 0.05
    }
  })

  if (!active) return null

  return (
    <group ref={rodRef} position={[-0.42, 1.0, -0.2]} rotation={[0, 0, 0.35]}>
      {/* Rod */}
      <mesh>
        <cylinderGeometry args={[0.018, 0.018, 1.05, 10]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.3} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.12, 10]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  )
}

// Realistic beaker with glass material
function Beaker({ active, liquidLevel, liquidColor, hasCrystals }: { active: boolean; liquidLevel: number; liquidColor: string; hasCrystals: boolean }) {
  if (!active) return null

  return (
    <group position={[0, 0, -0.3]}>
      {/* Glass body */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.36, 0.95, 26, 1, true]} />
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
      <mesh position={[0, 0.48, 0]}>
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
      <mesh position={[0, 1.42, 0]}>
        <torusGeometry args={[0.32, 0.006, 6, 26]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {/* Graduation marks */}
      {[0.6, 0.75, 0.9, 1.05, 1.2].map((y, i) => (
        <mesh key={i} position={[-0.26, y - 0.48, 0]}>
          <boxGeometry args={[0.04, 0.004, 0.004]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      ))}

      {/* Liquid */}
      {liquidLevel > 0 && (
        <>
          <mesh position={[0, 0.52 + liquidLevel / 2, 0]}>
            <cylinderGeometry args={[0.26, 0.3, liquidLevel, 22]} />
            <meshPhysicalMaterial
              color={liquidColor}
              metalness={0.1}
              roughness={0.1}
              transmission={0.6}
              thickness={0.05}
              transparent
              opacity={0.7}
              emissive={liquidColor}
              emissiveIntensity={0.12}
            />
          </mesh>
          {/* Meniscus */}
          <mesh position={[0, 0.52 + liquidLevel, 0]}>
            <torusGeometry args={[0.23, 0.008, 6, 22]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color={liquidColor} transparent opacity={0.5} />
          </mesh>
        </>
      )}

      {/* Undissolved crystals at bottom */}
      {hasCrystals && (
        <group position={[0, 0.52, 0]}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                ((i % 4) - 1.5) * 0.04,
                0.01,
                ((Math.floor(i / 4)) - 0.5) * 0.04
              ]}
            >
              <boxGeometry args={[0.02, 0.02, 0.02]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.5} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

// Thermometer with scale
function Thermometer({ active, temperature, mixed }: { active: boolean; temperature: number; mixed: boolean }) {
  const mercuryRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!mercuryRef.current || !active) return
    // Mercury flicker when temperature changing
    if (mixed) {
      const flicker = 1 + Math.sin(clock.elapsedTime * 5) * 0.02
      mercuryRef.current.scale.y = flicker
    }
  })

  if (!active) return null

  // Calculate mercury height based on temperature (15-40°C range)
  const tempPercent = (temperature - 15) / 25
  const mercuryHeight = 0.2 + tempPercent * 0.5

  // Color changes with temperature
  const mercuryColor = temperature < 20 ? "#3b82f6" : temperature > 30 ? "#ef4444" : "#22c55e"

  return (
    <group position={[0.38, 0.8, -0.25]}>
      {/* Glass tube */}
      <mesh>
        <cylinderGeometry args={[0.022, 0.022, 1.0, 12]} />
        <meshPhysicalMaterial
          color="#e2e8f0"
          metalness={0.1}
          roughness={0.05}
          transmission={0.85}
          thickness={0.04}
          transparent
          opacity={0.4}
        />
      </mesh>
      {/* Mercury column */}
      <mesh
        ref={mercuryRef}
        position={[0, -0.35 + mercuryHeight / 2, 0.01]}
      >
        <cylinderGeometry args={[0.012, 0.012, mercuryHeight, 10]} />
        <meshStandardMaterial
          color={mercuryColor}
          emissive={mercuryColor}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Bulb at bottom */}
      <mesh position={[0, -0.48, 0.01]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial
          color={mercuryColor}
          emissive={mercuryColor}
          emissiveIntensity={0.4}
        />
      </mesh>
      {/* Scale markings */}
      {[0.15, 0.25, 0.35, 0.45].map((y, i) => (
        <mesh key={i} position={[0.025, -0.45 + y, 0]}>
          <boxGeometry args={[0.008, 0.002, 0.003]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      ))}
    </group>
  )
}

// Solute container
function SoluteContainer({ active, crystalColor }: { active: boolean; crystalColor: string }) {
  if (!active) return null

  return (
    <group position={[1.0, 0, -0.25]}>
      {/* Container */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.4]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} />
      </mesh>
      {/* Label */}
      <mesh position={[0, 0.3, 0.21]}>
        <planeGeometry args={[0.3, 0.2]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  )
}

// Temperature display in 3D
function TempDisplay({ temperature, mixed }: { temperature: number; mixed: boolean }) {
  const tempColor = temperature < 20 ? "#3b82f6" : temperature > 30 ? "#ef4444" : "#22c55e"

  return (
    <group position={[0.65, 1.6, -0.3]}>
      <Text fontSize={0.08} color={tempColor} anchorX="center" fontWeight="bold">
        {temperature.toFixed(1)}°C
      </Text>
      <Text position={[0, -0.1, 0]} fontSize={0.04} color="#94a3b8" anchorX="center">
        {mixed ? (temperature < 25 ? "Temperature DROPPING" : "Temperature RISING") : "Ready to mix"}
      </Text>
    </group>
  )
}

function Scene({
  setup,
  mixed,
  liquidLevel,
  liquidColor,
  temperature,
  crystalColor,
  mass,
}: {
  setup: TempDropSetup
  mixed: boolean
  liquidLevel: number
  liquidColor: string
  temperature: number
  crystalColor: string
  mass: number
}) {
  const tempDrop = temperature < 25
  const coldIntensity = tempDrop ? (25 - temperature) / 10 : 0

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[0, 1.5, -0.3]} intensity={0.5} color={tempDrop ? "#60a5fa" : "#fbbf24"} />

      {/* Lab bench */}
      <mesh position={[0, 0.05, -0.32]} receiveShadow>
        <boxGeometry args={[3.5, 0.1, 1.6]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Beaker with solution */}
      <Beaker
        active={setup.beaker}
        liquidLevel={liquidLevel}
        liquidColor={liquidColor}
        hasCrystals={setup.solute && !mixed}
      />

      {/* Thermometer */}
      <Thermometer active={setup.thermometer} temperature={temperature} mixed={mixed} />

      {/* Stirring rod */}
      <StirringRod active={setup.stirrer} mixing={mixed} />

      {/* Solute container */}
      <SoluteContainer active={setup.solute} crystalColor={crystalColor} />

      {/* Solute crystals (before dissolving) */}
      <SoluteCrystals
        active={setup.solute && !mixed}
        dissolving={false}
        crystalColor={crystalColor}
        mass={mass}
      />

      {/* Dissolving particles animation */}
      <DissolvingParticles active={mixed} intensity={0.8} liquidLevel={liquidLevel} />

      {/* Cold vapor effect when temperature drops */}
      <ColdVapor active={mixed && tempDrop} intensity={coldIntensity} />

      {/* Temperature display */}
      <TempDisplay temperature={temperature} mixed={mixed} />

      {/* Labels */}
      <Text position={[0, 0.2, 0.1]} fontSize={0.04} color="#94a3b8" anchorX="center">
        Water
      </Text>
      <Text position={[1.0, 0.6, 0.1]} fontSize={0.04} color="#94a3b8" anchorX="center">
        Solute
      </Text>

      <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2.1} target={[0.3, 0.9, -0.3]} />
    </>
  )
}

export function TempDropSim({ setup }: { setup: TempDropSetup }) {
  const [soluteIdx, setSoluteIdx] = useState(0)
  const [waterMl, setWaterMl] = useState([50])
  const [massG, setMassG] = useState([10])
  const [initialTemp, setInitialTemp] = useState([25])
  const [mixed, setMixed] = useState(false)

  const solute = solutes[soluteIdx] || solutes[0]

  const finalTemp = useMemo(() => {
    if (!mixed) return initialTemp[0]
    const grams = massG[0]
    const delta = (grams / 10) * solute.typicalDeltaPer10g
    const dilutionFactor = Math.max(0.4, Math.min(1.6, 50 / Math.max(10, waterMl[0])))
    return Number((initialTemp[0] + delta * dilutionFactor).toFixed(1))
  }, [mixed, initialTemp, massG, solute.typicalDeltaPer10g, waterMl])

  const setupReady = setup.beaker && setup.thermometer && setup.stirrer && setup.solute
  const liquidLevel = Math.min(0.65, (waterMl[0] / 200) * 0.65 + 0.22)
  const liquidColor = mixed ? (finalTemp < initialTemp[0] ? "#38bdf8" : "#fb7185") : "#60a5fa"

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">Endothermic Reaction (Temperature Drop)</div>
          <Badge variant="outline">Temp-drop</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Dissolve a salt in water and observe cooling. Record initial and final temperature.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Controls</div>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Solute</div>
            <div className="flex flex-wrap gap-2">
              {solutes.map((s, idx) => (
                <Button key={s.id} size="sm" variant={idx === soluteIdx ? "default" : "outline"} onClick={() => setSoluteIdx(idx)}>
                  {s.name}
                </Button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">{solute.note}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Water</span>
              <span>{waterMl[0]} mL</span>
            </div>
            <Slider value={waterMl} min={20} max={200} step={10} onValueChange={setWaterMl} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Solute mass</span>
              <span>{massG[0]} g</span>
            </div>
            <Slider value={massG} min={5} max={30} step={1} onValueChange={setMassG} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Initial temperature</span>
              <span>{initialTemp[0]} °C</span>
            </div>
            <Slider value={initialTemp} min={15} max={40} step={1} onValueChange={setInitialTemp} />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setMixed(true)} disabled={mixed || !setupReady}>
              Dissolve & Mix
            </Button>
            <Button variant="outline" onClick={() => setMixed(false)}>
              Reset
            </Button>
          </div>

          {!setupReady && (
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
              Drag and place beaker, thermometer, stirrer, and solute container first.
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Observation</div>

          <div className="rounded-md bg-background/50 border border-border/60 p-3">
            <div className="text-xs text-muted-foreground">Thermometer</div>
            <div className="mt-1 text-3xl font-bold tabular-nums">{finalTemp}°C</div>
            <div className="mt-2 text-xs text-muted-foreground">
              {mixed ? "After dissolving, temperature decreases due to absorption of heat." : "Set initial temperature, then dissolve the solute."}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
            <Canvas camera={{ position: [0, 2.55, 4.9], fov: 48 }}>
              <Scene
                setup={setup}
                mixed={mixed}
                liquidLevel={liquidLevel}
                liquidColor={liquidColor}
                temperature={finalTemp}
                crystalColor={solutes[soluteIdx].crystalColor}
                mass={massG[0]}
              />
            </Canvas>
          </div>

          <div className="text-xs">
            <div className="text-muted-foreground">Record</div>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <div className="rounded-md border border-border/60 bg-background/40 p-2">
                <div className="text-muted-foreground">Initial</div>
                <div className="font-semibold">{initialTemp[0]} °C</div>
              </div>
              <div className="rounded-md border border-border/60 bg-background/40 p-2">
                <div className="text-muted-foreground">Final</div>
                <div className="font-semibold">{finalTemp} °C</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
