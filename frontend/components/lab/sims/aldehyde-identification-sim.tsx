"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, FlaskConical, Settings2 } from "lucide-react"
import * as THREE from "three"

// Test tube with liquid
function TestTube({ 
  position, 
  liquidColor, 
  label,
  hasPrecipitate,
  isHeating,
  showMirror
}: { 
  position: [number, number, number]
  liquidColor: string
  label: string
  hasPrecipitate: boolean
  isHeating: boolean
  showMirror: boolean
}) {
  const liquidRef = useRef<THREE.Mesh>(null)
  const precipitateRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (isHeating && liquidRef.current) {
      const t = state.clock.elapsedTime * 4
      liquidRef.current.position.y = -0.15 + Math.sin(t) * 0.02
    }
    if (hasPrecipitate && precipitateRef.current) {
      const t = state.clock.elapsedTime * 0.5
      precipitateRef.current.children.forEach((p, i) => {
        p.position.y = ((t + i * 0.3) % 0.4) - 0.3
      })
    }
  })

  return (
    <group position={position}>
      {/* Test tube */}
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

      {/* Liquid */}
      <mesh ref={liquidRef} position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 32]} />
        <meshStandardMaterial color={liquidColor} transparent opacity={0.85} />
      </mesh>

      {/* Red precipitate for Fehling's test */}
      {hasPrecipitate && (
        <group ref={precipitateRef}>
          {Array.from({ length: 15 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 0.15,
                -0.3 + (i * 0.02),
                (Math.random() - 0.5) * 0.15
              ]}
            >
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshStandardMaterial color="#8b0000" roughness={0.8} />
            </mesh>
          ))}
        </group>
      )}

      {/* Silver mirror for Tollen's test */}
      {showMirror && (
        <mesh position={[0, -0.38, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.05, 32]} />
          <meshStandardMaterial
            color="#c0c0c0"
            metalness={0.95}
            roughness={0.1}
            emissive="#404040"
            emissiveIntensity={0.2}
          />
        </mesh>
      )}

      <Text position={[0, 0.6, 0]} fontSize={0.07} color="#1a202c" anchorX="center">
        {label}
      </Text>
    </group>
  )
}

