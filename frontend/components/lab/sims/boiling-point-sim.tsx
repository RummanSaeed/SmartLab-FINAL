"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text, useTexture } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Pause } from "lucide-react"

const substances = [
  {
    key: "acetone",
    name: "Acetone",
    bp: 56.0,
    coldColor: "#dff6ff",
    warmColor: "#fde68a",
    boilColor: "#ffe08a",
    vaporColor: "#e5e7eb",
    heatFactor: 1.2,
    vaporFactor: 1.25,
  },
  {
    key: "benzene",
    name: "Benzene",
    bp: 80.1,
    coldColor: "#f1f5f9",
    warmColor: "#fcd34d",
    boilColor: "#fbbf24",
    vaporColor: "#f3f4f6",
    heatFactor: 0.9,
    vaporFactor: 0.9,
  },
  {
    key: "ethanol",
    name: "Ethyl Alcohol",
    bp: 78.4,
    coldColor: "#ecfeff",
    warmColor: "#fde68a",
    boilColor: "#facc15",
    vaporColor: "#e2e8f0",
    heatFactor: 1.0,
    vaporFactor: 1.0,
  },
]

type SetupState = {
  stand: boolean
  beaker: boolean
  thermometer: boolean
  bottle: boolean
  liquidMl: number
  pouring: boolean
}

type SceneProps = {
  temp: number
  heating: boolean
  boiling: boolean
  liquidLevel: number
  coldColor: string
  warmColor: string
  boilColor: string
  vaporColor: string
  bp: number
  setup: SetupState
  vaporFactor: number
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

function FireLayer({ y, r, h, color, emissive }: { y: number; r: number; h: number; color: string; emissive: string }) {
  const ref = useRef<any>(null)
  const [p] = useState(() => Math.random() * Math.PI * 2)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const f = 1 + Math.sin(clock.elapsedTime * 10 + p) * 0.1
    ref.current.scale.set(f * 0.95, f, f * 0.95)
  })
  return (
    <mesh ref={ref} position={[0, y, -0.45]}>
      <coneGeometry args={[r, h, 20]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={1.4} transparent opacity={0.86} />
    </mesh>
  )
}

function Bubble({ i, active, factor, tempLevel }: { i: number; active: boolean; factor: number; tempLevel: number }) {
  const ref = useRef<any>(null)
  const [sx] = useState(() => (Math.random() - 0.5) * 0.24)
  const [sz] = useState(() => (Math.random() - 0.5) * 0.22)
  const [phase] = useState(() => Math.random() * Math.PI * 2)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const speed = 0.4 + tempLevel * 2.4 * factor
    const t = clock.elapsedTime * speed + phase + i * 0.2
    const rise = 0.2 + tempLevel * 0.75
    const y = 1.18 + (t % 1.0) * rise
    ref.current.visible = active && tempLevel > 0.18
    ref.current.position.set(sx, y, sz - 0.55)
    ref.current.material.opacity = Math.max(0.03, (0.08 + tempLevel * 0.48) - (y - 1.18) * 0.3)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.02, 8, 8]} />
      <meshStandardMaterial color="#c7f9ff" transparent opacity={0.2} />
    </mesh>
  )
}

function Vapor({
  i,
  active,
  color,
  factor,
  tempLevel,
}: {
  i: number
  active: boolean
  color: string
  factor: number
  tempLevel: number
}) {
  const ref = useRef<any>(null)
  const [sx] = useState(() => (Math.random() - 0.5) * 0.28)
  const [sz] = useState(() => (Math.random() - 0.5) * 0.2)
  const [phase] = useState(() => Math.random() * Math.PI * 2)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime * ((0.5 + tempLevel * 1.8) * factor) + phase + i * 0.3
    const y = 1.95 + (t % 2.2) * 0.28
    ref.current.visible = active && tempLevel > 0.08
    ref.current.position.set(sx + Math.sin(t) * 0.03, y, sz - 0.55)
    ref.current.material.opacity = Math.max(0, 0.06 + tempLevel * 0.32 - (y - 1.95) * 0.08)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.035, 10, 10]} />
      <meshStandardMaterial color={color} transparent opacity={0.2} />
    </mesh>
  )
}

