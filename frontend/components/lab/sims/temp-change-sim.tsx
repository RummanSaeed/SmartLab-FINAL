"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"
import * as THREE from "three"

type TempChangeSetup = {
  testTube: boolean
  dropper: boolean
  thermometer: boolean
}

function mixColor(progress: number, exothermic: boolean) {
  // white (anhydrous CuSO4) -> deep blue (hydrated CuSO4)
  const p = Math.max(0, Math.min(1, progress))
  // More vibrant copper sulfate blue: rgb(0, 100, 200) to rgb(30, 144, 255)
  const r = Math.round(248 + (exothermic ? 0 : 120 - 248) * p)
  const g = Math.round(250 + (exothermic ? 80 : 170 - 250) * p)
  const b = Math.round(252 + (exothermic ? 200 : 235 - 252) * p)
  return `rgb(${r}, ${g}, ${b})`
}

// Animated water droplets from dropper
function WaterDroplets({ active }: { active: boolean }) {
  const dropletsRef = useRef<THREE.Group>(null)
  const dropletData = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      phase: i * 0.4,
      speed: 1.5 + Math.random() * 0.5,
    }))
  }, [])

  useFrame(({ clock }) => {
    if (!dropletsRef.current || !active) return

    dropletsRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const data = dropletData[i]
      const t = clock.elapsedTime * data.speed + data.phase

      // Droplet falls from dropper tip
      const cycle = (t % 1.5) / 1.5
      const startY = 0.95
      const endY = 0.55

      mesh.position.y = startY - (startY - endY) * cycle
      mesh.position.x = 0.35
      mesh.position.z = -0.28

      // Scale changes during fall
      const scale = cycle < 0.1 ? 0.5 + cycle * 5 : 1 - (cycle - 0.1) * 0.5
      mesh.scale.setScalar(Math.max(0, scale))

      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = cycle < 0.9 ? 0.8 : 0.8 * (1 - (cycle - 0.9) * 10)
    })
  })

  if (!active) return null

  return (
    <group ref={dropletsRef}>
      {dropletData.map((_, i) => (
        <mesh key={i} position={[0.35, 0.95, -0.28]}>
          <sphereGeometry args={[0.015, 10, 10]} />
          <meshStandardMaterial
            color="#67e8f9"
            transparent
            opacity={0}
            emissive="#22d3ee"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

// CuSO4 powder crystals
function CuSO4Crystals({ visible, reaction }: { visible: boolean; reaction: number }) {
  const crystalsRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!crystalsRef.current || !visible) return
    // Subtle shimmer on crystals
    const shimmer = 1 + Math.sin(clock.elapsedTime * 3) * 0.02
    crystalsRef.current.children.forEach((child) => {
      const mesh = child as THREE.Mesh
      mesh.scale.set(shimmer, 1, shimmer)
    })
  })

  if (!visible) return null

  // Color transitions from white to deep copper sulfate blue as reaction progresses
  const r = Math.round(248 + (0 - 248) * reaction)
  const g = Math.round(250 + (80 - 250) * reaction)
  const b = Math.round(252 + (200 - 252) * reaction)
  const crystalColor = `rgb(${r}, ${g}, ${b})`

  return (
    <group ref={crystalsRef}>
      {/* Main crystal cluster */}
      <mesh position={[0, 0.52, -0.3]}>
        <cylinderGeometry args={[0.1, 0.11, 0.1, 12]} />
        <meshStandardMaterial color={crystalColor} roughness={0.8} />
      </mesh>
      {/* Individual crystals */}
      <mesh position={[-0.05, 0.58, -0.28]}>
        <boxGeometry args={[0.04, 0.04, 0.04]} />
        <meshStandardMaterial color={crystalColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.04, 0.55, -0.32]}>
        <boxGeometry args={[0.03, 0.05, 0.03]} />
        <meshStandardMaterial color={crystalColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.02, 0.6, -0.29]}>
        <boxGeometry args={[0.035, 0.04, 0.035]} />
        <meshStandardMaterial color={crystalColor} roughness={0.7} />
      </mesh>
      <mesh position={[-0.03, 0.56, -0.31]}>
        <boxGeometry args={[0.03, 0.03, 0.03]} />
        <meshStandardMaterial color={crystalColor} roughness={0.7} />
      </mesh>
    </group>
  )
}

