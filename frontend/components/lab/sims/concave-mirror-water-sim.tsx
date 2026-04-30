"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Line, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, RotateCcw, CheckCircle2 } from "lucide-react"

type Props = {
  radiusCm: number
  depthCm: number
  waterDepthCm: number
}

type Trial = { emptyR: number; waterRApp: number; n: number }
type EqKey = "mirror" | "water" | "pin" | "view"

const EQUIPMENT: Array<{ key: EqKey; label: string }> = [
  { key: "mirror", label: "Concave Mirror" },
  { key: "water", label: "Water Fill" },
  { key: "pin", label: "Pin/Needle" },
  { key: "view", label: "Parallax View" },
]

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function MirrorScene({ radiusCm, waterDepthCm, step }: Props & { step: number }) {
  const scale = 0.08
  const R = radiusCm * scale
  const apparentR = radiusCm / 1.33
  const app = apparentR * scale
  const waterH = clamp(waterDepthCm * 0.08, 0.12, 0.5)

  return (
    <>
      <color attach="background" args={["#020817"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 2]} intensity={1} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[1.1, 1.2, 0.35, 48]} />
        <meshStandardMaterial color="#374151" metalness={0.4} roughness={0.35} />
      </mesh>

      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.9, 0.95, 0.1, 48]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.25} />
      </mesh>

      {step >= 1 && (
        <mesh position={[0, -0.1 + waterH / 2, 0]}>
          <cylinderGeometry args={[0.88, 0.88, waterH, 48]} />
          <meshPhysicalMaterial
            color="#67e8f9"
            transparent
            opacity={0.45}
            transmission={0.7}
            roughness={0.05}
          />
        </mesh>
      )}

      <Line points={[[0, 0.55, 0], [0, -0.05, 0]]} color="#94a3b8" lineWidth={2} />
      {step >= 2 && <Line points={[[0, 0.55, 0], [0.45, 0.18, 0]]} color="#f59e0b" lineWidth={2} />}
      {step >= 3 && <Line points={[[0, 0.55, 0], [0.38, 0.05, 0]]} color="#22d3ee" lineWidth={2} />}

      <mesh position={[0, R * 0.35, 0.05]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>

      {step >= 3 && (
        <mesh position={[0, app * 0.3, 0.05]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial color="#22d3ee" />
        </mesh>
      )}

      {step >= 3 && (
        <Html position={[0.55, 0.25, 0]} center>
          <div className="rounded bg-background/80 px-2 py-1 text-xs border border-border/50">Apparent center</div>
        </Html>
      )}

      <Html position={[-0.55, 0.35, 0]} center>
        <div className="rounded bg-background/80 px-2 py-1 text-xs border border-border/50">Real center</div>
      </Html>

      <OrbitControls enablePan={false} minDistance={2.8} maxDistance={5.5} target={[0, -0.2, 0]} />
    </>
  )
}

export function ConcaveMirrorWaterSim({ radiusCm, depthCm, waterDepthCm }: Props) {
  const [trials, setTrials] = useState<Trial[]>([])
  const [step, setStep] = useState(0)
  const [placed, setPlaced] = useState<Record<EqKey, boolean>>({ mirror: false, water: false, pin: false, view: false })

  const values = useMemo(() => {
    const realR = radiusCm
    const nTrue = 1.33
    const apparentR = realR / nTrue
    const measuredApp = apparentR + (depthCm - 1.5) * 0.04
    const nCalc = realR / measuredApp
    return { realR, measuredApp, nCalc }
  }, [radiusCm, depthCm])

  const meanN = trials.length ? trials.reduce((a, t) => a + t.n, 0) / trials.length : null
  const setupComplete = EQUIPMENT.every((e) => placed[e.key])
  const nextEq = EQUIPMENT.find((e) => !placed[e.key])

  const stepText = [
    "Step 1: Observe empty concave mirror and note real center.",
    "Step 2: Fill mirror with water.",
    "Step 3: Find apparent center by no-parallax view.",
    "Step 4: Compute n = R / R' and record.",
  ][step]

  function placeNext() {
    if (!nextEq) return
    setPlaced((prev) => ({ ...prev, [nextEq.key]: true }))
    setStep((s) => Math.min(s + 1, 3))
  }

  function resetAll() {
    setTrials([])
    setStep(0)
    setPlaced({ mirror: false, water: false, pin: false, view: false })
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Mirror radius (real): {values.realR.toFixed(1)} cm</Badge>
        <Badge variant="outline">Water depth: {waterDepthCm.toFixed(1)} cm</Badge>
        <Badge>{setupComplete ? "Setup complete" : "Setup pending"}</Badge>
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
            <Button variant="outline" onClick={resetAll} className="gap-2">
              <RotateCcw className="w-4 h-4" />Reset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">R (empty)</div><div className="text-lg font-semibold">{values.realR.toFixed(2)} cm</div></div>
          <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">R' (apparent)</div><div className="text-lg font-semibold">{values.measuredApp.toFixed(2)} cm</div></div>
          <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">n = R / R'</div><div className="text-lg font-semibold">{values.nCalc.toFixed(3)}</div></div>
          <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Mean n</div><div className="text-lg font-semibold">{meanN ? meanN.toFixed(3) : "--"}</div></div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep((s) => (s + 1) % 4)} disabled={!setupComplete}>Next Step</Button>
        <Button
          onClick={() =>
            setTrials((p) =>
              [...p, { emptyR: Number(values.realR.toFixed(2)), waterRApp: Number(values.measuredApp.toFixed(2)), n: Number(values.nCalc.toFixed(3)) }].slice(-6),
            )
          }
          className="gap-2"
          disabled={!setupComplete}
        >
          <CheckCircle className="w-4 h-4" />Record Trial
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
        <Canvas camera={{ position: [2.8, 1.2, 3.1], fov: 45 }}>
          <MirrorScene radiusCm={radiusCm} depthCm={depthCm} waterDepthCm={waterDepthCm} step={step} />
        </Canvas>
      </div>
    </div>
  )
}
