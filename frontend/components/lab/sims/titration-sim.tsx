"use client"

import { useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, RotateCcw } from "lucide-react"
import type { Mesh } from "three"

type Props = {
  analyte: "NaOH" | "HCl" | "Na2CO3" | "Oxalic"
  analyteM: number
  titrantM: number
  aliquotMl: number
  practicalId?: string
  practicalTitle?: string
}

type Trial = { burette: number; calcM: number }

function DropStream({ active, level }: { active: boolean; level: number }) {
  const drops = useRef<Mesh[]>([])
  useFrame(({ clock }) => {
    if (!active) return
    const t = clock.elapsedTime
    drops.current.forEach((d, i) => {
      if (!d) return
      d.position.y = 1.5 - ((t * 1.7 + i * 0.18) % 1.9)
      d.visible = level > 0.03
    })
  })

  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} ref={(el) => { if (el) drops.current[i] = el }} position={[0.05, 1.5 - i * 0.2, 0]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color="#93c5fd" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Scene({ addedMl, eqVolume }: { addedMl: number; eqVolume: number }) {
  const buretteFill = Math.max(0, 1 - addedMl / Math.max(eqVolume * 1.8, 1))

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#0b1220" />
      </mesh>

      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 2.4, 24]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.2} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.38 + buretteFill * 0.75, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 1.5 * buretteFill, 20]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0.02, -0.62, 0]}>
        <boxGeometry args={[0.08, 0.05, 0.08]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>

      <DropStream active={addedMl > 0.01} level={buretteFill} />

      <mesh position={[0, -0.58, 0]}>
        <cylinderGeometry args={[0.95, 0.85, 0.16, 32]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, -0.32, 0]}>
        <cylinderGeometry args={[0.62, 0.45, 0.66, 40]} />
        <meshStandardMaterial color="#bfdbfe" transparent opacity={0.2} />
      </mesh>
      <OrbitControls enablePan={false} minDistance={2.8} maxDistance={6.8} />
    </>
  )
}

export function TitrationSim({ analyte, analyteM, titrantM, aliquotMl, practicalId, practicalTitle }: Props) {
  const [addedMl, setAddedMl] = useState(0)
  const [trials, setTrials] = useState<Trial[]>([])
  const title = (practicalTitle || "").toLowerCase()
  const modeLabel =
    practicalId?.startsWith("hssc-chem-") && title.includes("acid")
      ? "Acid-base titration"
      : "Titration"
  const analyteColor = analyte === "NaOH" ? "#f472b6" : analyte === "HCl" ? "#7dd3fc" : analyte === "Na2CO3" ? "#fde68a" : "#c4b5fd"
  const endpointColor = analyte === "HCl" ? "#fef08a" : "#dbeafe"
  const indicatorLabel = analyte === "HCl" ? "Methyl orange range" : "Phenolphthalein range"

  const eqVolume = useMemo(() => {
    return (analyteM * aliquotMl) / Math.max(titrantM, 1e-6)
  }, [analyteM, aliquotMl, titrantM])

  const state = addedMl < eqVolume * 0.95 ? "Before endpoint" : addedMl <= eqVolume * 1.05 ? "Endpoint zone" : "After endpoint"
  const indicator = addedMl < eqVolume ? "Initial indicator color" : "Endpoint crossed"
  const calcM = (titrantM * addedMl) / Math.max(aliquotMl, 1e-6)
  const meanM = trials.length ? trials.reduce((a, t) => a + t.calcM, 0) / trials.length : null

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{modeLabel}</Badge>
        <Badge variant="outline">Analyte: {analyte}</Badge>
        <Badge variant="outline">Aliquot: {aliquotMl.toFixed(1)} mL</Badge>
        <Badge variant="outline">Titrant: {titrantM.toFixed(3)} M</Badge>
        <Badge>{state}</Badge>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[280px]">
        <Canvas camera={{ position: [0, 1.8, 4.3], fov: 42 }}>
          <color attach="background" args={["#020817"]} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 5, 3]} intensity={1.1} />
          <Scene addedMl={addedMl} eqVolume={eqVolume} />
          <mesh position={[0, -0.55, 0]}>
            <cylinderGeometry args={[0.52, 0.38, 0.2, 40]} />
            <meshStandardMaterial
              color={addedMl < eqVolume ? analyteColor : endpointColor}
              transparent
              opacity={0.72}
              emissive={addedMl >= eqVolume * 0.95 && addedMl <= eqVolume * 1.05 ? "#fde68a" : "#000000"}
              emissiveIntensity={addedMl >= eqVolume * 0.95 && addedMl <= eqVolume * 1.05 ? 0.2 : 0}
            />
          </mesh>
        </Canvas>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Added from burette</div><div className="text-lg font-semibold">{addedMl.toFixed(2)} mL</div></div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Expected endpoint</div><div className="text-lg font-semibold">{eqVolume.toFixed(2)} mL</div></div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Indicator</div><div className="text-lg font-semibold">{indicator}</div></div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Indicator range</div><div className="text-lg font-semibold">{indicatorLabel}</div></div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Calculated M</div><div className="text-lg font-semibold">{calcM.toFixed(3)} M</div></div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Mean M</div><div className="text-lg font-semibold">{meanM ? meanM.toFixed(3) : "--"} M</div></div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
        <div className="text-sm text-muted-foreground">Burette control (fine drop near endpoint):</div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setAddedMl((v) => Math.max(0, v - 0.5))}>-0.5 mL</Button>
          <Button size="sm" variant="outline" onClick={() => setAddedMl((v) => Math.max(0, v - 0.1))}>-0.1 mL</Button>
          <Button size="sm" onClick={() => setAddedMl((v) => v + 0.1)}>+0.1 mL</Button>
          <Button size="sm" onClick={() => setAddedMl((v) => v + 0.5)}>+0.5 mL</Button>
          <Button size="sm" variant="outline" onClick={() => setAddedMl(eqVolume)}>Set to endpoint</Button>
        </div>
        <div className="h-4 rounded bg-muted overflow-hidden">
          <div className="h-full bg-cyan-500" style={{ width: `${Math.min(100, (addedMl / (eqVolume * 1.6)) * 100)}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => setTrials((p) => [...p, { burette: Number(addedMl.toFixed(2)), calcM: Number(calcM.toFixed(3)) }].slice(-8))} className="gap-2"><CheckCircle className="w-4 h-4" />Record Trial</Button>
        <Button variant="outline" onClick={() => { setTrials([]); setAddedMl(0) }} className="gap-2"><RotateCcw className="w-4 h-4" />Reset</Button>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4">
        <div className="font-semibold mb-2">Observation Table</div>
        {trials.length === 0 ? <div className="text-sm text-muted-foreground">No trials yet.</div> : (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2 text-muted-foreground"><div>#</div><div>Burette (mL)</div><div>Calculated M</div></div>
            {trials.map((t, i) => <div key={i} className="grid grid-cols-3 gap-2 border-t border-border/40 pt-2"><div>{i + 1}</div><div>{t.burette.toFixed(2)}</div><div>{t.calcM.toFixed(3)}</div></div>)}
          </div>
        )}
      </div>
    </div>
  )
}
