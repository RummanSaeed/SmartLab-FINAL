"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Line } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, RotateCcw, CheckCircle2 } from "lucide-react"

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
      <color attach="background" args={["#020817"]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 4, 2]} intensity={1} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 6, 0]}>
        <coneGeometry args={[1.2, 1.2, 3]} />
        <meshPhysicalMaterial color="#a5f3fc" transmission={0.7} transparent opacity={0.55} roughness={0.07} />
      </mesh>

      {step >= 1 && <Line points={[[-2, 0.2, 0], [-0.45, 0.2, 0]]} color="#f59e0b" lineWidth={3} />}
      {step >= 2 && <Line points={[[-0.45, 0.2, 0], [0.2, -0.05, 0]]} color="#22d3ee" lineWidth={3} />}
      {step >= 3 && (
        tir
          ? <Line points={[[0.2, -0.05, 0], [0.95, 0.45, 0]]} color="#f43f5e" lineWidth={3} />
          : <Line points={[[0.2, -0.05, 0], [1.25, -0.6, 0]]} color="#38bdf8" lineWidth={3} />
      )}

      {step >= 2 && <Line points={[[0.2, 0.65, 0], [0.2, -0.75, 0]]} color="#94a3b8" lineWidth={2} />}
      {step >= 1 && <Line points={[[-0.45, 0.2, 0], [-0.45, 0.95, 0]]} color="#94a3b8" lineWidth={2} />}

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
