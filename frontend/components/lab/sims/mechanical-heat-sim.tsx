"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Zap, Thermometer, Timer } from "lucide-react"
import * as THREE from "three"

type Props = {
  voltage: number // Volts
  current: number // Amperes
  time: number // seconds
  waterMass: number // kg
}

type Trial = {
  voltage: number
  current: number
  time: number
  temperatureRise: number
  mechanicalEquivalence: number
}

// Electric heating element
function HeatingElement({ 
  isHeating, 
  temperature 
}: { 
  isHeating: boolean; 
  temperature: number; 
}) {
  const elementRef = useRef<THREE.Mesh>(null)
  const glowIntensity = useRef(0)
  
  useFrame(() => {
    if (elementRef.current) {
      // Pulsing glow effect when heating
      if (isHeating) {
        glowIntensity.current = Math.sin(Date.now() * 0.003) * 0.3 + 0.7
      } else {
        glowIntensity.current *= 0.95 // Fade out when not heating
      }
      
      // Update material emissive based on temperature
      const material = elementRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = glowIntensity.current * (temperature / 100)
    }
  })
  
  return (
    <group position={[0, 0.5, 0]}>
      {/* Heating coil */}
      <mesh ref={elementRef}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 32]} />
        <meshStandardMaterial 
          color="#ff6b35"
          metalness={0.8}
          roughness={0.2}
          emissive="#ff4500"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Coil windings */}
      {Array.from({ length: 8 }).map((_, i) => {
        const y = -0.35 + i * 0.1
        return (
          <mesh key={i} position={[0, y, 0]}>
            <torusGeometry args={[0.12, 0.02, 8, 16]} />
            <meshStandardMaterial 
              color="#ff8c42"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        )
      })}
      
      {/* Electrical terminals */}
      <mesh position={[-0.2, 0.4, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      <mesh position={[0.2, 0.4, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
    </group>
  )
}

// Water container with realistic water
function WaterContainer({ 
  waterLevel, 
  temperature, 
  isHeating 
}: { 
  waterLevel: number; 
  temperature: number; 
  isHeating: boolean; 
}) {
  const waterRef = useRef<THREE.Mesh>(null)
  const bubbleRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (waterRef.current && isHeating) {
      // Gentle water movement when heating
      waterRef.current.position.x = Math.sin(Date.now() * 0.001) * 0.01
      waterRef.current.position.z = Math.cos(Date.now() * 0.001) * 0.01
    }
    
    // Animate bubbles when heating
    if (bubbleRef.current && isHeating && Math.random() < 0.1) {
      const bubble = new THREE.Mesh(
        new THREE.SphereGeometry(0.01, 8, 8),
        new THREE.MeshBasicMaterial({ color: "#ffffff", opacity: 0.6, transparent: true })
      )
      bubble.position.set(
        (Math.random() - 0.5) * 0.3,
        -0.2,
        (Math.random() - 0.5) * 0.3
      )
      bubbleRef.current.add(bubble)
      
      // Remove bubble after it rises
      setTimeout(() => {
        if (bubbleRef.current) {
          bubbleRef.current.remove(bubble)
        }
      }, 2000)
    }
  })
  
  // Water color changes with temperature
  const waterColor = new THREE.Color()
  waterColor.setHSL(0.6, 0.7, 0.3 + temperature / 200) // Blue to lighter blue with heat
  
  return (
    <group position={[0, 0, 0]}>
      {/* Glass container */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 1.2, 32]} />
        <meshPhysicalMaterial 
          color="#e8f4f8"
          metalness={0}
          roughness={0.05}
          transmission={0.9}
          thickness={0.05}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Water */}
      <mesh ref={waterRef} position={[0, -0.6 + waterLevel / 2, 0]}>
        <cylinderGeometry args={[0.35, 0.35, waterLevel, 32]} />
        <meshPhysicalMaterial 
          color={waterColor}
          metalness={0}
          roughness={0.1}
          transmission={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Bubble container */}
      <group ref={bubbleRef} />
      
      {/* Container base */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.1, 32]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.3} />
      </mesh>
      
      {/* Temperature scale */}
      {Array.from({ length: 11 }).map((_, i) => {
        const y = -0.5 + i * 0.1
        const temp = i * 10
        return (
          <group key={i}>
            <mesh position={[0.42, y, 0]}>
              <boxGeometry args={[0.02, 0.01, 0.01]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            <Text position={[0.55, y, 0]} fontSize={0.03} color="#1e293b" anchorX="left">
              {temp}°C
            </Text>
          </group>
        )
      })}
    </group>
  )
}

