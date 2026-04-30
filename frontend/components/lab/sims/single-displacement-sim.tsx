"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

type Metal = { id: string; name: string; reactivity: number }

type SaltSolution = {
  id: string
  name: string
  metalId: string
  color: string
  productColor: string
}

const metals: Metal[] = [
  { id: "zn", name: "Zinc (Zn)", reactivity: 8 },
  { id: "fe", name: "Iron (Fe)", reactivity: 6 },
  { id: "cu", name: "Copper (Cu)", reactivity: 2 },
]

const solutions: SaltSolution[] = [
  { id: "cuso4", name: "Copper sulfate (CuSO₄)", metalId: "cu", color: "#60a5fa", productColor: "#22c55e" },
  { id: "znso4", name: "Zinc sulfate (ZnSO₄)", metalId: "zn", color: "#93c5fd", productColor: "#93c5fd" },
  { id: "feso4", name: "Iron sulfate (FeSO₄)", metalId: "fe", color: "#a7f3d0", productColor: "#a7f3d0" },
]

export type SingleDisplacementSetup = {
  testTube: boolean
  saltSolution: boolean
  metalStrip: boolean
}

function Scene({ setup, progress, liquidColor }: { setup: SingleDisplacementSetup; progress: number; liquidColor: string }) {
  const depositOn = progress > 0.35
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
      <mesh position={[0, 0.66, -0.3]} visible={setup.saltSolution && setup.testTube}>
        <cylinderGeometry args={[0.12, 0.14, 0.55, 22]} />
        <meshStandardMaterial color={liquidColor} transparent opacity={0.65} emissive={liquidColor} emissiveIntensity={0.12} />
      </mesh>

      <mesh position={[0.12, 0.98, -0.25]} visible={setup.metalStrip && setup.testTube}>
        <cylinderGeometry args={[0.02, 0.02, 0.7, 12]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>
      {depositOn && setup.metalStrip && setup.testTube && (
        <mesh position={[0.12, 0.8, -0.25]}>
          <cylinderGeometry args={[0.027, 0.027, 0.22, 12]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>
      )}

      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
    </>
  )
}

export function SingleDisplacementSim({ setup }: { setup: SingleDisplacementSetup }) {
  const [metalIdx, setMetalIdx] = useState(0)
  const [solIdx, setSolIdx] = useState(0)
  const [temp, setTemp] = useState([25])
  const [started, setStarted] = useState(false)

  const metal = metals[metalIdx] || metals[0]
  const sol = solutions[solIdx] || solutions[0]

  const setupReady = setup.testTube && setup.saltSolution && setup.metalStrip

  const willDisplace = metal.reactivity > (metals.find((m) => m.id === sol.metalId)?.reactivity ?? 0)

  const progress = useMemo(() => {
    if (!started) return 0
    if (!willDisplace) return 0.2
    const k = 0.015 + Math.max(0, (temp[0] - 20)) * 0.004
    return Math.min(1, 0.2 + k * 35)
  }, [started, willDisplace, temp])

  const complete = progress >= 0.95
  const liquidColor = complete && willDisplace ? sol.productColor : sol.color

  const observation = useMemo(() => {
    if (!started) return "Setup: choose metal and salt solution"
    if (!willDisplace) return "No reaction (metal less reactive than ion in solution)"
    if (complete) return "Displacement complete: color change + deposit formed"
    return "Reaction in progress: observe gradual change"
  }, [started, willDisplace, complete])

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">Single Displacement Reaction</div>
          <Badge variant="outline">single-displacement</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          A more reactive metal displaces a less reactive metal from its salt solution.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Select metal strip</div>
          <div className="flex flex-wrap gap-2">
            {metals.map((m, idx) => (
              <Button key={m.id} size="sm" variant={idx === metalIdx ? "default" : "outline"} onClick={() => { setMetalIdx(idx); setStarted(false) }}>
                {m.name}
              </Button>
            ))}
          </div>

          <div className="text-sm font-semibold">Select salt solution</div>
          <div className="flex flex-wrap gap-2">
            {solutions.map((s, idx) => (
              <Button key={s.id} size="sm" variant={idx === solIdx ? "default" : "outline"} onClick={() => { setSolIdx(idx); setStarted(false) }}>
                {s.name}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Temperature</span>
              <span>{temp[0]} °C</span>
            </div>
            <Slider value={temp} min={20} max={60} step={1} onValueChange={setTemp} />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setStarted(true)} disabled={started || !setupReady}>Dip metal</Button>
            <Button variant="outline" onClick={() => setStarted(false)}>Reset</Button>
          </div>

          {!setupReady && (
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
              Drag and place test tube, salt solution, and metal strip first.
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Observation</div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Prediction</div>
            <div className="mt-1 font-semibold">{willDisplace ? "Reaction will occur" : "No displacement"}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Based on reactivity series: {metal.name} vs ion in {sol.name}
            </div>
          </div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Solution color</div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-7 w-7 rounded" style={{ background: sol.color }} />
              <div className="text-xs text-muted-foreground">→</div>
              <div className="h-7 w-7 rounded" style={{ background: complete && willDisplace ? sol.productColor : sol.color }} />
            </div>
          </div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Progress</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{Math.round(progress * 100)}%</div>
            <div className="mt-2 text-xs text-muted-foreground">{observation}</div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
            <Canvas camera={{ position: [0, 2.55, 4.9], fov: 48 }}>
              <Scene setup={setup} progress={progress} liquidColor={liquidColor} />
            </Canvas>
          </div>
        </div>
      </div>
    </div>
  )
}
