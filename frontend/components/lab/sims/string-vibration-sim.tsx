"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Line } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, CheckCircle2, Volume2 } from "lucide-react"
import * as THREE from "three"

type Props = {
  stringLength: number // cm
  tension: number // N
  massPerUnitLength: number // g/cm
}

type LawData = {
  parameter: string
  value: number
  frequency: number
}

// Sonometer box
function SonometerBox() {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Main wooden box */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[6, 0.4, 1.5]} />
        <meshStandardMaterial color="#8B5A2B" roughness={0.7} />
      </mesh>
      
      {/* Top surface */}
      <mesh position={[0, 0.21, 0]}>
        <boxGeometry args={[5.8, 0.02, 1.3]} />
        <meshStandardMaterial color="#A0522D" roughness={0.6} />
      </mesh>
      
      {/* Scale markings */}
      {Array.from({ length: 61 }).map((_, i) => {
        const x = -2.9 + i * 0.0967
        const isMajor = i % 5 === 0
        return (
          <mesh key={i} position={[x, 0.23, 0.55]}>
            <boxGeometry args={[0.005, isMajor ? 0.04 : 0.02, 0.01]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        )
      })}
      
      {/* Length numbers */}
      {[0, 20, 40, 60, 80, 100].map((cm) => (
        <Text 
          key={cm} 
          position={[-2.9 + cm * 0.058, 0.32, 0.7]} 
          fontSize={0.07} 
          color="#1e293b" 
          anchorX="center"
        >
          {cm}
        </Text>
      ))}
    </group>
  )
}

// Movable bridges
function Bridge({ position, label }: { position: number; label?: string }) {
  const x = -2.9 + position * 0.058
  
  return (
    <group position={[x, 0.4, 0]}>
      {/* Bridge knife edge */}
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.03, 1.2, 16]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#475569" metalness={0.7} />
      </mesh>
      
      {/* Bridge base */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.15, 0.2, 1.3]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      
      {/* Label */}
      {label && (
        <Text position={[0, 0.2, 0]} fontSize={0.06} color="#ef4444" anchorX="center">
          {label}
        </Text>
      )}
    </group>
  )
}

