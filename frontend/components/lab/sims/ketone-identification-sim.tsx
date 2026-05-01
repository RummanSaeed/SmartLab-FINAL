"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, FlaskConical, Settings2 } from "lucide-react"
import * as THREE from "three"

// Test tube with liquid and precipitate
function TestTube({ 
  position, 
  liquidColor, 
  label,
  hasPrecipitate,
  precipitateColor,
  isReacting
}: { 
  position: [number, number, number]
  liquidColor: string
  label: string
  hasPrecipitate: boolean
  precipitateColor: string
  isReacting: boolean
}) {
  const liquidRef = useRef<THREE.Mesh>(null)
  const precipitateRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (isReacting && liquidRef.current) {
      const t = state.clock.elapsedTime * 3
      liquidRef.current.rotation.z = Math.sin(t) * 0.1
    }
    if (hasPrecipitate && precipitateRef.current) {
      const t = state.clock.elapsedTime * 0.8
      precipitateRef.current.children.forEach((p, i) => {
        p.position.y = -0.35 + Math.sin(t + i * 0.5) * 0.02
      })
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
        <meshStandardMaterial color={liquidColor} transparent opacity={0.85} />
      </mesh>

      {/* Orange precipitate (2,4-DNPH) */}
      {hasPrecipitate && (
        <group ref={precipitateRef}>
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 0.12,
                -0.35,
                (Math.random() - 0.5) * 0.12
              ]}
            >
              <sphereGeometry args={[0.012, 8, 8]} />
              <meshStandardMaterial color={precipitateColor} roughness={0.7} />
            </mesh>
          ))}
        </group>
      )}

      <Text position={[0, 0.6, 0]} fontSize={0.07} color="#1a202c" anchorX="center">
        {label}
      </Text>
    </group>
  )
}

// Reagent bottle
function ReagentBottle({ position, color, name }: { position: [number, number, number], color: string, name: string }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 0.4, 32]} />
        <meshPhysicalMaterial
          color="rgba(220, 235, 255, 0.4)"
          transmission={0.8}
          roughness={0.1}
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.35, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <Text position={[0, -0.4, 0]} fontSize={0.06} color="#1a202c" anchorX="center">
        {name}
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
  { name: "Acetone", type: "Ketone", dnphResult: true },
  { name: "Acetaldehyde", type: "Aldehyde", dnphResult: true },
  { name: "Propanone", type: "Ketone", dnphResult: true },
  { name: "Ethanol", type: "Alcohol", dnphResult: false },
]

export function KetoneIdentificationSim() {
  const [selectedCompound, setSelectedCompound] = useState<number | null>(null)
  const [isReacting, setIsReacting] = useState(false)
  const [showResults, setShowResults] = useState<boolean[]>(new Array(4).fill(false))
  const [liquidColors, setLiquidColors] = useState<string[]>(new Array(4).fill("#f5f5f5"))
  const [showPrecipitate, setShowPrecipitate] = useState<boolean[]>(new Array(4).fill(false))

  const startTest = (index: number) => {
    setSelectedCompound(index)
    setIsReacting(true)
    
    const compound = COMPOUNDS[index]
    
    setTimeout(() => {
      const newColors = [...liquidColors]
      const newPrecipitate = [...showPrecipitate]
      const newResults = [...showResults]
      
      if (compound.dnphResult) {
        // 2,4-DNPH test: Forms orange/red precipitate with carbonyl compounds
        newPrecipitate[index] = true
        newColors[index] = "#ff8c00"
      } else {
        newColors[index] = "#ffffe0"
      }
      
      setLiquidColors(newColors)
      setShowPrecipitate(newPrecipitate)
      setIsHeating(false)
      newResults[index] = true
      setShowResults(newResults)
      setIsReacting(false)
    }, 2000)
  }

  const resetAll = () => {
    setSelectedCompound(null)
    setIsReacting(false)
    setShowResults(new Array(4).fill(false))
    setLiquidColors(new Array(4).fill("#f5f5f5"))
    setShowPrecipitate(new Array(4).fill(false))
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <FlaskConical className="w-3 h-3" />
          Ketone Identification
        </Badge>
        <Badge variant="outline">
          2,4-DNPH Test (Orange Precipitate)
        </Badge>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
          <color attach="background" args={["#f8fafc"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <pointLight position={[-5, 5, -5]} intensity={0.5} />
          
          <LabTable />

          {COMPOUNDS.map((compound, i) => (
            <TestTube
              key={i}
              position={[(i - 1.5) * 0.7, -0.3, 0]}
              liquidColor={liquidColors[i]}
              label={compound.name}
              hasPrecipitate={showPrecipitate[i]}
              precipitateColor="#ff8c00"
              isReacting={isReacting && selectedCompound === i}
            />
          ))}

          <ReagentBottle position={[-2.5, -0.4, 0.5]} color="#ffff00" name="2,4-DNPH" />

          <Text position={[0, 1.2, 0]} fontSize={0.12} color="#1a202c" anchorX="center">
            2,4-Dinitrophenylhydrazine Test
          </Text>

          <OrbitControls enablePan={false} minDistance={4} maxDistance={10} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      </div>

      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Settings2 className="w-4 h-4" />
          Test Controls
        </div>

        <div className="grid grid-cols-2 gap-2">
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
                ? `${compound.name}: ${compound.dnphResult ? "Orange ppt (+)" : "No ppt (-)"}`
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
          2,4-Dinitrophenylhydrazine (2,4-DNPH or Brady's reagent) reacts with carbonyl compounds 
          (aldehydes and ketones) to form orange/yellow precipitates of 2,4-dinitrophenylhydrazones.
        </p>
        <p className="text-muted-foreground mt-2">
          <span className="font-medium">Limitation:</span> This test is positive for BOTH aldehydes and ketones 
          (both contain C=O group). It cannot distinguish between them - use Fehling's or Tollen's test for that.
        </p>
      </div>
    </div>
  )
}
