"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Beaker, FlaskConical } from "lucide-react"
import * as THREE from "three"

// Test tube with reaction
function TestTube({ 
  ethanolAdded,
  iodineAdded,
  naohAdded,
  hasPrecipitate
}: { 
  ethanolAdded: boolean
  iodineAdded: boolean
  naohAdded: boolean
  hasPrecipitate: boolean
}) {
  const tubeRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (tubeRef.current && hasPrecipitate) {
      tubeRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.05
    }
  })
  
  // Color changes: I₂ (brown) → Iodoform (yellow precipitate)
  let liquidColor = "#ffffff"
  if (iodineAdded && !hasPrecipitate) liquidColor = "#8b4513" // Brown
  if (hasPrecipitate) liquidColor = "#fff8dc" // Pale yellow
  
  return (
    <group ref={tubeRef} position={[0, 0, 0]}>
      {/* Test tube */}
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 1.2, 16]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.3}
          transparent
          roughness={0.1}
        />
      </mesh>
      <mesh position={[0, -0.6, 0]}>
        <sphereGeometry args={[0.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.3}
          transparent
          roughness={0.1}
        />
      </mesh>
      
      {/* Liquid layers */}
      {ethanolAdded && (
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.4, 16]} />
          <meshStandardMaterial color={liquidColor} transparent opacity={0.7} />
        </mesh>
      )}
      
      {/* Yellow precipitate at bottom */}
      {hasPrecipitate && (
        <mesh position={[0, -0.55, 0]}>
          <sphereGeometry args={[0.17, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffd700" />
        </mesh>
      )}
      
      <Text position={[0.4, 0, 0]} fontSize={0.08} color="#2d3748" anchorX="left">
        CH₃CH₂OH + I₂ + NaOH
      </Text>
    </group>
  )
}

// Filter paper with precipitate
function FilterPaper({ hasPrecipitate }: { hasPrecipitate: boolean }) {
  return (
    <group position={[2, -0.5, 0]}>
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 0.02, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {hasPrecipitate && (
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.35, 0.35, 0.05, 32]} />
          <meshStandardMaterial color="#ffd700" />
        </mesh>
      )}
      
      <Text position={[0, -0.5, 0]} fontSize={0.07} color="#2d3748" anchorX="center">
        Iodoform (CHI₃)
      </Text>
      <Text position={[0, -0.65, 0]} fontSize={0.06} color="#666666" anchorX="center">
        Yellow crystals
      </Text>
    </group>
  )
}

// Scene
function Scene({ ethanolAdded, iodineAdded, naohAdded, hasPrecipitate }: any) {
  return (
    <>
      <color attach="background" args={["#f7fafc"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      <TestTube 
        ethanolAdded={ethanolAdded}
        iodineAdded={iodineAdded}
        naohAdded={naohAdded}
        hasPrecipitate={hasPrecipitate}
      />
      <FilterPaper hasPrecipitate={hasPrecipitate} />
      
      <Text position={[0, 3, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
        Iodoform Test / Preparation
      </Text>
      
      <OrbitControls enablePan={false} minDistance={6} maxDistance={12} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

// Main Component
export function IodoformSim() {
  const [ethanolAdded, setEthanolAdded] = useState(false)
  const [iodineAdded, setIodineAdded] = useState(false)
  const [naohAdded, setNaohAdded] = useState(false)
  const [hasPrecipitate, setHasPrecipitate] = useState(false)
  const [step, setStep] = useState(0)
  
  const handleStep = () => {
    if (step === 0) {
      setEthanolAdded(true)
      setStep(1)
    } else if (step === 1) {
      setIodineAdded(true)
      setStep(2)
    } else if (step === 2) {
      setNaohAdded(true)
      setStep(3)
      setTimeout(() => {
        setHasPrecipitate(true)
        setStep(4)
      }, 1500)
    }
  }
  
  const handleReset = () => {
    setEthanolAdded(false)
    setIodineAdded(false)
    setNaohAdded(false)
    setHasPrecipitate(false)
    setStep(0)
  }
  
  const steps = [
    "Add ethanol (or acetone/ethyl methyl ketone)",
    "Add iodine solution (brown color)",
    "Add NaOH dropwise",
    "Yellow precipitate of iodoform forms"
  ]
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={handleStep}
          disabled={step >= 4}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          {step === 0 ? "Add Ethanol" :
           step === 1 ? "Add Iodine" :
           step === 2 ? "Add NaOH" :
           step === 3 ? "Precipitating..." :
           "Complete"}
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div 
            key={i}
            className={`p-2 rounded text-sm ${
              i === step ? 'bg-blue-100 text-blue-800' : 
              i < step ? 'bg-green-100 text-green-800' : 'text-gray-500'
            }`}
          >
            {i + 1}. {s}
          </div>
        ))}
      </div>
      
      {hasPrecipitate && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h4 className="font-semibold text-yellow-800">Iodoform Test Positive!</h4>
          <p className="text-sm text-yellow-700 mt-1">
            Yellow crystalline precipitate confirms CH₃-CH(OH)- or CH₃-CO- group
          </p>
          <p className="text-xs text-yellow-600 mt-2 font-mono">
            CH₃CH₂OH + 4I₂ + 6NaOH → CHI₃ + HCOONa + 5NaI + 5H₂O
          </p>
        </div>
      )}
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Haloform Reaction:</h4>
        <p className="text-xs mb-2">
          Compounds with CH₃-CO- or CH₃-CH(OH)- groups give positive iodoform test.
          Yellow CHI₃ (melting point 119°C) with characteristic antiseptic odor.
        </p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Ethanol, acetaldehyde, acetone, methyl ketones - all positive</li>
          <li>Reagent: Iodine + sodium hydroxide (NaOI)</li>
          <li>Yellow precipitate confirms methyl ketone/alcohol</li>
          <li>Used for detection and characterization</li>
        </ol>
      </div>
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [6, 3, 6], fov: 50 }} shadows>
          <Scene 
            ethanolAdded={ethanolAdded}
            iodineAdded={iodineAdded}
            naohAdded={naohAdded}
            hasPrecipitate={hasPrecipitate}
          />
        </Canvas>
      </div>
    </div>
  )
}
