"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, FlaskConical, Settings2 } from "lucide-react"
import * as THREE from "three"

// Test tube with substance and indicator
function TestTube({ 
  position, 
  color, 
  label, 
  isTesting,
  classification
}: { 
  position: [number, number, number]
  color: string
  label: string
  isTesting: boolean
  classification: string | null
}) {
  const liquidRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (isTesting && liquidRef.current) {
      const t = state.clock.elapsedTime * 3
      liquidRef.current.rotation.y = Math.sin(t) * 0.2
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

      {/* Rounded bottom */}
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
        <meshStandardMaterial color={color} transparent opacity={0.85} />
      </mesh>

      {/* Classification label */}
      {classification && (
        <Text position={[0, -0.8, 0]} fontSize={0.07} color="#1a202c" anchorX="center">
          {classification}
        </Text>
      )}

      {/* Substance label */}
      <Text position={[0, 0.6, 0]} fontSize={0.06} color="#1a202c" anchorX="center">
        {label}
      </Text>
    </group>
  )
}

// Indicator bottles
function IndicatorBottle({ position, color, name }: { position: [number, number, number], color: string, name: string }) {
  return (
    <group position={position}>
      {/* Bottle body */}
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 0.5, 32]} />
        <meshPhysicalMaterial
          color="rgba(220, 235, 255, 0.4)"
          transmission={0.8}
          roughness={0.1}
          thickness={0.1}
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Indicator liquid */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.4, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.9} />
      </mesh>

      {/* Cap */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      <Text position={[0, -0.5, 0]} fontSize={0.07} color="#1a202c" anchorX="center">
        {name}
      </Text>
    </group>
  )
}

function LabTable() {
  return (
    <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[12, 6]} />
      <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
    </mesh>
  )
}

const SUBSTANCES = [
  { name: "HCl", actual: "Acid", litmusRed: "Red", litmusBlue: "Red", pheno: "Colorless", methylOrange: "Red" },
  { name: "NaOH", actual: "Base", litmusRed: "Blue", litmusBlue: "Blue", pheno: "Pink", methylOrange: "Yellow" },
  { name: "NaCl", actual: "Neutral", litmusRed: "Red", litmusBlue: "Blue", pheno: "Colorless", methylOrange: "Orange" },
  { name: "Vinegar", actual: "Acid", litmusRed: "Red", litmusBlue: "Red", pheno: "Colorless", methylOrange: "Red" },
  { name: "Soap", actual: "Base", litmusRed: "Blue", litmusBlue: "Blue", pheno: "Pink", methylOrange: "Yellow" },
  { name: "Sugar", actual: "Neutral", litmusRed: "Red", litmusBlue: "Blue", pheno: "Colorless", methylOrange: "Orange" },
]

const INDICATOR_COLORS: Record<string, string> = {
  "Red": "#ff4444",
  "Blue": "#4444ff",
  "Pink": "#ff69b4",
  "Yellow": "#ffd700",
  "Orange": "#ffa500",
  "Colorless": "#f0f0f0",
}

