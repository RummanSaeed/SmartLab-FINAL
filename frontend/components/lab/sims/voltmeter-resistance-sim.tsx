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
  seriesResistance: number // Ohms
}

type DataPoint = {
  voltage: number
  current: number
  resistance: number
}

type Trial = {
  dataPoints: DataPoint[]
  calculatedResistance: number
  averageResistance: number
}

// Voltmeter with realistic display
function Voltmeter({ 
  voltage, 
  current, 
  resistance 
}: { 
  voltage: number; 
  current: number; 
  resistance: number; 
}) {
  const needleRef = useRef<THREE.Mesh>(null)
  const displayRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (needleRef.current) {
      // Animate needle based on voltage
      const maxAngle = Math.PI / 3
      const angle = (voltage / 30) * maxAngle // Assuming 30V max scale
      needleRef.current.rotation.z = -Math.PI/2 + angle
    }
    
    if (displayRef.current) {
      // Digital display glow
      const material = displayRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.002) * 0.1
    }
  })
  
  return (
    <group position={[2, 0.5, 0]}>
      {/* Voltmeter body */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.6, 0.3]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.3} />
      </mesh>
      
      {/* Analog display */}
      <mesh position={[0, 0.1, 0.16]}>
        <cylinderGeometry args={[0.35, 0.35, 0.02, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Scale markings */}
      {Array.from({ length: 11 }).map((_, i) => {
        const angle = -Math.PI/3 + (i / 10) * (2 * Math.PI/3)
        const x = Math.sin(angle) * 0.28
        const y = Math.cos(angle) * 0.28
        const voltageValue = (i / 10) * 30
        return (
          <group key={i}>
            <mesh position={[x, y + 0.1, 0.17]}>
              <boxGeometry args={[i % 2 === 0 ? 0.02 : 0.01, 0.02, 0.001]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            {i % 2 === 0 && (
              <Text position={[x * 1.2, y + 0.1, 0.18]} fontSize={0.03} color="#1e293b" anchorX="center">
                {voltageValue.toFixed(0)}
              </Text>
            )}
          </group>
        )
      })}
      
      {/* Needle */}
      <mesh ref={needleRef} position={[0, 0.1, 0.18]} rotation={[0, 0, -Math.PI/2]}>
        <boxGeometry args={[0.01, 0.25, 0.001]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      
      {/* Center pivot */}
      <mesh position={[0, 0.1, 0.18]}>
        <cylinderGeometry args={[0.02, 0.02, 0.01, 16]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      {/* Digital display */}
      <mesh ref={displayRef} position={[0, -0.15, 0.16]}>
        <boxGeometry args={[0.6, 0.15, 0.02]} />
        <meshStandardMaterial 
          color="#000000"
          emissive="#00ff00"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <Text position={[0, -0.15, 0.17]} fontSize={0.06} color="#00ff00" anchorX="center">
        {voltage.toFixed(2)}V
      </Text>
      
      <Text position={[0, -0.25, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        VOLTMETER
      </Text>
    </group>
  )
}

// Ammeter
function Ammeter({ current }: { current: number }) {
  const needleRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (needleRef.current) {
      // Animate needle based on current
      const maxAngle = Math.PI / 3
      const angle = (current / 0.01) * maxAngle // Assuming 10mA max scale
      needleRef.current.rotation.z = -Math.PI/2 + angle
    }
  })
  
  return (
    <group position={[-2, 0.5, 0]}>
      {/* Ammeter body */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.6, 0.3]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.3} />
      </mesh>
      
      {/* Display */}
      <mesh position={[0, 0.1, 0.16]}>
        <cylinderGeometry args={[0.35, 0.35, 0.02, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Scale markings */}
      {Array.from({ length: 11 }).map((_, i) => {
        const angle = -Math.PI/3 + (i / 10) * (2 * Math.PI/3)
        const x = Math.sin(angle) * 0.28
        const y = Math.cos(angle) * 0.28
        const currentValue = (i / 10) * 10
        return (
          <group key={i}>
            <mesh position={[x, y + 0.1, 0.17]}>
              <boxGeometry args={[i % 2 === 0 ? 0.02 : 0.01, 0.02, 0.001]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            {i % 2 === 0 && (
              <Text position={[x * 1.2, y + 0.1, 0.18]} fontSize={0.03} color="#1e293b" anchorX="center">
                {currentValue.toFixed(0)}
              </Text>
            )}
          </group>
        )
      })}
      
      {/* Needle */}
      <mesh ref={needleRef} position={[0, 0.1, 0.18]} rotation={[0, 0, -Math.PI/2]}>
        <boxGeometry args={[0.01, 0.25, 0.001]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      
      {/* Center pivot */}
      <mesh position={[0, 0.1, 0.18]}>
        <cylinderGeometry args={[0.02, 0.02, 0.01, 16]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      <Text position={[0, -0.15, 0.17]} fontSize={0.06} color="#1e293b" anchorX="center">
        {(current * 1000).toFixed(2)} mA
      </Text>
      
      <Text position={[0, -0.25, 0]} fontSize={0.04} color="#64748b" anchorX="center">
      AMMETER
      </Text>
    </group>
  )
}

// Variable power supply
function VariablePowerSupply({ 
  voltage, 
  onChange 
}: { 
  voltage: number; 
  onChange: (v: number) => void; 
}) {
  const knobRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (knobRef.current) {
      // Rotate knob based on voltage
      const rotation = (voltage / 30) * Math.PI * 1.5
      knobRef.current.rotation.z = rotation
    }
  })
  
  return (
    <group position={[0, 0.5, 0]}>
      {/* Power supply body */}
      <mesh castShadow>
        <boxGeometry args={[1, 0.8, 0.4]} />
        <meshStandardMaterial color="#34495e" metalness={0.3} />
      </mesh>
      
      {/* Display */}
      <mesh position={[0, 0.1, 0.21]}>
        <boxGeometry args={[0.8, 0.2, 0.02]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          emissive="#ff6b35"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <Text position={[0, 0.1, 0.22]} fontSize={0.08} color="#ff6b35" anchorX="center">
        {voltage.toFixed(1)}V
      </Text>
      
      {/* Voltage control knob */}
      <mesh 
        ref={knobRef}
        position={[-0.3, -0.2, 0.21]}
        onClick={() => onChange(Math.min(voltage + 1, 30))}
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

// Series resistor box
function SeriesResistor({ resistance }: { resistance: number }) {
  return (
    <group position={[0, -0.8, 0]}>
      {/* Resistor box */}
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.4, 0.3]} />
        <meshStandardMaterial color="#8b4513" roughness={0.8} />
      </mesh>
      
      {/* Resistance value */}
      <Text position={[0, 0, 0.16]} fontSize={0.06} color="#ffffff" anchorX="center">
        {resistance} Ω
      </Text>
      
      {/* Connection terminals */}
      <mesh position={[-0.35, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      <mesh position={[0.35, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      
      <Text position={[0, -0.3, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        SERIES R
      </Text>
    </group>
  )
}

// Circuit wires
function CircuitWires({ current }: { current: number }) {
  const wireRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (wireRef.current && current > 0) {
      // Current flow animation
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
      {/* Top horizontal wire */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Left vertical wire */}
      <mesh position={[-2, 0, 0]}>
        <boxGeometry args={[0.02, 1, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Right vertical wire */}
      <mesh position={[2, 0, 0]}>
        <boxGeometry args={[0.02, 1, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Bottom wire through series resistor */}
      <mesh position={[0, -0.8, 0]}>
        <boxGeometry args={[4, 0.02, 0.02]} />
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

// Graph display for R vs I/V
function GraphDisplay({ 
  dataPoints, 
  measuredResistance 
}: { 
  dataPoints: DataPoint[]; 
  measuredResistance: number; 
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
      
      {/* Data points and line */}
      {dataPoints.length > 1 && (
        <>
          {dataPoints.map((point, i) => {
            const x = (point.voltage / 30) * 0.7 - 0.7
            const y = (point.current / 0.01) * 0.3 - 0.3
            return (
              <mesh key={i} position={[x, y, 0.07]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshStandardMaterial color="#00ff00" />
              </mesh>
            )
          })}
        </>
      )}
      
      <Text position={[0, -0.5, 0.07]} fontSize={0.05} color="#00ff00" anchorX="center">
        R = {measuredResistance.toFixed(0)} Ω
      </Text>
      
      <Text position={[0, -0.7, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        R vs I/V GRAPH
      </Text>
    </group>
  )
}

function Scene({ 
  voltage,
  current,
  resistance,
  seriesResistance,
  dataPoints,
  measuredResistance
}: {
  voltage: number;
  current: number;
  resistance: number;
  seriesResistance: number;
  dataPoints: DataPoint[];
  measuredResistance: number;
}) {
  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 3]} intensity={1} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[0, 4, 2]} intensity={0.5} color="#fbbf24" />
      
      {/* Lab bench */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.9} />
      </mesh>
      
      <VariablePowerSupply voltage={voltage} onChange={() => {}} />
      <Voltmeter voltage={voltage} current={current} resistance={resistance} />
      <Ammeter current={current} />
      <SeriesResistor resistance={seriesResistance} />
      <CircuitWires current={current} />
      <GraphDisplay dataPoints={dataPoints} measuredResistance={measuredResistance} />
      
      {/* Instructions */}
      <Text position={[0, 3.5, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        Voltmeter Resistance: R = V/I (with series resistor)
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

export function VoltmeterResistanceSim({ 
  maxVoltage: initialMaxVoltage = 30, 
  seriesResistance: initialSeriesResistance = 10000
}: Props) {
  const [maxVoltage] = useState(initialMaxVoltage)
  const [seriesResistance, setSeriesResistance] = useState(initialSeriesResistance)
  const [voltage, setVoltage] = useState(0)
  
  const [trials, setTrials] = useState<Trial[]>([])
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [isMeasuring, setIsMeasuring] = useState(false)
  
  // Calculate circuit values
  const totalResistance = seriesResistance + 50000 // Assuming 50kΩ voltmeter internal resistance
  const current = voltage / totalResistance
  const measuredResistance = voltage / current
  
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
        resistance: measuredResistance
      }
      setDataPoints(prev => [...prev, newPoint])
    }
  }
  
  const completeMeasurement = () => {
    if (dataPoints.length > 0) {
      const avgResistance = dataPoints.reduce((sum, point) => sum + point.resistance, 0) / dataPoints.length
      setTrials(prev => [...prev, {
        dataPoints: [...dataPoints],
        calculatedResistance: measuredResistance,
        averageResistance: avgResistance
      }].slice(-3))
    }
    setIsMeasuring(false)
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
        <Badge variant="outline">Current: {(current * 1000).toFixed(3)} mA</Badge>
        <Badge variant="outline">Series R: {seriesResistance} Ω</Badge>
        <Badge variant="outline">Meter R: {measuredResistance.toFixed(0)} Ω</Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Measure voltmeter resistance by plotting V vs I with a series resistor.
        The slope of V-I graph gives the total resistance. Subtract series R to get meter R.
        Formula: R_meter = (V/I) - R_series
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Applied Voltage</div>
          <div className="text-lg font-semibold text-blue-500">{voltage.toFixed(2)} V</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Current</div>
          <div className="text-lg font-semibold text-green-500">{(current * 1000).toFixed(3)} mA</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Total R</div>
          <div className="text-lg font-semibold text-amber-500">{(voltage / current).toFixed(0)} Ω</div>
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
          Measurement Controls
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Series Resistance</span>
              <span className="font-medium">{seriesResistance} Ω</span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={seriesResistance}
              onChange={(e) => setSeriesResistance(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              disabled={isMeasuring}
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Voltage</span>
              <span className="font-medium">{voltage.toFixed(1)} V</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="0.5"
              value={voltage}
              onChange={(e) => setVoltage(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              disabled={!isMeasuring}
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
          Add Data Point
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
            <div className="text-muted-foreground">R_meter (Ω)</div>
            {dataPoints.map((point, i) => (
              <div key={i} className="contents">
                <div>{point.voltage.toFixed(2)}</div>
                <div>{(point.current * 1000).toFixed(3)}</div>
                <div>{point.resistance.toFixed(0)}</div>
                <div className="text-green-500">{(point.resistance - seriesResistance).toFixed(0)}</div>
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
                <div>Points: {trial.dataPoints.length} | Avg R_meter: {(trial.averageResistance - seriesResistance).toFixed(0)} Ω</div>
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
            resistance={measuredResistance}
            seriesResistance={seriesResistance}
            dataPoints={dataPoints}
            measuredResistance={measuredResistance - seriesResistance}
          />
        </Canvas>
      </div>
    </div>
  )
}
