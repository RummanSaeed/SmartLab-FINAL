"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, FlaskConical, Settings2 } from "lucide-react"
import * as THREE from "three"

// Test tube with KMnO4 and organic compound
function TestTube({ 
  position, 
  liquidColor, 
  label,
  isReacting,
  hasLayers
}: { 
  position: [number, number, number]
  liquidColor: string
  label: string
  isReacting: boolean
  hasLayers: boolean
}) {
  const liquidRef = useRef<THREE.Mesh>(null)
  const organicLayerRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (isReacting && liquidRef.current) {
      const t = state.clock.elapsedTime * 2
      liquidRef.current.rotation.z = Math.sin(t) * 0.1
    }
    if (hasLayers && organicLayerRef.current) {
      const t = state.clock.elapsedTime
      organicLayerRef.current.position.y = 0.05 + Math.sin(t) * 0.01
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

      {/* Aqueous layer (KMnO4 or decolorized) */}
      <mesh ref={liquidRef} position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.4, 32]} />
        <meshStandardMaterial 
          color={liquidColor} 
          transparent 
          opacity={0.9}
        />
      </mesh>

      {/* Organic layer (for immiscible liquids) */}
      {hasLayers && (
        <mesh ref={organicLayerRef} position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.15, 32]} />
          <meshStandardMaterial 
            color="#fffacd" 
            transparent 
            opacity={0.8}
          />
        </mesh>
      )}

      <Text position={[0, 0.6, 0]} fontSize={0.06} color="#1a202c" anchorX="center">
        {label}
      </Text>
    </group>
  )
}

// KMnO4 bottle
function KMnO4Bottle({ position }: { position: [number, number, number] }) {
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
        <meshStandardMaterial color="#9400d3" transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <Text position={[0, -0.5, 0]} fontSize={0.07} color="#1a202c" anchorX="center">
        Dilute KMnO₄
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
  { name: "Ethylene", type: "Alkene", saturated: false, hasLayers: false },
  { name: "Acetylene", type: "Alkyne", saturated: false, hasLayers: false },
  { name: "Benzene", type: "Aromatic", saturated: false, hasLayers: true },
  { name: "Cyclohexane", type: "Cycloalkane", saturated: true, hasLayers: true },
  { name: "Hexane", type: "Alkane", saturated: true, hasLayers: true },
]

export function KMnO4UnsaturationSim() {
  const [selectedCompound, setSelectedCompound] = useState<number | null>(null)
  const [isReacting, setIsReacting] = useState(false)
  const [showResults, setShowResults] = useState<boolean[]>(new Array(5).fill(false))
  const [liquidColors, setLiquidColors] = useState<string[]>(new Array(5).fill("#9400d3"))
  const [showLayers, setShowLayers] = useState<boolean[]>(new Array(5).fill(false))

  const startTest = (index: number) => {
    setSelectedCompound(index)
    setIsReacting(true)
    
    const compound = COMPOUNDS[index]
    
    setTimeout(() => {
      const newColors = [...liquidColors]
      const newLayers = [...showLayers]
      
      if (compound.saturated) {
        // Saturated compounds: No reaction, purple color persists
        newColors[index] = "#9400d3" // Purple
      } else {
        // Unsaturated compounds: KMnO4 decolorized (brown precipitate of MnO2)
        newColors[index] = "#8b4513" // Brown
      }
      
      newLayers[index] = compound.hasLayers
      
      setLiquidColors(newColors)
      setShowLayers(newLayers)
      
      setIsReacting(false)
      setShowResults(prev => {
        const newResults = [...prev]
        newResults[index] = true
        return newResults
      })
    }, 2500)
  }

  const resetAll = () => {
    setSelectedCompound(null)
    setIsReacting(false)
    setShowResults(new Array(5).fill(false))
    setLiquidColors(new Array(5).fill("#9400d3"))
    setShowLayers(new Array(5).fill(false))
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <FlaskConical className="w-3 h-3" />
          KMnO₄ Test for Unsaturation
        </Badge>
        <Badge variant="outline">
          Baeyer's Test (Color Change)
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
              hasLayers={showLayers[i]}
            />
          ))}

          <KMnO4Bottle position={[-3, -0.4, 0.5]} />

          <Text position={[0, 1.2, 0]} fontSize={0.12} color="#1a202c" anchorX="center">
            Baeyer's Test: Purple → Colorless/Brown (unsaturation)
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
                ? `${compound.name}: ${compound.saturated ? "No change (-)" : "Decolorized (+)"}`
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
        <p className="font-medium text-foreground">Principle (Baeyer's Test):</p>
        <p className="text-muted-foreground">
          Unsaturated compounds (alkenes, alkynes) decolorize purple potassium permanganate (KMnO₄) 
          solution, forming a brown precipitate of manganese dioxide (MnO₂). Saturated compounds 
          (alkanes, cycloalkanes) do not react and the purple color persists.
        </p>
        <p className="text-muted-foreground mt-2">
          <span className="font-medium">Reaction (with alkene):</span>
        </p>
        <p className="text-muted-foreground text-xs">
          3RCH=CHR' + 2KMnO₄ + 4H₂O → 3RCH(OH)-CH(OH)R' + 2MnO₂↓ + 2KOH
        </p>
        <p className="text-muted-foreground mt-2">
          <span className="font-medium">Result Guide:</span>
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div><span className="inline-block w-3 h-3 rounded mr-1" style={{backgroundColor: "#8b4513"}} /> Unsaturated - Decolorized (brown)</div>
          <div><span className="inline-block w-3 h-3 rounded mr-1" style={{backgroundColor: "#9400d3"}} /> Saturated - Purple persists</div>
        </div>
      </div>
    </div>
  )
}
