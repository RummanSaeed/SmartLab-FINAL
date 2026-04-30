"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, CheckCircle2, Timer, Settings2 } from "lucide-react"
import * as THREE from "three"

type Props = {
  sphereRadius: number // mm
  sphereDensity: number // g/cm³
  fluidViscosity: number // Pa·s (to be calculated)
}

type Trial = {
  distance: number
  time: number
  velocity: number
  viscosity: number
}

// Tall viscometer cylinder
function ViscometerTube({ fluidColor }: { fluidColor: string }) {
  return (
    <group position={[0, 1.5, 0]}>
      {/* Cylinder outer wall - glass */}
      <mesh>
        <cylinderGeometry args={[0.6, 0.6, 4, 32]} />
        <meshPhysicalMaterial 
          color="#e2e8f0"
          metalness={0}
          roughness={0.05}
          transmission={0.9}
          thickness={0.05}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Cylinder inner wall */}
      <mesh>
        <cylinderGeometry args={[0.55, 0.55, 3.9, 32]} />
        <meshPhysicalMaterial 
          color={fluidColor}
          metalness={0}
          roughness={0.1}
          transmission={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Bottom base */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.65, 0.65, 0.1, 32]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.3} />
      </mesh>
      
      {/* Markings on cylinder */}
      {Array.from({ length: 21 }).map((_, i) => {
        const y = 1.8 - i * 0.18
        const isMajor = i % 5 === 0
        return (
          <group key={i}>
            <mesh position={[0.58, y, 0]} rotation={[0, 0, Math.PI/2]}>
              <boxGeometry args={[isMajor ? 0.08 : 0.04, 0.01, 0.01]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            {isMajor && (
              <Text position={[0.75, y, 0]} fontSize={0.08} color="#1e293b" anchorX="left">
                {i * 10}cm
              </Text>
            )}
          </group>
        )
      })}
      
      {/* Cylinder label */}
      <Text position={[0, 2.3, 0.6]} fontSize={0.08} color="#64748b" anchorX="center">
        VISCOMETER
      </Text>
    </group>
  )
}

// Falling sphere
function FallingSphere({ 
  position, 
  radius, 
  isFalling,
  onReachBottom
}: { 
  position: number; 
  radius: number; 
  isFalling: boolean;
  onReachBottom: () => void;
}) {
  const sphereRef = useRef<THREE.Mesh>(null)
  const currentY = useRef(1.5)
  
  useFrame(() => {
    if (isFalling && sphereRef.current) {
      // Terminal velocity fall (simplified)
      currentY.current -= 0.003
      sphereRef.current.position.y = currentY.current
      
      // Rotation while falling
      sphereRef.current.rotation.x += 0.02
      sphereRef.current.rotation.z += 0.01
      
      if (currentY.current <= -0.5) {
        onReachBottom()
      }
    }
  })
  
  const sphereSize = radius / 100 // Convert mm to meters
  
  return (
    <mesh ref={sphereRef} position={[0, isFalling ? currentY.current : 1.5 + position, 0]} castShadow>
      <sphereGeometry args={[sphereSize, 32, 32]} />
      <meshStandardMaterial 
        color="#64748b" 
        metalness={0.9} 
        roughness={0.2}
        envMapIntensity={1}
      />
    </mesh>
  )
}

