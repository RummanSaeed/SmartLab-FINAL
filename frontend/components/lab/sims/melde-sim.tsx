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

type Measurement = {
  loops: number
  frequency: number
  wavelength: number
}

// Sonometer box
function SonometerBox() {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Main wooden box */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[5, 0.4, 1.2]} />
        <meshStandardMaterial color="#8B5A2B" roughness={0.7} />
      </mesh>
      
      {/* Top surface - hollow middle for sound */}
      <mesh position={[0, 0.21, 0]}>
        <boxGeometry args={[4.8, 0.02, 1]} />
        <meshStandardMaterial color="#A0522D" roughness={0.6} />
      </mesh>
      
      {/* Scale markings on top */}
      {Array.from({ length: 51 }).map((_, i) => {
        const x = -2.4 + i * 0.096
        const isMajor = i % 5 === 0
        return (
          <mesh key={i} position={[x, 0.23, 0.4]}>
            <boxGeometry args={[0.005, isMajor ? 0.03 : 0.015, 0.01]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        )
      })}
      
      {/* Length numbers */}
      {[0, 10, 20, 30, 40, 50].map((cm) => (
        <Text 
          key={cm} 
          position={[-2.4 + cm * 0.048, 0.3, 0.5]} 
          fontSize={0.06} 
          color="#1e293b" 
          anchorX="center"
        >
          {cm}
        </Text>
      ))}
      
      {/* Box label */}
      <Text position={[0, 0.5, 0.6]} fontSize={0.08} color="#8B5A2B" anchorX="center">
        SONOMETER
      </Text>
    </group>
  )
}

// Movable bridge
function Bridge({ position, onPositionChange }: { position: number; onPositionChange?: (pos: number) => void }) {
  const x = -2.4 + position * 0.048
  
  return (
    <group position={[x, 0.4, 0]}>
      {/* Bridge knife edge */}
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.02, 0.9, 16]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#475569" metalness={0.7} />
      </mesh>
      
      {/* Bridge base */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.12, 0.15, 0.95]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      
      {/* Position indicator */}
      <Text position={[0, 0.15, 0]} fontSize={0.05} color="#ef4444" anchorX="center">
        {position.toFixed(0)}cm
      </Text>
    </group>
  )
}

