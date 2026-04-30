"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, CheckCircle2, Volume2, ChevronUp, ChevronDown } from "lucide-react"
import * as THREE from "three"

type Props = {
  tuningForkFreq: number // Hz
  tubeDiameter: number // cm
}

type ResonanceData = {
  forkFreq: number
  airColumnLength: number
  wavelength: number
  velocity: number
}

// Glass resonance tube
function ResonanceTube({ waterLevel }: { waterLevel: number }) {
  const tubeHeight = 3
  const tubeRadius = 0.25
  const actualWaterHeight = (waterLevel / 100) * tubeHeight
  
  return (
    <group position={[0, 0.5, 0]}>
      {/* Tube outer wall - glass */}
      <mesh>
        <cylinderGeometry args={[tubeRadius, tubeRadius, tubeHeight, 32]} />
        <meshPhysicalMaterial 
          color="#e2e8f0"
          metalness={0}
          roughness={0.05}
          transmission={0.9}
          thickness={0.02}
          transparent
          opacity={0.2}
        />
      </mesh>
      
      {/* Tube inner wall */}
      <mesh>
        <cylinderGeometry args={[tubeRadius - 0.02, tubeRadius - 0.02, tubeHeight - 0.05, 32]} />
        <meshPhysicalMaterial 
          color="#f1f5f9"
          transmission={0.7}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Water inside */}
      {actualWaterHeight > 0 && (
        <mesh position={[0, -tubeHeight/2 + actualWaterHeight/2, 0]}>
          <cylinderGeometry args={[tubeRadius - 0.03, tubeRadius - 0.03, actualWaterHeight, 32]} />
          <meshStandardMaterial 
            color="#3b82f6" 
            transparent 
            opacity={0.6}
            roughness={0.1}
          />
        </mesh>
      )}
      
      {/* Water level indicator line */}
      <mesh position={[tubeRadius + 0.02, -tubeHeight/2 + actualWaterHeight, 0]}>
        <boxGeometry args={[0.08, 0.01, 0.5]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Height scale on tube */}
      {Array.from({ length: 31 }).map((_, i) => {
        const y = -tubeHeight/2 + i * 0.1
        const isMajor = i % 5 === 0
        return (
          <mesh key={i} position={[tubeRadius + 0.01, y, 0]}>
            <boxGeometry args={[isMajor ? 0.05 : 0.02, 0.005, 0.3]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        )
      })}
      
      {/* Scale numbers */}
      {[0, 5, 10, 15, 20, 25, 30].map((cm) => (
        <Text 
          key={cm} 
          position={[tubeRadius + 0.15, -tubeHeight/2 + cm * 0.03, 0]} 
          fontSize={0.04} 
          color="#1e293b" 
          anchorX="left"
        >
          {cm}cm
        </Text>
      ))}
      
      {/* Tube label */}
      <Text position={[0, tubeHeight/2 + 0.15, 0]} fontSize={0.06} color="#64748b" anchorX="center">
        RESONANCE TUBE
      </Text>
    </group>
  )
}

// Water reservoir
function WaterReservoir({ onAdjustLevel }: { onAdjustLevel: (delta: number) => void }) {
  return (
    <group position={[1.5, 0.3, 0]}>
      {/* Reservoir body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.6, 32]} />
        <meshPhysicalMaterial 
          color="#e2e8f0"
          transmission={0.8}
          transparent
          opacity={0.3}
          roughness={0.1}
        />
      </mesh>
      
      {/* Water in reservoir */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.5, 32]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.7} roughness={0.1} />
      </mesh>
      
      {/* Connecting tube */}
      <mesh position={[-0.6, 0, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 16]} />
        <meshStandardMaterial color="#94a3b8" transparent opacity={0.5} />
      </mesh>
      
      {/* Label */}
      <Text position={[0, 0.4, 0]} fontSize={0.05} color="#3b82f6" anchorX="center">
        Reservoir
      </Text>
    </group>
  )
}