export function ClassifySubstancesSim() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [indicatorType, setIndicatorType] = useState<"litmusRed" | "litmusBlue" | "pheno" | "methylOrange">("litmusRed")
  const [isTesting, setIsTesting] = useState(false)
  const [results, setResults] = useState<(string | null)[]>(new Array(6).fill(null))
  const [colors, setColors] = useState<string[]>(new Array(6).fill("#f0f0f0"))

  const startTest = (index: number) => {
    setSelectedIndex(index)
    setIsTesting(true)
    
    setTimeout(() => {
      setIsTesting(false)
      const substance = SUBSTANCES[index]
      const resultColor = INDICATOR_COLORS[substance[indicatorType]]
      
      setColors(prev => {
        const newColors = [...prev]
        newColors[index] = resultColor
        return newColors
      })
      
      setResults(prev => {
        const newResults = [...prev]
        newResults[index] = substance.actual
        return newResults
      })
    }, 1500)
  }

  const resetAll = () => {
    setSelectedIndex(null)
    setIsTesting(false)
    setResults(new Array(6).fill(null))
    setColors(new Array(6).fill("#f0f0f0"))
  }

  const getIndicatorColor = (type: string) => {
    switch(type) {
      case "litmusRed": return "#ff4444"
      case "litmusBlue": return "#4444ff"
      case "pheno": return "#ffffff"
      case "methylOrange": return "#ffa500"
      default: return "#ffffff"
    }
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <FlaskConical className="w-3 h-3" />
          Classify Substances (Acid/Base/Neutral)
        </Badge>
        <Badge variant="outline">
          Using Acid-Base Indicators
        </Badge>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [0, 2, 7], fov: 50 }}>
          <color attach="background" args={["#f8fafc"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <pointLight position={[-5, 5, -5]} intensity={0.5} />
          
          <LabTable />

          {/* Test tubes */}
          {SUBSTANCES.map((substance, i) => (
            <TestTube
              key={i}
              position={[(i - 2.5) * 0.9, 0, 0]}
              color={colors[i]}
              label={substance.name}
              isTesting={isTesting && selectedIndex === i}
              classification={results[i]}
            />
          ))}

          {/* Indicator bottles */}
          <IndicatorBottle position={[-3, -0.5, 1]} color="#ff4444" name="Litmus (Red)" />
          <IndicatorBottle position={[-2.2, -0.5, 1]} color="#4444ff" name="Litmus (Blue)" />
          <IndicatorBottle position={[2.2, -0.5, 1]} color="#ffffff" name="Phenolphthalein" />
          <IndicatorBottle position={[3, -0.5, 1]} color="#ffa500" name="Methyl Orange" />

          <OrbitControls enablePan={false} minDistance={5} maxDistance={12} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      </div>

      {/* Indicator Selection */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Settings2 className="w-4 h-4" />
          Select Indicator
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { id: "litmusRed", name: "Red Litmus", color: "#ff4444" },
            { id: "litmusBlue", name: "Blue Litmus", color: "#4444ff" },
            { id: "pheno", name: "Phenolphthalein", color: "#ffffff" },
            { id: "methylOrange", name: "Methyl Orange", color: "#ffa500" },
          ].map((ind) => (
            <Button
              key={ind.id}
              variant={indicatorType === ind.id ? "default" : "outline"}
              size="sm"
              onClick={() => setIndicatorType(ind.id as any)}
              className="text-xs flex flex-col items-center gap-1"
            >
              <div className="w-4 h-4 rounded" style={{ backgroundColor: ind.color, border: '1px solid #ccc' }} />
              {ind.name}
            </Button>
          ))}
        </div>

        {/* Substance buttons */}
        <div className="grid grid-cols-3 gap-2">
          {SUBSTANCES.map((substance, i) => (
            <Button
              key={i}
              variant={results[i] ? "default" : "outline"}
              size="sm"
              onClick={() => startTest(i)}
              disabled={isTesting || results[i] !== null}
              className="text-xs"
            >
              {results[i] ? `${substance.name}: ${results[i]}` : `Test ${substance.name}`}
            </Button>
          ))}
        </div>

        <Button variant="outline" onClick={resetAll} disabled={isTesting} className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All
        </Button>
      </div>

      {/* Legend */}
      <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm space-y-2">
        <p className="font-medium text-foreground">Indicator Color Changes:</p>
        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
          <div><span className="font-medium">Red Litmus:</span> Blue in base, unchanged in acid</div>
          <div><span className="font-medium">Blue Litmus:</span> Red in acid, unchanged in base</div>
          <div><span className="font-medium">Phenolphthalein:</span> Pink in base, colorless in acid</div>
          <div><span className="font-medium">Methyl Orange:</span> Red in acid, yellow in base</div>
        </div>
      </div>
    </div>
  )
}
