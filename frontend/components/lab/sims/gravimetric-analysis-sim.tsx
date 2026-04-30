"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, CheckCircle2, Beaker, Scale } from "lucide-react"
import * as THREE from "three"

interface Props {
  initialMass?: number
  precipitateMass?: number
}

// Precipitate particle component
function PrecipitateParticles({ count = 200, isForming }: { count?: number; isForming: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const positions = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 0.8,
      y: Math.random() * 0.8 - 0.5,
      z: (Math.random() - 0.5) * 0.8,
      scale: 0.01 + Math.random() * 0.02,
    }))
  }, [count])

  useFrame(({ clock }) => {
    if (!meshRef.current || !isForming) return
    const time = clock.getElapsedTime()
    
    positions.forEach((pos, i) => {
      // Particles settle at the bottom
      const settledY = Math.max(pos.y - 0.3, -0.45)
      const wobble = Math.sin(time * 2 + i * 0.5) * 0.01
      dummy.position.set(pos.x + wobble, settledY, pos.z)
      dummy.scale.setScalar(pos.scale)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#f5f5dc" roughness={0.8} />
    </instancedMesh>
  )
}

// Glass beaker with solution
function BeakerModel({ solutionLevel = 0.6, isForming }: { solutionLevel: number; isForming: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Glass beaker */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.8, 32, 1, true]} />
        <meshPhysicalMaterial
          color="white"
          transparent
          opacity={0.2}
          roughness={0.1}
          metalness={0}
          transmission={0.9}
          thickness={0.05}
        />
      </mesh>
      {/* Beaker bottom */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.02, 32]} />
        <meshPhysicalMaterial color="white" transparent opacity={0.3} roughness={0.1} />
      </mesh>
      {/* Solution */}
      <mesh position={[0, 0.1 + (solutionLevel * 0.6) / 2, 0]}>
        <cylinderGeometry args={[0.47, 0.47, solutionLevel * 0.6, 32]} />
        <meshPhysicalMaterial
          color={isForming ? "#e8e4c9" : "#f0f8ff"}
          transparent
          opacity={isForming ? 0.7 : 0.3}
          roughness={0.2}
        />
      </mesh>
      {/* Precipitate particles */}
      {isForming && <PrecipitateParticles isForming={isForming} />}
      {/* Beaker markings */}
      {[100, 200, 300].map((ml, i) => (
        <group key={ml} position={[0, 0.2 + i * 0.15, 0.48]}>
          <mesh>
            <boxGeometry args={[0.15, 0.005, 0.01]} />
            <meshBasicMaterial color="#444" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Burette stand
function BuretteStand({ isDropping }: { isDropping: boolean }) {
  const dropRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (dropRef.current && isDropping) {
      const time = clock.getElapsedTime()
      const y = -0.2 - (time % 1) * 0.3
      dropRef.current.position.y = y > -0.5 ? y : -0.5
      dropRef.current.scale.setScalar(1 - (time % 1) * 0.3)
    }
  })

  return (
    <group position={[1.2, 1.2, 0]}>
      {/* Stand base */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.6]} />
        <meshStandardMaterial color="#333" roughness={0.6} />
      </mesh>
      {/* Vertical rod */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.6, 16]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Clamp */}
      <mesh position={[0.15, 1.4, 0]}>
        <boxGeometry args={[0.3, 0.05, 0.1]} />
        <meshStandardMaterial color="#666" metalness={0.7} />
      </mesh>
      {/* Burette */}
      <mesh position={[0.3, 1.2, 0]}>
        <cylinderGeometry args={[0.04, 0.02, 0.8, 16]} />
        <meshPhysicalMaterial color="white" transparent opacity={0.6} roughness={0.1} />
      </mesh>
      {/* Burette tip */}
      <mesh position={[0.3, 0.75, 0]}>
        <coneGeometry args={[0.02, 0.08, 16]} />
        <meshPhysicalMaterial color="white" transparent opacity={0.6} />
      </mesh>
      {/* Drop */}
      <mesh ref={dropRef} position={[0.3, 0.6, 0]} visible={isDropping}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshPhysicalMaterial color="#aaccff" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

// Filter funnel setup
function FilterSetup({ hasFilterPaper, isFiltering }: { hasFilterPaper: boolean; isFiltering: boolean }) {
  return (
    <group position={[-1, 0.8, 0]}>
      {/* Retort stand */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.4]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Clamp */}
      <mesh position={[0.3, 0.9, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.4, 0.05, 0.08]} />
        <meshStandardMaterial color="#666" metalness={0.7} />
      </mesh>
      {/* Funnel */}
      <mesh position={[0.5, 0.85, 0]} rotation={[0, 0, 0.5]}>
        <coneGeometry args={[0.25, 0.4, 32, 1, true]} />
        <meshPhysicalMaterial color="white" transparent opacity={0.4} roughness={0.1} />
      </mesh>
      {/* Filter paper */}
      {hasFilterPaper && (
        <mesh position={[0.5, 0.88, 0]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[0.23, 0.05, 32, 1, true]} />
          <meshStandardMaterial color="#f5f5dc" roughness={0.9} />
        </mesh>
      )}
      {/* Precipitate on filter */}
      {isFiltering && hasFilterPaper && (
        <mesh position={[0.5, 0.9, 0]} rotation={[0, 0, 0.5]}>
          <coneGeometry args={[0.2, 0.02, 32]} />
          <meshStandardMaterial color="#f5f5dc" roughness={0.8} />
        </mesh>
      )}
      {/* Collection flask below */}
      <mesh position={[0.65, 0.3, 0]}>
        <cylinderGeometry args={[0.25, 0.2, 0.5, 32]} />
        <meshPhysicalMaterial color="white" transparent opacity={0.3} roughness={0.1} />
      </mesh>
    </group>
  )
}

// Analytical balance
function AnalyticalBalance({ isWeighing, weight }: { isWeighing: boolean; weight: number }) {
  return (
    <group position={[0, 0.2, 1.2]}>
      {/* Balance base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.15, 0.4]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Display */}
      <mesh position={[0, 0.1, -0.12]}>
        <boxGeometry args={[0.3, 0.08, 0.02]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Weight display */}
      <Text
        position={[0, 0.1, -0.11]}
        fontSize={0.04}
        color="#0f0"
        anchorX="center"
        anchorY="middle"
      >
        {isWeighing ? `${weight.toFixed(4)} g` : "0.0000 g"}
      </Text>
      {/* Weighing pan */}
      <mesh position={[0, 0.12, 0.1]}>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 32]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
      </mesh>
      {/* Crucible on pan */}
      {isWeighing && (
        <mesh position={[0, 0.25, 0.1]}>
          <cylinderGeometry args={[0.08, 0.06, 0.1, 32]} />
          <meshStandardMaterial color="#f5f5dc" roughness={0.6} />
        </mesh>
      )}
    </group>
  )
}

