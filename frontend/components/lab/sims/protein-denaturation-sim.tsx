"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Thermometer, Beaker } from "lucide-react"
import * as THREE from "three"

// Test tubes with protein samples
function TestTubes({ 
  tubeStates
}: { 
  tubeStates: Array<{ denatured: boolean; method: string; color: string }>
}) {
  const positions = [
    { x: -1.5, label: "Control" },
    { x: -0.5, label: "Heat" },
    { x: 0.5, label: "Acid" },
    { x: 1.5, label: "Alcohol" }
  ]
  
  return (
    <group position={[0, 0, 0]}>
      {positions.map((pos, i) => (
        <group key={i} position={[pos.x, -0.5, 0]}>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
            <meshPhysicalMaterial 
              color="#ffffff"
              transmission={0.9}
              opacity={0.3}
              transparent
              roughness={0.1}
            />
          </mesh>
          
          {/* Protein solution */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.35, 16]} />
            <meshStandardMaterial 
              color={tubeStates[i]?.denatured ? tubeStates[i]?.color : "#fef3c7"}
              transparent
              opacity={0.8}
            />
          </mesh>
          
          {/* Coagulated precipitate */}
          {tubeStates[i]?.denatured && (
            <mesh position={[0, -0.3, 0]}>
              <sphereGeometry args={[0.12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={tubeStates[i]?.color} />
            </mesh>
          )}
          
          <Text position={[0, 0.5, 0]} fontSize={0.06} color="#2d3748" anchorX="center">
            {pos.label}
          </Text>
          <Text position={[0, -0.6, 0]} fontSize={0.05} color="#666666" anchorX="center">
            {tubeStates[i]?.denatured ? "Denatured" : "Native"}
          </Text>
        </group>
      ))}
    </group>
  )
}

// Bunsen burner for heating
function Burner({ isActive }: { isActive: boolean }) {
  return (
    <group position={[-0.5, -1.5, 0]}>
      <mesh>
        <cylinderGeometry args={[0.12, 0.15, 0.4, 16]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      {isActive && (
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[0.08, 0.25, 16]} />
          <meshStandardMaterial 
            color="#ed8936"
            emissive="#dd6b20"
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  )
}

// Scene
function Scene({ tubeStates }: any) {
  return (
    <>
      <color attach="background" args={["#f7fafc"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      <TestTubes tubeStates={tubeStates} />
      <Burner isActive={false} />
      
      <Text position={[0, 2.5, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
        Protein/Urea Denaturation
      </Text>
      
      <OrbitControls enablePan={false} minDistance={6} maxDistance={12} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

// Main Component
export function ProteinDenaturationSim() {
  const [tubeStates, setTubeStates] = useState([
    { denatured: false, method: "Control", color: "#fef3c7" },
    { denatured: false, method: "Heat", color: "#ffffff" },
    { denatured: false, method: "Acid", color: "#ffffff" },
    { denatured: false, method: "Alcohol", color: "#ffffff" }
  ])
  const [step, setStep] = useState(0)
  
  const handleTest = () => {
    if (step === 0) {
      // Heat tube 1
      setTubeStates(prev => prev.map((t, i) => 
        i === 1 ? { ...t, denatured: true, color: "#fed7aa" } : t
      ))
      setStep(1)
    } else if (step === 1) {
      // Acid to tube 2
      setTubeStates(prev => prev.map((t, i) => 
        i === 2 ? { ...t, denatured: true, color: "#fecaca" } : t
      ))
      setStep(2)
    } else if (step === 2) {
      // Alcohol to tube 3
      setTubeStates(prev => prev.map((t, i) => 
        i === 3 ? { ...t, denatured: true, color: "#ddd6fe" } : t
      ))
      setStep(3)
    }
  }
  
  const handleReset = () => {
    setTubeStates([
      { denatured: false, method: "Control", color: "#fef3c7" },
      { denatured: false, method: "Heat", color: "#ffffff" },
      { denatured: false, method: "Acid", color: "#ffffff" },
      { denatured: false, method: "Alcohol", color: "#ffffff" }
    ])
    setStep(0)
  }
  
  const methods = ["Heat (coagulation)", "Mineral acid (HCl)", "Organic solvent (alcohol)"]
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleTest} disabled={step >= 3} className="gap-2">
          <Play className="w-4 h-4" />
          {step === 0 ? "Apply Heat" :
           step === 1 ? "Add Acid" :
           step === 2 ? "Add Alcohol" :
           "Complete"}
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Control</span>
          <span className="text-lg font-semibold">Native</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Denatured</span>
          <span className="text-lg font-semibold">{tubeStates.filter(t => t.denatured).length}/3</span>
        </Badge>
      </div>
      
      <div className="space-y-2">
        {methods.map((m, i) => (
          <div 
            key={i}
            className={`p-2 rounded text-sm ${
              i === step - 1 ? 'bg-green-100 text-green-800' : 
              i < step - 1 ? 'bg-gray-100 text-gray-600' : 'text-gray-500'
            }`}
          >
            {i + 1}. {m}
          </div>
        ))}
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Denaturation:</h4>
        <p className="text-xs mb-2">
          Denaturation is the loss of protein secondary, tertiary and quaternary structure
          due to disruption of non-covalent interactions (hydrogen bonds, hydrophobic interactions).
        </p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li><strong>Heat:</strong> Breaks hydrogen bonds, causes coagulation</li>
          <li><strong>Acid/Base:</strong> Changes pH, disrupts ionic interactions</li>
          <li><strong>Organic solvents:</strong> Disrupt hydrophobic core</li>
          <li><strong>Heavy metals:</strong> Precipitate proteins</li>
          <li><strong>Urea/Guanidine:</strong> Disrupt hydrogen bonding</li>
        </ol>
      </div>
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [6, 3, 6], fov: 50 }} shadows>
          <Scene tubeStates={tubeStates} />
        </Canvas>
      </div>
    </div>
  )
}
