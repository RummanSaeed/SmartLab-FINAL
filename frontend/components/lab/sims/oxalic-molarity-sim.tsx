"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Beaker, Settings2 } from "lucide-react"
import * as THREE from "three"

function Burette({ fillLevel, isDripping }: { fillLevel: number; isDripping: boolean }) {
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
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 3, 32]} />
        <meshPhysicalMaterial color="rgba(200, 220, 240, 0.3)" transmission={0.8} roughness={0.1} thickness={0.1} transparent opacity={0.3} />
      </mesh>
      
      <mesh position={[0, -1.5 + fillLevel * 1.5, 0]}>
        <cylinderGeometry args={[0.13, 0.13, fillLevel * 3, 32]} />
        <meshStandardMaterial color="#ff69b4" transparent opacity={0.9} />
      </mesh>

      {Array.from({ length: 30 }).map((_, i) => (
        <mesh key={i} position={[0.16, 1.4 - i * 0.09, 0]}>
          <boxGeometry args={[0.02, 0.005, 0.005]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}

      <mesh position={[0, -1.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
        <meshStandardMaterial color="#444" />
      </mesh>

      <mesh position={[0, -1.8, 0]}>
        <coneGeometry args={[0.04, 0.15, 16]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      <mesh ref={dropRef} position={[0, -0.8, 0]} visible={false}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#ff69b4" transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

function ConicalFlask({ indicatorColor, isTitrating }: { indicatorColor: string; isTitrating: boolean }) {
  const swirlRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (isTitrating && swirlRef.current) {
      const t = state.clock.elapsedTime * 3
      swirlRef.current.rotation.y = Math.sin(t) * 0.1
    }
  })

  return (
    <group position={[0, -0.5, 0]}>
      <mesh>
        <coneGeometry args={[0.6, 0.8, 32]} />
        <meshPhysicalMaterial color="rgba(220, 235, 255, 0.2)" transmission={0.9} roughness={0.05} thickness={0.15} transparent opacity={0.25} />
      </mesh>

      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 32]} />
        <meshPhysicalMaterial color="rgba(220, 235, 255, 0.2)" transmission={0.9} roughness={0.05} thickness={0.15} transparent opacity={0.25} />
      </mesh>

      <group ref={swirlRef}>
        <mesh position={[0, -0.2, 0]}>
          <coneGeometry args={[0.55, 0.7, 32]} />
          <meshStandardMaterial color={indicatorColor} transparent opacity={0.85} roughness={0.2} />
        </mesh>
      </group>

      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial color="#f8f8f8" />
      </mesh>
    </group>
  )
}

function LabTable() {
  return (
    <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[8, 6]} />
      <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
    </mesh>
  )
}

export function OxalicMolaritySim() {
  const [addedVolume, setAddedVolume] = useState(0)
  const [isTitrating, setIsTitrating] = useState(false)
  const [indicatorColor, setIndicatorColor] = useState("#ffffff")
  const [endpointReached, setEndpointReached] = useState(false)
  const [molarity, setMolarity] = useState<number | null>(null)

  const buretteFill = (50 - addedVolume) / 50
  
  const getIndicatorColor = (vol: number) => {
    if (vol < 18) return "#ffffff"
    if (vol < 20) return "#ffe4e1"
    if (vol < 22) return "#ffb6c1"
    return "#ff69b4"
  }

  const startTitration = () => {
    setIsTitrating(true)
    
    const interval = setInterval(() => {
      setAddedVolume((prev) => {
        const newVol = prev + 0.2
        setIndicatorColor(getIndicatorColor(newVol))
        
        if (newVol >= 20 && newVol < 22 && !endpointReached) {
          setEndpointReached(true)
        }
        
        if (newVol >= 25) {
          clearInterval(interval)
          setIsTitrating(false)
          const calculatedMolarity = (0.1 * 20) / (2 * 20)
          setMolarity(calculatedMolarity)
        }
        
        return newVol
      })
    }, 100)
  }

  const resetSimulation = () => {
    setAddedVolume(0)
    setIsTitrating(false)
    setIndicatorColor("#ffffff")
    setEndpointReached(false)
    setMolarity(null)
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <Beaker className="w-3 h-3" />
          Oxalic Acid Molarity
        </Badge>
        <Badge variant={endpointReached ? "default" : "outline"}>
          {endpointReached ? "Endpoint Detected!" : "Titration in Progress"}
        </Badge>
        {molarity && (
          <Badge variant="default" className="bg-green-600">
            Molarity: {molarity.toFixed(4)} M
          </Badge>
        )}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [3, 2, 4], fov: 50 }}>
          <color attach="background" args={["#f8fafc"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <pointLight position={[-5, 5, -5]} intensity={0.5} />
          
          <LabTable />
          <Burette fillLevel={buretteFill} isDripping={isTitrating} />
          <ConicalFlask indicatorColor={indicatorColor} isTitrating={isTitrating} />

          <Text position={[0.5, 3.5, 0]} fontSize={0.15} color="#1a202c" anchorX="center">
            Standard NaOH (0.1 M)
          </Text>
          <Text position={[0.8, -0.3, 0]} fontSize={0.12} color="#1a202c" anchorX="left">
            Oxalic Acid + Phenolphthalein
          </Text>
          <Text position={[-0.5, 1.8, 0]} fontSize={0.1} color="#4a5568" anchorX="center">
            {addedVolume.toFixed(1)} mL added
          </Text>

          <OrbitControls enablePan={false} minDistance={3} maxDistance={8} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      </div>

      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Settings2 className="w-4 h-4" />
          Titration Controls
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Base Added</span>
              <span className="font-medium">{addedVolume.toFixed(1)} mL</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(addedVolume / 25) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Indicator Color</span>
              <span className="font-medium">
                {indicatorColor === "#ffffff" ? "Colorless" : 
                 indicatorColor === "#ffe4e1" ? "Very Light Pink" :
                 indicatorColor === "#ffb6c1" ? "Light Pink" : "Deep Pink"}
              </span>
            </div>
            <div className="h-6 rounded border border-gray-300 transition-colors duration-500" style={{ backgroundColor: indicatorColor }} />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={startTitration} disabled={isTitrating || addedVolume >= 25} className="flex-1">
            <Play className="w-4 h-4 mr-2" />
            {isTitrating ? "Titrating..." : "Start Titration"}
          </Button>
          <Button variant="outline" onClick={resetSimulation} disabled={isTitrating}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm space-y-2">
        <p className="font-medium text-foreground">Principle:</p>
        <p className="text-muted-foreground">
          The molarity of oxalic acid solution is determined by titration against standard NaOH using phenolphthalein indicator.
          At the endpoint, the solution changes from colorless to pink.
        </p>
        <p className="text-muted-foreground mt-2">
          <span className="font-medium">Reaction:</span> (COOH)₂ + 2NaOH → (COONa)₂ + 2H₂O
        </p>
        <p className="text-muted-foreground">
          <span className="font-medium">Formula:</span> M(oxalic) = M(NaOH) × V(NaOH) / (2 × V(oxalic))
        </p>
      </div>
    </div>
  )
}
