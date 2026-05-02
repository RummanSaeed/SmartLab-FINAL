"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pause, RotateCcw, AlertTriangle } from "lucide-react"
import type { Mesh } from "three"
import * as THREE from "three"

type SolutionSetup = {
  balance: boolean
  beaker: boolean
  flask: boolean
  stirrer: boolean
}

type Targets = {
  solute: "NaOH" | "Na2CO3" | "HCl" | "Oxalic Acid"
  volMl: number
  molarity: number
  grams: number
}

function parseTargets(title: string): Targets {
  const t = title.toLowerCase()
  const volumeMatch = t.match(/(\d+)\s*ml/)
  const molarMatch = t.match(/(\d+(\.\d+)?)\s*m/)
  const volMl = volumeMatch ? Number(volumeMatch[1]) : 100
  const molarity = molarMatch ? Number(molarMatch[1]) : 0.1
  let solute: Targets["solute"] = "NaOH"
  if (t.includes("na2co3")) solute = "Na2CO3"
  else if (t.includes("hcl")) solute = "HCl"
  else if (t.includes("oxalic")) solute = "Oxalic Acid"

  const mw: Record<Targets["solute"], number> = {
    NaOH: 40.0,
    Na2CO3: 106.0,
    HCl: 36.46,
    "Oxalic Acid": 126.07,
  }
  const grams = molarity * (volMl / 1000) * mw[solute]
  return { solute, volMl, molarity, grams }
}

// Animated stirring rod
function StirringRod({ active }: { active: boolean }) {
  const rodRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!rodRef.current || !active) return
    // Stirring motion
    const t = clock.elapsedTime * 8
    rodRef.current.rotation.z = 0.35 + Math.sin(t) * 0.05
    rodRef.current.position.x = 0.4 + Math.cos(t) * 0.02
    rodRef.current.position.z = -0.24 + Math.sin(t * 0.7) * 0.01
  })

  return (
    <group ref={rodRef} position={[0.4, 1.1, -0.24]} rotation={[0, 0, 0.35]}>
      {/* Rod */}
      <mesh>
        <cylinderGeometry args={[0.015, 0.015, 0.95, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.3} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.15, 12]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  )
}

// Animated pouring stream
function PouringStream({ active }: { active: boolean }) {
  const streamRef = useRef<THREE.Group>(null)
  const dropsRef = useRef<THREE.Mesh[]>([])

  useFrame(({ clock }) => {
    if (!streamRef.current || !active) return
    const t = clock.elapsedTime * 2

    dropsRef.current.forEach((drop, i) => {
      if (!drop) return
      const cycle = ((t + i * 0.15) % 1)
      drop.position.y = 1.0 - cycle * 0.6
      drop.position.x = 0.42 + Math.sin(t * 2) * 0.005
      const mat = drop.material as THREE.MeshStandardMaterial
      mat.opacity = 0.7 * (1 - cycle * 0.3)
    })
  })

  if (!active) return null

  return (
    <group ref={streamRef}>
      {/* Main stream */}
      <mesh position={[0.42, 0.7, -0.28]} rotation={[0, 0, 0.12]}>
        <cylinderGeometry args={[0.012, 0.015, 0.6, 10]} />
        <meshStandardMaterial color="#dbeafe" transparent opacity={0.6} />
      </mesh>
      {/* Animated drops */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) dropsRef.current[i] = el }}
          position={[0.42, 1.0 - i * 0.1, -0.28]}
        >
          <sphereGeometry args={[0.01 + (i % 3) * 0.003, 8, 8]} />
          <meshStandardMaterial color="#dbeafe" transparent opacity={0} />
        </mesh>
      ))}
    </group>
  )
}

