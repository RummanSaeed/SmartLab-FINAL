"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Thermometer, Settings2 } from "lucide-react"
import * as THREE from "three"

// Test tube with sugar being heated
function TestTube({ 
  position, 
  sugarColor,
  isHeating,
  temperature,
  gasBubbles
}: { 
  position: [number, number, number]
  sugarColor: string
  isHeating: boolean
  temperature: number
  gasBubbles: boolean
}) {
  const tubeRef = useRef<THREE.Group>(null)
  const bubblesRef = useRef<THREE.Group>(null)
  const sugarRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (isHeating && tubeRef.current) {
      // Gentle vibration when heating
      const t = state.clock.elapsedTime * 20
      tubeRef.current.position.x = Math.sin(t) * 0.002
    }
    
    if (gasBubbles && bubblesRef.current) {
      bubblesRef.current.children.forEach((b, i) => {
        const speed = 0.8 + (i % 3) * 0.3
        const y = ((state.clock.elapsedTime * speed + i * 0.2) % 0.8) - 0.4
        b.position.y = y
        b.visible = y > -0.2 && y < 0.4
      })
    }
    
    // Sugar melting/deforming animation
    if (isHeating && sugarRef.current && temperature > 100) {
      const meltFactor = Math.min(1, (temperature - 100) / 100)
      sugarRef.current.scale.y = 1 - meltFactor * 0.3
      sugarRef.current.scale.x = 1 + meltFactor * 0.2
      sugarRef.current.scale.z = 1 + meltFactor * 0.2
    }
  })

  return (
    <group ref={tubeRef} position={position} rotation={[0.3, 0, 0]}>
      {/* Test tube */}
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 1, 32]} />
        <meshPhysicalMaterial
          color="rgba(220, 235, 255, 0.3)"
          transmission={0.9}
          roughness={0.05}
          thickness={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>

      <mesh position={[0, -0.5, 0]}>
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

      {/* Sugar content */}
      <mesh ref={sugarRef} position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.4, 32]} />
        <meshStandardMaterial 
          color={sugarColor} 
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Gas bubbles (H₂O vapor, CO₂, etc.) */}
      <group ref={bubblesRef}>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 0.08,
              -0.2,
              (Math.random() - 0.5) * 0.08
            ]}
            visible={false}
          >
            <sphereGeometry args={[0.008 + Math.random() * 0.005, 6, 6]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
          </mesh>
        ))}
      </group>

      {/* Condensation droplets on upper tube */}
      {temperature > 150 && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                0.1,
                0.1 + i * 0.08,
                (i % 2 === 0 ? 0.05 : -0.05)
              ]}
            >
              <sphereGeometry args={[0.008, 6, 6]} />
              <meshStandardMaterial color="#e6f3ff" transparent opacity={0.6} />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}

// Bunsen burner with adjustable flame
function BunsenBurner({ intensity }: { intensity: number }) {
  const flameRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (intensity > 0 && flameRef.current) {
      const t = state.clock.elapsedTime * (10 + intensity * 10)
      flameRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh) {
          child.scale.y = 1 + Math.sin(t + i * 0.5) * 0.15 * intensity
          child.position.x = Math.sin(t * 0.3 + i) * 0.02 * intensity
        }
      })
    }
  })

  return (
    <group position={[0.2, -1, 0]}>
      {/* Burner base */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.4, 24]} />
        <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Burner tube */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 24]} />
        <meshStandardMaterial color="#4a5568" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Flame with variable intensity */}
      <group ref={flameRef}>
        <mesh position={[0, 0.45, 0]} visible={intensity > 0}>
          <coneGeometry args={[0.06 * intensity, 0.25 * intensity, 16]} />
          <meshStandardMaterial
            color="#4169e1"
            emissive="#1e90ff"
            emissiveIntensity={2 * intensity}
            transparent
            opacity={0.7}
          />
        </mesh>
        <mesh position={[0, 0.35, 0]} visible={intensity > 0}>
          <coneGeometry args={[0.04 * intensity, 0.2 * intensity, 16]} />
          <meshStandardMaterial
            color="#00bfff"
            emissive="#87ceeb"
            emissiveIntensity={3 * intensity}
            transparent
            opacity={0.8}
          />
        </mesh>
        <mesh position={[0, 0.55, 0]} visible={intensity > 0.5}>
          <coneGeometry args={[0.03 * (intensity - 0.5) * 2, 0.15 * (intensity - 0.5) * 2, 16]} />
          <meshStandardMaterial
            color="#ff4500"
            emissive="#ff6347"
            emissiveIntensity={2 * (intensity - 0.5)}
            transparent
            opacity={0.6}
          />
        </mesh>
      </group>
    </group>
  )
}

