"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, FlaskConical, Settings2 } from "lucide-react"
import * as THREE from "three"

// Burette with standard Na2CO3 solution
type BuretteProps = {
  fillLevel: number
  isDripping: boolean
}

function Burette({ fillLevel, isDripping }: BuretteProps) {
  const dropRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (isDripping && dropRef.current) {
      const time = state.clock.elapsedTime * 2
      dropRef.current.position.y = -0.8 - (time % 1) * 0.5
      dropRef.current.visible = (time % 1) < 0.8
    }
  })

  return (
    <group position={[0, 2, 0]}>
      {/* Burette body */}
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 3, 32]} />
        <meshPhysicalMaterial
          color="rgba(200, 220, 240, 0.3)"
          transmission={0.8}
          roughness={0.1}
          thickness={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Na2CO3 solution - clear/colorless */}
      <mesh position={[0, -1.5 + fillLevel * 1.5, 0]}>
        <cylinderGeometry args={[0.13, 0.13, fillLevel * 3, 32]} />
        <meshStandardMaterial
          color="#f5f5f5"
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Graduation marks */}
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh key={i} position={[0.16, 1.4 - i * 0.09, 0]}>
          <boxGeometry args={[0.02, 0.005, 0.005]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}

      {/* Stopcock */}
      <mesh position={[0, -1.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      {/* Tip */}
      <mesh position={[0, -1.8, 0]}>
        <coneGeometry args={[0.04, 0.15, 16]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Falling drop */}
      <mesh ref={dropRef} position={[0, -0.8, 0]} visible={false}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#f5f5f5" transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

// Conical flask with HCl and methyl orange indicator
function ConicalFlask({ 
  volume, 
  indicatorColor,
  isTitrating,
  bubbleIntensity
}: { 
  volume: number
  indicatorColor: string
  isTitrating: boolean
  bubbleIntensity: number
}) {
  const swirlRef = useRef<THREE.Group>(null)
  const bubblesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (isTitrating && swirlRef.current) {
      const t = state.clock.elapsedTime * 3
      swirlRef.current.rotation.y = Math.sin(t) * 0.1
      swirlRef.current.position.x = Math.sin(t * 2) * 0.02
    }
    
    // CO2 bubbles animation
    if (bubblesRef.current) {
      bubblesRef.current.children.forEach((bubble, i) => {
        const speed = 0.5 + (i % 3) * 0.3
        const y = ((state.clock.elapsedTime * speed + i * 0.5) % 1) * 0.6 - 0.3
        bubble.position.y = y
        bubble.visible = y > -0.2 && bubbleIntensity > 0
        bubble.scale.setScalar(0.8 + Math.sin(state.clock.elapsedTime * 5 + i) * 0.2)
      })
    }
  })

  return (
    <group position={[0, -0.5, 0]}>
      {/* Flask body */}
      <mesh>
        <coneGeometry args={[0.6, 0.8, 32]} />
        <meshPhysicalMaterial
          color="rgba(220, 235, 255, 0.2)"
          transmission={0.9}
          roughness={0.05}
          thickness={0.15}
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Flask neck */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 32]} />
        <meshPhysicalMaterial
          color="rgba(220, 235, 255, 0.2)"
          transmission={0.9}
          roughness={0.05}
          thickness={0.15}
          transparent
          opacity={0.25}
        />
      </mesh>

      {/* Solution with methyl orange */}
      <group ref={swirlRef}>
        <mesh position={[0, -0.2, 0]}>
          <coneGeometry args={[0.55, 0.7, 32]} />
          <meshStandardMaterial
            color={indicatorColor}
            transparent
            opacity={0.85}
            roughness={0.2}
          />
        </mesh>

        {/* CO2 bubbles */}
        <group ref={bubblesRef}>
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.sin(i * 0.5) * 0.25,
                -0.3,
                Math.cos(i * 0.5) * 0.25
              ]}
              visible={false}
            >
              <sphereGeometry args={[0.02 + (i % 3) * 0.01, 8, 8]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* White tile underneath */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>
    </group>
  )
}

// Lab table surface
function LabTable() {
  return (
    <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[8, 6]} />
      <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
    </mesh>
  )
}

