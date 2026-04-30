"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Zap, Battery, TrendingUp } from "lucide-react"
import * as THREE from "three"

type Props = {
  cellEMF: number // Volts
  internalResistance: number // Ohms
}

type DataPoint = {
  voltage: number
  current: number
  resistance: number
}

type Trial = {
  emf: number
  internalResistance: number
  dataPoints: DataPoint[]
}

// Test cell with variable load
function TestCell({ 
  emf, 
  internalResistance, 
  current 
}: { 
  emf: number; 
  internalResistance: number; 
  current: number; 
}) {
  const cellRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (cellRef.current && current > 0) {
      // Cell glow intensity based on current
      const material = cellRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.3 + Math.min(current * 2, 0.5)
    }
  })
  
  return (
    <group position={[-2, 0.5, 0]}>
      {/* Cell body */}
      <mesh ref={cellRef} castShadow>
        <boxGeometry args={[0.5, 0.9, 0.4]} />
        <meshStandardMaterial 
          color="#2ecc71"
          metalness={0.2}
          roughness={0.6}
          emissive="#27ae60"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Positive terminal */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
        <meshStandardMaterial color="#e74c3c" metalness={1} />
      </mesh>
      
      {/* Negative terminal */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 16]} />
        <meshStandardMaterial color="#34495e" metalness={1} />
      </mesh>
      
      {/* EMF label */}
      <Text position={[0, 0, 0.21]} fontSize={0.06} color="#ffffff" anchorX="center">
        {emf.toFixed(2)}V
      </Text>
      
      {/* Internal resistance indicator */}
      <Text position={[0, -0.08, 0.21]} fontSize={0.04} color="#ecf0f1" anchorX="center">
        r = {internalResistance.toFixed(1)}Ω
      </Text>
      
      <Text position={[0, -0.6, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        TEST CELL
      </Text>
    </group>
  )
}