// Steam/vapor from exothermic reaction
function SteamVapor({ active, temp, isExothermic }: { active: boolean; temp: number; isExothermic: boolean }) {
  const vaporRef = useRef<THREE.Group>(null)
  const [particleData] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      x: (Math.random() - 0.5) * 0.15,
      z: -0.3 + (Math.random() - 0.5) * 0.1,
      phase: Math.random() * Math.PI * 2,
      speed: 0.7 + Math.random() * 0.4,
      size: 0.012 + Math.random() * 0.008,
    }))
  )

  useFrame(({ clock }) => {
    if (!vaporRef.current || !active || temp < 30) return
    const intensity = Math.min(1, (temp - 25) / 15) * (isExothermic ? 1 : 0.5)

    vaporRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const data = particleData[i]
      const t = clock.elapsedTime * data.speed + data.phase

      // Vapor rises from solution
      const cycle = (t % 2) / 2
      const startY = 0.7
      const endY = 1.4

      mesh.position.y = startY + (endY - startY) * cycle
      mesh.position.x = data.x + Math.sin(t * 2) * 0.02
      mesh.position.z = data.z + Math.cos(t * 1.5) * 0.015

      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = 0.35 * intensity * (1 - cycle * 0.7)
    })
  })

  if (!active || temp < 28) return null

  return (
    <group ref={vaporRef}>
      {particleData.map((data, i) => (
        <mesh key={i} position={[data.x, 0.7, data.z]}>
          <sphereGeometry args={[data.size, 8, 8]} />
          <meshStandardMaterial
            color={isExothermic ? "#fde68a" : "#e0f2fe"}
            transparent
            opacity={0}
            emissive={isExothermic ? "#fbbf24" : "#bae6fd"}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}

// Heat shimmer effect around test tube
function HeatShimmer({ active, temp, isExothermic }: { active: boolean; temp: number; isExothermic: boolean }) {
  const shimmerRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!shimmerRef.current || !active) return
    const pulse = 1 + Math.sin(clock.elapsedTime * 4) * 0.08
    shimmerRef.current.scale.setScalar(pulse)
  })

  if (!active || temp <= 25) return null

  const intensity = Math.min(0.5, (temp - 25) / 20)
  const color = isExothermic ? "#fb923c" : "#38bdf8"

  return (
    <mesh ref={shimmerRef} position={[0, 0.7, -0.3]}>
      <cylinderGeometry args={[0.35, 0.35, 0.8, 24]} />
      <meshBasicMaterial color={color} transparent opacity={intensity * 0.15} />
    </mesh>
  )
}

