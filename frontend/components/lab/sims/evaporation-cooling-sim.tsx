"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Thermometer, Droplets } from "lucide-react"
import * as THREE from "three"

interface Props {
  initialTemp?: number
  humidity?: number
}

// Beaker with wet cloth
function WetBeaker({ wetness, tempDrop }: { wetness: number; tempDrop: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime()
      // Water droplets evaporating animation
      meshRef.current.position.y = 1.2 + Math.sin(time * 2) * 0.02
    }
  })

  return (
    <group position={[0, 0.5, 0]}>
      {/* Beaker */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 1, 32, 1, true]} />
        <meshPhysicalMaterial
          color="white"
          transparent
          opacity={0.3}
          roughness={0.1}
          transmission={0.8}
        />
      </mesh>
      {/* Water in beaker */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.5, 32]} />
        <meshPhysicalMaterial color="#87CEEB" transparent opacity={0.6} roughness={0.2} />
      </mesh>
      {/* Wet cloth covering */}
      <mesh ref={meshRef} position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.05, 32]} />
        <meshStandardMaterial 
          color="#f0f0f0" 
          roughness={0.9}
          transparent
          opacity={0.8 - wetness * 0.3}
        />
      </mesh>
      {/* Evaporation vapor */}
      {wetness > 0.2 && (
        <>
          {[...Array(8)].map((_, i) => (
            <mesh key={i} position={[Math.sin(i) * 0.3, 0.8 + i * 0.15, Math.cos(i) * 0.3]}>
              <sphereGeometry args={[0.03 + wetness * 0.02, 8, 8]} />
              <meshStandardMaterial color="#fff" transparent opacity={0.3 - i * 0.03} />
            </mesh>
          ))}
        </>
      )}
      {/* Cold vapor indicator */}
      {tempDrop > 2 && (
        <mesh position={[0.5, 1.2, 0]}>
          <Text fontSize={0.08} color="#00BFFF" anchorX="left">
            ❄ Evaporative Cooling
          </Text>
        </mesh>
      )}
    </group>
  )
}

// Thermometer
function EvapThermometer({ temperature }: { temperature: number }) {
  const liquidHeight = Math.max(0, (temperature - 20) / 40)
  
  return (
    <group position={[-0.8, 1, 0]}>
      {/* Glass tube */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 1.2, 16]} />
        <meshPhysicalMaterial color="white" transparent opacity={0.3} roughness={0.1} />
      </mesh>
      {/* Mercury/liquid */}
      <mesh position={[0, -0.6 + liquidHeight * 0.6, 0]}>
        <cylinderGeometry args={[0.025, 0.025, liquidHeight * 1.2, 16]} />
        <meshStandardMaterial 
          color={temperature < 25 ? "#4169E1" : "#FF6347"}
          emissive={temperature < 25 ? "#0000FF" : "#FF0000"}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Bulb */}
      <mesh position={[0, -0.7, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={temperature < 25 ? "#4169E1" : "#FF6347"}
          emissive={temperature < 25 ? "#0000FF" : "#FF0000"}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Temperature markings */}
      {[20, 25, 30, 35, 40].map((temp) => (
        <group key={temp} position={[0.06, -0.6 + ((temp - 20) / 40) * 1.2, 0]}>
          <mesh>
            <boxGeometry args={[0.02, 0.003, 0.01]} />
            <meshBasicMaterial color="#333" />
          </mesh>
        </group>
      ))}
      {/* Digital display */}
      <mesh position={[0.15, 0.2, 0]}>
        <boxGeometry args={[0.25, 0.15, 0.02]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <Text position={[0.15, 0.2, 0.02]} fontSize={0.06} color="#0f0" anchorX="center">
        {temperature.toFixed(1)}°C
      </Text>
    </group>
  )
}

// Digital thermometer probe
function ProbeBeaker({ temp }: { temp: number }) {
  return (
    <group position={[0.8, 0.8, 0]}>
      {/* Probe */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 16]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
      {/* Probe tip in beaker */}
      <mesh position={[0, -0.5, 0]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} />
      </mesh>
      {/* Cable */}
      <mesh position={[0.1, 0.5, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Digital meter */}
      <mesh position={[0.3, 1, 0]}>
        <boxGeometry args={[0.4, 0.25, 0.08]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <Text position={[0.3, 1, 0.05]} fontSize={0.08} color="#00FF00" anchorX="center">
        {temp.toFixed(2)}°C
      </Text>
    </group>
  )
}

// Fan for air circulation
function Fan({ isRunning }: { isRunning: boolean }) {
  const fanRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (fanRef.current && isRunning) {
      fanRef.current.rotation.z -= 0.3
    }
  })

  return (
    <group position={[1.5, 1.5, -0.5]}>
      {/* Frame */}
      <mesh>
        <torusGeometry args={[0.3, 0.03, 16, 32]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Blades */}
      <group ref={fanRef}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
            <boxGeometry args={[0.5, 0.08, 0.02]} />
            <meshStandardMaterial color="#444" />
          </mesh>
        ))}
      </group>
      {/* Stand */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.4, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  )
}

