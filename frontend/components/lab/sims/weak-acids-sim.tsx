"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Droplets, Settings2 } from "lucide-react"
import * as THREE from "three"

// Test tube with natural substance
function TestTube({ 
  position, 
  color, 
  label, 
  phColor,
  isTesting 
}: { 
  position: [number, number, number]
  color: string
  label: string
  phColor: string
  isTesting: boolean
}) {
  const liquidRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (isTesting && liquidRef.current) {
      const t = state.clock.elapsedTime * 2
      liquidRef.current.scale.y = 1 + Math.sin(t) * 0.05
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

      {/* Liquid with substance */}
      <mesh ref={liquidRef} position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 32]} />
        <meshStandardMaterial color={color} transparent opacity={0.8} />
      </mesh>

      {/* pH paper strip dipped in */}
      <mesh position={[0.05, 0.1, 0]}>
        <boxGeometry args={[0.02, 0.4, 0.08]} />
        <meshStandardMaterial color={phColor} />
      </mesh>

      {/* Label */}
      <Text position={[0, 0.6, 0]} fontSize={0.08} color="#1a202c" anchorX="center">
        {label}
      </Text>
    </group>
  )
}

// pH paper color scale
function PHScale() {
  const phColors = [
    { ph: 1, color: "#ff0000" },
    { ph: 3, color: "#ff8000" },
    { ph: 5, color: "#ffff00" },
    { ph: 7, color: "#00ff00" },
    { ph: 9, color: "#00ffff" },
    { ph: 11, color: "#0000ff" },
    { ph: 13, color: "#8000ff" },
  ]

  return (
    <group position={[0, -1, 0]}>
      <Text position={[0, 0.4, 0]} fontSize={0.12} color="#1a202c" anchorX="center">
        pH Scale (Universal Indicator)
      </Text>
      
      {phColors.map((item, i) => (
        <group key={i} position={[(i - 3) * 0.35, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.25, 0.2, 0.05]} />
            <meshStandardMaterial color={item.color} />
          </mesh>
          <Text position={[0, -0.2, 0]} fontSize={0.06} color="#1a202c" anchorX="center">
            pH {item.ph}
          </Text>
        </group>
      ))}
    </group>
  )
}

function LabTable() {
  return (
    <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 6]} />
      <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
    </mesh>
  )
}

const NATURAL_SUBSTANCES = [
  { name: "Lemon Juice", color: "#ffe135", ph: 2.5, phColor: "#ff8000", description: "Citric acid - weak organic acid" },
  { name: "Vinegar", color: "#f5f5dc", ph: 3.0, phColor: "#ff8000", description: "Acetic acid - weak organic acid" },
  { name: "Orange Juice", color: "#ffa500", ph: 3.5, phColor: "#ffbf00", description: "Citric acid - weak organic acid" },
  { name: "Tomato Juice", color: "#ff6347", ph: 4.5, phColor: "#ffff00", description: "Weak organic acids" },
  { name: "Milk", color: "#fffdd0", ph: 6.5, phColor: "#80ff00", description: "Lactic acid - very weak acid" },
  { name: "Water", color: "#e0f7fa", ph: 7.0, phColor: "#00ff00", description: "Neutral" },
]

export function WeakAcidsSim() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  const [tested, setTested] = useState<boolean[]>(new Array(6).fill(false))

  const startTest = (index: number) => {
    setSelectedIndex(index)
    setIsTesting(true)
    
    setTimeout(() => {
      setIsTesting(false)
      setTested(prev => {
        const newTested = [...prev]
        newTested[index] = true
        return newTested
      })
    }, 2000)
  }

  const resetAll = () => {
    setSelectedIndex(null)
    setIsTesting(false)
    setTested(new Array(6).fill(false))
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <Droplets className="w-3 h-3" />
          Natural Substances as Weak Acids
        </Badge>
        <Badge variant="outline">
          pH Testing with Universal Indicator
        </Badge>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
          <color attach="background" args={["#f8fafc"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <pointLight position={[-5, 5, -5]} intensity={0.5} />
          
          <LabTable />
          <PHScale />

          {/* Test tubes with natural substances */}
          {NATURAL_SUBSTANCES.map((substance, i) => (
            <TestTube
              key={i}
              position={[(i - 2.5) * 0.8, 0, 0]}
              color={substance.color}
              label={substance.name}
              phColor={tested[i] ? substance.phColor : "#ffffff"}
              isTesting={isTesting && selectedIndex === i}
            />
          ))}

          <OrbitControls enablePan={false} minDistance={4} maxDistance={10} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      </div>

      {/* Controls */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Settings2 className="w-4 h-4" />
          Test Controls
        </div>

        <div className="grid grid-cols-3 gap-2">
          {NATURAL_SUBSTANCES.map((substance, i) => (
            <Button
              key={i}
              variant={tested[i] ? "default" : "outline"}
              size="sm"
              onClick={() => startTest(i)}
              disabled={isTesting || tested[i]}
              className="text-xs"
            >
              {tested[i] ? `pH ${substance.ph}` : substance.name}
            </Button>
          ))}
        </div>

        <Button variant="outline" onClick={resetAll} disabled={isTesting} className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All Tests
        </Button>
      </div>

      {/* Results */}
      {selectedIndex !== null && !isTesting && (
        <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm space-y-2">
          <p className="font-medium text-foreground">
            {NATURAL_SUBSTANCES[selectedIndex].name} Test Results:
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium">pH:</span> {NATURAL_SUBSTANCES[selectedIndex].ph} - {NATURAL_SUBSTANCES[selectedIndex].ph < 7 ? "Acidic" : "Neutral"}
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium">Observation:</span> {NATURAL_SUBSTANCES[selectedIndex].description}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm space-y-2">
        <p className="font-medium text-foreground">Principle:</p>
        <p className="text-muted-foreground">
          Natural substances like lemon juice, vinegar, and orange juice contain weak organic acids 
          (citric acid, acetic acid). When tested with universal indicator paper, they show pH values 
          between 2-6, confirming their acidic nature.
        </p>
        <p className="text-muted-foreground mt-2">
          <span className="font-medium">Key Concept:</span> Weak acids only partially dissociate in water, 
          unlike strong acids which completely dissociate.
        </p>
      </div>
    </div>
  )
}
