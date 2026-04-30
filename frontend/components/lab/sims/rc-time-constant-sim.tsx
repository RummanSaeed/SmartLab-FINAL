"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html, Line } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Zap, Timer, Battery } from "lucide-react"
import * as THREE from "three"

type Props = {
  resistance: number // Ohms
  capacitance: number // Farads
  voltage: number // Volts
}

type Trial = {
  resistance: number
  capacitance: number
  timeConstant: number
  measuredTimeConstant: number
  error: number
}

// Capacitor with realistic charge visualization
function Capacitor({ 
  chargeLevel, 
  isCharging, 
  capacitance 
}: { 
  chargeLevel: number; 
  isCharging: boolean; 
  capacitance: number; 
}) {
  const chargeRef = useRef<THREE.Group>(null)
  const energyRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (chargeRef.current) {
      // Animate charge accumulation
      const intensity = chargeLevel
      chargeRef.current.children.forEach((plate, index) => {
        if (plate instanceof THREE.Mesh) {
          const material = plate.material as THREE.MeshStandardMaterial
          material.emissiveIntensity = intensity * (index === 0 ? 0.8 : 0.3)
        }
      })
    }
    
    if (energyRef.current) {
      // Energy field visualization
      const material = energyRef.current.material as THREE.MeshStandardMaterial
      material.opacity = chargeLevel * 0.3
      if (isCharging) {
        material.emissiveIntensity = chargeLevel * 0.5
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
      <mesh ref={energyRef} position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.7, 0.5]} />
        <meshStandardMaterial 
          color="#ffff00"
          transparent
          opacity={0}
          emissive="#ffff00"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Charge particles */}
      {Array.from({ length: Math.floor(chargeLevel * 10) }).map((_, i) => {
        const side = i % 2 === 0 ? -1 : 1
        const y = -0.3 + (i / 10) * 0.6
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
        {capacitance * 1000} μF
      </Text>
    </group>
  )
}

// Resistor with color bands
function Resistor({ 
  resistance, 
  current 
}: { 
  resistance: number; 
  current: number; 
}) {
  const resistorRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (resistorRef.current && current > 0) {
      // Heat glow when current flows
      const material = resistorRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = Math.min(current * 2, 0.8)
    }
  })
  
  // Color bands for resistance value
  const getColorBands = (resistance: number) => {
    const colors = ["#000000", "#8B4513", "#FF0000", "#FFA500", "#FFFF00", "#00FF00", "#0000FF", "#8B008B", "#808080", "#FFFFFF"]
    const value = Math.floor(resistance / 100)
    const firstDigit = Math.floor(value / 10)
    const secondDigit = value % 10
    const multiplier = Math.floor(Math.log10(resistance))
    
    return [
      colors[firstDigit] || "#000000",
      colors[secondDigit] || "#000000",
      colors[multiplier] || "#000000",
      "#FFD700" // Gold (5% tolerance)
    ]
  }
  
  const colorBands = getColorBands(resistance)
  
  return (
    <group position={[1.5, 0.5, 0]}>
      {/* Resistor body */}
      <mesh ref={resistorRef} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial 
          color="#D2691E"
          metalness={0.1}
          roughness={0.8}
          emissive="#ff6600"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Color bands */}
      {colorBands.map((color, i) => {
        const x = -0.2 + i * 0.13
        return (
          <mesh key={i} position={[x, 0, 0.081]}>
            <cylinderGeometry args={[0.081, 0.081, 0.02, 16]} rotation={[0, Math.PI/2, 0]} />
            <meshStandardMaterial color={color} />
          </mesh>
        )
      })}
      
      {/* Connection wires */}
      <mesh position={[-0.35, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      <mesh position={[0.35, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      
      {/* Resistance label */}
      <Text position={[0, 0.15, 0]} fontSize={0.05} color="#1e293b" anchorX="center">
        {resistance} Ω
      </Text>
    </group>
  )
}

// Switch
function Switch({ 
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
      const targetRotation = isClosed ? 0 : -Math.PI / 6
      switchRef.current.rotation.z = THREE.MathUtils.lerp(
        switchRef.current.rotation.z, 
        targetRotation, 
        0.1
      )
    }
  })
  
  return (
    <group position={[-1.5, 0.5, 0]}>
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
        {isClosed ? "CLOSED" : "OPEN"}
      </Text>
    </group>
  )
}

