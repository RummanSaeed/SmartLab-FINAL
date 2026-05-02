"use client"

import { useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import * as THREE from "three"

type Reaction = {
  id: string
  reactant: string
  products: string
  trigger: "heat" | "light"
  threshold: number
  gas: string
  test: string
}

const reactions: Reaction[] = [
  {
    id: "caco3",
    reactant: "Calcium carbonate (CaCO₃)",
    products: "Calcium oxide (CaO) + Carbon dioxide (CO₂)",
    trigger: "heat",
    threshold: 55,
    gas: "CO₂",
    test: "Turns limewater milky",
  },
  {
    id: "kclo3",
    reactant: "Potassium chlorate (KClO₃)",
    products: "Potassium chloride (KCl) + Oxygen (O₂)",
    trigger: "heat",
    threshold: 60,
    gas: "O₂",
    test: "Relights a glowing splint",
  },
]

export type DecompositionSetup = {
  testTube: boolean
  burner: boolean
  deliveryTube: boolean
  testReagent: boolean
}

// Realistic Bunsen burner flame with flickering
function BunsenFlame({ active }: { active: boolean }) {
  const flameRef = useRef<THREE.Group>(null)
  const innerFlameRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!flameRef.current || !active) return
    const t = clock.elapsedTime

    // Outer flame flicker
    const flickerScale = 1 + Math.sin(t * 15) * 0.08 + Math.cos(t * 22) * 0.05
    flameRef.current.scale.set(flickerScale, 1 + Math.sin(t * 10) * 0.1, flickerScale)

    // Inner blue cone subtle movement
    if (innerFlameRef.current) {
      innerFlameRef.current.rotation.z = Math.sin(t * 3) * 0.02
    }
  })

  if (!active) return null

  return (
    <group ref={flameRef}>
      {/* Outer orange flame */}
      <mesh position={[0, 0.65, -0.3]}>
        <coneGeometry args={[0.12, 0.4, 24]} />
        <meshStandardMaterial
          color="#fb923c"
          emissive="#ea580c"
          emissiveIntensity={1.5}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Middle yellow flame */}
      <mesh position={[0, 0.72, -0.3]}>
        <coneGeometry args={[0.08, 0.28, 20]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#f59e0b"
          emissiveIntensity={2}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Inner blue cone */}
      <mesh ref={innerFlameRef} position={[0, 0.58, -0.3]}>
        <coneGeometry args={[0.04, 0.18, 16]} />
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

// Gas bubbles rising from heated solid
function GasBubbles({ active, progress, gasType }: { active: boolean; progress: number; gasType: string }) {
  const bubblesRef = useRef<THREE.Group>(null)
  const [bubbleData] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      x: (Math.random() - 0.5) * 0.1,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 0.5,
      size: 0.006 + Math.random() * 0.004,
    }))
  )

  useFrame(({ clock }) => {
    if (!bubblesRef.current || !active || progress < 0.3) return
    const intensity = Math.min(1, (progress - 0.3) * 2)

    bubblesRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const data = bubbleData[i]
      const t = clock.elapsedTime * data.speed + data.phase

      // Bubbles rise through test tube
      const cycle = (t % 2) / 2
      const startY = 0.45
      const endY = 1.3
      mesh.position.y = startY + (endY - startY) * cycle
      mesh.position.x = data.x + Math.sin(t * 2) * 0.02

      // Fade as they reach the top
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = 0.5 * intensity * (1 - cycle)
    })
  })

  const gasColor = gasType === "CO₂" ? "#94a3b8" : "#38bdf8"

  if (!active || progress < 0.2) return null

  return (
    <group ref={bubblesRef}>
      {bubbleData.map((data, i) => (
        <mesh key={i} position={[0, 0.5, -0.3]}>
          <sphereGeometry args={[data.size, 8, 8]} />
          <meshStandardMaterial color={gasColor} transparent opacity={0} emissive={gasColor} emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

// Gas flow through delivery tube
function GasFlow({ active, progress, gasType }: { active: boolean; progress: number; gasType: string }) {
  const flowRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Mesh[]>([])

  useFrame(({ clock }) => {
    if (!flowRef.current || !active || progress < 0.4) return

    const t = clock.elapsedTime * 1.5
    particlesRef.current.forEach((particle, i) => {
      if (!particle) return
      // Particles flow through delivery tube
      const cycle = ((t + i * 0.15) % 2) / 2
      // Position along bent tube
      const x = 0.45 + cycle * 0.65
      const y = 1.0 - cycle * 0.35
      const z = -0.25
      particle.position.set(x, y, z)

      const mat = particle.material as THREE.MeshStandardMaterial
      mat.opacity = 0.4 * (Math.sin(cycle * Math.PI) * 0.5 + 0.5)
    })
  })

  const gasColor = gasType === "CO₂" ? "#94a3b8" : "#38bdf8"

  if (!active || progress < 0.3) return null

  return (
    <group ref={flowRef}>
      {/* Delivery tube with slight transparency when gas flows */}
      <mesh position={[0.45, 1.0, -0.25]} rotation={[0, 0, 0.75]}>
        <cylinderGeometry args={[0.015, 0.015, 1.1, 12]} />
        <meshStandardMaterial color="#cbd5e1" transparent opacity={0.6} />
      </mesh>

      {/* Flowing gas particles */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) particlesRef.current[i] = el }}
          position={[0.45, 1.0, -0.25]}
        >
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color={gasColor} transparent opacity={0} emissive={gasColor} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  )
}

// Residue formation in test tube
function ResidueFormation({ progress, compound }: { progress: number; compound: string }) {
  const residueRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!residueRef.current || progress < 0.3) return
    // Subtle heat shimmer effect on residue
    const shimmer = 1 + Math.sin(clock.elapsedTime * 2) * 0.01
    residueRef.current.scale.set(shimmer, 1, shimmer)
  })

  // Residue grows as decomposition progresses
  const residueHeight = Math.max(0.05, 0.25 * progress)
  const residueOpacity = Math.min(1, progress * 1.2)

  // Color based on compound
  const residueColor = compound.includes("CaCO₃")
    ? "#f5f5f4" // Calcium oxide - white
    : compound.includes("KClO₃")
      ? "#f8fafc" // Potassium chloride - white
      : "#e5e7eb"

  return (
    <mesh ref={residueRef} position={[0, 0.45 + residueHeight / 2, -0.3]} visible={progress > 0.2}>
      <cylinderGeometry args={[0.11, 0.13, residueHeight, 18]} />
      <meshStandardMaterial
        color={residueColor}
        roughness={0.9}
        transparent
        opacity={residueOpacity}
        emissive={residueColor}
        emissiveIntensity={0.05}
      />
    </mesh>
  )
}

