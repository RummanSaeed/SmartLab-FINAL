"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Line } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, RotateCcw, CheckCircle2 } from "lucide-react"
import { LabEnvironment } from "@/components/lab/lab-environment"

type Props = { prismAngleDeg: number; prismN: number; incidenceDeg: number }
type Trial = { i: number; d: number; nearMin: boolean }
type EqKey = "prism" | "raybox" | "screen" | "protractor"

const EQUIPMENT: Array<{ key: EqKey; label: string }> = [
  { key: "prism", label: "Prism" },
  { key: "raybox", label: "Ray Box" },
  { key: "screen", label: "Screen" },
  { key: "protractor", label: "Protractor" },
]

function degToRad(d: number) { return (d * Math.PI) / 180 }
function radToDeg(r: number) { return (r * 180) / Math.PI }
function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)) }

function PrismDeviationScene({ step }: { step: number }) {
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
        {/* Prism base/holder */}
        <mesh position={[0, -0.7, 0]}>
          <boxGeometry args={[0.6, 0.1, 0.4]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Ray Box equipment */}
      {step >= 1 && (
        <group position={[-1.8, 0.15, 0]}>
          {/* Ray box housing */}
          <mesh castShadow>
            <boxGeometry args={[0.7, 0.28, 0.18]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Slit aperture */}
          <mesh position={[0.36, 0, 0]}>
            <boxGeometry args={[0.05, 0.04, 0.18]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.6} />
          </mesh>
          {/* On/off switch */}
          <mesh position={[0, -0.05, 0.12]}>
            <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          {/* Base stand */}
          <mesh position={[0, -0.25, 0]}>
            <boxGeometry args={[0.5, 0.08, 0.35]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      )}

      {/* White screen for measuring deviation */}
      {step >= 3 && (
        <group position={[1.6, 0.2, 0]}>
          {/* Screen panel */}
          <mesh castShadow>
            <boxGeometry args={[0.06, 1.2, 0.8]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
          {/* Screen frame */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.08, 1.25, 0.85]} />
            <meshStandardMaterial color="#334155" wireframe />
          </mesh>
          {/* Stand */}
          <mesh position={[-0.15, -0.9, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 0.5, 12]} rotation={[0, 0, Math.PI / 4]} />
            <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* Protractor for angle measurement */}
      {step >= 2 && (
        <group position={[0, -0.2, 0.1]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.6, 0.63, 64, 1, 0, Math.PI * 1.2]} />
            <meshBasicMaterial color="#f8fafc" transparent opacity={0.12} side={2} />
          </mesh>
          {/* Angle markings */}
          {Array.from({ length: 13 }).map((_, i) => {
            const angle = (i * 10 * Math.PI) / 180 - Math.PI / 6
            const r1 = 0.55
            const r2 = i % 2 === 0 ? 0.62 : 0.58
            return (
              <mesh key={i} position={[
                Math.cos(angle) * (r1 + r2) / 2,
                Math.sin(angle) * (r1 + r2) / 2,
                0.02
              ]} rotation={[0, 0, angle]}>
                <boxGeometry args={[0.005, r2 - r1, 0.002]} />
                <meshBasicMaterial color={i % 2 === 0 ? "#e2e8f0" : "#94a3b8"} />
              </mesh>
            )
          })}
        </group>
      )}

      {/* Incident ray - golden with glow */}
      {step >= 1 && (
        <group>
          <Line points={[[-1.5, 0.15, 0], [-0.55, 0.15, 0]]} color="#f59e0b" lineWidth={8} opacity={0.2} />
          <Line points={[[-1.5, 0.15, 0], [-0.55, 0.15, 0]]} color="#fbbf24" lineWidth={4} opacity={0.8} />
          <Line points={[[-1.5, 0.15, 0], [-0.55, 0.15, 0]]} color="#fef3c7" lineWidth={2} />
        </group>
      )}

      {/* Internal refracted ray - cyan */}
      {step >= 2 && (
        <group>
          <Line points={[[-0.55, 0.15, 0], [0.2, -0.08, 0]]} color="#22d3ee" lineWidth={6} opacity={0.3} />
          <Line points={[[-0.55, 0.15, 0], [0.2, -0.08, 0]]} color="#22d3ee" lineWidth={3} opacity={0.8} />
        </group>
      )}

      {/* Emergent ray - blue */}
      {step >= 3 && (
        <group>
          <Line points={[[0.2, -0.08, 0], [1.55, 0.22, 0]]} color="#38bdf8" lineWidth={8} opacity={0.25} />
          <Line points={[[0.2, -0.08, 0], [1.55, 0.22, 0]]} color="#38bdf8" lineWidth={4} opacity={0.9} />
          <Line points={[[0.2, -0.08, 0], [1.55, 0.22, 0]]} color="#e0f2fe" lineWidth={2} />
        </group>
      )}

      {/* Deviation angle visualization */}
      {step >= 3 && (
        <group position={[0.2, -0.08, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, -Math.PI / 3]}>
            <ringGeometry args={[0.3, 0.33, 24, 1, 0, Math.PI / 2]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} side={2} />
          </mesh>
          {/* Deviation arc */}
          <mesh rotation={[-Math.PI / 2, 0, -Math.PI / 3]}>
            <ringGeometry args={[0.35, 0.35, 64, 1, 0, Math.PI / 3]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} side={2} />
          </mesh>
        </group>
      )}

      {/* Normal lines at entry and exit */}
      {step >= 2 && (
        <>
          <Line points={[[0.2, 0.65, 0], [0.2, -0.85, 0]]} color="#64748b" lineWidth={2} strokeDasharray={4} opacity={0.6} />
          <Line points={[[-0.55, 0.85, 0], [-0.55, -0.55, 0]]} color="#64748b" lineWidth={2} strokeDasharray={4} opacity={0.6} />
        </>
      )}

      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={5.5} target={[0, -0.15, 0]} />
    </>
  )
}

