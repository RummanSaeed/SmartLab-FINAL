"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Zap, Lightbulb } from "lucide-react"
import * as THREE from "three"

type Props = {
  maxVoltage: number // Volts
  filamentType: "incandescent" | "halogen"
}

type DataPoint = {
  voltage: number
  current: number
  resistance: number
  temperature: number
}

type Trial = {
  filamentType: string
  dataPoints: DataPoint[]
  roomTempResistance: number
  hotResistance: number
}

// Tungsten filament with realistic glow and temperature effects
function TungstenFilament({ 
  current, 
  temperature, 
  isOn 
}: { 
  current: number; 
  temperature: number; 
  isOn: boolean; 
}) {
  const filamentRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (filamentRef.current) {
      // Animate filament vibration when hot
      if (temperature > 1000) {
        filamentRef.current.children.forEach((strand, index) => {
          if (strand instanceof THREE.Mesh) {
            strand.position.y = Math.sin(Date.now() * 0.01 + index) * 0.001
          }
        })
      }
      
      // Update filament color based on temperature
      const tempNormalized = Math.min(temperature / 3000, 1)
      filamentRef.current.children.forEach((strand) => {
        if (strand instanceof THREE.Mesh) {
          const material = strand.material as THREE.MeshStandardMaterial
          // Color changes from orange to white-hot
          const hue = 0.08 - tempNormalized * 0.08 // Orange to yellow
          const saturation = 1 - tempNormalized * 0.5 // Less saturated when hotter
          const lightness = 0.3 + tempNormalized * 0.4 // Brighter when hotter
          material.color.setHSL(hue, saturation, lightness)
          material.emissiveIntensity = tempNormalized * 0.8
        }
      })
    }
    
    if (glowRef.current && isOn) {
      // Glow effect
      const material = glowRef.current.material as THREE.MeshStandardMaterial
      const intensity = Math.min(temperature / 2000, 1)
      material.opacity = intensity * 0.6
      material.emissiveIntensity = intensity
    }
  })
  
  return (
    <group position={[0, 0.5, 0]}>
      {/* Glass bulb */}
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshPhysicalMaterial 
          color="#f0f8ff"
          metalness={0}
          roughness={0.1}
          transmission={0.9}
          thickness={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Filament strands */}
      <group ref={filamentRef}>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const radius = 0.15
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          return (
            <group key={i}>
              {/* Vertical supports */}
              <mesh position={[x, -0.3, z]}>
                <cylinderGeometry args={[0.005, 0.005, 0.6, 8]} />
                <meshStandardMaterial 
                  color="#ffa500"
                  metalness={0.8}
                  roughness={0.2}
                  emissive="#ff8c00"
                  emissiveIntensity={0}
                />
              </mesh>
              
              {/* Horizontal filament loops */}
              {Array.from({ length: 6 }).map((_, j) => {
                const y = -0.25 + j * 0.1
                return (
                  <mesh key={j} position={[x, y, z]}>
                    <torusGeometry args={[0.05, 0.002, 6, 12]} />
                    <meshStandardMaterial 
                      color="#ffa500"
                      metalness={0.9}
                      roughness={0.1}
                      emissive="#ff8c00"
                      emissiveIntensity={0}
                    />
                  </mesh>
                )
              })}
            </group>
          )
        })}
      </group>
      
      {/* Glow effect */}
      <mesh ref={glowRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial 
          color="#ffaa00"
          transparent
          opacity={0}
          emissive="#ff8800"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Filament base */}
      <mesh position={[0, -0.8, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.8} />
      </mesh>
      
      {/* Electrical contacts */}
      <mesh position={[-0.1, -0.85, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      <mesh position={[0.1, -0.85, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.05, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      
      <Text position={[0, -1.1, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        TUNGSTEN FILAMENT
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
      const rotation = (voltage / 12) * Math.PI * 1.5
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
        onClick={() => onChange(Math.min(voltage + 0.5, 12))}
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

// Circuit connections with current flow
function FilamentCircuit({ current }: { current: number }) {
  const wireRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (wireRef.current && current > 0) {
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
    </group>
  )
}

// V-I graph display
function FilamentGraph({ 
  dataPoints, 
  roomTempResistance 
}: { 
  dataPoints: DataPoint[]; 
  roomTempResistance: number; 
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
        Current (A)
      </Text>
      <Text position={[-1.2, 0, 0.07]} fontSize={0.05} color="#ffffff" anchorX="center" rotation={[0, 0, Math.PI/2]}>
        Voltage (V)
      </Text>
      
      {/* Data points and curve */}
      {dataPoints.length > 1 && (
        <>
          {dataPoints.map((point, i) => {
            const x = (point.current / 0.1) * 0.9 - 0.9 // Scale to 100mA max
            const y = (point.voltage / 12) * 0.4 - 0.4 // Scale to 12V max
            return (
              <mesh key={i} position={[x, y, 0.07]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshStandardMaterial color="#ffa500" />
              </mesh>
            )
          })}
        </>
      )}
      
      <Text position={[0, -0.65, 0.07]} fontSize={0.04} color="#ffa500" anchorX="center">
        R₀ = {roomTempResistance.toFixed(1)}Ω
      </Text>
      
      <Text position={[0, -0.8, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        FILAMENT V-I CURVE
      </Text>
    </group>
  )
}

function Scene({ 
  voltage,
  current,
  resistance,
  temperature,
  filamentType,
  dataPoints,
  roomTempResistance,
  mode
}: {
  voltage: number;
  current: number;
  resistance: number;
  temperature: number;
  filamentType: "incandescent" | "halogen";
  dataPoints: DataPoint[];
  roomTempResistance: number;
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
      
      <TungstenFilament 
        current={current}
        temperature={temperature}
        isOn={voltage > 0}
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
      <FilamentCircuit current={current} />
      <FilamentGraph 
        dataPoints={dataPoints}
        roomTempResistance={roomTempResistance}
      />
      
      {/* Instructions */}
      <Text position={[0, 3.5, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        Tungsten Filament: Non-linear V-I due to temperature coefficient
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

export function TungstenFilamentSim({ 
  maxVoltage: initialMaxVoltage = 12, 
  filamentType: initialFilamentType = "incandescent"
}: Props) {
  const [maxVoltage] = useState(initialMaxVoltage)
  const [filamentType] = useState(initialFilamentType)
  const [voltage, setVoltage] = useState(0)
  
  const [trials, setTrials] = useState<Trial[]>([])
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [mode, setMode] = useState<"V" | "I" | "R">("V")
  
  // Room temperature resistance of tungsten filament
  const roomTempResistance = filamentType === "incandescent" ? 10 : 8 // Ω
  
  // Calculate filament properties based on voltage
  const calculateFilamentProperties = (v: number) => {
    if (v === 0) {
      return {
        current: 0,
        resistance: roomTempResistance,
        temperature: 293 // Room temperature in Kelvin
      }
    }
    
    // Simplified model: resistance increases with temperature
    // R(T) = R₀[1 + α(T - T₀)] where α is temperature coefficient
    const alpha = 0.0045 // Temperature coefficient of tungsten
    const powerFactor = 2.5 // Empirical factor for heating
    
    // Initial current estimate
    let current = v / roomTempResistance
    let temperature = 293
    let resistance = roomTempResistance
    
    // Iterative solution for steady state
    for (let i = 0; i < 10; i++) {
      const power = v * current
      temperature = 293 + power * powerFactor
      resistance = roomTempResistance * (1 + alpha * (temperature - 293))
      current = v / resistance
    }
    
    return {
      current,
      resistance,
      temperature
    }
  }
  
  const { current, resistance, temperature } = calculateFilamentProperties(voltage)
  
  const startMeasurement = () => {
    setIsMeasuring(true)
    setDataPoints([])
    setVoltage(0)
  }
  
  const addDataPoint = () => {
    if (voltage > 0) {
      const newPoint: DataPoint = {
        voltage,
        current,
        resistance,
        temperature
      }
      setDataPoints(prev => [...prev, newPoint])
    }
  }
  
  const completeMeasurement = () => {
    if (dataPoints.length > 0) {
      setTrials(prev => [...prev, {
        filamentType,
        dataPoints: [...dataPoints],
        roomTempResistance,
        hotResistance: dataPoints[dataPoints.length - 1].resistance
      }].slice(-3))
    }
    setIsMeasuring(false)
  }
  
  const autoSweep = () => {
    setIsMeasuring(true)
    const points: DataPoint[] = []
    
    // Automatically sweep through voltage values
    for (let v = 0.5; v <= maxVoltage; v += 0.5) {
      const props = calculateFilamentProperties(v)
      points.push({
        voltage: v,
        current: props.current,
        resistance: props.resistance,
        temperature: props.temperature
      })
    }
    
    setDataPoints(points)
    setTrials(prev => [...prev, {
      filamentType,
      dataPoints: points,
      roomTempResistance,
      hotResistance: points[points.length - 1].resistance
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
        <Badge variant="outline">Voltage: {voltage.toFixed(2)} V</Badge>
        <Badge variant="outline">Current: {(current * 1000).toFixed(1)} mA</Badge>
        <Badge variant="outline">Resistance: {resistance.toFixed(1)} Ω</Badge>
        <Badge variant="outline">Temperature: {(temperature - 273).toFixed(0)}°C</Badge>
        <Badge variant="outline">Filament: {filamentType}</Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Study non-linear V-I characteristics of tungsten filament.
        Resistance increases with temperature due to positive temperature coefficient.
        Observe the exponential relationship between voltage and current.
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Voltage</div>
          <div className="text-lg font-semibold text-blue-500">{voltage.toFixed(2)} V</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Current</div>
          <div className="text-lg font-semibold text-green-500">{(current * 1000).toFixed(1)} mA</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Resistance</div>
          <div className="text-lg font-semibold text-amber-500">{resistance.toFixed(1)} Ω</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Temperature</div>
          <div className="text-lg font-semibold text-red-500">{(temperature - 273).toFixed(0)}°C</div>
        </div>
      </div>
      
      {/* Parameter Controls */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Lightbulb className="w-4 h-4" />
          Filament Control
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Voltage</span>
              <span className="font-medium">{voltage.toFixed(2)} V</span>
            </div>
            <input
              type="range"
              min="0"
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
          <Lightbulb className="w-4 h-4" />
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
            <div className="text-muted-foreground">V (V)</div>
            <div className="text-muted-foreground">I (mA)</div>
            <div className="text-muted-foreground">R (Ω)</div>
            <div className="text-muted-foreground">T (°C)</div>
            <div className="text-muted-foreground">R/R₀</div>
            {dataPoints.slice(-5).map((point, i) => (
              <div key={i} className="contents">
                <div>{point.voltage.toFixed(2)}</div>
                <div>{(point.current * 1000).toFixed(1)}</div>
                <div>{point.resistance.toFixed(1)}</div>
                <div>{(point.temperature - 273).toFixed(0)}</div>
                <div>{(point.resistance / roomTempResistance).toFixed(2)}</div>
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
                <div className="font-medium">Trial {i + 1} ({trial.filamentType}):</div>
                <div>Points: {trial.dataPoints.length} | R₀: {trial.roomTempResistance}Ω | R_hot: {trial.hotResistance.toFixed(1)}Ω</div>
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
            temperature={temperature}
            filamentType={filamentType}
            dataPoints={dataPoints}
            roomTempResistance={roomTempResistance}
            mode={mode}
          />
        </Canvas>
      </div>
    </div>
  )
}