// Variable load resistor (rheostat)
function VariableLoad({ 
  resistance, 
  current 
}: { 
  resistance: number; 
  current: number; 
}) {
  const rheostatRef = useRef<THREE.Mesh>(null)
  const sliderRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (rheostatRef.current && current > 0) {
      // Heat glow based on power dissipation
      const power = current * current * resistance
      const material = rheostatRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = Math.min(power / 10, 0.8)
    }
    
    if (sliderRef.current) {
      // Slider position based on resistance
      const normalizedR = (resistance - 1) / 49 // Normalize 1-50Ω range
      sliderRef.current.position.x = -0.2 + normalizedR * 0.4
    }
  })
  
  return (
    <group position={[2, 0.5, 0]}>
      {/* Rheostat body */}
      <mesh ref={rheostatRef} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial 
          color="#8b4513"
          roughness={0.8}
          emissive="#ff6600"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Winding visualization */}
      {Array.from({ length: 16 }).map((_, i) => {
        const x = -0.35 + i * 0.045
        return (
          <mesh key={i} position={[x, 0, 0]}>
            <torusGeometry args={[0.12, 0.01, 8, 8]} />
            <meshStandardMaterial color="#cd853f" />
          </mesh>
        )
      })}
      
      {/* Slider */}
      <mesh ref={sliderRef} position={[0, 0, 0.16]}>
        <boxGeometry args={[0.06, 0.06, 0.03]} />
        <meshStandardMaterial color="#ff6b35" />
      </mesh>
      
      {/* Terminals */}
      <mesh position={[-0.4, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      <mesh position={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      
      <Text position={[0, -0.2, 0]} fontSize={0.05} color="#1e293b" anchorX="center">
        {resistance.toFixed(1)} Ω
      </Text>
      
      <Text position={[0, -0.3, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        LOAD R
      </Text>
    </group>
  )
}

// Voltmeter
function Voltmeter({ voltage }: { voltage: number }) {
  const needleRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (needleRef.current) {
      // Animate needle based on voltage
      const maxAngle = Math.PI / 3
      const angle = (voltage / 2) * maxAngle // Assuming 2V max scale
      needleRef.current.rotation.z = -Math.PI/2 + angle
    }
  })
  
  return (
    <group position={[0, 2, 0]}>
      {/* Voltmeter body */}
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
      {Array.from({ length: 9 }).map((_, i) => {
        const angle = -Math.PI/3 + (i / 8) * (2 * Math.PI/3)
        const x = Math.sin(angle) * 0.28
        const y = Math.cos(angle) * 0.28
        const voltageValue = (i / 8) * 2
        return (
          <group key={i}>
            <mesh position={[x, y + 0.1, 0.17]}>
              <boxGeometry args={[0.01, 0.02, 0.001]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            {i % 2 === 0 && (
              <Text position={[x * 1.2, y + 0.1, 0.18]} fontSize={0.03} color="#1e293b" anchorX="center">
                {voltageValue.toFixed(1)}
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
        {voltage.toFixed(3)}V
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
      const angle = (current / 0.5) * maxAngle // Assuming 500mA max scale
      needleRef.current.rotation.z = -Math.PI/2 + angle
    }
  })
  
  return (
    <group position={[0, -1.5, 0]}>
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
      {Array.from({ length: 9 }).map((_, i) => {
        const angle = -Math.PI/3 + (i / 8) * (2 * Math.PI/3)
        const x = Math.sin(angle) * 0.28
        const y = Math.cos(angle) * 0.28
        const currentValue = (i / 8) * 500
        return (
          <group key={i}>
            <mesh position={[x, y + 0.1, 0.17]}>
              <boxGeometry args={[0.01, 0.02, 0.001]} />
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
        {(current * 1000).toFixed(0)}mA
      </Text>
      
      <Text position={[0, -0.25, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        AMMETER
      </Text>
    </group>
  )
}

// Circuit connections with current flow
function VICircuit({ current }: { current: number }) {
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
        <boxGeometry args={[4, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Bottom wire */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[4, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Voltmeter connections */}
      <mesh position={[-2, 0.5, 0]}>
        <boxGeometry args={[0.02, 1.5, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      <mesh position={[2, 0.5, 0]}>
        <boxGeometry args={[0.02, 1.5, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Ammeter connections */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.02, 1.8, 0.02]} />
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
function VIGraph({ 
  dataPoints, 
  emf, 
  internalResistance 
}: { 
  dataPoints: DataPoint[]; 
  emf: number; 
  internalResistance: number; 
}) {
  return (
    <group position={[0, 3.5, 0]}>
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
      
      {/* Data points and line */}
      {dataPoints.length > 1 && (
        <>
          {dataPoints.map((point, i) => {
            const x = (point.current / 0.5) * 0.9 - 0.9 // Scale to 500mA max
            const y = (point.voltage / 2) * 0.4 - 0.4 // Scale to 2V max
            return (
              <mesh key={i} position={[x, y, 0.07]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshStandardMaterial color="#00ff00" />
              </mesh>
            )
          })}
        </>
      )}
      
      {/* Theoretical line */}
      {emf > 0 && internalResistance > 0 && (
        <>
          {Array.from({ length: 50 }).map((_, i) => {
            const current = (i / 49) * 0.5 // 0 to 500mA
            const voltage = emf - current * internalResistance
            if (voltage < 0) return null
            
            const x = (current / 0.5) * 0.9 - 0.9
            const y = (voltage / 2) * 0.4 - 0.4
            return (
              <mesh key={`theory-${i}`} position={[x, y, 0.07]}>
                <sphereGeometry args={[0.005, 6, 6]} />
                <meshStandardMaterial color="#ff6b35" />
              </mesh>
            )
          })}
        </>
      )}
      
      <Text position={[0, -0.65, 0.07]} fontSize={0.04} color="#00ff00" anchorX="center">
        E = {emf.toFixed(2)}V, r = {internalResistance.toFixed(2)}Ω
      </Text>
      
      <Text position={[0, -0.8, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        V-I CHARACTERISTIC
      </Text>
    </group>
  )
}

function Scene({ 
  emf,
  internalResistance,
  loadResistance,
  current,
  voltage,
  dataPoints
}: {
  emf: number;
  internalResistance: number;
  loadResistance: number;
  current: number;
  voltage: number;
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
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.9} />
      </mesh>
      
      <TestCell 
        emf={emf}
        internalResistance={internalResistance}
        current={current}
      />
      <VariableLoad 
        resistance={loadResistance}
        current={current}
      />
      <Voltmeter voltage={voltage} />
      <Ammeter current={current} />
      <VICircuit current={current} />
      <VIGraph 
        dataPoints={dataPoints}
        emf={emf}
        internalResistance={internalResistance}
      />
      
      {/* Instructions */}
      <Text position={[0, 4.5, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        V-I Characteristics: V = E - Ir
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

export function VIGraphCellSim({ 
  cellEMF: initialCellEMF = 1.5, 
  internalResistance: initialInternalResistance = 2.5
}: Props) {
  const [cellEMF] = useState(initialCellEMF)
  const [internalResistance] = useState(initialInternalResistance)
  const [loadResistance, setLoadResistance] = useState(10)
  
  const [trials, setTrials] = useState<Trial[]>([])
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [isMeasuring, setIsMeasuring] = useState(false)
  
  // Calculate circuit values
  const totalResistance = loadResistance + internalResistance
  const current = cellEMF / totalResistance
  const voltage = cellEMF - current * internalResistance
  
  const startMeasurement = () => {
    setIsMeasuring(true)
    setDataPoints([])
    setLoadResistance(50) // Start with high resistance
  }
  
  const addDataPoint = () => {
    const newPoint: DataPoint = {
      voltage,
      current,
      resistance: loadResistance
    }
    setDataPoints(prev => [...prev, newPoint])
  }
  
  const completeMeasurement = () => {
    if (dataPoints.length > 0) {
      setTrials(prev => [...prev, {
        emf: cellEMF,
        internalResistance,
        dataPoints: [...dataPoints]
      }].slice(-3))
    }
    setIsMeasuring(false)
  }
  
  const autoSweep = () => {
    setIsMeasuring(true)
    setDataPoints([])
    
    // Automatically sweep through resistance values
    const resistances = [50, 40, 30, 20, 15, 10, 8, 6, 4, 2, 1]
    const points: DataPoint[] = []
    
    resistances.forEach(r => {
      const totalR = r + internalResistance
      const current = cellEMF / totalR
      const voltage = cellEMF - current * internalResistance
      
      points.push({
        voltage,
        current,
        resistance: r
      })
    })
    
    setDataPoints(points)
    setTrials(prev => [...prev, {
      emf: cellEMF,
      internalResistance,
      dataPoints: points
    }].slice(-3))
  }
  
  const reset = () => {
    setLoadResistance(10)
    setDataPoints([])
    setIsMeasuring(false)
  }
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Cell EMF: {cellEMF.toFixed(2)} V</Badge>
        <Badge variant="outline">Internal R: {internalResistance.toFixed(2)} Ω</Badge>
        <Badge variant="outline">Load R: {loadResistance.toFixed(1)} Ω</Badge>
        <Badge variant="outline">Current: {(current * 1000).toFixed(1)} mA</Badge>
        <Badge variant="outline">Voltage: {voltage.toFixed(3)} V</Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Determine EMF and internal resistance from V-I characteristics.
        Plot terminal voltage vs load current and extrapolate to find EMF (intercept)
        and internal resistance (slope). Formula: V = E - Ir
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Load Resistance</div>
          <div className="text-lg font-semibold text-blue-500">{loadResistance.toFixed(1)} Ω</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Current</div>
          <div className="text-lg font-semibold text-green-500">{(current * 1000).toFixed(1)} mA</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Terminal Voltage</div>
          <div className="text-lg font-semibold text-amber-500">{voltage.toFixed(3)} V</div>
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
          Load Control
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Load Resistance</span>
              <span className="font-medium">{loadResistance.toFixed(1)} Ω</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="0.5"
              value={loadResistance}
              onChange={(e) => setLoadResistance(Number(e.target.value))}
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
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-muted-foreground">R (Ω)</div>
            <div className="text-muted-foreground">I (mA)</div>
            <div className="text-muted-foreground">V (V)</div>
            <div className="text-muted-foreground">P (mW)</div>
            {dataPoints.slice(-5).map((point, i) => (
              <div key={i} className="contents">
                <div>{point.resistance.toFixed(1)}</div>
                <div>{(point.current * 1000).toFixed(1)}</div>
                <div>{point.voltage.toFixed(3)}</div>
                <div>{(point.voltage * point.current * 1000).toFixed(1)}</div>
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
                <div>Points: {trial.dataPoints.length} | EMF: {trial.emf.toFixed(2)}V | r: {trial.internalResistance.toFixed(2)}Ω</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [4, 4, 5], fov: 50 }} shadows>
          <Scene 
            emf={cellEMF}
            internalResistance={internalResistance}
            loadResistance={loadResistance}
            current={current}
            voltage={voltage}
            dataPoints={dataPoints}
          />
        </Canvas>
      </div>
    </div>
  )
}
