"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

type Sample = {
  id: string
  name: string
  ph: number
}

const samples: Sample[] = [
  { id: "lemon", name: "Lemon juice", ph: 2.0 },
  { id: "vinegar", name: "Vinegar", ph: 3.0 },
  { id: "water", name: "Distilled water", ph: 7.0 },
  { id: "soap", name: "Soap solution", ph: 10.0 },
  { id: "baking", name: "Baking soda solution", ph: 8.5 },
]

function phToColor(ph: number) {
  const p = Math.max(0, Math.min(14, ph))
  if (p < 3) return "#ef4444" // red
  if (p < 6) return "#f97316" // orange
  if (p < 8) return "#22c55e" // green
  if (p < 11) return "#3b82f6" // blue
  return "#7c3aed" // purple
}

export type PhPaperSetup = {
  beaker: boolean
  dropper: boolean
  paper: boolean
}

function Scene({ setup, stripColor }: { setup: PhPaperSetup; stripColor: string }) {
  return (
    <>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} />

      <mesh position={[0, 0.08, -0.3]}>
        <boxGeometry args={[3.2, 0.16, 1.6]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      <mesh position={[0, 0.92, -0.3]} visible={setup.beaker}>
        <cylinderGeometry args={[0.32, 0.36, 0.95, 24]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 0.62, -0.3]} visible={setup.beaker}>
        <cylinderGeometry args={[0.26, 0.3, 0.45, 24]} />
        <meshStandardMaterial color="#60a5fa" transparent opacity={0.55} />
      </mesh>

      <mesh position={[0.55, 1.2, -0.25]} visible={setup.dropper}>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 12]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      <mesh position={[-0.85, 0.65, -0.15]} rotation={[0, 0, 0.22]} visible={setup.paper}>
        <boxGeometry args={[0.12, 0.55, 0.02]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[-0.85, 0.56, -0.14]} rotation={[0, 0, 0.22]} visible={setup.paper}>
        <boxGeometry args={[0.12, 0.18, 0.021]} />
        <meshStandardMaterial color={stripColor} emissive={stripColor} emissiveIntensity={0.12} />
      </mesh>

      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
    </>
  )
}

export function PhPaperSim({ setup }: { setup: PhPaperSetup }) {
  const [sampleIdx, setSampleIdx] = useState(0)
  const [contamination, setContamination] = useState([0])
  const [dipped, setDipped] = useState(false)
  const [reading, setReading] = useState<number | null>(null)

  const sample = samples[sampleIdx] || samples[0]

  const setupReady = setup.beaker && setup.dropper && setup.paper

  const measuredPh = useMemo(() => {
    if (!dipped) return null
    return reading
  }, [dipped, reading])

  const color = useMemo(() => {
    if (!dipped || measuredPh === null) return "#e5e7eb"
    return phToColor(measuredPh)
  }, [dipped, measuredPh])

  const classification = useMemo(() => {
    if (!dipped || measuredPh === null) return "Not tested"
    if (measuredPh < 7) return "Acidic"
    if (measuredPh > 7) return "Basic"
    return "Neutral"
  }, [dipped, measuredPh])

  const stripColor = dipped && measuredPh !== null ? phToColor(measuredPh) : "#e5e7eb"

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">pH Paper Test</div>
          <Badge variant="outline">ph-paper</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1">Dip pH paper into a sample and match the color to estimate pH.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Sample</div>
          <div className="flex flex-wrap gap-2">
            {samples.map((s, idx) => (
              <Button key={s.id} size="sm" variant={idx === sampleIdx ? "default" : "outline"} onClick={() => { setSampleIdx(idx); setDipped(false) }}>
                {s.name}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Contamination / wet hands</span>
              <span>{contamination[0]}%</span>
            </div>
            <Slider value={contamination} min={0} max={100} step={5} onValueChange={setContamination} />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                const drift = (contamination[0] / 100) * 1.2
                const noise = 0.12
                const val = sample.ph + drift + (Math.sin(sampleIdx * 19.7 + contamination[0] * 0.31) * 0.5) * noise
                setReading(Number(Math.max(0, Math.min(14, val)).toFixed(1)))
                setDipped(true)
              }}
              disabled={!setupReady}
            >
              Dip pH paper
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setDipped(false)
                setReading(null)
              }}
            >
              Reset
            </Button>
          </div>

          {!setupReady && (
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
              Drag and place beaker, dropper, and pH paper first.
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Result</div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Color strip</div>
            <div className="mt-2 h-10 w-full rounded" style={{ background: color }} />
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
            <Canvas camera={{ position: [0, 2.55, 4.9], fov: 48 }}>
              <Scene setup={setup} stripColor={stripColor} />
            </Canvas>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-border/60 bg-background/40 p-3">
              <div className="text-xs text-muted-foreground">Estimated pH</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{measuredPh === null ? "—" : measuredPh}</div>
            </div>
            <div className="rounded-md border border-border/60 bg-background/40 p-3">
              <div className="text-xs text-muted-foreground">Nature</div>
              <div className="mt-1 text-2xl font-bold">{classification}</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Note: contamination can slightly shift the observed color and your estimated pH.
          </div>
        </div>
      </div>
    </div>
  )
}
