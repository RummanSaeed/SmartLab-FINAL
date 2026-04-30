"use client"

import { useMemo, useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Timer, Wind } from "lucide-react"
import * as THREE from "three"

interface Props {
  gas1?: string
  gas2?: string
}

// Gas particle component
function GasParticles({ 
  count = 200, 
  color, 
  startSide, 
  diffusionRate, 
  isRunning 
}: { 
  count?: number
  color: string
  startSide: 'left' | 'right'
  diffusionRate: number
  isRunning: boolean
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  
  const positions = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: startSide === 'left' ? -0.4 + Math.random() * 0.3 : 0.1 + Math.random() * 0.3,
      y: (Math.random() - 0.5) * 0.8,
      z: (Math.random() - 0.5) * 0.8,
      vx: (Math.random() - 0.5) * 0.01,
      vy: (Math.random() - 0.5) * 0.01,
      vz: (Math.random() - 0.5) * 0.01,
    }))
  }, [count, startSide])

  useFrame(() => {
    if (!meshRef.current || !isRunning) return
    
    positions.forEach((pos, i) => {
      // Brownian motion + diffusion
      pos.x += pos.vx * diffusionRate + (Math.random() - 0.5) * 0.005
      pos.y += pos.vy * diffusionRate + (Math.random() - 0.5) * 0.005
      pos.z += pos.vz * diffusionRate + (Math.random() - 0.5) * 0.005
      
      // Boundary constraints (tube walls)
      if (pos.x < -0.48 || pos.x > 0.48) pos.vx *= -1
      if (pos.y < -0.4 || pos.y > 0.4) pos.vy *= -1
      if (pos.z < -0.4 || pos.z > 0.4) pos.vz *= -1
      
      // Keep within bounds
      pos.x = Math.max(-0.48, Math.min(0.48, pos.x))
      pos.y = Math.max(-0.4, Math.min(0.4, pos.y))
      pos.z = Math.max(-0.4, Math.min(0.4, pos.z))
      
      dummy.position.set(pos.x, pos.y, pos.z)
      dummy.scale.setScalar(0.015)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color={color} transparent opacity={0.7} />
    </instancedMesh>
  )
}

// Glass diffusion tube
function DiffusionTube({ isOpen }: { isOpen: boolean }) {
  return (
    <group position={[0, 1.5, 0]}>
      {/* Main tube */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 2, 32, 1, true]} rotation={[0, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="white"
          transparent
          opacity={0.2}
          roughness={0.1}
          transmission={0.9}
        />
      </mesh>
      {/* Tube ends */}
      <mesh position={[-1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 32, 1, true]} />
        <meshPhysicalMaterial color="white" transparent opacity={0.3} />
      </mesh>
      <mesh position={[1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 32, 1, true]} />
        <meshPhysicalMaterial color="white" transparent opacity={0.3} />
      </mesh>
      {/* Removable divider */}
      <mesh position={[0, 0, 0]} visible={!isOpen}>
        <boxGeometry args={[0.02, 1, 1]} />
        <meshStandardMaterial color="#888" metalness={0.5} />
      </mesh>
    </group>
  )
}

// Cork stoppers
function Corks({ isRemoved }: { isRemoved: boolean }) {
  return (
    <>
      {/* Left cork */}
      <mesh position={[-1.15, 1.5, 0]} visible={!isRemoved}>
        <cylinderGeometry args={[0.12, 0.1, 0.3, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
      {/* Right cork */}
      <mesh position={[1.15, 1.5, 0]} visible={!isRemoved}>
        <cylinderGeometry args={[0.12, 0.1, 0.3, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
    </>
  )
}

// Gas source bottles
function GasBottles({ gas1, gas2 }: { gas1: string; gas2: string }) {
  return (
    <>
      {/* Left gas bottle */}
      <group position={[-1.8, 0.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
          <meshPhysicalMaterial color="#4169E1" transparent opacity={0.4} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <Text position={[0, 0, 0.22]} fontSize={0.08} color="white" anchorX="center">
          {gas1}
        </Text>
      </group>
      
      {/* Right gas bottle */}
      <group position={[1.8, 0.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.6, 16]} />
          <meshPhysicalMaterial color="#FF6347" transparent opacity={0.4} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <Text position={[0, 0, 0.22]} fontSize={0.08} color="white" anchorX="center">
          {gas2}
        </Text>
      </group>
    </>
  )
}

// Cotton wools soaked in solutions
function CottonWools({ isOpen }: { isOpen: boolean }) {
  return (
    <>
      {/* Left cotton - blue (HCl) */}
      <mesh position={[-0.35, 1.5, 0]} visible={isOpen}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#6495ED" roughness={0.8} />
      </mesh>
      {/* Right cotton - red (NH3) */}
      <mesh position={[0.35, 1.5, 0]} visible={isOpen}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#FF6B6B" roughness={0.8} />
      </mesh>
    </>
  )
}

// White ring of NH4Cl
function WhiteRing({ intensity }: { intensity: number }) {
  return (
    <group position={[0, 1.5, 0]} visible={intensity > 0}>
      <mesh>
        <torusGeometry args={[0.25, 0.05 + intensity * 0.1, 16, 32]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="white" opacity={intensity} transparent roughness={0.6} />
      </mesh>
    </group>
  )
}

function Scene({ isRunning, isOpen, ringIntensity }: {
  isRunning: boolean
  isOpen: boolean
  ringIntensity: number
}) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <pointLight position={[-2, 3, 2]} intensity={0.4} />
      
      {/* Lab table */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[6, 0.2, 3]} />
        <meshStandardMaterial color="#deb887" roughness={0.8} />
      </mesh>
      
      {/* Main apparatus */}
      <DiffusionTube isOpen={isOpen} />
      <Corks isRemoved={isOpen} />
      <CottonWools isOpen={isOpen} />
      <WhiteRing intensity={ringIntensity} />
      
      {/* Gas particles */}
      {isOpen && (
        <>
          <GasParticles 
            count={150} 
            color="#4169E1" 
            startSide="left" 
            diffusionRate={0.8}
            isRunning={isRunning}
          />
          <GasParticles 
            count={150} 
            color="#FF6347" 
            startSide="right" 
            diffusionRate={1.2}
            isRunning={isRunning}
          />
        </>
      )}
      
      {/* Gas bottles */}
      <GasBottles gas1="HCl" gas2="NH₃" />
      
      {/* Labels */}
      <Text position={[0, 2.8, 0]} fontSize={0.12} color="#333" anchorX="center">
        NH₃ (g) + HCl (g) → NH₄Cl (s) - White Ring
      </Text>
      
      <OrbitControls enablePan={false} minDistance={3} maxDistance={8} target={[0, 1.5, 0]} />
    </>
  )
}

export function GasDiffusionSim({ gas1 = "HCl", gas2 = "NH3" }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [ringIntensity, setRingIntensity] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [diffusionDistance, setDiffusionDistance] = useState(0)

  const startExperiment = () => {
    setIsOpen(true)
    setTimeout(() => {
      setIsRunning(true)
      let time = 0
      const interval = setInterval(() => {
        time += 0.1
        setElapsedTime(time)
        // Ring forms closer to HCl side because NH3 diffuses faster
        setRingIntensity(Math.min((time / 20) * 0.8, 0.8))
        setDiffusionDistance(Math.min(time * 0.5, 15))
        if (time >= 30) {
          clearInterval(interval)
          setIsRunning(false)
        }
      }, 100)
    }, 1000)
  }

  const reset = () => {
    setIsOpen(false)
    setIsRunning(false)
    setRingIntensity(0)
    setElapsedTime(0)
    setDiffusionDistance(0)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Class 11</Badge>
          <Badge variant="outline" className="bg-green-500/10 text-green-500">Gas Laws</Badge>
        </div>
        <div className="text-xs text-muted-foreground">Graham's Law of Diffusion</div>
      </div>

      {/* Theory info */}
      <div className="text-xs bg-muted/50 p-2 rounded">
        <strong>Graham's Law:</strong> Rate of diffusion ∝ 1/√MolarMass | 
        NH₃ (17 g/mol) diffuses ~1.5× faster than HCl (36.5 g/mol)
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Timer className="w-3 h-3" /> Time
          </div>
          <div className="text-lg font-semibold text-amber-500">{elapsedTime.toFixed(1)} s</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Wind className="w-3 h-3" /> Distance
          </div>
          <div className="text-lg font-semibold text-blue-400">{diffusionDistance.toFixed(1)} cm</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Ring Position</div>
          <div className="text-lg font-semibold text-green-500">
            {ringIntensity > 0 ? "Closer to HCl" : "--"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }} shadows>
          <Scene isRunning={isRunning} isOpen={isOpen} ringIntensity={ringIntensity} />
        </Canvas>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={startExperiment} 
          disabled={isRunning || isOpen} 
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          {isOpen ? (isRunning ? 'Diffusing...' : 'Complete') : 'Remove Corks'}
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {ringIntensity > 0.5 && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <div className="text-sm font-medium text-green-500 mb-2">Observation:</div>
          <div className="text-xs text-muted-foreground">
            White ring of NH₄Cl formed closer to the HCl side because NH₃ 
            (lighter, M=17) diffuses faster than HCl (heavier, M=36.5)
          </div>
        </div>
      )}
    </div>
  )
}
