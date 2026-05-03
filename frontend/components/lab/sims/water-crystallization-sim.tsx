"use client"

import { useState, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Flame, Scale } from "lucide-react"
import * as THREE from "three"

// Crucible with Sample
function Crucible({ 
  sampleWeight,
  isHeated,
  waterLoss
}: { 
  sampleWeight: number
  isHeated: boolean
  waterLoss: number
}) {
  const crucibleRef = useRef<THREE.Group>(null)
  const flameRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (flameRef.current && isHeated) {
      const flicker = 1 + Math.sin(state.clock.elapsedTime * 15) * 0.2 + Math.cos(state.clock.elapsedTime * 23) * 0.1
      flameRef.current.scale.setScalar(flicker)
      flameRef.current.rotation.y = state.clock.elapsedTime * 2
    }
    if (crucibleRef.current && isHeated) {
      crucibleRef.current.position.y = Math.sin(state.clock.elapsedTime * 10) * 0.005
    }
  })
  
  const remainingSample = sampleWeight * (1 - waterLoss)
  const sampleHeight = Math.min(remainingSample * 0.3, 0.2)
  
  return (
    <group position={[0, -0.5, 0]}>
      {/* Tripod */}
      <mesh position={[-0.4, -1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color="#4a5568" metalness={0.8} />
      </mesh>
      <mesh position={[0.4, -1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color="#4a5568" metalness={0.8} />
      </mesh>
      <mesh position={[0, -1, -0.3]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color="#4a5568" metalness={0.8} />
      </mesh>
      
      {/* Wire gauze */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.02, 32]} />
        <meshStandardMaterial color="#a0aec0" wireframe />
      </mesh>
      
      {/* Crucible */}
      <group ref={crucibleRef}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.25, 0.2, 0.4, 32]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.05, 32]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
        
        {/* Sample inside */}
        {sampleWeight > 0 && (
          <mesh position={[0, -0.15 + sampleHeight / 2, 0]}>
            <cylinderGeometry args={[0.23, 0.18, sampleHeight, 32]} />
            <meshStandardMaterial 
              color={isHeated ? "#fbd38d" : "#ffffff"}
              emissive={isHeated ? "#ed8936" : "#000000"}
              emissiveIntensity={isHeated ? 0.3 : 0}
            />
          </mesh>
        )}
        
        {/* Steam when heating */}
        {isHeated && waterLoss < 0.99 && (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <mesh 
                key={i}
                position={[
                  (Math.random() - 0.5) * 0.2,
                  0.5 + Math.random() * 0.5,
                  (Math.random() - 0.5) * 0.2
                ]}
              >
                <sphereGeometry args={[0.02 + Math.random() * 0.02, 8, 8]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
              </mesh>
            ))}
          </>
        )}
      </group>
      
      {/* Bunsen burner */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.4, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
        <meshStandardMaterial color="#718096" />
      </mesh>
      
      {/* Flame */}
      {isHeated && (
        <mesh ref={flameRef} position={[0, -0.6, 0]}>
          <coneGeometry args={[0.12, 0.4, 16]} />
          <meshStandardMaterial 
            color={waterLoss > 0.9 ? "#48bb78" : "#ed8936"}
            emissive={waterLoss > 0.9 ? "#38a169" : "#dd6b20"}
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  )
}

// Analytical Balance
function Balance({ weight, displayWeight }: { weight: number; displayWeight: number }) {
  return (
    <group position={[-3, -1, 1]}>
      <mesh>
        <boxGeometry args={[1.2, 0.15, 0.8]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1, 0.4, 0.6]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      <mesh position={[0, 0.38, 0.31]}>
        <planeGeometry args={[0.8, 0.3]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.4} />
      </mesh>
      <Text position={[0, 0.38, 0.32]} fontSize={0.1} color="#000000" anchorX="center">
        {displayWeight.toFixed(4)} g
      </Text>
      <Text position={[0, -0.4, 0]} fontSize={0.07} color="#718096" anchorX="center">
        Analytical Balance
      </Text>
    </group>
  )
}

// Scene
function Scene({ sampleWeight, isHeated, waterLoss, displayWeight }: any) {
  return (
    <>
      <color attach="background" args={["#020817"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      {isHeated && <pointLight position={[0, -0.3, 0]} intensity={1} color="#ed8936" />}
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      
      <Crucible sampleWeight={sampleWeight} isHeated={isHeated} waterLoss={waterLoss} />
      <Balance weight={sampleWeight} displayWeight={displayWeight} />
      
      <Text position={[0, 3, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
        Water of Crystallization in Oxalic Acid
      </Text>
      
      <OrbitControls enablePan={false} minDistance={6} maxDistance={12} target={[0, -0.5, 0]} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

// Main Component
export function WaterCrystallizationSim() {
  const [sampleWeight, setSampleWeight] = useState(0)
  const [isHeated, setIsHeated] = useState(false)
  const [waterLoss, setWaterLoss] = useState(0)
  const [isWeighed, setIsWeighed] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [finalWeight, setFinalWeight] = useState(0)
  
  const handleWeigh = () => {
    setSampleWeight(1.2612)
    setIsWeighed(true)
    setWaterLoss(0)
    setIsComplete(false)
  }
  
  const handleHeat = () => {
    if (!isWeighed) return
    setIsHeated(true)
    
    const interval = setInterval(() => {
      setWaterLoss(prev => {
        const newLoss = prev + 0.01
        if (newLoss >= 0.99) {
          clearInterval(interval)
          setIsHeated(false)
          setIsComplete(true)
          setFinalWeight(sampleWeight * 0.01)
          return 0.99
        }
        return newLoss
      })
    }, 100)
  }
  
  const handleReset = () => {
    setIsHeated(false)
    setWaterLoss(0)
    setIsComplete(false)
    setSampleWeight(0)
    setIsWeighed(false)
    setFinalWeight(0)
  }
  
  const results = useMemo(() => {
    if (!isComplete) return null
    
    const waterLost = sampleWeight - finalWeight
    const percentWater = (waterLost / sampleWeight) * 100
    const molesHydrated = sampleWeight / 126
    const molesWater = waterLost / 18
    const n = Math.round(molesWater / molesHydrated)
    
    return {
      waterLost,
      percentWater,
      n,
      formula: `H₂C₂O₄·${n}H₂O`
    }
  }, [isComplete, sampleWeight, finalWeight])
  
  const displayWeight = isComplete ? finalWeight : sampleWeight * (1 - waterLoss)
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleWeigh} disabled={isWeighed} className="gap-2">
          <Scale className="w-4 h-4" />
          Weigh Hydrated Sample
        </Button>
        <Button onClick={handleHeat} disabled={!isWeighed || isHeated || isComplete} className="gap-2">
          <Flame className="w-4 h-4" />
          {isHeated ? "Heating..." : "Heat to Constant Weight"}
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Initial Weight</span>
          <span className="text-lg font-semibold">{sampleWeight.toFixed(4)} g</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Current Weight</span>
          <span className="text-lg font-semibold">{displayWeight.toFixed(4)} g</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Water Lost</span>
          <span className="text-lg font-semibold">{((sampleWeight - displayWeight) / sampleWeight * 100).toFixed(1)}%</span>
        </Badge>
      </div>
      
      {results && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
          <h4 className="font-semibold text-green-800">Analysis Complete</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Water lost:</span>
              <span className="ml-2 font-medium">{results.waterLost.toFixed(4)} g</span>
            </div>
            <div>
              <span className="text-muted-foreground">% Water:</span>
              <span className="ml-2 font-medium">{results.percentWater.toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Formula:</span>
              <span className="ml-2 font-medium text-blue-700">{results.formula}</span>
            </div>
            <div>
              <span className="text-muted-foreground">n (water of cryst.):</span>
              <span className="ml-2 font-medium">{results.n}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Procedure:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Weigh accurately ~1.25g of hydrated oxalic acid</li>
          <li>Transfer to pre-weighed clean crucible</li>
          <li>Heat gently over Bunsen burner</li>
          <li>Continue heating until constant weight achieved</li>
          <li>Calculate water of crystallization (n in H₂C₂O₄·nH₂O)</li>
        </ol>
      </div>
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [5, 3, 5], fov: 50 }} shadows>
          <Scene 
            sampleWeight={sampleWeight}
            isHeated={isHeated}
            waterLoss={waterLoss}
            displayWeight={displayWeight}
          />
        </Canvas>
      </div>
    </div>
  )
}
