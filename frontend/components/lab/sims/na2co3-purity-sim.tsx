"use client"

import { useState, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Scale, Beaker } from "lucide-react"
import * as THREE from "three"

// Burette Component
function Burette({ volume, isRunning }: { volume: number; isRunning: boolean }) {
  const meniscusRef = useRef<THREE.Mesh>(null)
  const dropRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meniscusRef.current) {
      const y = 2 - (volume / 50) * 4 + Math.sin(state.clock.elapsedTime * 2) * 0.002
      meniscusRef.current.position.y = y
    }
    if (isRunning && dropRef.current) {
      const time = state.clock.elapsedTime % 0.5
      dropRef.current.position.y = -2.5 - time * 2
      dropRef.current.visible = time < 0.3
    }
  })
  
  const liquidHeight = (volume / 50) * 4
  
  return (
    <group position={[0, 1.5, 0]}>
      {/* Stand */}
      <mesh position={[-0.5, 0, 0]}>
        <boxGeometry args={[0.08, 5, 0.2]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      
      {/* Burette tube */}
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, 4.5, 32]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.2} transparent roughness={0.1} />
      </mesh>
      
      {/* Liquid */}
      {volume > 0 && (
        <>
          <mesh position={[0, 2 - liquidHeight / 2, 0]}>
            <cylinderGeometry args={[0.075, 0.075, liquidHeight, 32]} />
            <meshStandardMaterial color="#f56565" transparent opacity={0.8} />
          </mesh>
          <mesh ref={meniscusRef} position={[0, 2 - liquidHeight, 0]}>
            <sphereGeometry args={[0.075, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#f56565" transparent opacity={0.8} />
          </mesh>
        </>
      )}
      
      {/* Graduations */}
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh key={i} position={[0.085, 2 - i * 0.08, 0]}>
          <boxGeometry args={[0.015, 0.002, i % 5 === 0 ? 0.04 : 0.02]} />
          <meshStandardMaterial color="#1a202c" />
        </mesh>
      ))}
      
      {/* Numbers */}
      {Array.from({ length: 11 }).map((_, i) => (
        <Text key={i} position={[0.15, 2 - i * 0.4, 0]} fontSize={0.06} color="#1a202c" anchorX="left">
          {i * 5}
        </Text>
      ))}
      
      {/* Stopcock */}
      <mesh position={[0, -2.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.15, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      
      {/* Drop */}
      <mesh ref={dropRef} position={[0, -2.7, 0]} visible={false}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#f56565" />
      </mesh>
      
      <Text position={[0.2, 2.5, 0]} fontSize={0.08} color="#2d3748" anchorX="left">
        HCl (0.1M)
      </Text>
    </group>
  )
}

// Conical Flask
function ConicalFlask({ volume, ph, color }: { volume: number; ph: number; color: string }) {
  const flaskRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (flaskRef.current) {
      flaskRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.02
    }
  })
  
  const liquidHeight = Math.min((volume / 100) * 0.8, 0.8)
  
  return (
    <group ref={flaskRef} position={[0, -1, 0]}>
      <mesh>
        <cylinderGeometry args={[0.4, 0.25, 0.6, 32]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.2} transparent roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.4, 0.4, 32]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.2} transparent roughness={0.1} />
      </mesh>
      
      {volume > 0 && (
        <>
          <mesh position={[0, -0.3 + liquidHeight / 2, 0]}>
            <cylinderGeometry args={[0.38, 0.23, liquidHeight, 32]} />
            <meshStandardMaterial color={color} transparent opacity={0.85} />
          </mesh>
        </>
      )}
      
      <Text position={[0.6, 0.3, 0]} fontSize={0.07} color="#2d3748" anchorX="left">
        pH: {ph.toFixed(2)}
      </Text>
    </group>
  )
}

// Weighing Bottle
function WeighingBottle({ weight }: { weight: number }) {
  return (
    <group position={[-2.5, -1.5, 0]}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.4, 32]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={0.3} transparent roughness={0.1} />
      </mesh>
      {weight > 0 && (
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.15, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.06, 32]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <Text position={[0, -0.5, 0]} fontSize={0.06} color="#2d3748" anchorX="center">
        Na₂CO₃ Sample
      </Text>
      {weight > 0 && (
        <Text position={[0.35, 0, 0]} fontSize={0.07} color="#2b6cb0" anchorX="left">
          {weight.toFixed(4)} g
        </Text>
      )}
    </group>
  )
}

