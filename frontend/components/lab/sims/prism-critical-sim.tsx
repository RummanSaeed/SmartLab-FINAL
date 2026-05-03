"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Line } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, RotateCcw, CheckCircle2 } from "lucide-react"
import { LabEnvironment } from "@/components/lab/lab-environment"

type Props = { prismN: number; incidenceDeg: number }
type Trial = { i: number; c: number; n: number }
type EqKey = "prism" | "laser" | "screen" | "protractor"

const EQUIPMENT: Array<{ key: EqKey; label: string }> = [
  { key: "prism", label: "Glass Prism" },
  { key: "laser", label: "Laser Ray Box" },
  { key: "screen", label: "Screen/Sheet" },
  { key: "protractor", label: "Protractor" },
]

function degToRad(d: number) { return (d * Math.PI) / 180 }
function radToDeg(r: number) { return (r * 180) / Math.PI }
function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)) }

function PrismScene({ incidenceDeg, criticalDeg, step }: { incidenceDeg: number; criticalDeg: number; step: number }) {
  const tir = incidenceDeg > criticalDeg

  return (
    <>
      <LabEnvironment benchY={-1.1} benchSize={10} />

      {/* Glass Prism - triangular equilateral */}
      <group position={[0, -0.2, 0]}>
        <mesh rotation={[0, Math.PI / 6, 0]} castShadow>
          <coneGeometry args={[1.3, 1.3, 3]} />
          <meshPhysicalMaterial 
            color="#a5f3fc" 
            transmission={0.8} 
            transparent 
            opacity={0.45} 
            roughness={0.05}
            ior={1.52}
            thickness={0.5}
            attenuationColor="#0891b2"
            attenuationDistance={0.3}
          />
        </mesh>
        {/* Inner highlight */}
        <mesh rotation={[0, Math.PI / 6, 0]} position={[0, 0, 0.05]}>
          <coneGeometry args={[1.1, 1.1, 3]} />
          <meshPhysicalMaterial 
            color="#67e8f9" 
            transmission={0.9} 
            transparent 
            opacity={0.2} 
            roughness={0.02}
          />
        </mesh>
        {/* Prism label */}
        <mesh position={[0, 0.1, 0.8]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.8, 0.2]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
        </mesh>
      </group>

      {/* Laser Ray Box - equipment */}
      {step >= 1 && (
        <group position={[-1.8, 0.2, 0]}>
          {/* Laser housing */}
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.25, 0.25]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Laser aperture */}
          <mesh position={[0.32, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
          </mesh>
          {/* Power indicator */}
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
          </mesh>
          {/* Laser base */}
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[0.5, 0.08, 0.35]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
        </group>
      )}

      {/* Screen for observing rays */}
      {step >= 1 && (
        <group position={[1.8, -0.2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 1.5, 1]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          {/* Screen stand */}
          <mesh position={[-0.15, -0.8, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.6, 12]} rotation={[0, 0, Math.PI / 6]} />
            <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Screen glow when hit by ray */}
          {step >= 3 && !tir && (
            <mesh position={[0.05, -0.4, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
            </mesh>
          )}
        </group>
      )}

      {/* Incident laser ray - with glow */}
      {step >= 1 && (
        <group>
          {/* Outer glow */}
          <Line points={[[-1.5, 0.2, 0], [-0.55, 0.2, 0]]} color="#f59e0b" lineWidth={8} opacity={0.2} />
          {/* Main beam */}
          <Line points={[[-1.5, 0.2, 0], [-0.55, 0.2, 0]]} color="#fbbf24" lineWidth={4} opacity={0.8} />
          {/* Core */}
          <Line points={[[-1.5, 0.2, 0], [-0.55, 0.2, 0]]} color="#fef3c7" lineWidth={2} />
        </group>
      )}

      {/* Internal refracted ray */}
      {step >= 2 && (
        <group>
          <Line points={[[-0.55, 0.2, 0], [0.25, -0.08, 0]]} color="#22d3ee" lineWidth={6} opacity={0.3} />
          <Line points={[[-0.55, 0.2, 0], [0.25, -0.08, 0]]} color="#22d3ee" lineWidth={3} opacity={0.8} />
        </group>
      )}

      {/* Emergent or TIR ray */}
      {step >= 3 && (
        tir
          ? (
            <group>
              {/* Total internal reflection - red glow */}
              <Line points={[[0.25, -0.08, 0], [0.95, 0.5, 0]]} color="#f43f5e" lineWidth={8} opacity={0.25} />
              <Line points={[[0.25, -0.08, 0], [0.95, 0.5, 0]]} color="#f43f5e" lineWidth={4} opacity={0.9} />
              <Line points={[[0.25, -0.08, 0], [0.95, 0.5, 0]]} color="#fecdd3" lineWidth={2} />
            </group>
          )
          : (
            <group>
              {/* Refracted out - blue glow */}
              <Line points={[[0.25, -0.08, 0], [1.6, -0.6, 0]]} color="#38bdf8" lineWidth={8} opacity={0.25} />
              <Line points={[[0.25, -0.08, 0], [1.6, -0.6, 0]]} color="#38bdf8" lineWidth={4} opacity={0.9} />
              <Line points={[[0.25, -0.08, 0], [1.6, -0.6, 0]]} color="#e0f2fe" lineWidth={2} />
            </group>
          )
      )}

      {/* Normal lines at entry and exit */}
      {step >= 2 && (
        <>
          <Line points={[[0.25, 0.7, 0], [0.25, -0.85, 0]]} color="#64748b" lineWidth={2} strokeDasharray={4} opacity={0.6} />
          <Line points={[[-0.55, 0.9, 0], [-0.55, -0.5, 0]]} color="#64748b" lineWidth={2} strokeDasharray={4} opacity={0.6} />
        </>
      )}

      {/* Protractor at entry point */}
      {step >= 1 && (
        <group position={[-0.55, 0.2, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.35, 0.38, 32, 1, 0, Math.PI]} />
            <meshBasicMaterial color="#f8fafc" transparent opacity={0.15} side={2} />
          </mesh>
          {/* Angle markings */}
          {Array.from({ length: 9 }).map((_, i) => {
            const angle = (i * 10 * Math.PI) / 180
            const x = Math.sin(angle) * 0.32
            const y = Math.cos(angle) * 0.32
            const isMajor = i % 2 === 0
            return (
              <mesh key={i} position={[x, y, 0.02]} rotation={[0, 0, -angle]}>
                <boxGeometry args={[isMajor ? 0.015 : 0.008, isMajor ? 0.05 : 0.03, 0.002]} />
                <meshBasicMaterial color={isMajor ? "#e2e8f0" : "#94a3b8"} />
              </mesh>
            )
          })}
          {/* Current angle indicator */}
          <mesh position={[Math.sin(degToRad(incidenceDeg)) * 0.25, Math.cos(degToRad(incidenceDeg)) * 0.25, 0.03]}>
            <sphereGeometry args={[0.02, 12, 12]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      )}

      {/* Critical angle indicator at exit */}
      {step >= 3 && tir && (
        <group position={[0.25, -0.08, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, Math.PI / 3]}>
            <ringGeometry args={[0.25, 0.28, 24, 1, 0, Math.PI]} />
            <meshBasicMaterial color="#f43f5e" transparent opacity={0.2} side={2} />
          </mesh>
          {/* Label removed - invalid <text> element */}
        </group>
      )}

      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={5.5} target={[0, 0, 0]} />
    </>
  )
}

export function PrismCriticalSim({ prismN, incidenceDeg }: Props) {
  const [trials, setTrials] = useState<Trial[]>([])
  const [step, setStep] = useState(0)
  const [placed, setPlaced] = useState<Record<EqKey, boolean>>({ prism: false, laser: false, screen: false, protractor: false })

  const calc = useMemo(() => {
    const c = radToDeg(Math.asin(clamp(1 / prismN, -1, 1)))
    const nFromC = 1 / Math.sin(degToRad(c))
    const tir = incidenceDeg > c
    return { c, nFromC, tir }
  }, [prismN, incidenceDeg])

  const meanC = trials.length ? trials.reduce((a, t) => a + t.c, 0) / trials.length : null
  const setupComplete = EQUIPMENT.every((e) => placed[e.key])
  const nextEq = EQUIPMENT.find((e) => !placed[e.key])

  const stepText = [
    "Step 1: Send light into prism face.",
    "Step 2: Trace internal ray and normal.",
    "Step 3: Increase angle to observe TIR boundary.",
    "Step 4: Record critical angle and compute n.",
  ][step]

  function placeNext() {
    if (!nextEq) return
    setPlaced((prev) => ({ ...prev, [nextEq.key]: true }))
    setStep((s) => Math.min(s + 1, 3))
  }

  function resetAll() {
    setTrials([])
    setStep(0)
    setPlaced({ prism: false, laser: false, screen: false, protractor: false })
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Prism n: {prismN.toFixed(3)}</Badge>
        <Badge variant="outline">Incidence in prism: {incidenceDeg.toFixed(1)} deg</Badge>
        <Badge>{calc.tir ? "Total internal reflection" : "Refraction out"}</Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="font-semibold">Equipment Setup</div>
          <div className="text-sm text-muted-foreground">{setupComplete ? stepText : `Place next: ${nextEq?.label ?? "Done"}`}</div>
          <div className="grid grid-cols-2 gap-2">
            {EQUIPMENT.map((e) => (
              <div key={e.key} className="rounded-lg border border-border/50 bg-background/30 px-3 py-2 text-sm flex items-center justify-between">
                <span>{e.label}</span>
                {placed[e.key] ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="text-xs text-muted-foreground">Not placed</span>}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={placeNext} disabled={setupComplete}>Place Next</Button>
            <Button variant="outline" onClick={resetAll} className="gap-2"><RotateCcw className="w-4 h-4" />Reset</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Critical angle c</div><div className="text-lg font-semibold">{calc.c.toFixed(2)} deg</div></div>
          <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">n = 1/sin c</div><div className="text-lg font-semibold">{calc.nFromC.toFixed(3)}</div></div>
          <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Observed state</div><div className="text-lg font-semibold">{calc.tir ? "TIR" : "Emerges"}</div></div>
          <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Mean c</div><div className="text-lg font-semibold">{meanC ? `${meanC.toFixed(2)} deg` : "--"}</div></div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep((s) => (s + 1) % 4)} disabled={!setupComplete}>Next Step</Button>
        <Button
          onClick={() => setTrials((p) => [...p, { i: incidenceDeg, c: Number(calc.c.toFixed(2)), n: Number(calc.nFromC.toFixed(3)) }].slice(-8))}
          className="gap-2"
          disabled={!setupComplete}
        >
          <CheckCircle className="w-4 h-4" />Record
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[340px]">
        <Canvas camera={{ position: [3, 1.4, 3.6], fov: 45 }}>
          <PrismScene incidenceDeg={incidenceDeg} criticalDeg={calc.c} step={step} />
        </Canvas>
      </div>
    </div>
  )
}
