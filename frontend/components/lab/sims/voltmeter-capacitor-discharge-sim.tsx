"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Zap, Timer } from "lucide-react"
import * as THREE from "three"

type Props = {
  capacitance: number // Farads
  initialVoltage: number // Volts
}

type DataPoint = {
  time: number
  voltage: number
  resistance: number
}

type Trial = {
  capacitance: number
  initialVoltage: number
  measuredResistance: number
  dataPoints: DataPoint[]
}

// Capacitor with discharge visualization
function Capacitor({ 
  chargeLevel, 
  isDischarging, 
  capacitance 
}: { 
  chargeLevel: number; 
  isDischarging: boolean; 
  capacitance: number; 
}) {
  const chargeRef = useRef<THREE.Group>(null)
  const energyFieldRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (chargeRef.current) {
      // Animate charge dissipation
      chargeRef.current.children.forEach((plate, index) => {
        if (plate instanceof THREE.Mesh) {
          const material = plate.material as THREE.MeshStandardMaterial
          material.emissiveIntensity = chargeLevel * (index === 0 ? 0.8 : 0.3)
        }
      })
    }
    
    if (energyFieldRef.current) {
      // Energy field visualization
      const material = energyFieldRef.current.material as THREE.MeshStandardMaterial
      material.opacity = chargeLevel * 0.3
      if (isDischarging) {
        material.emissiveIntensity = chargeLevel * 0.3
      }
    }
  })
  
  return (
    <group position={[0, 0.5, 0]}>
      {/* Capacitor plates */}
      <group ref={chargeRef}>
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
      <mesh ref={energyFieldRef} position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.7, 0.5]} />
        <meshStandardMaterial 
          color="#ffff00"
          transparent
          opacity={0}
          emissive="#ffff00"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Charge particles (decreasing during discharge) */}
      {Array.from({ length: Math.floor(chargeLevel * 15) }).map((_, i) => {
        const side = i % 2 === 0 ? -1 : 1
        const y = -0.3 + (i / 15) * 0.6
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
      
      {/* Capacitor label */}
      <Text position={[0, 0.5, 0.4]} fontSize={0.06} color="#1e293b" anchorX="center">
        {(capacitance * 1000).toFixed(1)} μF
      </Text>
    </group>
  )
}

// Voltmeter with high resistance
function HighResistanceVoltmeter({ 
  voltage, 
  resistance 
}: { 
  voltage: number; 
  resistance: number; 
}) {
  const needleRef = useRef<THREE.Mesh>(null)
  const displayRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (needleRef.current) {
      // Animate needle based on voltage
      const maxAngle = Math.PI / 3
      const angle = (voltage / 12) * maxAngle // Assuming 12V max scale
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
      {Array.from({ length: 13 }).map((_, i) => {
        const angle = -Math.PI/3 + (i / 12) * (2 * Math.PI/3)
        const x = Math.sin(angle) * 0.28
        const y = Math.cos(angle) * 0.28
        const voltageValue = (i / 12) * 12
        return (
          <group key={i}>
            <mesh position={[x, y + 0.1, 0.17]}>
              <boxGeometry args={[i % 3 === 0 ? 0.02 : 0.01, 0.02, 0.001]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            {i % 3 === 0 && (
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
        {voltage.toFixed(3)}V
      </Text>
      
      <Text position={[0, -0.25, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        VOLTMETER
      </Text>
      <Text position={[0, -0.30, 0]} fontSize={0.03} color="#94a3b8" anchorX="center">
        R = {resistance.toFixed(0)} Ω
      </Text>
    </group>
  )
}

// Switch for discharge control
function DischargeSwitch({ 
  isClosed, 
  onToggle 
}: { 
  isClosed: boolean; 
  onToggle: () => void; 
}) {
  const switchRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (switchRef.current) {
      // Animate switch position
      const targetRotation = isClosed ? 0 : -Math.PI / 4
      switchRef.current.rotation.z = THREE.MathUtils.lerp(
        switchRef.current.rotation.z, 
        targetRotation, 
        0.1
      )
    }
  })
  
  return (
    <group position={[-2, 0.5, 0]}>
      {/* Switch base */}
      <mesh position={[-0.1, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      <mesh position={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      
      {/* Switch arm */}
      <mesh 
        ref={switchRef} 
        position={[-0.1, 0, 0]} 
        onClick={onToggle}
      >
        <boxGeometry args={[0.2, 0.02, 0.02]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
      </mesh>
      
      <Text position={[0, -0.1, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        {isClosed ? "DISCHARGING" : "OPEN"}
      </Text>
    </group>
  )
}

// Charging circuit
function ChargingCircuit({ 
  isCharging, 
  targetVoltage 
}: { 
  isCharging: boolean; 
  targetVoltage: number; 
}) {
  const powerRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (powerRef.current) {
      const material = powerRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = isCharging ? 0.5 : 0.1
    }
  })
  
  return (
    <group position={[-2, -0.8, 0]}>
      {/* Power supply */}
      <mesh ref={powerRef} castShadow>
        <boxGeometry args={[0.6, 0.4, 0.3]} />
        <meshStandardMaterial 
          color="#34495e" 
          metalness={0.3}
          emissive="#ff6b35"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <Text position={[0, 0, 0.16]} fontSize={0.05} color="#ff6b35" anchorX="center">
        {targetVoltage}V
      </Text>
      
      <Text position={[0, -0.3, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        CHARGER
      </Text>
    </group>
  )
}

// Connection wires with current flow
function DischargeWires({ 
  isDischarging, 
  current 
}: { 
  isDischarging: boolean; 
  current: number; 
}) {
  const wireRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (wireRef.current && isDischarging && current > 0) {
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
      {/* Top wire to voltmeter */}
      <mesh position={[1, 0.5, 0]}>
        <boxGeometry args={[2, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Bottom wire from voltmeter */}
      <mesh position={[1, 0.2, 0]}>
        <boxGeometry args={[2, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Left wire to switch */}
      <mesh position={[-1, 0.5, 0]}>
        <boxGeometry args={[1, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Bottom wire from switch */}
      <mesh position={[-1, 0.2, 0]}>
        <boxGeometry args={[1, 0.02, 0.02]} />
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

// Graph display for discharge curve
function DischargeGraph({ 
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
      
      {/* Exponential discharge curve */}
      {dataPoints.length > 1 && (
        <>
          {dataPoints.map((point, i) => {
            const x = (point.time / 60) * 0.7 - 0.7 // Scale to 60 seconds
            const y = (point.voltage / 12) * 0.3 - 0.3 // Scale to 12V
            return (
              <mesh key={i} position={[x, y, 0.07]}>
                <sphereGeometry args={[0.015, 8, 8]} />
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
        DISCHARGE CURVE
      </Text>
    </group>
  )
}

function Scene({ 
  capacitance,
  initialVoltage,
  currentVoltage,
  isDischarging,
  current,
  dataPoints,
  measuredResistance
}: {
  capacitance: number;
  initialVoltage: number;
  currentVoltage: number;
  isDischarging: boolean;
  current: number;
  dataPoints: DataPoint[];
  measuredResistance: number;
}) {
  const chargeLevel = currentVoltage / initialVoltage
  const voltmeterResistance = 50000 // 50kΩ typical voltmeter resistance
  
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
      
      <Capacitor 
        chargeLevel={chargeLevel}
        isDischarging={isDischarging}
        capacitance={capacitance}
      />
      <HighResistanceVoltmeter 
        voltage={currentVoltage}
        resistance={voltmeterResistance}
      />
      <DischargeSwitch isClosed={isDischarging} onToggle={() => {}} />
      <ChargingCircuit 
        isCharging={!isDischarging && currentVoltage < initialVoltage}
        targetVoltage={initialVoltage}
      />
      <DischargeWires isDischarging={isDischarging} current={current} />
      <DischargeGraph 
        dataPoints={dataPoints}
        measuredResistance={measuredResistance}
      />
      
      {/* Instructions */}
      <Text position={[0, 3.5, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        Voltmeter Resistance: R = -t / (C × ln(V/V₀))
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

export function VoltmeterCapacitorDischargeSim({ 
  capacitance: initialCapacitance = 0.001, 
  initialVoltage: propInitialVoltage = 12
}: Props) {
  const [capacitance, setCapacitance] = useState(initialCapacitance)
  const [initialVoltage] = useState(propInitialVoltage)
  const [currentVoltage, setCurrentVoltage] = useState(propInitialVoltage)
  
  const [trials, setTrials] = useState<Trial[]>([])
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([])
  const [isDischarging, setIsDischarging] = useState(false)
  const [time, setTime] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  
  const voltmeterResistance = 50000 // 50kΩ
  const timeConstant = voltmeterResistance * capacitance
  const current = currentVoltage / voltmeterResistance
  
  // Calculate voltage during discharge
  const calculateVoltage = (t: number): number => {
    return initialVoltage * Math.exp(-t / timeConstant)
  }
  
  // Calculate resistance from discharge data
  const calculateResistance = (t: number, v: number, v0: number, c: number): number => {
    if (v <= 0 || v >= v0) return 0
    return -t / (c * Math.log(v / v0))
  }
  
  const startDischarge = () => {
    setIsDischarging(true)
    setStartTime(Date.now())
    setTime(0)
    setDataPoints([])
  }
  
  const stopDischarge = () => {
    if (isDischarging && startTime) {
      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000
      setTime(duration)
      setIsDischarging(false)
      
      // Calculate resistance from discharge data
      const measuredResistance = calculateResistance(duration, currentVoltage, initialVoltage, capacitance)
      
      setTrials(prev => [...prev, {
        capacitance,
        initialVoltage,
        measuredResistance,
        dataPoints: [...dataPoints]
      }].slice(-3))
    }
  }
  
  const reset = () => {
    setIsDischarging(false)
    setCurrentVoltage(initialVoltage)
    setTime(0)
    setStartTime(null)
    setDataPoints([])
  }
  
  // Update discharge simulation
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isDischarging && startTime) {
      interval = setInterval(() => {
        const currentTime = (Date.now() - startTime) / 1000
        setTime(currentTime)
        
        const newVoltage = calculateVoltage(currentTime)
        setCurrentVoltage(newVoltage)
        
        // Add data point every 2 seconds
        if (Math.floor(currentTime) % 2 === 0 && currentTime > 0) {
          const lastPoint = dataPoints[dataPoints.length - 1]
          if (!lastPoint || Math.abs(currentTime - lastPoint.time) >= 2) {
            const resistance = calculateResistance(currentTime, newVoltage, initialVoltage, capacitance)
            setDataPoints(prev => [...prev, {
              time: currentTime,
              voltage: newVoltage,
              resistance
            }])
          }
        }
        
        // Stop when voltage is very low
        if (newVoltage <= 0.1) {
          setIsDischarging(false)
          stopDischarge()
        }
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isDischarging, startTime, timeConstant, initialVoltage, capacitance])
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Capacitance: {(capacitance * 1000).toFixed(1)} μF</Badge>
        <Badge variant="outline">Initial V: {initialVoltage.toFixed(1)} V</Badge>
        <Badge variant="outline">Current V: {currentVoltage.toFixed(3)} V</Badge>
        <Badge variant="outline">Time Constant: {timeConstant.toFixed(1)} s</Badge>
        <Badge variant={isDischarging ? "default" : "secondary"}>
          {isDischarging ? "Discharging" : "Ready"}
        </Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Measure voltmeter resistance using capacitor discharge method.
        Charge capacitor, then discharge through voltmeter and measure V vs t.
        Formula: R = -t / (C × ln(V/V₀))
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Voltage</div>
          <div className="text-lg font-semibold text-blue-500">{currentVoltage.toFixed(3)} V</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Time</div>
          <div className="text-lg font-semibold text-green-500">{time.toFixed(1)} s</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Current</div>
          <div className="text-lg font-semibold text-amber-500">{(current * 1000).toFixed(3)} mA</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Charge Level</div>
          <div className="text-lg font-semibold text-purple-500">{((currentVoltage / initialVoltage) * 100).toFixed(1)}%</div>
        </div>
      </div>
      
      {/* Parameter Controls */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Zap className="w-4 h-4" />
          Circuit Parameters
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Capacitance</span>
              <span className="font-medium">{(capacitance * 1000).toFixed(1)} μF</span>
            </div>
            <input
              type="range"
              min="0.0001"
              max="0.01"
              step="0.0001"
              value={capacitance}
              onChange={(e) => setCapacitance(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              disabled={isDischarging}
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={startDischarge}
          disabled={isDischarging || currentVoltage < initialVoltage * 0.95}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          Start Discharge
        </Button>
        <Button 
          onClick={stopDischarge}
          disabled={!isDischarging}
          variant="outline"
          className="gap-2"
        >
          <Timer className="w-4 h-4" />
          Stop & Record
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      {/* Current data points */}
      {dataPoints.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs font-medium mb-2">Discharge Data:</div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-muted-foreground">t (s)</div>
            <div className="text-muted-foreground">V (V)</div>
            <div className="text-muted-foreground">R (kΩ)</div>
            <div className="text-muted-foreground">V/V₀</div>
            {dataPoints.slice(-5).map((point, i) => (
              <div key={i} className="contents">
                <div>{point.time.toFixed(1)}</div>
                <div>{point.voltage.toFixed(3)}</div>
                <div className="text-green-500">{(point.resistance / 1000).toFixed(1)}</div>
                <div>{(point.voltage / initialVoltage).toFixed(3)}</div>
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
                <div>C: {(trial.capacitance * 1000).toFixed(1)} μF | R_meter: {(trial.measuredResistance / 1000).toFixed(1)} kΩ</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [4, 4, 5], fov: 50 }} shadows>
          <Scene 
            capacitance={capacitance}
            initialVoltage={initialVoltage}
            currentVoltage={currentVoltage}
            isDischarging={isDischarging}
            current={current}
            dataPoints={dataPoints}
            measuredResistance={trials.length > 0 ? trials[trials.length - 1].measuredResistance : voltmeterResistance}
          />
        </Canvas>
      </div>
    </div>
  )
}
