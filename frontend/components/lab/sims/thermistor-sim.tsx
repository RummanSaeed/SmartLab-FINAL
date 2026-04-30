"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Thermometer, TrendingDown } from "lucide-react"
import * as THREE from "three"

type Props = {
  supplyVoltage: number // Volts
  seriesResistance: number // Ohms
}

type DataPoint = {
  temperature: number
  voltage: number
  current: number
  resistance: number
}

type Trial = {
  dataPoints: DataPoint[]
  beta: number
  r25: number
}

// Thermistor with temperature-dependent color
function Thermistor({ 
  temperature, 
  current 
}: { 
  temperature: number; 
  current: number; 
}) {
  const thermistorRef = useRef<THREE.Mesh>(null)
  const heatGlowRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (thermistorRef.current) {
      // Color changes with temperature
      const material = thermistorRef.current.material as THREE.MeshStandardMaterial
      const hue = 0.7 - (temperature - 25) / 100 // Blue to red
      material.color.setHSL(hue, 0.8, 0.5)
      
      // Glow when current flows
      if (current > 0) {
        material.emissiveIntensity = Math.min(current * 10, 0.8)
      }
    }
    
    if (heatGlowRef.current) {
      // Heat visualization
      const material = heatGlowRef.current.material as THREE.MeshStandardMaterial
      material.opacity = Math.max(0, (temperature - 25) / 100)
      material.emissiveIntensity = Math.max(0, (temperature - 25) / 100)
    }
  })
  
  return (
    <group position={[0, 0.5, 0]}>
      {/* Thermistor body */}
      <mesh ref={thermistorRef} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.3, 32]} />
        <meshStandardMaterial 
          color="#4169e1"
          metalness={0.1}
          roughness={0.8}
          emissive="#4169e1"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Heat glow effect */}
      <mesh ref={heatGlowRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial 
          color="#ff6b35"
          transparent
          opacity={0}
          emissive="#ff6b35"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Lead wires */}
      <mesh position={[-0.2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      <mesh position={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      
      {/* Temperature label */}
      <Text position={[0, 0.3, 0.2]} fontSize={0.05} color="#1e293b" anchorX="center">
        {temperature.toFixed(1)}°C
      </Text>
    </group>
  )
}

// Temperature chamber with heating/cooling
function TemperatureChamber({ 
  temperature, 
  isHeating, 
  isCooling 
}: { 
  temperature: number; 
  isHeating: boolean; 
  isCooling: boolean; 
}) {
  const chamberRef = useRef<THREE.Mesh>(null)
  const heaterRef = useRef<THREE.Mesh>(null)
  const coolerRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (chamberRef.current) {
      // Chamber color changes with temperature
      const material = chamberRef.current.material as THREE.MeshPhysicalMaterial
      const tempNormalized = (temperature - 0) / 100
      material.color.setHSL(0.6 - tempNormalized * 0.4, 0.3, 0.7)
    }
    
    if (heaterRef.current && isHeating) {
      // Heating element glow
      const material = heaterRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.8 + Math.sin(Date.now() * 0.01) * 0.2
    }
    
    if (coolerRef.current && isCooling) {
      // Cooling element blue glow
      const material = coolerRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.6 + Math.sin(Date.now() * 0.008) * 0.1
    }
  })
  
  return (
    <group position={[0, 0.5, 0]}>
      {/* Chamber walls */}
      <mesh ref={chamberRef} castShadow>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshPhysicalMaterial 
          color="#e8f4f8"
          metalness={0}
          roughness={0.3}
          transmission={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Heating element */}
      <mesh ref={heaterRef} position={[0.5, 0, 0]}>
        <boxGeometry args={[0.05, 0.8, 0.05]} />
        <meshStandardMaterial 
          color="#ff6b35"
          emissive="#ff4500"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Cooling element */}
      <mesh ref={coolerRef} position={[-0.5, 0, 0]}>
        <boxGeometry args={[0.05, 0.8, 0.05]} />
        <meshStandardMaterial 
          color="#4169e1"
          emissive="#0066cc"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Temperature sensor probe */}
      <mesh position={[0, -0.3, 0.4]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      <mesh position={[0, -0.4, 0.4]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      
      <Text position={[0, -0.6, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        TEMP CHAMBER
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

// Series resistor
function SeriesResistor({ resistance }: { resistance: number }) {
  return (
    <group position={[-2.5, 0.5, 0]}>
      {/* Resistor body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#D2691E" roughness={0.8} />
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
        SERIES R
      </Text>
    </group>
  )
}

// Circuit connections
function ThermistorCircuit({ current }: { current: number }) {
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

// R vs T graph display
function ResistanceGraph({ 
  dataPoints, 
  currentResistance 
}: { 
  dataPoints: DataPoint[]; 
  currentResistance: number; 
}) {
  return (
    <group position={[0, 2.5, 0]}>
      <mesh castShadow>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[1.8, 1]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Graph axes */}
      <mesh position={[0, -0.3, 0.06]}>
        <boxGeometry args={[1.6, 0.01, 0.001]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.7, 0, 0.06]}>
        <boxGeometry args={[0.01, 0.8, 0.001]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Data points */}
      {dataPoints.map((point, i) => {
        const x = ((point.temperature - 0) / 100) * 1.4 - 0.7
        const y = Math.min(0.3, (point.currentResistance / 10000) * 0.3 - 0.3)
        return (
          <mesh key={i} position={[x, y, 0.07]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#ff6b35" />
          </mesh>
        )
      })}
      
      <Text position={[0, -0.5, 0.07]} fontSize={0.05} color="#ff6b35" anchorX="center">
        R = {currentResistance.toFixed(1)} Ω
      </Text>
      
      <Text position={[0, -0.7, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        R vs T CHARACTERISTIC
      </Text>
    </group>
  )
}

function Scene({ 
  temperature,
  voltage,
  current,
  resistance,
  seriesResistance,
  isHeating,
  isCooling,
  dataPoints,
  mode
}: {
  temperature: number;
  voltage: number;
  current: number;
  resistance: number;
  seriesResistance: number;
  isHeating: boolean;
  isCooling: boolean;
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
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.9} />
      </mesh>
      
      <TemperatureChamber 
        temperature={temperature}
        isHeating={isHeating}
        isCooling={isCooling}
      />
      <Thermistor temperature={temperature} current={current} />
      <Multimeter 
        voltage={voltage}
        current={current}
        resistance={resistance}
        mode={mode}
      />
      <SeriesResistor resistance={seriesResistance} />
      <ThermistorCircuit current={current} />
      <ResistanceGraph 
        dataPoints={dataPoints}
        currentResistance={resistance}
      />
      
      {/* Instructions */}
      <Text position={[0, 3.5, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        Thermistor: R(T) = R₀ × exp(β × (1/T - 1/T₀))
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

export function ThermistorSim({ 
  supplyVoltage: initialSupplyVoltage = 5, 
  seriesResistance: initialSeriesResistance = 1000
}: Props) {
  const [supplyVoltage] = useState(initialSupplyVoltage)
  const [seriesResistance, setSeriesResistance] = useState(initialSeriesResistance)
  const [temperature, setTemperature] = useState(25) // Room temperature
  
  const [trials, setTrials] = useState<Trial[]>([])
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [isHeating, setIsHeating] = useState(false)
  const [isCooling, setIsCooling] = useState(false)
  const [mode, setMode] = useState<"V" | "I" | "R">("R")
  
  // Thermistor parameters (NTC thermistor)
  const r25 = 10000 // 10kΩ at 25°C
  const beta = 3950 // Beta coefficient
  
  // Calculate thermistor resistance at given temperature
  const calculateThermistorResistance = (temp: number): number => {
    const t0 = 298.15 // 25°C in Kelvin
    const t = temp + 273.15 // Convert to Kelvin
    return r25 * Math.exp(beta * (1/t - 1/t0))
  }
  
  const thermistorResistance = calculateThermistorResistance(temperature)
  const totalResistance = seriesResistance + thermistorResistance
  const current = supplyVoltage / totalResistance
  const voltage = current * thermistorResistance
  
  const startHeating = () => {
    setIsHeating(true)
    setIsCooling(false)
  }
  
  const startCooling = () => {
    setIsCooling(true)
    setIsHeating(false)
  }
  
  const stopTemperatureControl = () => {
    setIsHeating(false)
    setIsCooling(false)
  }
  
  const addDataPoint = () => {
    const newPoint: DataPoint = {
      temperature,
      voltage,
      current,
      resistance: thermistorResistance
    }
    setDataPoints(prev => [...prev, newPoint])
  }
  
  const completeMeasurement = () => {
    if (dataPoints.length > 0) {
      setTrials(prev => [...prev, {
        dataPoints: [...dataPoints],
        beta,
        r25
      }].slice(-3))
    }
    setDataPoints([])
  }
  
  const reset = () => {
    setTemperature(25)
    setIsHeating(false)
    setIsCooling(false)
    setDataPoints([])
  }
  
  // Temperature control
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isHeating || isCooling) {
      interval = setInterval(() => {
        setTemperature(prev => {
          if (isHeating) {
            return Math.min(prev + 0.5, 100) // Heat up to 100°C
          } else {
            return Math.max(prev - 0.5, 0) // Cool down to 0°C
          }
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isHeating, isCooling])
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Temperature: {temperature.toFixed(1)}°C</Badge>
        <Badge variant="outline">Thermistor R: {thermistorResistance.toFixed(1)} Ω</Badge>
        <Badge variant="outline">Current: {(current * 1000).toFixed(2)} mA</Badge>
        <Badge variant="outline">Voltage: {voltage.toFixed(3)} V</Badge>
        <Badge variant="outline">Series R: {seriesResistance} Ω</Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Measure thermistor resistance vs temperature characteristic.
        Thermistor resistance decreases with temperature (NTC).
        Formula: R(T) = R₀ × exp(β × (1/T - 1/T₀))
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Temperature</div>
          <div className="text-lg font-semibold text-blue-500">{temperature.toFixed(1)}°C</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Thermistor R</div>
          <div className="text-lg font-semibold text-red-500">{(thermistorResistance / 1000).toFixed(1)} kΩ</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Current</div>
          <div className="text-lg font-semibold text-green-500">{(current * 1000).toFixed(2)} mA</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Data Points</div>
          <div className="text-lg font-semibold text-purple-500">{dataPoints.length}</div>
        </div>
      </div>
      
      {/* Parameter Controls */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Thermometer className="w-4 h-4" />
          Temperature Control
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Series Resistance</span>
              <span className="font-medium">{seriesResistance} Ω</span>
            </div>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={seriesResistance}
              onChange={(e) => setSeriesResistance(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Temperature</span>
              <span className="font-medium">{temperature.toFixed(1)}°C</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              disabled={isHeating || isCooling}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={startHeating}
          disabled={isHeating || isCooling}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          Heat
        </Button>
        <Button 
          onClick={startCooling}
          disabled={isHeating || isCooling}
          variant="outline"
          className="gap-2"
        >
          <TrendingDown className="w-4 h-4" />
          Cool
        </Button>
        <Button 
          onClick={stopTemperatureControl}
          disabled={!isHeating && !isCooling}
          variant="outline"
          className="gap-2"
        >
          Stop
        </Button>
        <Button 
          onClick={addDataPoint}
          variant="outline"
          className="gap-2"
        >
          Add Point
        </Button>
        <Button 
          onClick={completeMeasurement}
          disabled={dataPoints.length === 0}
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
            <div className="text-muted-foreground">T (°C)</div>
            <div className="text-muted-foreground">R (kΩ)</div>
            <div className="text-muted-foreground">V (V)</div>
            <div className="text-muted-foreground">I (mA)</div>
            <div className="text-muted-foreground">R/R₂₅</div>
            {dataPoints.slice(-5).map((point, i) => (
              <div key={i} className="contents">
                <div>{point.temperature.toFixed(1)}</div>
                <div>{(point.resistance / 1000).toFixed(2)}</div>
                <div>{point.voltage.toFixed(3)}</div>
                <div>{(point.current * 1000).toFixed(2)}</div>
                <div>{(point.resistance / r25).toFixed(3)}</div>
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
                <div className="font-medium">Trial {i + 1}:</div>
                <div>Points: {trial.dataPoints.length} | β: {trial.beta} | R₂₅: {(trial.r25 / 1000).toFixed(1)} kΩ</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [4, 4, 5], fov: 50 }} shadows>
          <Scene 
            temperature={temperature}
            voltage={voltage}
            current={current}
            resistance={thermistorResistance}
            seriesResistance={seriesResistance}
            isHeating={isHeating}
            isCooling={isCooling}
            dataPoints={dataPoints}
            mode={mode}
          />
        </Canvas>
      </div>
    </div>
  )
}
