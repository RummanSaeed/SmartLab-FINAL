"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Flame, TestTube } from "lucide-react"
import * as THREE from "three"

// Round bottom flask with reaction
function ReactionFlask({ 
  isHeating,
  bubbles
}: { 
  isHeating: boolean
  bubbles: boolean
}) {
  const flaskRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (flaskRef.current && isHeating) {
      flaskRef.current.position.y = Math.sin(state.clock.elapsedTime * 10) * 0.01
    }
  })
  
  return (
    <group ref={flaskRef} position={[-1, -0.3, 0]}>
      {/* Flask */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.2}
          transparent
          roughness={0.1}
          thickness={0.05}
        />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.2, 0.5, 0.5, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.2}
          transparent
          roughness={0.1}
          thickness={0.05}
        />
      </mesh>
      
      {/* Liquid - ethylene bromide + KOH */}
      <mesh position={[0, -0.2, 0]}>
        <sphereGeometry args={[0.45, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#90cdf4" transparent opacity={0.6} />
      </mesh>
      
      {/* Delivery tube */}
      <mesh position={[0.2, 0.7, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      
      <Text position={[0, -0.8, 0]} fontSize={0.07} color="#2d3748" anchorX="center">
        C₂H₄Br₂ + alc. KOH
      </Text>
    </group>
  )
}

// Bunsen burner
function Burner({ isActive }: { isActive: boolean }) {
  return (
    <group position={[-1, -1.5, 0]}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.25, 0.5, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
        <meshStandardMaterial color="#718096" />
      </mesh>
      
      {isActive && (
        <mesh position={[0, 0.55, 0]}>
          <coneGeometry args={[0.15, 0.4, 16]} />
          <meshStandardMaterial 
            color="#ed8936"
            emissive="#dd6b20"
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
      
      <Text position={[0, -0.5, 0]} fontSize={0.07} color="#718096" anchorX="center">
        Heat gently
      </Text>
    </group>
  )
}

// Gas collection apparatus
function GasCollection({ hasGas }: { hasGas: boolean }) {
  return (
    <group position={[2, -0.5, 0]}>
      {/* Gas jar */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 1.2, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.15}
          transparent
          roughness={0.1}
        />
      </mesh>
      
      {/* Water level */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.6, 32]} />
        <meshStandardMaterial color="#90cdf4" transparent opacity={0.4} />
      </mesh>
      
      {/* Gas bubbles */}
      {hasGas && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh key={i} position={[(Math.random() - 0.5) * 0.2, -0.5 + Math.random() * 0.4, (Math.random() - 0.5) * 0.2]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
            </mesh>
          ))}
        </>
      )}
      
      {/* Trough */}
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.2, 32]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[0, -1.0, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.15, 32]} />
        <meshStandardMaterial color="#90cdf4" transparent opacity={0.6} />
      </mesh>
      
      <Text position={[0, 0.8, 0]} fontSize={0.07} color="#2d3748" anchorX="center">
        Over water
      </Text>
    </group>
  )
}

// Test tube for ethene tests
function EtheneTestTube({ hasEthene, testPositive }: { hasEthene: boolean; testPositive: boolean }) {
  return (
    <group position={[3.5, -0.5, 0]}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 0.6, 16]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.3}
          transparent
          roughness={0.1}
        />
      </mesh>
      
      {/* Bromine water */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.2, 16]} />
        <meshStandardMaterial 
          color={testPositive ? "#fef3c7" : "#fbbf24"}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      <Text position={[0, 0.5, 0]} fontSize={0.06} color="#2d3748" anchorX="center">
        Br₂ water
      </Text>
      <Text position={[0, -0.6, 0]} fontSize={0.06} color={testPositive ? "#22c55e" : "#ef4444"} anchorX="center">
        {testPositive ? "Colorless!" : "Orange"}
      </Text>
    </group>
  )
}

// Scene
function Scene({ isHeating, hasGas, hasEthene, testPositive }: any) {
  return (
    <>
      <color attach="background" args={["#020817"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      <ReactionFlask isHeating={isHeating} bubbles={hasGas} />
      <Burner isActive={isHeating} />
      <GasCollection hasGas={hasGas} />
      <EtheneTestTube hasEthene={hasEthene} testPositive={testPositive} />
      
      <Text position={[0, 3, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
        Preparation of Ethylene (Ethene)
      </Text>
      
      <OrbitControls enablePan={false} minDistance={8} maxDistance={16} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

// Main Component
export function EthylenePreparationSim() {
  const [step, setStep] = useState(0)
  const [isHeating, setIsHeating] = useState(false)
  const [hasGas, setHasGas] = useState(false)
  const [hasEthene, setHasEthene] = useState(false)
  const [testPositive, setTestPositive] = useState(false)
  
  const handleStart = () => {
    if (step === 0) {
      setIsHeating(true)
      setStep(1)
      
      setTimeout(() => {
        setHasGas(true)
        setStep(2)
      }, 2000)
      
      setTimeout(() => {
        setHasEthene(true)
        setIsHeating(false)
        setStep(3)
      }, 4000)
    } else if (step === 3) {
      setTestPositive(true)
      setStep(4)
    }
  }
  
  const handleReset = () => {
    setStep(0)
    setIsHeating(false)
    setHasGas(false)
    setHasEthene(false)
    setTestPositive(false)
  }
  
  const steps = [
    "Add ethylene bromide + alcoholic KOH to flask",
    "Heat gently with Bunsen burner",
    "Ethene gas evolved - collect over water",
    "Test with bromine water"
  ]
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={handleStart}
          disabled={step >= 4}
          className="gap-2"
        >
          {step === 0 ? <><Flame className="w-4 h-4" /> Start Heating</> :
           step === 3 ? <><TestTube className="w-4 h-4" /> Test with Br₂</> :
           "Running..."}
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
      
      {testPositive && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h4 className="font-semibold text-green-800">Bromine Test Positive!</h4>
          <p className="text-sm text-green-700 mt-1">
            Orange bromine water turns colorless - confirms unsaturation (C=C bond)
          </p>
          <p className="text-xs text-green-600 mt-2 font-mono">
            CH₂=CH₂ + Br₂ → CH₂Br-CH₂Br
          </p>
        </div>
      )}
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Elimination Reaction:</h4>
        <p className="text-xs mb-2 font-mono">
          CH₂Br-CH₂Br + 2KOH → CH₂=CH₂ + 2KBr + 2H₂O
        </p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>1,2-dibromoethane (ethylene bromide) + alcoholic KOH</li>
          <li>Heat under reflux (dehydrohalogenation)</li>
          <li>Ethene gas collected over water (insoluble)</li>
          <li>Test: Decolorizes Br₂ water (addition reaction)</li>
          <li>Also decolorizes KMnO₄ (Baeyer's test)</li>
        </ol>
      </div>
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [8, 4, 8], fov: 50 }} shadows>
          <Scene 
            isHeating={isHeating}
            hasGas={hasGas}
            hasEthene={hasEthene}
            testPositive={testPositive}
          />
        </Canvas>
      </div>
    </div>
  )
}
