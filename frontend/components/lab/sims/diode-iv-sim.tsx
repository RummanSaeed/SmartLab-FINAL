"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Zap, TrendingUp } from "lucide-react"
import * as THREE from "three"

type Props = {
  maxVoltage: number // Volts
  diodeType: "silicon" | "germanium"
}

type DataPoint = {
  voltage: number
  current: number
  resistance: number
}

type Trial = {
  diodeType: string
  dataPoints: DataPoint[]
  forwardVoltage: number
  reverseVoltage: number
}

// Diode with realistic appearance and current flow
function Diode({ 
  current, 
  voltage, 
  isForwardBias 
}: { 
  current: number; 
  voltage: number; 
  isForwardBias: boolean; 
}) {
  const diodeRef = useRef<THREE.Mesh>(null)
  const bandRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (diodeRef.current && current > 0) {
      // Diode glow when conducting
      const material = diodeRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = Math.min(current * 10, 0.8)
    }
    
    if (bandRef.current) {
      // Cathode band glow
      const material = bandRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = isForwardBias && current > 0 ? 0.3 : 0.1
    }
  })
  
  return (
    <group position={[0, 0.5, 0]}>
      {/* Diode body */}
      <mesh ref={diodeRef} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial 
          color="#2c3e50"
          metalness={0.3}
          roughness={0.6}
          emissive="#3498db"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Cathode band */}
      <mesh ref={bandRef} position={[0.15, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial 
          color="#e74c3c"
          emissive="#c0392b"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Anode connection */}
      <mesh position={[-0.2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      
      {/* Cathode connection */}
      <mesh position={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      
      {/* Current flow indicator */}
      {current > 0 && isForwardBias && (
        <group>
          {Array.from({ length: 5 }).map((_, i) => {
            const time = Date.now() * 0.001
            const x = -0.15 + (i / 5) * 0.3
            const offset = Math.sin(time * 5 + i) * 0.02
            return (
              <mesh key={i} position={[x, offset, 0]}>
                <sphereGeometry args={[0.01, 8, 8]} />
                <meshStandardMaterial 
                  color="#00ff00"
                  emissive="#00ff00"
                  emissiveIntensity={0.8}
                />
              </mesh>
            )
          })}
        </group>
      )}
      
      <Text position={[0, -0.3, 0]} fontSize={0.05} color="#1e293b" anchorX="center">
        {voltage.toFixed(2)}V
      </Text>
      
      <Text position={[0, -0.4, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        DIODE
      </Text>
    </group>
  )
}

// Variable power supply
function VariablePowerSupply({ 
  voltage, 
  current, 
  onChange 
}: { 
  voltage: number; 
  current: number; 
  onChange: (v: number) => void; 
}) {
  const knobRef = useRef<THREE.Mesh>(null)
  const displayRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (knobRef.current) {
      // Rotate knob based on voltage
      const rotation = (voltage / 5) * Math.PI * 1.5
      knobRef.current.rotation.z = rotation
    }
    
    if (displayRef.current) {
      const material = displayRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.002) * 0.1
    }
  })
  
  return (
    <group position={[-2.5, 0.5, 0]}>
      {/* Power supply body */}
      <mesh castShadow>
        <boxGeometry args={[1, 0.8, 0.4]} />
        <meshStandardMaterial color="#34495e" metalness={0.3} />
      </mesh>
      
      {/* Display */}
      <mesh ref={displayRef} position={[0, 0.1, 0.21]}>
        <boxGeometry args={[0.8, 0.2, 0.02]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          emissive="#ff6b35"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      <Text position={[0, 0.1, 0.22]} fontSize={0.08} color="#ff6b35" anchorX="center">
        {voltage.toFixed(2)}V
      </Text>
      
      <Text position={[0, -0.05, 0.22]} fontSize={0.05} color="#ffa500" anchorX="center">
        {(current * 1000).toFixed(1)}mA
      </Text>
      
      {/* Voltage control knob */}
      <mesh 
        ref={knobRef}
        position={[-0.3, -0.2, 0.21]}
        onClick={() => onChange(Math.min(voltage + 0.1, 5))}
      >
        <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.8} />
      </mesh>
      
      {/* Knob indicator */}
      <mesh position={[-0.3, -0.15, 0.23]}>
        <boxGeometry args={[0.04, 0.01, 0.01]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Terminals */}
      <mesh position={[-0.2, -0.35, 0.21]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
        <meshStandardMaterial color="#ff0000" metalness={1} />
      </mesh>
      <mesh position={[0.2, -0.35, 0.21]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
        <meshStandardMaterial color="#000000" metalness={1} />
      </mesh>
      
      <Text position={[0, -0.5, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        POWER SUPPLY
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

// Series resistor for current limiting
function SeriesResistor({ 
  resistance, 
  current 
}: { 
  resistance: number; 
  current: number; 
}) {
  const resistorRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (resistorRef.current && current > 0) {
      // Heat glow based on power dissipation
      const power = current * current * resistance
      const material = resistorRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = Math.min(power / 2, 0.6)
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
          emissiveIntensity={0}
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
        LIMITING R
      </Text>
    </group>
  )
}

// Circuit connections with current flow
function DiodeCircuit({ 
  current, 
  isForwardBias 
}: { 
  current: number; 
  isForwardBias: boolean; 
}) {
  const wireRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (wireRef.current && current > 0 && isForwardBias) {
      wireRef.current.children.forEach((wire, index) => {
        if (wire instanceof THREE.Mesh) {
          const material = wire.material as THREE.MeshStandardMaterial
          material.emissiveIntensity = 0.2 + Math.sin(Date.now() * 0.005 + index) * 0.1
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
      
      {/* Series resistor connection */}
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

// I-V graph display
function IVGraph({ 
  dataPoints, 
  diodeType 
}: { 
  dataPoints: DataPoint[]; 
  diodeType: string; 
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
        Voltage (V)
      </Text>
      <Text position={[-1.2, 0, 0.07]} fontSize={0.05} color="#ffffff" anchorX="center" rotation={[0, 0, Math.PI/2]}>
        Current (mA)
      </Text>
      
      {/* Data points and curve */}
      {dataPoints.length > 1 && (
        <>
          {dataPoints.map((point, i) => {
            const x = (point.voltage / 2) * 0.9 - 0.9 // Scale to 2V max
            const y = Math.min((point.current * 1000) / 50 * 0.4 - 0.4, 0.3) // Scale to 50mA max
            return (
              <mesh key={i} position={[x, y, 0.07]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshStandardMaterial color="#00ff00" />
              </mesh>
            )
          })}
        </>
      )}
      
      <Text position={[0, -0.65, 0.07]} fontSize={0.04} color="#00ff00" anchorX="center">
        {diodeType.toUpperCase()} DIODE
      </Text>
      
      <Text position={[0, -0.8, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        I-V CHARACTERISTICS
      </Text>
    </group>
  )
}

function Scene({ 
  voltage,
  current,
  resistance,
  diodeType,
  dataPoints,
  isForwardBias,
  mode
}: {
  voltage: number;
  current: number;
  resistance: number;
  diodeType: string;
  dataPoints: DataPoint[];
  isForwardBias: boolean;
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
      
      <Diode 
        current={current}
        voltage={voltage}
        isForwardBias={isForwardBias}
      />
      <VariablePowerSupply 
        voltage={voltage}
        current={current}
        onChange={() => {}}
      />
      <Multimeter 
        voltage={voltage}
        current={current}
        resistance={resistance}
        mode={mode}
      />
      <SeriesResistor 
        resistance={100}
        current={current}
      />
      <DiodeCircuit 
        current={current}
        isForwardBias={isForwardBias}
      />
      <IVGraph 
        dataPoints={dataPoints}
        diodeType={diodeType}
      />
      
      {/* Instructions */}
      <Text position={[0, 3.5, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        Diode: I = I_s(e^(V/nV_T) - 1)
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

export function DiodeIVSim({ 
  maxVoltage: initialMaxVoltage = 5, 
  diodeType: initialDiodeType = "silicon"
}: Props) {
  const [maxVoltage] = useState(initialMaxVoltage)
  const [diodeType] = useState(initialDiodeType)
  const [voltage, setVoltage] = useState(0)
  
  const [trials, setTrials] = useState<Trial[]>([])
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [mode, setMode] = useState<"V" | "I" | "R">("V")
  
  // Diode parameters
  const saturationCurrent = diodeType === "silicon" ? 1e-12 : 1e-6 // A
  const thermalVoltage = 0.026 // V at room temperature
  const idealityFactor = diodeType === "silicon" ? 2 : 1
  const seriesResistance = 100 // Ω (current limiting)
  
  // Calculate diode current using Shockley equation
  const calculateDiodeCurrent = (v: number): number => {
    if (v <= 0) {
      return -saturationCurrent // Reverse saturation current
    }
    
    // Simplified forward bias calculation
    const diodeVoltage = Math.min(v, 0.7) // Clamp to typical forward voltage
    const diodeCurrent = saturationCurrent * (Math.exp(diodeVoltage / (idealityFactor * thermalVoltage)) - 1)
    
    // Account for series resistance
    const totalCurrent = v / (seriesResistance + 1 / (diodeCurrent / v + 1e-10))
    
    return Math.min(totalCurrent, 0.05) // Limit to 50mA max
  }
  
  const current = calculateDiodeCurrent(voltage)
  const resistance = voltage > 0 && current > 0 ? voltage / current : Infinity
  const isForwardBias = voltage > 0
  
  const startMeasurement = () => {
    setIsMeasuring(true)
    setDataPoints([])
    setVoltage(0)
  }
  
  const addDataPoint = () => {
    if (voltage !== 0) {
      const newPoint: DataPoint = {
        voltage,
        current,
        resistance: isFinite(resistance) ? resistance : 0
      }
      setDataPoints(prev => [...prev, newPoint])
    }
  }
  
  const completeMeasurement = () => {
    if (dataPoints.length > 0) {
      // Find forward voltage (where current starts to increase significantly)
      const forwardVoltage = dataPoints.find(point => point.current > 0.001)?.voltage || 0
      
      setTrials(prev => [...prev, {
        diodeType,
        dataPoints: [...dataPoints],
        forwardVoltage,
        reverseVoltage: 0
      }].slice(-3))
    }
    setIsMeasuring(false)
  }
  
  const autoSweep = () => {
    setIsMeasuring(true)
    const points: DataPoint[] = []
    
    // Forward bias sweep
    for (let v = 0; v <= maxVoltage; v += 0.1) {
      const curr = calculateDiodeCurrent(v)
      const res = v > 0 && curr > 0 ? v / curr : Infinity
      
      points.push({
        voltage: v,
        current: curr,
        resistance: isFinite(res) ? res : 0
      })
    }
    
    // Reverse bias
    for (let v = -0.5; v >= -5; v -= 0.5) {
      const curr = calculateDiodeCurrent(v)
      
      points.push({
        voltage: v,
        current: curr,
        resistance: 0
      })
    }
    
    setDataPoints(points)
    
    const forwardVoltage = points.find(point => point.current > 0.001)?.voltage || 0
    
    setTrials(prev => [...prev, {
      diodeType,
      dataPoints: points,
      forwardVoltage,
      reverseVoltage: 0
    }].slice(-3))
  }
  
  const reset = () => {
    setVoltage(0)
    setDataPoints([])
    setIsMeasuring(false)
  }
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Diode Type: {diodeType}</Badge>
        <Badge variant="outline">Voltage: {voltage.toFixed(2)} V</Badge>
        <Badge variant="outline">Current: {(current * 1000).toFixed(2)} mA</Badge>
        <Badge variant="outline">Resistance: {isFinite(resistance) ? resistance.toFixed(1) : "∞"} Ω</Badge>
        <Badge variant={isForwardBias ? "default" : "secondary"}>
          {isForwardBias ? "Forward Bias" : "Reverse Bias"}
        </Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Study diode I-V characteristics using Shockley equation.
        Observe exponential increase in forward bias and saturation in reverse bias.
        Forward voltage ~0.7V (Si) or ~0.3V (Ge).
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Voltage</div>
          <div className="text-lg font-semibold text-blue-500">{voltage.toFixed(2)} V</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Current</div>
          <div className="text-lg font-semibold text-green-500">{(current * 1000).toFixed(2)} mA</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Dynamic R</div>
          <div className="text-lg font-semibold text-amber-500">{isFinite(resistance) ? resistance.toFixed(1) : "∞"} Ω</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Data Points</div>
          <div className="text-lg font-semibold text-purple-500">{dataPoints.length}</div>
        </div>
      </div>
      
      {/* Parameter Controls */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <TrendingUp className="w-4 h-4" />
          Voltage Control
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Applied Voltage</span>
              <span className="font-medium">{voltage.toFixed(2)} V</span>
            </div>
            <input
              type="range"
              min="-5"
              max={maxVoltage}
              step="0.1"
              value={voltage}
              onChange={(e) => setVoltage(Number(e.target.value))}
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
          disabled={!isMeasuring || voltage === 0}
          variant="outline"
          className="gap-2"
        >
          <TrendingUp className="w-4 h-4" />
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
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-muted-foreground">V (V)</div>
            <div className="text-muted-foreground">I (mA)</div>
            <div className="text-muted-foreground">R (Ω)</div>
            <div className="text-muted-foreground">Bias</div>
            {dataPoints.slice(-5).map((point, i) => (
              <div key={i} className="contents">
                <div>{point.voltage.toFixed(2)}</div>
                <div>{(point.current * 1000).toFixed(2)}</div>
                <div>{isFinite(point.resistance) ? point.resistance.toFixed(1) : "∞"}</div>
                <div>{point.voltage > 0 ? "F" : "R"}</div>
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
                <div className="font-medium">Trial {i + 1} ({trial.diodeType}):</div>
                <div>Points: {trial.dataPoints.length} | Forward V: {trial.forwardVoltage.toFixed(2)}V</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [4, 4, 5], fov: 50 }} shadows>
          <Scene 
            voltage={voltage}
            current={current}
            resistance={resistance}
            diodeType={diodeType}
            dataPoints={dataPoints}
            isForwardBias={isForwardBias}
            mode={mode}
          />
        </Canvas>
      </div>
    </div>
  )
}
