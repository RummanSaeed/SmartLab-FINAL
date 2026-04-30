"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import type { Mesh } from "three"

type Props = { voltage: number; r1: number; r2: number }

function BranchDots({ i1, i2 }: { i1: number; i2: number }) {
  const upper = useRef<Mesh[]>([])
  const lower = useRef<Mesh[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    upper.current.forEach((d, i) => {
      if (!d) return
      const p = (t * Math.max(0.15, i1) * 0.55 + i / 8) % 1
      d.position.x = -0.2 + p * 2.2
      d.position.y = 0.8
    })
    lower.current.forEach((d, i) => {
      if (!d) return
      const p = (t * Math.max(0.15, i2) * 0.55 + i / 8) % 1
      d.position.x = -0.2 + p * 2.2
      d.position.y = -0.8
    })
  })

  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`u-${i}`} ref={(el) => { if (el) upper.current[i] = el }} position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6} />
        </mesh>
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`l-${i}`} ref={(el) => { if (el) lower.current[i] = el }} position={[0, -0.8, 0]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function ParallelCircuitSim({ voltage, r1, r2 }: Props) {
  const calc = useMemo(() => {
    const i1 = voltage / r1
    const i2 = voltage / r2
    const it = i1 + i2
    const req = voltage / it
    return { i1, i2, it, req }
  }, [voltage, r1, r2])

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">R1: {r1.toFixed(0)} O</Badge>
        <Badge variant="outline">R2: {r2.toFixed(0)} O</Badge>
        <Badge variant="outline">Req(parallel): {calc.req.toFixed(1)} O</Badge>
        <Badge>Itotal = {calc.it.toFixed(3)} A</Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">I1</div><div className="text-lg font-semibold">{calc.i1.toFixed(3)} A</div></div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">I2</div><div className="text-lg font-semibold">{calc.i2.toFixed(3)} A</div></div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Itotal</div><div className="text-lg font-semibold">{calc.it.toFixed(3)} A</div></div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3"><div className="text-xs text-muted-foreground">Check</div><div className="text-lg font-semibold">I1+I2={(calc.i1 + calc.i2).toFixed(3)}</div></div>
      </div>
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[300px]">
        <Canvas camera={{ position: [0, 2.8, 5], fov: 45 }}>
          <color attach="background" args={["#020817"]} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 4, 2]} intensity={1} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}><planeGeometry args={[8, 8]} /><meshStandardMaterial color="#0f172a" /></mesh>
          <mesh position={[-2, 0, 0]}><boxGeometry args={[0.8, 0.3, 0.3]} /><meshStandardMaterial color="#22c55e" /></mesh>
          <mesh position={[0, 0.8, 0]}><boxGeometry args={[0.8, 0.3, 0.3]} /><meshStandardMaterial color="#f59e0b" /></mesh>
          <mesh position={[0, -0.8, 0]}><boxGeometry args={[0.8, 0.3, 0.3]} /><meshStandardMaterial color="#f59e0b" /></mesh>
          <mesh position={[2, 0, 0]}><boxGeometry args={[0.8, 0.3, 0.3]} /><meshStandardMaterial color="#ef4444" /></mesh>
          <mesh position={[-1, 0, 0]}><boxGeometry args={[1.0, 0.06, 0.06]} /><meshStandardMaterial color="#94a3b8" /></mesh>
          <mesh position={[1, 0.8, 0]}><boxGeometry args={[1.0, 0.06, 0.06]} /><meshStandardMaterial color="#94a3b8" /></mesh>
          <mesh position={[1, -0.8, 0]}><boxGeometry args={[1.0, 0.06, 0.06]} /><meshStandardMaterial color="#94a3b8" /></mesh>
          <BranchDots i1={calc.i1 * 5} i2={calc.i2 * 5} />
          <OrbitControls enablePan={false} minDistance={3} maxDistance={7} />
        </Canvas>
      </div>
    </div>
  )
}