// Reagent test visualization (limewater turning milky)
function ReagentReaction({ active, progress, gasType }: { active: boolean; progress: number; gasType: string }) {
  const reagentRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!reagentRef.current || !active || progress < 0.5) return
    // Bubbling effect in reagent
    const bubble = Math.sin(clock.elapsedTime * 8) * 0.003
    reagentRef.current.position.y = 0.65 + bubble
  })

  // Reagent turns milky/cloudy when CO2 is detected
  const cloudiness = gasType === "CO₂" && progress > 0.6 ? (progress - 0.6) * 2 : 0
  const reagentColor = cloudiness > 0
    ? `rgb(${255 - cloudiness * 40}, ${255 - cloudiness * 30}, ${255 - cloudiness * 20})`
    : "#f8fafc"

  if (!active) return null

  return (
    <group>
      {/* Test reagent container */}
      <mesh position={[1.1, 0.65, -0.25]}>
        <boxGeometry args={[0.36, 0.5, 0.36]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      {/* Reagent liquid with cloudiness effect */}
      <mesh ref={reagentRef} position={[1.1, 0.65, -0.25]}>
        <cylinderGeometry args={[0.14, 0.14, 0.35, 16]} />
        <meshStandardMaterial
          color={reagentColor}
          transparent
          opacity={0.7}
          emissive={reagentColor}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Gas entering reagent */}
      {progress > 0.5 && (
        <mesh position={[1.1, 0.85, -0.25]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial
            color="#e2e8f0"
            transparent
            opacity={0.4}
            emissive="#e2e8f0"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}
    </group>
  )
}

function Scene({ setup, progress, gasColor, rxn }: { setup: DecompositionSetup; progress: number; gasColor: string; rxn: Reaction }) {
  const flameOn = setup.burner && progress > 0.05

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 6, -3]} intensity={0.4} />

      {/* Lab bench */}
      <mesh position={[0, 0.05, -0.3]} receiveShadow>
        <boxGeometry args={[4, 0.1, 2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Test tube with realistic glass */}
      <group visible={setup.testTube}>
        <mesh position={[0, 1.02, -0.3]} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 1.15, 24, 1, true]} />
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
        <mesh position={[0, 0.45, -0.3]}>
          <sphereGeometry args={[0.16, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
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
      </group>

      {/* Original reactant in test tube */}
      <mesh position={[0, 0.52, -0.3]} visible={setup.testTube && progress < 0.8}>
        <cylinderGeometry args={[0.11, 0.13, 0.2 - progress * 0.1, 18]} />
        <meshStandardMaterial
          color={progress < 0.3 ? "#e5e7eb" : "#d4d4d8"}
          roughness={0.9}
          transparent
          opacity={1 - progress * 0.5}
        />
      </mesh>

      {/* Residue formation */}
      {setup.testTube && <ResidueFormation progress={progress} compound={rxn.reactant} />}

      {/* Bunsen burner */}
      <group visible={setup.burner}>
        <mesh position={[0, 0.42, -0.3]}>
          <cylinderGeometry args={[0.18, 0.24, 0.35, 20]} />
          <meshStandardMaterial color="#64748b" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.28, -0.3]}>
          <cylinderGeometry args={[0.22, 0.22, 0.05, 20]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      </group>

      {/* Animated flame */}
      <BunsenFlame active={flameOn} />

      {/* Gas bubbles in test tube */}
      <GasBubbles active={setup.testTube} progress={progress} gasType={rxn.gas} />

      {/* Gas flow through delivery tube */}
      <GasFlow active={setup.deliveryTube} progress={progress} gasType={rxn.gas} />

      {/* Reagent reaction visualization */}
      <ReagentReaction active={setup.testReagent} progress={progress} gasType={rxn.gas} />

      {/* Labels */}
      <Text position={[-0.8, 1.7, -0.3]} fontSize={0.07} color="#f8fafc" anchorX="center">
        {rxn.reactant}
      </Text>
      <Text position={[1.1, 1.1, -0.25]} fontSize={0.06} color="#94a3b8" anchorX="center">
        {rxn.gas === "CO₂" ? "Limewater test" : "Gas collection"}
      </Text>

      <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2.1} target={[0.5, 0.9, -0.3]} />
    </>
  )
}