// Power meter display
function PowerMeter({ voltage, current, power }: { voltage: number; current: number; power: number }) {
  return (
    <group position={[-2, 2, 0]}>
      <mesh>
        <boxGeometry args={[1.5, 0.8, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[1.3, 0.6]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      
      <Text position={[0, 0.15, 0.07]} fontSize={0.08} color="#22c55e" anchorX="center">
        {power.toFixed(1)} W
      </Text>
      <Text position={[-0.3, -0.05, 0.07]} fontSize={0.05} color="#94a3b8" anchorX="left">
        V: {voltage.toFixed(1)}V
      </Text>
      <Text position={[0.3, -0.05, 0.07]} fontSize={0.05} color="#94a3b8" anchorX="left">
        I: {current.toFixed(2)}A
      </Text>
      <Text position={[0, -0.15, 0.07]} fontSize={0.04} color="#64748b" anchorX="center">
        POWER METER
      </Text>
    </group>
  )
}

// Thermometer
function Thermometer3D({ temperature }: { temperature: number }) {
  const mercuryRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (mercuryRef.current) {
      // Mercury rises with temperature
      const height = 0.3 + (temperature / 100) * 0.5
      mercuryRef.current.scale.y = height
      mercuryRef.current.position.y = -0.2 + height / 2
    }
  })
  
  return (
    <group position={[2, 0, 0]}>
      {/* Thermometer tube */}
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
        <meshPhysicalMaterial 
          color="#e8f4f8"
          metalness={0}
          roughness={0.1}
          transmission={0.8}
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Mercury */}
      <mesh ref={mercuryRef} position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 16]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      
      {/* Bulb */}
      <mesh position={[0, -0.55, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      
      {/* Temperature display */}
      <Text position={[0.15, 0.2, 0]} fontSize={0.06} color="#1e293b" anchorX="left">
        {temperature.toFixed(1)}°C
      </Text>
      <Text position={[0.15, 0.1, 0]} fontSize={0.04} color="#64748b" anchorX="left">
        TEMP
      </Text>
    </group>
  )
}

