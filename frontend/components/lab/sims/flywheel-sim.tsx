"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, CheckCircle2, Timer, Settings2 } from "lucide-react"
import * as THREE from "three"

type Props = {
  flywheelMass: number // kg
  flywheelRadius: number // m
  hangingMass: number // kg
  dropHeight: number // m
}

type Trial = {
  dropHeight: number
  rotations: number
  time: number
  inertia: number
}

// Flywheel with spokes
function Flywheel({ rotation, isRunning }: { rotation: number; isRunning: boolean }) {
  const flywheelRef = useRef<THREE.Group>(null)
  const spokeRefs = useRef<THREE.Mesh[]>([])
  
  const flywheelRadius = 1.2
  const flywheelThickness = 0.08
  const rimWidth = 0.15
  
  useFrame(() => {
    if (flywheelRef.current) {
      flywheelRef.current.rotation.z = rotation
    }
  })
  
  return (
    <group ref={flywheelRef} position={[0, 2, 0]}>
      {/* Outer rim */}
      <mesh castShadow>
        <cylinderGeometry args={[flywheelRadius, flywheelRadius, flywheelThickness, 64]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial 
          color="#475569" 
          metalness={0.8} 
          roughness={0.2}
          emissive="#1e293b"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Inner rim (lighter) */}
      <mesh>
        <cylinderGeometry args={[flywheelRadius - rimWidth, flywheelRadius - rimWidth, flywheelThickness + 0.02, 64]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Hub */}
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, flywheelThickness + 0.05, 32]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} />
      </mesh>
      
      {/* Spokes */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i * Math.PI) / 3
        return (
          <mesh 
            key={i} 
            rotation={[0, 0, angle]}
            position={[Math.cos(angle) * (flywheelRadius/2), Math.sin(angle) * (flywheelRadius/2), 0]}
          >
            <boxGeometry args={[flywheelRadius - 0.4, 0.06, flywheelThickness]} />
            <meshStandardMaterial color="#334155" metalness={0.6} />
          </mesh>
        )
      })}
      
      {/* Rotation indicator mark */}
      <mesh position={[flywheelRadius - 0.05, 0, 0.06]}>
        <boxGeometry args={[0.02, 0.1, 0.02]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
      </mesh>
      
      {/* Axle */}
      <mesh position={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} />
      </mesh>
    </group>
  )
}

