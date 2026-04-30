"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useMemo, useRef, useState } from "react"
import { RotateCcw } from "lucide-react"
import type { Mesh } from "three"

type Setup = { testTube: boolean; burner: boolean; stirrer: boolean }

function Convection({ heat, visible }: { heat: number; visible: boolean }) {
  const parts = useRef<Mesh[]>([])
  useFrame(({ clock }) => {
    if (!visible) return
    const t = clock.elapsedTime
    parts.current.forEach((p, i) => {
      if (!p) return
      const phase = (t * (0.25 + heat * 0.6) + i * 0.11) % 1
      p.position.y = 0.45 + phase * 0.5
      p.position.x = Math.sin(t * 2 + i) * 0.08
      p.position.z = -0.3 + Math.cos(t * 1.7 + i) * 0.04
    })
  })
  return (
    <group visible={visible}>
      {Array.from({ length: 16 }).map((_, i) => (
        <mesh key={i} ref={(el) => { if (el) parts.current[i] = el }} position={[0, 0.6, -0.3]}>
          <sphereGeometry args={[0.009 + (i % 3) * 0.003, 8, 8]} />
          <meshStandardMaterial color="#e2e8f0" transparent opacity={0.2 + heat * 0.3} />
        </mesh>
      ))}
    </group>
  )
}

function Scene({
  setup,
  temp,
  dissolved,
  solutionColor,
  solidColor,
}: {
  setup: Setup
  temp: number
  dissolved: number
  solutionColor: string
  solidColor: string
}) {
  const level = 0.5
  const heat = Math.max(0, Math.min(1, (temp - 25) / 70))
  return (
    <>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} />
      <pointLight position={[0, 0.55, -0.25]} intensity={setup.burner ? 0.3 + heat * 1.2 : 0.2} color="#fb923c" />
      <mesh position={[0, 0.08, -0.3]}><boxGeometry args={[3.2, 0.16, 1.7]} /><meshStandardMaterial color="#334155" /></mesh>

      <mesh position={[0, 0.95, -0.3]} visible={setup.testTube}><cylinderGeometry args={[0.3, 0.34, 0.85, 24]} /><meshStandardMaterial color="#e2e8f0" transparent opacity={0.2} /></mesh>
      <mesh position={[0, 0.62 + level / 2, -0.3]} visible={setup.testTube}><cylinderGeometry args={[0.24, 0.26, level, 22]} /><meshStandardMaterial color={solutionColor} transparent opacity={0.52} /></mesh>
      <mesh position={[0, 0.52, -0.3]} visible={setup.testTube && dissolved < 1}><cylinderGeometry args={[0.09, 0.11, 0.05 + (1 - dissolved) * 0.12, 16]} /><meshStandardMaterial color={solidColor} /></mesh>

      <mesh position={[0.55, 1.05, -0.2]} rotation={[0, 0, 0.35]} visible={setup.stirrer}><cylinderGeometry args={[0.02, 0.02, 0.95, 10]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
      <mesh position={[0, 0.45, -0.3]} visible={setup.burner}><cylinderGeometry args={[0.16, 0.19, 0.22, 20]} /><meshStandardMaterial color="#64748b" /></mesh>
      {setup.burner && (
        <mesh position={[0, 0.62, -0.3]} scale={[1, 0.8 + heat * 0.5, 1]}>
          <coneGeometry args={[0.11, 0.3, 18]} />
          <meshStandardMaterial color="#fb923c" emissive="#ea580c" emissiveIntensity={1 + heat * 0.8} transparent opacity={0.85} />
        </mesh>
      )}

      <Convection heat={heat} visible={setup.testTube && temp > 35} />

      <mesh position={[-0.7, 1.25, -0.2]} visible={setup.testTube}><boxGeometry args={[0.02, 0.9, 0.02]} /><meshStandardMaterial color="#f8fafc" /></mesh>
      <mesh position={[-0.7, 0.95 + ((Math.min(95, Math.max(20, temp)) - 20) / 75) * 0.35, -0.2]} visible={setup.testTube}><cylinderGeometry args={[0.007, 0.007, 0.36, 10]} /><meshStandardMaterial color="#ef4444" /></mesh>

      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.1} />
    </>
  )
}

export function SolubilityTempSim({
  setup,
  practicalId,
  practicalTitle,
}: {
  setup: Setup
  practicalId?: string
  practicalTitle?: string
}) {
  const [temp, setTemp] = useState(25)
  const [dissolved, setDissolved] = useState(0)
  const ready = setup.testTube && setup.burner && setup.stirrer
  const title = (practicalTitle || "").toLowerCase()
  const isSolubilityCurve = practicalId === "hssc-chem-13" || title.includes("solubility")
  const soluteLabel =
    isSolubilityCurve
      ? "KNO3 in water"
      : "Generic solute in water"
  const solutionColor = isSolubilityCurve ? "#dbeafe" : "#bfdbfe"
  const solidColor = isSolubilityCurve ? "#f8fafc" : "#e2e8f0"
  const dissolveByHeat = isSolubilityCurve ? 0.055 : 0.04
  const dissolveByStir = isSolubilityCurve ? 0.09 : 0.06

  const canHeat = ready && temp < 95
  const onHeat = () => {
    setTemp((t) => Math.min(95, t + 5))
    setDissolved((d) => Math.min(1, d + dissolveByHeat + (temp - 25) / 1000))
  }

  const onStir = () => {
    setDissolved((d) => Math.min(1, d + dissolveByStir + (temp - 25) / 900))
  }

  const observation = useMemo(() => dissolved >= 1 ? "Solute fully dissolved at higher temperature" : "Some undissolved solute remains", [dissolved])

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline">Solute: {soluteLabel}</Badge>
        <Badge variant="outline">Temperature: {temp.toFixed(1)} deg C</Badge>
        <Badge variant="outline">Dissolved: {(dissolved * 100).toFixed(0)}%</Badge>
        <Badge variant={dissolved >= 1 ? "default" : "secondary"}>{observation}</Badge>
      </div>

      {!ready && <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">Place test tube, burner and stirrer first.</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button disabled={!canHeat} onClick={onHeat}>Heat +5 deg C</Button>
        <Button disabled={!ready} onClick={onStir}>Stir to aid dissolving</Button>
        <Button variant="outline" className="gap-2" onClick={() => { setTemp(25); setDissolved(0) }}><RotateCcw className="w-4 h-4" /> Reset</Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[420px]">
        <Canvas camera={{ position: [0, 2.5, 4.7], fov: 48 }}>
          <Scene
            setup={setup}
            temp={temp}
            dissolved={dissolved}
            solutionColor={solutionColor}
            solidColor={solidColor}
          />
        </Canvas>
      </div>
    </div>
  )
}