export function HClStandardizationSim() {
  const [buretteVolume, setBuretteVolume] = useState(50)
  const [flaskVolume, setFlaskVolume] = useState(25)
  const [addedVolume, setAddedVolume] = useState(0)
  const [isTitrating, setIsTitrating] = useState(false)
  const [indicatorColor, setIndicatorColor] = useState("#ff8c00") // Methyl orange in acid (orange-red)
  const [endpointReached, setEndpointReached] = useState(false)
  const [molarity, setMolarity] = useState<number | null>(null)
  const [bubbleIntensity, setBubbleIntensity] = useState(0)

  const buretteFill = (50 - addedVolume) / 50
  
  // Methyl orange color change: red in acid → orange-yellow at endpoint
  const getIndicatorColor = (vol: number) => {
    if (vol < 22) return "#ff4500" // Red-orange (acidic)
    if (vol < 24) return "#ffa500" // Orange (near endpoint)
    if (vol < 26) return "#ffcc00" // Yellow-orange (endpoint)
    return "#ffd700" // Golden yellow (basic, past endpoint)
  }

  const startTitration = () => {
    setIsTitrating(true)
    setEndpointReached(false)
    setBubbleIntensity(0.5)
    
    const interval = setInterval(() => {
      setAddedVolume((prev) => {
        const newVol = prev + 0.15
        const newColor = getIndicatorColor(newVol)
        setIndicatorColor(newColor)
        
        // CO2 production increases then decreases
        if (newVol < 20) {
          setBubbleIntensity(Math.min(1, newVol / 20))
        } else if (newVol > 25) {
          setBubbleIntensity(Math.max(0, 1 - (newVol - 25) / 5))
        }
        
        if (newVol >= 24 && newVol < 26 && !endpointReached) {
          setEndpointReached(true)
        }
        
        if (newVol >= 30) {
          clearInterval(interval)
          setIsTitrating(false)
          setBubbleIntensity(0)
          // Calculate HCl molarity: 2HCl + Na2CO3 → 2NaCl + H2O + CO2
          // M(HCl) = 2 * M(Na2CO3) * V(Na2CO3) / V(HCl)
          const calculatedMolarity = (2 * 0.1 * 25) / 24
          setMolarity(calculatedMolarity)
        }
        
        return newVol
      })
    }, 100)
  }

  const resetSimulation = () => {
    setAddedVolume(0)
    setIsTitrating(false)
    setIndicatorColor("#ff8c00")
    setEndpointReached(false)
    setMolarity(null)
    setBubbleIntensity(0)
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <FlaskConical className="w-3 h-3" />
          HCl Standardization
        </Badge>
        <Badge variant={endpointReached ? "default" : "outline"}>
          {endpointReached ? "Endpoint Detected!" : "Titration in Progress"}
        </Badge>
        {molarity && (
          <Badge variant="default" className="bg-green-600">
            Calculated Molarity: {molarity.toFixed(4)} M
          </Badge>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [3, 2, 4], fov: 50 }}>
          <color attach="background" args={["#f8fafc"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
          <pointLight position={[-5, 5, -5]} intensity={0.5} />
          
          <LabTable />
          <Burette fillLevel={buretteFill} isDripping={isTitrating} />
          <ConicalFlask 
            volume={flaskVolume} 
            indicatorColor={indicatorColor}
            isTitrating={isTitrating}
            bubbleIntensity={bubbleIntensity}
          />

          {/* Labels */}
          <Text
            position={[0.5, 3.5, 0]}
            fontSize={0.15}
            color="#1a202c"
            anchorX="center"
          >
            Na₂CO₃ Burette (0.1 M)
          </Text>
          <Text
            position={[0.8, -0.3, 0]}
            fontSize={0.12}
            color="#1a202c"
            anchorX="left"
          >
            HCl + Methyl Orange
          </Text>
          <Text
            position={[-0.5, 1.8, 0]}
            fontSize={0.1}
            color="#4a5568"
            anchorX="center"
          >
            {addedVolume.toFixed(1)} mL added
          </Text>

          <OrbitControls 
            enablePan={false} 
            minDistance={3} 
            maxDistance={8}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* Controls */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Settings2 className="w-4 h-4" />
          Titration Controls
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Volume Added</span>
              <span className="font-medium">{addedVolume.toFixed(1)} mL</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(addedVolume / 30) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Solution Color</span>
              <span className="font-medium">
                {indicatorColor === "#ff4500" ? "Orange-Red" : 
                 indicatorColor === "#ffa500" ? "Orange" :
                 indicatorColor === "#ffcc00" ? "Yellow-Orange" : "Yellow"}
              </span>
            </div>
            <div 
              className="h-6 rounded border border-gray-300 transition-colors duration-500"
              style={{ backgroundColor: indicatorColor }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={startTitration}
            disabled={isTitrating || addedVolume >= 30}
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            {isTitrating ? "Titrating..." : "Start Titration"}
          </Button>
          <Button
            variant="outline"
            onClick={resetSimulation}
            disabled={isTitrating}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm space-y-2">
        <p className="font-medium text-foreground">Principle:</p>
        <p className="text-muted-foreground">
          HCl (acid) is standardized against a known concentration of Na₂CO₃ (base) using 
          methyl orange indicator. The endpoint is marked by a color change from orange-red to yellow.
        </p>
        <p className="text-muted-foreground mt-2">
          <span className="font-medium">Reaction:</span> 2HCl + Na₂CO₃ → 2NaCl + H₂O + CO₂↑
        </p>
        <p className="text-muted-foreground">
          <span className="font-medium">Formula:</span> M(HCl) = 2 × M(Na₂CO₃) × V(Na₂CO₃) / V(HCl)
        </p>
      </div>
    </div>
  )
}
