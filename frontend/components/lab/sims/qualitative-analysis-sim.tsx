"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, TestTube, Flame } from "lucide-react"
import * as THREE from "three"

// Test tube rack with multiple tubes
function TestTubeRack({ 
  activeTube,
  reagentAdded,
  observation
}: { 
  activeTube: number
  reagentAdded: string
  observation: string
}) {
  const tubes = [
    { id: 0, label: "Pb²⁺", color: "#ffffff" },
    { id: 1, label: "Cu²⁺", color: "#a0c4ff" },
    { id: 2, label: "Fe³⁺", color: "#ffd6a5" },
    { id: 3, label: "Cl⁻", color: "#ffffff" },
    { id: 4, label: "SO₄²⁻", color: "#ffffff" },
  ]
  
  return (
    <group position={[0, -0.5, 0]}>
      {/* Rack base */}
      <mesh>
        <boxGeometry args={[4, 0.2, 1]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 0.1, 0.8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      
      {/* Test tubes */}
      {tubes.map((tube, i) => {
        const x = (i - 2) * 0.8
        const isActive = activeTube === i
        let tubeColor = tube.color
        
        // Color changes based on tests
        if (isActive && observation) {
          if (observation.includes("yellow")) tubeColor = "#fbbf24"
          if (observation.includes("blue")) tubeColor = "#3b82f6"
          if (observation.includes("red")) tubeColor = "#ef4444"
          if (observation.includes("green")) tubeColor = "#22c55e"
          if (observation.includes("white")) tubeColor = "#f3f4f6"
          if (observation.includes("brown")) tubeColor = "#92400e"
        }
        
        return (
          <group key={tube.id} position={[x, 0.5, 0]}>
            <mesh>
              <cylinderGeometry args={[0.12, 0.12, 0.6, 16]} />
              <meshPhysicalMaterial 
                color="#ffffff"
                transmission={0.9}
                opacity={0.3}
                transparent
                roughness={0.1}
              />
            </mesh>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.25, 16]} />
              <meshStandardMaterial color={tubeColor} transparent opacity={0.8} />
            </mesh>
            <Text position={[0, 0.5, 0]} fontSize={0.08} color="#2d3748" anchorX="center">
              {tube.label}
            </Text>
            {isActive && (
              <mesh position={[0, -0.45, 0]}>
                <cylinderGeometry args={[0.14, 0.14, 0.02, 16]} />
                <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.5} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}

// Flame test burner
function FlameBurner({ isActive, flameColor }: { isActive: boolean; flameColor: string }) {
  return (
    <group position={[2.5, -1, 0]}>
      <mesh>
        <cylinderGeometry args={[0.15, 0.2, 0.5, 16]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      {isActive && (
        <mesh position={[0, 0.4, 0]}>
          <coneGeometry args={[0.1, 0.3, 16]} />
          <meshStandardMaterial 
            color={flameColor}
            emissive={flameColor}
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
      <Text position={[0, -0.6, 0]} fontSize={0.07} color="#2d3748" anchorX="center">
        Flame Test
      </Text>
    </group>
  )
}

// Scene
function Scene({ activeTube, reagentAdded, observation, flameTest }: any) {
  const flameColor = observation?.includes("crimson") ? "#dc2626" :
                    observation?.includes("apple green") ? "#22c55e" :
                    observation?.includes("blue") ? "#3b82f6" :
                    observation?.includes("lilac") ? "#a855f7" : "#fbbf24"
  
  return (
    <>
      <color attach="background" args={["#f7fafc"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      <TestTubeRack activeTube={activeTube} reagentAdded={reagentAdded} observation={observation} />
      <FlameBurner isActive={flameTest} flameColor={flameColor} />
      
      <Text position={[0, 3, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
        Qualitative Analysis: Cations, Anions & Gases
      </Text>
      
      <OrbitControls enablePan={false} minDistance={6} maxDistance={12} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

// Main Component
export function QualitativeAnalysisSim() {
  const [activeTube, setActiveTube] = useState(0)
  const [activeGroup, setActiveGroup] = useState<"cation" | "anion" | "gas">("cation")
  const [reagentAdded, setReagentAdded] = useState("")
  const [observation, setObservation] = useState("")
  const [flameTest, setFlameTest] = useState(false)
  const [confirmedIon, setConfirmedIon] = useState<string | null>(null)
  const [testHistory, setTestHistory] = useState<string[]>([])
  
  const cationTests: Record<number, Record<string, string>> = {
    0: { // Pb²⁺
      "dilute HCl": "White precipitate of PbCl₂",
      "KI solution": "Yellow precipitate of PbI₂",
      "K₂CrO₄": "Yellow precipitate of PbCrO₄",
      "H₂S": "Black precipitate of PbS"
    },
    1: { // Cu²⁺
      "NH₄OH": "Blue precipitate soluble in excess",
      "K₄[Fe(CN)₆]": "Reddish-brown precipitate",
      "H₂S": "Black precipitate of CuS"
    },
    2: { // Fe³⁺
      "NH₄OH": "Reddish-brown precipitate of Fe(OH)₃",
      "KSCN": "Blood-red coloration",
      "K₄[Fe(CN)₆]": "Prussian blue precipitate"
    }
  }
  
  const anionTests: Record<number, Record<string, string>> = {
    3: { // Cl⁻
      "AgNO₃ + HNO₃": "White curdy precipitate soluble in NH₄OH",
      "MnO₂ + H₂SO₄": "Greenish-yellow gas (Cl₂)"
    },
    4: { // SO₄²⁻
      "BaCl₂ + HCl": "White precipitate insoluble in HCl",
      "Lead acetate": "White precipitate of PbSO₄"
    }
  }
  
  const handleTest = (reagent: string) => {
    setReagentAdded(reagent)
    const tests = activeGroup === "cation" ? cationTests : anionTests
    const result = tests[activeTube]?.[reagent] || "No visible change"
    setObservation(result)
    setTestHistory(prev => [...prev, `${reagent}: ${result}`].slice(-5))
  }
  
  const handleFlameTest = () => {
    setFlameTest(true)
    setTimeout(() => setFlameTest(false), 2000)
  }
  
  const handleConfirm = (ion: string) => {
    setConfirmedIon(ion)
  }
  
  const handleReset = () => {
    setActiveTube(0)
    setReagentAdded("")
    setObservation("")
    setConfirmedIon(null)
    setTestHistory([])
    setFlameTest(false)
  }
  
  const tubes = ["Pb²⁺", "Cu²⁺", "Fe³⁺", "Cl⁻", "SO₄²⁻"]
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={activeGroup === "cation" ? "default" : "outline"}
          onClick={() => setActiveGroup("cation")}
        >
          Cations
        </Button>
        <Button 
          variant={activeGroup === "anion" ? "default" : "outline"}
          onClick={() => setActiveGroup("anion")}
        >
          Anions
        </Button>
        <Button onClick={handleFlameTest} className="gap-2">
          <Flame className="w-4 h-4" />
          Flame Test
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tubes.slice(0, activeGroup === "cation" ? 3 : 5).map((tube, i) => (
          <Button
            key={tube}
            variant={activeTube === i ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setActiveTube(i)
              setReagentAdded("")
              setObservation("")
            }}
          >
            {tube}
          </Button>
        ))}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {(activeGroup === "cation" ? 
          ["dilute HCl", "NH₄OH", "H₂S", "KI solution", "K₂CrO₄", "KSCN"] :
          ["AgNO₃ + HNO₃", "BaCl₂ + HCl", "Lead acetate", "MnO₂ + H₂SO₄"]
        ).map(reagent => (
          <Button
            key={reagent}
            variant="outline"
            size="sm"
            onClick={() => handleTest(reagent)}
            disabled={reagentAdded === reagent}
          >
            Add {reagent}
          </Button>
        ))}
      </div>
      
      {observation && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <h4 className="font-medium text-blue-800 text-sm mb-1">Observation:</h4>
          <p className="text-sm text-blue-700">{observation}</p>
        </div>
      )}
      
      {confirmedIon && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <h4 className="font-semibold text-green-800">Confirmed: {confirmedIon}</h4>
        </div>
      )}
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Analysis Guide:</h4>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li><strong>Group 0:</strong> NH₄⁺ (NH₄OH + Nessler's reagent)</li>
          <li><strong>Group I:</strong> Pb²⁺, Ag⁺ (HCl insoluble)</li>
          <li><strong>Group II:</strong> Cu²⁺, Cd²⁺, Bi³⁺ (H₂S in acid)</li>
          <li><strong>Group III:</strong> Fe³⁺, Al³⁺, Cr³⁺ (NH₄OH)</li>
          <li><strong>Group IV:</strong> Zn²⁺, Mn²⁺, Ni²⁺, Co²⁺ (H₂S in base)</li>
          <li><strong>Group V:</strong> Ba²⁺, Sr²⁺, Ca²⁺ (NH₄Cl + NH₄OH + (NH₄)₂CO₃)</li>
          <li><strong>Group VI:</strong> Mg²⁺, Na⁺, K⁺ (Soluble group)</li>
        </ul>
      </div>
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [6, 3, 6], fov: 50 }} shadows>
          <Scene 
            activeTube={activeTube}
            reagentAdded={reagentAdded}
            observation={observation}
            flameTest={flameTest}
          />
        </Canvas>
      </div>
    </div>
  )
}