// Scene
function Scene({ buretteVolume, flaskVolume, ph, indicatorColor, isRunning, sampleWeight }: any) {
  return (
    <>
      <color attach="background" args={["#f7fafc"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      <Burette volume={buretteVolume} isRunning={isRunning} />
      <ConicalFlask volume={flaskVolume} ph={ph} color={indicatorColor} />
      <WeighingBottle weight={sampleWeight} />
      
      <Text position={[0, 4, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
        Purity of Na₂CO₃ Solution
      </Text>
      
      <OrbitControls enablePan={false} minDistance={7} maxDistance={14} target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

// Main Component
export function Na2co3PuritySim() {
  const [sampleWeight, setSampleWeight] = useState(0)
  const [addedVolume, setAddedVolume] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [endpoint, setEndpoint] = useState<number | null>(null)
  const [isWeighed, setIsWeighed] = useState(false)
  
  const ph = useMemo(() => {
    const molesCarbonate = (sampleWeight / 106) * 0.1
    const molesAcid = 0.1 * (addedVolume / 1000)
    const ratio = molesAcid / molesCarbonate
    
    if (ratio < 1) return 10.3 - ratio * 2
    if (ratio > 2) return 3.5
    return 8.3 - (ratio - 1) * 4
  }, [addedVolume, sampleWeight])
  
  const indicatorColor = useMemo(() => {
    if (ph > 8.3) return "#f687b3"
    return "#fef3c7"
  }, [ph])
  
  const handleWeigh = () => {
    setSampleWeight(1.3256)
    setIsWeighed(true)
  }
  
  const handleStart = () => {
    if (!isWeighed) return
    setIsRunning(true)
    
    const interval = setInterval(() => {
      setAddedVolume(prev => {
        const newVol = prev + 0.03
        if (newVol >= 25) {
          clearInterval(interval)
          setIsRunning(false)
          setEndpoint(newVol)
        }
        return newVol
      })
    }, 50)
  }
  
  const handleReset = () => {
    setIsRunning(false)
    setAddedVolume(0)
    setEndpoint(null)
    setSampleWeight(0)
    setIsWeighed(false)
  }
  
  const results = useMemo(() => {
    if (!endpoint) return null
    
    const molesHCl = 0.1 * endpoint / 1000
    const molesNa2CO3 = molesHCl / 2
    const massPure = molesNa2CO3 * 106 * 10
    const purity = (massPure / sampleWeight) * 100
    
    return { massPure, purity }
  }, [endpoint, sampleWeight])
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleWeigh} disabled={isWeighed} className="gap-2">
          <Scale className="w-4 h-4" />
          {isWeighed ? "Weighed" : "Weigh Sample"}
        </Button>
        <Button onClick={handleStart} disabled={!isWeighed || isRunning || endpoint !== null} className="gap-2">
          <Play className="w-4 h-4" />
          {isRunning ? "Titrating..." : "Start Titration"}
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Sample Weight</span>
          <span className="text-lg font-semibold">{sampleWeight.toFixed(4)} g</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">HCl Added</span>
          <span className="text-lg font-semibold">{addedVolume.toFixed(2)} mL</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">pH</span>
          <span className="text-lg font-semibold">{ph.toFixed(2)}</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Stage</span>
          <span className="text-lg font-semibold">{ph > 8.3 ? "First" : "Second"}</span>
        </Badge>
      </div>
      
      {results && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h4 className="font-semibold text-green-800 mb-2">Analysis Complete</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Pure Na₂CO₃:</span>
              <span className="ml-2 font-medium">{results.massPure.toFixed(4)} g</span>
            </div>
            <div>
              <span className="text-muted-foreground">Percentage purity:</span>
              <span className="ml-2 font-medium text-green-700">{results.purity.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Double Indicator Method:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Weigh Na₂CO₃ sample, dissolve and make up to 250 mL</li>
          <li>First endpoint (phenolphthalein): CO₃²⁻ → HCO₃⁻</li>
          <li>Second endpoint (methyl orange): HCO₃⁻ → H₂CO₃</li>
          <li>Volume between endpoints = moles of Na₂CO₃</li>
        </ol>
      </div>
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [6, 3, 6], fov: 50 }} shadows>
          <Scene 
            buretteVolume={50 - addedVolume}
            flaskVolume={25 + addedVolume * 0.02}
            ph={ph}
            indicatorColor={indicatorColor}
            isRunning={isRunning}
            sampleWeight={sampleWeight}
          />
        </Canvas>
      </div>
    </div>
  )
}
