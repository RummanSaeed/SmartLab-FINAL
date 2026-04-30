"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Zap, TrendingUp } from "lucide-react"
import * as THREE from "three"

type Props = {
  capacitance: number // Farads
  frequency: number // Hz
  voltage: number // Volts
}

type DataPoint = {
  frequency: number
  current: number
  impedance: number
  phaseAngle: number
}

type Trial = {
  capacitance: number
  dataPoints: DataPoint[]
  measuredCapacitance: number
}

// Capacitor with AC charge visualization
function Capacitor({ 
  chargeLevel, 
  capacitance,
  current, 
  frequency 
}: { 
  chargeLevel: number; 
  capacitance: number;
  current: number; 
  frequency: number; 
}) {
  const capacitorRef = useRef<THREE.Group>(null)
  const fieldRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (capacitorRef.current) {
      // Animate charge oscillation
      const time = Date.now() * 0.001
      const charge = Math.sin(2 * Math.PI * frequency * time)
      
      capacitorRef.current.children.forEach((plate, index) => {
        if (plate instanceof THREE.Mesh) {
          const material = plate.material as THREE.MeshStandardMaterial
          const intensity = Math.abs(charge) * 0.8
          material.emissiveIntensity = index === 0 ? 
            (charge > 0 ? intensity : 0) : 
            (charge < 0 ? intensity : 0)
        }
      })
    }
    
    if (fieldRef.current) {
      // Electric field visualization
      const time = Date.now() * 0.001
      const fieldStrength = Math.sin(2 * Math.PI * frequency * time)
      const material = fieldRef.current.material as THREE.MeshStandardMaterial
      material.opacity = Math.abs(fieldStrength) * 0.3
      material.emissiveIntensity = Math.abs(fieldStrength) * 0.3
    }
  })
  
  return (
    <group position={[0, 0.5, 0]}>
      {/* Capacitor plates */}
      <group ref={capacitorRef}>
        {/* Positive plate */}
        <mesh position={[-0.15, 0, 0]} castShadow>
          <boxGeometry args={[0.05, 0.8, 0.6]} />
          <meshStandardMaterial 
            color="#ff4444"
            metalness={0.9}
            roughness={0.1}
            emissive="#ff0000"
            emissiveIntensity={0}
          />
        </mesh>
        
        {/* Negative plate */}
        <mesh position={[0.15, 0, 0]} castShadow>
          <boxGeometry args={[0.05, 0.8, 0.6]} />
          <meshStandardMaterial 
            color="#4444ff"
            metalness={0.9}
            roughness={0.1}
            emissive="#0000ff"
            emissiveIntensity={0}
          />
        </mesh>
      </group>
      
      {/* Electric field visualization */}
      <mesh ref={fieldRef} position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.7, 0.5]} />
        <meshStandardMaterial 
          color="#ffff00"
          transparent
          opacity={0}
          emissive="#ffff00"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Charge particles (oscillating) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const time = Date.now() * 0.001
        const charge = Math.sin(2 * Math.PI * frequency * time)
        const side = charge > 0 ? -1 : 1
        const y = -0.3 + (i / 12) * 0.6
        const z = (Math.random() - 0.5) * 0.4
        return (
          <mesh key={i} position={[side * 0.12, y, z]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial 
              color={side > 0 ? "#4444ff" : "#ff4444"}
              emissive={side > 0 ? "#0000ff" : "#ff0000"}
              emissiveIntensity={0.5}
            />
          </mesh>
        )
      })}
      
      <Text position={[0, 0.5, 0.4]} fontSize={0.06} color="#1e293b" anchorX="center">
        {(capacitance * 1000000).toFixed(1)} μF
      </Text>
    </group>
  )
}

