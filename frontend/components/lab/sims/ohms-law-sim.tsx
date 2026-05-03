"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Battery, Zap, Activity, AlertTriangle } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LabEnvironment } from "@/components/lab/lab-environment"
import type { Mesh } from "three"

type Props = {
  voltage: number
  resistance: number
  onVoltageChange: (v: number) => void
  onResistanceChange: (v: number) => void
}

function CurrentDots({ speed }: { speed: number }) {
  const dots = useRef<Mesh[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * Math.max(0.2, speed)
    dots.current.forEach((d, i) => {
      if (!d) return
      const p = (t * 0.22 + i / 10) % 1
      const x = -2 + p * 4
      d.position.x = x
      d.position.y = x < 0 ? 0 : x < 2 ? 0.4 - x * 0.2 : 0
    })
  })

  return (
    <group>
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) dots.current[i] = el
          }}
          position={[-2 + i * 0.4, 0, 0]}
        >
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function OhmsLawSim({ voltage, resistance, onVoltageChange, onResistanceChange }: Props) {
  const current = useMemo(() => (resistance > 0 ? voltage / resistance : 0), [voltage, resistance])
  const power = useMemo(() => voltage * current, [voltage, current])
  const hazard = voltage > 12 || resistance < 20
  const flow = useMemo(() => current * 100, [current])

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Battery className="w-5 h-5 text-primary" />
        <div className="text-sm">
          <div className="font-semibold">Ohm's Law Circuit</div>
          <div className="text-muted-foreground text-xs">V = I R | live current & power</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge className="gap-1">
          <Zap className="w-3 h-3" />
          {voltage.toFixed(1)} V
        </Badge>
        <Badge variant="outline">{resistance.toFixed(1)} Ω</Badge>
        <Badge variant="outline">{current.toFixed(3)} A</Badge>
        <Badge variant={hazard ? "destructive" : "secondary"}>{power.toFixed(2)} W</Badge>
      </div>

      <div className={cn("relative border rounded-lg p-6 bg-card/40", hazard && "ring-2 ring-red-500/50")}>
        <div className="flex items-center justify-between text-sm mb-2">
          <span>Live circuit</span>
          <span className="text-muted-foreground">Current flow ∝ I</span>
        </div>
        <div className="h-24 relative overflow-hidden rounded-md bg-gradient-to-r from-background via-background to-background border border-border/50">
          <div
            className="absolute inset-y-0 left-0 bg-primary/20"
            style={{ width: `${Math.min(Math.abs(flow), 100)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            {current.toFixed(3)} A flowing
          </div>
          {hazard && (
            <div className="absolute inset-0 flex items-center justify-center text-red-500 font-semibold">
              <AlertTriangle className="w-5 h-5 mr-1" />
              Overload risk
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Overvoltage/low resistance triggers virtual hazard (sparks/smoke). Keep voltage reasonable and resistance not
          too low.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[300px]">
        <Canvas camera={{ position: [0, 2.6, 5], fov: 45 }}>
          <LabEnvironment benchY={-1.1} benchSize={10} />
          <mesh position={[-2, 0, 0]} castShadow>
            <boxGeometry args={[0.9, 0.34, 0.36]} />
            <meshStandardMaterial color="#22c55e" metalness={0.35} roughness={0.55} />
          </mesh>
          <mesh position={[0.1, 0.2, 0]} castShadow>
            <boxGeometry args={[0.9, 0.34, 0.36]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.3} roughness={0.6} />
          </mesh>
          <mesh position={[2, 0, 0]} castShadow>
            <boxGeometry args={[0.9, 0.34, 0.36]} />
            <meshStandardMaterial color={hazard ? "#ef4444" : "#60a5fa"} emissive={hazard ? "#991b1b" : "#1d4ed8"} emissiveIntensity={hazard ? 0.22 : 0.12} metalness={0.35} roughness={0.55} />
          </mesh>
          <mesh position={[-1, 0, 0]} castShadow>
            <boxGeometry args={[1.2, 0.06, 0.06]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.55} roughness={0.35} />
          </mesh>
          <mesh position={[1, 0.1, 0]} castShadow>
            <boxGeometry args={[1.2, 0.06, 0.06]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.55} roughness={0.35} />
          </mesh>
          <CurrentDots speed={Math.min(2.5, Math.abs(current) * 7)} />
          <OrbitControls enablePan={false} minDistance={3} maxDistance={7} />
        </Canvas>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Voltage (V)</span>
            <span>{voltage.toFixed(1)} V</span>
          </div>
          <Slider value={[voltage]} min={0} max={20} step={0.5} onValueChange={(v) => onVoltageChange(v[0])} />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Resistance (Ω)</span>
            <span>{resistance.toFixed(1)} Ω</span>
          </div>
          <Slider value={[resistance]} min={10} max={500} step={10} onValueChange={(v) => onResistanceChange(v[0])} />
        </div>
      </div>
    </div>
  )
}