// Temperature graph display
function TempGraph({ temps }: { temps: number[] }) {
  const maxTemp = 30
  const minTemp = 20
  
  return (
    <group position={[-1.5, 0.5, 1]}>
      <mesh>
        <boxGeometry args={[0.8, 0.5, 0.02]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      {/* Graph line */}
      {temps.slice(-20).map((temp, i) => {
        const y = ((temp - minTemp) / (maxTemp - minTemp)) * 0.4 - 0.2
        const x = (i / 20) * 0.7 - 0.35
        return (
          <mesh key={i} position={[x, y, 0.02]}>
            <sphereGeometry args={[0.01, 8, 8]} />
            <meshStandardMaterial color="#4169E1" />
          </mesh>
        )
      })}
      <Text position={[0, 0.3, 0.03]} fontSize={0.04} color="#333" anchorX="center">
        Temperature vs Time
      </Text>
    </group>
  )
}

function Scene({ 
  temperature, 
  wetness, 
  tempDrop,
  fanRunning,
  tempHistory
}: { 
  temperature: number
  wetness: number
  tempDrop: number
  fanRunning: boolean
  tempHistory: number[]
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      <pointLight position={[-2, 4, 2]} intensity={0.5} />
      
      {/* Lab table */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[6, 0.2, 4]} />
        <meshStandardMaterial color="#deb887" roughness={0.8} />
      </mesh>
      
      <WetBeaker wetness={wetness} tempDrop={tempDrop} />
      <EvapThermometer temperature={temperature} />
      <ProbeBeaker temp={temperature} />
      <Fan isRunning={fanRunning} />
      <TempGraph temps={tempHistory} />
      
      {/* Labels */}
      <Text position={[0, 2.2, 0]} fontSize={0.1} color="#333" anchorX="center">
        Evaporative Cooling: Water → Vapor (Endothermic)
      </Text>
      <Text position={[0, -0.5, 0.5]} fontSize={0.06} color="#666" anchorX="center">
        Wet cotton cloth around beaker
      </Text>
      
      <OrbitControls enablePan={false} minDistance={3} maxDistance={8} target={[0, 1, 0]} />
    </>
  )
}

export function EvaporationCoolingSim({ initialTemp = 28, humidity = 60 }: Props) {
  const [isRunning, setIsRunning] = useState(false)
  const [temperature, setTemperature] = useState(initialTemp)
  const [wetness, setWetness] = useState(1)
  const [tempDrop, setTempDrop] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [tempHistory, setTempHistory] = useState<number[]>([initialTemp])
  const [minTemp, setMinTemp] = useState(initialTemp)

  const startExperiment = () => {
    setIsRunning(true)
    let time = 0
    let currentTemp = initialTemp
    
    const interval = setInterval(() => {
      time += 1
      setElapsedTime(time)
      
      // Temperature drops as water evaporates
      // Formula: dT = -k * wetness * (1 - humidity/100)
      const evaporationRate = 0.05 * wetness * (1 - humidity / 100)
      currentTemp -= evaporationRate
      
      // Minimum temperature approached
      currentTemp = Math.max(20, currentTemp)
      
      setTemperature(currentTemp)
      setWetness(Math.max(0, 1 - time * 0.02))
      setTempDrop(initialTemp - currentTemp)
      setTempHistory(prev => [...prev.slice(-30), currentTemp])
      setMinTemp(prev => Math.min(prev, currentTemp))
      
      if (time >= 60 || wetness <= 0.1) {
        clearInterval(interval)
        setIsRunning(false)
      }
    }, 200)
  }

  const reset = () => {
    setIsRunning(false)
    setTemperature(initialTemp)
    setWetness(1)
    setTempDrop(0)
    setElapsedTime(0)
    setTempHistory([initialTemp])
    setMinTemp(initialTemp)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Class 11</Badge>
          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500">Thermodynamics</Badge>
        </div>
        <div className="text-xs text-muted-foreground">Evaporative Cooling Effect</div>
      </div>

      {/* Physics explanation */}
      <div className="text-xs bg-muted/50 p-2 rounded">
        <strong>Principle:</strong> Evaporation is endothermic (absorbs heat). 
        Fast-moving water molecules escape, leaving cooler molecules behind.
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Thermometer className="w-3 h-3" /> Current
          </div>
          <div className={`text-lg font-semibold ${temperature < 25 ? 'text-blue-500' : 'text-amber-500'}`}>
            {temperature.toFixed(1)}°C
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Droplets className="w-3 h-3" /> Wetness
          </div>
          <div className="text-lg font-semibold text-cyan-500">{(wetness * 100).toFixed(0)}%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Temp Drop</div>
          <div className="text-lg font-semibold text-blue-500">-{tempDrop.toFixed(1)}°C</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Minimum</div>
          <div className="text-lg font-semibold text-indigo-500">{minTemp.toFixed(1)}°C</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [3, 2, 4], fov: 50 }} shadows>
          <Scene 
            temperature={temperature}
            wetness={wetness}
            tempDrop={tempDrop}
            fanRunning={isRunning}
            tempHistory={tempHistory}
          />
        </Canvas>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={startExperiment} disabled={isRunning} className="gap-2">
          <Play className="w-4 h-4" />
          {isRunning ? 'Evaporating...' : 'Start Evaporation'}
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {tempDrop > 3 && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="text-sm font-medium text-blue-500 mb-2">Observation:</div>
          <div className="text-xs text-muted-foreground">
            Temperature dropped by {tempDrop.toFixed(1)}°C due to evaporative cooling. 
            The wet cloth loses heat as water molecules with higher kinetic energy escape into the air.
          </div>
        </div>
      )}
    </div>
  )
}
