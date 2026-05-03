"use client"

import { useState, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Thermometer, FlaskConical } from "lucide-react"
import * as THREE from "three"

// Calorimeter with Dewar Flask
function Calorimeter({ 
  temperature,
  isReacting,
  acidVolume,
  baseVolume
}: { 
  temperature: number
  isReacting: boolean
  acidVolume: number
  baseVolume: number
}) {
  const calorimeterRef = useRef<THREE.Group>(null)
  const stirrerRef = useRef<THREE.Mesh>(null)
  const tempDisplayRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (stirrerRef.current && isReacting) {
      stirrerRef.current.rotation.y = state.clock.elapsedTime * 10
    }
    if (tempDisplayRef.current) {
      const flicker = 1 + Math.sin(state.clock.elapsedTime * 20) * 0.05
      tempDisplayRef.current.material.emissiveIntensity = flicker * 0.3
    }
  })
  
  // Temperature color gradient
  const waterColor = temperature < 25 ? "#90cdf4" : 
                    temperature < 35 ? "#9ae6b4" : 
                    temperature < 45 ? "#fbd38d" : "#fc8181"
  
  const totalVolume = acidVolume + baseVolume
  const liquidHeight = Math.min(totalVolume / 100, 0.8)
  
  return (
    <group position={[0, -0.5, 0]}>
      {/* Outer jacket (Dewar) */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.45, 1.2, 32]} />
        <meshPhysicalMaterial 
          color="#e2e8f0"
          transmission={0.3}
          opacity={0.4}
          transparent
          roughness={0.2}
        />
      </mesh>
      
      {/* Inner vessel */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.38, 1.1, 32]} />
        <meshStandardMaterial color="#f7fafc" />
      </mesh>
      
      {/* Solution */}
      <mesh position={[0, -0.55 + liquidHeight / 2, 0]}>
        <cylinderGeometry args={[0.4, 0.36, liquidHeight, 32]} />
        <meshStandardMaterial color={waterColor} transparent opacity={0.8} />
      </mesh>
      
      {/* Stirrer */}
      <mesh ref={stirrerRef} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial color="#718096" />
      </mesh>
      <mesh ref={stirrerRef} position={[0, 0.2, 0]}>
        <boxGeometry args={[0.25, 0.02, 0.02]} />
        <meshStandardMaterial color="#718096" />
      </mesh>
      
      {/* Thermometer probe */}
      <mesh position={[0.3, 0.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
        <meshStandardMaterial color="#718096" />
      </mesh>
      
      {/* Digital display */}
      <mesh position={[0.6, 0.5, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.05]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      <mesh ref={tempDisplayRef} position={[0.6, 0.5, 0.03]}>
        <planeGeometry args={[0.25, 0.15]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0.6, 0.5, 0.04]} fontSize={0.08} color="#000000" anchorX="center">
        {temperature.toFixed(2)} °C
      </Text>
      
      {/* Lid */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.05, 32]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      
      {/* Heat waves when hot */}
      {temperature > 35 && (
        <>
          {Array.from({ length: 4 }).map((_, i) => (
            <mesh 
              key={i}
              position={[
                (Math.random() - 0.5) * 0.6,
                0.8 + Math.random() * 0.3,
                (Math.random() - 0.5) * 0.4
              ]}
            >
              <sphereGeometry args={[0.02, 6, 6]} />
              <meshStandardMaterial color="#fc8181" transparent opacity={0.3} />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}

// Burette for acid addition
function Burette({ volume }: { volume: number }) {
  const liquidHeight = (volume / 50) * 2
  
  return (
    <group position={[-1.5, 1.5, 0]}>
      <mesh position={[-0.4, 0, 0]}>
        <boxGeometry args={[0.1, 4, 0.2]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 3, 16]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.3} transparent />
      </mesh>
      
      {volume > 0 && (
        <mesh position={[0, 1.5 - liquidHeight / 2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, liquidHeight, 16]} />
          <meshStandardMaterial color="#f56565" transparent opacity={0.8} />
        </mesh>
      )}
      
      <Text position={[0.15, 2, 0]} fontSize={0.08} color="#2d3748" anchorX="left">
        HCl (1M)
      </Text>
    </group>
  )
}

// Scene
function Scene({ temperature, isReacting, acidVolume, baseVolume }: any) {
  return (
    <>
      <color attach="background" args={["#020817"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      
      <Calorimeter 
        temperature={temperature} 
        isReacting={isReacting}
        acidVolume={acidVolume}
        baseVolume={baseVolume}
      />
      <Burette volume={acidVolume} />
      
      <Text position={[0, 3.5, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
        Heat of Neutralization
      </Text>
      
      <OrbitControls enablePan={false} minDistance={6} maxDistance={12} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

// Main Component
export function HeatNeutralizationSim() {
  const [temperature, setTemperature] = useState(25.0)
  const [initialTemp, setInitialTemp] = useState(25.0)
  const [acidVolume, setAcidVolume] = useState(0)
  const [baseVolume] = useState(50)
  const [isReacting, setIsReacting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [maxTemp, setMaxTemp] = useState(25.0)
  
  // Calculate heat of neutralization
  const handleStart = () => {
    setIsReacting(true)
    setInitialTemp(temperature)
    setAcidVolume(0)
    
    const interval = setInterval(() => {
      setAcidVolume(prev => {
        const newVol = prev + 0.5
        
        // Temperature rise calculation
        // q = n * ΔH = m * c * ΔT
        // ΔT = (moles * 57000) / (total_mass * 4184)
        const molesOH = 0.5 * 0.05 // 0.5M NaOH, 50mL
        const molesHAdded = 1.0 * (newVol / 1000)
        const limiting = Math.min(molesOH, molesHAdded)
        
        const totalMass = 100 + newVol // grams
        const deltaT = (limiting * 57000) / (totalMass * 4.184)
        const newTemp = initialTemp + deltaT
        
        setTemperature(newTemp)
        setMaxTemp(Math.max(maxTemp, newTemp))
        
        if (newVol >= 50) {
          clearInterval(interval)
          setIsReacting(false)
          setIsComplete(true)
        }
        
        return newVol
      })
    }, 50)
  }
  
  const handleReset = () => {
    setTemperature(25.0)
    setInitialTemp(25.0)
    setAcidVolume(0)
    setIsReacting(false)
    setIsComplete(false)
    setMaxTemp(25.0)
  }
  
  const results = useMemo(() => {
    if (!isComplete) return null
    
    const deltaT = maxTemp - initialTemp
    const totalMass = 150 // grams
    const molesWater = 0.025
    const q = totalMass * 4.184 * deltaT / 1000 // kJ
    const deltaH = -q / molesWater // kJ/mol
    
    return {
      deltaT,
      q,
      deltaH,
      theoretical: -57.3
    }
  }, [isComplete, maxTemp, initialTemp])
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleStart} disabled={isReacting || isComplete} className="gap-2">
          <Play className="w-4 h-4" />
          {isReacting ? "Reacting..." : "Start Reaction"}
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Initial Temp</span>
          <span className="text-lg font-semibold">{initialTemp.toFixed(1)} °C</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Current Temp</span>
          <span className="text-lg font-semibold text-red-600">{temperature.toFixed(2)} °C</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">ΔT</span>
          <span className="text-lg font-semibold">{(temperature - initialTemp).toFixed(2)} °C</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">HCl Added</span>
          <span className="text-lg font-semibold">{acidVolume.toFixed(1)} mL</span>
        </Badge>
      </div>
      
      {results && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
          <h4 className="font-semibold text-green-800">Calorimetry Results</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Temperature rise (ΔT):</span>
              <span className="ml-2 font-medium">{results.deltaT.toFixed(2)} °C</span>
            </div>
            <div>
              <span className="text-muted-foreground">Heat evolved (q):</span>
              <span className="ml-2 font-medium">{results.q.toFixed(2)} kJ</span>
            </div>
            <div>
              <span className="text-muted-foreground">ΔH neutralization:</span>
              <span className="ml-2 font-medium text-green-700">{results.deltaH.toFixed(1)} kJ/mol</span>
            </div>
            <div>
              <span className="text-muted-foreground">Theoretical:</span>
              <span className="ml-2 font-medium">{results.theoretical} kJ/mol</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Procedure:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Place 50 mL of 0.5M NaOH in calorimeter, record initial temperature</li>
          <li>Add 50 mL of 1M HCl from burette</li>
          <li>Stir continuously, record maximum temperature reached</li>
          <li>Calculate ΔH = -(m·c·ΔT)/n kJ/mol</li>
        </ol>
      </div>
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [6, 4, 6], fov: 50 }} shadows>
          <Scene 
            temperature={temperature}
            isReacting={isReacting}
            acidVolume={acidVolume}
            baseVolume={baseVolume}
          />
        </Canvas>
      </div>
    </div>
  )
}
