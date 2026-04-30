"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

type Sample = { id: string; name: string; ph: number }

type Indicator = {
  id: string
  name: string
  range: [number, number]
  acidColor: string
  baseColor: string
}

const samples: Sample[] = [
  { id: "hcl", name: "Dilute HCl", ph: 2 },
  { id: "acetic", name: "Acetic acid", ph: 4 },
  { id: "water", name: "Water", ph: 7 },
  { id: "nh4oh", name: "Ammonium hydroxide", ph: 10 },
  { id: "naoh", name: "NaOH", ph: 12 },
]

const indicators: Indicator[] = [
  { id: "litmus", name: "Litmus", range: [6.0, 8.0], acidColor: "#ef4444", baseColor: "#3b82f6" },
  { id: "phenol", name: "Phenolphthalein", range: [8.2, 10.0], acidColor: "#e5e7eb", baseColor: "#ec4899" },
  { id: "methyl", name: "Methyl orange", range: [3.1, 4.4], acidColor: "#ef4444", baseColor: "#f59e0b" },
]

function indicatorColor(ind: Indicator, ph: number) {
  const [a, b] = ind.range
  if (ph <= a) return ind.acidColor
  if (ph >= b) return ind.baseColor
  const t = (ph - a) / (b - a)
  return t < 0.5 ? ind.acidColor : ind.baseColor
}

export type IndicatorPanelSetup = {
  testTube: boolean
  dropper: boolean
  indicators: boolean
}

function Scene({ setup, tinted }: { setup: IndicatorPanelSetup; tinted: boolean }) {
  return (
    <>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} />

      <mesh position={[0, 0.08, -0.3]}>
        <boxGeometry args={[3.2, 0.16, 1.6]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      <mesh position={[0, 1.02, -0.3]} visible={setup.testTube}>
        <cylinderGeometry args={[0.16, 0.18, 1.15, 22]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 0.66, -0.3]} visible={setup.testTube}>
        <cylinderGeometry args={[0.12, 0.14, 0.55, 22]} />
        <meshStandardMaterial color={tinted ? "#ec4899" : "#60a5fa"} transparent opacity={0.6} emissive={tinted ? "#ec4899" : "#60a5fa"} emissiveIntensity={0.1} />
      </mesh>

      <mesh position={[0.55, 1.2, -0.25]} visible={setup.dropper}>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 12]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[1.1, 0.65, -0.25]} visible={setup.indicators}>
        <boxGeometry args={[0.36, 0.5, 0.36]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
    </>
  )
}

export function IndicatorPanelSim({ setup }: { setup: IndicatorPanelSetup }) {
  const [sampleIdx, setSampleIdx] = useState(0)
  const [strength, setStrength] = useState([100])
  const [tested, setTested] = useState(false)

  const sample = samples[sampleIdx] || samples[0]

  const effectivePh = useMemo(() => {
    const scale = Math.max(0.4, Math.min(1.0, strength[0] / 100))
    const pull = (sample.ph - 7) * scale
    return Number((7 + pull).toFixed(1))
  }, [sample.ph, strength])

  const setupReady = setup.testTube && setup.dropper && setup.indicators

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">Indicator Panel (Acid/Base/Neutral)</div>
          <Badge variant="outline">indicator-panel</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1">Test the sample with different indicators and classify it.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Sample</div>
          <div className="flex flex-wrap gap-2">
            {samples.map((s, idx) => (
              <Button key={s.id} size="sm" variant={idx === sampleIdx ? "default" : "outline"} onClick={() => { setSampleIdx(idx); setTested(false) }}>
                {s.name}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Concentration</span>
              <span>{strength[0]}%</span>
            </div>
            <Slider value={strength} min={40} max={100} step={5} onValueChange={setStrength} />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setTested(true)} disabled={!setupReady}>Test with indicators</Button>
            <Button variant="outline" onClick={() => setTested(false)}>Reset</Button>
          </div>

          {!setupReady && (
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
              Drag and place test tube, dropper, and indicators first.
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Results</div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Effective pH (for simulation)</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{tested ? effectivePh : "—"}</div>
          </div>

          <div className="space-y-2">
            {indicators.map((ind) => {
              const col = tested ? indicatorColor(ind, effectivePh) : "#e5e7eb"
              return (
                <div key={ind.id} className="rounded-md border border-border/60 bg-background/40 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{ind.name}</div>
                    <div className="h-6 w-16 rounded" style={{ background: col }} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Transition range: {ind.range[0]}–{ind.range[1]}</div>
                </div>
              )
            })}
          </div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Conclusion</div>
            <div className="mt-1 font-semibold">
              {!tested ? "—" : effectivePh < 7 ? "Acid" : effectivePh > 7 ? "Base" : "Neutral"}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
            <Canvas camera={{ position: [0, 2.55, 4.9], fov: 48 }}>
              <Scene setup={setup} tinted={Boolean(tested)} />
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  )
}
