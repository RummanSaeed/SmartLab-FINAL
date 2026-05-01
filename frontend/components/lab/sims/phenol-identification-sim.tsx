"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, FlaskConical, Settings2 } from "lucide-react"
import * as THREE from "three"

// Test tube with colored solution
function TestTube({ 
  position, 
  liquidColor, 
  label,
  isReacting
}: { 
  position: [number, number, number]
  liquidColor: string
  label: string
  isReacting: boolean
}) {
  const liquidRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (isReacting && liquidRef.current) {
      const t = state.clock.elapsedTime * 3
      liquidRef.current.rotation.z = Math.sin(t) * 0.05
    }
  })

  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 0.8, 32]} />
        <meshPhysicalMaterial
          color="rgba(220, 235, 255, 0.3)"
          transmission={0.9}
          roughness={0.05}
          thickness={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>

      <mesh position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.12, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="rgba(220, 235, 255, 0.3)"
          transmission={0.9}
          roughness={0.05}
          thickness={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>

      <mesh ref={liquidRef} position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 32]} />
        <meshStandardMaterial 
          color={liquidColor} 
          transparent 
          opacity={0.9}
          emissive={liquidColor}
          emissiveIntensity={liquidColor === "#800080" ? 0.3 : 0}
        />
      </mesh>

      <Text position={[0, 0.6, 0]} fontSize={0.06} color="#1a202c" anchorX="center">
        {label}
      </Text>
    </group>
  )
}

// FeCl3 bottle (yellow-brown)
function FeCl3Bottle({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 0.5, 32]} />
        <meshPhysicalMaterial
          color="rgba(220, 235, 255, 0.4)"
          transmission={0.8}
          roughness={0.1}
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.4, 32]} />
        <meshStandardMaterial color="#daa520" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <Text position={[0, -0.5, 0]} fontSize={0.07} color="#1a202c" anchorX="center">
        FeCl₃ (aq)
      </Text>
    </group>
  )
}

function LabTable() {
  return (
    <mesh position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 6]} />
      <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
    </mesh>
  )
}

const COMPOUNDS = [
  { name: "Phenol", type: "Phenol", reacts: true, color: "#800080" }, // Violet
  { name: "Resorcinol", type: "Dihydric Phenol", reacts: true, color: "#4b0082" }, // Dark violet/blue
  { name: "Catechol", type: "Dihydric Phenol", reacts: true, color: "#006400" }, // Green
  { name: "Benzoic Acid", type: "Carboxylic Acid", reacts: false, color: "#fffff0" }, // Cream (no color)
  { name: "Ethanol", type: "Alcohol", reacts: false, color: "#fffff0" }, // No color
]

export function PhenolIdentificationSim() {
  const [selectedCompound, setSelectedCompound] = useState<number | null>(null)
  const [isReacting, setIsReacting] = useState(false)
  const [showResults, setShowResults] = useState<boolean[]>(new Array(5).fill(false))
  const [liquidColors, setLiquidColors] = useState<string[]>(new Array(5).fill("#fffff0"))

  const startTest = (index: number) => {
    setSelectedCompound(index)
    setIsReacting(true)
    
    const compound = COMPOUNDS[index]
    
    setTimeout(() => {
      const newColors = [...liquidColors]
      newColors[index] = compound.color
      setLiquidColors(newColors)
      
      setIsReacting(false)
      setShowResults(prev => {
        const newResults = [...prev]
        newResults[index] = true
        return newResults
      })
    }, 2000)
  }

  const resetAll = () => {
    setSelectedCompound(null)
    setIsReacting(false)
    setShowResults(new Array(5).fill(false))
    setLiquidColors(new Array(5).fill("#fffff0"))
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <FlaskConical className="w-3 h-3" />
          Phenol Identification
        </Badge>
        <Badge variant="outline">
          FeCl₃ Test (Violet Color)
        </Badge>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
          <color attach="background" args={["#f8fafc"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <pointLight position={[-5, 5, -5]} intensity={0.5} />
          
          <LabTable />

          {COMPOUNDS.map((compound, i) => (
            <TestTube
              key={i}
              position={[(i - 2) * 0.7, -0.3, 0]}
              liquidColor={liquidColors[i]}
              label={compound.name}
              isReacting={isReacting && selectedCompound === i}
            />
          ))}

          <FeCl3Bottle position={[-3, -0.4, 0.5]} />

          <Text position={[0, 1.2, 0]} fontSize={0.12} color="#1a202c" anchorX="center">
            FeCl₃ Test for Phenols (Violet/Green/Blue Color)
          </Text>

          <OrbitControls enablePan={false} minDistance={4} maxDistance={10} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      </div>

      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Settings2 className="w-4 h-4" />
          Test Controls
        </div>

        <div className="grid grid-cols-3 gap-2">
          {COMPOUNDS.map((compound, i) => (
            <Button
              key={i}
              variant={showResults[i] ? "default" : "outline"}
              size="sm"
              onClick={() => startTest(i)}
              disabled={isReacting || showResults[i]}
              className="text-xs"
            >
              {showResults[i] 
                ? `${compound.name}: ${compound.reacts ? "Color (+)" : "No color (-)"}`
                : `Test ${compound.name}`
              }
            </Button>
          ))}
        </div>

        <Button variant="outline" onClick={resetAll} disabled={isReacting} className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All
        </Button>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm space-y-2">
        <p className="font-medium text-foreground">Principle:</p>
        <p className="text-muted-foreground">
          Phenols react with neutral ferric chloride (FeCl₃) solution to form colored complexes. 
          Simple phenols give violet/blue colors, while substituted phenols may give green, blue, or red colors.
        </p>
        <p className="text-muted-foreground mt-2">
          <span className="font-medium">Reaction:</span> 6C₆H₅OH + FeCl₃ → [Fe(OC₆H₅)₆]³⁻ + 3H⁺ + 3HCl
        </p>
        <p className="text-muted-foreground mt-2">
          <span className="font-medium">Color Guide:</span>
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div><span className="inline-block w-3 h-3 rounded mr-1" style={{backgroundColor: "#800080"}} /> Phenol - Violet</div>
          <div><span className="inline-block w-3 h-3 rounded mr-1" style={{backgroundColor: "#4b0082"}} /> Resorcinol - Dark blue-violet</div>
          <div><span className="inline-block w-3 h-3 rounded mr-1" style={{backgroundColor: "#006400"}} /> Catechol - Green</div>
          <div><span className="inline-block w-3 h-3 rounded mr-1" style={{backgroundColor: "#fffff0"}} /> Carboxylic acids/Alcohols - No color</div>
        </div>
      </div>
    </div>
  )
}
