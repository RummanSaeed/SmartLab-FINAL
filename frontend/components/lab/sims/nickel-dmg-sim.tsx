"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Beaker, FlaskConical } from "lucide-react"
import * as THREE from "three"

// Beaker with reaction
function ReactionBeaker({ 
  hasNickel,
  dmgAdded,
  precipitate
}: { 
  hasNickel: boolean
  dmgAdded: boolean
  precipitate: boolean
}) {
  const beakerRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (beakerRef.current && dmgAdded) {
      beakerRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.03
    }
  })
  
  return (
    <group ref={beakerRef} position={[0, -0.5, 0]}>
      {/* Beaker */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.45, 1, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.2}
          transparent
          roughness={0.1}
          thickness={0.05}
        />
      </mesh>
      
      {/* Green nickel solution */}
      {hasNickel && (
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.45, 0.4, 0.4, 32]} />
          <meshStandardMaterial color="#a0deaf" transparent opacity={0.7} />
        </mesh>
      )}
      
      {/* Red precipitate */}
      {precipitate && (
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[0.42, 0.35, 0.15, 32]} />
          <meshStandardMaterial color="#c41e3a" />
        </mesh>
      )}
      
      {/* DMG reagent */}
      {dmgAdded && !precipitate && (
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.43, 0.4, 0.2, 32]} />
          <meshStandardMaterial color="#ffe4e1" transparent opacity={0.5} />
        </mesh>
      )}
      
      <Text position={[0, -0.8, 0]} fontSize={0.07} color="#2d3748" anchorX="center">
        Ni²⁺ Solution
      </Text>
    </group>
  )
}

// Buchner funnel for filtration
function BuchnerFunnel({ hasPrecipitate }: { hasPrecipitate: boolean }) {
  return (
    <group position={[2, -0.3, 0]}>
      {/* Funnel */}
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.4, 0.6, 32]} openEnded />
        <meshStandardMaterial color="#e2e8f0" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 16]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      {/* Filter paper */}
      <mesh position={[0, 0.2, 0]}>
        <circleGeometry args={[0.38, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Red precipitate on filter */}
      {hasPrecipitate && (
        <mesh position={[0, 0.22, 0]}>
          <circleGeometry args={[0.35, 32]} />
          <meshStandardMaterial color="#c41e3a" />
        </mesh>
      )}
      
      {/* Flask */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.35, 0.3, 0.8, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.2}
          transparent
        />
      </mesh>
      
      <Text position={[0, -1.4, 0]} fontSize={0.06} color="#2d3748" anchorX="center">
        Buchner Funnel
      </Text>
    </group>
  )
}

// Scene
function Scene({ hasNickel, dmgAdded, precipitate, hasFilter }: any) {
  return (
    <>
      <color attach="background" args={["#f7fafc"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      <ReactionBeaker hasNickel={hasNickel} dmgAdded={dmgAdded} precipitate={precipitate} />
      <BuchnerFunnel hasPrecipitate={hasFilter} />
      
      <Text position={[0, 3, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
        Preparation of Nickel Dimethylglyoxime Complex
      </Text>
      
      <OrbitControls enablePan={false} minDistance={6} maxDistance={14} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

// Main Component
export function NickelDmgSim() {
  const [hasNickel, setHasNickel] = useState(false)
  const [dmgAdded, setDmgAdded] = useState(false)
  const [precipitate, setPrecipitate] = useState(false)
  const [hasFilter, setHasFilter] = useState(false)
  const [isHeating, setIsHeating] = useState(false)
  const [step, setStep] = useState(0)
  
  const handleStep = () => {
    if (step === 0) {
      setHasNickel(true)
      setStep(1)
    } else if (step === 1) {
      setDmgAdded(true)
      setTimeout(() => {
        setPrecipitate(true)
        setStep(2)
      }, 1000)
    } else if (step === 2) {
      setHasFilter(true)
      setStep(3)
    }
  }
  
  const handleReset = () => {
    setHasNickel(false)
    setDmgAdded(false)
    setPrecipitate(false)
    setHasFilter(false)
    setIsHeating(false)
    setStep(0)
  }
  
  const steps = [
    "Add nickel salt solution (pale green)",
    "Add DMG reagent + NH₄OH",
    "Wait for red precipitate to form",
    "Filter using Buchner funnel"
  ]
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={handleStep} 
          disabled={step >= 3}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          {step === 0 ? "Add Nickel Solution" : 
           step === 1 ? "Add DMG + NH₄OH" :
           step === 2 ? "Precipitate Forming..." : "Complete"}
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Current Step</span>
          <span className="text-lg font-semibold">{step + 1}/4</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Precipitate</span>
          <span className="text-lg font-semibold">{precipitate ? "Formed" : "Not yet"}</span>
        </Badge>
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
      
      {precipitate && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h4 className="font-semibold text-red-800">Nickel DMG Complex</h4>
          <p className="text-sm text-red-700 mt-1">
            Cherry-red precipitate of Ni(DMG)₂ formed
          </p>
          <p className="text-xs text-red-600 mt-2 font-mono">
            Ni²⁺ + 2 DMG → Ni(DMG)₂ (s) + 2H⁺
          </p>
        </div>
      )}
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Complex Formation:</h4>
        <p className="text-xs mb-2">
          Dimethylglyoxime (DMG) forms a square planar complex with Ni²⁺ in ammoniacal solution.
          The bright red color is characteristic and used for gravimetric determination of nickel.
        </p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Prepare nickel solution (NiSO₄ or NiCl₂)</li>
          <li>Add alcoholic DMG solution</li>
          <li>Add NH₄OH to make solution ammoniacal (pH ~10)</li>
          <li>Scarlet red precipitate forms immediately</li>
          <li>Digest, filter, wash, dry and weigh</li>
        </ol>
      </div>
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [6, 3, 6], fov: 50 }} shadows>
          <Scene 
            hasNickel={hasNickel}
            dmgAdded={dmgAdded}
            precipitate={precipitate}
            hasFilter={hasFilter}
          />
        </Canvas>
      </div>
    </div>
  )
}