function Scene({ 
  voltage,
  current,
  temperature,
  waterLevel,
  isHeating,
  power
}: {
  voltage: number;
  current: number;
  temperature: number;
  waterLevel: number;
  isHeating: boolean;
  power: number;
}) {
  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 3]} intensity={1} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[0, 4, 2]} intensity={0.5} color="#fbbf24" />
      
      {/* Lab bench */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.7, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.9} />
      </mesh>
      
      <WaterContainer 
        waterLevel={waterLevel}
        temperature={temperature}
        isHeating={isHeating}
      />
      <HeatingElement 
        isHeating={isHeating}
        temperature={temperature}
      />
      <PowerMeter voltage={voltage} current={current} power={power} />
      <Thermometer3D temperature={temperature} />
      
      {/* Instructions */}
      <Text position={[0, 3.5, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        Mechanical Equivalent of Heat: Electrical Energy → Thermal Energy
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

export function MechanicalHeatSim({ 
  voltage: initialVoltage = 12, 
  current: initialCurrent = 2, 
  time: initialTime = 300,
  waterMass: initialWaterMass = 0.5
}: Props) {
  const [voltage, setVoltage] = useState(initialVoltage)
  const [current, setCurrent] = useState(initialCurrent)
  const [time, setTime] = useState(initialTime)
  const [waterMass, setWaterMass] = useState(initialWaterMass)
  
  const [trials, setTrials] = useState<Trial[]>([])
  const [isHeating, setIsHeating] = useState(false)
  const [temperature, setTemperature] = useState(20) // Starting at room temperature
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  
  const waterLevel = 0.6 // Fixed water level in container
  const power = voltage * current
  
  // Calculate mechanical equivalent of heat (J)
  const calculateMechanicalEquivalent = (tempRise: number): number => {
    // J = Electrical Energy / Heat Energy
    // Electrical Energy = V × I × t (Joules)
    // Heat Energy = m × c × ΔT (Joules), where c = 4186 J/(kg·°C) for water
    const electricalEnergy = voltage * current * time
    const heatEnergy = waterMass * 4186 * tempRise
    return electricalEnergy / heatEnergy
  }
  
  const startHeating = () => {
    setIsHeating(true)
    setStartTime(Date.now())
    setElapsedTime(0)
  }
  
  const stopHeating = () => {
    if (isHeating && startTime) {
      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000
      setElapsedTime(duration)
      setIsHeating(false)
      
      const tempRise = temperature - 20
      const mechanicalEquivalent = calculateMechanicalEquivalent(tempRise)
      
      setTrials(prev => [...prev, {
        voltage,
        current,
        time: Number(duration.toFixed(1)),
        temperatureRise: Number(tempRise.toFixed(2)),
        mechanicalEquivalent: Number(mechanicalEquivalent.toFixed(2))
      }].slice(-5))
    }
  }
  
  const reset = () => {
    setIsHeating(false)
    setTemperature(20)
    setElapsedTime(0)
    setStartTime(null)
  }
  
  // Update temperature during heating
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isHeating) {
      interval = setInterval(() => {
        setTemperature(prev => {
          // Temperature rise based on power and water mass
          const tempRiseRate = (power * 0.8) / (waterMass * 4186) // Simplified heating
          const newTemp = prev + tempRiseRate
          return Math.min(newTemp, 100) // Max 100°C
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isHeating, power, waterMass])
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Voltage: {voltage.toFixed(1)} V</Badge>
        <Badge variant="outline">Current: {current.toFixed(2)} A</Badge>
        <Badge variant="outline">Power: {power.toFixed(1)} W</Badge>
        <Badge variant="outline">Water Mass: {waterMass.toFixed(2)} kg</Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Convert electrical energy to thermal energy and calculate the mechanical equivalent of heat (J).
        Electrical energy = V × I × t, Heat energy = m × c × ΔT
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Temperature</div>
          <div className="text-lg font-semibold text-red-500">{temperature.toFixed(1)}°C</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Time Elapsed</div>
          <div className="text-lg font-semibold text-blue-400">{elapsedTime.toFixed(1)} s</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">J Value</div>
          <div className="text-lg font-semibold text-green-500">
            {trials.length > 0 ? trials[trials.length - 1].mechanicalEquivalent : "--"}
          </div>
        </div>
      </div>
      
      {/* Parameter Controls */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Zap className="w-4 h-4" />
          Electrical Parameters
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Voltage</span>
              <span className="font-medium">{voltage.toFixed(1)} V</span>
            </div>
            <input
              type="range"
              min="6"
              max="24"
              step="0.5"
              value={voltage}
              onChange={(e) => setVoltage(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              disabled={isHeating}
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Current</span>
              <span className="font-medium">{current.toFixed(2)} A</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={current}
              onChange={(e) => setCurrent(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              disabled={isHeating}
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Water Mass</span>
              <span className="font-medium">{waterMass.toFixed(2)} kg</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={waterMass}
              onChange={(e) => setWaterMass(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              disabled={isHeating}
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={startHeating}
          disabled={isHeating}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          Start Heating
        </Button>
        <Button 
          onClick={stopHeating}
          disabled={!isHeating}
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
      
      {/* Trials */}
      {trials.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs font-medium mb-2">Experimental Data:</div>
          <div className="grid grid-cols-6 gap-2 text-xs">
            <div className="text-muted-foreground">V (V)</div>
            <div className="text-muted-foreground">I (A)</div>
            <div className="text-muted-foreground">t (s)</div>
            <div className="text-muted-foreground">ΔT (°C)</div>
            <div className="text-muted-foreground">J Value</div>
            <div className="text-muted-foreground">Error (%)</div>
            {trials.map((t, i) => (
              <div key={i} className="contents">
                <div>{t.voltage.toFixed(1)}</div>
                <div>{t.current.toFixed(2)}</div>
                <div>{t.time.toFixed(1)}</div>
                <div>{t.temperatureRise.toFixed(2)}</div>
                <div className="text-green-500">{t.mechanicalEquivalent}</div>
                <div className="text-amber-500">
                  {Math.abs((t.mechanicalEquivalent - 4.186) / 4.186 * 100).toFixed(1)}%
                </div>
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
            temperature={temperature}
            waterLevel={waterLevel}
            isHeating={isHeating}
            power={power}
          />
        </Canvas>
      </div>
    </div>
  )
}