function Scene({ isForming, isFiltering, isWeighing, precipitateMass }: {
  isForming: boolean
  isFiltering: boolean
  isWeighing: boolean
  precipitateMass: number
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <pointLight position={[-2, 4, 2]} intensity={0.5} />
      
      {/* Lab table */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[6, 0.2, 4]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      
      {/* Main beaker with reaction */}
      <BeakerModel solutionLevel={0.6} isForming={isForming} />
      
      {/* Burette stand for adding H2SO4 */}
      <BuretteStand isDropping={isForming} />
      
      {/* Filter setup */}
      <FilterSetup hasFilterPaper={isFiltering || isWeighing} isFiltering={isFiltering} />
      
      {/* Analytical balance */}
      <AnalyticalBalance isWeighing={isWeighing} weight={precipitateMass} />
      
      {/* Labels */}
      <Text position={[0, 1.1, 0]} fontSize={0.08} color="#333" anchorX="center">
        BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl
      </Text>
      
      <OrbitControls enablePan={false} minDistance={3} maxDistance={8} target={[0, 0.5, 0]} />
    </>
  )
}

export function GravimetricAnalysisSim({ initialMass = 0.5, precipitateMass = 0.233 }: Props) {
  const [step, setStep] = useState<'reaction' | 'filtering' | 'weighing' | 'complete'>('reaction')
  const [isForming, setIsForming] = useState(false)
  const [isFiltering, setIsFiltering] = useState(false)
  const [isWeighing, setIsWeighing] = useState(false)
  const [measuredMass, setMeasuredMass] = useState(0)
  const [calculatedBa, setCalculatedBa] = useState(0)

  const startReaction = () => {
    setIsForming(true)
    setTimeout(() => {
      setIsForming(false)
      setStep('filtering')
    }, 4000)
  }

  const startFiltering = () => {
    setIsFiltering(true)
    setTimeout(() => {
      setIsFiltering(false)
      setIsWeighing(true)
      setMeasuredMass(precipitateMass)
      setStep('weighing')
    }, 3000)
  }

  const calculateResult = () => {
    // Calculate Ba content from BaSO4 mass
    // Molar mass BaSO4 = 233.39 g/mol, Ba = 137.33 g/mol
    const baContent = (measuredMass * 137.33) / 233.39
    setCalculatedBa(baContent)
    setStep('complete')
  }

  const reset = () => {
    setStep('reaction')
    setIsForming(false)
    setIsFiltering(false)
    setIsWeighing(false)
    setMeasuredMass(0)
    setCalculatedBa(0)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Class 11</Badge>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500">Gravimetric Analysis</Badge>
        </div>
        <div className="text-xs text-muted-foreground">Ba²⁺ Estimation as BaSO₄</div>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2">
        {['Precipitation', 'Filtration', 'Weighing', 'Calculation'].map((s, i) => {
          const steps = ['reaction', 'filtering', 'weighing', 'complete']
          const currentStep = steps.indexOf(step)
          return (
            <div key={s} className={`flex-1 text-center py-2 rounded-lg text-xs font-medium transition-colors ${
              currentStep >= i ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {s}
            </div>
          )
        })}
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Sample Mass</div>
          <div className="text-lg font-semibold text-amber-500">{initialMass.toFixed(2)} g</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Precipitate Mass</div>
          <div className="text-lg font-semibold text-blue-400">
            {measuredMass > 0 ? `${measuredMass.toFixed(4)} g` : "--"}
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Ba²⁺ Content</div>
          <div className="text-lg font-semibold text-green-500">
            {calculatedBa > 0 ? `${(calculatedBa / initialMass * 100).toFixed(2)}%` : "--"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [4, 3, 4], fov: 50 }} shadows>
          <Scene 
            isForming={isForming} 
            isFiltering={isFiltering} 
            isWeighing={isWeighing}
            precipitateMass={measuredMass}
          />
        </Canvas>
      </div>

      <div className="flex gap-2 flex-wrap">
        {step === 'reaction' && (
          <Button onClick={startReaction} disabled={isForming} className="gap-2">
            <Play className="w-4 h-4" />
            {isForming ? 'Precipitating...' : 'Add H₂SO₄'}
          </Button>
        )}
        {step === 'filtering' && (
          <Button onClick={startFiltering} disabled={isFiltering} className="gap-2">
            <Beaker className="w-4 h-4" />
            {isFiltering ? 'Filtering...' : 'Filter Precipitate'}
          </Button>
        )}
        {step === 'weighing' && (
          <Button onClick={calculateResult} className="gap-2">
            <Scale className="w-4 h-4" />
            Calculate Ba²⁺ %
          </Button>
        )}
        {step === 'complete' && (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Analysis Complete!</span>
          </div>
        )}
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {step === 'complete' && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <div className="text-sm font-medium text-green-500 mb-2">Results:</div>
          <div className="text-xs space-y-1 text-muted-foreground">
            <div>BaSO₄ precipitate: {measuredMass.toFixed(4)} g</div>
            <div>Ba content: {calculatedBa.toFixed(4)} g</div>
            <div>Percentage of Ba: {((calculatedBa / initialMass) * 100).toFixed(2)}%</div>
          </div>
        </div>
      )}
    </div>
  )
}