// Vibrating string with nodes/antinodes
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
  const startX = -2.4 + leftBridge * 0.048
  const endX = -2.4 + rightBridge * 0.048
  const length = endX - startX
  
  useFrame(({ clock }) => {
    if (isVibrating && stringRef.current) {
      // Create standing wave pattern
      const time = clock.getElapsedTime() * 20
      const positions = stringRef.current.geometry.attributes.position
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const normalizedX = (x - startX) / length
        // Standing wave: y = 2A sin(kx) cos(ωt)
        const k = loops * Math.PI
        const waveY = amplitude * Math.sin(k * normalizedX) * Math.cos(time)
        positions.setY(i, waveY)
      }
      positions.needsUpdate = true
    }
  })
  
  // Create string geometry with segments
  const stringGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(length, 0.02, 64, 1)
    geo.translate(startX + length/2, 0.55, 0)
    return geo
  }, [length, startX])
  
  return (
    <mesh ref={stringRef} geometry={stringGeometry}>
      <meshStandardMaterial 
        color={isVibrating ? "#22c55e" : "#94a3b8"} 
        emissive={isVibrating ? "#22c55e" : "#000000"}
        emissiveIntensity={isVibrating ? 0.5 : 0}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Tuning fork with vibration
function TuningFork({ isVibrating }: { isVibrating: boolean }) {
  const forkRef = useRef<THREE.Group>(null)
  const prongsRef = useRef<THREE.Mesh[]>([])
  
  useFrame(() => {
    if (isVibrating && prongsRef.current.length === 2) {
      const vibration = Math.sin(Date.now() * 0.05) * 0.02
      prongsRef.current[0].position.x = 0.06 + vibration
      prongsRef.current[1].position.x = -0.06 - vibration
    }
  })
  
  return (
    <group ref={forkRef} position={[2, 1.2, 0]} rotation={[0, 0, Math.PI/6]}>
      {/* Fork handle */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
      
      {/* Fork base */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.08]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
      
      {/* Prongs */}
      <mesh ref={el => { if (el) prongsRef.current[0] = el }} position={[0.06, 0.7, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} emissive="#f59e0b" emissiveIntensity={isVibrating ? 0.3 : 0} />
      </mesh>
      <mesh ref={el => { if (el) prongsRef.current[1] = el }} position={[-0.06, 0.7, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} emissive="#f59e0b" emissiveIntensity={isVibrating ? 0.3 : 0} />
      </mesh>
      
      {/* Vibration waves */}
      {isVibrating && (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh key={i} position={[0.4 + i * 0.1, 0.5, 0]} rotation={[0, 0, Math.PI/6]}>
              <ringGeometry args={[0.05 + i * 0.03, 0.06 + i * 0.03, 32]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.5 - i * 0.1} />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}

// Paper rider
function PaperRider({ position }: { position: number }) {
  const x = -2.4 + position * 0.048
  
  return (
    <mesh position={[x, 0.65, 0]}>
      <boxGeometry args={[0.08, 0.02, 0.3]} />
      <meshStandardMaterial color="#fef3c7" />
    </mesh>
  )
}

// Weight hanger for tension
function WeightHanger({ tension }: { tension: number }) {
  const weightCount = Math.min(10, Math.ceil(tension / 10))
  
  return (
    <group position={[-3.5, 0.5, 0]}>
      {/* String from pulley */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.8, 8]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      {/* Pulley wheel */}
      <mesh position={[0.8, 0.55, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.08, 32]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#475569" metalness={0.6} />
      </mesh>
      
      {/* Hanger pan */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.12, 16]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.3} />
      </mesh>
      
      {/* Weights */}
      {Array.from({ length: weightCount }).map((_, i) => (
        <mesh key={i} position={[0, 0.05 + i * 0.06, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.4} />
        </mesh>
      ))}
      
      {/* Tension label */}
      <Text position={[0.5, 0.3, 0]} fontSize={0.08} color="#f59e0b" anchorX="left">
        T = {tension} N
      </Text>
    </group>
  )
}

// Frequency display
function FrequencyDisplay({ frequency }: { frequency: number }) {
  return (
    <group position={[0, 2.5, 0]}>
      <mesh>
        <boxGeometry args={[1.5, 0.6, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[1.3, 0.4]} />
        <meshStandardMaterial color="#0f172a" emissive="#22c55e" emissiveIntensity={0.1} />
      </mesh>
      
      <Text position={[0, 0.08, 0.07]} fontSize={0.15} color="#22c55e" anchorX="center">
        {frequency.toFixed(1)} Hz
      </Text>
      <Text position={[0, -0.18, 0.07]} fontSize={0.06} color="#94a3b8" anchorX="center">
        RESONANCE FREQUENCY
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
  const rightBridgePos = stringLength
  
  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 3]} intensity={1} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#fbbf24" />
      
      {/* Lab bench */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.9} />
      </mesh>
      
      <SonometerBox />
      <Bridge position={0} />
      <Bridge position={rightBridgePos} />
      <VibratingString 
        leftBridge={0} 
        rightBridge={rightBridgePos} 
        loops={loops}
        isVibrating={isVibrating}
        amplitude={0.05}
      />
      <PaperRider position={rightBridgePos / 2} />
      <TuningFork isVibrating={isVibrating} />
      <WeightHanger tension={tension} />
      <FrequencyDisplay frequency={frequency} />
      
      <OrbitControls 
        enablePan={false} 
        minDistance={5} 
        maxDistance={10} 
        target={[0, 1, 0]}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  )
}

export function MeldeSim({ 
  stringLength: initialStringLength = 100, 
  tension: initialTension = 50, 
  massPerUnitLength: initialMassPerLength = 0.8
}: Props) {
  // Adjustable parameters
  const [stringLength, setStringLength] = useState(initialStringLength)
  const [tension, setTension] = useState(initialTension)
  const [massPerUnitLength, setMassPerUnitLength] = useState(initialMassPerLength)
  
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [isVibrating, setIsVibrating] = useState(false)
  const [loops, setLoops] = useState(1)
  
  // Calculate frequency using Melde's experiment formula
  // f = (p/2L) * sqrt(T/μ) where p = number of loops
  // For AC frequency: f = n/2 * sqrt(T/μ) / L
  const calculateFrequency = (loopCount: number): number => {
    const L = stringLength / 100 // Convert cm to m
    const T = tension
    const mu = massPerUnitLength / 1000 // Convert g/cm to kg/m
    
    // f = (p/2L) * sqrt(T/μ)
    return (loopCount / (2 * L)) * Math.sqrt(T / mu)
  }
  
  const frequency = calculateFrequency(loops)
  
  const startVibration = () => {
    setIsVibrating(true)
  }
  
  const stopVibration = () => {
    setIsVibrating(false)
  }
  
  const recordMeasurement = () => {
    if (isVibrating) {
      setMeasurements(prev => [...prev, {
        loops,
        frequency: Number(frequency.toFixed(1)),
        wavelength: Number((2 * stringLength / 100 / loops).toFixed(3))
      }].slice(-6))
    }
  }
  
  const increaseLoops = () => {
    setLoops(prev => Math.min(8, prev + 1))
  }
  
  const decreaseLoops = () => {
    setLoops(prev => Math.max(1, prev - 1))
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
        <Badge>Frequency: {frequency.toFixed(1)} Hz</Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Adjust string length and tension to find resonance with AC frequency. 
        The paper rider will be thrown off at resonance. Formula: f = (n/2L)√(T/μ)
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">String Length</div>
          <div className="text-lg font-semibold text-blue-400">{stringLength.toFixed(0)} cm</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Tension</div>
          <div className="text-lg font-semibold text-amber-500">{tension.toFixed(0)} N</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Loops (n)</div>
          <div className="text-lg font-semibold text-green-500">{loops}</div>
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
        <Button variant="outline" onClick={decreaseLoops} className="gap-2">n-1</Button>
        <Button variant="outline" onClick={increaseLoops} className="gap-2">n+1</Button>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      {/* Measurements */}
      {measurements.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs font-medium mb-2">Measurements:</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-muted-foreground">Loops (n)</div>
            <div className="text-muted-foreground">Frequency (Hz)</div>
            <div className="text-muted-foreground">Wavelength (m)</div>
            {measurements.map((m, i) => (
              <div key={i} className="contents">
                <div>{m.loops}</div>
                <div>{m.frequency}</div>
                <div>{m.wavelength}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
        <Canvas camera={{ position: [6, 4, 5], fov: 50 }} shadows>
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