// Power supply
function PowerSupplyRC({ voltage, isOn }: { voltage: number; isOn: boolean }) {
  const displayRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (displayRef.current) {
      const material = displayRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = isOn ? 0.5 : 0.1
    }
  })
  
  return (
    <group position={[-3, 0.5, 0]}>
      {/* Power supply body */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.6, 0.4]} />
        <meshStandardMaterial color="#34495e" metalness={0.3} />
      </mesh>
      
      {/* Display */}
      <mesh ref={displayRef} position={[0, 0.1, 0.21]}>
        <boxGeometry args={[0.6, 0.2, 0.02]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          emissive="#00ff00"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <Text position={[0, 0.1, 0.22]} fontSize={0.05} color="#00ff00" anchorX="center">
        {isOn ? `${voltage.toFixed(1)}V DC` : "OFF"}
      </Text>
      
      {/* Terminals */}
      <mesh position={[-0.2, -0.2, 0.21]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
        <meshStandardMaterial color="#ff0000" metalness={1} />
      </mesh>
      <mesh position={[0.2, -0.2, 0.21]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
        <meshStandardMaterial color="#000000" metalness={1} />
      </mesh>
      
      <Text position={[0, -0.4, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        DC SUPPLY
      </Text>
    </group>
  )
}

// Oscilloscope for voltage visualization
function Oscilloscope({ 
  voltage, 
  time, 
  isRunning 
}: { 
  voltage: number; 
  time: number; 
  isRunning: boolean; 
}) {
  const graphRef = useRef<THREE.Mesh>(null)
  const traceRef = useRef<THREE.Line>(null)
  
  useFrame(() => {
    if (graphRef.current && isRunning) {
      // Update trace
      const material = graphRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.3 + Math.random() * 0.1
    }
  })
  
  return (
    <group position={[0, 2, 0]}>
      {/* Oscilloscope body */}
      <mesh castShadow>
        <boxGeometry args={[1.5, 1, 0.6]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Screen */}
      <mesh ref={graphRef} position={[0, 0.1, 0.31]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial 
          color="#001100"
          emissive="#00ff00"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Grid lines */}
      {Array.from({ length: 11 }).map((_, i) => {
        const x = -0.55 + i * 0.11
        return (
          <mesh key={`v-${i}`} position={[x, 0.1, 0.32]}>
            <boxGeometry args={[0.005, 0.8, 0.001]} />
            <meshStandardMaterial color="#003300" />
          </mesh>
        )
      })}
      {Array.from({ length: 9 }).map((_, i) => {
        const y = -0.35 + i * 0.0875
        return (
          <mesh key={`h-${i}`} position={[0, y, 0.32]}>
            <boxGeometry args={[1.2, 0.005, 0.001]} />
            <meshStandardMaterial color="#003300" />
          </mesh>
        )
      })}
      
      {/* Voltage display */}
      <Text position={[0, 0.1, 0.33]} fontSize={0.06} color="#00ff00" anchorX="center">
        V = {voltage.toFixed(2)}V
      </Text>
      <Text position={[0, -0.35, 0.33]} fontSize={0.04} color="#00ff00" anchorX="center">
        t = {time.toFixed(2)}s
      </Text>
      
      <Text position={[0, -0.6, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        OSCILLOSCOPE
      </Text>
    </group>
  )
}

// Connection wires
function Wires({ isCharging }: { isCharging: boolean }) {
  const wireRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (wireRef.current && isCharging) {
      // Current flow animation
      wireRef.current.children.forEach((wire, index) => {
        if (wire instanceof THREE.Mesh) {
          const material = wire.material as THREE.MeshStandardMaterial
          material.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.005 + index) * 0.2
        }
      })
    }
  })
  
  const wirePath = [
    [-3, 0.5, 0], [-1.5, 0.5, 0], [-1.5, 0.5, 0],
    [0, 0.5, 0], [1.5, 0.5, 0], [1.5, 0.5, 0],
    [0, 0.5, 0], [-3, 0.5, 0]
  ]
  
  return (
    <group ref={wireRef}>
      {/* Simplified wire representation */}
      <Line
        points={wirePath.map(p => new THREE.Vector3(...p))}
        color="#c0c0c0"
        lineWidth={3}
      />
    </group>
  )
}

function Scene({ 
  resistance,
  capacitance,
  voltage,
  chargeLevel,
  current,
  isCharging,
  time,
  isSwitchClosed
}: {
  resistance: number;
  capacitance: number;
  voltage: number;
  chargeLevel: number;
  current: number;
  isCharging: boolean;
  time: number;
  isSwitchClosed: boolean;
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
      
      <PowerSupplyRC voltage={voltage} isOn={isSwitchClosed} />
      <Switch isClosed={isSwitchClosed} onToggle={() => {}} />
      <Capacitor 
        chargeLevel={chargeLevel}
        isCharging={isCharging}
        capacitance={capacitance}
      />
      <Resistor resistance={resistance} current={current} />
      <Oscilloscope 
        voltage={voltage * chargeLevel}
        time={time}
        isRunning={isCharging}
      />
      <Wires isCharging={isCharging} />
      
      {/* Instructions */}
      <Text position={[0, 3.5, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        RC Time Constant: τ = R × C
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

export function RCTimeConstantSim({ 
  resistance: initialResistance = 1000, 
  capacitance: initialCapacitance = 0.001, 
  voltage: initialVoltage = 12
}: Props) {
  const [resistance, setResistance] = useState(initialResistance)
  const [capacitance, setCapacitance] = useState(initialCapacitance)
  const [voltage, setVoltage] = useState(initialVoltage)
  
  const [trials, setTrials] = useState<Trial[]>([])
  const [isSwitchClosed, setIsSwitchClosed] = useState(false)
  const [chargeLevel, setChargeLevel] = useState(0) // 0 to 1
  const [current, setCurrent] = useState(0)
  const [time, setTime] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  
  const timeConstant = resistance * capacitance
  
  // Calculate charge level using RC charging equation
  const calculateChargeLevel = (t: number): number => {
    return 1 - Math.exp(-t / timeConstant)
  }
  
  // Calculate current at time t
  const calculateCurrent = (t: number): number => {
    return (voltage / resistance) * Math.exp(-t / timeConstant)
  }
  
  const toggleSwitch = () => {
    if (!isSwitchClosed) {
      // Start charging
      setIsSwitchClosed(true)
      setStartTime(Date.now())
      setTime(0)
    } else {
      // Stop charging
      setIsSwitchClosed(false)
      recordMeasurement()
    }
  }
  
  const recordMeasurement = () => {
    if (startTime) {
      const duration = (Date.now() - startTime) / 1000
      
      // Find time when charge reaches 63.2% (1 time constant)
      const measuredTimeConstant = duration * (0.632 / chargeLevel)
      const error = Math.abs((measuredTimeConstant - timeConstant) / timeConstant) * 100
      
      setTrials(prev => [...prev, {
        resistance,
        capacitance,
        timeConstant: Number(timeConstant.toFixed(6)),
        measuredTimeConstant: Number(measuredTimeConstant.toFixed(6)),
        error: Number(error.toFixed(1))
      }].slice(-5))
    }
  }
  
  const reset = () => {
    setIsSwitchClosed(false)
    setChargeLevel(0)
    setCurrent(0)
    setTime(0)
    setStartTime(null)
  }
  
  // Update charging simulation
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSwitchClosed && startTime) {
      interval = setInterval(() => {
        const currentTime = (Date.now() - startTime) / 1000
        setTime(currentTime)
        
        const newChargeLevel = calculateChargeLevel(currentTime)
        const newCurrent = calculateCurrent(currentTime)
        
        setChargeLevel(newChargeLevel)
        setCurrent(newCurrent)
        
        // Stop when fully charged (99.9%)
        if (newChargeLevel >= 0.999) {
          setIsSwitchClosed(false)
          recordMeasurement()
        }
      }, 50)
    }
    return () => clearInterval(interval)
  }, [isSwitchClosed, startTime, timeConstant, voltage, resistance])
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Resistance: {resistance} Ω</Badge>
        <Badge variant="outline">Capacitance: {(capacitance * 1000).toFixed(1)} μF</Badge>
        <Badge variant="outline">Voltage: {voltage.toFixed(1)} V</Badge>
        <Badge variant="outline">Time Constant (τ): {timeConstant.toFixed(3)} s</Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Measure RC time constant by observing capacitor charging. 
        One time constant is the time to reach 63.2% of final voltage.
        Formula: V(t) = V₀(1 - e^(-t/RC))
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Charge Level</div>
          <div className="text-lg font-semibold text-blue-500">{(chargeLevel * 100).toFixed(1)}%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Current</div>
          <div className="text-lg font-semibold text-green-500">{(current * 1000).toFixed(2)} mA</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Time</div>
          <div className="text-lg font-semibold text-amber-500">{time.toFixed(3)} s</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Capacitor Voltage</div>
          <div className="text-lg font-semibold text-purple-500">{(voltage * chargeLevel).toFixed(2)} V</div>
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
              <span className="text-muted-foreground">Resistance</span>
              <span className="font-medium">{resistance} Ω</span>
            </div>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={resistance}
              onChange={(e) => setResistance(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              disabled={isSwitchClosed}
            />
          </div>
          
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
              disabled={isSwitchClosed}
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Supply Voltage</span>
              <span className="font-medium">{voltage.toFixed(1)} V</span>
            </div>
            <input
              type="range"
              min="5"
              max="24"
              step="0.5"
              value={voltage}
              onChange={(e) => setVoltage(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              disabled={isSwitchClosed}
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={toggleSwitch}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          {isSwitchClosed ? "Stop Charging" : "Start Charging"}
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      {/* Trials */}
      {trials.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs font-medium mb-2">Experimental Data:</div>
          <div className="grid grid-cols-5 gap-2 text-xs">
            <div className="text-muted-foreground">R (Ω)</div>
            <div className="text-muted-foreground">C (μF)</div>
            <div className="text-muted-foreground">τ (s)</div>
            <div className="text-muted-foreground">Measured τ (s)</div>
            <div className="text-muted-foreground">Error (%)</div>
            {trials.map((t, i) => (
              <div key={i} className="contents">
                <div>{t.resistance}</div>
                <div>{(t.capacitance * 1000).toFixed(1)}</div>
                <div>{t.timeConstant}</div>
                <div className="text-green-500">{t.measuredTimeConstant}</div>
                <div className="text-amber-500">{t.error}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [4, 4, 5], fov: 50 }} shadows>
          <Scene 
            resistance={resistance}
            capacitance={capacitance}
            voltage={voltage}
            chargeLevel={chargeLevel}
            current={current}
            isCharging={isSwitchClosed}
            time={time}
            isSwitchClosed={isSwitchClosed}
          />
        </Canvas>
      </div>
    </div>
  )
}
