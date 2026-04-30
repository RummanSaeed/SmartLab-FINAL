"use client"

import { useMemo, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

type Hardness = "soft" | "temporary" | "permanent"

type Method = "boiling" | "washing-soda" | "lime"

function latherScore(hardness: Hardness, method: Method, dose: number) {
  const base = hardness === "soft" ? 0.85 : hardness === "temporary" ? 0.35 : 0.2
  const methodGain =
    method === "boiling"
      ? hardness === "temporary"
        ? 0.5
        : 0.05
      : method === "washing-soda"
        ? 0.55
        : 0.35
  const doseGain = Math.min(0.55, (dose / 100) * methodGain)
  return Math.max(0, Math.min(1, base + doseGain))
}

export type WaterSofteningSetup = {
  beaker: boolean
  soap: boolean
  softener: boolean
  stirrer: boolean
}

function Scene({ setup, foam }: { setup: WaterSofteningSetup; foam: number }) {
  const foamOn = foam > 0
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

      {foamOn && setup.beaker && (
        <mesh position={[0, 0.83, -0.3]}>
          <cylinderGeometry args={[0.24, 0.26, 0.12 + (foam / 100) * 0.18, 24]} />
          <meshStandardMaterial color="#f8fafc" transparent opacity={0.35} />
        </mesh>
      )}

      <mesh position={[1.1, 0.65, -0.25]} visible={setup.soap}>
        <boxGeometry args={[0.36, 0.5, 0.36]} />
        <meshStandardMaterial color="#fde68a" />
      </mesh>
      <mesh position={[-1.1, 0.65, -0.25]} visible={setup.softener}>
        <boxGeometry args={[0.36, 0.5, 0.36]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0.55, 1.1, -0.25]} rotation={[0, 0, 0.45]} visible={setup.stirrer}>
        <cylinderGeometry args={[0.02, 0.02, 1.05, 10]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
    </>
  )
}

export function WaterSofteningSim({ setup }: { setup: WaterSofteningSetup }) {
  const [hardness, setHardness] = useState<Hardness>("temporary")
  const [method, setMethod] = useState<Method>("boiling")
  const [dose, setDose] = useState([50])
  const [shaken, setShaken] = useState(false)

  const setupReady = setup.beaker && setup.soap && setup.softener && setup.stirrer

  const score = useMemo(() => (shaken ? latherScore(hardness, method, dose[0]) : 0), [shaken, hardness, method, dose])

  const foam = Math.round(score * 100)

  const verdict = useMemo(() => {
    if (!shaken) return "Add soap and shake"
    if (foam > 70) return "Good lather: water is effectively softened"
    if (foam > 40) return "Moderate lather: partially softened"
    return "Poor lather: still hard"
  }, [shaken, foam])

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">Softening of Hard Water</div>
          <Badge variant="outline">water-softening</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Compare lather formation before and after applying softening methods.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Water type</div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={hardness === "soft" ? "default" : "outline"} onClick={() => { setHardness("soft"); setShaken(false) }}>Soft</Button>
            <Button size="sm" variant={hardness === "temporary" ? "default" : "outline"} onClick={() => { setHardness("temporary"); setShaken(false) }}>Temporary hard</Button>
            <Button size="sm" variant={hardness === "permanent" ? "default" : "outline"} onClick={() => { setHardness("permanent"); setShaken(false) }}>Permanent hard</Button>
          </div>

          <div className="text-sm font-semibold">Softening method</div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={method === "boiling" ? "default" : "outline"} onClick={() => { setMethod("boiling"); setShaken(false) }}>Boiling</Button>
            <Button size="sm" variant={method === "washing-soda" ? "default" : "outline"} onClick={() => { setMethod("washing-soda"); setShaken(false) }}>Washing soda (Na₂CO₃)</Button>
            <Button size="sm" variant={method === "lime" ? "default" : "outline"} onClick={() => { setMethod("lime"); setShaken(false) }}>Lime (Ca(OH)₂)</Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Dose</span>
              <span>{dose[0]}%</span>
            </div>
            <Slider value={dose} min={0} max={100} step={5} onValueChange={setDose} />
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setShaken(true)} disabled={!setupReady}>Add soap + Shake</Button>
            <Button variant="outline" onClick={() => setShaken(false)}>Reset</Button>
          </div>

          {!setupReady && (
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
              Drag and place beaker, soap, softener, and stirrer first.
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border/60 bg-card/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Observation</div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Lather level</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{shaken ? `${foam}%` : "—"}</div>
            <div className="mt-2 h-2 rounded bg-muted overflow-hidden">
              <div className="h-2 bg-primary" style={{ width: `${foam}%` }} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{verdict}</div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
            <Canvas camera={{ position: [0, 2.55, 4.9], fov: 48 }}>
              <Scene setup={setup} foam={shaken ? foam : 0} />
            </Canvas>
          </div>

          <div className="rounded-md border border-border/60 bg-background/40 p-3">
            <div className="text-xs text-muted-foreground">Conclusion</div>
            <div className="mt-1 font-semibold">
              {shaken
                ? foam > 70
                  ? "Water softened (soap works well)"
                  : "Water still hard (soap forms scum / poor lather)"
                : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
