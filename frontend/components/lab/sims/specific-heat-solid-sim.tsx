"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Zap, Thermometer, Timer, Cube } from "lucide-react"
import * as THREE from "three"

type Props = {
  voltage: number // Volts
  current: number // Amperes
  solidMass: number // kg
  materialType: "aluminum" | "copper" | "iron"
}

type Trial = {
  voltage: number
  current: number
  time: number
  temperatureRise: number
  specificHeat: number
}

const MATERIAL_PROPERTIES = {
  aluminum: { color: "#c0c0c0", specificHeat: 900, density: 2700, name: "Aluminum" },
  copper: { color: "#b87333", specificHeat: 385, density: 8960, name: "Copper" },
  iron: { color: "#434343", specificHeat: 450, density: 7874, name: "Iron" }
}

// Solid metal block with heating coil
function SolidBlock({ 
  isHeating, 
  temperature, 
  materialType 
}: { 
  isHeating: boolean; 
  temperature: number; 
  materialType: "aluminum" | "copper" | "iron";
}) {
  const blockRef = useRef<THREE.Mesh>(null)
  const coilRef = useRef<THREE.Group>(null)
  const material = MATERIAL_PROPERTIES[materialType]
  
  useFrame(() => {
    if (blockRef.current) {
      // Subtle glow when heating
      const material = blockRef.current.material as THREE.MeshStandardMaterial
      if (isHeating) {
        material.emissiveIntensity = Math.min(temperature / 500, 0.3)
      } else {
        material.emissiveIntensity *= 0.98
      }
    }
    
    // Animate coil heating
    if (coilRef.current && isHeating) {
      coilRef.current.children.forEach((coil, index) => {
        if (coil instanceof THREE.Mesh) {
          const coilMaterial = coil.material as THREE.MeshStandardMaterial
          coilMaterial.emissiveIntensity = Math.sin(Date.now() * 0.005 + index) * 0.5 + 0.5
        }
      })
    }
  })
  
  return (
    <group position={[0, 0.5, 0]}>
      {/* Metal block */}
      <mesh ref={blockRef} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial 
          color={material.color}
          metalness={0.8}
          roughness={0.2}
          emissive={material.color}
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Heating coils embedded in block */}
      <group ref={coilRef}>
        {Array.from({ length: 3 }).map((_, i) => {
          const y = -0.2 + i * 0.2
          return (
            <group key={i} position={[0, y, 0]}>
              {/* Horizontal coils */}
              <mesh rotation={[0, Math.PI/2, 0]}>
                <torusGeometry args={[0.3, 0.02, 8, 16]} />
                <meshStandardMaterial 
                  color="#ff6b35"
                  metalness={0.9}
                  roughness={0.1}
                  emissive="#ff4500"
                  emissiveIntensity={0}
                />
              </mesh>
              {/* Vertical coils */}
              <mesh rotation={[Math.PI/2, 0, 0]}>
                <torusGeometry args={[0.3, 0.02, 8, 16]} />
                <meshStandardMaterial 
                  color="#ff6b35"
                  metalness={0.9}
                  roughness={0.1}
                  emissive="#ff4500"
                  emissiveIntensity={0}
                />
              </mesh>
            </group>
          )
        })}
      </group>
      
      {/* Electrical terminals */}
      <mesh position={[-0.5, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      <mesh position={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      
      {/* Material label */}
      <Text position={[0, 0.5, 0.5]} fontSize={0.06} color="#1e293b" anchorX="center">
        {material.name}
      </Text>
    </group>
  )
}

// Insulation container
function InsulationContainer({ isHeating }: { isHeating: boolean }) {
  const lidRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (lidRef.current && isHeating) {
      // Slight vibration when heating
      lidRef.current.position.y = 0.51 + Math.sin(Date.now() * 0.01) * 0.002
    }
  })
  
  return (
    <group position={[0, 0, 0]}>
      {/* Insulating container */}
      <mesh>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshPhysicalMaterial 
          color="#f5f5dc"
          metalness={0}
          roughness={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Inner cavity */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshBasicMaterial color="#000000" transparent opacity={0} />
      </mesh>
      
      {/* Removable lid */}
      <mesh ref={lidRef} position={[0, 0.51, 0]} castShadow>
        <boxGeometry args={[1.1, 0.05, 1.1]} />
        <meshStandardMaterial color="#8b7355" roughness={0.9} />
      </mesh>
      
      {/* Insulation texture lines */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 0.55
        const z = Math.sin(angle) * 0.55
        return (
          <mesh key={i} position={[x, 0, z]}>
            <cylinderGeometry args={[0.01, 0.01, 1.1, 8]} />
            <meshStandardMaterial color="#d2691e" roughness={0.8} />
          </mesh>
        )
      })}
    </group>
  )
}

