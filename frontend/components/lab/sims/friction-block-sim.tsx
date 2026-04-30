"use client"

import { useEffect, useMemo, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw } from "lucide-react"

type Props = {
  normalLoad: number
  pullForce: number
  mu: number
  targetDistance: number
}

function FrictionScene({ xPos }: { xPos: number }) {
  function Block({ x }: { x: number }) {
    useFrame((state, delta) => {
      // keep render loop alive for smooth controls
      void state
      void delta
    })
    return (
      <mesh position={[x, 0.35, 0]}>
        <boxGeometry args={[1.2, 0.7, 0.7]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
    )
  }

  return (
    <>
      <color attach="background" args={["#030b1a"]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      <Block x={xPos} />

      {/* pull direction arrow marker */}
      <mesh position={[xPos + 1.1, 0.7, 0]}>
        <coneGeometry args={[0.12, 0.28, 16]} />
        <meshStandardMaterial color="#22d3ee" />
      </mesh>

      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.15} target={[0, 0.5, 0]} />
    </>
  )
}

export function FrictionBlockSim({ normalLoad, pullForce, mu, targetDistance }: Props) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [xPos, setXPos] = useState(-2.5)
  const [lastResult, setLastResult] = useState<string>("")
  const [timeToTarget, setTimeToTarget] = useState<number | null>(null)

  const mass = useMemo(() => normalLoad / 9.81, [normalLoad])
  const limitingFriction = useMemo(() => mu * normalLoad, [mu, normalLoad])
  const netForce = useMemo(() => Math.max(0, pullForce - limitingFriction), [pullForce, limitingFriction])
  const acceleration = useMemo(() => (mass > 0 ? netForce / mass : 0), [netForce, mass])
  const moving = pullForce > limitingFriction
  const startX = -2.5
  const targetX = startX + targetDistance

  useEffect(() => {
    setIsRunning(false)
    setElapsed(0)
    setXPos(startX)
    setLastResult("")
    setTimeToTarget(null)
  }, [normalLoad, pullForce, mu])

  useEffect(() => {
    if (!isRunning) return

    const rafRef = { id: 0 }
    const start = performance.now()

    const tick = (now: number) => {
      const t = (now - start) / 1000
      setElapsed(t)

      if (moving) {
        const s = 0.5 * acceleration * t * t
        const newX = startX + Math.min(6, s)
        setXPos(newX)
        if (newX >= targetX) {
          const finalT = Number(t.toFixed(3))
          setTimeToTarget(finalT)
          setLastResult(`Reached ${targetDistance.toFixed(2)} m in ${finalT.toFixed(3)} s`)
          setIsRunning(false)
          return
        }
      } else {
        setXPos(startX)
        setLastResult("No motion (static friction holds)")
        setIsRunning(false)
        return
      }

      if (t >= 8) {
        const s = 0.5 * acceleration * t * t
        setLastResult(`Timeout at 8.0 s (moved ${s.toFixed(2)} m)`)
        setIsRunning(false)
        return
      }

      rafRef.id = requestAnimationFrame(tick)
    }

    rafRef.id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.id)
  }, [isRunning, moving, acceleration])

  const handleRun = () => {
    setElapsed(0)
    setXPos(startX)
    setLastResult("")
    setTimeToTarget(null)
    setIsRunning(true)
  }

  const handleReset = () => {
    setIsRunning(false)
    setElapsed(0)
    setXPos(startX)
    setLastResult("")
    setTimeToTarget(null)
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline">Normal: {normalLoad.toFixed(1)} N</Badge>
        <Badge variant="outline">Pull: {pullForce.toFixed(1)} N</Badge>
        <Badge variant="outline">mu: {mu.toFixed(2)}</Badge>
        <Badge variant={moving ? "default" : "secondary"}>Limiting friction: {limitingFriction.toFixed(2)} N</Badge>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleRun} className="gap-2" disabled={isRunning}>
          <Play className="w-4 h-4" />
          Apply Pull
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
        <span className="text-sm text-muted-foreground">
          {moving ? "Block moves (F > muN)" : "Static (F <= muN)"}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Friction force (N)</div>
          <div className="text-lg font-semibold">{Math.min(pullForce, limitingFriction).toFixed(2)}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Net force (N)</div>
          <div className="text-lg font-semibold">{netForce.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Acceleration (m/s²)</div>
          <div className="text-lg font-semibold">{acceleration.toFixed(3)}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Elapsed (s)</div>
          <div className="text-lg font-semibold">{elapsed.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Time to {targetDistance.toFixed(2)} m (s)</div>
          <div className="text-lg font-semibold">{timeToTarget !== null ? timeToTarget.toFixed(3) : "--"}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[300px]">
        <Canvas camera={{ position: [0, 4, 8], fov: 45, near: 0.1, far: 1000 }}>
          <FrictionScene xPos={xPos} />
        </Canvas>
      </div>

      <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-sm text-muted-foreground">
        {lastResult || "Run simulation to observe static vs kinetic behavior."}
      </div>
    </div>
  )
}
