"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

type Sample = { id: string; name: string; kind: "saturated" | "unsaturated" }

type Reagent = { id: "kmno4" | "bromine"; name: string; color: string; decolorized: string }

const samples: Sample[] = [
  { id: "hexane", name: "Hexane (alkane)", kind: "saturated" },
  { id: "cyclohexene", name: "Cyclohexene (alkene)", kind: "unsaturated" },
  { id: "vegetable", name: "Vegetable oil", kind: "unsaturated" },
]

const reagents: Reagent[] = [
  { id: "kmno4", name: "KMnO₄ (Baeyer test)", color: "#7c3aed", decolorized: "#a3a3a3" },
  { id: "bromine", name: "Bromine water", color: "#f97316", decolorized: "#e5e7eb" },
]

export type UnsaturationSetup = {
  testTube: boolean
  dropper: boolean
  reagentBottle: boolean
}

function Scene({ setup, liquidColor }: { setup: UnsaturationSetup; liquidColor: string }) {
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
        <meshStandardMaterial color={liquidColor} transparent opacity={0.65} emissive={liquidColor} emissiveIntensity={0.12} />
      </mesh>

      <mesh position={[0.55, 1.2, -0.25]} visible={setup.dropper}>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 12]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      <mesh position={[1.1, 0.65, -0.25]} visible={setup.reagentBottle}>
        <boxGeometry args={[0.36, 0.5, 0.36]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
    </>
  )
}

export function UnsaturationTestSim({ setup }: { setup: UnsaturationSetup }) {
  const [sampleIdx, setSampleIdx] = useState(0)
  const [reagentIdx, setReagentIdx] = useState(0)
  const [drops, setDrops] = useState([5])
  const [shaken, setShaken] = useState(false)

  const sample = samples[sampleIdx] || samples[0]
  const reagent = reagents[reagentIdx] || reagents[0]

  const setupReady = setup.testTube && setup.dropper && setup.reagentBottle

  const reactionExtent = useMemo(() => {
    if (!shaken) return 0
    const d = drops[0]
    const base = sample.kind === "unsaturated" ? 0.12 : 0.02
    return Math.min(1, base * d)
  }, [shaken, drops, sample.kind])

  const decolorized = reactionExtent >= 0.55 && sample.kind === "unsaturated"

  const observation = useMemo(() => {
    if (!shaken) return "Add reagent and shake"
    if (sample.kind === "unsaturated") return decolorized ? "Decolorization observed (positive test)" : "Color fading… keep shaking"
    return "No decolorization (negative test)"
  }, [shaken, sample.kind, decolorized])

  const liquidColor = !shaken
    ? reagent.color
    : decolorized
      ? reagent.decolorized
      : reagent.color

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">Test for Unsaturation</div>
          <Badge variant="outline">unsaturation-test</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1">Use KMnO₄ or bromine water to test for C=C bonds.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Select sample</div>
          <div className="flex flex-wrap gap-2">
            {samples.map((s, idx) => (
              <Button key={s.id} size="sm" variant={idx === sampleIdx ? "default" : "outline"} onClick={() => { setSampleIdx(idx); setShaken(false) }}>
                {s.name}
              </Button>
            ))}
          </div>

          <div className="text-sm font-semibold">Select reagent</div>
          <div className="flex flex-wrap gap-2">
            {reagents.map((r, idx) => (
              <Button key={r.id} size="sm" variant={idx === reagentIdx ? "default" : "outline"} onClick={() => { setReagentIdx(idx); setShaken(false) }}>
                {r.name}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Reagent drops</span>
              <span>{drops[0]}</span>
            </div>
            <Slider value={drops} min={1} max={15} step={1} onValueChange={setDrops} />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setShaken(true)} disabled={!setupReady}>Shake test tube</Button>
            <Button variant="outline" onClick={() => setShaken(false)}>Reset</Button>
          </div>

          {!setupReady && (
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
              Drag and place test tube, dropper, and reagent bottle first.
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Observation</div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Test tube color</div>
            <div className="mt-2 h-12 w-full rounded" style={{ background: liquidColor }} />
            <div className="mt-2 text-xs text-muted-foreground">{observation}</div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
            <Canvas camera={{ position: [0, 2.55, 4.9], fov: 48 }}>
              <Scene setup={setup} liquidColor={liquidColor} />
            </Canvas>
          </div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Conclusion</div>
            <div className="mt-1 font-semibold">
              {shaken ? (sample.kind === "unsaturated" ? "Unsaturated compound" : "Saturated compound") : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