// Vibrating string
function VibratingString({ 
  leftBridge, 
  rightBridge, 
  loops, 
  isVibrating,
  amplitude
}: { 
  leftBridge: number; 
  rightBridge: number; 
  loops: number;
  isVibrating: boolean;
  amplitude: number;
}) {
  const stringRef = useRef<THREE.Mesh>(null)
  const startX = -2.9 + leftBridge * 0.058
  const endX = -2.9 + rightBridge * 0.058
  const length = endX - startX
  
  useFrame(({ clock }) => {
    if (isVibrating && stringRef.current) {
      const time = clock.getElapsedTime() * 15
      const positions = stringRef.current.geometry.attributes.position
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const normalizedX = (x - startX) / length
        const k = loops * Math.PI
        const waveY = amplitude * Math.sin(k * normalizedX) * Math.cos(time)
        positions.setY(i, waveY)
      }
      positions.needsUpdate = true
    }
  })
  
  const stringGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(length, 0.025, 80, 1)
    geo.translate(startX + length/2, 0.6, 0)
    return geo
  }, [length, startX])
  
  return (
    <mesh ref={stringRef} geometry={stringGeometry}>
      <meshStandardMaterial 
        color={isVibrating ? "#8b5cf6" : "#94a3b8"} 
        emissive={isVibrating ? "#8b5cf6" : "#000000"}
        emissiveIntensity={isVibrating ? 0.6 : 0}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Nodes and antinodes visualization
function NodesVisualization({ loops, leftBridge, rightBridge }: { loops: number; leftBridge: number; rightBridge: number }) {
  const startX = -2.9 + leftBridge * 0.058
  const endX = -2.9 + rightBridge * 0.058
  const length = endX - startX
  
  const nodePositions = []
  for (let i = 0; i <= loops; i++) {
    const t = i / loops
    nodePositions.push(startX + t * length)
  }
  
  return (
    <>
      {nodePositions.map((x, i) => (
        <group key={i} position={[x, 0.6, 0.1]}>
          {/* Node marker */}
          <mesh>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
          </mesh>
          <Text position={[0, 0.15, 0]} fontSize={0.05} color="#ef4444" anchorX="center">
            N{i}
          </Text>
        </group>
      ))}
    </>
  )
}

// Tuning fork
function TuningFork({ frequency, isVibrating }: { frequency: number; isVibrating: boolean }) {
  const forkRef = useRef<THREE.Group>(null)
  const prongsRef = useRef<THREE.Mesh[]>([])
  
  useFrame(() => {
    if (isVibrating && prongsRef.current.length === 2) {
      const vibration = Math.sin(Date.now() * 0.08) * 0.015
      prongsRef.current[0].position.x = 0.05 + vibration
      prongsRef.current[1].position.x = -0.05 - vibration
    }
  })
  
  return (
    <group ref={forkRef} position={[3, 1.3, 0]} rotation={[0, 0, Math.PI/8]}>
      {/* Fork handle */}
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 0.5, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.08, 0.06]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
      
      {/* Prongs */}
      <mesh ref={el => { if (el) prongsRef.current[0] = el }} position={[0.05, 0.6, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.5, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} emissive="#f59e0b" emissiveIntensity={isVibrating ? 0.4 : 0} />
      </mesh>
      <mesh ref={el => { if (el) prongsRef.current[1] = el }} position={[-0.05, 0.6, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.5, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} emissive="#f59e0b" emissiveIntensity={isVibrating ? 0.4 : 0} />
      </mesh>
      
      {/* Frequency label */}
      <Text position={[0.3, 0.8, 0]} fontSize={0.06} color="#f59e0b" anchorX="left">
        f = {frequency.toFixed(1)} Hz
      </Text>
    </group>
  )
}

// Weight hanger
function WeightHanger({ tension }: { tension: number }) {
  const weightCount = Math.min(15, Math.ceil(tension / 5))
  
  return (
    <group position={[-4.5, 0.5, 0]}>
      {/* String */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.8, 8]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      {/* Pulley */}
      <mesh position={[1, 0.6, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.1, 32]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#475569" metalness={0.6} />
      </mesh>
      
      {/* Hanger */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.18, 0.15, 16]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.3} />
      </mesh>
      
      {/* Weights */}
      {Array.from({ length: weightCount }).map((_, i) => (
        <mesh key={i} position={[0, 0.08 + i * 0.05, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.04, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.4} />
        </mesh>
      ))}
      
      <Text position={[0.6, 0.5, 0]} fontSize={0.08} color="#f59e0b" anchorX="left">
        T = {tension} N
      </Text>
    </group>
  )
}

function Scene({ 
  stringLength,
  tension,
  loops,
  isVibrating,
  frequency
}: { 
  stringLength: number;
  tension: number;
  loops: number;
  isVibrating: boolean;
  frequency: number;
}) {
  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 3]} intensity={1} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#8b5cf6" />
      
      {/* Lab bench */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.9} />
      </mesh>
      
      <SonometerBox />
      <Bridge position={0} label="B1" />
      <Bridge position={stringLength} label="B2" />
      <VibratingString 
        leftBridge={0} 
        rightBridge={stringLength} 
        loops={loops}
        isVibrating={isVibrating}
        amplitude={0.06}
      />
      {isVibrating && (
        <NodesVisualization loops={loops} leftBridge={0} rightBridge={stringLength} />
      )}
      <TuningFork frequency={frequency} isVibrating={isVibrating} />
      <WeightHanger tension={tension} />
      
      {/* Laws display */}
      <Text position={[0, 3, 0]} fontSize={0.1} color="#8b5cf6" anchorX="center">
        Laws of String Vibration
      </Text>
      <Text position={[0, 2.8, 0]} fontSize={0.07} color="#94a3b8" anchorX="center">
        f ∝ 1/L, f ∝ √T, f ∝ 1/√μ
      </Text>
      
      <OrbitControls 
        enablePan={false} 
        minDistance={6} 
        maxDistance={12} 
        target={[0, 1, 0]}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  )
}

