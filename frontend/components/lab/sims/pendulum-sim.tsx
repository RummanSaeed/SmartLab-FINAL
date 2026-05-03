"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Line } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, CheckCircle2, TrendingUp, Calculator } from "lucide-react"
import * as THREE from "three"
import { LabEnvironment } from "@/components/lab/lab-environment"

type Props = {
  lengthM: number
  releaseAngleDeg: number
  oscillationCount: number
}

type EquipmentKey = "stand" | "string" | "bob" | "stopwatch"

const EQUIPMENT: Array<{ key: EquipmentKey; label: string }> = [
  { key: "stand", label: "Retort Stand" },
  { key: "string", label: "Thread" },
  { key: "bob", label: "Pendulum Bob" },
  { key: "stopwatch", label: "Stopwatch" },
]

// Realistic Photogate sensor
function Photogate({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Gate frame */}
      <mesh position={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.04, 0.35, 0.08]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.04, 0.35, 0.08]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -0.18, 0]} castShadow>
        <boxGeometry args={[0.4, 0.04, 0.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* LED indicators */}
      <mesh position={[-0.12, 0.12, 0.04]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.12, 0.12, 0.04]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
      {/* Laser beam */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.002, 0.002, 0.26, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

// Enhanced Protractor with markings
function Protractor({ angle }: { angle: number }) {
  const markings = Array.from({ length: 19 }, (_, i) => {
    const deg = i * 5
    const a = (deg * Math.PI) / 180
    const isMajor = deg % 10 === 0
    return { deg, a, isMajor }
  })

  return (
    <group position={[0, 2.5, 0.12]}>
      <mesh>
        <cylinderGeometry args={[0.28, 0.28, 0.008, 64, 1, true, 0, Math.PI]} />
        <meshStandardMaterial color="#f1f5f9" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.28, 0.008, 8, 64, Math.PI]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      {markings.map(({ deg, a, isMajor }, i) => (
        <group key={i}>
          <mesh position={[Math.sin(a) * 0.25, Math.cos(a) * 0.25, 0.01]} rotation={[0, 0, -a]}>
            <boxGeometry args={[isMajor ? 0.02 : 0.012, isMajor ? 0.06 : 0.035, 0.004]} />
            <meshStandardMaterial color={isMajor ? "#0f172a" : "#64748b"} />
          </mesh>
          {isMajor && (
            <Text
              position={[Math.sin(a) * 0.32, Math.cos(a) * 0.32, 0.015]}
              fontSize={0.035}
              color="#0f172a"
              anchorX="center"
              anchorY="middle"
            >
              {`${deg}°`}
            </Text>
          )}
        </group>
      ))}
      <mesh position={[0, 0, 0.02]}>
        <cylinderGeometry args={[0.015, 0.015, 0.02, 16]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh
        position={[Math.sin(angle * Math.PI / 180) * 0.22, Math.cos(angle * Math.PI / 180) * 0.22, 0.02]}
        rotation={[0, 0, -angle * Math.PI / 180]}
      >
        <boxGeometry args={[0.008, 0.08, 0.005]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

// Trail effect showing pendulum path
function PendulumTrail({ positions }: { positions: THREE.Vector3[] }) {
  const lineRef = useRef<THREE.Line>(null)

  useFrame(() => {
    if (lineRef.current && positions.length > 1) {
      const geometry = lineRef.current.geometry
      const points = positions.slice(-20)
      geometry.setFromPoints(points)
    }
  })

  if (positions.length < 2) return null

  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#f59e0b" transparent opacity={0.3} linewidth={2} />
    </line>
  )
}

function PendulumScene({
  lengthM,
  angleNowRad,
  bobRadius,
  isRunning,
}: {
  lengthM: number
  angleNowRad: number
  bobRadius: number
  isRunning: boolean
}) {
  const pivot = [0, 2.5, 0] as const
  const stringRef = useRef<any>(null)
  const bobRef = useRef<any>(null)
  const trailPositions = useRef<THREE.Vector3[]>([])
  const trailRef = useRef<any>(null)

  useFrame(() => {
    const L = Math.max(0.6, lengthM * 1.6)
    const x = pivot[0] + L * Math.sin(angleNowRad)
    const y = pivot[1] - L * Math.cos(angleNowRad)
    const z = pivot[2]

    if (bobRef.current) {
      bobRef.current.position.set(x, y, z)
      // Update trail when running
      if (isRunning) {
        trailPositions.current.push(new THREE.Vector3(x, y, z))
        if (trailPositions.current.length > 50) trailPositions.current.shift()
      }
    }
    if (stringRef.current) {
      stringRef.current.position.set((pivot[0] + x) / 2, (pivot[1] + y) / 2, z)
      stringRef.current.rotation.set(0, 0, angleNowRad)
      stringRef.current.scale.set(1, L / 2, 1)
    }
    if (trailRef.current && trailPositions.current.length > 1) {
      trailRef.current.geometry.setFromPoints(trailPositions.current)
    }
  })

  return (
    <>
      <LabEnvironment benchY={-0.25} benchSize={14} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[0, 2.5, 2]} intensity={0.5} color="#fbbf24" />

      {/* Base plate */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[4, 0.1, 2.5]} />
        <meshStandardMaterial color="#334155" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Retort Stand Base */}
      <mesh position={[-0.8, 0.05, 0]} castShadow>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.8, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.04, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.5} />
      </mesh>

      {/* Vertical Rod */}
      <mesh position={[-0.8, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 2.8, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Clamp mechanism */}
      <mesh position={[-0.75, 2.5, 0]} castShadow>
        <boxGeometry args={[0.15, 0.08, 0.1]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} />
      </mesh>
      <mesh position={[-0.68, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.06, 12]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} />
      </mesh>

      {/* Horizontal arm */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <boxGeometry args={[1.6, 0.06, 0.08]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Protractor */}
      <Protractor angle={angleNowRad} />

      {/* Pivot point */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>

      {/* Pendulum String */}
      <mesh ref={stringRef as any} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 1, 8]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.1} roughness={0.4} />
      </mesh>

      {/* Pendulum Bob */}
      <mesh ref={bobRef as any} castShadow>
        <sphereGeometry args={[bobRadius, 32, 32]} />
        <meshStandardMaterial
          color="#f59e0b"
          metalness={0.4}
          roughness={0.2}
          emissive="#b45309"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Trail line */}
      {isRunning && (
        <line ref={trailRef}>
          <bufferGeometry />
          <lineBasicMaterial color="#f59e0b" transparent opacity={0.4} linewidth={3} />
        </line>
      )}

      {/* Photogate sensor at bottom position */}
      <Photogate position={[0, -0.05, 0.4]} />

      {/* Length measurement indicator */}
      <Text position={[0.5, 1.5, 0]} fontSize={0.06} color="#94a3b8" anchorX="left">
        L = {lengthM.toFixed(2)} m
      </Text>

      {/* Angle display */}
      <Text
        position={[-0.5, 2.7, 0.2]}
        fontSize={0.05}
        color="#60a5fa"
        anchorX="center"
      >
        θ = {(angleNowRad * 180 / Math.PI).toFixed(1)}°
      </Text>

      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={3}
        maxDistance={10}
        target={[0, 1.5, 0]}
      />
    </>
  )
}

// Graph data point type
type GraphPoint = { L: number; T: number; T2: number }

export function PendulumSim({ lengthM, releaseAngleDeg, oscillationCount }: Props) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [lastTrialTime, setLastTrialTime] = useState<number | null>(null)
  const [trials, setTrials] = useState<number[]>([])
  const [placed, setPlaced] = useState<Record<EquipmentKey, boolean>>({
    stand: false,
    string: false,
    bob: false,
    stopwatch: false,
  })
  const [step, setStep] = useState(0)
  const [graphData, setGraphData] = useState<GraphPoint[]>([])

  const lengthForPhysics = Math.max(0.2, lengthM)
  const angle0 = (releaseAngleDeg * Math.PI) / 180
  const gTheory = 9.81

  const setupComplete = EQUIPMENT.every((e) => placed[e.key])

  const prompts = [
    "Place the stand in setup area.",
    "Attach thread to the stand.",
    "Attach bob at thread end.",
    "Keep stopwatch ready and run trial.",
  ]

  const theoreticalPeriod = useMemo(() => {
    const correction = 1 + (angle0 * angle0) / 16
    return 2 * Math.PI * Math.sqrt(lengthForPhysics / gTheory) * correction
  }, [lengthForPhysics, angle0])

  const targetTime = useMemo(
    () => theoreticalPeriod * Math.max(1, oscillationCount),
    [theoreticalPeriod, oscillationCount],
  )

  const avgTrialTime = useMemo(() => {
    if (trials.length === 0) return null
    return trials.reduce((a, b) => a + b, 0) / trials.length
  }, [trials])

  const avgPeriod = useMemo(() => {
    if (avgTrialTime === null) return null
    return avgTrialTime / Math.max(1, oscillationCount)
  }, [avgTrialTime, oscillationCount])

  const gCalculated = useMemo(() => {
    if (!avgPeriod || avgPeriod <= 0) return null
    return (4 * Math.PI * Math.PI * lengthForPhysics) / (avgPeriod * avgPeriod)
  }, [avgPeriod, lengthForPhysics])

  useEffect(() => {
    setIsRunning(false)
    setElapsed(0)
    setLastTrialTime(null)
    setTrials([])
  }, [lengthM, releaseAngleDeg, oscillationCount])

  useEffect(() => {
    if (!isRunning) return
    const start = performance.now()
    let raf = 0

    const jitterFactor = 1 + (Math.random() - 0.5) * 0.02
    const effectiveTarget = targetTime * jitterFactor

    const tick = (now: number) => {
      const t = (now - start) / 1000
      setElapsed(t)
      if (t >= effectiveTarget) {
        const measured = Number(effectiveTarget.toFixed(2))
        setLastTrialTime(measured)
        setTrials((prev) => [...prev, measured].slice(-6))
        setIsRunning(false)
        setElapsed(measured)
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isRunning, targetTime])

  const angleNowRad = useMemo(() => {
    if (!isRunning) return angle0
    const omega = Math.sqrt(gTheory / lengthForPhysics)
    const damping = 0.03
    return angle0 * Math.exp(-damping * elapsed) * Math.cos(omega * elapsed)
  }, [isRunning, angle0, elapsed, lengthForPhysics])

  const bobRadius = useMemo(
    () => Math.max(0.12, Math.min(0.2, 0.13 + lengthM * 0.02)),
    [lengthM],
  )

  const nextEquipment = EQUIPMENT.find((e) => !placed[e.key])

  function placeNext() {
    if (!nextEquipment) return
    setPlaced((prev) => ({ ...prev, [nextEquipment.key]: true }))
    setStep((s) => Math.min(s + 1, prompts.length - 1))
  }

  function resetSetup() {
    setPlaced({ stand: false, string: false, bob: false, stopwatch: false })
    setStep(0)
    setIsRunning(false)
    setElapsed(0)
    setLastTrialTime(null)
    setTrials([])
    setGraphData([])
  }

  // Add data point to graph when trial completes
  useEffect(() => {
    if (lastTrialTime !== null && !isRunning) {
      const T = lastTrialTime / Math.max(1, oscillationCount)
      const T2 = T * T
      setGraphData((prev) => {
        const exists = prev.some((p) => Math.abs(p.L - lengthM) < 0.01)
        if (exists) {
          return prev.map((p) => (Math.abs(p.L - lengthM) < 0.01 ? { L: lengthM, T, T2 } : p))
        }
        return [...prev, { L: lengthM, T, T2 }].sort((a, b) => a.L - b.L)
      })
    }
  }, [lastTrialTime, isRunning, lengthM, oscillationCount])

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Length: {lengthM.toFixed(2)} m</Badge>
        <Badge variant="outline">Release angle: {releaseAngleDeg} deg</Badge>
        <Badge variant="outline">Oscillations: {oscillationCount}</Badge>
        <Badge>
          {isRunning
            ? `Timer: ${elapsed.toFixed(2)} s`
            : `Last: ${lastTrialTime !== null ? `${lastTrialTime.toFixed(2)} s` : "--"}`}
        </Badge>
        <Badge variant={setupComplete ? "default" : "secondary"}>
          {setupComplete ? "Setup complete" : "Setup pending"}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="font-semibold">Equipment Setup (Drag-Drop Assisted)</div>
          <div className="text-sm text-muted-foreground">{prompts[step]}</div>
          <div className="grid grid-cols-2 gap-2">
            {EQUIPMENT.map((e) => (
              <div key={e.key} className="rounded-lg border border-border/50 bg-background/30 px-3 py-2 text-sm flex items-center justify-between">
                <span>{e.label}</span>
                {placed[e.key] ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-xs text-muted-foreground">Not placed</span>}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={placeNext} disabled={setupComplete} className="gap-2">
              Place Next Equipment
            </Button>
            <Button variant="outline" onClick={resetSetup} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset Setup
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/40 p-4">
          <div className="font-semibold mb-2">Readings</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/60 bg-background/30 p-3">
              <div className="text-xs text-muted-foreground">Theoretical T (s)</div>
              <div className="text-lg font-semibold">{theoreticalPeriod.toFixed(3)}</div>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/30 p-3">
              <div className="text-xs text-muted-foreground">Average T (s)</div>
              <div className="text-lg font-semibold">{avgPeriod !== null ? avgPeriod.toFixed(3) : "--"}</div>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/30 p-3">
              <div className="text-xs text-muted-foreground">g from mean (m/s^2)</div>
              <div className="text-lg font-semibold">{gCalculated !== null ? gCalculated.toFixed(3) : "--"}</div>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/30 p-3">
              <div className="text-xs text-muted-foreground">g theory (m/s^2)</div>
              <div className="text-lg font-semibold">{gTheory.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => {
            setElapsed(0)
            setIsRunning(true)
          }}
          disabled={isRunning || !setupComplete}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          Run Trial
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setIsRunning(false)
            setElapsed(0)
            setLastTrialTime(null)
            setTrials([])
          }}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Trials
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[340px]">
        <Canvas camera={{ position: [4.2, 3.2, 5.2], fov: 45 }}>
          <PendulumScene lengthM={lengthM} angleNowRad={angleNowRad} bobRadius={bobRadius} isRunning={isRunning} />
        </Canvas>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Observation Table */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-4">
          <div className="font-semibold mb-2 flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Observation Table ({oscillationCount} oscillations)
          </div>
          {trials.length === 0 ? (
            <div className="text-sm text-muted-foreground">No trials yet. Complete setup and run at least 3 trials.</div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-5 gap-2 text-muted-foreground text-xs">
                <div>Trial</div>
                <div>L (m)</div>
                <div>t_n (s)</div>
                <div>T (s)</div>
                <div>T² (s²)</div>
              </div>
              {trials.map((t, idx) => {
                const T = t / Math.max(1, oscillationCount)
                return (
                  <div key={idx} className="grid grid-cols-5 gap-2 border-t border-border/40 pt-2 text-sm">
                    <div>{idx + 1}</div>
                    <div>{lengthM.toFixed(2)}</div>
                    <div>{t.toFixed(2)}</div>
                    <div>{T.toFixed(3)}</div>
                    <div>{(T * T).toFixed(3)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* T² vs L Graph */}
        <div className="rounded-xl border border-border/60 bg-card/40 p-4">
          <div className="font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            T² vs L Graph
          </div>
          {graphData.length < 2 ? (
            <div className="text-sm text-muted-foreground h-40 flex items-center justify-center">
              Need at least 2 data points at different lengths
            </div>
          ) : (
            <div className="h-40 relative">
              <svg viewBox="0 0 300 150" className="w-full h-full">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="30" height="15" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 15" fill="none" stroke="#334155" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="300" height="150" fill="url(#grid)" />
                
                {/* Axes */}
                <line x1="30" y1="130" x2="290" y2="130" stroke="#64748b" strokeWidth="2" />
                <line x1="30" y1="130" x2="30" y2="10" stroke="#64748b" strokeWidth="2" />
                
                {/* Labels */}
                <text x="160" y="145" textAnchor="middle" fill="#94a3b8" fontSize="10">Length L (m)</text>
                <text x="12" y="75" textAnchor="middle" fill="#94a3b8" fontSize="10" transform="rotate(-90 12 75)">T² (s²)</text>
                
                {/* Data points and line */}
                {graphData.map((p, i) => {
                  const maxL = Math.max(...graphData.map(d => d.L)) * 1.1
                  const maxT2 = Math.max(...graphData.map(d => d.T2)) * 1.1
                  const x = 30 + (p.L / maxL) * 250
                  const y = 130 - (p.T2 / maxT2) * 110
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="4" fill="#22c55e" />
                      <text x={x + 8} y={y - 5} fill="#22c55e" fontSize="8">({p.L.toFixed(2)}, {p.T2.toFixed(2)})</text>
                    </g>
                  )
                })}
                
                {/* Best fit line */}
                {graphData.length >= 2 && (() => {
                  const n = graphData.length
                  const sumL = graphData.reduce((s, p) => s + p.L, 0)
                  const sumT2 = graphData.reduce((s, p) => s + p.T2, 0)
                  const sumLT2 = graphData.reduce((s, p) => s + p.L * p.T2, 0)
                  const sumL2 = graphData.reduce((s, p) => s + p.L * p.L, 0)
                  const slope = (n * sumLT2 - sumL * sumT2) / (n * sumL2 - sumL * sumL)
                  const intercept = (sumT2 - slope * sumL) / n
                  const maxL = Math.max(...graphData.map(d => d.L)) * 1.1
                  const maxT2 = Math.max(...graphData.map(d => d.T2)) * 1.1
                  const x1 = 30
                  const y1 = 130 - (intercept / maxT2) * 110
                  const x2 = 30 + (maxL / maxL) * 250
                  const y2 = 130 - ((slope * maxL + intercept) / maxT2) * 110
                  return (
                    <g>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" />
                      <text x="200" y="25" fill="#f59e0b" fontSize="9">slope ≈ {slope.toFixed(2)} s²/m</text>
                      <text x="200" y="38" fill="#f59e0b" fontSize="9">g ≈ {(4 * Math.PI * Math.PI / slope).toFixed(2)} m/s²</text>
                    </g>
                  )
                })()}
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
