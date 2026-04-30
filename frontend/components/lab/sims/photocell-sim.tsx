"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Zap, Sun } from "lucide-react"
import * as THREE from "three"

type Props = {
  maxLightIntensity: number // Lux
  cellType: "silicon" | "photoresistor"
}

type DataPoint = {
  lightIntensity: number
  current: number
  voltage: number
  resistance: number
}

type Trial = {
  cellType: string
  dataPoints: DataPoint[]
  sensitivity: number
  darkCurrent: number
}

// Photocell with realistic light response
function Photocell({ 
  lightIntensity, 
  current, 
  cellType 
}: { 
  lightIntensity: number; 
  current: number; 
  cellType: string; 
}) {
  const cellRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (cellRef.current) {
      // Cell glow based on current generation
      const material = cellRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = Math.min(current * 20, 0.8)
    }
    
    if (lightRef.current) {
      // Light beam intensity
      const material = lightRef.current.material as THREE.MeshStandardMaterial
      material.opacity = Math.min(lightIntensity / 1000, 0.6)
      material.emissiveIntensity = Math.min(lightIntensity / 1000, 0.8)
    }
  })
  
  return (
    <group position={[0, 0.5, 0]}>
      {/* Light source */}
      <mesh ref={lightRef} position={[0, 1, -0.5]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial 
          color="#ffff00"
          transparent
          opacity={0.6}
          emissive="#ffff00"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Light rays */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 0.15
        const z = Math.sin(angle) * 0.15
        return (
          <mesh key={i} position={[x, 0.5, z]}>
            <cylinderGeometry args={[0.01, 0.01, 0.5, 8]} rotation={[Math.PI/2, 0, 0]} />
            <meshStandardMaterial 
              color="#ffff00"
              transparent
              opacity={Math.min(lightIntensity / 1000, 0.3)}
              emissive="#ffff00"
              emissiveIntensity={0.5}
            />
          </mesh>
        )
      })}
      
      {/* Photocell body */}
      <mesh ref={cellRef} castShadow>
        <boxGeometry args={[0.6, 0.4, 0.1]} />
        <meshStandardMaterial 
          color="#2c3e50"
          metalness={0.3}
          roughness={0.6}
          emissive="#3498db"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Photocell surface */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.55, 0.35, 0.02]} />
        <meshStandardMaterial 
          color="#1a1a2e"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Grid pattern on surface */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = -0.2 + i * 0.08
        return (
          <mesh key={`h-${i}`} position={[x, 0, 0.07]}>
            <boxGeometry args={[0.01, 0.3, 0.001]} />
            <meshStandardMaterial color="#c0c0c0" metalness={1} />
          </mesh>
        )
      })}
      {Array.from({ length: 4 }).map((_, i) => {
        const y = -0.12 + i * 0.08
        return (
          <mesh key={`v-${i}`} position={[0, y, 0.07]}>
            <boxGeometry args={[0.4, 0.01, 0.001]} />
            <meshStandardMaterial color="#c0c0c0" metalness={1} />
          </mesh>
        )
      })}
      
      {/* Connection terminals */}
      <mesh position={[-0.3, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      <mesh position={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      
      <Text position={[0, -0.3, 0]} fontSize={0.05} color="#1e293b" anchorX="center">
        {lightIntensity.toFixed(0)} lux
      </Text>
      
      <Text position={[0, -0.4, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        PHOTOCELL
      </Text>
    </group>
  )
}

// Variable light source
function LightSource({ 
  intensity, 
  onChange 
}: { 
  intensity: number; 
  onChange: (i: number) => void; 
}) {
  const knobRef = useRef<THREE.Mesh>(null)
  const displayRef = useRef<THREE.Mesh>(null)
  const bulbRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (knobRef.current) {
      // Rotate knob based on intensity
      const rotation = (intensity / 1000) * Math.PI * 1.5
      knobRef.current.rotation.z = rotation
    }
    
    if (displayRef.current) {
      const material = displayRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.002) * 0.1
    }
    
    if (bulbRef.current) {
      // Bulb glow
      const material = bulbRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = Math.min(intensity / 500, 1)
    }
  })
  
  return (
    <group position={[-2.5, 0.5, 0]}>
      {/* Light source body */}
      <mesh castShadow>
        <boxGeometry args={[1, 0.8, 0.4]} />
        <meshStandardMaterial color="#34495e" metalness={0.3} />
      </mesh>
      
      {/* Display */}
      <mesh ref={displayRef} position={[0, 0.1, 0.21]}>
        <boxGeometry args={[0.8, 0.2, 0.02]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          emissive="#ffff00"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      <Text position={[0, 0.1, 0.22]} fontSize={0.08} color="#ffff00" anchorX="center">
        {intensity.toFixed(0)}
      </Text>
      
      <Text position={[0, -0.05, 0.22]} fontSize={0.05} color="#ffff00" anchorX="center">
        lux
      </Text>
      
      {/* Light bulb */}
      <mesh ref={bulbRef} position={[0, 0.3, 0.16]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Intensity control knob */}
      <mesh 
        ref={knobRef}
        position={[-0.3, -0.2, 0.21]}
        onClick={() => onChange(Math.min(intensity + 50, 1000))}
      >
        <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
        <meshStandardMaterial color="#f39c12" metalness={0.8} />
      </mesh>
      
      {/* Knob indicator */}
      <mesh position={[-0.3, -0.15, 0.23]}>
        <boxGeometry args={[0.04, 0.01, 0.01]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      <Text position={[0, -0.5, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        LIGHT SOURCE
      </Text>
    </group>
  )
}

// Digital multimeter
function Multimeter({ 
  voltage, 
  current, 
  resistance, 
  mode 
}: { 
  voltage: number; 
  current: number; 
  resistance: number; 
  mode: "V" | "I" | "R";
}) {
  const displayRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (displayRef.current) {
      const material = displayRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.002) * 0.1
    }
  })
  
  const getDisplayValue = () => {
    switch (mode) {
      case "V": return `${voltage.toFixed(3)}V`
      case "I": return `${(current * 1000).toFixed(2)}mA`
      case "R": return `${resistance.toFixed(1)}Ω`
      default: return "0.000"
    }
  }
  
  return (
    <group position={[2.5, 0.5, 0]}>
      {/* Multimeter body */}
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.7, 0.3]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.3} />
      </mesh>
      
      {/* Display screen */}
      <mesh ref={displayRef} position={[0, 0.15, 0.16]}>
        <boxGeometry args={[0.7, 0.25, 0.02]} />
        <meshStandardMaterial 
          color="#000000"
          emissive="#00ff00"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      <Text position={[0, 0.15, 0.17]} fontSize={0.08} color="#00ff00" anchorX="center">
        {getDisplayValue()}
      </Text>
      
      {/* Mode indicator */}
      <Text position={[0, -0.05, 0.17]} fontSize={0.06} color="#ffff00" anchorX="center">
        {mode} MODE
      </Text>
      
      {/* Rotary switch */}
      <mesh position={[0, -0.25, 0.16]}>
        <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      
      {/* Terminals */}
      <mesh position={[-0.2, -0.35, 0.16]}>
        <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
        <meshStandardMaterial color="#ff0000" metalness={1} />
      </mesh>
      <mesh position={[0.2, -0.35, 0.16]}>
        <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
        <meshStandardMaterial color="#000000" metalness={1} />
      </mesh>
      
      <Text position={[0, -0.5, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        MULTIMETER
      </Text>
    </group>
  )
}

// Load resistor
function LoadResistor({ resistance }: { resistance: number }) {
  const resistorRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (resistorRef.current) {
      const material = resistorRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.1
    }
  })
  
  return (
    <group position={[0, -0.8, 0]}>
      {/* Resistor body */}
      <mesh ref={resistorRef} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial 
          color="#D2691E"
          roughness={0.8}
          emissive="#ff6600"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Color bands */}
      <mesh position={[-0.2, 0, 0.081]}>
        <cylinderGeometry args={[0.081, 0.081, 0.02, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      <mesh position={[-0.1, 0, 0.081]}>
        <cylinderGeometry args={[0.081, 0.081, 0.02, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0, 0, 0.081]}>
        <cylinderGeometry args={[0.081, 0.081, 0.02, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      <Text position={[0, -0.15, 0]} fontSize={0.04} color="#1e293b" anchorX="center">
        {resistance} Ω
      </Text>
      
      <Text position={[0, -0.25, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        LOAD R
      </Text>
    </group>
  )
}

// Circuit connections with current flow
function PhotocellCircuit({ 
  current, 
  lightIntensity 
}: { 
  current: number; 
  lightIntensity: number; 
}) {
  const wireRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (wireRef.current && current > 0) {
      const intensity = Math.min(current * 10, 0.5)
      wireRef.current.children.forEach((wire, index) => {
        if (wire instanceof THREE.Mesh) {
          const material = wire.material as THREE.MeshStandardMaterial
          material.emissiveIntensity = intensity + Math.sin(Date.now() * 0.005 + index) * 0.1
        }
      })
    }
  })
  
  return (
    <group ref={wireRef}>
      {/* Top wire */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[5, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Bottom wire */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[5, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Load resistor connection */}
      <mesh position={[0, -0.8, 0]}>
        <boxGeometry args={[5, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
    </group>
  )
}

// Current vs light intensity graph
function PhotocellGraph({ 
  dataPoints, 
  cellType 
}: { 
  dataPoints: DataPoint[]; 
  cellType: string; 
}) {
  return (
    <group position={[0, 2.5, 0]}>
      <mesh castShadow>
        <boxGeometry args={[2.5, 1.5, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2.3, 1.3]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Graph axes */}
      <mesh position={[0, -0.4, 0.06]}>
        <boxGeometry args={[2.1, 0.01, 0.001]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.9, 0, 0.06]}>
        <boxGeometry args={[0.01, 1.1, 0.001]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Axis labels */}
      <Text position={[0, -0.55, 0.07]} fontSize={0.05} color="#ffffff" anchorX="center">
        Light Intensity (lux)
      </Text>
      <Text position={[-1.2, 0, 0.07]} fontSize={0.05} color="#ffffff" anchorX="center" rotation={[0, 0, Math.PI/2]}>
        Current (mA)
      </Text>
      
      {/* Data points and curve */}
      {dataPoints.length > 1 && (
        <>
          {dataPoints.map((point, i) => {
            const x = (point.lightIntensity / 1000) * 1.8 - 0.9 // Scale to 1000 lux max
            const y = Math.min((point.current * 1000) / 10 * 0.4 - 0.4, 0.3) // Scale to 10mA max
            return (
              <mesh key={i} position={[x, y, 0.07]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshStandardMaterial color="#ffff00" />
              </mesh>
            )
          })}
        </>
      )}
      
      <Text position={[0, -0.65, 0.07]} fontSize={0.04} color="#ffff00" anchorX="center">
        {cellType.toUpperCase()}
      </Text>
      
      <Text position={[0, -0.8, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        PHOTOCURRENT vs LIGHT
      </Text>
    </group>
  )
}

function Scene({ 
  lightIntensity,
  current,
  voltage,
  resistance,
  cellType,
  dataPoints,
  mode
}: {
  lightIntensity: number;
  current: number;
  voltage: number;
  resistance: number;
  cellType: string;
  dataPoints: DataPoint[];
  mode: "V" | "I" | "R";
}) {
  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 3]} intensity={1} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[0, 4, 2]} intensity={0.5} color="#fbbf24" />
      
      {/* Lab bench */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.9} />
      </mesh>
      
      <Photocell 
        lightIntensity={lightIntensity}
        current={current}
        cellType={cellType}
      />
      <LightSource 
        intensity={lightIntensity}
        onChange={() => {}}
      />
      <Multimeter 
        voltage={voltage}
        current={current}
        resistance={resistance}
        mode={mode}
      />
      <LoadResistor resistance={1000} />
      <PhotocellCircuit 
        current={current}
        lightIntensity={lightIntensity}
      />
      <PhotocellGraph 
        dataPoints={dataPoints}
        cellType={cellType}
      />
      
      {/* Instructions */}
      <Text position={[0, 3.5, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        Photocell: I = I_s + k × Φ
      </Text>
      
      <OrbitControls 
        enablePan={false} 
        minDistance={5} 
        maxDistance={10} 
        target={[0, 0.5, 0]}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  )
}

export function PhotocellSim({ 
  maxLightIntensity: initialMaxLightIntensity = 1000, 
  cellType: initialCellType = "silicon"
}: Props) {
  const [maxLightIntensity] = useState(initialMaxLightIntensity)
  const [cellType] = useState(initialCellType)
  const [lightIntensity, setLightIntensity] = useState(0)
  
  const [trials, setTrials] = useState<Trial[]>([])
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [mode, setMode] = useState<"V" | "I" | "R">("I")
  
  // Photocell parameters
  const loadResistance = 1000 // Ω
  const darkCurrent = cellType === "silicon" ? 0.000001 : 0.00001 // A
  const sensitivity = cellType === "silicon" ? 0.000005 : 0.000002 // A/lux
  
  // Calculate photocell response
  const calculatePhotocurrent = (intensity: number): number => {
    return darkCurrent + sensitivity * intensity
  }
  
  const current = calculatePhotocurrent(lightIntensity)
  const voltage = current * loadResistance
  const resistance = current > 0 ? voltage / current : Infinity
  
  const startMeasurement = () => {
    setIsMeasuring(true)
    setDataPoints([])
    setLightIntensity(0)
  }
  
  const addDataPoint = () => {
    if (lightIntensity >= 0) {
      const newPoint: DataPoint = {
        lightIntensity,
        current,
        voltage,
        resistance: isFinite(resistance) ? resistance : 0
      }
      setDataPoints(prev => [...prev, newPoint])
    }
  }
  
  const completeMeasurement = () => {
    if (dataPoints.length > 0) {
      // Calculate sensitivity from data
      const brightCurrent = dataPoints[dataPoints.length - 1].current
      const darkCurrentMeasured = dataPoints[0].current
      const measuredSensitivity = (brightCurrent - darkCurrentMeasured) / maxLightIntensity
      
      setTrials(prev => [...prev, {
        cellType,
        dataPoints: [...dataPoints],
        sensitivity: measuredSensitivity,
        darkCurrent: darkCurrentMeasured
      }].slice(-3))
    }
    setIsMeasuring(false)
  }
  
  const autoSweep = () => {
    setIsMeasuring(true)
    const points: DataPoint[] = []
    
    // Automatically sweep through light intensities
    for (let intensity = 0; intensity <= maxLightIntensity; intensity += 50) {
      const curr = calculatePhotocurrent(intensity)
      const volt = curr * loadResistance
      const res = curr > 0 ? volt / curr : Infinity
      
      points.push({
        lightIntensity: intensity,
        current: curr,
        voltage: volt,
        resistance: isFinite(res) ? res : 0
      })
    }
    
    setDataPoints(points)
    
    const brightCurrent = points[points.length - 1].current
    const darkCurrentMeasured = points[0].current
    const measuredSensitivity = (brightCurrent - darkCurrentMeasured) / maxLightIntensity
    
    setTrials(prev => [...prev, {
      cellType,
      dataPoints: points,
      sensitivity: measuredSensitivity,
      darkCurrent: darkCurrentMeasured
    }].slice(-3))
  }
  
  const reset = () => {
    setLightIntensity(0)
    setDataPoints([])
    setIsMeasuring(false)
  }
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Cell Type: {cellType}</Badge>
        <Badge variant="outline">Light: {lightIntensity.toFixed(0)} lux</Badge>
        <Badge variant="outline">Current: {(current * 1000).toFixed(2)} mA</Badge>
        <Badge variant="outline">Voltage: {voltage.toFixed(3)} V</Badge>
        <Badge variant="outline">Load R: {loadResistance} Ω</Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Study photocell current vs light intensity characteristics.
        Photocurrent increases linearly with illumination: I = I_dark + k × Φ
        Measure sensitivity and dark current for different photocell types.
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Light Intensity</div>
          <div className="text-lg font-semibold text-yellow-500">{lightIntensity.toFixed(0)} lux</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Photocurrent</div>
          <div className="text-lg font-semibold text-green-500">{(current * 1000).toFixed(2)} mA</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Output Voltage</div>
          <div className="text-lg font-semibold text-blue-500">{voltage.toFixed(3)} V</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Data Points</div>
          <div className="text-lg font-semibold text-purple-500">{dataPoints.length}</div>
        </div>
      </div>
      
      {/* Parameter Controls */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Sun className="w-4 h-4" />
          Light Control
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Light Intensity</span>
              <span className="font-medium">{lightIntensity.toFixed(0)} lux</span>
            </div>
            <input
              type="range"
              min="0"
              max={maxLightIntensity}
              step="10"
              value={lightIntensity}
              onChange={(e) => setLightIntensity(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={startMeasurement}
          disabled={isMeasuring}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          Start Measurement
        </Button>
        <Button 
          onClick={addDataPoint}
          disabled={!isMeasuring}
          variant="outline"
          className="gap-2"
        >
          <Sun className="w-4 h-4" />
          Add Point
        </Button>
        <Button 
          onClick={autoSweep}
          disabled={isMeasuring}
          variant="outline"
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          Auto Sweep
        </Button>
        <Button 
          onClick={completeMeasurement}
          disabled={!isMeasuring || dataPoints.length === 0}
          variant="outline"
          className="gap-2"
        >
          Complete
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      {/* Current data points */}
      {dataPoints.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs font-medium mb-2">Current Measurement:</div>
          <div className="grid grid-cols-5 gap-2 text-xs">
            <div className="text-muted-foreground">Light (lux)</div>
            <div className="text-muted-foreground">I (mA)</div>
            <div className="text-muted-foreground">V (V)</div>
            <div className="text-muted-foreground">R (kΩ)</div>
            <div className="text-muted-foreground">Power (μW)</div>
            {dataPoints.slice(-5).map((point, i) => (
              <div key={i} className="contents">
                <div>{point.lightIntensity}</div>
                <div>{(point.current * 1000).toFixed(2)}</div>
                <div>{point.voltage.toFixed(3)}</div>
                <div>{(point.resistance / 1000).toFixed(2)}</div>
                <div>{(point.voltage * point.current * 1000000).toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Trials */}
      {trials.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs font-medium mb-2">Completed Trials:</div>
          <div className="space-y-2">
            {trials.map((trial, i) => (
              <div key={i} className="text-xs">
                <div className="font-medium">Trial {i + 1} ({trial.cellType}):</div>
                <div>Points: {trial.dataPoints.length} | Sensitivity: {(trial.sensitivity * 1000000).toFixed(2)} μA/lux | Dark I: {(trial.darkCurrent * 1000000).toFixed(2)} μA</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [4, 4, 5], fov: 50 }} shadows>
          <Scene 
            lightIntensity={lightIntensity}
            current={current}
            voltage={voltage}
            resistance={resistance}
            cellType={cellType}
            dataPoints={dataPoints}
            mode={mode}
          />
        </Canvas>
      </div>
    </div>
  )
}