export function PrismDeviationSim({ prismAngleDeg, prismN, incidenceDeg }: Props) {
  const [trials, setTrials] = useState<Trial[]>([])
  const [step, setStep] = useState(0)
  const [placed, setPlaced] = useState<Record<EqKey, boolean>>({ prism: false, raybox: false, screen: false, protractor: false })

  const calc = useMemo(() => {
    const A = degToRad(prismAngleDeg)
    const i = degToRad(incidenceDeg)
    const r1 = Math.asin(clamp(Math.sin(i) / prismN, -1, 1))
    const r2 = A - r1
    const e = Math.asin(clamp(prismN * Math.sin(r2), -1, 1))
    const d = radToDeg(i + e - A)
    const dmin = 2 * radToDeg(Math.asin(prismN * Math.sin(A / 2))) - prismAngleDeg
    return { d, dmin, nearMin: Math.abs(d - dmin) < 1.5 }
  }, [prismAngleDeg, prismN, incidenceDeg])

  const meanD = trials.length ? trials.reduce((a, t) => a + t.d, 0) / trials.length : null
  const setupComplete = EQUIPMENT.every((e) => placed[e.key])
  const nextEq = EQUIPMENT.find((e) => !placed[e.key])

  const stepText = [
    "Step 1: Send incident ray to prism and mark entry.",
    "Step 2: Trace internal refracted path.",
    "Step 3: Mark emergent ray and deviation angle.",
    "Step 4: Repeat to identify minimum deviation.",
  ][step]

  function placeNext() {
    if (!nextEq) return
    setPlaced((prev) => ({ ...prev, [nextEq.key]: true }))
    setStep((s) => Math.min(s + 1, 3))
  }

  function resetAll() {
    setTrials([])
    setStep(0)
    setPlaced({ prism: false, raybox: false, screen: false, protractor: false })
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Prism angle A: {prismAngleDeg.toFixed(1)} deg</Badge>
        <Badge variant="outline">n: {prismN.toFixed(3)}</Badge>
        <Badge variant="outline">Incident i: {incidenceDeg.toFixed(1)} deg</Badge>
        <Badge>{calc.nearMin ? "Near minimum deviation" : "General deviation"}</Badge>
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
          <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Deviation d</div><div className="text-lg font-semibold">{calc.d.toFixed(2)} deg</div></div>
          <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Minimum d_min</div><div className="text-lg font-semibold">{calc.dmin.toFixed(2)} deg</div></div>
          <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Condition</div><div className="text-lg font-semibold">{calc.nearMin ? "i approx e" : "i not equal e"}</div></div>
          <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Mean d</div><div className="text-lg font-semibold">{meanD ? `${meanD.toFixed(2)} deg` : "--"}</div></div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep((s) => (s + 1) % 4)} disabled={!setupComplete}>Next Step</Button>
        <Button
          onClick={() => setTrials((p) => [...p, { i: incidenceDeg, d: Number(calc.d.toFixed(2)), nearMin: calc.nearMin }].slice(-8))}
          className="gap-2"
          disabled={!setupComplete}
        >
          <CheckCircle className="w-4 h-4" />Record
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[340px]">
        <Canvas camera={{ position: [3, 1.8, 3.8], fov: 45 }}>
          <PrismDeviationScene step={step} />
        </Canvas>
      </div>
    </div>
  )
}