// Digital thermometer probe
function ThermometerProbe({ temperature, isProbing }: { temperature: number; isProbing: boolean }) {
  const probeRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (probeRef.current && isProbing) {
      // Subtle probing animation
      probeRef.current.rotation.x = Math.sin(Date.now() * 0.002) * 0.1
    }
  })
  
  return (
    <group position={[1.5, 0.5, 0]}>
      {/* Probe handle */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Probe tip */}
      <mesh ref={probeRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.01, 0.3, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      
      {/* Digital display */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.15, 0.08, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0.5, 0.011]}>
        <planeGeometry args={[0.13, 0.06]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      <Text position={[0, 0.5, 0.02]} fontSize={0.04} color="#00ff00" anchorX="center">
        {temperature.toFixed(1)}°C
      </Text>
      
      <Text position={[0, 0.65, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        TEMP PROBE
      </Text>
    </group>
  )
}

// Power supply unit
function PowerSupply({ voltage, current, isOn }: { voltage: number; current: number; isOn: boolean }) {
  const displayRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (displayRef.current) {
      const material = displayRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = isOn ? 0.5 : 0.1
    }
  })
  
  return (
    <group position={[-2, 0.5, 0]}>
      {/* Power supply body */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.6, 0.4]} />
        <meshStandardMaterial color="#34495e" metalness={0.3} />
      </mesh>
      
      {/* Display panel */}
      <mesh ref={displayRef} position={[0, 0.1, 0.21]}>
        <boxGeometry args={[0.6, 0.2, 0.02]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          emissive="#00ff00"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Display text */}
      <Text position={[0, 0.1, 0.22]} fontSize={0.05} color="#00ff00" anchorX="center">
        {isOn ? `${voltage.toFixed(1)}V ${current.toFixed(2)}A` : "OFF"}
      </Text>
      
      {/* Control knobs */}
      <mesh position={[-0.2, -0.15, 0.21]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      <mesh position={[0.2, -0.15, 0.21]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      
      {/* Power LED */}
      <mesh position={[0.3, 0.2, 0.21]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial 
          color={isOn ? "#00ff00" : "#666666"}
          emissive={isOn ? "#00ff00" : "#000000"}
          emissiveIntensity={isOn ? 1 : 0}
        />
      </mesh>
      
      <Text position={[0, -0.4, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        POWER SUPPLY
      </Text>
    </group>
  )
}

// Data logger
function DataLogger({ 
  temperature, 
  time, 
  isLogging 
}: { 
  temperature: number; 
  time: number; 
  isLogging: boolean; 
}) {
  const screenRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (screenRef.current && isLogging) {
      // Flickering effect when logging
      const material = screenRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.3 + Math.random() * 0.1
    }
  })
  
  return (
    <group position={[0, 2, 0]}>
      {/* Logger body */}
      <mesh castShadow>
        <boxGeometry args={[1, 0.6, 0.3]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0.05, 0.16]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          emissive="#00ffff"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Graph on screen */}
      {isLogging && (
        <group position={[0, 0.05, 0.17]}>
          <Text position={[-0.3, 0.1, 0]} fontSize={0.03} color="#00ffff" anchorX="left">
            T: {temperature.toFixed(1)}°C
          </Text>
          <Text position={[-0.3, 0.05, 0]} fontSize={0.03} color="#00ffff" anchorX="left">
            t: {time.toFixed(1)}s
          </Text>
          <Text position={[-0.3, 0, 0]} fontSize={0.03} color="#00ffff" anchorX="left">
            LOGGING...
          </Text>
        </group>
      )}
      
      <Text position={[0, -0.4, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        DATA LOGGER
      </Text>
    </group>
  )
}

function Scene({ 
  voltage,
  current,
  temperature,
  materialType,
  isHeating,
  isLogging
}: {
  voltage: number;
  current: number;
  temperature: number;
  materialType: "aluminum" | "copper" | "iron";
  isHeating: boolean;
  isLogging: boolean;
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
      
      <InsulationContainer isHeating={isHeating} />
      <SolidBlock 
        isHeating={isHeating}
        temperature={temperature}
        materialType={materialType}
      />
      <ThermometerProbe temperature={temperature} isProbing={isHeating} />
      <PowerSupply voltage={voltage} current={current} isOn={isHeating} />
      <DataLogger 
        temperature={temperature}
        time={0}
        isLogging={isLogging}
      />
      
      {/* Instructions */}
      <Text position={[0, 3.5, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        Specific Heat of Solid: Measure temperature rise with electrical heating
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

export function SpecificHeatSolidSim({ 
  voltage: initialVoltage = 12, 
  current: initialCurrent = 2, 
  solidMass: initialSolidMass = 0.5,
  materialType: initialMaterialType = "aluminum"
}: Props) {
  const [voltage, setVoltage] = useState(initialVoltage)
  const [current, setCurrent] = useState(initialCurrent)
  const [solidMass, setSolidMass] = useState(initialSolidMass)
  const [materialType, setMaterialType] = useState(initialMaterialType)
  
  const [trials, setTrials] = useState<Trial[]>([])
  const [isHeating, setIsHeating] = useState(false)
  const [temperature, setTemperature] = useState(20) // Starting at room temperature
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  
  const material = MATERIAL_PROPERTIES[materialType]
  const power = voltage * current
  
  // Calculate specific heat capacity
  const calculateSpecificHeat = (tempRise: number, time: number): number => {
    // c = (V × I × t) / (m × ΔT)
    const electricalEnergy = voltage * current * time
    const specificHeat = electricalEnergy / (solidMass * tempRise)
    return specificHeat
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
      const specificHeat = calculateSpecificHeat(tempRise, duration)
      
      setTrials(prev => [...prev, {
        voltage,
        current,
        time: Number(duration.toFixed(1)),
        temperatureRise: Number(tempRise.toFixed(2)),
        specificHeat: Number(specificHeat.toFixed(1))
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
          // Temperature rise based on power, mass, and specific heat
          const tempRiseRate = (power * 0.7) / (solidMass * material.specificHeat)
          const newTemp = prev + tempRiseRate
          return Math.min(newTemp, 200) // Max 200°C
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isHeating, power, solidMass, material.specificHeat])
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Material: {material.name}</Badge>
        <Badge variant="outline">Voltage: {voltage.toFixed(1)} V</Badge>
        <Badge variant="outline">Current: {current.toFixed(2)} A</Badge>
        <Badge variant="outline">Power: {power.toFixed(1)} W</Badge>
        <Badge variant="outline">Mass: {solidMass.toFixed(2)} kg</Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Determine specific heat capacity of {material.name} using electrical heating.
        Formula: c = (V × I × t) / (m × ΔT). Theoretical value: {material.specificHeat} J/(kg·°C)
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
          <div className="text-xs text-muted-foreground">Specific Heat</div>
          <div className="text-lg font-semibold text-green-500">
            {trials.length > 0 ? trials[trials.length - 1].specificHeat : "--"}
          </div>
        </div>
      </div>
      
      {/* Parameter Controls */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Zap className="w-4 h-4" />
          Experimental Parameters
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Material</span>
              <span className="font-medium">{material.name}</span>
            </div>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value as "aluminum" | "copper" | "iron")}
              className="w-full h-8 bg-muted rounded border border-border/60 px-2 text-sm"
              disabled={isHeating}
            >
              <option value="aluminum">Aluminum (c = 900)</option>
              <option value="copper">Copper (c = 385)</option>
              <option value="iron">Iron (c = 450)</option>
            </select>
          </div>
          
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
              <span className="text-muted-foreground">Solid Mass</span>
              <span className="font-medium">{solidMass.toFixed(2)} kg</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.05"
              value={solidMass}
              onChange={(e) => setSolidMass(Number(e.target.value))}
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
            <div className="text-muted-foreground">c (J/kg°C)</div>
            <div className="text-muted-foreground">Error (%)</div>
            {trials.map((t, i) => (
              <div key={i} className="contents">
                <div>{t.voltage.toFixed(1)}</div>
                <div>{t.current.toFixed(2)}</div>
                <div>{t.time.toFixed(1)}</div>
                <div>{t.temperatureRise.toFixed(2)}</div>
                <div className="text-green-500">{t.specificHeat}</div>
                <div className="text-amber-500">
                  {Math.abs((t.specificHeat - material.specificHeat) / material.specificHeat * 100).toFixed(1)}%
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
            materialType={materialType}
            isHeating={isHeating}
            isLogging={isHeating}
          />
        </Canvas>
      </div>
    </div>
  )
}