// Water bath for heating
function WaterBath({ isHeating }: { isHeating: boolean }) {
  const bubblesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (isHeating && bubblesRef.current) {
      bubblesRef.current.children.forEach((b, i) => {
        const t = state.clock.elapsedTime * 2 + i
        b.position.y = -1.2 + (t % 0.3)
        b.visible = (t % 0.3) < 0.15
      })
    }
  })

  return (
    <group position={[0, -1.3, 0]}>
      {/* Beaker */}
      <mesh>
        <cylinderGeometry args={[0.8, 0.7, 0.6, 32]} />
        <meshPhysicalMaterial
          color="rgba(220, 235, 255, 0.2)"
          transmission={0.9}
          roughness={0.05}
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Water */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.75, 0.65, 0.4, 32]} />
        <meshStandardMaterial color="#87ceeb" transparent opacity={0.6} />
      </mesh>

      {/* Bubbles when heating */}
      <group ref={bubblesRef}>
        {Array.from({ length: 10 }).map((_, i) => (
          <mesh key={i} position={[(i - 5) * 0.1, -1.2, 0]} visible={false}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function LabTable() {
  return (
    <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[12, 6]} />
      <meshStandardMaterial color="#334155" roughness={0.8} />
    </mesh>
  )
}

const COMPOUNDS = [
  { name: "Formaldehyde", type: "Aldehyde", fehlingResult: true, tollenResult: true },
  { name: "Acetaldehyde", type: "Aldehyde", fehlingResult: true, tollenResult: true },
  { name: "Acetone", type: "Ketone", fehlingResult: false, tollenResult: false },
  { name: "Benzaldehyde", type: "Aromatic Aldehyde", fehlingResult: false, tollenResult: true },
]

export function AldehydeIdentificationSim() {
  const [selectedTest, setSelectedTest] = useState<"fehling" | "tollen">("fehling")
  const [selectedCompound, setSelectedCompound] = useState<number | null>(null)
  const [isHeating, setIsHeating] = useState(false)
  const [showResults, setShowResults] = useState<boolean[]>(new Array(4).fill(false))
  const [liquidColors, setLiquidColors] = useState<string[]>(new Array(4).fill("#87ceeb"))
  const [showPrecipitate, setShowPrecipitate] = useState<boolean[]>(new Array(4).fill(false))
  const [showMirror, setShowMirror] = useState<boolean[]>(new Array(4).fill(false))

  const startTest = (index: number) => {
    setSelectedCompound(index)
    setIsHeating(true)
    
    const compound = COMPOUNDS[index]
    
    setTimeout(() => {
      const newColors = [...liquidColors]
      const newPrecipitate = [...showPrecipitate]
      const newMirror = [...showMirror]
      const newResults = [...showResults]
      
      if (selectedTest === "fehling") {
        // Fehling's test: Blue → Green → Red precipitate (for aldehydes)
        if (compound.fehlingResult) {
          newColors[index] = "#228b22" // Green intermediate
          setLiquidColors(newColors)
          
          setTimeout(() => {
            newColors[index] = "#8b0000" // Red with precipitate
            newPrecipitate[index] = true
            setLiquidColors(newColors)
            setShowPrecipitate(newPrecipitate)
            setIsHeating(false)
            newResults[index] = true
            setShowResults(newResults)
          }, 2000)
        } else {
          newColors[index] = "#228b22" // Just green, no precipitate
          setLiquidColors(newColors)
          setIsHeating(false)
          newResults[index] = true
          setShowResults(newResults)
        }
      } else {
        // Tollen's test: Clear → Silver mirror (for aldehydes)
        if (compound.tollenResult) {
          newMirror[index] = true
          setShowMirror(newMirror)
        }
        setIsHeating(false)
        newResults[index] = true
        setShowResults(newResults)
      }
    }, 2000)
  }

  const resetAll = () => {
    setSelectedCompound(null)
    setIsHeating(false)
    setShowResults(new Array(4).fill(false))
    setLiquidColors(new Array(4).fill("#87ceeb"))
    setShowPrecipitate(new Array(4).fill(false))
    setShowMirror(new Array(4).fill(false))
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <FlaskConical className="w-3 h-3" />
          Aldehyde Identification
        </Badge>
        <Badge variant="outline">
          Fehling's & Tollen's Tests
        </Badge>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
          <color attach="background" args={["#020817"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <pointLight position={[-5, 5, -5]} intensity={0.5} />
          
          <LabTable />
          <WaterBath isHeating={isHeating} />

          {COMPOUNDS.map((compound, i) => (
            <TestTube
              key={i}
              position={[(i - 1.5) * 0.8, -0.5, 0]}
              liquidColor={liquidColors[i]}
              label={compound.name}
              hasPrecipitate={showPrecipitate[i]}
              isHeating={isHeating && selectedCompound === i}
              showMirror={showMirror[i]}
            />
          ))}

          <Text position={[0, 1.5, 0]} fontSize={0.12} color="#1a202c" anchorX="center">
            {selectedTest === "fehling" ? "Fehling's Test (Blue → Red ppt)" : "Tollen's Test (Silver Mirror)"}
          </Text>

          <OrbitControls enablePan={false} minDistance={4} maxDistance={10} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      </div>

      {/* Test Selection */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Settings2 className="w-4 h-4" />
          Select Test
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={selectedTest === "fehling" ? "default" : "outline"}
            onClick={() => setSelectedTest("fehling")}
            className="text-xs"
          >
            Fehling's Test
            <div className="ml-2 w-3 h-3 rounded-full bg-blue-500" />
          </Button>
          <Button
            variant={selectedTest === "tollen" ? "default" : "outline"}
            onClick={() => setSelectedTest("tollen")}
            className="text-xs"
          >
            Tollen's Test
            <div className="ml-2 w-3 h-3 rounded-full bg-gray-300" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {COMPOUNDS.map((compound, i) => (
            <Button
              key={i}
              variant={showResults[i] ? "default" : "outline"}
              size="sm"
              onClick={() => startTest(i)}
              disabled={isHeating || showResults[i]}
              className="text-xs"
            >
              {showResults[i] 
                ? `${compound.name}: ${selectedTest === "fehling" 
                    ? (compound.fehlingResult ? "Positive (+)" : "Negative (-)")
                    : (compound.tollenResult ? "Positive (+)" : "Negative (-)")}`
                : `Test ${compound.name}`
              }
            </Button>
          ))}
        </div>

        <Button variant="outline" onClick={resetAll} disabled={isHeating} className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All
        </Button>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm space-y-2">
        <p className="font-medium text-foreground">Test Principles:</p>
        <p className="text-muted-foreground">
          <span className="font-medium">Fehling's Test:</span> Aldehydes reduce Cu²⁺ (blue) to Cu⁺ (red Cu₂O precipitate). 
          Ketones do not react (solution stays blue/green).
        </p>
        <p className="text-muted-foreground">
          <span className="font-medium">Tollen's Test:</span> Aldehydes reduce [Ag(NH₃)₂]⁺ to metallic silver (mirror). 
          Ketones do not react (no mirror formed).
        </p>
      </div>
    </div>
  )
}