// Support frame
function SupportFrame() {
  return (
    <group position={[0, 0, 0]}>
      {/* Base */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[4, 0.15, 1.5]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      
      {/* Vertical supports */}
      <mesh position={[-1.5, 1, 0]} castShadow>
        <boxGeometry args={[0.15, 2, 0.8]} />
        <meshStandardMaterial color="#475569" metalness={0.4} />
      </mesh>
      <mesh position={[1.5, 1, 0]} castShadow>
        <boxGeometry args={[0.15, 2, 0.8]} />
        <meshStandardMaterial color="#475569" metalness={0.4} />
      </mesh>
      
      {/* Top crossbar */}
      <mesh position={[0, 2.1, 0]} castShadow>
        <boxGeometry args={[3.2, 0.12, 0.6]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} />
      </mesh>
      
      {/* Bearing mounts */}
      <mesh position={[-0.5, 2, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.25, 16]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.5, 2, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.25, 16]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  )
}

// String and hanging mass
function HangingMassSystem({ rotation, mass, stringLength }: { rotation: number; mass: number; stringLength: number }) {
  const massRef = useRef<THREE.Mesh>(null)
  
  // Calculate string unwrap based on rotation
  const flywheelRadius = 0.15
  const unwrappedLength = rotation * flywheelRadius
  const currentLength = Math.max(0, stringLength - unwrappedLength)
  const massY = Math.max(0.5, 2 - currentLength)
  
  return (
    <group>
      {/* String from axle */}
      <mesh position={[0, 2 - currentLength/2, 0.25]}>
        <cylinderGeometry args={[0.01, 0.01, currentLength, 8]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      
      {/* Hanging mass pan */}
      <mesh ref={massRef} position={[0, massY, 0.25]} castShadow>
        <cylinderGeometry args={[0.25, 0.2, 0.15, 16]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.3} />
      </mesh>
      
      {/* Mass labels */}
      <Text position={[0.35, massY, 0.25]} fontSize={0.08} color="#f59e0b" anchorX="left">
        {mass.toFixed(2)} kg
      </Text>
      
      {/* Height indicator */}
      <mesh position={[0.6, massY, 0]}>
        <boxGeometry args={[0.01, 0.01, 0.5]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      <Text position={[0.75, massY, 0]} fontSize={0.06} color="#22c55e" anchorX="left">
        h = {currentLength.toFixed(2)}m
      </Text>
    </group>
  )
}

// Rotation counter display
function RotationCounter({ rotations }: { rotations: number }) {
  return (
    <group position={[-1.8, 3.2, 0]}>
      {/* Display panel */}
      <mesh>
        <boxGeometry args={[1, 0.5, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[0.8, 0.3]} />
        <meshStandardMaterial color="#0f172a" emissive="#22c55e" emissiveIntensity={0.1} />
      </mesh>
      
      <Text position={[0, 0.05, 0.07]} fontSize={0.1} color="#22c55e" anchorX="center">
        {rotations.toFixed(1)}
      </Text>
      <Text position={[0, -0.12, 0.07]} fontSize={0.04} color="#94a3b8" anchorX="center">
        ROTATIONS
      </Text>
    </group>
  )
}

// Timer display
function TimerDisplay({ time }: { time: number }) {
  return (
    <group position={[1.8, 3.2, 0]}>
      <mesh>
        <boxGeometry args={[1, 0.5, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[0.8, 0.3]} />
        <meshStandardMaterial color="#0f172a" emissive="#f59e0b" emissiveIntensity={0.1} />
      </mesh>
      
      <Text position={[0, 0.05, 0.07]} fontSize={0.1} color="#f59e0b" anchorX="center">
        {time.toFixed(2)}s
      </Text>
      <Text position={[0, -0.12, 0.07]} fontSize={0.04} color="#94a3b8" anchorX="center">
        TIME
      </Text>
    </group>
  )
}

function Scene({ 
  rotation, 
  mass, 
  stringLength,
  isRunning 
}: { 
  rotation: number; 
  mass: number; 
  stringLength: number;
  isRunning: boolean 
}) {
  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 3]} intensity={1} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[0, 3, 2]} intensity={0.5} color="#fbbf24" />
      
      {/* Lab bench */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.9} />
      </mesh>
      
      <Flywheel rotation={rotation} isRunning={isRunning} />
      <SupportFrame />
      <HangingMassSystem rotation={rotation} mass={mass} stringLength={stringLength} />
      <RotationCounter rotations={rotation / (2 * Math.PI)} />
      <TimerDisplay time={0} />
      
      <OrbitControls 
        enablePan={false} 
        minDistance={5} 
        maxDistance={12} 
        target={[0, 1.5, 0]}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  )
}

export function FlywheelSim({ 
  flywheelMass: initialFlywheelMass = 2.5, 
  flywheelRadius: initialFlywheelRadius = 0.15, 
  hangingMass: initialHangingMass = 0.5,
  dropHeight: initialDropHeight = 1.0
}: Props) {
  // Adjustable parameters
  const [flywheelMass, setFlywheelMass] = useState(initialFlywheelMass)
  const [flywheelRadius, setFlywheelRadius] = useState(initialFlywheelRadius)
  const [hangingMass, setHangingMass] = useState(initialHangingMass)
  const [dropHeight, setDropHeight] = useState(initialDropHeight)
  
  const [isRunning, setIsRunning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [trials, setTrials] = useState<Trial[]>([])
  const [completedRotations, setCompletedRotations] = useState(0)
  
  // Theoretical moment of inertia for solid disk: I = 0.5 * M * R²
  const theoreticalInertia = 0.5 * flywheelMass * Math.pow(flywheelRadius, 2)

  // Record trial data - defined as ref to avoid hoisting issues
  const recordTrialRef = useRef((rotations: number, time: number) => {
    // Calculate experimental inertia from data
    // Using energy conservation: mgh = 0.5Iω² + 0.5mv²
    const g = 9.8
    const v = dropHeight / time // Average velocity
    const omega = (2 * rotations * Math.PI) / time
    const experimentalI = (hangingMass * g * dropHeight - 0.5 * hangingMass * v * v) / (0.5 * omega * omega)
    
    setTrials(prev => [...prev, {
      dropHeight,
      rotations: Number(rotations.toFixed(1)),
      time: Number(time.toFixed(2)),
      inertia: Number(experimentalI.toFixed(4))
    }].slice(-5))
  })
  
  // Calculate angular acceleration and simulate
  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now()
      const initialRotation = rotation
      const g = 9.8
      const flywheelR = 0.15 // Axle radius
      
      // I = m(g - a)r² / a where a is linear acceleration
      const interval = setInterval(() => {
        const currentTime = (Date.now() - startTime) / 1000
        setElapsedTime(currentTime)
        
        // Simplified physics: angular velocity increases as mass falls
        const angularVelocity = (hangingMass * g * flywheelR) / theoreticalInertia * currentTime
        setRotation(prev => prev + angularVelocity * 0.016)
        
        // Calculate rotations
        const totalRotations = (rotation + angularVelocity * 0.016) / (2 * Math.PI)
        setCompletedRotations(Math.floor(totalRotations))
        
        // Stop when mass hits bottom
        const unwrappedLength = rotation * flywheelR
        if (unwrappedLength >= dropHeight) {
          setIsRunning(false)
          recordTrialRef.current(totalRotations, currentTime)
        }
      }, 16)
      
      return () => clearInterval(interval)
    }
  }, [isRunning, rotation, hangingMass, theoreticalInertia, dropHeight])
  
  const reset = () => {
    setIsRunning(false)
    setRotation(0)
    setElapsedTime(0)
    setCompletedRotations(0)
    setTrials([])
  }
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Flywheel: {flywheelMass.toFixed(2)} kg</Badge>
        <Badge variant="outline">Radius: {(flywheelRadius * 100).toFixed(1)} cm</Badge>
        <Badge variant="outline">Hanging: {hangingMass.toFixed(2)} kg</Badge>
        <Badge>Height: {dropHeight.toFixed(2)} m</Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Drop a known mass attached to the flywheel axle. Measure the number of rotations 
        and time to calculate the moment of inertia I using energy conservation principles.
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Rotations</div>
          <div className="text-lg font-semibold text-green-500">{completedRotations}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Time</div>
          <div className="text-lg font-semibold text-amber-500">{elapsedTime.toFixed(2)}s</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Theoretical I</div>
          <div className="text-lg font-semibold text-blue-400">{theoreticalInertia.toFixed(4)}</div>
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
              <span className="text-muted-foreground">Flywheel Mass</span>
              <span className="font-medium">{flywheelMass.toFixed(1)} kg</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={flywheelMass}
              onChange={(e) => setFlywheelMass(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Flywheel Radius</span>
              <span className="font-medium">{(flywheelRadius * 100).toFixed(0)} cm</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.25"
              step="0.01"
              value={flywheelRadius}
              onChange={(e) => setFlywheelRadius(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Hanging Mass</span>
              <span className="font-medium">{(hangingMass * 1000).toFixed(0)} g</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={hangingMass}
              onChange={(e) => setHangingMass(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Drop Height</span>
              <span className="font-medium">{(dropHeight * 100).toFixed(0)} cm</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={dropHeight}
              onChange={(e) => setDropHeight(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={() => setIsRunning(!isRunning)}
          disabled={rotation * 0.15 >= dropHeight}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          {isRunning ? "Stop" : "Start Drop"}
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      {/* Trials */}
      {trials.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs font-medium mb-2">Experimental Results:</div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-muted-foreground">Height (m)</div>
            <div className="text-muted-foreground">Rotations</div>
            <div className="text-muted-foreground">Time (s)</div>
            <div className="text-muted-foreground">I (kg·m²)</div>
            {trials.map((t, i) => (
              <div key={i} className="contents">
                <div>{t.dropHeight.toFixed(2)}</div>
                <div>{t.rotations}</div>
                <div>{t.time.toFixed(2)}</div>
                <div className="text-green-500">{t.inertia}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
        <Canvas camera={{ position: [6, 5, 6], fov: 50 }} shadows>
          <Scene 
            rotation={rotation}
            mass={hangingMass}
            stringLength={dropHeight}
            isRunning={isRunning}
          />
        </Canvas>
      </div>
    </div>
  )
}
