"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw } from "lucide-react"

type Props = {
  angleDeg: number
  trackLength: number
  ballMass: number
}

function SimScene({
  angleDeg,
  trackLength,
  isRunning,
  elapsed,
  duration,
  ballRadius,
}: {
  angleDeg: number
  trackLength: number
  isRunning: boolean
  elapsed: number
  duration: number
  ballRadius: number
}) {
  const ballRef = useRef<any>(null)

  const angle = (angleDeg * Math.PI) / 180
  const startX = -trackLength / 2
  const endX = trackLength / 2
  const yAt = (x: number) => Math.tan(angle) * (endX - x)

  useFrame(() => {
    if (!ballRef.current) return
    const p = duration > 0 ? Math.min(1, elapsed / duration) : 0
    const x = startX + (endX - startX) * p
    const y = yAt(x) + ballRadius + 0.02
    ballRef.current.position.set(x, y, 0)
  })

  return (
    <>
      <color attach="background" args={["#030b1a"]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} />

      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      <mesh position={[0, yAt(0) / 2, 0]} rotation={[0, 0, -angle]}>
        <boxGeometry args={[trackLength, 0.25, 1.8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, yAt(0) / 2 + 0.15, 0]} rotation={[0, 0, -angle]}>
        <boxGeometry args={[trackLength + 0.03, 0.03, 1.82]} />
        <meshStandardMaterial color="#22d3ee" emissive="#164e63" />
      </mesh>

      <mesh ref={ballRef}>
        <sphereGeometry args={[ballRadius, 32, 32]} />
        <meshStandardMaterial color="#f59e0b" emissive="#7c2d12" />
      </mesh>

      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.15} target={[0, 0.8, 0]} />
    </>
  )
}

export function InclinedPlaneSim({ angleDeg, trackLength, ballMass }: Props) {
  const [isRunning, setIsRunning] = useState(false)
  const [time, setTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [lastTime, setLastTime] = useState<number | null>(null)
  const [trials, setTrials] = useState<number[]>([])

  const ballRadius = useMemo(() => Math.min(0.28, Math.max(0.18, 0.18 + (ballMass - 20) / 300)), [ballMass])

  const duration = useMemo(() => {
    const g = 9.81
    const theta = (angleDeg * Math.PI) / 180
    const a = g * Math.sin(theta)
    if (a <= 0) return 0
    return Math.sqrt((2 * trackLength) / a)
  }, [angleDeg, trackLength])

  const twoS = useMemo(() => Number((2 * trackLength).toFixed(3)), [trackLength])
  const tSquared = useMemo(() => (time !== null ? Number((time * time).toFixed(3)) : null), [time])
  const accelFromGraph = useMemo(
    () => (tSquared && tSquared > 0 ? Number((twoS / tSquared).toFixed(3)) : null),
    [twoS, tSquared],
  )
  const accelTheory = useMemo(
    () => Number((9.81 * Math.sin((angleDeg * Math.PI) / 180)).toFixed(3)),
    [angleDeg],
  )
  const avgTime = useMemo(() => {
    if (trials.length === 0) return null
    const avg = trials.reduce((a, b) => a + b, 0) / trials.length
    return Number(avg.toFixed(3))
  }, [trials])

  const graphPoints = useMemo(() => {
    return trials.map((t, i) => {
      const x = Number((t * t).toFixed(3)) // T^2
      const y = Number((2 * trackLength).toFixed(3)) // 2S
      return { id: i + 1, x, y }
    })
  }, [trials, trackLength])

  const slopeFromTrials = useMemo(() => {
    if (graphPoints.length < 2) return null
    const n = graphPoints.length
    const sumX = graphPoints.reduce((a, p) => a + p.x, 0)
    const sumY = graphPoints.reduce((a, p) => a + p.y, 0)
    const sumXY = graphPoints.reduce((a, p) => a + p.x * p.y, 0)
    const sumX2 = graphPoints.reduce((a, p) => a + p.x * p.x, 0)
    const denom = n * sumX2 - sumX * sumX
    if (Math.abs(denom) < 1e-9) return null
    return Number(((n * sumXY - sumX * sumY) / denom).toFixed(3))
  }, [graphPoints])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.dispatchEvent(
      new CustomEvent("inclined-plot-update", {
        detail: {
          trials,
          points: graphPoints,
          slope: slopeFromTrials,
          trackLength,
        },
      }),
    )
  }, [trials, graphPoints, slopeFromTrials, trackLength])

  useEffect(() => {
    setElapsed(0)
    setTime(null)
    setIsRunning(false)
    setTrials([])
  }, [angleDeg, trackLength, ballMass])

  useEffect(() => {
    if (!isRunning) return
    const t0 = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const sec = (now - t0) / 1000
      setElapsed(sec)
      if (sec >= duration) {
        const finalTime = Number(duration.toFixed(2))
        setTime(finalTime)
        setLastTime(finalTime)
        setTrials((prev) => [...prev, finalTime].slice(-5))
        setIsRunning(false)
        return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isRunning, duration])

  const handleRun = () => {
    setTime(null)
    setElapsed(0)
    setIsRunning(true)
  }

  const handleReset = () => {
    setIsRunning(false)
    setElapsed(0)
    setTime(null)
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex items-center gap-3">
        <Badge variant="outline">Angle: {angleDeg}°</Badge>
        <Badge variant="outline">Length: {trackLength.toFixed(1)} m</Badge>
        <Badge variant="outline">Mass: {ballMass} g</Badge>
        {time !== null && <Badge>Time: {time.toFixed(2)} s</Badge>}
        {time === null && lastTime !== null && <Badge variant="secondary">Last: {lastTime.toFixed(2)} s</Badge>}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleRun} className="gap-2" disabled={isRunning || duration <= 0}>
          <Play className="w-4 h-4" />
          Run Trial
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">2S (m)</div>
          <div className="text-lg font-semibold">{twoS.toFixed(3)}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">T² (s²)</div>
          <div className="text-lg font-semibold">{tSquared !== null ? tSquared.toFixed(3) : "--"}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">a = 2S/T² (m/s²)</div>
          <div className="text-lg font-semibold">{accelFromGraph !== null ? accelFromGraph.toFixed(3) : "--"}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">a_theory = g sin(theta)</div>
          <div className="text-lg font-semibold">{accelTheory.toFixed(3)}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[300px]">
        <Canvas camera={{ position: [0, 3.8, 7], fov: 45, near: 0.1, far: 1000 }}>
          <SimScene
            angleDeg={angleDeg}
            trackLength={trackLength}
            isRunning={isRunning}
            elapsed={elapsed}
            duration={duration}
            ballRadius={ballRadius}
          />
        </Canvas>
      </div>

    </div>
  )
}