function Scene({
  temp,
  heating,
  boiling,
  liquidLevel,
  coldColor,
  warmColor,
  boilColor,
  vaporColor,
  bp,
  setup,
  vaporFactor,
}: SceneProps) {
  const { camera } = useThree()
  const wallTex = useTexture("/chemistry-laboratory-beakers-test-tubes-colorful-l.jpg")
  useMemo(() => {
    camera.position.set(0, 4.8, 8)
    camera.lookAt(0, 1.7, -0.5)
  }, [camera])

  const thermoMin = 20
  const thermoMax = 110
  const tc = Math.max(thermoMin, Math.min(thermoMax, temp))
  const tNorm = (tc - thermoMin) / (thermoMax - thermoMin)
  const warmStart = 35
  const warmEnd = bp
  const heatBlendRaw = (temp - warmStart) / Math.max(1, warmEnd - warmStart)
  const heatBlend = Math.max(0, Math.min(1, heatBlendRaw))
  const tempLevel = clamp01((temp - 25) / Math.max(1, bp - 20))
  const liquidColor = boiling ? boilColor : heatBlend > 0.5 ? warmColor : coldColor
  const bottleX = setup.pouring ? 1.02 : 1.45
  const bottleY = setup.pouring ? 2.02 : 1.65
  const bottleZ = setup.pouring ? -0.48 : -0.35
  const bottleTilt = setup.pouring ? 1.02 : 0

  return (
    <>
      <color attach="background" args={["#020617"]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 8, 4]} intensity={1.2} />
      <pointLight position={[0, 0.95, -0.45]} intensity={heating ? 2.4 : 0.2} color="#fb923c" />

      <mesh position={[0, 2.1, -2.2]}>
        <planeGeometry args={[8, 4.2]} />
        <meshStandardMaterial map={wallTex} color="#9ca3af" transparent opacity={0.38} />
      </mesh>

      <mesh position={[0, 0.12, -0.65]}>
        <boxGeometry args={[4.4, 0.24, 2.1]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Stand + ring + gauze */}
      <mesh position={[-1.15, 1.25, -0.62]} visible={setup.stand}>
        <cylinderGeometry args={[0.05, 0.05, 2.25, 20]} />
        <meshStandardMaterial color="#6b7280" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.25, -0.62]} visible={setup.stand}>
        <torusGeometry args={[0.64, 0.05, 14, 40]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.28, -0.62]} visible={setup.stand}>
        <boxGeometry args={[1.45, 0.04, 1.45]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.55} roughness={0.4} />
      </mesh>

      {/* Burner */}
      <mesh position={[0, 0.55, -0.55]}>
        <cylinderGeometry args={[0.18, 0.23, 0.52, 20]} />
        <meshStandardMaterial color="#64748b" metalness={0.55} roughness={0.35} />
      </mesh>
      {heating && setup.stand && (
        <>
          <FireLayer y={0.82} r={0.17} h={0.56} color="#fb923c" emissive="#ea580c" />
          <FireLayer y={0.96} r={0.12} h={0.42} color="#fde68a" emissive="#f59e0b" />
          <mesh position={[0, 0.72, -0.48]}>
            <coneGeometry args={[0.08, 0.22, 18]} />
            <meshStandardMaterial color="#60a5fa" emissive="#1d4ed8" emissiveIntensity={1.7} transparent opacity={0.8} />
          </mesh>
        </>
      )}

      {/* Beaker + liquid */}
      <mesh position={[0, 1.92, -0.62]} visible={setup.beaker}>
        <cylinderGeometry args={[0.52, 0.57, 1.25, 36]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.18} />
      </mesh>
      <mesh position={[0, 1.37 + liquidLevel / 2, -0.62]} visible={setup.beaker && setup.liquidMl > 0}>
        <cylinderGeometry args={[0.45, 0.47, liquidLevel, 36]} />
        <meshStandardMaterial
          color={liquidColor}
          emissive={boiling ? warmColor : "#000000"}
          emissiveIntensity={boiling ? 0.35 : 0}
          transparent
          opacity={0.48}
        />
      </mesh>
      {setup.beaker &&
        [0, 20, 40, 60, 80, 100].map((ml) => {
          const y = 1.04 + (ml / 100) * 0.72
          return (
            <group key={`ml-${ml}`}>
              <mesh position={[0.5, y, -0.42]}>
                <boxGeometry args={[0.06, 0.004, 0.004]} />
                <meshStandardMaterial color="#e2e8f0" />
              </mesh>
              <Text position={[0.6, y, -0.42]} fontSize={0.035} color="#e2e8f0" anchorX="left" anchorY="middle">
                {ml}
              </Text>
            </group>
          )
        })}

      {/* Bottle + pouring stream */}
      <group position={[bottleX, bottleY, bottleZ]} rotation={[0, 0, bottleTilt]} visible={setup.bottle}>
        <mesh>
          <cylinderGeometry args={[0.18, 0.22, 0.8, 18]} />
          <meshStandardMaterial color={coldColor} transparent opacity={0.7} />
        </mesh>
        <mesh position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.2, 14]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>
      <mesh position={[0.74, 1.86, -0.5]} visible={setup.pouring}>
        <cylinderGeometry args={[0.02, 0.02, 0.55, 10]} />
        <meshStandardMaterial color={coldColor} emissive={warmColor} emissiveIntensity={0.25} transparent opacity={0.9} />
      </mesh>

      {/* Thermometer in beaker */}
      <mesh position={[-0.12, 2.05, -0.5]} visible={setup.thermometer}>
        <cylinderGeometry args={[0.04, 0.04, 1.25, 22]} />
        <meshStandardMaterial color="#f8fafc" transparent opacity={0.92} />
      </mesh>
      <mesh position={[-0.12, 1.42, -0.5]} visible={setup.thermometer}>
        <sphereGeometry args={[0.052, 18, 18]} />
        <meshStandardMaterial color="#ef4444" emissive="#7f1d1d" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-0.12, 1.52 + tNorm * 0.46, -0.5]} visible={setup.thermometer}>
        <cylinderGeometry args={[0.012, 0.012, Math.max(0.12, tNorm * 0.92), 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#7f1d1d" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.0, 1.98, -0.43]} visible={setup.thermometer}>
        <boxGeometry args={[0.34, 1.02, 0.01]} />
        <meshStandardMaterial color="#0b1220" transparent opacity={0.45} />
      </mesh>
      {setup.thermometer &&
        Array.from({ length: 19 }, (_, i) => {
          const value = 20 + i * 5
          const major = value % 10 === 0
          const y = 1.53 + i * 0.045
          return (
            <group key={`t-${value}`}>
              <mesh position={[-0.01, y, -0.422]}>
                <boxGeometry args={[major ? 0.1 : 0.06, 0.006, 0.006]} />
                <meshStandardMaterial color="#f8fafc" emissive="#94a3b8" emissiveIntensity={0.35} />
              </mesh>
              {major && (
                <Text position={[0.08, y, -0.42]} fontSize={0.053} color="#ffffff" anchorX="left" anchorY="middle">
                  {String(value)}
                </Text>
              )}
            </group>
          )
        })}

      {Array.from({ length: 18 }, (_, i) => (
        <Bubble
          key={`b-${i}`}
          i={i}
          active={heating && setup.beaker && setup.liquidMl > 0}
          factor={vaporFactor}
          tempLevel={tempLevel}
        />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <Vapor
          key={`v-${i}`}
          i={i}
          active={heating && setup.beaker && setup.liquidMl > 0}
          color={vaporColor}
          factor={vaporFactor}
          tempLevel={tempLevel}
        />
      ))}

      <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2.05} target={[0, 1.65, -0.6]} />
    </>
  )
}

