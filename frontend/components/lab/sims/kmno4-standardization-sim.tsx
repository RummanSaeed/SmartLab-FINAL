"use client"

import { useState, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, FlaskConical, Droplet } from "lucide-react"
import * as THREE from "three"

// Burette with purple KMnO4
function Burette({ volume, isRunning }: { volume: number; isRunning: boolean }) {
  const meniscusRef = useRef<THREE.Mesh>(null)
  const dropRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meniscusRef.current) {
      const y = 2 - (volume / 50) * 4 + Math.sin(state.clock.elapsedTime * 3) * 0.002
      meniscusRef.current.position.y = y
    }
    if (isRunning && dropRef.current) {
      const time = state.clock.elapsedTime % 0.4
      dropRef.current.visible = time < 0.25
      dropRef.current.position.y = -2.5 - time * 2.5
    }
  })
  
  const liquidHeight = (volume / 50) * 4
  
  return (
    <group position={[0, 1.5, 0]}>
      <mesh position={[-0.5, 0, 0]}>
        <boxGeometry args={[0.08, 5, 0.2]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, 4.5, 32]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.2} transparent roughness={0.1} />
      </mesh>
      
      {volume > 0 && (
        <>
          <mesh position={[0, 2 - liquidHeight / 2, 0]}>
            <cylinderGeometry args={[0.075, 0.075, liquidHeight, 32]} />
            <meshStandardMaterial color="#9f7aea" transparent opacity={0.85} />
          </mesh>
          <mesh ref={meniscusRef} position={[0, 2 - liquidHeight, 0]}>
            <sphereGeometry args={[0.075, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#9f7aea" transparent opacity={0.85} />
          </mesh>
        </>
      )}
      
      {/* Graduations */}
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh key={i} position={[0.085, 2 - i * 0.08, 0]}>
          <boxGeometry args={[0.015, 0.002, i % 5 === 0 ? 0.04 : 0.02]} />
          <meshStandardMaterial color="#1a202c" />
        </mesh>
      ))}
      
      {Array.from({ length: 11 }).map((_, i) => (
        <Text key={i} position={[0.15, 2 - i * 0.4, 0]} fontSize={0.06} color="#1a202c" anchorX="left">
          {i * 5}
        </Text>
      ))}
      
      <mesh position={[0, -2.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.15, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      
      <mesh ref={dropRef} position={[0, -2.7, 0]} visible={false}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#9f7aea" />
      </mesh>
      
      <Text position={[0.2, 2.5, 0]} fontSize={0.08} color="#2d3748" anchorX="left">
        KMnO₄ (approx 0.1M)
      </Text>
    </group>
  )
}

// Conical Flask with oxalic acid and color change
function ConicalFlask({ 
  volume, 
  kmno4Added, 
  isComplete 
}: { 
  volume: number
  kmno4Added: number
  isComplete: boolean
}) {
  const flaskRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (flaskRef.current) {
      flaskRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.02
    }
  })
  
  const liquidHeight = Math.min((volume / 100) * 0.8, 0.8)
  
  // Color changes based on KMnO4 addition
  const liquidColor = useMemo(() => {
    if (isComplete) return "#e9d8fd" // Light purple at endpoint
    if (kmno4Added < 2) return "#fef3c7" // Colorless
    return "#fef3c7" // Still colorless until endpoint
  }, [kmno4Added, isComplete])
  
  return (
    <group ref={flaskRef} position={[0, -1, 0]}>
      <mesh>
        <cylinderGeometry args={[0.4, 0.25, 0.6, 32]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.2} transparent roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.4, 0.4, 32]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.2} transparent roughness={0.1} />
      </mesh>
      
      {volume > 0 && (
        <>
          <mesh position={[0, -0.3 + liquidHeight / 2, 0]}>
            <cylinderGeometry args={[0.38, 0.23, liquidHeight, 32]} />
            <meshStandardMaterial color={liquidColor} transparent opacity={0.85} />
          </mesh>
          
          {/* Pink at endpoint */}
          {isComplete && (
            <mesh position={[0, -0.3 + liquidHeight - 0.02, 0]}>
              <cylinderGeometry args={[0.38, 0.38, 0.02, 32]} />
              <meshStandardMaterial color="#9f7aea" transparent opacity={0.6} />
            </mesh>
          )}
        </>
      )}
      
      <Text position={[0.6, 0.3, 0]} fontSize={0.07} color="#2d3748" anchorX="left">
        Oxalic Acid + H₂SO₄
      </Text>
    </group>
  )
}

