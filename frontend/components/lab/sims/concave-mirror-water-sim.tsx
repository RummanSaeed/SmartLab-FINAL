"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Line, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, RotateCcw, CheckCircle2 } from "lucide-react"
import { LabEnvironment } from "@/components/lab/lab-environment"

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
      <LabEnvironment benchY={-1.1} benchSize={10} />

      {/* Mirror stand base */}
      <mesh position={[0, -0.45, 0]} castShadow>
        <cylinderGeometry args={[1.4, 1.5, 0.15, 48]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* Mirror rim/dish */}
      <mesh position={[0, -0.28, 0]} castShadow>
        <cylinderGeometry args={[1.15, 1.25, 0.2, 64]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Mirror reflective surface - concave */}
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.95, 0.85, 0.08, 64, 1, true]} />
        <meshStandardMaterial 
          color="#e2e8f0" 
          metalness={0.95} 
          roughness={0.05} 
          envMapIntensity={1}
        />
      </mesh>

      {/* Water in mirror */}
      {step >= 1 && (
        <mesh position={[0, -0.14 + waterH / 2, 0]}>
          <cylinderGeometry args={[0.88, 0.88, waterH, 64]} />
          <meshPhysicalMaterial
            color="#06b6d4"
            transparent
            opacity={0.35}
            transmission={0.85}
            roughness={0.02}
            ior={1.33}
            thickness={0.5}
            attenuationColor="#0891b2"
            attenuationDistance={0.5}
          />
        </mesh>
      )}

      {/* Water surface meniscus effect */}
      {step >= 1 && (
        <mesh position={[0, -0.14 + waterH, 0]}>
          <cylinderGeometry args={[0.88, 0.88, 0.005, 64]} />
          <meshPhysicalMaterial
            color="#22d3ee"
            transparent
            opacity={0.6}
            transmission={0.9}
            roughness={0.01}
          />
        </mesh>
      )}

      {/* Measurement rod stand */}
      <mesh position={[-0.8, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 12]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Horizontal measurement scale */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[2.4, 0.015, 0.04]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Tick marks on scale */}
      {Array.from({ length: 13 }).map((_, i) => (
        <mesh key={i} position={[-1.1 + i * 0.183, 0.54, 0]}>
          <boxGeometry args={[0.01, 0.025, 0.015]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      ))}

      {/* Radius measurement line - gold */}
      <Line points={[[0, 0.55, 0], [0, -0.18, 0]]} color="#f59e0b" lineWidth={2.5} />
      
      {/* Apparent radius line - cyan (with water) */}
      {step >= 1 && (
        <Line points={[[0, 0.55, 0], [0, -0.14 + waterH - 0.05, 0]]} color="#22d3ee" lineWidth={2.5} />
      )}

      {/* Real center marker (gold sphere) */}
      <mesh position={[0, -0.18, 0.05]}>
        <sphereGeometry args={[0.04, 24, 24]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.2} />
      </mesh>

      {/* Apparent center marker (cyan sphere with water) */}
      {step >= 1 && (
        <mesh position={[0, app * 0.35 - 0.05, 0.05]}>
          <sphereGeometry args={[0.04, 24, 24]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.2} />
        </mesh>
      )}

      {/* Labels */}
      <Html position={[-0.65, 0.6, 0]} center>
        <div className="rounded bg-background/90 px-2 py-1 text-xs border border-border/50 font-mono">Scale</div>
      </Html>

      {step >= 2 && (
        <Html position={[0.65, 0.35, 0]} center>
          <div className="rounded bg-cyan-500/20 px-2 py-1 text-xs border border-cyan-500/50 text-cyan-300">Apparent center</div>
        </Html>
      )}

      <Html position={[-0.65, 0, 0]} center>
        <div className="rounded bg-amber-500/20 px-2 py-1 text-xs border border-amber-500/50 text-amber-300">Real center (R)</div>
      </Html>

      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={5.5} target={[0, -0.15, 0]} />
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
