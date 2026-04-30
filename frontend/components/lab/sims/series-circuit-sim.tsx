"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import type { Mesh } from "three"

type Props = { voltage: number; r1: number; r2: number }

function CurrentDots({ speed }: { speed: number }) {
  const dots = useRef<Mesh[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * Math.max(0.2, speed)
    dots.current.forEach((d, i) => {
      if (!d) return
      const p = (t * 0.2 + i / 10) % 1
      const x = -2 + p * 4
      d.position.x = x
      d.position.y = x < 0 ? 0 : x < 2 ? 0.4 - x * 0.2 : 0
    })
  })

  return (
    <group>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} ref={(el) => { if (el) dots.current[i] = el }} position={[-2 + i * 0.4, 0, 0]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function SeriesCircuitSim({ voltage, r1, r2 }: Props) {
  const calc = useMemo(() => {
    const rt = r1 + r2
    const i = voltage / rt
    return { rt, i, v1: i * r1, v2: i * r2 }
  }, [voltage, r1, r2])

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">R1: {r1.toFixed(0)} ohm</Badge>
        <Badge variant="outline">R2: {r2.toFixed(0)} ohm</Badge>
        <Badge variant="outline">Req(series): {calc.rt.toFixed(1)} ohm</Badge>
        <Badge>I = {calc.i.toFixed(3)} A</Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Total current</div><div className="text-lg font-semibold">{calc.i.toFixed(3)} A</div></div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">V across R1</div><div className="text-lg font-semibold">{calc.v1.toFixed(2)} V</div></div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">V across R2</div><div className="text-lg font-semibold">{calc.v2.toFixed(2)} V</div></div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Check</div><div className="text-lg font-semibold">V1+V2={(calc.v1 + calc.v2).toFixed(2)}V</div></div>
      </div>
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[300px]">
        <Canvas camera={{ position: [0, 2.5, 5], fov: 45 }}>
          <color attach="background" args={["#020817"]} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 4, 2]} intensity={1} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}><planeGeometry args={[8, 8]} /><meshStandardMaterial color="#0f172a" /></mesh>
          <mesh position={[-2, 0, 0]}><boxGeometry args={[0.8, 0.3, 0.3]} /><meshStandardMaterial color="#22c55e" /></mesh>
          <mesh position={[0, 0.2, 0]}><boxGeometry args={[0.8, 0.3, 0.3]} /><meshStandardMaterial color="#f59e0b" /></mesh>
          <mesh position={[2, 0, 0]}><boxGeometry args={[0.8, 0.3, 0.3]} /><meshStandardMaterial color="#ef4444" /></mesh>
          <mesh position={[-1, 0, 0]}><boxGeometry args={[1.2, 0.06, 0.06]} /><meshStandardMaterial color="#94a3b8" /></mesh>
          <mesh position={[1, 0.1, 0]}><boxGeometry args={[1.2, 0.06, 0.06]} /><meshStandardMaterial color="#94a3b8" /></mesh>
          <CurrentDots speed={calc.i * 7} />
          <OrbitControls enablePan={false} minDistance={3} maxDistance={7} />
        </Canvas>
      </div>
    </div>
  )
}
