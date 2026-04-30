"use client"

import { useState, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Beaker, Calculator } from "lucide-react"
import * as THREE from "three"

// Burette with sodium thiosulfate
function Burette({ volume }: { volume: number }) {
  const meniscusRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meniscusRef.current) {
      const y = 2 - (volume / 50) * 4 + Math.sin(state.clock.elapsedTime * 2) * 0.002
      meniscusRef.current.position.y = y
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
            <meshStandardMaterial color="#90cdf4" transparent opacity={0.85} />
          </mesh>
          <mesh ref={meniscusRef} position={[0, 2 - liquidHeight, 0]}>
            <sphereGeometry args={[0.075, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#90cdf4" transparent opacity={0.85} />
          </mesh>
        </>
      )}
      
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh key={i} position={[0.085, 2 - i * 0.08, 0]}>
          <boxGeometry args={[0.015, 0.002, i % 5 === 0 ? 0.04 : 0.02]} />
          <meshStandardMaterial color="#1a202c" />
        </mesh>
      ))}
      
      <Text position={[0.2, 2.5, 0]} fontSize={0.08} color="#2d3748" anchorX="left">
        Na₂S₂O₃ (0.1M)
      </Text>
    </group>
  )
}

// Iodine flask with oil and reagents
function IodineFlask({ 
  oilAdded,
  hanusAdded,
  color
}: { 
  oilAdded: boolean
  hanusAdded: boolean
  color: string
}) {
  return (
    <group position={[0, -0.8, 0]}>
      <mesh>
        <cylinderGeometry args={[0.4, 0.25, 0.7, 32]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.2} transparent roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.4, 0.4, 32]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.2} transparent roughness={0.1} />
      </mesh>
      
      {/* Oil layer */}
      {oilAdded && (
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.38, 0.23, 0.25, 32]} />
          <meshStandardMaterial color="#fef3c7" transparent opacity={0.7} />
        </mesh>
      )}
      
      {/* Hanus reagent layer */}
      {hanusAdded && (
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.2, 32]} />
          <meshStandardMaterial color={color} transparent opacity={0.8} />
        </mesh>
      )}
      
      <Text position={[0, 0.8, 0]} fontSize={0.07} color="#2d3748" anchorX="center">
        Iodine Flask
      </Text>
    </group>
  )
}

// Scene
function Scene({ buretteVolume, oilAdded, hanusAdded, color }: any) {
  return (
    <>
      <color attach="background" args={["#f7fafc"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      <Burette volume={buretteVolume} />
      <IodineFlask oilAdded={oilAdded} hanusAdded={hanusAdded} color={color} />
      
      <Text position={[0, 3, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
        Iodine Number of Oil/Fat
      </Text>
      
      <OrbitControls enablePan={false} minDistance={7} maxDistance={14} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

// Main Component
export function IodineNumberSim() {
  const [sampleWeight, setSampleWeight] = useState(0)
  const [buretteVolume, setBuretteVolume] = useState(0)
  const [oilAdded, setOilAdded] = useState(false)
  const [hanusAdded, setHanusAdded] = useState(false)
  const [isTitrating, setIsTitrating] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isWeighed, setIsWeighed] = useState(false)
  
  const handleWeigh = () => {
    setSampleWeight(0.2532)
    setIsWeighed(true)
    setOilAdded(true)
    setHanusAdded(true)
  }
  
  const handleTitration = () => {
    if (!isWeighed) return
    setIsTitrating(true)
    
    const interval = setInterval(() => {
      setBuretteVolume(prev => {
        const newVol = prev + 0.1
        if (newVol >= 12.5) {
          clearInterval(interval)
          setIsTitrating(false)
          setIsComplete(true)
          return 12.5
        }
        return newVol
      })
    }, 50)
  }
  
  const handleReset = () => {
    setSampleWeight(0)
    setBuretteVolume(0)
    setOilAdded(false)
    setHanusAdded(false)
    setIsTitrating(false)
    setIsComplete(false)
    setIsWeighed(false)
  }
  
  const results = useMemo(() => {
    if (!isComplete) return null
    
    // Iodine number calculation
    // (Blank - Sample) × M × 126.9 × 100 / Sample weight
    const blank = 25 // mL
    const sample = buretteVolume
    const iodineNumber = ((blank - sample) * 0.1 * 12.69 * 100) / sampleWeight
    
    return {
      iodineNumber,
      unsaturation: iodineNumber > 100 ? "Highly unsaturated" : 
                   iodineNumber > 50 ? "Moderately unsaturated" : 
                   "Low unsaturation"
    }
  }, [isComplete, buretteVolume, sampleWeight])
  
  // Flask color based on reaction
  const flaskColor = hanusAdded ? "#fbbf24" : "#fef3c7" // Orange Hanus reagent
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleWeigh} disabled={isWeighed} className="gap-2">
          <Beaker className="w-4 h-4" />
          Weigh Oil Sample
        </Button>
        <Button onClick={handleTitration} disabled={!isWeighed || isTitrating || isComplete} className="gap-2">
          <Play className="w-4 h-4" />
          {isTitrating ? "Titrating..." : "Titrate with Thiosulfate"}
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
          <span className="text-xs text-muted-foreground">Na₂S₂O₃ Used</span>
          <span className="text-lg font-semibold">{buretteVolume.toFixed(1)} mL</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Blank Titre</span>
          <span className="text-lg font-semibold">25.0 mL</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Status</span>
          <span className="text-lg font-semibold">
            {isComplete ? "Complete" : isTitrating ? "Running" : "Ready"}
          </span>
        </Badge>
      </div>
      
      {results && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-3">
          <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Iodine Number Result
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Iodine Number:</span>
              <span className="ml-2 font-medium text-yellow-700">{results.iodineNumber.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Classification:</span>
              <span className="ml-2 font-medium">{results.unsaturation}</span>
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-2">
            Iodine number = grams of iodine absorbed by 100g of fat/oil. 
            Higher value = more double bonds (more unsaturated).
          </p>
        </div>
      )}
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Hanus Method:</h4>
        <p className="text-xs mb-2">
          Iodine number measures degree of unsaturation in fats/oils.
          Hanus reagent (iodine + bromine in acetic acid) adds across double bonds.
        </p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Weigh accurately ~0.25g of oil/fat</li>
          <li>Add 10mL Hanus reagent, keep in dark for 30 min</li>
          <li>Add KI and titrate liberated iodine with Na₂S₂O₃</li>
          <li>Starch indicator - endpoint: blue to colorless</li>
          <li>Calculate: I.No. = (Blank - Sample) × M × 12.69 / Weight</li>
        </ol>
      </div>
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [6, 4, 6], fov: 50 }} shadows>
          <Scene 
            buretteVolume={50 - buretteVolume}
            oilAdded={oilAdded}
            hanusAdded={hanusAdded}
            color={flaskColor}
          />
        </Canvas>
      </div>
    </div>
  )
}