// Measuring scale reference
function MeasuringScale() {
  return (
    <group position={[1.2, 1.5, 0]}>
      {/* Scale body */}
      <mesh>
        <boxGeometry args={[0.1, 4, 0.05]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      
      {/* Scale markings */}
      {Array.from({ length: 41 }).map((_, i) => {
        const y = 1.95 - i * 0.1
        const isMajor = i % 5 === 0
        return (
          <mesh key={i} position={[0.06, y, 0.03]}>
            <boxGeometry args={[isMajor ? 0.06 : 0.03, 0.01, 0.01]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        )
      })}
      
      {/* Scale label */}
      <Text position={[0.2, 2.2, 0]} fontSize={0.08} color="#64748b" anchorX="left">
        cm
      </Text>
    </group>
  )
}

// Timer display panel
function TimerDisplay({ time }: { time: number }) {
  return (
    <group position={[-2, 3, 0]}>
      <mesh>
        <boxGeometry args={[1.2, 0.6, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[1, 0.4]} />
        <meshStandardMaterial color="#0f172a" emissive="#22c55e" emissiveIntensity={0.1} />
      </mesh>
      
      <Text position={[0, 0.08, 0.07]} fontSize={0.12} color="#22c55e" anchorX="center">
        {time.toFixed(2)} s
      </Text>
      <Text position={[0, -0.15, 0.07]} fontSize={0.05} color="#94a3b8" anchorX="center">
        FALL TIME
      </Text>
    </group>
  )
}

// Stopwatch
function Stopwatch({ isRunning }: { isRunning: boolean }) {
  const handRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (isRunning && handRef.current) {
      handRef.current.rotation.z -= 0.1
    }
  })
  
  return (
    <group position={[-2, 2, 0]}>
      {/* Stopwatch body */}
      <mesh>
        <cylinderGeometry args={[0.25, 0.25, 0.08, 32]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      
      {/* Dial */}
      <mesh position={[0, 0, 0.05]}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 32]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Hand */}
      <mesh ref={handRef} position={[0, 0, 0.07]}>
        <boxGeometry args={[0.01, 0.15, 0.01]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      
      {/* Center dot */}
      <mesh position={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.02, 0.02, 0.01, 16]} rotation={[Math.PI/2, 0, 0]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  )
}

function Scene({ 
  spherePosition,
  sphereRadius,
  isFalling,
  fallTime,
  onReachBottom
}: { 
  spherePosition: number;
  sphereRadius: number;
  isFalling: boolean;
  fallTime: number;
  onReachBottom: () => void;
}) {
  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 3]} intensity={1} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[0, 4, 2]} intensity={0.5} color="#fbbf24" />
      
      {/* Lab bench */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.9} />
      </mesh>
      
      <ViscometerTube fluidColor="#fbbf24" />
      <FallingSphere 
        position={spherePosition} 
        radius={sphereRadius}
        isFalling={isFalling}
        onReachBottom={onReachBottom}
      />
      <MeasuringScale />
      <TimerDisplay time={fallTime} />
      <Stopwatch isRunning={isFalling} />
      
      {/* Instructions */}
      <Text position={[0, 3.8, 0]} fontSize={0.1} color="#94a3b8" anchorX="center">
        Drop sphere, time fall over 20cm distance
      </Text>
      
      <OrbitControls 
        enablePan={false} 
        minDistance={5} 
        maxDistance={10} 
        target={[0, 1.5, 0]}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  )
}

