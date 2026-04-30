"use client"

import { useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"

type Props = { gate: "AND" | "OR" | "NOT"; a: 0 | 1; b: 0 | 1 }

function LogicBoard3D({ gate, a, b, out }: { gate: Props["gate"]; a: number; b: number; out: number }) {
  return (
    <Canvas camera={{ position: [0, 2.1, 4.6], fov: 45 }}>
      <color attach="background" args={["#020817"]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 4, 2]} intensity={1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.05, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#0b1220" />
      </mesh>

      <mesh position={[0, -0.6, 0]}>
        <boxGeometry args={[3.6, 0.2, 2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.5} />
      </mesh>

      <mesh position={[-1.3, -0.35, 0.3]}>
        <cylinderGeometry args={[0.15, 0.15, 0.06, 24]} />
        <meshStandardMaterial color={a ? "#22c55e" : "#475569"} emissive={a ? "#22c55e" : "#000000"} emissiveIntensity={0.6} />
      </mesh>
      {gate !== "NOT" && (
        <mesh position={[-1.3, -0.35, -0.3]}>
          <cylinderGeometry args={[0.15, 0.15, 0.06, 24]} />
          <meshStandardMaterial color={b ? "#22c55e" : "#475569"} emissive={b ? "#22c55e" : "#000000"} emissiveIntensity={0.6} />
        </mesh>
      )}

      <mesh position={[0, -0.28, 0]}>
        <boxGeometry args={[1.25, 0.22, 1.05]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, -0.11, 0]}>
        <boxGeometry args={[0.95, 0.04, 0.75]} />
        <meshStandardMaterial color="#334155" emissive="#0ea5e9" emissiveIntensity={0.2} />
      </mesh>

      <mesh position={[1.25, -0.35, 0]}>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial color={out ? "#fde047" : "#374151"} emissive={out ? "#facc15" : "#000000"} emissiveIntensity={out ? 1.4 : 0} />
      </mesh>

      <mesh position={[-0.65, -0.35, 0.2]}>
        <boxGeometry args={[0.95, 0.03, 0.03]} />
        <meshStandardMaterial color="#64748b" emissive={a ? "#22c55e" : "#000000"} emissiveIntensity={0.5} />
      </mesh>
      {gate !== "NOT" && (
        <mesh position={[-0.65, -0.35, -0.2]}>
          <boxGeometry args={[0.95, 0.03, 0.03]} />
          <meshStandardMaterial color="#64748b" emissive={b ? "#22c55e" : "#000000"} emissiveIntensity={0.5} />
        </mesh>
      )}
      <mesh position={[0.68, -0.35, 0]}>
        <boxGeometry args={[0.95, 0.03, 0.03]} />
        <meshStandardMaterial color="#64748b" emissive={out ? "#facc15" : "#000000"} emissiveIntensity={0.7} />
      </mesh>
      <OrbitControls enablePan={false} minDistance={2.7} maxDistance={6.5} />
    </Canvas>
  )
}

export function LogicGatesSim({ gate, a, b }: Props) {
  const out = useMemo(() => {
    if (gate === "AND") return a & b
    if (gate === "OR") return a | b
    return a ? 0 : 1
  }, [gate, a, b])

  const rows =
    gate === "NOT"
      ? [
          { a: 0, b: 0, y: 1 },
          { a: 1, b: 0, y: 0 },
        ]
      : [
          { a: 0, b: 0, y: gate === "AND" ? 0 : 0 },
          { a: 0, b: 1, y: gate === "AND" ? 0 : 1 },
          { a: 1, b: 0, y: gate === "AND" ? 0 : 1 },
          { a: 1, b: 1, y: 1 },
        ]

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Gate: {gate}</Badge>
        <Badge variant="outline">Input A: {a}</Badge>
        {gate !== "NOT" && <Badge variant="outline">Input B: {b}</Badge>}
        <Badge>Output Y: {out}</Badge>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[280px]">
        <LogicBoard3D gate={gate} a={a} b={b} out={out} />
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4">
        <div className="grid grid-cols-4 gap-2 text-sm text-muted-foreground mb-2">
          <div>A</div>
          <div>B</div>
          <div>Gate</div>
          <div>Y</div>
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 text-sm border-t border-border/40 py-1">
            <div>{r.a}</div>
            <div>{gate === "NOT" ? "-" : r.b}</div>
            <div>{gate}</div>
            <div>{r.y}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