// Vapor/fume particles for NaOH and HCl
function VaporParticles({ amount, solute }: { amount: number; solute: string }) {
  const vaporRef = useRef<THREE.Group>(null)
  const [particleData] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      x: -0.25 + (Math.random() - 0.5) * 0.25,
      z: -0.3 + (Math.random() - 0.5) * 0.15,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5,
      size: 0.015 + Math.random() * 0.01,
    }))
  )

  useFrame(({ clock }) => {
    if (!vaporRef.current || amount <= 0) return

    vaporRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const data = particleData[i]
      const t = clock.elapsedTime * data.speed + data.phase

      const cycle = (t % 2.5) / 2.5
      const startY = 1.0
      const endY = 1.6

      mesh.position.y = startY + (endY - startY) * cycle
      mesh.position.x = data.x + Math.sin(t * 1.5) * 0.02
      mesh.position.z = data.z + Math.cos(t * 1.2) * 0.015

      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.opacity = amount * 0.35 * (1 - cycle * 0.6)
    })
  })

  if (amount <= 0) return null

  const vaporColor = solute === "HCl" ? "#fef3c7" : "#e2e8f0"

  return (
    <group ref={vaporRef}>
      {particleData.map((data, i) => (
        <mesh key={i} position={[data.x, 1.0, data.z]}>
          <sphereGeometry args={[data.size, 8, 8]} />
          <meshStandardMaterial
            color={vaporColor}
            transparent
            opacity={0}
            emissive={vaporColor}
            emissiveIntensity={0.15}
          />
        </mesh>
      ))}
    </group>
  )
}

// Solid solute pile
function SolutePile({ visible, dissolved, solute }: { visible: boolean; dissolved: number; solute: string }) {
  const pileRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!pileRef.current || !visible) return
    // Subtle shimmer as it dissolves
    const shimmer = 1 + Math.sin(clock.elapsedTime * 3) * 0.01 * (1 - dissolved)
    pileRef.current.scale.setScalar(shimmer)
  })

  if (!visible) return null

  // All these solutes are white/colorless solids
  const pileHeight = 0.06 * (1 - dissolved) + 0.01

  return (
    <group ref={pileRef} position={[-0.25, 0.5, -0.29]}>
      {/* Main pile */}
      <mesh>
        <cylinderGeometry args={[0.08, 0.1, pileHeight, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>
      {/* Individual crystals */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 0.1,
            pileHeight / 2 + Math.random() * 0.02,
            (Math.random() - 0.5) * 0.08,
          ]}
        >
          <boxGeometry args={[0.02, 0.02, 0.02]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// Realistic digital balance
function DigitalBalance({ visible, reading }: { visible: boolean; reading: number }) {
  return (
    <group visible={visible}>
      {/* Base */}
      <mesh position={[-1.35, 0.35, -0.25]}>
        <boxGeometry args={[1.0, 0.12, 0.75]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Feet */}
      {[[-0.45, -0.32], [0.45, -0.32], [-0.45, 0.32], [0.45, 0.32]].map(([x, z], i) => (
        <mesh key={i} position={[-1.35 + x, 0.25, -0.25 + z]}>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 8]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      ))}
      {/* Weighing pan */}
      <mesh position={[-1.35, 0.48, -0.25]}>
        <cylinderGeometry args={[0.35, 0.38, 0.06, 24]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.4} />
      </mesh>
      {/* Display panel */}
      <mesh position={[-1.35, 0.42, 0.15]}>
        <boxGeometry args={[0.5, 0.15, 0.02]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Digital readout */}
      <Text
        position={[-1.35, 0.42, 0.16]}
        fontSize={0.08}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
      >
        {reading.toFixed(3)}g
      </Text>
      {/* Buttons */}
      <mesh position={[-1.55, 0.42, 0.15]}>
        <boxGeometry args={[0.06, 0.04, 0.02]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[-1.15, 0.42, 0.15]}>
        <boxGeometry args={[0.06, 0.04, 0.02]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
    </group>
  )
}

// Thermometer with animated mercury
function Thermometer({ temp, visible }: { temp: number; visible: boolean }) {
  const mercuryRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (!mercuryRef.current || !visible) return
    const tempPercent = (Math.min(90, Math.max(20, temp)) - 20) / 70
    mercuryRef.current.scale.y = tempPercent
    mercuryRef.current.position.y = 0.82 + tempPercent * 0.35 / 2
  })

  if (!visible) return null

  return (
    <group position={[-0.8, 0, 0]}>
      {/* Glass tube */}
      <mesh position={[0, 1.25, -0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 12]} />
        <meshPhysicalMaterial
          color="#f8fafc"
          metalness={0.1}
          roughness={0.05}
          transmission={0.8}
          thickness={0.02}
          transparent
          opacity={0.4}
        />
      </mesh>
      {/* Bulb */}
      <mesh position={[0, 0.82, -0.2]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.3} />
      </mesh>
      {/* Mercury column */}
      <mesh ref={mercuryRef} position={[0, 0.82, -0.2]} scale={[1, 0, 1]}>
        <cylinderGeometry args={[0.007, 0.007, 0.7, 10]} />
        <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.5} />
      </mesh>
      {/* Temperature reading */}
      <Text position={[0.12, 1.7, -0.2]} fontSize={0.04} color="#94a3b8" anchorX="left">
        {temp.toFixed(1)}°C
      </Text>
    </group>
  )
}

