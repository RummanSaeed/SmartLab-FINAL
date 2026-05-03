"use client"

import { useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Clock, Beaker } from "lucide-react"
import * as THREE from "three"

// Test tubes with starch + amylase
function TestTubes({ 
  tubeProgress,
  iodineAdded
}: { 
  tubeProgress: number[]
  iodineAdded: boolean
}) {
  const positions = [
    { x: -1, label: "0 min" },
    { x: 0, label: "5 min" },
    { x: 1, label: "10 min" }
  ]
  
  // Color changes from blue-black (starch) to reddish-brown (no starch)
  const getColor = (progress: number) => {
    if (!iodineAdded) return "#fef3c7" // Pale yellow (starch solution)
    // Blue-black → Brown as digestion progresses
    if (progress < 0.3) return "#1e3a8a" // Deep blue-black
    if (progress < 0.7) return "#3b82f6" // Blue
    return "#9a3412" // Reddish-brown (no starch)
  }
  
  return (
    <group position={[0, 0, 0]}>
      {positions.map((pos, i) => (
        <group key={i} position={[pos.x, -0.5, 0]}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.18, 0.8, 16]} />
            <meshPhysicalMaterial 
              color="#ffffff"
              transmission={0.9}
              opacity={0.3}
              transparent
              roughness={0.1}
            />
          </mesh>
          
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.45, 16]} />
            <meshStandardMaterial 
              color={getColor(tubeProgress[i])}
              transparent
              opacity={0.85}
            />
          </mesh>
          
          <Text position={[0, 0.5, 0]} fontSize={0.07} color="#2d3748" anchorX="center">
            {pos.label}
          </Text>
        </group>
      ))}
    </group>
  )
}

// Water bath at 37°C
function WaterBath({ temperature }: { temperature: number }) {
  return (
    <group position={[0, -1.2, 0]}>
      <mesh>
        <cylinderGeometry args={[0.8, 0.7, 0.5, 32]} />
        <meshPhysicalMaterial 
          color="#e2e8f0"
          transmission={0.9}
          opacity={0.4}
          transparent
          roughness={0.1}
        />
      </mesh>
      
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.75, 0.65, 0.4, 32]} />
        <meshStandardMaterial color="#90cdf4" transparent opacity={0.5} />
      </mesh>
      
      <Text position={[0, -0.5, 0]} fontSize={0.07} color="#2d3748" anchorX="center">
        37°C (Body temperature)
      </Text>
    </group>
  )
}

// Scene
function Scene({ tubeProgress, iodineAdded }: any) {
  return (
    <>
      <color attach="background" args={["#020817"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      <TestTubes tubeProgress={tubeProgress} iodineAdded={iodineAdded} />
      <WaterBath temperature={37} />
      
      <Text position={[0, 2.5, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
        Starch Digestion by Salivary Amylase
      </Text>
      
      <OrbitControls enablePan={false} minDistance={6} maxDistance={12} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

// Main Component
export function StarchDigestionSim() {
  const [isRunning, setIsRunning] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [tubeProgress, setTubeProgress] = useState([0, 0, 0])
  const [iodineAdded, setIodineAdded] = useState(false)
  const [digestionComplete, setDigestionComplete] = useState(false)
  
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1
          
          // Update tube progress based on time
          setTubeProgress([
            0, // 0 min tube stays same
            Math.min((newTime / 60) * 0.5, 0.5), // 5 min tube
            Math.min((newTime / 60), 1) // 10 min tube
          ])
          
          if (newTime >= 60) {
            setIsRunning(false)
            setDigestionComplete(true)
          }
          
          return newTime
        })
      }, 100)
    }
    
    return () => clearInterval(interval)
  }, [isRunning])
  
  const handleStart = () => {
    setIsRunning(true)
    setIodineAdded(false)
  }
  
  const handleAddIodine = () => {
    setIodineAdded(true)
  }
  
  const handleReset = () => {
    setIsRunning(false)
    setTimeElapsed(0)
    setTubeProgress([0, 0, 0])
    setIodineAdded(false)
    setDigestionComplete(false)
  }
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleStart} disabled={isRunning} className="gap-2">
          <Play className="w-4 h-4" />
          {isRunning ? "Digesting..." : "Start Digestion"}
        </Button>
        <Button onClick={handleAddIodine} disabled={!digestionComplete || iodineAdded} className="gap-2">
          <Beaker className="w-4 h-4" />
          Add Iodine
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Time</span>
          <span className="text-lg font-semibold">{timeElapsed}s</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Temperature</span>
          <span className="text-lg font-semibold">37°C</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Status</span>
          <span className="text-lg font-semibold">
            {isRunning ? "Digesting" : digestionComplete ? "Complete" : "Ready"}
          </span>
        </Badge>
      </div>
      
      {iodineAdded && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="font-semibold text-blue-800">Iodine Test Results:</h4>
          <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
            <div className="text-center">
              <div className="font-medium">0 min</div>
              <div className="text-blue-900">Blue-black</div>
              <div className="text-xs text-blue-700">Starch present</div>
            </div>
            <div className="text-center">
              <div className="font-medium">5 min</div>
              <div className="text-blue-600">Blue</div>
              <div className="text-xs text-blue-700">Partial digestion</div>
            </div>
            <div className="text-center">
              <div className="font-medium">10 min</div>
              <div className="text-amber-700">Reddish-brown</div>
              <div className="text-xs text-green-700">Starch digested!</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Enzymatic Hydrolysis:</h4>
        <p className="text-xs mb-2 font-mono">
          (C₆H₁₀O₅)n + nH₂O → nC₆H₁₂O₆
        </p>
        <p className="text-xs mb-2">
          Salivary amylase (ptyalin) hydrolyzes α-1,4-glycosidic bonds in starch,
          producing maltose and dextrins. Optimal pH ~6.7-7.0, temperature 37°C.
        </p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Prepare 1% starch solution</li>
          <li>Add diluted saliva (amylase source)</li>
          <li>Incubate at 37°C</li>
          <li>Test aliquots with iodine at intervals</li>
          <li>Blue-black → Blue → Reddish-brown (complete digestion)</li>
        </ol>
      </div>
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [5, 3, 5], fov: 50 }} shadows>
          <Scene tubeProgress={tubeProgress} iodineAdded={iodineAdded} />
        </Canvas>
      </div>
    </div>
  )
}
