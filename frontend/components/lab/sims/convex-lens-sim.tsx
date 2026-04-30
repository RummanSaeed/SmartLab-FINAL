"use client"

import { useMemo, useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Line, Html, Text, Cylinder } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, RotateCcw, Lightbulb, Eye } from "lucide-react"
import * as THREE from "three"

type Props = { objectDistanceCm: number; lensPowerD: number; objectHeightCm: number }
type Trial = { u:number; v:number; f:number; m:number }

// Glowing ray effect component
function GlowingRay({ points, color, intensity = 1 }: { points: [number, number, number][], color: string, intensity?: number }) {
  const lineRef = useRef<THREE.Line>(null)
  const glowRef = useRef<THREE.Line>(null)

  useFrame(({ clock }) => {
    if (glowRef.current) {
      const material = glowRef.current.material as THREE.LineBasicMaterial
      material.opacity = 0.3 + Math.sin(clock.getElapsedTime() * 3) * 0.2
    }
  })

  return (
    <group>
      {/* Main ray */}
      <Line ref={lineRef} points={points} color={color} lineWidth={2} />
      {/* Glow effect */}
      <Line ref={glowRef} points={points} color={color} lineWidth={6} transparent opacity={0.3} />
    </group>
  )
}

// Optical bench component
function OpticalBench() {
  return (
    <group>
      {/* Main rail */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <boxGeometry args={[8, 0.15, 0.4]} />
        <meshStandardMaterial color="#334155" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Scale markings */}
      {Array.from({ length: 81 }, (_, i) => i - 40).map((cm) => (
        <mesh key={cm} position={[cm * 0.08, -0.42, 0.22]}>
          <boxGeometry args={[0.002, cm % 10 === 0 ? 0.04 : 0.02, 0.005]} />
          <meshStandardMaterial color={cm % 10 === 0 ? "#f8fafc" : "#64748b"} />
        </mesh>
      ))}
      {/* Support legs */}
      <mesh position={[-3.5, -0.75, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
        <meshStandardMaterial color="#475569" metalness={0.5} />
      </mesh>
      <mesh position={[3.5, -0.75, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
        <meshStandardMaterial color="#475569" metalness={0.5} />
      </mesh>
    </group>
  )
}

// Lens mount component
function LensMount() {
  return (
    <group position={[0, 0, 0]}>
      {/* Base */}
      <mesh position={[0, -0.42, 0]} castShadow>
        <boxGeometry args={[0.6, 0.16, 0.5]} />
        <meshStandardMaterial color="#475569" metalness={0.6} />
      </mesh>
      {/* Vertical support */}
      <mesh position={[0, -0.15, 0]} castShadow>
        <boxGeometry args={[0.08, 0.5, 0.08]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} />
      </mesh>
      {/* Lens holder ring */}
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[0.15, 0.025, 8, 32]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>
      {/* Adjustment screws */}
      <mesh position={[0.12, 0.1, 0.12]}>
        <cylinderGeometry args={[0.02, 0.02, 0.06, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
      </mesh>
      <mesh position={[-0.12, 0.1, 0.12]}>
        <cylinderGeometry args={[0.02, 0.02, 0.06, 8]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
      </mesh>
    </group>
  )
}

// Object (arrow/candle) holder
function ObjectHolder({ position, height }: { position: number, height: number }) {
  return (
    <group position={[position, 0, 0]}>
      {/* Base on optical bench */}
      <mesh position={[0, -0.42, 0]} castShadow>
        <boxGeometry args={[0.4, 0.16, 0.4]} />
        <meshStandardMaterial color="#475569" metalness={0.5} />
      </mesh>
      {/* Vertical rod */}
      <mesh position={[0, height * 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, height * 0.8, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} />
      </mesh>
      {/* Object arrow */}
      <mesh position={[0, height, 0]} castShadow>
        <coneGeometry args={[0.05, height * 0.3, 16]} rotation={[0, 0, Math.PI]} />
        <meshStandardMaterial color="#f59e0b" emissive="#b45309" emissiveIntensity={0.3} />
      </mesh>
      {/* Arrow shaft */}
      <mesh position={[0, height * 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, height * 0.4, 8]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
    </group>
  )
}

// Screen component
function Screen({ position, imageHeight }: { position: number, imageHeight: number }) {
  return (
    <group position={[position, 0, 0]}>
      {/* Base */}
      <mesh position={[0, -0.42, 0]} castShadow>
        <boxGeometry args={[0.4, 0.16, 0.4]} />
        <meshStandardMaterial color="#475569" metalness={0.5} />
      </mesh>
      {/* Screen frame */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.02, 1.2, 0.02]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} />
      </mesh>
      {/* Screen surface */}
      <mesh position={[0, 0.5, 0.01]}>
        <planeGeometry args={[0.3, 1]} />
        <meshStandardMaterial color="#f1f5f9" emissive="#f8fafc" emissiveIntensity={0.1} />
      </mesh>
      {/* Image indicator when present */}
      {imageHeight !== 0 && (
        <mesh position={[0.02, 0.5 + imageHeight * 0.3, 0.02]}>
          <coneGeometry args={[0.04, 0.15, 16]} rotation={[0, 0, 0]} />
          <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.4} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  )
}

// Light source
function LightSource({ position }: { position: number }) {
  return (
    <group position={[position, 0.5, 0]}>
      {/* Stand */}
      <mesh position={[0, -0.5, 0]} castShadow>
        <boxGeometry args={[0.3, 0.16, 0.3]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Post */}
      <mesh position={[0, -0.25, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      {/* Lamp housing */}
      <mesh position={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.15, 0.3, 16]} rotation={[0, 0, -Math.PI / 2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} />
      </mesh>
      {/* Light bulb */}
      <mesh position={[0.15, 0, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={1} />
      </mesh>
      {/* Light cone effect */}
      <mesh position={[1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.2, 1.5, 32, 1, true]} />
        <meshBasicMaterial color="#fef08a" transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>
      {/* Point light */}
      <pointLight position={[0.2, 0, 0]} intensity={2} color="#fef08a" distance={5} />
    </group>
  )
}

function Scene({
  u,
  v,
  f,
  hImg,
  step,
  objectHeightCm
}: {
  u: number
  v: number
  f: number
  hImg: number
  step: number
  objectHeightCm: number
}) {
  const scale = 0.03 // Scale cm to world units
  const objX = -u * scale
  const lensX = 0
  const imgX = v * scale
  const objY = 0.35 + Math.max(0.25, objectHeightCm * 0.05)
  const imgY = hImg !== 0 ? 0.5 + hImg * scale : 0.5

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 3]} intensity={1} castShadow />
      <directionalLight position={[-5, 6, -3]} intensity={0.3} />
      <pointLight position={[0, 2, 2]} intensity={0.5} />

      {/* Lab bench */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.9} />
      </mesh>

      {/* Optical bench */}
      <OpticalBench />

      {/* Principal axis line */}
      <Line points={[[-4, 0.1, 0], [4, 0.1, 0]]} color="#64748b" lineWidth={1} dashed />

      {/* Light source */}
      <LightSource position={objX - 0.8} />

      {/* Object */}
      {step >= 1 && <ObjectHolder position={objX} height={objY} />}

      {/* Lens and mount */}
      <LensMount />
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.04, 32]} rotation={[Math.PI / 2, 0, 0]} />
        <meshPhysicalMaterial
          color="#93c5fd"
          transmission={0.85}
          transparent
          opacity={0.5}
          roughness={0.02}
          thickness={0.5}
          ior={1.5}
        />
      </mesh>

      {/* Screen */}
      {step >= 3 && <Screen position={imgX} imageHeight={hImg * scale} />}

      {/* Ray tracing - parallel ray */}
      {step >= 2 && (
        <GlowingRay
          points={[[objX - 0.5, objY, 0], [0, objY, 0], [imgX, imgY, 0]]}
          color="#f59e0b"
          intensity={1}
        />
      )}

      {/* Ray through optical center */}
      {step >= 2 && (
        <GlowingRay
          points={[[objX, objY, 0], [0, 0.1, 0], [imgX, imgY, 0]]}
          color="#38bdf8"
          intensity={1}
        />
      )}

      {/* Measurement markers */}
      <Text position={[objX, -0.7, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        u = {u.toFixed(1)} cm
      </Text>
      <Text position={[imgX, -0.7, 0]} fontSize={0.08} color="#60a5fa" anchorX="center">
        v = {v.toFixed(1)} cm
      </Text>
      <Text position={[0, -0.85, 0]} fontSize={0.06} color="#f472b6" anchorX="center">
        f = {f.toFixed(2)} cm
      </Text>

      {/* Focal points markers */}
      <mesh position={[-f * scale, 0.1, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#f472b6" />
      </mesh>
      <mesh position={[f * scale, 0.1, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#f472b6" />
      </mesh>

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        target={[0, 0.1, 0]}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  )
}

export function ConvexLensSim({ objectDistanceCm, lensPowerD, objectHeightCm }: Props){
  const [trials,setTrials]=useState<Trial[]>([])
  const [step, setStep] = useState(0)
  const calc=useMemo(()=>{
    const f = 100 / lensPowerD
    const u = objectDistanceCm
    const v = 1 / (1/f - 1/u)
    const m = v/u
    const hImg = -m * objectHeightCm
    return { f,u,v,m,hImg, realImage: v>0 }
  },[objectDistanceCm,lensPowerD,objectHeightCm])
  const meanF = trials.length ? trials.reduce((a,t)=>a+t.f,0)/trials.length : null
  const stepText = [
    "Step 1: Set up light source, object, and lens on optical bench.",
    "Step 2: Align object at specified distance from lens.",
    "Step 3: Move screen to locate sharp, inverted image.",
    "Step 4: Record u, v and calculate focal length using 1/f = 1/u + 1/v.",
  ][step]
  return <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline" className="gap-1"><Lightbulb className="w-3 h-3"/>u: {calc.u.toFixed(1)} cm</Badge>
      <Badge variant="outline">Power: {lensPowerD.toFixed(2)} D</Badge>
      <Badge variant="outline">f = {calc.f.toFixed(2)} cm</Badge>
      <Badge variant={calc.realImage ? "default" : "secondary"} className="gap-1">
        <Eye className="w-3 h-3"/>{calc.realImage ? "Real inverted" : "Virtual erect"}
      </Badge>
    </div>
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">{stepText}</div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
        <div className="text-xs text-muted-foreground">Object dist (u)</div>
        <div className="text-lg font-semibold text-amber-500">{calc.u.toFixed(2)} cm</div>
      </div>
      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
        <div className="text-xs text-muted-foreground">Image dist (v)</div>
        <div className="text-lg font-semibold text-blue-400">{calc.v.toFixed(2)} cm</div>
      </div>
      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
        <div className="text-xs text-muted-foreground">Magnification</div>
        <div className="text-lg font-semibold">{calc.m.toFixed(2)}</div>
      </div>
      <div className="rounded-lg border border-border/60 bg-card/40 p-3">
        <div className="text-xs text-muted-foreground">Mean f (trials)</div>
        <div className="text-lg font-semibold text-pink-400">{meanF ? meanF.toFixed(2) + " cm" : "--"}</div>
      </div>
    </div>
    <div className="flex gap-2 flex-wrap">
      <Button variant="outline" onClick={()=>setStep((s)=>(s+1)%4)} className="gap-1">
        Next Step
      </Button>
      <Button
        onClick={()=>setTrials(p=>[...p,{u:Number(calc.u.toFixed(2)),v:Number(calc.v.toFixed(2)),f:Number(calc.f.toFixed(2)),m:Number(calc.m.toFixed(2))}].slice(-8))}
        className="gap-2"
        disabled={step < 3}
      >
        <CheckCircle className="w-4 h-4"/>Record Trial
      </Button>
      <Button variant="outline" onClick={()=>{setTrials([]);setStep(0)}} className="gap-2">
        <RotateCcw className="w-4 h-4"/>Reset All
      </Button>
    </div>
    <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
      <Canvas camera={{position:[5,3,6],fov:45}} shadows>
        <Scene
          u={calc.u}
          v={calc.v}
          f={calc.f}
          hImg={calc.hImg}
          step={step}
          objectHeightCm={objectHeightCm}
        />
      </Canvas>
    </div>
  </div>
}
