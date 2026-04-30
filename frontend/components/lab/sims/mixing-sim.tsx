"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import { RotateCcw } from "lucide-react"

type Setup = { beakerA: boolean; beakerB: boolean; stirrer: boolean }
type VisualProfile = {
  caseLabel: string
  modeLabel: string
  topColor: string
  bottomColor: string
  mixedColor: string
  mixGain: number
  settleLoss: number
  emulsionGain: number
}

function Scene({
  setup,
  mode,
  shake,
  blend,
  profile,
}: {
  setup: Setup
  mode: "miscible" | "immiscible"
  shake: number
  blend: number
  profile: VisualProfile
}) {
  const mixed = mode === "miscible"
  const topLayer = mixed ? 0.0 : 0.24 * (1 - blend * 0.7)
  const bottomLayer = mixed ? 0.0 : 0.24 * (1 - blend * 0.7)
  const mixedOpacity = mixed ? 0.15 + blend * 0.45 : blend * 0.35
  return (
    <>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} />

      <mesh position={[0, 0.08, -0.3]}><boxGeometry args={[3.4, 0.16, 1.7]} /><meshStandardMaterial color="#334155" /></mesh>

      <mesh position={[-0.8, 0.92, -0.3]} visible={setup.beakerA}><cylinderGeometry args={[0.28,0.31,0.8,24]} /><meshStandardMaterial color="#e2e8f0" transparent opacity={0.2} /></mesh>
      <mesh position={[-0.8,0.67,-0.3]} visible={setup.beakerA}><cylinderGeometry args={[0.23,0.25,0.5,24]} /><meshStandardMaterial color={profile.bottomColor} transparent opacity={0.52} /></mesh>

      <mesh position={[0.7, 0.92, -0.3]} visible={setup.beakerB}><cylinderGeometry args={[0.28,0.31,0.8,24]} /><meshStandardMaterial color="#e2e8f0" transparent opacity={0.2} /></mesh>
      {!mixed && (<>
        <mesh position={[0.7,0.8,-0.3]} visible={setup.beakerB}><cylinderGeometry args={[0.23,0.25,topLayer,24]} /><meshStandardMaterial color={profile.topColor} transparent opacity={0.5 + blend * 0.15} /></mesh>
        <mesh position={[0.7,0.56,-0.3]} visible={setup.beakerB}><cylinderGeometry args={[0.23,0.25,bottomLayer,24]} /><meshStandardMaterial color={profile.bottomColor} transparent opacity={0.5 + blend * 0.15} /></mesh>
      </>)}
      <mesh position={[0.7,0.67,-0.3]} visible={setup.beakerB}><cylinderGeometry args={[0.23,0.25,0.5,24]} /><meshStandardMaterial color={mixed ? profile.mixedColor : profile.mixedColor} transparent opacity={mixedOpacity} /></mesh>

      <mesh position={[0,1.05,-0.2]} rotation={[0,0,0.35 + shake * 0.12]} visible={setup.stirrer}><cylinderGeometry args={[0.02,0.02,1.1,10]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
      <OrbitControls enablePan={false} maxPolarAngle={Math.PI/2.1} />
    </>
  )
}

export function MixingSim({
  setup,
  practicalId,
  practicalTitle,
}: {
  setup: Setup
  practicalId?: string
  practicalTitle?: string
}) {
  const title = (practicalTitle || "").toLowerCase()
  const isDiffusion = practicalId === "hssc-chem-02" || title.includes("diffusion")
  const isChromatography = title.includes("chroma")
  const defaultMode: "miscible" | "immiscible" = isDiffusion ? "miscible" : "immiscible"
  const profile: VisualProfile = isDiffusion
    ? {
        caseLabel: "KMnO4 diffusion in water",
        modeLabel: "Diffusion behavior",
        topColor: "#c4b5fd",
        bottomColor: "#60a5fa",
        mixedColor: "#8b5cf6",
        mixGain: 0.18,
        settleLoss: 0.01,
        emulsionGain: 0.03,
      }
    : isChromatography
      ? {
          caseLabel: "Dye + solvent (paper chromatography analogue)",
          modeLabel: "Chromatography-style separation",
          topColor: "#f59e0b",
          bottomColor: "#38bdf8",
          mixedColor: "#14b8a6",
          mixGain: 0.06,
          settleLoss: 0.06,
          emulsionGain: 0.015,
        }
      : {
          caseLabel: "Water + Oil",
          modeLabel: "Immiscible behavior",
          topColor: "#facc15",
          bottomColor: "#38bdf8",
          mixedColor: "#67e8f9",
          mixGain: 0.12,
          settleLoss: 0.04,
          emulsionGain: 0.02,
        }
  const [mode, setMode] = useState<"miscible"|"immiscible">(defaultMode)
  const [shake, setShake] = useState(0)
  const [blend, setBlend] = useState(0)
  const ready = setup.beakerA && setup.beakerB && setup.stirrer

  useEffect(() => {
    if (mode === "miscible") {
      setBlend((v) => Math.min(1, v + shake * profile.mixGain))
    } else {
      setBlend((v) => Math.max(0, v - profile.settleLoss + shake * profile.emulsionGain))
    }
  }, [mode, shake, profile])

  useEffect(() => {
    if (shake <= 0) return
    const id = setInterval(() => setShake((v) => Math.max(0, v - 0.05)), 180)
    return () => clearInterval(id)
  }, [shake])

  const observation = useMemo(() => {
    if (mode === "miscible") {
      return blend > 0.75 ? "Single uniform layer formed" : "Mixing in progress"
    }
    return blend > 0.4 ? "Temporary emulsion while shaking" : "Two separate layers"
  }, [mode, blend])

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline">Case: {profile.caseLabel}</Badge>
        <Badge variant="outline">{profile.modeLabel}</Badge>
        <Badge variant={mode === "miscible" ? "default" : "secondary"}>{observation}</Badge>
      </div>

      {!ready && <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">Place two beakers and stirrer first.</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Button disabled={!ready} onClick={() => { setMode("miscible"); setBlend(0.1) }}>Run miscible pair</Button>
        <Button disabled={!ready} onClick={() => { setMode("immiscible"); setBlend(0) }}>Run immiscible pair</Button>
        <Button disabled={!ready} onClick={() => setShake((v) => Math.min(1, v + 0.25))}>Stir / shake</Button>
        <Button variant="outline" className="gap-2" onClick={() => { setMode("miscible"); setShake(0); setBlend(0) }}><RotateCcw className="w-4 h-4" /> Reset</Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[420px]">
        <Canvas camera={{ position: [0, 2.5, 4.8], fov: 48 }}>
          <Scene setup={setup} mode={mode} shake={shake} blend={blend} profile={profile} />
        </Canvas>
      </div>
    </div>
  )
}