// Solution with animated bubbles
function Solution({
  waterAddedMl,
  reaction,
  isExothermic,
  solutionColor,
}: {
  waterAddedMl: number
  reaction: number
  isExothermic: boolean
  solutionColor: string
}) {
  const solutionRef = useRef<THREE.Mesh>(null)
  const bubblesRef = useRef<THREE.Group>(null)

  const liquidLevel = Math.min(0.68, (waterAddedMl / 18) * 0.68)
  const bubblesOn = waterAddedMl > 0 && reaction > (isExothermic ? 0.15 : 0.35)

  useFrame(({ clock }) => {
    if (!solutionRef.current || liquidLevel <= 0) return
    // Subtle shimmer on solution surface
    const shimmer = 1 + Math.sin(clock.elapsedTime * 2) * 0.01
    solutionRef.current.scale.set(shimmer, 1, shimmer)

    // Animate bubbles
    if (bubblesRef.current && bubblesOn) {
      bubblesRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh
        const t = clock.elapsedTime * 2 + i * 0.5
        const cycle = (t % 1.5) / 1.5

        mesh.position.y = 0.55 + cycle * 0.4
        const mat = mesh.material as THREE.MeshStandardMaterial
        mat.opacity = 0.4 * (1 - cycle)
      })
    }
  })

  if (liquidLevel <= 0) return null

  return (
    <group>
      {/* Solution liquid */}
      <mesh
        ref={solutionRef}
        position={[0, 0.52 + liquidLevel / 2, -0.3]}
      >
        <cylinderGeometry args={[0.12, 0.14, liquidLevel, 24]} />
        <meshStandardMaterial
          color={solutionColor}
          transparent
          opacity={0.75}
          emissive={solutionColor}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Bubbles */}
      {bubblesOn && (
        <group ref={bubblesRef}>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} position={[(Math.random() - 0.5) * 0.12, 0.55 + (i % 4) * 0.1, -0.3]}>
              <sphereGeometry args={[0.008 + (i % 3) * 0.003, 8, 8]} />
              <meshStandardMaterial
                color={isExothermic ? "#fde68a" : "#dbeafe"}
                transparent
                opacity={0}
                emissive={isExothermic ? "#fbbf24" : "#93c5fd"}
                emissiveIntensity={0.3}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

function Scene({
  setup,
  cuAdded,
  waterAddedMl,
  addWaterMode,
  reaction,
  temp,
  isExothermic,
}: {
  setup: TempChangeSetup
  cuAdded: boolean
  waterAddedMl: number
  addWaterMode: boolean
  reaction: number
  temp: number
  isExothermic: boolean
}) {
  const solutionColor = mixColor(reaction, isExothermic)

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 3]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 5, -2]} intensity={0.4} />
      <pointLight position={[0, 1.0, -0.25]} intensity={0.5} color={isExothermic ? "#fb923c" : "#38bdf8"} />

      {/* Lab bench */}
      <mesh position={[0, 0.05, -0.3]} receiveShadow>
        <boxGeometry args={[3.5, 0.1, 1.8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Test tube clamp */}
      <group visible={setup.testTube}>
        <mesh position={[0, 0.95, -0.3]}>
          <torusGeometry args={[0.2, 0.015, 8, 24]} />
          <meshStandardMaterial color="#64748b" metalness={0.5} />
        </mesh>
        <mesh position={[0.22, 0.95, -0.3]}>
          <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* Test tube with realistic glass */}
      <group visible={setup.testTube}>
        {/* Tube body */}
        <mesh position={[0, 1.05, -0.3]} castShadow>
          <cylinderGeometry args={[0.18, 0.2, 1.1, 28, 1, true]} />
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
        {/* Tube bottom */}
        <mesh position={[0, 0.5, -0.3]}>
          <sphereGeometry args={[0.18, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
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
        {/* Tube rim */}
        <mesh position={[0, 1.6, -0.3]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.18, 0.008, 8, 24]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      {/* CuSO4 crystals */}
      <CuSO4Crystals visible={setup.testTube && cuAdded && waterAddedMl <= 0} reaction={reaction} />

      {/* Solution with bubbles */}
      <Solution
        waterAddedMl={waterAddedMl}
        reaction={reaction}
        isExothermic={isExothermic}
        solutionColor={solutionColor}
      />

      {/* Heat shimmer */}
      <HeatShimmer active={cuAdded && waterAddedMl > 0} temp={temp} isExothermic={isExothermic} />

      {/* Steam/vapor */}
      <SteamVapor active={cuAdded && waterAddedMl > 0} temp={temp} isExothermic={isExothermic} />

      {/* Dropper */}
      <group visible={setup.dropper}>
        {/* Dropper body */}
        <mesh position={[0.45, 1.35, -0.25]}>
          <cylinderGeometry args={[0.03, 0.03, 0.6, 16]} />
          <meshStandardMaterial color="#cbd5e1" transparent opacity={0.6} />
        </mesh>
        {/* Bulb */}
        <mesh position={[0.45, 1.68, -0.25]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.4} />
        </mesh>
        {/* Tip */}
        <mesh position={[0.45, 1.02, -0.25]}>
          <coneGeometry args={[0.03, 0.06, 12]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      {/* Water droplets from dropper */}
      <WaterDroplets active={addWaterMode && setup.dropper} />

      {/* Thermometer */}
      <group visible={setup.thermometer}>
        {/* Thermometer tube */}
        <mesh position={[-0.3, 1.25, -0.22]}>
          <cylinderGeometry args={[0.02, 0.02, 0.9, 12]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        {/* Bulb */}
        <mesh position={[-0.3, 0.82, -0.22]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
        {/* Mercury column with temperature */}
        <mesh
          position={[-0.3, 0.85 + ((Math.min(45, Math.max(20, temp)) - 20) / 25) * 0.55, -0.22]}
        >
          <cylinderGeometry args={[0.007, 0.007, 0.55, 12]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.4} />
        </mesh>
        {/* Temperature reading */}
        <Text position={[-0.15, 1.7, -0.22]} fontSize={0.04} color="#94a3b8" anchorX="left">
          {temp.toFixed(1)}°C
        </Text>
      </group>

      {/* Labels */}
      <Text position={[0, 2.0, -0.3]} fontSize={0.07} color="#f8fafc" anchorX="center">
        {isExothermic ? "Exothermic Reaction" : "Endothermic Reaction"}
      </Text>
      <Text position={[0.7, 0.3, -0.25]} fontSize={0.04} color="#94a3b8" anchorX="center">
        Dropper
      </Text>

      <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2.1} target={[0, 1, -0.3]} />
    </>
  )
}

export function TempChangeSim({
  waterMl,
  setup,
  practicalId,
  practicalTitle,
}: {
  waterMl: number
  setup: TempChangeSetup
  practicalId?: string
  practicalTitle?: string
}) {
  const [cuAdded, setCuAdded] = useState(false)
  const [addWaterMode, setAddWaterMode] = useState(false)
  const [waterAddedMl, setWaterAddedMl] = useState(0)

  const setupReady = setup.testTube && setup.dropper && setup.thermometer

  useEffect(() => {
    if (!addWaterMode) return
    const id = setInterval(() => {
      setWaterAddedMl((v) => {
        const next = Math.min(waterMl, Number((v + 0.25 + Math.random() * 0.1).toFixed(2)))
        if (next >= waterMl) setAddWaterMode(false)
        return next
      })
    }, 120)
    return () => clearInterval(id)
  }, [addWaterMode, waterMl])

  useEffect(() => {
    if (!setupReady) setAddWaterMode(false)
  }, [setupReady])

  const reaction = useMemo(() => {
    if (!cuAdded || waterMl <= 0) return 0
    return Math.max(0, Math.min(1, waterAddedMl / waterMl))
  }, [cuAdded, waterAddedMl, waterMl])

  const title = (practicalTitle || "").toLowerCase()
  const isNeutralization = title.includes("neutralization")
  const isEvapCooling = title.includes("evaporation")
  const isSpecificHeat = title.includes("specific heat")
  const materialLabel = isNeutralization
    ? "Acid-base sample"
    : isEvapCooling
      ? "Volatile liquid sample"
      : isSpecificHeat
        ? "Solid sample"
        : "CuSO4"
  const isExothermic =
    practicalId === "hssc-chem-05-08" ||
    title.includes("exothermic") ||
    title.includes("cuso4") ||
    title.includes("neutralization")
  const initialTemp = 25
  const finalTemp = useMemo(
    () =>
      isExothermic
        ? initialTemp + (6 + waterMl * 0.08) * reaction
        : initialTemp - (4 + waterMl * 0.05) * reaction,
    [isExothermic, waterMl, reaction],
  )

  const stepText = !cuAdded
    ? `Step 1: Place ${materialLabel} in test tube`
    : waterAddedMl <= 0
      ? "Step 2: Start adding water with dropper"
      : reaction < 1
        ? "Step 3: Observe gradual color and temperature change"
        : "Step 4: Record initial and final temperatures"

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline">{materialLabel}: {cuAdded ? "Placed" : "Not placed"}</Badge>
        <Badge variant="outline">Water added: {waterAddedMl.toFixed(1)} / {waterMl.toFixed(1)} mL</Badge>
        <Badge variant="outline">Temp: {finalTemp.toFixed(1)} deg C</Badge>
        <Badge variant={reaction >= 1 ? "default" : "secondary"}>{stepText}</Badge>
        <Badge variant="outline">{isExothermic ? "Exothermic" : "Endothermic"}</Badge>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Button onClick={() => setCuAdded(true)} disabled={!setupReady || cuAdded}>
          Place {materialLabel}
        </Button>
        <Button onClick={() => setAddWaterMode(true)} disabled={!setupReady || !cuAdded || addWaterMode || waterAddedMl >= waterMl} className="gap-2">
          <Play className="w-4 h-4" /> Start Adding Water
        </Button>
        <Button variant="destructive" onClick={() => setAddWaterMode(false)} disabled={!addWaterMode} className="gap-2">
          <Pause className="w-4 h-4" /> Stop Adding
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            setCuAdded(false)
            setAddWaterMode(false)
            setWaterAddedMl(0)
          }}
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </Button>
      </div>

      {!setupReady && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
          Place test tube, dropper, and thermometer first.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Initial temperature</div>
          <div className="text-lg font-semibold">{initialTemp.toFixed(1)} deg C</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Current/final temperature</div>
          <div className="text-lg font-semibold">{finalTemp.toFixed(1)} deg C</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">dT</div>
          <div className="text-lg font-semibold">{(finalTemp - initialTemp).toFixed(1)} deg C</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Color state</div>
          <div className="text-sm font-semibold">
            {isNeutralization
              ? reaction <= 0
                ? "Reactants clear"
                : reaction < 1
                  ? "Mixing, slight clouding"
                  : "Product solution formed"
              : isEvapCooling
                ? reaction <= 0
                  ? "Clear liquid"
                  : reaction < 1
                    ? "Evaporation in progress"
                    : "Cooling effect visible"
                : reaction <= 0
                  ? "White solid"
                  : reaction < 1
                    ? "Light blue forming"
                    : "Blue hydrated CuSO4"}
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Conclusion</div>
          <div className="text-sm font-semibold">
            {reaction >= 1
              ? `${isExothermic ? "Exothermic" : "Endothermic"} behavior observed`
              : "Observe during addition"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[420px]">
        <Canvas camera={{ position: [0, 2.5, 4.5], fov: 48 }}>
          <Scene
            setup={setup}
            cuAdded={cuAdded}
            waterAddedMl={waterAddedMl}
            addWaterMode={addWaterMode}
            reaction={reaction}
            temp={finalTemp}
            isExothermic={isExothermic}
          />
        </Canvas>
      </div>

      <div className="rounded-lg border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
        Procedure: place CuSO4 sample, add water gradually, observe color turning white to blue and thermometer rise,
        record initial and final temperatures, then conclude exothermic behavior.
      </div>
    </div>
  )
}
