"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import type { Group, Mesh } from "three"

type Props = { sample: "Na" | "K" | "Ca" | "Ba" | "Cu"; intensity: number; wireClean: boolean }

const FLAME_COLORS: Record<Props["sample"], string> = {
  Na: "#facc15",
  K: "#a78bfa",
  Ca: "#fb923c",
  Ba: "#84cc16",
  Cu: "#22d3ee",
}

function FlameCore({ color, intensity }: { color: string; intensity: number }) {
  const outer = useRef<Mesh>(null)
  const inner = useRef<Mesh>(null)
  const smoke = useRef<Group>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const flicker = 1 + Math.sin(t * 15) * 0.08 + Math.sin(t * 22) * 0.04
    if (outer.current) {
      outer.current.scale.set(1, flicker, 1)
      outer.current.position.x = Math.sin(t * 9) * 0.03
    }
    if (inner.current) {
      inner.current.scale.set(1, 1 + Math.sin(t * 18) * 0.06, 1)
      inner.current.position.x = Math.cos(t * 10) * 0.02
    }
    if (smoke.current) {
      smoke.current.children.forEach((particle, i) => {
        particle.position.y = 0.7 + ((t * 0.4 + i * 0.22) % 1.8)
        particle.position.x = Math.sin(t * 1.5 + i) * 0.08
      })
    }
  })

  return (
    <group>
      <mesh ref={outer} position={[0, 0.25, 0]}>
        <coneGeometry args={[0.34, 0.86, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5 + intensity * 0.65} transparent opacity={0.78} />
      </mesh>
      <mesh ref={inner} position={[0, 0.15, 0]}>
        <coneGeometry args={[0.19, 0.52, 24]} />
        <meshStandardMaterial color="#fef3c7" emissive="#fde68a" emissiveIntensity={0.8 + intensity * 0.5} transparent opacity={0.85} />
      </mesh>
      <group ref={smoke}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[0, 0.75 + i * 0.18, 0]}>
            <sphereGeometry args={[0.07 + (i % 3) * 0.012, 12, 12]} />
            <meshStandardMaterial color="#cbd5e1" transparent opacity={0.08 + i * 0.01} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function FlameTestSim({ sample, intensity, wireClean }: Props) {
  const color = FLAME_COLORS[sample]
  const status = wireClean ? "Clean wire: valid color" : "Wire not clean: mixed color"
  const effectiveColor = wireClean ? color : "#f59e0b"

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Sample: {sample}</Badge>
        <Badge variant="outline">Flame intensity: {intensity.toFixed(1)}</Badge>
        <Badge>{status}</Badge>
      </div>
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
        <Canvas camera={{ position: [0, 2.2, 4.2], fov: 45 }}>
          <color attach="background" args={["#020817"]} />
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 4, 2]} intensity={1} />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]}>
            <planeGeometry args={[8, 8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.35, 0.4, 0.6, 24]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.1, 0.14, 0.3, 20]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          <FlameCore color={effectiveColor} intensity={intensity} />
          <mesh position={[0.4, 0.5, 0]} rotation={[0, 0, -0.8]}>
            <cylinderGeometry args={[0.02, 0.02, 1.4, 12]} />
            <meshStandardMaterial color="#d1d5db" />
          </mesh>
          <mesh position={[-0.1, 0.72, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color={wireClean ? color : "#fbbf24"} emissive={wireClean ? color : "#fbbf24"} emissiveIntensity={0.9} />
          </mesh>
          <OrbitControls enablePan={false} minDistance={2.8} maxDistance={6} />
        </Canvas>
      </div>
      <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
        Observed flame color: <span className="font-semibold text-foreground">{sample}</span> characteristic color
        {wireClean ? "" : " (contaminated due to dirty wire)"}.
      </div>
    </div>
  )
}