// Hot plate with temperature control
function HotPlate({ temperature }: { temperature: number }) {
  return (
    <group position={[0, -2.2, 0]}>
      <mesh>
        <boxGeometry args={[1.2, 0.2, 1.2]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      
      {/* Heating surface */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.02, 32]} />
        <meshStandardMaterial color={temperature > 60 ? "#e53e3e" : "#4a5568"} />
      </mesh>
      
      {/* Display */}
      <mesh position={[0.35, 0.15, 0.35]}>
        <planeGeometry args={[0.2, 0.15]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.4} />
      </mesh>
      <Text position={[0.35, 0.15, 0.37]} fontSize={0.06} color="#000000" anchorX="center">
        {temperature}°C
      </Text>
      
      <Text position={[0, -0.5, 0]} fontSize={0.07} color="#718096" anchorX="center">
        Hot Plate (60-70°C)
      </Text>
    </group>
  )
}

// Scene
function Scene({ buretteVolume, flaskVolume, kmno4Added, temperature, isComplete }: any) {
  return (
    <>
      <color attach="background" args={["#f7fafc"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      <Burette volume={buretteVolume} isRunning={false} />
      <ConicalFlask volume={flaskVolume} kmno4Added={kmno4Added} isComplete={isComplete} />
      <HotPlate temperature={temperature} />
      
      <Text position={[0, 3.5, 0]} fontSize={0.14} color="#2d3748" anchorX="center">
        Standardize KMnO₄ & Prepare 0.01M Solution
      </Text>
      
      <OrbitControls enablePan={false} minDistance={7} maxDistance={14} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

// Main Component
export function Kmno4StandardizationSim() {
  const [buretteVolume, setBuretteVolume] = useState(50)
  const [addedVolume, setAddedVolume] = useState(0)
  const [temperature, setTemperature] = useState(70)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [endpoint, setEndpoint] = useState<number | null>(null)
  
  const handleStart = () => {
    setIsRunning(true)
    
    const interval = setInterval(() => {
      setAddedVolume(prev => {
        const newVol = prev + 0.05
        
        // Endpoint calculation
        // 2MnO4- + 5C2O4^2- + 16H+ → 2Mn2+ + 10CO2 + 8H2O
        // Moles oxalic acid = 0.05 * 0.02 = 0.001 mol
        // Moles KMnO4 needed = 0.001 * 2/5 = 0.0004 mol
        // Volume = 0.0004 / 0.1 = 4 mL
        
        if (newVol >= 4) {
          clearInterval(interval)
          setIsRunning(false)
          setIsComplete(true)
          setEndpoint(newVol)
        }
        return newVol
      })
    }, 80)
  }
  
  const handleReset = () => {
    setIsRunning(false)
    setAddedVolume(0)
    setIsComplete(false)
    setEndpoint(null)
    setBuretteVolume(50)
  }
  
  const results = useMemo(() => {
    if (!endpoint) return null
    
    // Molarity calculation
    const molesOxalic = 0.05 * 0.02 // 0.05M, 20mL
    const molesKmno4 = molesOxalic * 2 / 5
    const molarity = molesKmno4 / (endpoint / 1000)
    
    // For 0.01M preparation
    const dilutionFactor = molarity / 0.01
    const volToTake = 250 / dilutionFactor
    
    return {
      molarity,
      volToTake,
      dilutionFactor
    }
  }, [endpoint])
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleStart} disabled={isRunning || isComplete} className="gap-2">
          <Play className="w-4 h-4" />
          {isRunning ? "Titrating..." : "Start Titration"}
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">KMnO₄ Used</span>
          <span className="text-lg font-semibold">{addedVolume.toFixed(2)} mL</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Temperature</span>
          <span className="text-lg font-semibold">{temperature} °C</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Status</span>
          <span className="text-lg font-semibold">
            {isComplete ? "Endpoint" : isRunning ? "Running" : "Ready"}
          </span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Indicator</span>
          <span className="text-lg font-semibold">Self</span>
        </Badge>
      </div>
      
      {results && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 space-y-3">
          <h4 className="font-semibold text-purple-800">Standardization Complete</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Molarity of KMnO₄:</span>
              <span className="ml-2 font-medium text-purple-700">{results.molarity.toFixed(4)} M</span>
            </div>
            <div>
              <span className="text-muted-foreground">For 0.01M solution:</span>
              <span className="ml-2 font-medium">Take {results.volToTake.toFixed(1)} mL → 250 mL</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Redox Reaction:</h4>
        <p className="font-mono text-xs mb-2">
          2MnO₄⁻ + 5C₂O₄²⁻ + 16H⁺ → 2Mn²⁺ + 10CO₂ + 8H₂O
        </p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Heat oxalic acid + dilute H₂SO₄ to 60-70°C</li>
          <li>Titrate with KMnO₄ until persistent pink color</li>
          <li>Calculate molarity: M₁V₁/2 = M₂V₂/5</li>
          <li>Dilute to prepare 0.01M working solution</li>
        </ol>
      </div>
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [6, 4, 6], fov: 50 }} shadows>
          <Scene 
            buretteVolume={50 - addedVolume}
            flaskVolume={25}
            kmno4Added={addedVolume}
            temperature={temperature}
            isComplete={isComplete}
          />
        </Canvas>
      </div>
    </div>
  )
}