// Tuning fork
function TuningFork({ frequency, isVibrating }: { frequency: number; isVibrating: boolean }) {
  const forkRef = useRef<THREE.Group>(null)
  const prongsRef = useRef<THREE.Mesh[]>([])
  
  useFrame(() => {
    if (isVibrating && prongsRef.current.length === 2) {
      const vibration = Math.sin(Date.now() * frequency * 0.01) * 0.01
      prongsRef.current[0].position.x = 0.04 + vibration
      prongsRef.current[1].position.x = -0.04 - vibration
    }
  })
  
  return (
    <group ref={forkRef} position={[0, 2.8, 0]}>
      {/* Fork handle */}
      <mesh>
        <cylinderGeometry args={[0.025, 0.025, 0.4, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.05]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
      
      {/* Prongs */}
      <mesh ref={el => { if (el) prongsRef.current[0] = el }} position={[0.04, 0.55, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.4, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} emissive="#f59e0b" emissiveIntensity={isVibrating ? 0.5 : 0} />
      </mesh>
      <mesh ref={el => { if (el) prongsRef.current[1] = el }} position={[-0.04, 0.55, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.4, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} emissive="#f59e0b" emissiveIntensity={isVibrating ? 0.5 : 0} />
      </mesh>
      
      {/* Sound waves when vibrating */}
      {isVibrating && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[0, 0.3 - i * 0.15, 0]}>
              <ringGeometry args={[0.08 + i * 0.02, 0.1 + i * 0.02, 32]} rotation={[Math.PI/2, 0, 0]} />
              <meshBasicMaterial color="#f59e0b" transparent opacity={0.6 - i * 0.07} />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}

// Sound wave visualization
function SoundWaves({ 
  isResonating, 
  airColumnLength,
  forkFreq 
}: { 
  isResonating: boolean; 
  airColumnLength: number;
  forkFreq: number;
}) {
  const wavesRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (isResonating && wavesRef.current) {
      const time = clock.getElapsedTime()
      wavesRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh
        mesh.scale.x = 1 + Math.sin(time * 10 + i) * 0.1
        mesh.scale.y = 1 + Math.cos(time * 10 + i) * 0.1
      })
    }
  })
  
  const tubeHeight = 3
  const waterHeight = (airColumnLength / 100) * tubeHeight
  const airStart = -tubeHeight/2 + waterHeight
  const airEnd = tubeHeight/2
  
  return (
    <group ref={wavesRef}>
      {/* Standing wave pattern in air column */}
      {isResonating && Array.from({ length: 5 }).map((_, i) => {
        const y = airStart + (i + 1) * (airEnd - airStart) / 6
        return (
          <mesh key={i} position={[0.4, y, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial 
              color="#22c55e" 
              emissive="#22c55e" 
              emissiveIntensity={0.8}
              transparent
              opacity={0.8}
            />
          </mesh>
        )
      })}
      
      {/* Wave lines */}
      {isResonating && (
        <>
          <mesh position={[0.5, (airStart + airEnd)/2, 0]}>
            <cylinderGeometry args={[0.005, 0.005, airEnd - airStart, 8]} />
            <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}
    </group>
  )
}

// Frequency display
function FrequencyDisplay({ frequency, isVibrating }: { frequency: number; isVibrating: boolean }) {
  return (
    <group position={[-1.5, 2.5, 0]}>
      <mesh>
        <boxGeometry args={[1.2, 0.7, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[1, 0.5]} />
        <meshStandardMaterial 
          color={isVibrating ? "#0f172a" : "#1e293b"} 
          emissive={isVibrating ? "#f59e0b" : "#000000"}
          emissiveIntensity={isVibrating ? 0.2 : 0}
        />
      </mesh>
      
      <Text position={[0, 0.1, 0.07]} fontSize={0.15} color="#f59e0b" anchorX="center">
        {frequency.toFixed(0)} Hz
      </Text>
      <Text position={[0, -0.2, 0.07]} fontSize={0.06} color="#94a3b8" anchorX="center">
        TUNING FORK
      </Text>
    </group>
  )
}

// Air column length display
function AirColumnDisplay({ length, isResonant }: { length: number; isResonant: boolean }) {
  return (
    <group position={[-1.5, 1.5, 0]}>
      <mesh>
        <boxGeometry args={[1.2, 0.6, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[1, 0.4]} />
        <meshStandardMaterial 
          color="#0f172a" 
          emissive={isResonant ? "#22c55e" : "#000000"}
          emissiveIntensity={isResonant ? 0.3 : 0}
        />
      </mesh>
      
      <Text position={[0, 0.08, 0.07]} fontSize={0.12} color={isResonant ? "#22c55e" : "#60a5fa"} anchorX="center">
        {length.toFixed(1)} cm
      </Text>
      <Text position={[0, -0.18, 0.07]} fontSize={0.05} color="#94a3b8" anchorX="center">
        AIR COLUMN
      </Text>
    </group>
  )
}

function Scene({ 
  waterLevel,
  tuningForkFreq,
  isVibrating,
  isResonant,
  onAdjustLevel
}: { 
  waterLevel: number;
  tuningForkFreq: number;
  isVibrating: boolean;
  isResonant: boolean;
  onAdjustLevel: (delta: number) => void;
}) {
  const airColumnLength = 100 - waterLevel // Air column = 100cm - water level
  
  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 3]} intensity={1} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#fbbf24" />
      
      {/* Lab bench */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.9} />
      </mesh>
      
      <ResonanceTube waterLevel={waterLevel} />
      <WaterReservoir onAdjustLevel={onAdjustLevel} />
      <TuningFork frequency={tuningForkFreq} isVibrating={isVibrating} />
      <SoundWaves 
        isResonating={isResonant && isVibrating} 
        airColumnLength={airColumnLength}
        forkFreq={tuningForkFreq}
      />
      <FrequencyDisplay frequency={tuningForkFreq} isVibrating={isVibrating} />
      <AirColumnDisplay length={airColumnLength} isResonant={isResonant} />
      
      {/* Instructions */}
      <Text position={[0, 3.5, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        Adjust water level to find resonance positions
      </Text>
      <Text position={[0, 3.35, 0]} fontSize={0.06} color="#64748b" anchorX="center">
        First resonance: L = λ/4, Second resonance: L = 3λ/4
      </Text>
      
      <OrbitControls 
        enablePan={false} 
        minDistance={4} 
        maxDistance={10} 
        target={[0, 1.5, 0]}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  )
}

export function ResonanceTubeSim({ 
  tuningForkFreq: initialTuningForkFreq = 512, 
  tubeDiameter: initialTubeDiameter = 3
}: Props) {
  // Adjustable parameters
  const [tuningForkFreq, setTuningForkFreq] = useState(initialTuningForkFreq)
  const [tubeDiameter, setTubeDiameter] = useState(initialTubeDiameter)
  
  const [waterLevel, setWaterLevel] = useState(70) // Percentage (70% water = 30% air)
  const [measurements, setMeasurements] = useState<ResonanceData[]>([])
  const [isVibrating, setIsVibrating] = useState(false)
  const [isResonant, setIsResonant] = useState(false)
  
  // Calculate expected resonance positions
  // For first resonance: L1 = λ/4 where v = fλ and v_sound ≈ 340 m/s
  const speedOfSound = 34000 // cm/s
  const wavelength = speedOfSound / tuningForkFreq
  
  // First resonance (quarter wavelength)
  const firstResonance = wavelength / 4
  // Second resonance (three-quarters wavelength)
  const secondResonance = 3 * wavelength / 4
  
  const airColumnLength = 100 - waterLevel
  
  // Check if current position is near resonance (within 2cm tolerance)
  useEffect(() => {
    const tolerance = 2
    const nearFirstResonance = Math.abs(airColumnLength - firstResonance) < tolerance
    const nearSecondResonance = Math.abs(airColumnLength - secondResonance) < tolerance
    setIsResonant(nearFirstResonance || nearSecondResonance)
  }, [airColumnLength, firstResonance, secondResonance])
  
  const adjustWaterLevel = (delta: number) => {
    setWaterLevel(prev => Math.max(10, Math.min(95, prev + delta)))
  }
  
  const toggleVibration = () => {
    setIsVibrating(!isVibrating)
  }
  
  const recordMeasurement = () => {
    if (isResonant) {
      const calculatedWavelength = 4 * airColumnLength / (airColumnLength < wavelength/2 ? 1 : 3)
      
      setMeasurements(prev => [...prev, {
        forkFreq: tuningForkFreq,
        airColumnLength: Number(airColumnLength.toFixed(1)),
        wavelength: Number(calculatedWavelength.toFixed(2)),
        velocity: Number((tuningForkFreq * calculatedWavelength / 100).toFixed(1))
      }].slice(-5))
    }
  }
  
  const reset = () => {
    setWaterLevel(70)
    setIsVibrating(false)
    setMeasurements([])
  }
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Fork: {tuningForkFreq} Hz</Badge>
        <Badge variant="outline">Tube: {tubeDiameter.toFixed(1)} cm diameter</Badge>
        <Badge variant={isResonant ? "default" : "outline"} className={isResonant ? "bg-green-600" : ""}>
          {isResonant ? "RESONANCE DETECTED!" : "Searching..."}
        </Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Adjust water level to find resonance positions. At resonance, you'll hear a loud sound.
        λ = 4L (first position) or λ = 4L/3 (second position). Calculate speed of sound v = fλ.
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Water Level</div>
          <div className="text-lg font-semibold text-blue-400">{waterLevel.toFixed(0)}%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Air Column</div>
          <div className="text-lg font-semibold text-green-500">{airColumnLength.toFixed(1)} cm</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">λ Expected</div>
          <div className="text-lg font-semibold text-amber-500">{wavelength.toFixed(1)} cm</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">1st Resonance</div>
          <div className="text-lg font-semibold text-purple-400">{firstResonance.toFixed(1)} cm</div>
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button onClick={toggleVibration} className="gap-2">
          <Volume2 className="w-4 h-4" />
          {isVibrating ? "Stop Fork" : "Strike Fork"}
        </Button>
        <Button variant="outline" onClick={recordMeasurement} disabled={!isResonant} className="gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Record
        </Button>
        <Button variant="outline" onClick={() => adjustWaterLevel(-2)} className="gap-2">
          <ChevronUp className="w-4 h-4" />
          Lower Water
        </Button>
        <Button variant="outline" onClick={() => adjustWaterLevel(2)} className="gap-2">
          <ChevronDown className="w-4 h-4" />
          Raise Water
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      {/* Measurements */}
      {measurements.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs font-medium mb-2">Resonance Measurements:</div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-muted-foreground">Frequency (Hz)</div>
            <div className="text-muted-foreground">Air Column (cm)</div>
            <div className="text-muted-foreground">λ (cm)</div>
            <div className="text-muted-foreground">v (m/s)</div>
            {measurements.map((m, i) => (
              <div key={i} className="contents">
                <div>{m.forkFreq}</div>
                <div>{m.airColumnLength}</div>
                <div>{m.wavelength}</div>
                <div className="text-green-500">{m.velocity}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
        <Canvas camera={{ position: [4, 3, 5], fov: 50 }} shadows>
          <Scene 
            waterLevel={waterLevel}
            tuningForkFreq={tuningForkFreq}
            isVibrating={isVibrating}
            isResonant={isResonant}
            onAdjustLevel={adjustWaterLevel}
          />
        </Canvas>
      </div>
    </div>
  )
}
