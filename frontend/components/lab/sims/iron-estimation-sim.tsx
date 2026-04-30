"use client"

import { useState, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, FlaskConical, Scale } from "lucide-react"
import * as THREE from "three"

// Burette with pink KMnO4
function Burette({ volume, isRunning }: { volume: number; isRunning: boolean }) {
  const meniscusRef = useRef<THREE.Mesh>(null)
  const dropRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meniscusRef.current) {
      const y = 2 - (volume / 50) * 4 + Math.sin(state.clock.elapsedTime * 2) * 0.003
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
            <meshStandardMaterial color="#ed64a6" transparent opacity={0.85} />
          </mesh>
          <mesh ref={meniscusRef} position={[0, 2 - liquidHeight, 0]}>
            <sphereGeometry args={[0.075, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#ed64a6" transparent opacity={0.85} />
          </mesh>
        </>
      )}
      
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
        <meshStandardMaterial color="#ed64a6" />
      </mesh>
      
      <Text position={[0.2, 2.5, 0]} fontSize={0.08} color="#2d3748" anchorX="left">
        KMnO₄ (0.01M)
      </Text>
    </group>
  )
}

// Conical Flask with iron solution
function ConicalFlask({ volume, kmno4Added, isComplete }: { volume: number; kmno4Added: number; isComplete: boolean }) {
  const flaskRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (flaskRef.current) {
      flaskRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.02
    }
  })
  
  const liquidHeight = Math.min((volume / 100) * 0.8, 0.8)
  
  // Fe²⁺ solution is pale green, becomes colorless then faint pink at endpoint
  const liquidColor = isComplete ? "#fce7f3" : "#c6f6d5" // Pink at endpoint, pale green initially
  
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
          
          {isComplete && (
            <mesh position={[0, -0.3 + liquidHeight - 0.02, 0]}>
              <cylinderGeometry args={[0.38, 0.38, 0.02, 32]} />
              <meshStandardMaterial color="#ed64a6" transparent opacity={0.5} />
            </mesh>
          )}
        </>
      )}
      
      <Text position={[0.6, 0.3, 0]} fontSize={0.07} color="#2d3748" anchorX="left">
        Fe²⁺ solution + H₂SO₄
      </Text>
    </group>
  )
}

// Scene
function Scene({ buretteVolume, flaskVolume, kmno4Added, isComplete }: any) {
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
      
      <Text position={[0, 3.5, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
        Iron Estimation by Permanganometry
      </Text>
      
      <OrbitControls enablePan={false} minDistance={7} maxDistance={14} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

// Main Component
export function IronEstimationSim() {
  const [sampleWeight, setSampleWeight] = useState(0)
  const [buretteVolume, setBuretteVolume] = useState(50)
  const [addedVolume, setAddedVolume] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [endpoint, setEndpoint] = useState<number | null>(null)
  const [isWeighed, setIsWeighed] = useState(false)
  
  const handleWeigh = () => {
    setSampleWeight(0.7023)
    setIsWeighed(true)
  }
  
  const handleStart = () => {
    if (!isWeighed) return
    setIsRunning(true)
    
    const interval = setInterval(() => {
      setAddedVolume(prev => {
        const newVol = prev + 0.05
        
        // Endpoint calculation for iron ore
        // 5Fe²⁺ + MnO₄⁻ + 8H⁺ → 5Fe³⁺ + Mn²⁺ + 4H₂O
        // Sample ~0.7g, assume 60% Fe
        // Moles Fe = 0.7 * 0.6 / 55.85 = 0.00752
        // Moles KMnO4 = 0.00752 / 5 = 0.0015
        // Volume = 0.0015 / 0.01 = 15 mL
        
        if (newVol >= 15) {
          clearInterval(interval)
          setIsRunning(false)
          setIsComplete(true)
          setEndpoint(newVol)
        }
        return newVol
      })
    }, 60)
  }
  
  const handleReset = () => {
    setIsRunning(false)
    setAddedVolume(0)
    setIsComplete(false)
    setEndpoint(null)
    setSampleWeight(0)
    setIsWeighed(false)
    setBuretteVolume(50)
  }
  
  const results = useMemo(() => {
    if (!endpoint) return null
    
    const molesKmno4 = 0.01 * (endpoint / 1000)
    const molesFe = molesKmno4 * 5
    const massFe = molesFe * 55.85
    const percentage = (massFe / sampleWeight) * 100
    
    return {
      massFe,
      percentage,
      grade: percentage > 60 ? "High grade" : percentage > 40 ? "Medium grade" : "Low grade"
    }
  }, [endpoint, sampleWeight])
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleWeigh} disabled={isWeighed} className="gap-2">
          <Scale className="w-4 h-4" />
          Weigh Sample ({sampleWeight > 0 ? "0.7023g" : "Click"})
        </Button>
        <Button onClick={handleStart} disabled={!isWeighed || isRunning || isComplete} className="gap-2">
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
          <span className="text-xs text-muted-foreground">Sample Weight</span>
          <span className="text-lg font-semibold">{sampleWeight.toFixed(4)} g</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">KMnO₄ Used</span>
          <span className="text-lg font-semibold">{addedVolume.toFixed(2)} mL</span>
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
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
          <h4 className="font-semibold text-green-800">Iron Estimation Complete</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Mass of Fe:</span>
              <span className="ml-2 font-medium">{results.massFe.toFixed(4)} g</span>
            </div>
            <div>
              <span className="text-muted-foreground">Percentage Fe:</span>
              <span className="ml-2 font-medium text-green-700">{results.percentage.toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Ore grade:</span>
              <span className="ml-2 font-medium">{results.grade}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Redox Reaction:</h4>
        <p className="font-mono text-xs mb-2">
          5Fe²⁺ + MnO₄⁻ + 8H⁺ → 5Fe³⁺ + Mn²⁺ + 4H₂O
        </p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Weigh iron ore sample, dissolve in dilute H₂SO₄</li>
          <li>Reduce all iron to Fe²⁺ using Zn/Hg (Jones reductor)</li>
          <li>Titrate with standardized KMnO₄ solution</li>
          <li>Endpoint: first permanent pink color</li>
          <li>Calculate % Fe: (5 × M × V × 55.85) / (sample wt) × 100</li>
        </ol>
      </div>
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [6, 4, 6], fov: 50 }} shadows>
          <Scene 
            buretteVolume={50 - addedVolume}
            flaskVolume={25}
            kmno4Added={addedVolume}
            isComplete={isComplete}
          />
        </Canvas>
      </div>
    </div>
  )
}