export function DecompositionSim({ setup }: { setup: DecompositionSetup }) {
  const [rxnIdx, setRxnIdx] = useState(0)
  const [energy, setEnergy] = useState([20])
  const [started, setStarted] = useState(false)
  const [testApplied, setTestApplied] = useState(false)

  const rxn = reactions[rxnIdx] || reactions[0]

  const setupReady = setup.testTube && setup.burner && setup.deliveryTube && setup.testReagent

  const progress = useMemo(() => {
    if (!started) return 0
    if (energy[0] < rxn.threshold) return 0.1
    const p = Math.min(1, (energy[0] - rxn.threshold) / 40)
    return Number((0.1 + p * 0.9).toFixed(2))
  }, [started, energy, rxn.threshold])

  const gasReleased = progress > 0.3
  const complete = progress >= 0.95

  const testResult = useMemo(() => {
    if (!testApplied) return "Not tested"
    if (!gasReleased) return "No noticeable change (gas not collected)"
    return rxn.test
  }, [testApplied, gasReleased, rxn.test])

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">Decomposition Reaction</div>
          <Badge variant="outline">decomposition</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          A single compound breaks into simpler substances (often by heating).
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Select compound</div>
          <div className="flex flex-wrap gap-2">
            {reactions.map((r, idx) => (
              <Button
                key={r.id}
                size="sm"
                variant={idx === rxnIdx ? "default" : "outline"}
                onClick={() => {
                  setRxnIdx(idx)
                  setStarted(false)
                  setTestApplied(false)
                }}
              >
                {r.reactant}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{rxn.trigger === "heat" ? "Heat" : "Light"}</span>
              <span>{energy[0]}%</span>
            </div>
            <Slider value={energy} min={0} max={100} step={1} onValueChange={setEnergy} />
            <div className="text-xs text-muted-foreground">Threshold: {rxn.threshold}%</div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setStarted(true)} disabled={started || !setupReady}>Start</Button>
            <Button variant="outline" onClick={() => setTestApplied(true)} disabled={!setupReady}>
              Perform gas test
            </Button>
            <Button variant="outline" onClick={() => { setStarted(false); setTestApplied(false) }}>
              Reset
            </Button>
          </div>

          {!setupReady && (
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
              Drag and place test tube, burner, delivery tube, and test reagent first.
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Observation</div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Products</div>
            <div className="mt-1 font-semibold">{rxn.products}</div>
          </div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Progress</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{Math.round(progress * 100)}%</div>
            <div className="mt-2 h-2 rounded bg-muted overflow-hidden">
              <div className="h-2 bg-primary" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {complete
                ? "Decomposition complete. Record residue and gas produced."
                : !started
                  ? "Start the reaction and increase heat/light if required."
                  : energy[0] < rxn.threshold
                    ? "Not enough energy for decomposition."
                    : gasReleased
                      ? `Gas (${rxn.gas}) is being released.`
                      : "Initial heating…"}
            </div>
          </div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Gas test result</div>
            <div className="mt-1 font-semibold">{testResult}</div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
            <Canvas camera={{ position: [0.5, 2.8, 5], fov: 45 }}>
              <Scene setup={setup} progress={progress} gasColor={rxn.gas === "O₂" ? "#38bdf8" : "#a3a3a3"} rxn={rxn} />
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  )
}
