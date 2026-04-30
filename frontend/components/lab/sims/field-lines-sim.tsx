"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import type { Mesh } from "three"

type Props = { magnetStrength: number; probeX: number; probeY: number }

function AnimatedLines({ strength }: { strength: number }) {
  const arrows = useRef<Mesh[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    arrows.current.forEach((a, i) => {
      if (!a) return
      const phase = (t * (0.15 + strength * 0.03) + i / 12) % 1
      a.position.x = -2 + phase * 4
      a.position.z = 0.9 + Math.sin(phase * Math.PI * 2) * 0.18
      a.rotation.y = 0
    })
  })

  return (
    <group>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} ref={(el) => { if (el) arrows.current[i] = el }} position={[-2 + i * 0.3, -0.02, 0.95]}>
          <coneGeometry args={[0.05, 0.18, 10]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.35} />
        </mesh>
      ))}
    </group>
  )
}

export function FieldLinesSim({ magnetStrength, probeX, probeY }: Props) {
  const field = useMemo(() => {
    const x = probeX
    const y = probeY
    const r2 = x * x + y * y + 0.08
    const bx = (magnetStrength * 0.8 * x) / (r2 * r2)
    const by = (magnetStrength * -0.8 * y) / (r2 * r2)
    const b = Math.sqrt(bx * bx + by * by)
    const ang = (Math.atan2(by, bx) * 180) / Math.PI
    return { b, ang }
  }, [magnetStrength, probeX, probeY])

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Magnet strength: {magnetStrength.toFixed(1)}</Badge>
        <Badge variant="outline">Probe: ({probeX.toFixed(2)}, {probeY.toFixed(2)})</Badge>
        <Badge>B ~ {field.b.toFixed(3)} a.u.</Badge>
        <Badge>Compass angle ~ {field.ang.toFixed(1)} deg</Badge>
      </div>
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
        <Canvas camera={{ position: [0, 3.6, 4.2], fov: 45 }}>
          <color attach="background" args={["#020817"]} />
          <ambientLight intensity={0.85} />
          <directionalLight position={[2, 4, 3]} intensity={1} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}><planeGeometry args={[8, 8]} /><meshStandardMaterial color="#0f172a" /></mesh>
          <mesh position={[0, -0.1, 0]}><boxGeometry args={[2.2, 0.3, 0.7]} /><meshStandardMaterial color="#ef4444" /></mesh>
          <mesh position={[-0.9, -0.1, 0.36]}><boxGeometry args={[0.4, 0.32, 0.02]} /><meshStandardMaterial color="#60a5fa" /></mesh>
          <mesh position={[0.9, -0.1, 0.36]}><boxGeometry args={[0.4, 0.32, 0.02]} /><meshStandardMaterial color="#f97316" /></mesh>
          <AnimatedLines strength={magnetStrength} />
          <mesh position={[probeX * 2.2, -0.02, probeY * 2.2]} rotation={[0, (-field.ang * Math.PI) / 180, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.03, 24]} /><meshStandardMaterial color="#e5e7eb" />
          </mesh>
          <mesh position={[probeX * 2.2, -0.0, probeY * 2.2]} rotation={[0, (-field.ang * Math.PI) / 180, 0]}>
            <boxGeometry args={[0.22, 0.015, 0.03]} /><meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} />
          </mesh>
          <OrbitControls enablePan={false} minDistance={3} maxDistance={8} />
        </Canvas>
      </div>
    </div>
  )
}
