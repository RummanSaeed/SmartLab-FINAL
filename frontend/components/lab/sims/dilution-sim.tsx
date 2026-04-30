"use client"

import { useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RotateCcw } from "lucide-react"
import * as THREE from "three"

type DilutionSetup = {
  pipette: boolean
  flask: boolean
  beaker: boolean
  cylinder: boolean
}

type DilutionTargets = {
  c1: number
  c2: number
  v2: number
  v1: number
  isAcid: boolean
}

function parseDilutionTargets(title: string): DilutionTargets {
  const t = title.toLowerCase()
  let c1 = 0.1
  let c2 = 0.01

  if (t.includes("1m naoh to 0.1m")) {
    c1 = 1
    c2 = 0.1
  } else if (t.includes("0.1m na2co3 to 0.01m")) {
    c1 = 0.1
    c2 = 0.01
  } else if (t.includes("0.1m hcl to 0.01m")) {
    c1 = 0.1
    c2 = 0.01
  } else if (t.includes("0.1m oxalic acid to 0.01m")) {
    c1 = 0.1
    c2 = 0.01
  } else {
    if (t.includes("1m")) c1 = 1
    if (t.includes("0.01m")) c2 = 0.01
    if (t.includes("0.1m") && !t.includes("0.01m")) c2 = 0.1
  }

  const v2Match = t.match(/(\d+)\s*ml/)
  const v2 = v2Match ? Number(v2Match[1]) : 100
  const v1 = (c2 * v2) / c1
  const isAcid = t.includes("hcl") || t.includes("acid")
  return { c1, c2, v2, v1, isAcid }
}

// Animated pipette with plunger
function Pipette({ active, flow }: { active: boolean; flow: boolean }) {
  const pipetteRef = useRef<THREE.Group>(null)
  const plungerRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!pipetteRef.current) return

    if (flow) {
      // Lower when transferring
      pipetteRef.current.position.y = 1.18 - Math.sin(clock.elapsedTime * 4) * 0.05
    } else {
      pipetteRef.current.position.y = 1.18
    }

    if (plungerRef.current && flow) {
      // Plunger moves during suction/dispensing
      plungerRef.current.position.y = 0.35 + Math.sin(clock.elapsedTime * 3) * 0.02
    }
  })

  if (!active) return null

  return (
    <group ref={pipetteRef} position={[-0.35, 1.18, -0.22]} rotation={[0, 0, 0.5]}>
      {/* Main tube */}
      <mesh>
        <cylinderGeometry args={[0.018, 0.018, 0.7, 12]} />
        <meshPhysicalMaterial
          color="#e2e8f0"
          metalness={0.1}
          roughness={0.05}
          transmission={0.8}
          thickness={0.04}
          transparent
          opacity={0.4}
        />
      </mesh>
      {/* Tip */}
      <mesh position={[0, -0.4, 0]}>
        <coneGeometry args={[0.018, 0.08, 12]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {/* Bulb/plunger top */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.15, 12]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      {/* Plunger button */}
      <mesh ref={plungerRef} position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.04, 10]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Graduation marks */}
      {[0.2, 0.1, 0, -0.1, -0.2].map((y, i) => (
        <mesh key={i} position={[0.02, y, 0]}>
          <boxGeometry args={[0.008, 0.003, 0.003]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      ))}
    </group>
  )
}

// Animated liquid flow
function LiquidFlow({ active, type }: { active: boolean; type: "stock" | "water" }) {
  const flowRef = useRef<THREE.Group>(null)
  const dropsRef = useRef<THREE.Mesh[]>([])

  useFrame(({ clock }) => {
    if (!flowRef.current || !active) return
    const t = clock.elapsedTime * 3

    dropsRef.current.forEach((drop, i) => {
      if (!drop) return
      const cycle = ((t + i * 0.1) % 1)
      const startY = type === "stock" ? 0.85 : 0.95
      const endY = 0.55
      drop.position.y = startY - (startY - endY) * cycle
      drop.position.x = type === "stock" ? 0.1 + Math.sin(t) * 0.005 : 1.0

      const mat = drop.material as THREE.MeshStandardMaterial
      mat.opacity = 0.7 * (1 - cycle * 0.3)
    })
  })

  if (!active) return null

  const x = type === "stock" ? 0.1 : 1.0
  const startY = type === "stock" ? 0.85 : 0.95

  return (
    <group ref={flowRef}>
      {/* Main stream */}
      <mesh position={[x, startY - 0.15, -0.28]}>
        <cylinderGeometry args={[0.01, 0.012, 0.4, 10]} />
        <meshStandardMaterial color="#dbeafe" transparent opacity={0.6} />
      </mesh>
      {/* Animated drops */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) dropsRef.current[i] = el }}
          position={[x, startY, -0.28]}
        >
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshStandardMaterial color="#dbeafe" transparent opacity={0} />
        </mesh>
      ))}
    </group>
  )
}