export function StringVibrationSim({ 
  stringLength: initialStringLength = 100, 
  tension: initialTension = 50, 
  massPerUnitLength: initialMassPerLength = 0.8
}: Props) {
  // Adjustable parameters
  const [stringLength, setStringLength] = useState(initialStringLength)
  const [tension, setTension] = useState(initialTension)
  const [massPerUnitLength, setMassPerUnitLength] = useState(initialMassPerLength)
  
  const [measurements, setMeasurements] = useState<LawData[]>([])
  const [isVibrating, setIsVibrating] = useState(false)
  const [loops, setLoops] = useState(1)
  const [currentLaw, setCurrentLaw] = useState<"length" | "tension" | "mass">("length")
  
  // Calculate frequency
  const calculateFrequency = (L: number, T: number, mu: number, n: number): number => {
    return (n / (2 * L / 100)) * Math.sqrt(T / (mu / 1000))
  }
  
  const frequency = calculateFrequency(stringLength, tension, massPerUnitLength, loops)
  
  const startVibration = () => setIsVibrating(true)
  const stopVibration = () => setIsVibrating(false)
  
  const recordMeasurement = () => {
    if (isVibrating) {
      const paramValue = currentLaw === "length" ? stringLength : 
                        currentLaw === "tension" ? tension : massPerUnitLength
      
      setMeasurements(prev => [...prev, {
        parameter: currentLaw,
        value: paramValue,
        frequency: Number(frequency.toFixed(1))
      }].slice(-8))
    }
  }
  
  const changeLoops = (delta: number) => {
    setLoops(prev => Math.max(1, Math.min(8, prev + delta)))
  }
  
  const reset = () => {
    setIsVibrating(false)
    setLoops(1)
    setMeasurements([])
  }
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Length: {stringLength.toFixed(0)} cm</Badge>
        <Badge variant="outline">Tension: {tension.toFixed(0)} N</Badge>
        <Badge variant="outline">μ: {massPerUnitLength.toFixed(2)} g/cm</Badge>
        <Badge>f = {frequency.toFixed(1)} Hz</Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Verify laws: f ∝ 1/L (length), f ∝ √T (tension), f ∝ 1/√μ (mass per unit length). 
        Use tuning fork of known frequency.
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Length</div>
          <div className="text-lg font-semibold text-blue-400">{stringLength.toFixed(0)} cm</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Tension</div>
          <div className="text-lg font-semibold text-amber-500">{tension.toFixed(0)} N</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Loops</div>
          <div className="text-lg font-semibold text-purple-400">{loops}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Frequency</div>
          <div className="text-lg font-semibold text-green-500">{frequency.toFixed(1)} Hz</div>
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={isVibrating ? stopVibration : startVibration}
          className="gap-2"
        >
          <Volume2 className="w-4 h-4" />
          {isVibrating ? "Stop" : "Vibrate"}
        </Button>
        <Button variant="outline" onClick={recordMeasurement} disabled={!isVibrating} className="gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Record
        </Button>
        <Button variant="outline" onClick={() => changeLoops(-1)} className="gap-2">n-1</Button>
        <Button variant="outline" onClick={() => changeLoops(1)} className="gap-2">n+1</Button>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      {/* Measurements */}
      {measurements.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs font-medium mb-2">Data for {currentLaw} law:</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-muted-foreground">Parameter</div>
            <div className="text-muted-foreground">Value</div>
            <div className="text-muted-foreground">Frequency (Hz)</div>
            {measurements.map((m, i) => (
              <div key={i} className="contents">
                <div>{m.parameter}</div>
                <div>{m.value.toFixed(2)}</div>
                <div>{m.frequency}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
        <Canvas camera={{ position: [7, 4, 6], fov: 50 }} shadows>
          <Scene 
            stringLength={stringLength}
            tension={tension}
            loops={loops}
            isVibrating={isVibrating}
            frequency={frequency}
          />
        </Canvas>
      </div>
    </div>
  )
}
