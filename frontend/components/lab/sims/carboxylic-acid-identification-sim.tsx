"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, FlaskConical, Settings2 } from "lucide-react"
import * as THREE from "three"

// Test tube with bubbling reaction
function TestTube({ 
  position, 
  liquidColor, 
  label,
  isBubbling,
  bubbleIntensity
}: { 
  position: [number, number, number]
  liquidColor: string
  label: string
  isBubbling: boolean
  bubbleIntensity: number
}) {
  const liquidRef = useRef<THREE.Mesh>(null)
  const bubblesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (isBubbling && bubblesRef.current) {
      bubblesRef.current.children.forEach((b, i) => {
        const speed = 1 + (i % 3) * 0.5
        const y = ((state.clock.elapsedTime * speed + i * 0.3) % 0.6) - 0.3
        b.position.y = y
        b.visible = y > -0.2 && y < 0.3
        b.scale.setScalar(0.5 + Math.sin(state.clock.elapsedTime * 5 + i) * 0.3)
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

      {/* CO2 bubbles */}
      <group ref={bubblesRef}>
        {Array.from({ length: 15 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 0.08,
              -0.3,
              (Math.random() - 0.5) * 0.08
            ]}
            visible={false}
          >
            <sphereGeometry args={[0.015 + Math.random() * 0.01, 8, 8]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
          </mesh>
        ))}
      </group>

      <Text position={[0, 0.6, 0]} fontSize={0.06} color="#1a202c" anchorX="center">
        {label}
      </Text>
    </group>
  )
}

// Lime water test tube (for CO2 detection)
function LimeWaterTube({ 
  position,
  isCloudy
}: { 
  position: [number, number, number]
  isCloudy: boolean
}) {
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

      {/* Lime water - clear or cloudy */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 32]} />
        <meshStandardMaterial 
          color={isCloudy ? "#f5f5f5" : "#e6f3ff"} 
          transparent 
          opacity={isCloudy ? 0.95 : 0.6}
        />
      </mesh>

      {/* White precipitate if cloudy */}
      {isCloudy && (
        <>
          {Array.from({ length: 10 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 0.08,
                -0.3 + Math.random() * 0.4,
                (Math.random() - 0.5) * 0.08
              ]}
            >
              <sphereGeometry args={[0.01, 6, 6]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          ))}
        </>
      )}

      <Text position={[0, 0.6, 0]} fontSize={0.06} color="#1a202c" anchorX="center">
        {isCloudy ? "Limewater: Cloudy" : "Limewater: Clear"}
      </Text>
    </group>
  )
}

// Delivery tube connecting test tubes
function DeliveryTube({ startPos, endPos }: { startPos: [number, number, number], endPos: [number, number, number] }) {
  return (
    <group>
      {/* Horizontal tube */}
      <mesh position={[(startPos[0] + endPos[0]) / 2, startPos[1], startPos[2]]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, Math.abs(endPos[0] - startPos[0]), 12]} />
        <meshStandardMaterial color="#666" transparent opacity={0.8} />
      </mesh>
      {/* Down tube */}
      <mesh position={[endPos[0], (startPos[1] + endPos[1]) / 2, endPos[2]]}>
        <cylinderGeometry args={[0.02, 0.02, Math.abs(startPos[1] - endPos[1]), 12]} />
        <meshStandardMaterial color="#666" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

function LabTable() {
  return (
    <mesh position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[10, 6]} />
      <meshStandardMaterial color="#334155" roughness={0.8} />
    </mesh>
  )
}

const COMPOUNDS = [
  { name: "Acetic Acid", type: "Carboxylic Acid", reacts: true },
  { name: "Formic Acid", type: "Carboxylic Acid", reacts: true },
  { name: "Citric Acid", type: "Carboxylic Acid", reacts: true },
  { name: "Ethanol", type: "Alcohol", reacts: false },
]