// Tripod and wire gauze
function Tripod() {
  return (
    <group position={[0.2, -0.4, 0]}>
      {/* Three legs */}
      {[0, 120, 240].map((angle, i) => (
        <mesh key={i} position={[Math.cos((angle * Math.PI) / 180) * 0.3, -0.3, Math.sin((angle * Math.PI) / 180) * 0.3]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} rotation={[Math.PI / 3, 0, 0]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      ))}
      
      {/* Wire gauze */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.02, 32]} />
        <meshStandardMaterial color="#888" wireframe />
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

// Color temperature scale
const TEMPERATURE_STAGES = [
  { temp: 25, color: "#ffffff", name: "Solid sugar" },
  { temp: 100, color: "#fff8dc", name: "Melting" },
  { temp: 160, color: "#f5deb3", name: "Light caramel" },
  { temp: 170, color: "#deb887", name: "Medium caramel" },
  { temp: 180, color: "#8b4513", name: "Dark caramel" },
  { temp: 200, color: "#3d2817", name: "Burnt sugar" },
]

export function SugarDecompositionSim() {
  const [temperature, setTemperature] = useState(25)
  const [isHeating, setIsHeating] = useState(false)
  const [sugarColor, setSugarColor] = useState("#ffffff")
  const [gasBubbles, setGasBubbles] = useState(false)
  const [flameIntensity, setFlameIntensity] = useState(0)

  const getSugarColor = (temp: number) => {
    for (let i = TEMPERATURE_STAGES.length - 1; i >= 0; i--) {
      if (temp >= TEMPERATURE_STAGES[i].temp) {
        return TEMPERATURE_STAGES[i].color
      }
    }
    return TEMPERATURE_STAGES[0].color
  }

  const getStageName = (temp: number) => {
    for (let i = TEMPERATURE_STAGES.length - 1; i >= 0; i--) {
      if (temp >= TEMPERATURE_STAGES[i].temp) {
        return TEMPERATURE_STAGES[i].name
      }
    }
    return TEMPERATURE_STAGES[0].name
  }

  const startHeating = () => {
    setIsHeating(true)
    setFlameIntensity(0.8)
    
    const interval = setInterval(() => {
      setTemperature((prev) => {
        const newTemp = prev + 2
        const newColor = getSugarColor(newTemp)
        setSugarColor(newColor)
        
        // Gas bubbles start after 150°C
        setGasBubbles(newTemp > 150)
        
        // Adjust flame based on target temperature
        if (newTemp > 180) {
          setFlameIntensity(0.5) // Reduce flame as sugar burns
        }
        
        if (newTemp >= 220) {
          clearInterval(interval)
          setIsHeating(false)
          setFlameIntensity(0)
        }
        
        return newTemp
      })
    }, 200)
  }

  const resetSimulation = () => {
    setTemperature(25)
    setIsHeating(false)
    setSugarColor("#ffffff")
    setGasBubbles(false)
    setFlameIntensity(0)
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="flex items-center gap-1">
          <Thermometer className="w-3 h-3" />
          Sugar Decomposition
        </Badge>
        <Badge variant="outline">
          Caramelization Process
        </Badge>
        <Badge variant={temperature > 150 ? "default" : "outline"}>
          {getStageName(temperature)}
        </Badge>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [3, 2, 4], fov: 50 }}>
          <color attach="background" args={["#f8fafc"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1.2} />
          <pointLight position={[-5, 5, -5]} intensity={0.5} />
          
          <LabTable />
          <Tripod />
          <TestTube 
            position={[0.2, 0.3, 0]}
            sugarColor={sugarColor}
            isHeating={isHeating}
            temperature={temperature}
            gasBubbles={gasBubbles}
          />
          <BunsenBurner intensity={flameIntensity} />

          <Text position={[0.5, 1.8, 0]} fontSize={0.12} color="#1a202c" anchorX="center">
            {temperature}°C
          </Text>

          <OrbitControls enablePan={false} minDistance={3} maxDistance={8} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      </div>

      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Settings2 className="w-4 h-4" />
          Heating Controls
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Temperature</span>
            <span className="font-medium">{temperature}°C</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-600 transition-all duration-300"
              style={{ width: `${(temperature / 220) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded border-2 border-gray-400 transition-colors duration-500"
            style={{ backgroundColor: sugarColor }}
          />
          <div className="text-sm">
            <p className="font-medium">{getStageName(temperature)}</p>
            <p className="text-xs text-muted-foreground">
              {temperature > 150 ? "Decomposition occurring - gases released" : "Heating in progress..."}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={startHeating}
            disabled={isHeating || temperature >= 220}
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            {isHeating ? "Heating..." : "Start Heating"}
          </Button>
          <Button
            variant="outline"
            onClick={resetSimulation}
            disabled={isHeating}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/40 p-4 text-sm space-y-2">
        <p className="font-medium text-foreground">Process Stages:</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div><span className="inline-block w-3 h-3 rounded mr-1" style={{backgroundColor: "#ffffff"}} /> 25°C - White solid sugar</div>
          <div><span className="inline-block w-3 h-3 rounded mr-1" style={{backgroundColor: "#fff8dc"}} /> 100°C - Melting begins</div>
          <div><span className="inline-block w-3 h-3 rounded mr-1" style={{backgroundColor: "#f5deb3"}} /> 160°C - Light caramel</div>
          <div><span className="inline-block w-3 h-3 rounded mr-1" style={{backgroundColor: "#deb887"}} /> 170°C - Medium caramel</div>
          <div><span className="inline-block w-3 h-3 rounded mr-1" style={{backgroundColor: "#8b4513"}} /> 180°C - Dark caramel</div>
          <div><span className="inline-block w-3 h-3 rounded mr-1" style={{backgroundColor: "#3d2817"}} /> 200°C+ - Burnt/black</div>
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          <span className="font-medium">Chemical Changes:</span> Above 160°C, sugar undergoes caramelization 
          (dehydration, polymerization) producing volatile compounds and brown pigments.
        </p>
      </div>
    </div>
  )
}
