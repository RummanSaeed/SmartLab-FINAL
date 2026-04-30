"use client"

import { useState, useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, RotateCcw, Beaker, Plus, Minus } from "lucide-react"
import * as THREE from "three"

// Types
interface TitrationData {
  volume: number
  ph: number
}

// Burette 3D Component
function Burette({ 
  volume, 
  isRunning,
  onVolumeChange 
}: { 
  volume: number
  isRunning: boolean
  onVolumeChange: (v: number) => void
}) {
  const meniscusRef = useRef<THREE.Mesh>(null)
  const dropRef = useRef<THREE.Mesh>(null)
  const [dropVisible, setDropVisible] = useState(false)
  
  useFrame((state) => {
    if (meniscusRef.current) {
      // Animate meniscus slight oscillation
      const y = 2.5 - (volume / 50) * 4 + Math.sin(state.clock.elapsedTime * 2) * 0.002
      meniscusRef.current.position.y = y
    }
    
    if (isRunning && dropRef.current) {
      // Animate drop falling
      const time = state.clock.elapsedTime % 1
      if (time < 0.3) {
        dropRef.current.position.y = -1.5 - time * 2
        dropRef.current.scale.setScalar(1 - time * 2)
        setDropVisible(true)
      } else {
        setDropVisible(false)
      }
    }
  })
  
  // Calculate liquid height based on volume (0-50 mL)
  const liquidHeight = (volume / 50) * 4
  const liquidY = 2.5 - liquidHeight / 2
  
  return (
    <group position={[0, 2, 0]}>
      {/* Burette stand clamp */}
      <mesh position={[-0.5, 0, 0]}>
        <boxGeometry args={[0.1, 6, 0.3]} />
        <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-0.25, 2, 0]}>
        <boxGeometry args={[0.5, 0.1, 0.2]} />
        <meshStandardMaterial color="#718096" metalness={0.9} />
      </mesh>
      
      {/* Burette tube */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 5, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.3}
          transparent
          roughness={0.1}
          thickness={0.1}
        />
      </mesh>
      
      {/* Glass thickness (outer ring) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 5, 32, 1, true]} />
        <meshPhysicalMaterial 
          color="#e2e8f0"
          transmission={0.95}
          transparent
          roughness={0.05}
          thickness={0.02}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Graduation marks */}
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh key={i} position={[0.085, 2.3 - i * 0.08, 0]}>
          <boxGeometry args={[0.02, 0.002, i % 5 === 0 ? 0.04 : 0.02]} />
          <meshStandardMaterial color="#1a202c" />
        </mesh>
      ))}
      
      {/* Numbers on burette */}
      {Array.from({ length: 11 }).map((_, i) => (
        <Text
          key={i}
          position={[0.15, 2.3 - i * 0.4, 0]}
          fontSize={0.08}
          color="#1a202c"
          anchorX="left"
        >
          {i * 5}
        </Text>
      ))}
      
      {/* Liquid inside */}
      {volume > 0 && (
        <>
          <mesh position={[0, liquidY, 0]}>
            <cylinderGeometry args={[0.075, 0.075, liquidHeight, 32]} />
            <meshStandardMaterial 
              color="#8b4513"
              transparent
              opacity={0.7}
            />
          </mesh>
          
          {/* Meniscus */}
          <mesh ref={meniscusRef} position={[0, 2.5 - liquidHeight, 0]}>
            <sphereGeometry args={[0.075, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#8b4513" transparent opacity={0.7} />
          </mesh>
        </>
      )}
      
      {/* Stopcock */}
      <mesh position={[0, -2.7, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.15, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0.15, -2.7, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
        <meshStandardMaterial color="#4a5568" metalness={0.8} />
      </mesh>
      
      {/* Dropping tip */}
      <mesh position={[0, -2.9, 0]}>
        <coneGeometry args={[0.03, 0.3, 16]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          transparent
          roughness={0.1}
        />
      </mesh>
      
      {/* Falling drop */}
      {isRunning && dropVisible && (
        <mesh ref={dropRef} position={[0, -1.5, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#8b4513" transparent opacity={0.8} />
        </mesh>
      )}
      
      {/* Label */}
      <Text position={[0.2, 3, 0]} fontSize={0.1} color="#2d3748" anchorX="left">
        H₂SO₄ (approx 0.1M)
      </Text>
    </group>
  )
}

// Conical Flask Component
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
  const liquidRef = useRef<THREE.Mesh>(null)
  
  // Calculate liquid level based on volume (0-100 mL)
  const maxVolume = 100
  const liquidHeight = Math.min((volume / maxVolume) * 1.2, 1.2)
  
  useFrame((state) => {
    if (flaskRef.current && volume > 0) {
      // Gentle swirling motion during titration
      flaskRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.05
    }
  })
  
  return (
    <group ref={flaskRef} position={[0, -1, 0]}>
      {/* Flask base */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.3, 0.8, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.2}
          transparent
          roughness={0.1}
          thickness={0.05}
        />
      </mesh>
      
      {/* Flask neck */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.2, 0.5, 0.5, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.2}
          transparent
          roughness={0.1}
          thickness={0.05}
        />
      </mesh>
      
      {/* Flask rim */}
      <mesh position={[0, 0.9, 0]}>
        <torusGeometry args={[0.22, 0.03, 8, 24]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          roughness={0.1}
        />
      </mesh>
      
      {/* Liquid */}
      {volume > 0 && (
        <>
          <mesh ref={liquidRef} position={[0, -0.4 + liquidHeight / 2, 0]}>
            <cylinderGeometry args={[0.45, 0.28, liquidHeight, 32]} />
            <meshStandardMaterial 
              color={indicatorColor}
              transparent
              opacity={0.8}
            />
          </mesh>
          
          {/* Liquid meniscus */}
          <mesh position={[0, -0.4 + liquidHeight, 0]}>
            <sphereGeometry args={[0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={indicatorColor} transparent opacity={0.8} />
          </mesh>
          
          {/* Bubbles at endpoint */}
          {ph > 6 && ph < 8 && (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <mesh 
                  key={i}
                  position={[
                    (Math.random() - 0.5) * 0.3,
                    -0.4 + liquidHeight + Math.random() * 0.2,
                    (Math.random() - 0.5) * 0.3
                  ]}
                >
                  <sphereGeometry args={[0.01 + Math.random() * 0.01, 8, 8]} />
                  <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
                </mesh>
              ))}
            </>
          )}
        </>
      )}
      
      {/* pH label */}
      <Text position={[0.7, 0.5, 0]} fontSize={0.08} color="#2d3748" anchorX="left">
        pH: {ph.toFixed(2)}
      </Text>
      <Text position={[0.7, 0.3, 0]} fontSize={0.08} color="#2d3748" anchorX="left">
        Vol: {volume.toFixed(1)} mL
      </Text>
    </group>
  )
}

// Magnetic Stirrer Component
function MagneticStirrer({ isRunning }: { isRunning: boolean }) {
  const barRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (barRef.current && isRunning) {
      barRef.current.rotation.y = state.clock.elapsedTime * 20
      barRef.current.position.x = Math.sin(state.clock.elapsedTime * 15) * 0.1
    }
  })
  
  return (
    <group position={[0, -2.2, 0]}>
      {/* Stirrer base */}
      <mesh>
        <boxGeometry args={[1.5, 0.3, 1.5]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      
      {/* Top plate */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.2, 0.05, 1.2]} />
        <meshStandardMaterial color="#4a5568" metalness={0.5} roughness={0.3} />
      </mesh>
      
      {/* Control panel */}
      <mesh position={[0.6, 0.25, 0]}>
        <boxGeometry args={[0.2, 0.15, 0.8]} />
        <meshStandardMaterial color="#1a202c" />
      </mesh>
      
      {/* Speed knob */}
      <mesh position={[0.7, 0.35, 0.2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
        <meshStandardMaterial color="#e53e3e" />
      </mesh>
      
      {/* Display */}
      <mesh position={[0.7, 0.35, -0.2]}>
        <planeGeometry args={[0.12, 0.08]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Stir bar (visible through flask) */}
      <mesh ref={barRef} position={[0, 0.25, 0]}>
        <capsuleGeometry args={[0.03, 0.2, 4, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Label */}
      <Text position={[0, -0.4, 0]} fontSize={0.08} color="#718096" anchorX="center">
        Magnetic Stirrer
      </Text>
    </group>
  )
}

// Volumetric Flask for dilution
function VolumetricFlask({ 
  volume,
  concentration 
}: { 
  volume: number
  concentration: number
}) {
  const liquidHeight = Math.min((volume / 250) * 1.5, 1.5)
  
  return (
    <group position={[3, 0, 0]}>
      {/* Flask bulb */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.2}
          transparent
          roughness={0.1}
          thickness={0.05}
        />
      </mesh>
      
      {/* Flask neck */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1.5, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          transmission={0.9}
          opacity={0.2}
          transparent
          roughness={0.1}
          thickness={0.05}
        />
      </mesh>
      
      {/* Calibration mark */}
      <mesh position={[0, 1.8, 0]}>
        <torusGeometry args={[0.26, 0.005, 8, 32]} />
        <meshStandardMaterial color="#e53e3e" />
      </mesh>
      
      {/* 250mL label */}
      <Text position={[0.3, 1.85, 0]} fontSize={0.08} color="#e53e3e" anchorX="left">
        250 mL
      </Text>
      
      {/* Liquid */}
      {volume > 0 && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry 
            args={[0.78, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} 
          />
          <meshStandardMaterial 
            color="#fef3c7"
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
      
      {/* Label */}
      <Text position={[0, -1.2, 0]} fontSize={0.08} color="#2d3748" anchorX="center">
        Diluted H₂SO₄
      </Text>
      <Text position={[0, -1.4, 0]} fontSize={0.07} color="#4a5568" anchorX="center">
        {concentration.toFixed(4)} M
      </Text>
    </group>
  )
}

// Main Scene
function Scene({ 
  buretteVolume,
  flaskVolume,
  ph,
  indicatorColor,
  isRunning
}: {
  buretteVolume: number
  flaskVolume: number
  ph: number
  indicatorColor: string
  isRunning: boolean
}) {
  return (
    <>
      <color attach="background" args={["#f7fafc"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      
      {/* Lab bench */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      {/* Burette */}
      <Burette 
        volume={buretteVolume}
        isRunning={isRunning}
        onVolumeChange={() => {}}
      />
      
      {/* Conical Flask */}
      <ConicalFlask 
        volume={flaskVolume}
        ph={ph}
        indicatorColor={indicatorColor}
      />
      
      {/* Magnetic Stirrer */}
      <MagneticStirrer isRunning={isRunning} />
      
      {/* Volumetric Flask for dilution */}
      <VolumetricFlask volume={250} concentration={0.02} />
      
      {/* Instructions */}
      <Text position={[0, 4, 0]} fontSize={0.15} color="#2d3748" anchorX="center">
        Acid Standardization & Dilution
      </Text>
      
      <OrbitControls 
        enablePan={false}
        minDistance={8}
        maxDistance={15}
        target={[0, 0, 0]}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  )
}

// Main Component
export function AcidStandardizationSim() {
  const [buretteVolume, setBuretteVolume] = useState(50)
  const [flaskVolume, setFlaskVolume] = useState(10)
  const [addedVolume, setAddedVolume] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [titrationData, setTitrationData] = useState<TitrationData[]>([])
  const [endpoint, setEndpoint] = useState<number | null>(null)
  
  // Calculate pH based on added volume
  const ph = useMemo(() => {
    const initialMolesAcid = 0.1 * 0.01 // 0.1M H2SO4, 10mL
    const molesBaseAdded = 0.1 * (addedVolume / 1000) // 0.1M NaOH
    const molesAcidRemaining = initialMolesAcid - molesBaseAdded / 2
    
    if (molesAcidRemaining > 0) {
      return Math.max(1, -Math.log10(2 * molesAcidRemaining / (0.01 + addedVolume / 1000)))
    } else if (Math.abs(molesAcidRemaining) < 1e-7) {
      return 7
    } else {
      return Math.min(13, 14 + Math.log10(-molesAcidRemaining / (0.01 + addedVolume / 1000)))
    }
  }, [addedVolume])
  
  // Indicator color based on pH (phenolphthalein)
  const indicatorColor = useMemo(() => {
    if (ph < 8.2) return "#fef3c7" // Colorless (acidic)
    if (ph > 10) return "#db2777" // Pink (basic)
    // Transition zone
    const ratio = (ph - 8.2) / (10 - 8.2)
    return ratio > 0.5 ? "#db2777" : "#fef3c7"
  }, [ph])
  
  const handleStartTitration = () => {
    setIsRunning(true)
    
    // Simulate titration
    const interval = setInterval(() => {
      setAddedVolume(prev => {
        const newVolume = prev + 0.1
        if (newVolume >= 20) {
          clearInterval(interval)
          setIsRunning(false)
          setEndpoint(newVolume)
        }
        
        // Record data point every 1 mL
        if (Math.abs(newVolume - Math.round(newVolume)) < 0.05) {
          setTitrationData(data => [...data, { volume: newVolume, ph }])
        }
        
        return newVolume
      })
    }, 100)
  }
  
  const handleReset = () => {
    setIsRunning(false)
    setAddedVolume(0)
    setTitrationData([])
    setEndpoint(null)
  }
  
  // Calculate standardized concentration
  const standardizedConc = useMemo(() => {
    if (!endpoint) return null
    // M1V1 = M2V2 (for H2SO4, n-factor = 2)
    const mNaOH = 0.1
    const vNaOH = endpoint
    const vH2SO4 = 10
    const mH2SO4 = (mNaOH * vNaOH) / (2 * vH2SO4)
    return mH2SO4
  }, [endpoint])
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      {/* Controls */}
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={handleStartTitration}
          disabled={isRunning || endpoint !== null}
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
          <span className="text-xs text-muted-foreground">Burette Volume</span>
          <span className="text-lg font-semibold">{(50 - addedVolume).toFixed(1)} mL</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Added Volume</span>
          <span className="text-lg font-semibold">{addedVolume.toFixed(1)} mL</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">pH</span>
          <span className="text-lg font-semibold">{ph.toFixed(2)}</span>
        </Badge>
        <Badge variant="outline" className="flex flex-col items-center p-2">
          <span className="text-xs text-muted-foreground">Status</span>
          <span className="text-lg font-semibold">
            {ph < 8.2 ? "Acidic" : ph > 9.8 ? "Basic" : "Endpoint"}
          </span>
        </Badge>
      </div>
      
      {/* Results */}
      {standardizedConc && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2">
          <h4 className="font-semibold text-green-800">Titration Complete!</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Endpoint Volume:</span>
              <span className="ml-2 font-medium">{endpoint?.toFixed(2)} mL</span>
            </div>
            <div>
              <span className="text-muted-foreground">Standardized H₂SO₄:</span>
              <span className="ml-2 font-medium">{standardizedConc.toFixed(4)} M</span>
            </div>
            <div>
              <span className="text-muted-foreground">For 0.02M dilution:</span>
              <span className="ml-2 font-medium">
                Take {(0.02 * 250 / standardizedConc).toFixed(1)} mL and dilute to 250 mL
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">Procedure:</h4>
        <ol className="list-decimal list-inside space-y-1">
          <li>Pipette 10 mL of approx 0.1M H₂SO₄ into conical flask</li>
          <li>Add 2-3 drops of phenolphthalein indicator</li>
          <li>Titrate with standardized 0.1M NaOH from burette</li>
          <li>Note endpoint when persistent pink color appears</li>
          <li>Calculate exact concentration of H₂SO₄</li>
          <li>Dilute appropriately to prepare 0.02M solution</li>
        </ol>
      </div>
      
      {/* Titration Curve */}
      {titrationData.length > 0 && (
        <div className="rounded-lg border p-3">
          <h4 className="text-sm font-medium mb-2">Titration Data</h4>
          <div className="h-32 relative">
            <svg className="w-full h-full" viewBox="0 0 200 100">
              {/* Axes */}
              <line x1="20" y1="90" x2="180" y2="90" stroke="#cbd5e0" strokeWidth="1" />
              <line x1="20" y1="10" x2="20" y2="90" stroke="#cbd5e0" strokeWidth="1" />
              
              {/* Data points */}
              {titrationData.map((point, i) => (
                <circle
                  key={i}
                  cx={20 + (point.volume / 25) * 160}
                  cy={90 - (point.ph / 14) * 80}
                  r="2"
                  fill="#3182ce"
                />
              ))}
            </svg>
          </div>
        </div>
      )}
      
      {/* 3D Canvas */}
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [6, 4, 6], fov: 50 }} shadows>
          <Scene 
            buretteVolume={50 - addedVolume}
            flaskVolume={10 + addedVolume * 0.05}
            ph={ph}
            indicatorColor={indicatorColor}
            isRunning={isRunning}
          />
        </Canvas>
      </div>
    </div>
  )
}