function Scene({
  setup,
  targets,
  beakerWaterMl,
  flaskMl,
  solidInBeaker,
  dissolved,
  pouringToFlask,
  tempC,
  vapor,
  runningStir,
}: {
  setup: SolutionSetup
  targets: Targets
  beakerWaterMl: number
  flaskMl: number
  solidInBeaker: boolean
  dissolved: number
  pouringToFlask: boolean
  tempC: number
  vapor: number
  runningStir: boolean
}) {
  const beakerLevel = Math.min(0.55, (beakerWaterMl / Math.max(80, targets.volMl)) * 0.55)
  const flaskLevel = Math.min(0.78, (flaskMl / targets.volMl) * 0.78)

  // All solutions are colorless - water-like appearance
  const solutionColor = "#e0f7fa"

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[-0.25, 1.0, -0.2]} intensity={vapor > 0 ? 0.6 : 0.15} color="#f59e0b" />

      {/* Lab bench */}
      <mesh position={[0, 0.05, -0.3]} receiveShadow>
        <boxGeometry args={[4.5, 0.1, 2.2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Digital Balance */}
      <DigitalBalance visible={setup.balance} reading={solidInBeaker ? 0 : targets.grams * dissolved} />

      {/* Beaker with realistic glass */}
      <group visible={setup.beaker}>
        {/* Beaker body */}
        <mesh position={[-0.25, 0.98, -0.3]} rotation={[0, 0, pouringToFlask ? -0.42 : 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.33, 0.82, 28, 1, true]} />
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
        {/* Beaker bottom */}
        <mesh position={[-0.25, 0.57, -0.3]} rotation={[0, 0, pouringToFlask ? -0.42 : 0]}>
          <sphereGeometry args={[0.3, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
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
        {/* Beaker rim */}
        <mesh position={[-0.25, 1.39, -0.3]} rotation={[0, 0, pouringToFlask ? -0.42 : 0]}>
          <torusGeometry args={[0.3, 0.008, 8, 28]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        {/* Volume markings */}
        {Array.from({ length: 6 }, (_, i) => (
          <mesh key={`bmark-${i}`} position={[-0.45, 0.62 + i * 0.11, -0.28]}>
            <boxGeometry args={[0.06, 0.008, 0.008]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
        ))}

        {/* Solution in beaker */}
        <mesh
          position={[-0.25, 0.58 + beakerLevel / 2, -0.3]}
          rotation={[0, 0, pouringToFlask ? -0.42 : 0]}
          visible={beakerWaterMl > 0}
        >
          <cylinderGeometry args={[0.25, 0.27, beakerLevel, 24]} />
          <meshPhysicalMaterial
            color={solutionColor}
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

        {/* Meniscus effect */}
        {beakerWaterMl > 0 && (
          <mesh position={[-0.25, 0.58 + beakerLevel, -0.3]} rotation={[0, 0, pouringToFlask ? -0.42 : 0]}>
            <torusGeometry args={[0.22, 0.012, 8, 24]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color={solutionColor} transparent opacity={0.4} />
          </mesh>
        )}
      </group>

      {/* Solid solute pile */}
      <SolutePile visible={setup.beaker && solidInBeaker && dissolved < 0.99} dissolved={dissolved} solute={targets.solute} />

      {/* Volumetric Flask with realistic glass */}
      <group visible={setup.flask}>
        {/* Flask body */}
        <mesh position={[1.1, 0.9, -0.3]} castShadow>
          <cylinderGeometry args={[0.32, 0.38, 1.0, 28, 1, true]} />
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
        {/* Flask neck */}
        <mesh position={[1.1, 1.55, -0.3]}>
          <cylinderGeometry args={[0.12, 0.12, 0.4, 20]} />
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
        {/* Flask bottom */}
        <mesh position={[1.1, 0.4, -0.3]}>
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
        {/* Calibration mark */}
        <mesh position={[1.1, 1.23, -0.27]}>
          <torusGeometry args={[0.13, 0.006, 6, 24]} rotation={[0, Math.PI / 2, 0]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0284c7" emissiveIntensity={0.3} />
        </mesh>

        {/* Solution in flask */}
        <mesh position={[1.1, 0.48 + flaskLevel / 2, -0.3]} visible={flaskMl > 0}>
          <cylinderGeometry args={[0.26, 0.29, flaskLevel, 24]} />
          <meshPhysicalMaterial
            color={solutionColor}
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

        {/* Meniscus at calibration mark */}
        {flaskMl > targets.volMl * 0.9 && (
          <mesh position={[1.1, 0.48 + flaskLevel, -0.3]}>
            <sphereGeometry args={[0.11, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} rotation={[Math.PI, 0, 0]} />
            <meshStandardMaterial color={solutionColor} transparent opacity={0.5} />
          </mesh>
        )}
      </group>

      {/* Stirring rod */}
      <StirringRod active={runningStir && setup.stirrer} />

      {/* Pouring animation */}
      <PouringStream active={pouringToFlask && setup.beaker && setup.flask} />

      {/* Vapor/fume effects */}
      <VaporParticles amount={vapor} solute={targets.solute} />

      {/* Thermometer */}
      <Thermometer temp={tempC} visible={setup.beaker} />

      {/* Labels */}
      <Text position={[-0.25, 1.6, -0.3]} fontSize={0.05} color="#f8fafc" anchorX="center">
        Beaker
      </Text>
      <Text position={[1.1, 2.0, -0.3]} fontSize={0.05} color="#f8fafc" anchorX="center">
        Volumetric Flask
      </Text>
      <Text position={[-1.35, 0.2, -0.25]} fontSize={0.04} color="#94a3b8" anchorX="center">
        Digital Balance
      </Text>

      <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2.1} target={[0.4, 1, -0.3]} />
    </>
  )
}

export function SolutionPrepSim({
  title,
  setup,
}: {
  title: string
  setup: SolutionSetup
}) {
  const targets = useMemo(() => parseTargets(title), [title])

  const [massG, setMassG] = useState(0)
  const [beakerWaterMl, setBeakerWaterMl] = useState(0)
  const [solidInBeaker, setSolidInBeaker] = useState(false)
  const [dissolved, setDissolved] = useState(0)
  const [flaskMl, setFlaskMl] = useState(0)
  const [tempC, setTempC] = useState(25)
  const [runningStir, setRunningStir] = useState(false)
  const [pouringToFlask, setPouringToFlask] = useState(false)
  const [hazard, setHazard] = useState<string | null>(null)
  const [safeAcidOrder, setSafeAcidOrder] = useState<boolean | null>(null)

  const setupReady = setup.balance && setup.beaker && setup.flask && setup.stirrer
  const massDone = massG >= targets.grams * 0.995
  const waterReady = beakerWaterMl >= Math.min(70, targets.volMl * 0.7)
  const dissolvedDone = dissolved >= 0.99
  const transferredDone = flaskMl >= Math.max(1, Math.min(targets.volMl - 25, targets.volMl * 0.7))
  const finalDone = flaskMl >= targets.volMl

  const currentStep = !massDone
    ? "Step 1: Weigh solute"
    : !waterReady
      ? "Step 2: Add water to beaker"
      : !solidInBeaker
        ? "Step 3: Add solute to water"
        : !dissolvedDone
          ? "Step 4: Stir to dissolve"
          : !transferredDone
            ? "Step 5: Transfer to flask"
            : !finalDone
              ? "Step 6: Make up to calibration mark"
              : "Completed"

  useEffect(() => {
    if (!runningStir) return
    const id = setInterval(() => {
      setDissolved((v) => Math.min(1, v + 0.06))
      setTempC((t) => {
        const peak = targets.solute === "NaOH" || targets.solute === "HCl" ? 38 : 30
        return Math.min(peak, t + 0.7)
      })
    }, 180)
    return () => clearInterval(id)
  }, [runningStir, targets.solute])

  useEffect(() => {
    if (dissolved >= 0.99) setRunningStir(false)
  }, [dissolved])

  const vapor = useMemo(() => {
    if (targets.solute === "NaOH" || targets.solute === "HCl") return Math.max(0, (tempC - 30) / 18)
    return 0
  }, [tempC, targets.solute])

  const attemptTransfer = () => {
    if (!dissolvedDone) return
    setPouringToFlask(true)
    setTimeout(() => {
      setPouringToFlask(false)
      setFlaskMl((v) => Math.min(targets.volMl, v + 20))
      setBeakerWaterMl((v) => Math.max(0, v - 20))
    }, 850)
  }

  const resetAll = () => {
    setMassG(0)
    setBeakerWaterMl(0)
    setSolidInBeaker(false)
    setDissolved(0)
    setFlaskMl(0)
    setTempC(25)
    setRunningStir(false)
    setPouringToFlask(false)
    setHazard(null)
    setSafeAcidOrder(null)
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline">Solute: {targets.solute}</Badge>
        <Badge variant="outline">Target: {targets.molarity} M, {targets.volMl} mL</Badge>
        <Badge variant="outline">Required mass: {targets.grams.toFixed(3)} g</Badge>
        <Badge variant={finalDone ? "default" : "secondary"}>{currentStep}</Badge>
      </div>

      {hazard && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {hazard}
        </div>
      )}

      {!setupReady && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
          Place balance, beaker, volumetric flask, and stirrer first.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button disabled={!setupReady || massDone} onClick={() => setMassG((m) => Math.min(targets.grams, Number((m + 0.05).toFixed(3))))}>
          Add 0.05 g on balance
        </Button>
        <Button disabled={!massDone} onClick={() => setBeakerWaterMl((v) => Math.min(Math.max(70, targets.volMl), v + 10))}>
          Add 10 mL water to beaker
        </Button>
        <Button disabled={!massDone || !waterReady || solidInBeaker} onClick={() => setSolidInBeaker(true)}>
          Add weighed solute to beaker
        </Button>

        {targets.solute === "HCl" && (
          <>
            <Button
              variant="outline"
              disabled={safeAcidOrder === true}
              onClick={() => {
                setSafeAcidOrder(true)
                setHazard(null)
              }}
            >
              Safe: add acid into water
            </Button>
            <Button
              variant="destructive"
              disabled={safeAcidOrder === false}
              onClick={() => {
                setSafeAcidOrder(false)
                setHazard("Wrong order: adding water into acid can cause splash hazard. Use acid into water.")
              }}
            >
              Wrong: add water into acid
            </Button>
          </>
        )}

        <Button
          disabled={!solidInBeaker || runningStir || dissolvedDone || (targets.solute === "HCl" && safeAcidOrder !== true)}
          onClick={() => setRunningStir(true)}
        >
          Start stirring / dissolving
        </Button>
        <Button disabled={!dissolvedDone || pouringToFlask || finalDone} onClick={attemptTransfer}>
          Transfer 20 mL to flask
        </Button>
        <Button disabled={!transferredDone || finalDone} onClick={() => setFlaskMl((v) => Math.min(targets.volMl, v + 10))}>
          Top up 10 mL distilled water
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Balance reading</div>
          <div className="text-xl font-semibold">{massG.toFixed(3)} g</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Beaker volume</div>
          <div className="text-xl font-semibold">{beakerWaterMl.toFixed(0)} mL</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Flask volume</div>
          <div className="text-xl font-semibold">{flaskMl.toFixed(0)} / {targets.volMl} mL</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Dissolved</div>
          <div className="text-xl font-semibold">{(dissolved * 100).toFixed(0)}%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Solution temperature</div>
          <div className="text-xl font-semibold">{tempC.toFixed(1)} deg C</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="destructive" onClick={() => setRunningStir(false)} disabled={!runningStir} className="gap-2">
          <Pause className="w-4 h-4" /> Stop Stir
        </Button>
        <Button variant="outline" onClick={resetAll} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Reset Trial
        </Button>
        <Badge variant={finalDone ? "default" : "secondary"}>
          {finalDone ? `${targets.molarity} M ${targets.solute} prepared` : "In progress"}
        </Badge>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[430px]">
        <Canvas camera={{ position: [0, 2.7, 5.1], fov: 48 }}>
          <Scene
            setup={setup}
            targets={targets}
            beakerWaterMl={beakerWaterMl}
            flaskMl={flaskMl}
            solidInBeaker={solidInBeaker}
            dissolved={dissolved}
            pouringToFlask={pouringToFlask}
            tempC={tempC}
            vapor={vapor}
            runningStir={runningStir}
          />
        </Canvas>
      </div>

      <div className="rounded-lg border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
        Guidance: weigh exact solute first, add water, dissolve fully, transfer to volumetric flask, then add distilled water to the calibration mark. For acids, always add acid into water.
      </div>
    </div>
  )
}
