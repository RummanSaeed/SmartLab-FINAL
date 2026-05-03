"use client"

import { useState, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, RotateCcw, Thermometer, Beaker } from "lucide-react"
import * as THREE from "three"

// Water Bath
function WaterBath({ temperature, hasCrystals }: { temperature: number; hasCrystals: boolean }) {
  const waterColor = temperature > 70 ? "#fc8181" : temperature > 40 ? "#fbd38d" : "#90cdf4"
  
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
      
      {/* Sample tube */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.3} transparent />
      </mesh>
      
      {/* Crystals at bottom */}
      {hasCrystals && (
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
          <meshStandardMaterial color="#a0c4ff" />
        </mesh>
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
    </group>
  )
}

// Scene
function Scene({ temperature, hasCrystals }: any) {
  return (
    <>
      <color attach="background" args={["#020817"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      
      <WaterBath temperature={temperature} hasCrystals={hasCrystals} />
      
      <Text position={[0, 3, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
        Solubility of Mohr's Salt (FeSO₄·(NH₄)₂SO₄·6H₂O)
      </Text>
      
      <OrbitControls enablePan={false} minDistance={6} maxDistance={12} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

// Main Component
export function MohrSaltSolubilitySim() {
  const [temperature, setTemperature] = useState(25)
  const [measurements, setMeasurements] = useState<Array<{temp: number; solubility: number}>>([])
  const [isMeasuring, setIsMeasuring] = useState(false)
  
  // Mohr's salt solubility data (g/100mL water)
  const solubilityData: Record<number, number> = {
    0: 17.8, 10: 24.1, 20: 31.8, 30: 40.5, 40: 50.2,
    50: 61.8, 60: 75.2, 70: 91.5, 80: 110.3, 90: 132.6, 100: 159.8
  }
  
  const handleMeasure = () => {
    setIsMeasuring(true)
    setTimeout(() => {
      const solubility = solubilityData[Math.round(temperature / 10) * 10] || solubilityData[20]
      setMeasurements(prev => [...prev, { temp: temperature, solubility }].slice(-8))
      setIsMeasuring(false)
    }, 1000)
  }
  
  const handleReset = () => {
    setTemperature(25)
    setMeasurements([])
    setIsMeasuring(false)
  }
  
  const currentSolubility = solubilityData[Math.round(temperature / 10) * 10] || solubilityData[20]
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleMeasure} disabled={isMeasuring} className="gap-2">
          <Play className="w-4 h-4" />
          {isMeasuring ? "Measuring..." : "Record Solubility"}
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Temperature: {temperature}°C</label>
        <Slider value={[temperature]} onValueChange={([v]) => setTemperature(v)} min={0} max={100} step={1} />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Temperature</span>
          <span className="text-lg font-semibold">{temperature} °C</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Solubility</span>
          <span className="text-lg font-semibold">{currentSolubility.toFixed(1)} g/100mL</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Data Points</span>
          <span className="text-lg font-semibold">{measurements.length}</span>
        </Badge>
      </div>
      
      {measurements.length > 0 && (
        <div className="rounded-lg border p-3">
          <h4 className="text-sm font-medium mb-2">Solubility Data</h4>
          <div className="text-xs space-y-1">
            {measurements.map((m, i) => (
              <div key={i} className="flex justify-between">
                <span>T = {m.temp}°C</span>
                <span>S = {m.solubility.toFixed(1)} g/100mL</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Procedure:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Saturate water with Mohr's salt at controlled temperature</li>
          <li>Filter and titrate known volume with KMnO₄</li>
          <li>Calculate solubility at each temperature</li>
          <li>Plot solubility vs temperature curve</li>
        </ol>
      </div>
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [5, 3, 5], fov: 50 }} shadows>
          <Scene temperature={temperature} hasCrystals={temperature < 40} />
        </Canvas>
      </div>
    </div>
  )
}