export function BoilingPointSim({ heatRate, substanceIndex, setup }: { heatRate: number; substanceIndex: number; setup: SetupState }) {
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [attempts, setAttempts] = useState<number[]>([])
  const [bpRecorded, setBpRecorded] = useState<number | null>(null)
  const [trialOffset, setTrialOffset] = useState(0)

  const substance = substances[Math.max(0, Math.min(substances.length - 1, substanceIndex))]

  const effectiveBP = useMemo(() => substance.bp + trialOffset, [substance.bp, trialOffset])
  const temperature = Math.min(effectiveBP + 8, 20 + (heatRate / 3.5) * substance.heatFactor * time)
  const boiling = temperature >= effectiveBP
  const setupReady = setup.stand && setup.beaker && setup.thermometer && setup.liquidMl > 0

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setTime((t) => t + 0.12), 120)
    return () => clearInterval(id)
  }, [running])

  useEffect(() => {
    if (running && bpRecorded === null && boiling) {
      const obs = Number(temperature.toFixed(1))
      setBpRecorded(obs)
      setAttempts((prev) => [...prev, obs])
    }
  }, [running, bpRecorded, boiling, temperature])

  const mean = useMemo(() => {
    if (attempts.length === 0) return null
    return attempts.reduce((a, b) => a + b, 0) / attempts.length
  }, [attempts])

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="outline">Substance: {substance.name}</Badge>
        <Badge variant="outline">Heat rate: {heatRate} °C/min</Badge>
        <Badge variant="outline">Heating factor: {substance.heatFactor.toFixed(2)}</Badge>
        <Badge variant="outline">Temp: {temperature.toFixed(1)}°C</Badge>
        <Badge variant={boiling ? "default" : "secondary"}>State: {boiling ? "Boiling" : running ? "Heating" : "Setup"}</Badge>
        <Badge variant="outline">Volume: {setup.liquidMl} mL</Badge>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => setRunning(true)} disabled={running || !setupReady} className="gap-2">
          <Play className="w-4 h-4" />
          Run Heating
        </Button>
        <Button variant="destructive" onClick={() => setRunning(false)} disabled={!running} className="gap-2">
          <Pause className="w-4 h-4" />
          Stop
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            const noise = (Math.random() - 0.5) * 1.2
            setTrialOffset(Number(noise.toFixed(2)))
            setTime(0)
            setBpRecorded(null)
            setRunning(true)
          }}
          disabled={running || !setupReady}
        >
          New Trial
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setRunning(false)
            setTime(0)
            setAttempts([])
            setBpRecorded(null)
            setTrialOffset(0)
          }}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Trials
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Observed boil point</div>
          <div className="text-lg font-semibold">{bpRecorded !== null ? `${bpRecorded.toFixed(1)}°C` : "--"}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Reference boil point</div>
          <div className="text-lg font-semibold">{substance.bp.toFixed(1)}°C</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Attempts</div>
          <div className="text-lg font-semibold">{attempts.length}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Mean</div>
          <div className="text-lg font-semibold">{mean !== null ? `${mean.toFixed(1)}°C` : "--"}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[440px]">
        <Canvas camera={{ position: [0, 4.8, 8], fov: 46, near: 0.1, far: 1000 }}>
          <Scene
            temp={temperature}
            heating={running}
            boiling={boiling}
            liquidLevel={(Math.max(0, Math.min(100, setup.liquidMl)) / 100) * 0.82}
            coldColor={substance.coldColor}
            warmColor={substance.warmColor}
            boilColor={substance.boilColor}
            vaporColor={substance.vaporColor}
            bp={effectiveBP}
            setup={setup}
            vaporFactor={substance.vaporFactor}
          />
        </Canvas>
      </div>

      {boiling && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          Boiling point reached. Observe sustained bubbling and record thermometer reading now:{" "}
          <span className="font-semibold">{temperature.toFixed(1)}°C</span>
        </div>
      )}

      {!setupReady && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
          Complete setup in Equipment tab: stand, beaker, thermometer, and pour liquid before heating.
        </div>
      )}

      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <div className="text-sm font-semibold mb-2">Observed Readings</div>
        {attempts.length === 0 ? (
          <div className="text-sm text-muted-foreground">No readings yet</div>
        ) : (
          <div className="space-y-1 text-sm">
            {attempts.map((v, i) => (
              <div key={`bp-a-${i}`} className="flex items-center justify-between">
                <span className="text-muted-foreground">Attempt {i + 1}</span>
                <span className="font-medium">{v.toFixed(1)}°C</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