// AC function generator
function FunctionGenerator({ 
  frequency, 
  voltage, 
  onFrequencyChange 
}: { 
  frequency: number; 
  voltage: number; 
  onFrequencyChange: (f: number) => void; 
}) {
  const knobRef = useRef<THREE.Mesh>(null)
  const displayRef = useRef<THREE.Mesh>(null)
  const waveRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (knobRef.current) {
      // Rotate knob based on frequency
      const rotation = (frequency / 1000) * Math.PI * 1.5
      knobRef.current.rotation.z = rotation
    }
    
    if (displayRef.current) {
      const material = displayRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.002) * 0.1
    }
    
    if (waveRef.current) {
      // Animate wave display
      const time = Date.now() * 0.001
      waveRef.current.position.y = Math.sin(2 * Math.PI * frequency * time) * 0.1
    }
  })
  
  return (
    <group position={[-2.5, 0.5, 0]}>
      {/* Generator body */}
      <mesh castShadow>
        <boxGeometry args={[1, 0.8, 0.4]} />
        <meshStandardMaterial color="#34495e" metalness={0.3} />
      </mesh>
      
      {/* Display */}
      <mesh ref={displayRef} position={[0, 0.1, 0.21]}>
        <boxGeometry args={[0.8, 0.2, 0.02]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          emissive="#00ff00"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      <Text position={[0, 0.1, 0.22]} fontSize={0.06} color="#00ff00" anchorX="center">
        {frequency.toFixed(0)} Hz
      </Text>
      
      <Text position={[0, -0.05, 0.22]} fontSize={0.04} color="#00ff00" anchorX="center">
        {voltage.toFixed(1)}V
      </Text>
      
      {/* Wave display */}
      <mesh ref={waveRef} position={[0, 0.3, 0.16]}>
        <boxGeometry args={[0.6, 0.1, 0.01]} />
        <meshStandardMaterial color="#00ff00" />
      </mesh>
      
      {/* Frequency control knob */}
      <mesh 
        ref={knobRef}
        position={[-0.3, -0.2, 0.21]}
        onClick={() => onFrequencyChange(Math.min(frequency + 50, 1000))}
      >
        <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
        <meshStandardMaterial color="#3498db" metalness={0.8} />
      </mesh>
      
      {/* Knob indicator */}
      <mesh position={[-0.3, -0.15, 0.23]}>
        <boxGeometry args={[0.04, 0.01, 0.01]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Output terminals */}
      <mesh position={[-0.2, -0.35, 0.21]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
        <meshStandardMaterial color="#ff0000" metalness={1} />
      </mesh>
      <mesh position={[0.2, -0.35, 0.21]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
        <meshStandardMaterial color="#000000" metalness={1} />
      </mesh>
      
      <Text position={[0, -0.5, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        FUNCTION GEN
      </Text>
    </group>
  )
}

// AC ammeter
function ACAmmeter({ 
  current, 
  frequency 
}: { 
  current: number; 
  frequency: number; 
}) {
  const needleRef = useRef<THREE.Mesh>(null)
  const displayRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (needleRef.current) {
      // Animate needle with AC
      const time = Date.now() * 0.001
      const deflection = Math.sin(2 * Math.PI * frequency * time) * (current / 0.1)
      needleRef.current.rotation.z = deflection
    }
    
    if (displayRef.current) {
      const material = displayRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.002) * 0.1
    }
  })
  
  return (
    <group position={[2.5, 0.5, 0]}>
      {/* Ammeter body */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.6, 0.3]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.3} />
      </mesh>
      
      {/* Display */}
      <mesh ref={displayRef} position={[0, 0.1, 0.16]}>
        <boxGeometry args={[0.6, 0.2, 0.02]} />
        <meshStandardMaterial 
          color="#000000"
          emissive="#00ff00"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      <Text position={[0, 0.1, 0.17]} fontSize={0.06} color="#00ff00" anchorX="center">
        {(current * 1000).toFixed(2)} mA
      </Text>
      
      <Text position={[0, -0.05, 0.17]} fontSize={0.04} color="#00ff00" anchorX="center">
        RMS
      </Text>
      
      {/* Analog display */}
      <mesh position={[0, 0.1, 0.16]}>
        <cylinderGeometry args={[0.25, 0.25, 0.01, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Scale markings */}
      {Array.from({ length: 9 }).map((_, i) => {
        const angle = -Math.PI/4 + (i / 8) * (Math.PI/2)
        const x = Math.sin(angle) * 0.2
        const y = Math.cos(angle) * 0.2
        return (
          <mesh key={i} position={[x, y + 0.1, 0.17]}>
            <boxGeometry args={[0.01, 0.02, 0.001]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        )
      })}
      
      {/* Needle */}
      <mesh ref={needleRef} position={[0, 0.1, 0.18]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.01, 0.2, 0.001]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      
      {/* Center pivot */}
      <mesh position={[0, 0.1, 0.18]}>
        <cylinderGeometry args={[0.02, 0.02, 0.01, 16]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      <Text position={[0, -0.25, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        AC AMMETER
      </Text>
    </group>
  )
}

// AC circuit connections with current flow
function ACCircuit({ 
  current, 
  frequency 
}: { 
  current: number; 
  frequency: number; 
}) {
  const wireRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (wireRef.current && current > 0) {
      const time = Date.now() * 0.001
      const intensity = Math.abs(Math.sin(2 * Math.PI * frequency * time))
      
      wireRef.current.children.forEach((wire, index) => {
        if (wire instanceof THREE.Mesh) {
          const material = wire.material as THREE.MeshStandardMaterial
          material.emissiveIntensity = intensity * 0.3
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

// Impedance vs frequency graph
function ImpedanceGraph({ 
  dataPoints, 
  capacitance 
}: { 
  dataPoints: DataPoint[]; 
  capacitance: number; 
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
        Frequency (Hz)
      </Text>
      <Text position={[-1.2, 0, 0.07]} fontSize={0.05} color="#ffffff" anchorX="center" rotation={[0, 0, Math.PI/2]}>
        Impedance (Ω)
      </Text>
      
      {/* Data points and curve */}
      {dataPoints.length > 1 && (
        <>
          {dataPoints.map((point, i) => {
            const x = (Math.log10(point.frequency) / 3) * 1.8 - 0.9 // Log scale 10-1000Hz
            const y = Math.min((point.impedance / 1000) * 0.4 - 0.4, 0.3) // Scale to 1000Ω max
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
        C = {(capacitance * 1000000).toFixed(1)} μF
      </Text>
      
      <Text position={[0, -0.8, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        IMPEDANCE vs FREQUENCY
      </Text>
    </group>
  )
}

function Scene({ 
  capacitance,
  frequency,
  voltage,
  current,
  impedance,
  dataPoints
}: {
  capacitance: number;
  frequency: number;
  voltage: number;
  current: number;
  impedance: number;
  dataPoints: DataPoint[];
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
      
      <Capacitor 
        chargeLevel={current}
        capacitance={capacitance}
        current={current}
        frequency={frequency}
      />
      <FunctionGenerator 
        frequency={frequency}
        voltage={voltage}
        onFrequencyChange={() => {}}
      />
      <ACAmmeter 
        current={current}
        frequency={frequency}
      />
      <ACCircuit 
        current={current}
        frequency={frequency}
      />
      <ImpedanceGraph 
        dataPoints={dataPoints}
        capacitance={capacitance}
      />
      
      {/* Instructions */}
      <Text position={[0, 3.5, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        Capacitive Reactance: X_C = 1/(2πfC)
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

export function CapacitanceACSim({ 
  capacitance: initialCapacitance = 0.000001, 
  frequency: initialFrequency = 50, 
  voltage: initialVoltage = 10
}: Props) {
  const [capacitance] = useState(initialCapacitance)
  const [frequency, setFrequency] = useState(initialFrequency)
  const [voltage] = useState(initialVoltage)
  
  const [trials, setTrials] = useState<Trial[]>([])
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [isMeasuring, setIsMeasuring] = useState(false)
  
  // Calculate capacitive reactance and current
  const calculateImpedance = (freq: number): number => {
    return 1 / (2 * Math.PI * freq * capacitance)
  }
  
  const impedance = calculateImpedance(frequency)
  const current = voltage / impedance
  const phaseAngle = -90 // Capacitive circuit
  
  const startMeasurement = () => {
    setIsMeasuring(true)
    setDataPoints([])
    setFrequency(10) // Start from low frequency
  }
  
  const addDataPoint = () => {
    const newPoint: DataPoint = {
      frequency,
      current,
      impedance,
      phaseAngle
    }
    setDataPoints(prev => [...prev, newPoint])
  }
  
  const completeMeasurement = () => {
    if (dataPoints.length > 0) {
      // Calculate capacitance from impedance data
      const avgImpedance = dataPoints.reduce((sum, point) => sum + point.impedance, 0) / dataPoints.length
      const avgFreq = dataPoints.reduce((sum, point) => sum + point.frequency, 0) / dataPoints.length
      const measuredCapacitance = 1 / (2 * Math.PI * avgFreq * avgImpedance)
      
      setTrials(prev => [...prev, {
        capacitance,
        dataPoints: [...dataPoints],
        measuredCapacitance
      }].slice(-3))
    }
    setIsMeasuring(false)
  }
  
  const autoSweep = () => {
    setIsMeasuring(true)
    const points: DataPoint[] = []
    
    // Automatically sweep through frequency values
    const frequencies = [10, 20, 50, 100, 200, 500, 1000]
    
    frequencies.forEach(freq => {
      const imp = calculateImpedance(freq)
      const curr = voltage / imp
      
      points.push({
        frequency: freq,
        current: curr,
        impedance: imp,
        phaseAngle: -90
      })
    })
    
    setDataPoints(points)
    
    // Calculate measured capacitance
    const avgImpedance = points.reduce((sum, point) => sum + point.impedance, 0) / points.length
    const avgFreq = points.reduce((sum, point) => sum + point.frequency, 0) / points.length
    const measuredCapacitance = 1 / (2 * Math.PI * avgFreq * avgImpedance)
    
    setTrials(prev => [...prev, {
      capacitance,
      dataPoints: points,
      measuredCapacitance
    }].slice(-3))
  }
  
  const reset = () => {
    setFrequency(50)
    setDataPoints([])
    setIsMeasuring(false)
  }
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Capacitance: {(capacitance * 1000000).toFixed(1)} μF</Badge>
        <Badge variant="outline">Frequency: {frequency.toFixed(0)} Hz</Badge>
        <Badge variant="outline">Voltage: {voltage.toFixed(1)} V</Badge>
        <Badge variant="outline">Impedance: {impedance.toFixed(1)} Ω</Badge>
        <Badge variant="outline">Current: {(current * 1000).toFixed(2)} mA</Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Measure capacitance by studying impedance variation with frequency.
        In AC circuits, capacitive reactance X_C = 1/(2πfC) decreases with frequency.
        Plot impedance vs frequency to determine capacitance.
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Frequency</div>
          <div className="text-lg font-semibold text-blue-500">{frequency.toFixed(0)} Hz</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Impedance</div>
          <div className="text-lg font-semibold text-green-500">{impedance.toFixed(1)} Ω</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Current</div>
          <div className="text-lg font-semibold text-amber-500">{(current * 1000).toFixed(2)} mA</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Phase Angle</div>
          <div className="text-lg font-semibold text-purple-500">{phaseAngle}°</div>
        </div>
      </div>
      
      {/* Parameter Controls */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <TrendingUp className="w-4 h-4" />
          Frequency Control
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Frequency</span>
              <span className="font-medium">{frequency.toFixed(0)} Hz</span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
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
          <div className="grid grid-cols-5 gap-2 text-xs">
            <div className="text-muted-foreground">f (Hz)</div>
            <div className="text-muted-foreground">X_C (Ω)</div>
            <div className="text-muted-foreground">I (mA)</div>
            <div className="text-muted-foreground">Phase (°)</div>
            <div className="text-muted-foreground">C_calc (μF)</div>
            {dataPoints.slice(-5).map((point, i) => (
              <div key={i} className="contents">
                <div>{point.frequency}</div>
                <div>{point.impedance.toFixed(1)}</div>
                <div>{(point.current * 1000).toFixed(2)}</div>
                <div>{point.phaseAngle}</div>
                <div>{(1 / (2 * Math.PI * point.frequency * point.impedance) * 1000000).toFixed(2)}</div>
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
                <div>Points: {trial.dataPoints.length} | Actual: {(trial.capacitance * 1000000).toFixed(1)} μF | Measured: {(trial.measuredCapacitance * 1000000).toFixed(1)} μF</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [4, 4, 5], fov: 50 }} shadows>
          <Scene 
            capacitance={capacitance}
            frequency={frequency}
            voltage={voltage}
            current={current}
            impedance={impedance}
            dataPoints={dataPoints}
          />
        </Canvas>
      </div>
    </div>
  )
}
