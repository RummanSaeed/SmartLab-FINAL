"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Line, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, CheckCircle2, Settings2 } from "lucide-react"
import * as THREE from "three"

type Props = {
  angleDeg: number
  massKg: number
}

type Trial = {
  angle: number
  force: number
  sinTheta: number
}

// Inclined plane with protractor
function InclinedPlane({ angle, blockPosition }: { angle: number; blockPosition: number }) {
  const planeRef = useRef<THREE.Group>(null)
  
  const angleRad = (angle * Math.PI) / 180
  const planeLength = 4
  const planeWidth = 1.5
  
  return (
    <group ref={planeRef}>
      {/* Main inclined plane */}
      <group rotation={[0, 0, -angleRad]} position={[0, 1.5, 0]}>
        {/* Wooden plane surface */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[planeLength, 0.15, planeWidth]} />
          <meshStandardMaterial color="#8B5A2B" roughness={0.6} metalness={0.1} />
        </mesh>
        
        {/* Surface texture lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh key={i} position={[-planeLength/2 + i * 0.2, 0.08, 0]}>
            <boxGeometry args={[0.01, 0.02, planeWidth - 0.1]} />
            <meshStandardMaterial color="#6B4423" />
          </mesh>
        ))}
        
        {/* Angle measurement marks on edge */}
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={i} position={[-planeLength/2 + 0.3 + i * 0.15, 0.1, planeWidth/2 + 0.02]}>
            <boxGeometry args={[0.05, 0.02, 0.01]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        ))}
      </group>
      
      {/* Support stand */}
      <mesh position={[-1.5, 0.5, 0]} castShadow>
        <boxGeometry args={[0.2, 1, 1.2]} />
        <meshStandardMaterial color="#475569" metalness={0.4} />
      </mesh>
      
      {/* Protractor for angle measurement */}
      <group position={[-1.5, 1.5, 0.8]}>
        {/* Semi-circle protractor */}
        <mesh rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.02, 64, 1, true, 0, Math.PI]} />
          <meshStandardMaterial color="#f8fafc" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Protractor markings */}
        {Array.from({ length: 19 }).map((_, i) => {
          const deg = i * 5
          const rad = (deg * Math.PI) / 180
          return (
            <group key={deg} rotation={[0, 0, rad]}>
              <mesh position={[0, 0.35, 0.02]}>
                <boxGeometry args={[0.005, 0.03, 0.01]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              <Text
                position={[0, 0.28, 0.03]}
                fontSize={0.025}
                color="#1e293b"
                anchorX="center"
                rotation={[0, 0, -rad]}
              >
                {deg}°
              </Text>
            </group>
          )
        })}
        
        {/* Current angle indicator */}
        <mesh rotation={[0, 0, angleRad]}>
          <boxGeometry args={[0.02, 0.3, 0.01]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  )
}

