"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Line } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, RotateCcw, CheckCircle2 } from "lucide-react"

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
      <color attach="background" args={["#020817"]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 2]} intensity={1} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[1.1, 1.1, 3]} />
        <meshPhysicalMaterial color="#bfdbfe" transparent opacity={0.5} transmission={0.7} roughness={0.05} />
      </mesh>

      {step >= 1 && <Line points={[[-2, 0.15, 0], [-0.6, 0.15, 0]]} color="#f59e0b" lineWidth={3} />}
      {step >= 2 && <Line points={[[-0.6, 0.15, 0], [0.2, -0.05, 0]]} color="#22d3ee" lineWidth={3} />}
      {step >= 3 && <Line points={[[0.2, -0.05, 0], [1.45, 0.2, 0]]} color="#38bdf8" lineWidth={3} />}

      <OrbitControls enablePan={false} minDistance={2.7} maxDistance={5.7} target={[0, 0, 0]} />
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
