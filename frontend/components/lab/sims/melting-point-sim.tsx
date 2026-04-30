"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text, useTexture } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Pause } from "lucide-react"

type Props = {
  temperature: number
  purity: number
  substance?: string
  onRecordReading?: (tempC: number) => void
  onClearReadings?: () => void
}

type PhaseState = "Solid" | "Melting" | "Liquid" | "Solidifying"

type LabState = {
  phase: PhaseState
  meltProgress: number
  solidProgress: number
  flameOn: boolean
  vaporOn: boolean
}

function LabScene({ currentTemp, state }: { currentTemp: number; state: LabState }) {
  const { camera } = useThree()
  const backWallTex = useTexture("/chemistry-laboratory-beakers-test-tubes-colorful-l.jpg")
  const benchTex = useTexture("/virtual-science-laboratory-with-chemistry-beakers-.jpg")

  useMemo(() => {
    camera.position.set(0, 4.8, 8)
    camera.lookAt(0, 1.8, 0)
  }, [camera])

  function FireFlame({ y, scale, core }: { y: number; scale: number; core?: boolean }) {
    const [phase] = useState(() => Math.random() * Math.PI * 2)
    const ref = useRef<any>(null)
    useFrame(({ clock }) => {
      if (!ref.current) return
      const f = Math.sin(clock.elapsedTime * 9 + phase) * 0.12
      ref.current.scale.y = scale + f
      ref.current.scale.x = 1 + f * 0.2
      ref.current.scale.z = 1 + f * 0.15
      ref.current.position.y = y + Math.abs(f) * 0.05
    })
    return (
      <mesh ref={ref} position={[0, y, 0.15]} visible={state.flameOn}>
        <coneGeometry args={[core ? 0.1 : 0.17, core ? 0.42 : 0.58, 24]} />
        <meshStandardMaterial
          color={core ? "#fde68a" : "#fb923c"}
          emissive={core ? "#f59e0b" : "#f97316"}
          emissiveIntensity={core ? 1.8 : 1.35}
          transparent
          opacity={core ? 0.9 : 0.82}
        />
      </mesh>
    )
  }

  function VaporParticle({ i }: { i: number }) {
    const [phase] = useState(() => Math.random() * Math.PI * 2)
    const [sx] = useState(() => (Math.random() - 0.5) * 0.25)
    const [sz] = useState(() => (Math.random() - 0.5) * 0.15)
    const ref = useRef<any>(null)

    useFrame(({ clock }) => {
      if (!ref.current) return
      const t = clock.elapsedTime * 1.3 + phase + i * 0.2
      const y = 1.8 + (t % 2.1) * 0.35
      ref.current.position.set(0.08 + sx + Math.sin(t) * 0.02, y, sz)
      ref.current.material.opacity = Math.max(0, 0.35 - (y - 1.8) * 0.12)
    })

    return (
      <mesh ref={ref} visible={state.vaporOn}>
        <sphereGeometry args={[0.03, 10, 10]} />
        <meshStandardMaterial color="#d1d5db" transparent opacity={0.25} />
      </mesh>
    )
  }

  function SmokeParticle({ i }: { i: number }) {
    const [phase] = useState(() => Math.random() * Math.PI * 2)
    const [sx] = useState(() => (Math.random() - 0.5) * 0.18)
    const [sz] = useState(() => (Math.random() - 0.5) * 0.14)
    const ref = useRef<any>(null)
    useFrame(({ clock }) => {
      if (!ref.current) return
      const t = clock.elapsedTime * 0.9 + phase + i * 0.13
      const y = 0.95 + (t % 2.6) * 0.33
      ref.current.position.set(sx + Math.sin(t) * 0.02, y, sz)
      ref.current.material.opacity = Math.max(0, 0.22 - (y - 0.95) * 0.08)
    })
    return (
      <mesh ref={ref} visible={state.flameOn}>
        <sphereGeometry args={[0.04, 10, 10]} />
        <meshStandardMaterial color="#9ca3af" transparent opacity={0.15} />
      </mesh>
    )
  }

  const liquidHeight = 0.03 + state.meltProgress * 0.22
  const solidHeight = Math.max(0.03, 0.22 * (1 - state.meltProgress + state.solidProgress * 0.5))

  return (
    <>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} />
      <pointLight position={[0, 1.2, 0.2]} intensity={state.flameOn ? 2.2 : 0.2} color="#fb923c" />

      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial map={benchTex} color="#1e293b" />
      </mesh>
      {/* Realistic lab background wall */}
      <mesh position={[0, 2.2, -2.2]}>
        <planeGeometry args={[8, 4.5]} />
        <meshStandardMaterial map={backWallTex} color="#9ca3af" transparent opacity={0.4} />
      </mesh>
      {/* Chemistry bench */}
      <mesh position={[0, 0.18, -0.55]}>
        <boxGeometry args={[3.9, 0.22, 1.9]} />
        <meshStandardMaterial color="#374151" metalness={0.08} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.4, -1.45]}>
        <boxGeometry args={[4.2, 0.12, 0.2]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      <mesh position={[0, 0.22, -0.55]}>
        <boxGeometry args={[2.4, 0.2, 1.2]} />
        <meshStandardMaterial color="#374151" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[-0.85, 1.4, -0.55]}>
        <cylinderGeometry args={[0.05, 0.05, 2.4, 20]} />
        <meshStandardMaterial color="#6b7280" metalness={0.55} roughness={0.35} />
      </mesh>

      <mesh position={[0, 1.35, -0.55]}>
        <torusGeometry args={[0.62, 0.05, 16, 42]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.3} />
      </mesh>

      <mesh position={[0, 1.38, -0.55]}>
        <boxGeometry args={[1.4, 0.04, 1.4]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
      </mesh>

      <mesh position={[0, 0.58, -0.5]}>
        <cylinderGeometry args={[0.18, 0.22, 0.5, 20]} />
        <meshStandardMaterial color="#64748b" metalness={0.55} roughness={0.35} />
      </mesh>
      <FireFlame y={0.9} scale={0.95} />
      <FireFlame y={1.07} scale={0.72} />
      <FireFlame y={1.03} scale={0.58} core />
      <mesh position={[0, 0.77, -0.4]} visible={state.flameOn}>
        <coneGeometry args={[0.08, 0.22, 18]} />
        <meshStandardMaterial color="#60a5fa" emissive="#1d4ed8" emissiveIntensity={1.7} transparent opacity={0.78} />
      </mesh>

      <mesh position={[0, 2.0, -0.55]}>
        <cylinderGeometry args={[0.5, 0.55, 1.2, 36]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.18} />
      </mesh>
      <mesh position={[0, 1.75, -0.55]}>
        <cylinderGeometry args={[0.44, 0.47, 0.62, 36]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.38} />
      </mesh>

      {/* Thermometer attached near sample tube */}
      <mesh position={[-0.08, 2.14, -0.5]}>
        <cylinderGeometry args={[0.038, 0.038, 1.25, 24]} />
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.92} />
      </mesh>
      {/* Scale backing for readability through beaker glass */}
      <mesh position={[-0.01, 1.98, -0.43]}>
        <boxGeometry args={[0.34, 1.05, 0.01]} />
        <meshStandardMaterial color="#0b1220" transparent opacity={0.45} />
      </mesh>
      <mesh position={[-0.08, 1.52, -0.5]}>
        <sphereGeometry args={[0.05, 18, 18]} />
        <meshStandardMaterial color="#ef4444" emissive="#7f1d1d" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-0.08, 1.62 + Math.min(0.92, Math.max(0.12, currentTemp / 130)) / 2, -0.5]}>
        <cylinderGeometry args={[0.012, 0.012, Math.min(0.92, Math.max(0.12, currentTemp / 130)), 18]} />
        <meshStandardMaterial color="#ef4444" emissive="#7f1d1d" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-0.08, 2.2, -0.56]}>
        <boxGeometry args={[0.07, 0.035, 0.18]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.45} roughness={0.35} />
      </mesh>
      {Array.from({ length: 21 }, (_, idx) => {
        const tempVal = 20 + idx * 5
        const yPos = 1.55 + idx * 0.04
        const major = tempVal % 10 === 0
        return (
          <group key={`thermo-mark-${tempVal}`}>
            <mesh position={[-0.015, yPos, -0.422]}>
              <boxGeometry args={[major ? 0.1 : 0.06, 0.006, 0.006]} />
              <meshStandardMaterial color="#f8fafc" emissive="#94a3b8" emissiveIntensity={0.3} />
            </mesh>
            {major && (
              <Text
                position={[0.08, yPos, -0.42]}
                fontSize={0.055}
                color="#ffffff"
                anchorX="left"
                anchorY="middle"
              >
                {String(tempVal)}
              </Text>
            )}
          </group>
        )
      })}
      {(() => {
        const c = Math.max(20, Math.min(120, currentTemp))
        const y = 1.55 + ((c - 20) / 100) * 0.8
        return (
          <group>
            <mesh position={[-0.01, y, -0.41]}>
              <boxGeometry args={[0.2, 0.007, 0.007]} />
              <meshStandardMaterial color="#22d3ee" emissive="#0e7490" emissiveIntensity={0.8} />
            </mesh>
            <Text position={[0.2, y, -0.41]} fontSize={0.06} color="#22d3ee" anchorX="left" anchorY="middle">
              {currentTemp.toFixed(1)}°C
            </Text>
          </group>
        )
      })()}

      <mesh position={[0.1, 2.12, -0.55]}>
        <cylinderGeometry args={[0.042, 0.042, 1.15, 20]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.16} />
      </mesh>
      <mesh position={[0.1, 1.64 + liquidHeight / 2, -0.55]}>
        <cylinderGeometry args={[0.024, 0.024, liquidHeight, 14]} />
        <meshStandardMaterial color="#fde68a" emissive="#92400e" emissiveIntensity={0.25} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0.1, 1.73 + solidHeight / 2, -0.55]} visible={state.phase !== "Liquid"}>
        <cylinderGeometry args={[0.02, 0.02, solidHeight, 14]} />
        <meshStandardMaterial color={state.phase === "Melting" ? "#fbbf24" : "#f8fafc"} />
      </mesh>

      {Array.from({ length: 16 }, (_, i) => (
        <VaporParticle key={i} i={i} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <SmokeParticle key={`smoke-${i}`} i={i} />
      ))}

      <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2.05} target={[0, 1.8, 0]} />
    </>
  )
}