// Slider block on the incline
function SliderBlock({ angle, position, mass }: { angle: number; position: number; mass: number }) {
  const blockRef = useRef<THREE.Group>(null)
  const angleRad = (angle * Math.PI) / 180
  
  // Calculate position along the inclined plane
  const planeLength = 4
  const x = -planeLength/2 + position * planeLength
  const y = 1.5 + Math.sin(angleRad) * x
  
  useFrame(() => {
    if (blockRef.current) {
      blockRef.current.rotation.z = -angleRad
    }
  })
  
  return (
    <group ref={blockRef} position={[x, y + 0.25, 0]}>
      {/* Main block */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          metalness={0.3} 
          roughness={0.4}
          emissive="#1d4ed8"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Pulley attachment */}
      <mesh position={[0.25, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} rotation={[0, 0, Math.PI/2]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>
      
      {/* Mass label */}
      <Text position={[0, 0, 0.26]} fontSize={0.08} color="white" anchorX="center" anchorY="middle">
        {mass.toFixed(2)}kg
      </Text>
    </group>
  )
}

// Force gauge with digital display
function ForceGauge({ force }: { force: number }) {
  return (
    <group position={[1.8, 2, 0]}>
      {/* Gauge housing */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.5, 0.2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      {/* Digital display screen */}
      <mesh position={[0, 0, 0.11]}>
        <planeGeometry args={[0.6, 0.3]} />
        <meshStandardMaterial color="#0f172a" emissive="#22c55e" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Force value */}
      <Text position={[0, 0, 0.12]} fontSize={0.12} color="#22c55e" anchorX="center">
        {force.toFixed(2)} N
      </Text>
      
      {/* Force label */}
      <Text position={[0, -0.2, 0.12]} fontSize={0.04} color="#94a3b8" anchorX="center">
        FORCE
      </Text>
    </group>
  )
}

// Hanging mass
function HangingMass({ force, angle }: { force: number; angle: number }) {
  const angleRad = (angle * Math.PI) / 180
  const blockX = -2 + Math.cos(angleRad) * 1.5
  const blockY = 1.5 + Math.sin(angleRad) * 1.5
  
  return (
    <group position={[blockX + 0.5, blockY - 0.25, 0]}>
      {/* String from block */}
      <Line 
        points={[[-0.25, 0, 0], [-0.25, -1.5, 0]]} 
        color="#e2e8f0" 
        lineWidth={1} 
      />
      
      {/* Pulley wheel */}
      <mesh position={[-0.25, 0.05, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#475569" metalness={0.6} />
      </mesh>
      
      {/* Vertical string */}
      <Line 
        points={[[0.1, 0, 0], [0.1, -2, 0]]} 
        color="#e2e8f0" 
        lineWidth={1} 
      />
      
      {/* Hanging weight pan */}
      <mesh position={[0.1, -2.2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.25, 0.15, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.4} />
      </mesh>
      
      {/* Weights on pan */}
      {Array.from({ length: Math.min(5, Math.ceil(force / 2)) }).map((_, i) => (
        <mesh key={i} position={[0.1, -2.1 - i * 0.08, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function Scene({ angle, blockPosition, force, mass }: { angle: number; blockPosition: number; force: number; mass: number }) {
  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 3]} intensity={1} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#fbbf24" />
      
      {/* Lab bench */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.9} />
      </mesh>
      
      {/* Equipment */}
      <InclinedPlane angle={angle} blockPosition={blockPosition} />
      <SliderBlock angle={angle} position={blockPosition} mass={mass} />
      <ForceGauge force={force} />
      <HangingMass force={force} angle={angle} />
      
      {/* Angle display */}
      <Text position={[-2, 2.8, 0]} fontSize={0.1} color="#f59e0b" anchorX="left">
        θ = {angle.toFixed(1)}°
      </Text>
      <Text position={[-2, 2.65, 0]} fontSize={0.08} color="#60a5fa" anchorX="left">
        sin(θ) = {Math.sin((angle * Math.PI) / 180).toFixed(3)}
      </Text>
      
      <OrbitControls 
        enablePan={false} 
        minDistance={4} 
        maxDistance={10} 
        target={[0, 1, 0]}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  )
}

export function InclineForceSim({ angleDeg: initialAngle = 30, massKg: initialMass = 0.5 }: Props) {
  const [trials, setTrials] = useState<Trial[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [blockPosition, setBlockPosition] = useState(0.3)
  // Adjustable parameters
  const [angleDeg, setAngleDeg] = useState(initialAngle)
  const [massKg, setMassKg] = useState(initialMass)
  const [frictionCoeff, setFrictionCoeff] = useState(0.15)
  
  const sinTheta = Math.sin((angleDeg * Math.PI) / 180)
  const cosTheta = Math.cos((angleDeg * Math.PI) / 180)
  
  // Calculate force: F = mg(sinθ + μcosθ)
  const force = massKg * 9.8 * (sinTheta + frictionCoeff * cosTheta)
  
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setBlockPosition(prev => {
          if (prev >= 0.8) return 0.3
          return prev + 0.01
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isRunning])
  
  const recordTrial = () => {
    setTrials(prev => [...prev, {
      angle: angleDeg,
      force: Number(force.toFixed(2)),
      sinTheta: Number(sinTheta.toFixed(3))
    }].slice(-8))
  }
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Angle: {angleDeg.toFixed(1)}°</Badge>
        <Badge variant="outline">Mass: {massKg.toFixed(2)} kg</Badge>
        <Badge variant="outline">sin(θ): {sinTheta.toFixed(3)}</Badge>
        <Badge>Force: {force.toFixed(2)} N</Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Measure the force required to hold the block stationary at different angles. 
        Plot Force vs sin(θ) to verify the linear relationship.
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Angle (θ)</div>
          <div className="text-lg font-semibold text-amber-500">{angleDeg.toFixed(1)}°</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">sin(θ)</div>
          <div className="text-lg font-semibold text-blue-400">{sinTheta.toFixed(3)}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Force</div>
          <div className="text-lg font-semibold text-green-500">{force.toFixed(2)} N</div>
        </div>
      </div>
      
      {/* Parameter Controls */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Settings2 className="w-4 h-4" />
          Adjust Parameters
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Incline Angle</span>
              <span className="font-medium">{angleDeg.toFixed(0)}°</span>
            </div>
            <input
              type="range"
              min="5"
              max="45"
              step="1"
              value={angleDeg}
              onChange={(e) => setAngleDeg(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Block Mass</span>
              <span className="font-medium">{(massKg * 1000).toFixed(0)} g</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={massKg * 1000}
              onChange={(e) => setMassKg(Number(e.target.value) / 1000)}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Friction Coefficient (μ)</span>
              <span className="font-medium">{frictionCoeff.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={frictionCoeff}
              onChange={(e) => setFrictionCoeff(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant="outline" 
          onClick={() => setIsRunning(!isRunning)}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          {isRunning ? "Stop" : "Start"}
        </Button>
        <Button onClick={recordTrial} className="gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Record
        </Button>
        <Button 
          variant="outline" 
          onClick={() => {setTrials([]); setBlockPosition(0.3); setIsRunning(false)}}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      {/* Trials table */}
      {trials.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs font-medium mb-2">Trials:</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-muted-foreground">Angle (°)</div>
            <div className="text-muted-foreground">sin(θ)</div>
            <div className="text-muted-foreground">Force (N)</div>
            {trials.map((t, i) => (
              <div key={i} className="contents">
                <div>{t.angle.toFixed(1)}</div>
                <div>{t.sinTheta.toFixed(3)}</div>
                <div>{t.force.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
        <Canvas camera={{ position: [5, 4, 6], fov: 50 }} shadows>
          <Scene 
            angle={angleDeg} 
            blockPosition={blockPosition}
            force={force}
            mass={massKg}
          />
        </Canvas>
      </div>
    </div>
  )
}
