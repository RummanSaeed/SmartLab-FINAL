"use client"

import { useState, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, RotateCcw, Thermometer, Beaker } from "lucide-react"
import * as THREE from "three"

// Water Bath with Temperature Control
function WaterBath({ temperature, isDissolving }: { temperature: number; isDissolving: boolean }) {
  const bathRef = useRef<THREE.Mesh>(null)
  const bubblesRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (bubblesRef.current && isDissolving && temperature > 20) {
      bubblesRef.current.children.forEach((bubble, i) => {
        const mesh = bubble as THREE.Mesh
        mesh.position.y += 0.005
        if (mesh.position.y > 0.5) {
          mesh.position.y = -0.3
          mesh.position.x = (Math.random() - 0.5) * 0.6
          mesh.position.z = (Math.random() - 0.5) * 0.4
        }
      })
    }
  })
  
  const waterColor = temperature > 80 ? "#fc8181" : temperature > 50 ? "#fbd38d" : "#90cdf4"
  
  return (
    <group position={[0, -1, 0]}>
      {/* Beaker */}
      <mesh>
        <cylinderGeometry args={[0.6, 0.5, 1.2, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.2}
          transparent
          roughness={0.1}
          thickness={0.05}
        />
      </mesh>
      
      {/* Water */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.9, 32]} />
        <meshStandardMaterial color={waterColor} transparent opacity={0.6} />
      </mesh>
      
      {/* Sample tube inside */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.3}
          transparent
        />
      </mesh>
      
      {/* Undissolved oxalic acid at bottom */}
      {!isDissolving && (
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )}
      
      {/* Bubbles when dissolving */}
      {isDissolving && (
        <group ref={bubblesRef}>
          {Array.from({ length: 8 }).map((_, i) => (
            <mesh key={i} position={[(Math.random() - 0.5) * 0.3, -0.2 + i * 0.1, (Math.random() - 0.5) * 0.2]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Thermometer */}
      <mesh position={[0.7, 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
        <meshStandardMaterial color="#718096" />
      </mesh>
      <mesh position={[0.7, -0.5, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
        <meshStandardMaterial color="#e53e3e" />
      </mesh>
      
      <Text position={[0.9, 0.5, 0]} fontSize={0.08} color="#2d3748" anchorX="left">
        {temperature.toFixed(1)} °C
      </Text>
      
      {/* Heating coil indicator */}
      <mesh position={[0, -0.8, 0]}>
        <torusGeometry args={[0.4, 0.02, 8, 32]} />
        <meshStandardMaterial color={temperature > 30 ? "#e53e3e" : "#718096"} />
      </mesh>
    </group>
  )
}

// Scene
function Scene({ temperature, isDissolving }: any) {
  return (
    <>
      <color attach="background" args={["#020817"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      
      <WaterBath temperature={temperature} isDissolving={isDissolving} />
      
      <Text position={[0, 3, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
        Solubility of Oxalic Acid at Different Temperatures
      </Text>
      
      <OrbitControls enablePan={false} minDistance={6} maxDistance={12} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

// Main Component
export function OxalicSolubilitySim() {
  const [temperature, setTemperature] = useState(25)
  const [isDissolving, setIsDissolving] = useState(false)
  const [measurements, setMeasurements] = useState<Array<{temp: number; mass: number}>>([])
  const [currentMass, setCurrentMass] = useState(0)
  
  // Oxalic acid solubility data (g/100mL water)
  const solubilityData: Record<number, number> = {
    0: 3.5, 10: 5.8, 20: 9.5, 30: 14.3, 40: 21.2, 
    50: 31.4, 60: 44.6, 70: 62.1, 80: 84.5, 90: 112.3, 100: 146.0
  }
  
  const handleDissolve = () => {
    setIsDissolving(true)
    const targetMass = solubilityData[Math.round(temperature / 10) * 10] || solubilityData[20]
    
    let progress = 0
    const interval = setInterval(() => {
      progress += 0.05
      setCurrentMass(targetMass * Math.min(progress, 1))
      if (progress >= 1) {
        clearInterval(interval)
        setIsDissolving(false)
      }
    }, 50)
  }
  
  const handleRecord = () => {
    const mass = solubilityData[Math.round(temperature / 10) * 10] || solubilityData[20]
    setMeasurements(prev => [...prev, { temp: temperature, mass }].slice(-8))
    setCurrentMass(mass)
  }
  
  const handleReset = () => {
    setTemperature(25)
    setIsDissolving(false)
    setMeasurements([])
    setCurrentMass(0)
  }
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleDissolve} disabled={isDissolving} className="gap-2">
          <Play className="w-4 h-4" />
          {isDissolving ? "Dissolving..." : "Dissolve at Temp"}
        </Button>
        <Button onClick={handleRecord} className="gap-2">
          <Beaker className="w-4 h-4" />
          Record Measurement
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Temperature: {temperature}°C</label>
        <Slider 
          value={[temperature]} 
          onValueChange={([v]) => setTemperature(v)}
          min={0} 
          max={100} 
          step={1}
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Temperature</span>
          <span className="text-lg font-semibold">{temperature} °C</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Solubility</span>
          <span className="text-lg font-semibold">{currentMass.toFixed(1)} g/100mL</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Data Points</span>
          <span className="text-lg font-semibold">{measurements.length}</span>
        </Badge>
      </div>
      
      {measurements.length > 0 && (
        <div className="rounded-lg border p-3">
          <h4 className="text-sm font-medium mb-2">Solubility Data</h4>
          <div className="h-32 relative bg-gray-50 rounded">
            <svg className="w-full h-full" viewBox="0 0 200 100">
              <line x1="20" y1="90" x2="180" y2="90" stroke="#cbd5e0" strokeWidth="1" />
              <line x1="20" y1="10" x2="20" y2="90" stroke="#cbd5e0" strokeWidth="1" />
              
              {/* Points */}
              {measurements.map((m, i) => (
                <circle
                  key={i}
                  cx={20 + (m.temp / 100) * 160}
                  cy={90 - (m.mass / 150) * 80}
                  r="3"
                  fill="#3182ce"
                />
              ))}
              
              {/* Trend line */}
              {measurements.length > 1 && (
                <polyline
                  points={measurements.map(m => `${20 + (m.temp / 100) * 160},${90 - (m.mass / 150) * 80}`).join(' ')}
                  fill="none"
                  stroke="#3182ce"
                  strokeWidth="1"
                />
              )}
            </svg>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {measurements.map(m => `T=${m.temp}°C: ${m.mass.toFixed(1)}g`).join(' | ')}
          </div>
        </div>
      )}
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Procedure:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Prepare saturated solution at different temperatures</li>
          <li>Filter and titrate known aliquots with KMnO₄</li>
          <li>Calculate oxalic acid concentration at each temperature</li>
          <li>Plot solubility curve vs temperature</li>
        </ol>
      </div>
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [5, 3, 5], fov: 50 }} shadows>
          <Scene temperature={temperature} isDissolving={isDissolving} />
        </Canvas>
      </div>
    </div>
  )
}
