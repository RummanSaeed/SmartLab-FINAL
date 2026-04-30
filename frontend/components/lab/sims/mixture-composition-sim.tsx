"use client"

import { useState, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Beaker, Calculator } from "lucide-react"
import * as THREE from "three"

// Burette
function Burette({ volume, isRunning }: { volume: number; isRunning: boolean }) {
  const meniscusRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meniscusRef.current) {
      const y = 2 - (volume / 50) * 4 + Math.sin(state.clock.elapsedTime * 2) * 0.003
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
            <meshStandardMaterial color="#9f7aea" transparent opacity={0.85} />
          </mesh>
          <mesh ref={meniscusRef} position={[0, 2 - liquidHeight, 0]}>
            <sphereGeometry args={[0.075, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#9f7aea" transparent opacity={0.85} />
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
        KMnO₄ (0.02M)
      </Text>
    </group>
  )
}

// Two flasks - one for each step
function Flasks({ step1Complete, step2Volume }: { step1Complete: boolean; step2Volume: number }) {
  return (
    <group>
      {/* Flask 1 - Total oxalate */}
      <group position={[-0.8, -1, 0]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.2, 0.5, 32]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.2} transparent roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.12, 0.3, 0.3, 32]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.2} transparent roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.28, 0.18, 0.3, 32]} />
          <meshStandardMaterial color={step1Complete ? "#e9d8fd" : "#fef3c7"} transparent opacity={0.85} />
        </mesh>
        <Text position={[0, -0.7, 0]} fontSize={0.06} color="#2d3748" anchorX="center">
          Step 1: Total Oxalate
        </Text>
      </group>
      
      {/* Flask 2 - Only oxalate */}
      <group position={[0.8, -1, 0]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.2, 0.5, 32]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.2} transparent roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.12, 0.3, 0.3, 32]} />
          <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.2} transparent roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.28, 0.18, 0.3, 32]} />
          <meshStandardMaterial color={step2Volume > 0 ? "#e9d8fd" : "#fef3c7"} transparent opacity={0.85} />
        </mesh>
        <Text position={[0, -0.7, 0]} fontSize={0.06} color="#2d3748" anchorX="center">
          Step 2: After Precipitation
        </Text>
      </group>
    </group>
  )
}