export function ViscositySim({ 
  sphereRadius: initialSphereRadius = 2.5, 
  sphereDensity: initialSphereDensity = 7800, 
  fluidViscosity: initialFluidViscosity = 1.0
}: Props) {
  // Adjustable parameters
  const [sphereRadius, setSphereRadius] = useState(initialSphereRadius)
  const [sphereDensity, setSphereDensity] = useState(initialSphereDensity)
  const [fluidViscosity, setFluidViscosity] = useState(initialFluidViscosity)
  
  const [trials, setTrials] = useState<Trial[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [spherePosition, setSpherePosition] = useState(0.9)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [terminalVelocity, setTerminalVelocity] = useState(0)
  // Falling animation state
  const [isFalling, setIsFalling] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [hasReachedBottom, setHasReachedBottom] = useState(false)
  const [fallTime, setFallTime] = useState(0)
  
  const fallDistance = 0.2 // 20 cm in meters
  const fluidDensity = 1.26 // Glycerin density g/cm³
  
  // Calculate terminal velocity and viscosity using Stokes' law
  // v = 2/9 * g * r² * (ρs - ρf) / η
  // Therefore: η = 2/9 * g * r² * (ρs - ρf) / v
  
  const calculateViscosity = (velocity: number): number => {
    const g = 9.8
    const r = sphereRadius / 1000 // Convert mm to meters
    const rhoS = sphereDensity * 1000 // Convert g/cm³ to kg/m³
    const rhoF = fluidDensity * 1000
    
    // Stokes' law
    const viscosity = (2/9) * g * Math.pow(r, 2) * (rhoS - rhoF) / velocity
    return viscosity
  }
  
  const startFall = () => {
    setIsFalling(true)
    setStartTime(Date.now())
    setHasReachedBottom(false)
    setFallTime(0)
  }
  
  const handleReachBottom = () => {
    if (!hasReachedBottom) {
      const endTime = Date.now()
      const duration = (endTime - startTime) / 1000
      setFallTime(duration)
      setIsFalling(false)
      setHasReachedBottom(true)
      
      const velocity = fallDistance / duration
      const viscosity = calculateViscosity(velocity)
      
      setTrials(prev => [...prev, {
        distance: fallDistance * 100, // in cm
        time: Number(duration.toFixed(2)),
        velocity: Number(velocity.toFixed(3)),
        viscosity: Number(viscosity.toFixed(3))
      }].slice(-5))
    }
  }
  
  const reset = () => {
    setIsFalling(false)
    setFallTime(0)
    setHasReachedBottom(false)
    setStartTime(0)
  }
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Sphere: {sphereRadius.toFixed(1)} mm</Badge>
        <Badge variant="outline">Density: {sphereDensity.toFixed(2)} g/cm³</Badge>
        <Badge variant="outline">Fluid: Glycerin</Badge>
        <Badge variant="outline">Distance: 20 cm</Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Measure the time for a sphere to fall through 20cm of glycerin. 
        Calculate viscosity using Stokes' Law: η = 2gr²(ρs - ρf) / 9v
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Sphere Diameter</div>
          <div className="text-lg font-semibold text-amber-500">{(sphereRadius * 2).toFixed(1)} mm</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Terminal Velocity</div>
          <div className="text-lg font-semibold text-blue-400">{terminalVelocity.toFixed(3)} m/s</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Calculated η</div>
          <div className="text-lg font-semibold text-green-500">
            {trials.length > 0 ? trials[trials.length - 1].viscosity : "--"}
          </div>
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
              <span className="text-muted-foreground">Sphere Radius</span>
              <span className="font-medium">{sphereRadius.toFixed(1)} mm</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={sphereRadius}
              onChange={(e) => setSphereRadius(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Sphere Density</span>
              <span className="font-medium">{(sphereDensity / 1000).toFixed(1)} g/cm³</span>
            </div>
            <input
              type="range"
              min="2000"
              max="15000"
              step="100"
              value={sphereDensity}
              onChange={(e) => setSphereDensity(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Fluid Viscosity (η)</span>
              <span className="font-medium">{fluidViscosity.toFixed(1)} Pa·s</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={fluidViscosity}
              onChange={(e) => setFluidViscosity(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={startFall}
          disabled={isFalling}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          Drop Sphere
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
      
      {/* Trials */}
      {trials.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs font-medium mb-2">Experimental Data:</div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-muted-foreground">Distance (cm)</div>
            <div className="text-muted-foreground">Time (s)</div>
            <div className="text-muted-foreground">Velocity (m/s)</div>
            <div className="text-muted-foreground">η (Pa·s)</div>
            {trials.map((t, i) => (
              <div key={i} className="contents">
                <div>{t.distance.toFixed(1)}</div>
                <div>{t.time.toFixed(2)}</div>
                <div>{t.velocity.toFixed(3)}</div>
                <div className="text-green-500">{t.viscosity}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[360px]">
        <Canvas camera={{ position: [4, 4, 5], fov: 50 }} shadows>
          <Scene 
            spherePosition={0}
            sphereRadius={sphereRadius}
            isFalling={isFalling}
            fallTime={fallTime}
            onReachBottom={handleReachBottom}
          />
        </Canvas>
      </div>
    </div>
  )
}