export function MeltingPointSim({ temperature, purity, substance, onRecordReading, onClearReadings }: Props) {
  const [isRunning, setIsRunning] = useState(false)
  const [cycle, setCycle] = useState<"heating" | "cooling">("heating")
  const [currentTemp, setCurrentTemp] = useState(temperature)
  const [rate, setRate] = useState(1.6)
  const [trialNoise, setTrialNoise] = useState(0)
  const [meltStartObserved, setMeltStartObserved] = useState<number | null>(null)
  const [meltEndObserved, setMeltEndObserved] = useState<number | null>(null)
  const [hasAutoPausedAtMeltStart, setHasAutoPausedAtMeltStart] = useState(false)

  const preset = useMemo(() => {
    const name = (substance || "").toLowerCase()
    if (name.includes("naphthalene")) return { mp: 80.2, solidify: 79.4 }
    if (name.includes("biphenyl")) return { mp: 69.2, solidify: 68.5 }
    return { mp: 80.2, solidify: 79.4 }
  }, [substance])

  // Purity effect:
  // lower purity => stronger melting-point depression + broader melt range
  const impurityFraction = Math.max(0, Math.min(1, (100 - purity) / 100))
  const depression = 6.0 * impurityFraction
  const halfRange = 0.7 + 3.3 * impurityFraction
  const solidHalfRange = 0.6 + 2.0 * impurityFraction

  const meltCenter = preset.mp - depression + trialNoise
  const meltStart = meltCenter - halfRange
  const meltEnd = meltCenter + halfRange
  const solidCenter = preset.solidify - depression * 0.7 + trialNoise * 0.85
  const solidifyStart = solidCenter + solidHalfRange
  const solidifyEnd = solidCenter - solidHalfRange

  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => {
      setCurrentTemp((t) => {
        if (cycle === "heating") {
          const next = Math.min(120, t + rate)
          return next
        }
        const next = Math.max(25, t - rate * 0.85)
        if (next <= 26) setIsRunning(false)
        return next
      })
    }, 220)
    return () => clearInterval(id)
  }, [isRunning, cycle, rate])

  useEffect(() => {
    if (!isRunning) {
      setCurrentTemp(temperature)
      setCycle("heating")
    }
  }, [temperature, isRunning])

  const phase: PhaseState = useMemo(() => {
    if (cycle === "heating") {
      if (currentTemp < meltStart) return "Solid"
      if (currentTemp > meltEnd) return "Liquid"
      return "Melting"
    }
    if (currentTemp > solidifyStart) return "Liquid"
    if (currentTemp < solidifyEnd) return "Solid"
    return "Solidifying"
  }, [cycle, currentTemp, meltStart, meltEnd, solidifyStart, solidifyEnd])

  useEffect(() => {
    if (!isRunning || cycle !== "heating") return
    if (meltStartObserved === null && currentTemp >= meltStart) {
      const observed = Number(currentTemp.toFixed(1))
      setMeltStartObserved(observed)
      onRecordReading?.(observed)
      if (!hasAutoPausedAtMeltStart) {
        setIsRunning(false)
        setHasAutoPausedAtMeltStart(true)
      }
    }
    if (meltEndObserved === null && currentTemp >= meltEnd) {
      setMeltEndObserved(Number(currentTemp.toFixed(1)))
    }
  }, [isRunning, cycle, currentTemp, meltStart, meltEnd, meltStartObserved, meltEndObserved, hasAutoPausedAtMeltStart])

  const meltProgress = useMemo(() => {
    if (currentTemp <= meltStart) return 0
    if (currentTemp >= meltEnd) return 1
    return (currentTemp - meltStart) / Math.max(0.0001, meltEnd - meltStart)
  }, [currentTemp, meltStart, meltEnd])

  const solidProgress = useMemo(() => {
    if (currentTemp >= solidifyStart) return 0
    if (currentTemp <= solidifyEnd) return 1
    return (solidifyStart - currentTemp) / Math.max(0.0001, solidifyStart - solidifyEnd)
  }, [currentTemp, solidifyStart, solidifyEnd])

  const sceneState: LabState = {
    phase,
    meltProgress,
    solidProgress,
    flameOn: isRunning && cycle === "heating",
    vaporOn: isRunning && (phase === "Melting" || phase === "Liquid"),
  }
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline">{substance || "Sample"}</Badge>
        <Badge variant="outline">Temp: {currentTemp.toFixed(1)}°C</Badge>
        <Badge variant="outline">Purity: {purity}%</Badge>
        <Badge variant={phase === "Liquid" ? "default" : "secondary"}>State: {phase}</Badge>
        <Badge variant="outline">Cycle: {cycle}</Badge>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => setIsRunning(true)} disabled={isRunning}>
          <Play className="w-4 h-4 mr-2" />
          Run Heating
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            setIsRunning(false)
          }}
          disabled={!isRunning}
        >
          <Pause className="w-4 h-4 mr-2" />
          Stop
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setCycle("cooling")
            setIsRunning(true)
          }}
          disabled={isRunning || currentTemp <= 30}
        >
          Start Cooling
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            const newNoise = (Math.random() - 0.5) * 0.8 // +/- 0.4 C realistic lab spread
            const newRate = 1.5 + Math.random() * 0.3 // small burner variation
            setTrialNoise(Number(newNoise.toFixed(3)))
            setRate(Number(newRate.toFixed(2)))
            setCurrentTemp(temperature)
            setCycle("heating")
            setMeltStartObserved(null)
            setMeltEndObserved(null)
            setHasAutoPausedAtMeltStart(false)
            setIsRunning(true)
          }}
          disabled={isRunning}
        >
          New Trial
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setIsRunning(false)
            setCurrentTemp(temperature)
            setCycle("heating")
            setTrialNoise(0)
            setRate(1.6)
            setMeltStartObserved(null)
            setMeltEndObserved(null)
            setHasAutoPausedAtMeltStart(false)
            onClearReadings?.()
          }}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Melt start observed</div>
          <div className="text-lg font-semibold">{meltStartObserved !== null ? `${meltStartObserved.toFixed(1)}°C` : "--"}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Melt complete observed</div>
          <div className="text-lg font-semibold">{meltEndObserved !== null ? `${meltEndObserved.toFixed(1)}°C` : "--"}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Current step</div>
          <div className="text-lg font-semibold">{cycle === "heating" ? "Heat sample" : "Cooling optional"}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Student action</div>
          <div className="text-sm font-semibold">
            {meltStartObserved === null ? "Watch sample for first melting sign." : "Note thermometer at melt start."}
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Heating rate</div>
          <div className="text-lg font-semibold">{rate.toFixed(1)} °C/s</div>
        </div>
      </div>

      {meltStartObserved !== null && (
        <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3 text-emerald-300">
          Melting has started. Record thermometer reading now: <span className="font-bold">{meltStartObserved.toFixed(1)}°C</span>
        </div>
      )}

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[420px]">
        <Canvas camera={{ position: [0, 4.8, 8], fov: 45, near: 0.1, far: 1000 }}>
          <LabScene currentTemp={currentTemp} state={sceneState} />
        </Canvas>
      </div>
    </div>
  )
}