// Mixing turbulence particles
function MixingTurbulence({ active, intensity }: { active: boolean; intensity: number }) {
  const turbulenceRef = useRef<THREE.Group>(null)
  const particleData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      x: 0.55 + ((i % 4) - 1.5) * 0.06,
      y: 0.55 + Math.random() * 0.3,
      z: -0.3 + (Math.random() - 0.5) * 0.1,
      phase: Math.random() * Math.PI * 2,
      speed: 2 + Math.random() * 2,
    }))
  }, [])

  useFrame(({ clock }) => {
    if (!turbulenceRef.current || !active || intensity <= 0) return

    turbulenceRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const data = particleData[i]
      const t = clock.elapsedTime * data.speed + data.phase

      // Swirling motion
      mesh.position.x = data.x + Math.sin(t) * 0.03 * intensity
      mesh.position.y = data.y + Math.cos(t * 1.3) * 0.02 * intensity
      mesh.position.z = data.z + Math.sin(t * 0.8) * 0.015

      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = 0.3 * intensity
    })
  })

  if (!active || intensity <= 0) return null

  return (
    <group ref={turbulenceRef}>
      {particleData.map((data, i) => (
        <mesh key={i} position={[data.x, data.y, data.z]}>
          <sphereGeometry args={[0.008 + (i % 3) * 0.003, 8, 8]} />
          <meshStandardMaterial
            color="#bae6fd"
            transparent
            opacity={0}
            emissive="#60a5fa"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}

// Realistic beaker with meniscus
function Beaker({ visible, level }: { visible: boolean; level: number }) {
  if (!visible) return null

  return (
    <group position={[-1.2, 0, -0.3]}>
      {/* Glass body */}
      <mesh position={[0, 0.88, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.27, 0.7, 24, 1, true]} />
        <meshPhysicalMaterial
          color="#e2e8f0"
          metalness={0.1}
          roughness={0.05}
          transmission={0.9}
          thickness={0.06}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, 0.53, 0]}>
        <sphereGeometry args={[0.24, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
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
      {/* Rim */}
      <mesh position={[0, 1.23, 0]}>
        <torusGeometry args={[0.24, 0.006, 6, 24]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {/* Graduation marks */}
      {[0.65, 0.75, 0.85, 0.95, 1.05, 1.15].map((y, i) => (
        <mesh key={i} position={[-0.2, y - 0.53, 0]}>
          <boxGeometry args={[0.04, 0.005, 0.005]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      ))}

      {/* Solution */}
      {level > 0 && (
        <>
          <mesh position={[0, 0.58 + level / 2, 0]}>
            <cylinderGeometry args={[0.19, 0.21, level, 20]} />
            <meshPhysicalMaterial
              color="#e0f7fa"
              metalness={0.1}
              roughness={0.1}
              transmission={0.7}
              thickness={0.04}
              transparent
              opacity={0.6}
              emissive="#e0f7fa"
              emissiveIntensity={0.1}
            />
          </mesh>
          {/* Meniscus */}
          <mesh position={[0, 0.58 + level, 0]}>
            <torusGeometry args={[0.17, 0.008, 6, 20]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#e0f7fa" transparent opacity={0.5} />
          </mesh>
        </>
      )}
    </group>
  )
}

// Realistic volumetric flask
function VolumetricFlask({ visible, level, targetVol }: { visible: boolean; level: number; targetVol: number }) {
  const flaskLevel = Math.min(0.78, (level / 100) * 0.78)

  if (!visible) return null

  return (
    <group position={[0.55, 0, -0.3]}>
      {/* Flask body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 1.0, 26, 1, true]} />
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
      {/* Neck */}
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.35, 18]} />
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
      {/* Bottom */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.3, 22, 11, 0, Math.PI * 2, 0, Math.PI / 2]} />
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
      {/* Calibration mark */}
      <mesh position={[0, 1.23, 0.03]}>
        <torusGeometry args={[0.125, 0.005, 6, 24]} rotation={[0, Math.PI / 2, 0]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0284c7" emissiveIntensity={0.3} />
      </mesh>

      {/* Solution */}
      {flaskLevel > 0 && (
        <>
          <mesh position={[0, 0.48 + flaskLevel / 2, 0]}>
            <cylinderGeometry args={[0.24, 0.27, flaskLevel, 22]} />
            <meshPhysicalMaterial
              color="#e0f7fa"
              metalness={0.1}
              roughness={0.1}
              transmission={0.7}
              thickness={0.05}
              transparent
              opacity={0.6}
              emissive="#e0f7fa"
              emissiveIntensity={0.1}
            />
          </mesh>
          {/* Meniscus at calibration */}
          {level > targetVol * 0.9 && (
            <mesh position={[0, 0.48 + flaskLevel, 0]}>
              <sphereGeometry args={[0.1, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} rotation={[Math.PI, 0, 0]} />
              <meshStandardMaterial color="#e0f7fa" transparent opacity={0.5} />
            </mesh>
          )}
        </>
      )}
    </group>
  )
}

// Measuring cylinder
function MeasuringCylinder({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <group position={[1.45, 0, -0.3]}>
      {/* Cylinder body */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.14, 0.16, 1.0, 20, 1, true]} />
        <meshPhysicalMaterial
          color="#e2e8f0"
          metalness={0.1}
          roughness={0.05}
          transmission={0.9}
          thickness={0.06}
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 20]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      {/* Graduation marks */}
      {[0.55, 0.7, 0.85, 1.0, 1.15, 1.3].map((y, i) => (
        <mesh key={i} position={[-0.12, y - 0.5, 0]}>
          <boxGeometry args={[0.03, 0.004, 0.004]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      ))}
    </group>
  )
}

function Scene({
  setup,
  stockMl,
  flaskMl,
  toFlaskFlow,
  waterFlow,
  mixed,
  targetV2,
}: {
  setup: DilutionSetup
  stockMl: number
  flaskMl: number
  toFlaskFlow: boolean
  waterFlow: boolean
  mixed: number
  targetV2: number
}) {
  const beakerLevel = Math.min(0.5, (stockMl / 100) * 0.5)

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 7, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />

      {/* Lab bench */}
      <mesh position={[0, 0.05, -0.35]} receiveShadow>
        <boxGeometry args={[4.2, 0.1, 2.0]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Beaker with stock solution */}
      <Beaker visible={setup.beaker} level={beakerLevel} />

      {/* Pipette */}
      <Pipette active={setup.pipette} flow={toFlaskFlow} />

      {/* Volumetric Flask */}
      <VolumetricFlask visible={setup.flask} level={flaskMl} targetVol={targetV2} />

      {/* Measuring Cylinder */}
      <MeasuringCylinder visible={setup.cylinder} />

      {/* Liquid flows */}
      <LiquidFlow active={toFlaskFlow} type="stock" />
      <LiquidFlow active={waterFlow} type="water" />

      {/* Mixing turbulence */}
      <MixingTurbulence active={mixed > 0} intensity={mixed} />

      {/* Labels */}
      <Text position={[-1.2, 1.45, -0.3]} fontSize={0.05} color="#f8fafc" anchorX="center">
        Stock Solution
      </Text>
      <Text position={[0.55, 1.95, -0.3]} fontSize={0.05} color="#f8fafc" anchorX="center">
        Volumetric Flask
      </Text>
      <Text position={[1.45, 1.55, -0.3]} fontSize={0.04} color="#94a3b8" anchorX="center">
        Distilled Water
      </Text>

      <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2.1} target={[0.2, 1, -0.3]} />
    </>
  )
}

export function DilutionSim({
  title,
  setup,
}: {
  title: string
  setup: DilutionSetup
}) {
  const targets = useMemo(() => parseDilutionTargets(title), [title])
  const setupReady = setup.pipette && setup.flask && setup.beaker && setup.cylinder

  const [aliquotTaken, setAliquotTaken] = useState(0)
  const [stockMl, setStockMl] = useState(60)
  const [flaskMl, setFlaskMl] = useState(0)
  const [toFlaskFlow, setToFlaskFlow] = useState(false)
  const [waterFlow, setWaterFlow] = useState(false)
  const [mixed, setMixed] = useState(0)
  const [hazard, setHazard] = useState<string | null>(null)
  const [safeOrder, setSafeOrder] = useState<boolean | null>(targets.isAcid ? null : true)

  const aliquotOk = aliquotTaken >= targets.v1
  const topped = flaskMl >= targets.v2
  const done = aliquotOk && topped && mixed >= 1

  const step = !aliquotOk
    ? "Step 1: Take aliquot V1 with pipette"
    : !topped
      ? "Step 2: Add distilled water to V2 mark"
      : mixed < 1
        ? "Step 3: Mix well"
        : "Completed"

  const transferAliquot = () => {
    if (!setupReady) return
    if (targets.isAcid && safeOrder !== true) {
      setHazard("For acid dilution, ensure safe order. Keep aliquot in flask, then add water to mark.")
      return
    }
    if (aliquotOk) return
    const delta = Math.min(5, targets.v1 - aliquotTaken)
    setToFlaskFlow(true)
    setTimeout(() => {
      setToFlaskFlow(false)
      setAliquotTaken((v) => Number((v + delta).toFixed(1)))
      setFlaskMl((v) => Number((v + delta).toFixed(1)))
      setStockMl((v) => Math.max(0, Number((v - delta).toFixed(1))))
      setHazard(null)
    }, 700)
  }

  const addWaterToMark = () => {
    if (!aliquotOk) return
    if (flaskMl >= targets.v2) return
    if (targets.isAcid && safeOrder !== true) {
      setHazard("Select safe mode first: acid is diluted by adding water after aliquot transfer, not reverse splash setup.")
      return
    }
    const delta = Math.min(10, targets.v2 - flaskMl)
    setWaterFlow(true)
    setTimeout(() => {
      setWaterFlow(false)
      setFlaskMl((v) => Number((v + delta).toFixed(1)))
      setHazard(null)
    }, 700)
  }

  const mixSolution = () => {
    if (!aliquotOk || !topped) return
    setMixed((v) => Math.min(1, Number((v + 0.25).toFixed(2))))
  }

  const reset = () => {
    setAliquotTaken(0)
    setStockMl(60)
    setFlaskMl(0)
    setToFlaskFlow(false)
    setWaterFlow(false)
    setMixed(0)
    setHazard(null)
    setSafeOrder(targets.isAcid ? null : true)
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline">C1: {targets.c1.toFixed(2)} M</Badge>
        <Badge variant="outline">C2: {targets.c2.toFixed(2)} M</Badge>
        <Badge variant="outline">V2: {targets.v2.toFixed(0)} mL</Badge>
        <Badge variant={done ? "default" : "secondary"}>{step}</Badge>
      </div>

      {hazard && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {hazard}
        </div>
      )}

      {!setupReady && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
          Place pipette, beaker, flask and measuring cylinder first.
        </div>
      )}

      {targets.isAcid && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={() => { setSafeOrder(true); setHazard(null) }}>
            Safe order mode
          </Button>
          <Button variant="destructive" onClick={() => { setSafeOrder(false); setHazard("Unsafe handling selected. Always dilute acid by adding to water carefully.") }}>
            Unsafe mode (show hazard)
          </Button>
          <Badge variant={safeOrder === true ? "default" : "secondary"}>{safeOrder === true ? "Safe order selected" : "Select safe order"}</Badge>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button disabled={!setupReady || aliquotOk} onClick={transferAliquot}>Transfer {Math.min(5, Math.max(0, targets.v1 - aliquotTaken)).toFixed(1)} mL aliquot</Button>
        <Button disabled={!aliquotOk || topped} onClick={addWaterToMark}>Add distilled water to mark</Button>
        <Button disabled={!aliquotOk || !topped || mixed >= 1} onClick={mixSolution}>Mix flask</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Required V1 (C1V1=C2V2)</div>
          <div className="text-xl font-semibold">{targets.v1.toFixed(1)} mL</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Aliquot transferred</div>
          <div className="text-xl font-semibold">{aliquotTaken.toFixed(1)} mL</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Flask volume</div>
          <div className="text-xl font-semibold">{flaskMl.toFixed(1)} / {targets.v2} mL</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Mixing</div>
          <div className="text-xl font-semibold">{(mixed * 100).toFixed(0)}%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Result</div>
          <div className="text-sm font-semibold">{done ? `${targets.c2.toFixed(2)} M prepared` : "In progress"}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="gap-2" onClick={reset}>
          <RotateCcw className="w-4 h-4" /> Reset
        </Button>
        <Badge variant="outline">Formula: C1V1 = C2V2</Badge>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[420px]">
        <Canvas camera={{ position: [0, 2.6, 4.8], fov: 48 }}>
          <Scene
            setup={setup}
            stockMl={stockMl}
            flaskMl={flaskMl}
            toFlaskFlow={toFlaskFlow}
            waterFlow={waterFlow}
            mixed={mixed}
            targetV2={targets.v2}
          />
        </Canvas>
      </div>
    </div>
  )
}
