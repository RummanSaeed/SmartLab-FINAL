"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Thermometer, Beaker } from "lucide-react"
import * as THREE from "three"

// Water bath with test tube
function WaterBathSetup({ 
  glucoseAdded,
  phenylhydrazineAdded,
  isHeating,
  hasCrystals
}: { 
  glucoseAdded: boolean
  phenylhydrazineAdded: boolean
  isHeating: boolean
  hasCrystals: boolean
}) {
  const bathRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (bathRef.current && isHeating) {
      bathRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })
  
  return (
    <group position={[0, -0.5, 0]}>
      {/* Water bath container */}
      <mesh>
        <cylinderGeometry args={[0.8, 0.7, 1, 32]} />
        <meshPhysicalMaterial 
          color="#e2e8f0"
          transmission={0.9}
          opacity={0.4}
          transparent
          roughness={0.1}
        />
      </mesh>
      
      {/* Hot water */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.75, 0.65, 0.6, 32]} />
        <meshStandardMaterial color="#fc8181" transparent opacity={0.5} />
      </mesh>
      
      {/* Test tube in bath */}
      <group ref={bathRef} position={[0, 0.3, 0]}>
        <mesh>
          <cylinderGeometry args={[0.18, 0.18, 1.2, 16]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            transmission={0.9}
            opacity={0.3}
            transparent
            roughness={0.1}
          />
        </mesh>
        
        {/* Glucose solution - colorless */}
        {glucoseAdded && (
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.5, 16]} />
            <meshStandardMaterial color="#fff8dc" transparent opacity={0.5} />
          </mesh>
        )}
        
        {/* Phenylhydrazine - yellow */}
        {phenylhydrazineAdded && (
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.3, 16]} />
            <meshStandardMaterial color="#fbbf24" transparent opacity={0.6} />
          </mesh>
        )}
        
        {/* Yellow osazone crystals */}
        {hasCrystals && (
          <mesh position={[0, -0.5, 0]}>
            <sphereGeometry args={[0.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
        )}
      </group>
      
      {/* Thermometer */}
      <mesh position={[0.5, 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
        <meshStandardMaterial color="#718096" />
      </mesh>
      <mesh position={[0.5, -0.1, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
        <meshStandardMaterial color="#e53e3e" />
      </mesh>
      <Text position={[0.7, 0.5, 0]} fontSize={0.07} color="#2d3748" anchorX="left">
        60°C
      </Text>
    </group>
  )
}

// Crystallizing dish
function CrystallizingDish({ hasCrystals }: { hasCrystals: boolean }) {
  return (
    <group position={[2, -0.8, 0]}>
      <mesh>
        <cylinderGeometry args={[0.5, 0.45, 0.3, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.3}
          transparent
          roughness={0.1}
        />
      </mesh>
      
      {/* Crystals */}
      {hasCrystals && (
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.45, 0.4, 0.15, 32]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      )}
      
      <Text position={[0, -0.4, 0]} fontSize={0.07} color="#2d3748" anchorX="center">
        Glucosazone Crystals
      </Text>
    </group>
  )
}

// Scene
function Scene({ glucoseAdded, phenylhydrazineAdded, isHeating, hasCrystals }: any) {
  return (
    <>
      <color attach="background" args={["#f7fafc"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      <WaterBathSetup 
        glucoseAdded={glucoseAdded}
        phenylhydrazineAdded={phenylhydrazineAdded}
        isHeating={isHeating}
        hasCrystals={hasCrystals}
      />
      <CrystallizingDish hasCrystals={hasCrystals} />
      
      <Text position={[0, 3, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
        Preparation of Glucosazone
      </Text>
      
      <OrbitControls enablePan={false} minDistance={6} maxDistance={14} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

// Main Component
export function GlucosazoneSim() {
  const [glucoseAdded, setGlucoseAdded] = useState(false)
  const [phenylhydrazineAdded, setPhenylhydrazineAdded] = useState(false)
  const [isHeating, setIsHeating] = useState(false)
  const [hasCrystals, setHasCrystals] = useState(false)
  const [step, setStep] = useState(0)
  
  const handleStep = () => {
    if (step === 0) {
      setGlucoseAdded(true)
      setStep(1)
    } else if (step === 1) {
      setPhenylhydrazineAdded(true)
      setStep(2)
    } else if (step === 2) {
      setIsHeating(true)
      setStep(3)
      setTimeout(() => {
        setHasCrystals(true)
        setIsHeating(false)
        setStep(4)
      }, 3000)
    }
  }
  
  const handleReset = () => {
    setGlucoseAdded(false)
    setPhenylhydrazineAdded(false)
    setIsHeating(false)
    setHasCrystals(false)
    setStep(0)
  }
  
  const steps = [
    "Dissolve glucose in water",
    "Add phenylhydrazine (excess, 3 moles)",
    "Heat in boiling water bath for 30 min",
    "Cool - yellow crystals separate out"
  ]
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={handleStep}
          disabled={step >= 4}
          className="gap-2"
        >
          {step === 0 ? <><Beaker className="w-4 h-4" /> Add Glucose</> :
           step === 1 ? "Add Phenylhydrazine" :
           step === 2 ? <><Thermometer className="w-4 h-4" /> Heat</> :
           step === 3 ? "Crystallizing..." :
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
      
      {hasCrystals && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h4 className="font-semibold text-yellow-800">Glucosazone Crystals Formed!</h4>
          <p className="text-sm text-yellow-700 mt-1">
            Yellow crystalline osazone derivative of glucose
          </p>
          <p className="text-xs text-yellow-600 mt-2 font-mono">
            C₆H₁₂O₆ + 3C₆H₅NHNH₂ → C₆H₁₂O₄(NNHC₆H₅)₂ + C₆H₅NH₂ + NH₃ + 2H₂O
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Melting point: 204-205°C (decomp.)
          </p>
        </div>
      )}
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Osazone Formation:</h4>
        <p className="text-xs mb-2">
          Reducing sugars react with phenylhydrazine to form osazones.
          The reaction involves only C-1 and C-2, so glucose and fructose give the same osazone.
        </p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Glucose + excess phenylhydrazine → Glucosazone</li>
          <li>Characteristic yellow needle-shaped crystals</li>
          <li>Used for identification of reducing sugars</li>
          <li>Different sugars have different mp and crystal forms</li>
        </ol>
      </div>
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [6, 3, 6], fov: 50 }} shadows>
          <Scene 
            glucoseAdded={glucoseAdded}
            phenylhydrazineAdded={phenylhydrazineAdded}
            isHeating={isHeating}
            hasCrystals={hasCrystals}
          />
        </Canvas>
      </div>
    </div>
  )
}
