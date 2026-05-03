"use client"

import { useState, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Scale, Calculator } from "lucide-react"
import * as THREE from "three"

interface TitrationData {
  volume: number
  ph: number
}

// Advanced Burette with Digital Display
function DigitalBurette({ 
  volume, 
  isRunning,
  flowRate = 0.05
}: { 
  volume: number
  isRunning: boolean
  flowRate?: number
}) {
  const meniscusRef = useRef<THREE.Mesh>(null)
  const dropRef = useRef<THREE.Mesh>(null)
  const [dropPhase, setDropPhase] = useState(0)
  
  useFrame((state) => {
    if (meniscusRef.current) {
      const y = 2.2 - (volume / 50) * 4 + Math.sin(state.clock.elapsedTime * 3) * 0.003
      meniscusRef.current.position.y = y
    }
    
    if (isRunning && dropRef.current) {
      const time = state.clock.elapsedTime * 3
      const phase = time % 1
      setDropPhase(phase)
      
      if (phase < 0.4) {
        dropRef.current.position.y = -2.2 - phase * 3
        dropRef.current.scale.setScalar(1 - phase * 2)
        dropRef.current.visible = true
      } else {
        dropRef.current.visible = false
      }
    }
  })
  
  const liquidHeight = (volume / 50) * 4
  const liquidY = 2.2 - liquidHeight / 2
  
  return (
    <group position={[0, 1.5, 0]}>
      {/* Stand */}
      <mesh position={[-0.6, 0, 0]}>
        <boxGeometry args={[0.08, 6, 0.3]} />
        <meshStandardMaterial color="#4a5568" metalness={0.8} />
      </mesh>
      
      {/* Clamp */}
      <mesh position={[-0.32, 1.8, 0]}>
        <boxGeometry args={[0.55, 0.08, 0.15]} />
        <meshStandardMaterial color="#718096" metalness={0.9} />
      </mesh>
      
      {/* Burette tube */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 4.8, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.95}
          opacity={0.15}
          transparent
          roughness={0.05}
          thickness={0.08}
        />
      </mesh>
      
      {/* Liquid */}
      {volume > 0 && (
        <>
          <mesh position={[0, liquidY, 0]}>
            <cylinderGeometry args={[0.075, 0.075, liquidHeight, 32]} />
            <meshStandardMaterial 
              color="#f7c600"
              transparent
              opacity={0.75}
            />
          </mesh>
          <mesh ref={meniscusRef} position={[0, 2.2 - liquidHeight, 0]}>
            <sphereGeometry args={[0.075, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#f7c600" transparent opacity={0.75} />
          </mesh>
        </>
      )}
      
      {/* Graduations - every 0.1 mL */}
      {Array.from({ length: 500 }).map((_, i) => (
        <mesh key={i} position={[0.085, 2.2 - i * 0.008, 0]}>
          <boxGeometry args={[
            0.015, 
            0.001, 
            i % 10 === 0 ? 0.04 : i % 5 === 0 ? 0.03 : 0.02
          ]} />
          <meshStandardMaterial color={i % 10 === 0 ? "#1a202c" : "#4a5568"} />
        </mesh>
      ))}
      
      {/* Major markings */}
      {Array.from({ length: 51 }).map((_, i) => (
        <Text
          key={i}
          position={[0.18, 2.2 - i * 0.08, 0]}
          fontSize={0.06}
          color="#1a202c"
          anchorX="left"
        >
          {i}
        </Text>
      ))}
      
      {/* Digital readout attachment */}
      <mesh position={[0.5, 1.5, 0]}>
        <boxGeometry args={[0.4, 0.25, 0.1]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0.5, 1.5, 0.06]}>
        <planeGeometry args={[0.35, 0.2]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0.5, 1.5, 0.07]} fontSize={0.08} color="#000000" anchorX="center">
        {volume.toFixed(2)} mL
      </Text>
      
      {/* Stopcock with handle */}
      <mesh position={[0, -2.6, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.2, 16]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      <mesh position={[0.25, -2.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
        <meshStandardMaterial color="#718096" metalness={0.9} />
      </mesh>
      
      {/* Tip */}
      <mesh position={[0, -2.9, 0]}>
        <coneGeometry args={[0.025, 0.25, 16]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          transparent
          roughness={0.1}
        />
      </mesh>
      
      {/* Falling drop */}
      <mesh ref={dropRef} position={[0, -2.5, 0]} visible={false}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#f7c600" transparent opacity={0.9} />
      </mesh>
    </group>
  )
}

// Weighing Bottle with NaOH
function WeighingBottle({ 
  sampleWeight,
  isWeighed 
}: { 
  sampleWeight: number
  isWeighed: boolean
}) {
  return (
    <group position={[-3, -1.5, 1]}>
      {/* Bottle body */}
      <mesh>
        <cylinderGeometry args={[0.25, 0.25, 0.5, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.3}
          transparent
          roughness={0.1}
          thickness={0.05}
        />
      </mesh>
      
      {/* NaOH pellets inside */}
      {sampleWeight > 0 && (
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.15, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )}
      
      {/* Cap */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.08, 32]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      
      {/* Label */}
      <Text position={[0, -0.4, 0]} fontSize={0.06} color="#2d3748" anchorX="center">
        Weighing Bottle
      </Text>
      
      {isWeighed && (
        <Text position={[0.4, 0, 0]} fontSize={0.07} color="#2b6cb0" anchorX="left">
          {sampleWeight.toFixed(4)} g
        </Text>
      )}
    </group>
  )
}

// Analytical Balance
function AnalyticalBalance({ 
  weight,
  isActive 
}: { 
  weight: number
  isActive: boolean
}) {
  const displayRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (displayRef.current && isActive) {
      // Simulate digital flicker
      const flicker = Math.sin(state.clock.elapsedTime * 30) > 0.9 ? 0.9 : 1
      displayRef.current.material.emissiveIntensity = flicker * 0.5
    }
  })
  
  return (
    <group position={[-3, -2.2, 1]}>
      {/* Base */}
      <mesh>
        <boxGeometry args={[1.2, 0.15, 1]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      
      {/* Weighing chamber */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1, 0.7, 0.8]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.8}
          opacity={0.2}
          transparent
          roughness={0.1}
        />
      </mesh>
      
      {/* Draft shield doors */}
      <mesh position={[-0.4, 0.35, 0.41]}>
        <boxGeometry args={[0.35, 0.65, 0.02]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.7}
          transparent
          roughness={0.05}
        />
      </mesh>
      <mesh position={[0.4, 0.35, 0.41]}>
        <boxGeometry args={[0.35, 0.65, 0.02]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.7}
          transparent
          roughness={0.05}
        />
      </mesh>
      
      {/* Display panel */}
      <mesh position={[0, 0.8, 0.2]}>
        <boxGeometry args={[1, 0.3, 0.1]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      
      {/* Digital display */}
      <mesh ref={displayRef} position={[0, 0.8, 0.26]}>
        <planeGeometry args={[0.8, 0.2]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, 0.8, 0.27]} fontSize={0.12} color="#000000" anchorX="center">
        {weight > 0 ? weight.toFixed(4) : "0.0000"} g
      </Text>
      
      {/* Control buttons */}
      <mesh position={[-0.3, 0.8, 0.26]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
        <meshStandardMaterial color="#e53e3e" />
      </mesh>
      <mesh position={[0.3, 0.8, 0.26]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
        <meshStandardMaterial color="#38a169" />
      </mesh>
      
      {/* Label */}
      <Text position={[0, -0.2, 0.55]} fontSize={0.07} color="#718096" anchorX="center">
        Analytical Balance (±0.0001 g)
      </Text>
    </group>
  )
}

// Conical Flask with Indicator
function ConicalFlask({ 
  volume,
  ph,
  indicatorColor
}: { 
  volume: number
  ph: number
  indicatorColor: string
}) {
  const flaskRef = useRef<THREE.Group>(null)
  const swirlRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (flaskRef.current) {
      // Gentle swirling
      flaskRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.03
      flaskRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 1.5) * 0.02
    }
  })
  
  const liquidHeight = Math.min((volume / 100) * 1, 0.8)
  
  return (
    <group ref={flaskRef} position={[0, -1.2, 0]}>
      {/* Flask */}
      <mesh>
        <cylinderGeometry args={[0.45, 0.28, 0.7, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.2}
          transparent
          roughness={0.1}
          thickness={0.05}
        />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.18, 0.45, 0.4, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.2}
          transparent
          roughness={0.1}
          thickness={0.05}
        />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.15, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.2}
          transparent
          roughness={0.1}
          thickness={0.05}
        />
      </mesh>
      
      {/* Liquid */}
      {volume > 0 && (
        <>
          <mesh position={[0, -0.35 + liquidHeight / 2, 0]}>
            <cylinderGeometry args={[0.42, 0.26, liquidHeight, 32]} />
            <meshStandardMaterial 
              color={indicatorColor}
              transparent
              opacity={0.85}
            />
          </mesh>
          <mesh position={[0, -0.35 + liquidHeight, 0]}>
            <sphereGeometry args={[0.17, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={indicatorColor} transparent opacity={0.85} />
          </mesh>
        </>
      )}
      
      {/* Measurement label */}
      <Text position={[0.7, 0.3, 0]} fontSize={0.07} color="#2d3748" anchorX="left">
        pH: {ph.toFixed(2)}
      </Text>
      <Text position={[0.7, 0.1, 0]} fontSize={0.07} color="#2d3748" anchorX="left">
        Vol: {volume.toFixed(1)} mL
      </Text>
    </group>
  )
}

// Scene
function Scene({ 
  buretteVolume,
  flaskVolume,
  ph,
  indicatorColor,
  isRunning,
  sampleWeight
}: {
  buretteVolume: number
  flaskVolume: number
  ph: number
  indicatorColor: string
  isRunning: boolean
  sampleWeight: number
}) {
  return (
    <>
      <color attach="background" args={["#020817"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      
      {/* Bench */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      
      <DigitalBurette volume={buretteVolume} isRunning={isRunning} />
      <ConicalFlask volume={flaskVolume} ph={ph} indicatorColor={indicatorColor} />
      <WeighingBottle sampleWeight={sampleWeight} isWeighed={sampleWeight > 0} />
      <AnalyticalBalance weight={sampleWeight} isActive={sampleWeight > 0} />
      
      <Text position={[0, 4, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
        % NaOH Determination by Titration
      </Text>
      
      <OrbitControls 
        enablePan={false}
        minDistance={8}
        maxDistance={16}
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  )
}

// Main Component
export function NaohPercentageSim() {
  const [buretteVolume, setBuretteVolume] = useState(0)
  const [addedVolume, setAddedVolume] = useState(0)
  const [flaskVolume] = useState(25)
  const [sampleWeight, setSampleWeight] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isWeighed, setIsWeighed] = useState(false)
  const [endpoint, setEndpoint] = useState<number | null>(null)
  
  // Calculate pH
  const ph = useMemo(() => {
    const molesBase = (sampleWeight / 40) * (25 / 250) // g NaOH in aliquot
    const molesAcidAdded = 0.5 * (addedVolume / 1000) // 0.5M HCl
    const excessBase = molesBase - molesAcidAdded
    
    if (excessBase > 1e-6) {
      return 14 + Math.log10(excessBase / 0.025)
    } else if (Math.abs(excessBase) < 1e-6) {
      return 7
    } else {
      return -Math.log10(-excessBase / 0.025)
    }
  }, [addedVolume, sampleWeight])
  
  // Phenolphthalein color
  const indicatorColor = useMemo(() => {
    if (ph < 8.2) return "#fef3c7"
    if (ph > 10) return "#db2777"
    const ratio = (ph - 8.2) / (10 - 8.2)
    return ratio > 0.5 ? "#db2777" : "#fef3c7"
  }, [ph])
  
  const handleWeighSample = () => {
    // Simulate weighing ~1g of impure NaOH
    setSampleWeight(1.0523)
    setIsWeighed(true)
  }
  
  const handleStartTitration = () => {
    if (sampleWeight === 0) return
    setIsRunning(true)
    
    const interval = setInterval(() => {
      setAddedVolume(prev => {
        const newVolume = prev + 0.05
        const molesBase = (sampleWeight / 40) * (25 / 250)
        const molesAcid = 0.5 * (newVolume / 1000)
        
        if (molesAcid >= molesBase * 0.99) {
          clearInterval(interval)
          setIsRunning(false)
          setEndpoint(newVolume)
        }
        return newVolume
      })
    }, 80)
  }
  
  const handleReset = () => {
    setIsRunning(false)
    setAddedVolume(0)
    setEndpoint(null)
    setSampleWeight(0)
    setIsWeighed(false)
  }
  
  // Calculate results
  const results = useMemo(() => {
    if (!endpoint) return null
    
    const mHCl = 0.5
    const vHCl = endpoint
    const molesHCl = mHCl * vHCl / 1000
    const molesNaOH = molesHCl // 1:1 ratio
    const massNaOH = molesNaOH * 40 * (250 / 25) // Scale to original
    const percentage = (massNaOH / sampleWeight) * 100
    
    return {
      massNaOH,
      percentage,
      purity: percentage > 95 ? "High" : percentage > 85 ? "Medium" : "Low"
    }
  }, [endpoint, sampleWeight])
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={handleWeighSample}
          disabled={isWeighed}
          className="gap-2"
        >
          <Scale className="w-4 h-4" />
          {isWeighed ? "Sample Weighed" : "Weigh Sample"}
        </Button>
        <Button 
          onClick={handleStartTitration}
          disabled={!isWeighed || isRunning || endpoint !== null}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          {isRunning ? "Titrating..." : "Start Titration"}
        </Button>
        <Button 
          variant="outline"
          onClick={handleReset}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      {/* Data Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Sample Weight</span>
          <span className="text-lg font-semibold">{sampleWeight.toFixed(4)} g</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">HCl Used</span>
          <span className="text-lg font-semibold">{addedVolume.toFixed(2)} mL</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">pH</span>
          <span className="text-lg font-semibold">{ph.toFixed(2)}</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Status</span>
          <span className="text-lg font-semibold">
            {ph < 8.2 ? "Acidic" : ph > 9.8 ? "Endpoint" : "Near Eq."}
          </span>
        </Badge>
      </div>
      
      {/* Results */}
      {results && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
          <h4 className="font-semibold text-green-800 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Analysis Complete
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Mass of pure NaOH:</span>
              <span className="ml-2 font-medium">{results.massNaOH.toFixed(4)} g</span>
            </div>
            <div>
              <span className="text-muted-foreground">Percentage purity:</span>
              <span className="ml-2 font-medium text-green-700">{results.percentage.toFixed(2)}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Purity grade:</span>
              <span className={`ml-2 font-medium ${
                results.purity === "High" ? "text-green-600" : 
                results.purity === "Medium" ? "text-yellow-600" : "text-red-600"
              }`}>
                {results.purity}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Impurities:</span>
              <span className="ml-2 font-medium">{(100 - results.percentage).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Procedure:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Weigh accurately about 1g of impure NaOH sample</li>
          <li>Dissolve and make up to 250 mL in volumetric flask</li>
          <li>Pipette 25 mL aliquot into conical flask</li>
          <li>Add 2-3 drops of phenolphthalein indicator</li>
          <li>Titrate with 0.5M HCl until colorless</li>
          <li>Calculate % purity of NaOH sample</li>
        </ol>
      </div>
      
      {/* 3D Canvas */}
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [7, 4, 7], fov: 50 }} shadows>
          <Scene 
            buretteVolume={addedVolume}
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