// Scene
function Scene({ buretteVolume, step1Complete, step2Volume }: any) {
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
      <Flasks step1Complete={step1Complete} step2Volume={step2Volume} />
      
      <Text position={[0, 3.5, 0]} fontSize={0.14} color="#2d3748" anchorX="center">
        Composition of K₂C₂O₄ + K₂SO₄ Mixture
      </Text>
      
      <OrbitControls enablePan={false} minDistance={7} maxDistance={14} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

// Main Component
export function MixtureCompositionSim() {
  const [sampleWeight, setSampleWeight] = useState(0)
  const [step1Volume, setStep1Volume] = useState(0)
  const [step2Volume, setStep2Volume] = useState(0)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 'complete'>(1)
  const [isRunning, setIsRunning] = useState(false)
  const [isWeighed, setIsWeighed] = useState(false)
  
  const handleWeigh = () => {
    setSampleWeight(0.5246)
    setIsWeighed(true)
  }
  
  const handleStep1 = () => {
    if (!isWeighed) return
    setIsRunning(true)
    setCurrentStep(1)
    
    const interval = setInterval(() => {
      setStep1Volume(prev => {
        const newVol = prev + 0.1
        if (newVol >= 18) {
          clearInterval(interval)
          setIsRunning(false)
          return 18
        }
        return newVol
      })
    }, 50)
  }
  
  const handleStep2 = () => {
    setIsRunning(true)
    setCurrentStep(2)
    
    const interval = setInterval(() => {
      setStep2Volume(prev => {
        const newVol = prev + 0.1
        if (newVol >= 12) {
          clearInterval(interval)
          setIsRunning(false)
          setCurrentStep('complete')
          return 12
        }
        return newVol
      })
    }, 50)
  }
  
  const handleReset = () => {
    setSampleWeight(0)
    setStep1Volume(0)
    setStep2Volume(0)
    setCurrentStep(1)
    setIsRunning(false)
    setIsWeighed(false)
  }
  
  const results = useMemo(() => {
    if (currentStep !== 'complete') return null
    
    // Step 1: Total oxalate (K2C2O4 + K2C2O4 impurity in original)
    const molesOxalateTotal = 0.02 * (step1Volume / 1000) * 5 / 2
    const massK2C2O4Total = molesOxalateTotal * 166
    
    // Step 2: After BaCl2 precipitation of SO4²⁻, remaining is just oxalate
    const molesOxalateOnly = 0.02 * (step2Volume / 1000) * 5 / 2
    const massK2C2O4Only = molesOxalateOnly * 166
    
    // Difference is oxalate that was with sulfate
    const massK2SO4 = massK2C2O4Total - massK2C2O4Only
    
    const percentK2C2O4 = (massK2C2O4Only / sampleWeight) * 100
    const percentK2SO4 = (massK2SO4 / sampleWeight) * 100
    
    return {
      percentK2C2O4,
      percentK2SO4,
      massK2C2O4: massK2C2O4Only,
      massK2SO4
    }
  }, [currentStep, step1Volume, step2Volume, sampleWeight])
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleWeigh} disabled={isWeighed} className="gap-2">
          <Beaker className="w-4 h-4" />
          Weigh Sample
        </Button>
        <Button 
          onClick={handleStep1} 
          disabled={!isWeighed || isRunning || step1Volume > 0}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          Step 1: Total Oxalate
        </Button>
        <Button 
          onClick={handleStep2} 
          disabled={step1Volume === 0 || isRunning || step2Volume > 0}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          Step 2: After BaCl₂
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
          <span className="text-xs text-muted-foreground">Step 1 (Total)</span>
          <span className="text-lg font-semibold">{step1Volume.toFixed(1)} mL</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Step 2 (Oxalate)</span>
          <span className="text-lg font-semibold">{step2Volume.toFixed(1)} mL</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Status</span>
          <span className="text-lg font-semibold">
            {currentStep === 'complete' ? "Complete" : isRunning ? "Running" : `Step ${currentStep}`}
          </span>
        </Badge>
      </div>
      
      {results && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 space-y-3">
          <h4 className="font-semibold text-purple-800 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Mixture Composition Analysis
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">K₂C₂O₄ percentage:</span>
              <span className="ml-2 font-medium text-purple-700">{results.percentK2C2O4.toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">K₂SO₄ percentage:</span>
              <span className="ml-2 font-medium text-blue-700">{results.percentK2SO4.toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Mass K₂C₂O₄:</span>
              <span className="ml-2 font-medium">{results.massK2C2O4.toFixed(4)} g</span>
            </div>
            <div>
              <span className="text-muted-foreground">Mass K₂SO₄:</span>
              <span className="ml-2 font-medium">{results.massK2SO4.toFixed(4)} g</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Selective Titration Method:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li><strong>Step 1:</strong> Titrate total oxalate (K₂C₂O₄ only) with KMnO₄</li>
          <li>Add excess BaCl₂ to precipitate BaSO₄ from K₂SO₄</li>
          <li>Filter and wash precipitate</li>
          <li><strong>Step 2:</strong> Titrate filtrate - only oxalate remains</li>
          <li>Calculate composition by difference</li>
        </ol>
      </div>
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [6, 4, 6], fov: 50 }} shadows>
          <Scene 
            buretteVolume={50 - (currentStep === 2 ? step2Volume : step1Volume)}
            step1Complete={step1Volume > 0}
            step2Volume={step2Volume}
          />
        </Canvas>
      </div>
    </div>
  )
}