export function CarboxylicAcidIdentificationSim() {
  const [selectedCompound, setSelectedCompound] = useState<number | null>(null)
  const [isReacting, setIsReacting] = useState(false)
  const [showResults, setShowResults] = useState<boolean[]>(new Array(4).fill(false))
  const [bubbleIntensity, setBubbleIntensity] = useState<number[]>(new Array(4).fill(0))
  const [limewaterCloudy, setLimewaterCloudy] = useState<boolean[]>(new Array(4).fill(false))

  const startTest = (index: number) => {
    setSelectedCompound(index)
    setIsReacting(true)
    
    const compound = COMPOUNDS[index]
    
    if (compound.reacts) {
      // Start bubbling
      setBubbleIntensity(prev => {
        const newInt = [...prev]
        newInt[index] = 1
        return newInt
      })
      
      // After delay, limewater turns cloudy
      setTimeout(() => {
        setLimewaterCloudy(prev => {
          const newCloudy = [...prev]
          newCloudy[index] = true
          return newCloudy
        })
        
        setTimeout(() => {
          setIsReacting(false)
          setShowResults(prev => {
            const newResults = [...prev]
            newResults[index] = true
            return newResults
          })
        }, 1500)
      }, 2000)
    } else {
      // No reaction for ethanol
      setTimeout(() => {
        setIsReacting(false)
        setShowResults(prev => {
          const newResults = [...prev]
          newResults[index] = true
          return newResults
        })
      }, 2000)
    }
  }

  const resetAll = () => {
    setSelectedCompound(null)
    setIsReacting(false)
    setShowResults(new Array(4).fill(false))
    setBubbleIntensity(new Array(4).fill(0))
    setLimewaterCloudy(new Array(4).fill(false))
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <FlaskConical className="w-3 h-3" />
          Carboxylic Acid Identification
        </Badge>
        <Badge variant="outline">
          Na₂CO₃ Test + Limewater
        </Badge>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
          <color attach="background" args={["#020817"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <pointLight position={[-5, 5, -5]} intensity={0.5} />
          
          <LabTable />

          {COMPOUNDS.map((compound, i) => (
            <group key={i}>
              <TestTube
                position={[(i - 1.5) * 1.2, -0.3, 0.5]}
                liquidColor={showResults[i] ? (compound.reacts ? "#e6f3ff" : "#f5f5dc") : "#f5f5dc"}
                label={compound.name}
                isBubbling={isReacting && selectedCompound === i && compound.reacts}
                bubbleIntensity={bubbleIntensity[i]}
              />
              
              <DeliveryTube 
                startPos={[(i - 1.5) * 1.2, 0.2, 0.5]} 
                endPos={[(i - 1.5) * 1.2, 0.2, -0.5]} 
              />
              
              <LimeWaterTube
                position={[(i - 1.5) * 1.2, -0.3, -0.5]}
                isCloudy={limewaterCloudy[i]}
              />
            </group>
          ))}

          <Text position={[0, 1.2, 0]} fontSize={0.1} color="#1a202c" anchorX="center">
            Na₂CO₃ Test: Effervescence indicates CO₂ production
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
                ? `${compound.name}: ${compound.reacts ? "Effervescence (+)" : "No reaction (-)"}`
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
          Carboxylic acids react with sodium carbonate (Na₂CO₃) to produce carbon dioxide gas, 
          which is detected by bubbling through limewater (calcium hydroxide solution). 
          The limewater turns milky/cloudy due to the formation of insoluble calcium carbonate.
        </p>
        <p className="text-muted-foreground mt-2">
          <span className="font-medium">Reactions:</span>
        </p>
        <p className="text-muted-foreground text-xs">
          2RCOOH + Na₂CO₃ → 2RCOONa + H₂O + CO₂↑
        </p>
        <p className="text-muted-foreground text-xs">
          CO₂ + Ca(OH)₂ → CaCO₃↓ (white precipitate) + H₂O
        </p>
      </div>
    </div>
  )
}
