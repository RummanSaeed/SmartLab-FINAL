"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Zap, Gauge } from "lucide-react"
import * as THREE from "three"

type Props = {
  knownResistance: number // Ohms
  wireLength: number // meters
  bridgePosition: number // 0 to 1 (position along wire)
}

type Trial = {
  knownResistance: number
  leftLength: number
  rightLength: number
  unknownResistance: number
  balancePoint: number
}

// Slide wire bridge with realistic components
function SlideWireBridge({ 
  bridgePosition, 
  isBalanced, 
  current 
}: { 
  bridgePosition: number; 
  isBalanced: boolean; 
  current: number; 
}) {
  const bridgeRef = useRef<THREE.Mesh>(null)
  const galvanometerRef = useRef<THREE.Mesh>(null)
  const wireRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (bridgeRef.current) {
      // Animate bridge position
      bridgeRef.current.position.x = -2 + bridgePosition * 4
    }
    
    if (galvanometerRef.current && current > 0) {
      // Galvanometer needle deflection
      const needle = galvanometerRef.current.children.find(child => child.name === "needle")
      if (needle && needle instanceof THREE.Mesh) {
        const deflection = isBalanced ? 0 : Math.sin(Date.now() * 0.01) * 0.2 * current
        needle.rotation.z = THREE.MathUtils.lerp(needle.rotation.z, deflection, 0.1)
      }
    }
    
    if (wireRef.current && current > 0) {
      // Wire glow when current flows
      const material = wireRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = Math.min(current * 0.5, 0.8)
    }
  })
  
  return (
    <group position={[0, 0.5, 0]}>
      {/* Bridge wire */}
      <mesh ref={wireRef} position={[0, 0, 0]}>
        <boxGeometry args={[4, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          roughness={0.1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Wire markings (scale) */}
      {Array.from({ length: 41 }).map((_, i) => {
        const x = -2 + i * 0.1
        const isMajor = i % 5 === 0
        return (
          <group key={i}>
            <mesh position={[x, 0.02, 0]}>
              <boxGeometry args={[isMajor ? 0.02 : 0.01, 0.01, 0.01]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            {isMajor && (
              <Text position={[x, 0.06, 0]} fontSize={0.03} color="#1e293b" anchorX="center">
                {i * 5}cm
              </Text>
            )}
          </group>
        )
      })}
      
      {/* Sliding contact (bridge) */}
      <mesh ref={bridgeRef} position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.05]} />
        <meshStandardMaterial color="#ff6b35" metalness={0.8} />
      </mesh>
      
      {/* Contact pointer */}
      <mesh position={[0, -0.03, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.06, 16]} />
        <meshStandardMaterial color="#ff6b35" />
      </mesh>
      
      {/* Galvanometer */}
      <group ref={galvanometerRef} position={[0, 0.3, 0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
          <meshStandardMaterial color="#2c3e50" />
        </mesh>
        
        {/* Galvanometer face */}
        <mesh position={[0, 0, 0.06]}>
          <cylinderGeometry args={[0.25, 0.25, 0.02, 32]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Scale markings */}
        {Array.from({ length: 11 }).map((_, i) => {
          const angle = -Math.PI/3 + (i / 10) * (2 * Math.PI/3)
          const x = Math.sin(angle) * 0.2
          const y = Math.cos(angle) * 0.2
          return (
            <mesh key={i} position={[x, y, 0.07]}>
              <boxGeometry args={[0.01, 0.02, 0.001]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
          )
        })}
        
        {/* Needle */}
        <mesh name="needle" position={[0, 0, 0.08]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.02, 0.2, 0.001]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
        
        <Text position={[0, 0, 0.08]} fontSize={0.04} color="#1e293b" anchorX="center">
          G
        </Text>
      </group>
      
      {/* Bridge label */}
      <Text position={[0, -0.3, 0]} fontSize={0.05} color="#64748b" anchorX="center">
        SLIDE WIRE BRIDGE
      </Text>
    </group>
  )
}

// Standard resistor
function StandardResistor({ resistance, position }: { resistance: number; position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Resistor body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#D2691E" roughness={0.8} />
      </mesh>
      
      {/* Color bands */}
      <mesh position={[-0.15, 0, 0.061]}>
        <cylinderGeometry args={[0.061, 0.061, 0.02, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      <mesh position={[-0.05, 0, 0.061]}>
        <cylinderGeometry args={[0.061, 0.061, 0.02, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.05, 0, 0.061]}>
        <cylinderGeometry args={[0.061, 0.061, 0.02, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* Connection wires */}
      <mesh position={[-0.25, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      <mesh position={[0.25, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      
      <Text position={[0, -0.15, 0]} fontSize={0.04} color="#1e293b" anchorX="center">
        R₁ = {resistance}Ω
      </Text>
    </group>
  )
}

// Unknown resistor
function UnknownResistor({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Resistor body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#4169E1" roughness={0.8} />
      </mesh>
      
      {/* Question mark pattern */}
      <mesh position={[0, 0, 0.061]}>
        <cylinderGeometry args={[0.061, 0.061, 0.02, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Connection wires */}
      <mesh position={[-0.25, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      <mesh position={[0.25, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      
      <Text position={[0, -0.15, 0]} fontSize={0.04} color="#1e293b" anchorX="center">
        R₂ = ?
      </Text>
    </group>
  )
}

// Battery/power source
function Battery({ voltage }: { voltage: number }) {
  return (
    <group position={[-3, 0.2, 0]}>
      {/* Battery body */}
      <mesh castShadow>
        <boxGeometry args={[0.3, 0.6, 0.2]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Positive terminal */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
        <meshStandardMaterial color="#ff0000" metalness={1} />
      </mesh>
      
      {/* Negative terminal */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
        <meshStandardMaterial color="#000000" metalness={1} />
      </mesh>
      
      {/* Voltage label */}
      <Text position={[0, 0, 0.15]} fontSize={0.05} color="#ffffff" anchorX="center">
        {voltage}V
      </Text>
      
      <Text position={[0, -0.5, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        BATTERY
      </Text>
    </group>
  )
}

// Connection wires
function BridgeWires({ bridgePosition }: { bridgePosition: number }) {
  const bridgeX = -2 + bridgePosition * 4
  
  return (
    <group>
      {/* Left circuit wire */}
      <mesh position={[-2.5, 0.2, 0]}>
        <boxGeometry args={[1, 0.02, 0.02]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      
      {/* Right circuit wire */}
      <mesh position={[2.5, 0.2, 0]}>
        <boxGeometry args={[1, 0.02, 0.02]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      
      {/* Bridge connections */}
      <mesh position={[bridgeX, 0.25, 0]}>
        <boxGeometry args={[0.02, 0.15, 0.02]} />
        <meshStandardMaterial color="#ff6b35" />
      </mesh>
      
      {/* Galvanometer connection */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.02, 0.15, 0.02]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
    </group>
  )
}

// Digital display for measurements
function DigitalDisplay({ 
  leftLength, 
  rightLength, 
  unknownResistance, 
  isBalanced 
}: { 
  leftLength: number; 
  rightLength: number; 
  unknownResistance: number; 
  isBalanced: boolean; 
}) {
  return (
    <group position={[0, 2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.6, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[1, 0.4]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      <Text position={[0, 0.1, 0.07]} fontSize={0.06} color="#00ff00" anchorX="center">
        {isBalanced ? "BALANCED" : "UNBALANCED"}
      </Text>
      
      <Text position={[-0.4, -0.05, 0.07]} fontSize={0.04} color="#00ff00" anchorX="left">
        L₁: {leftLength.toFixed(1)}cm
      </Text>
      <Text position={[0.4, -0.05, 0.07]} fontSize={0.04} color="#00ff00" anchorX="right">
        L₂: {rightLength.toFixed(1)}cm
      </Text>
      
      <Text position={[0, -0.12, 0.07]} fontSize={0.05} color="#ffff00" anchorX="center">
        R₂ = {unknownResistance.toFixed(2)}Ω
      </Text>
      
      <Text position={[0, -0.4, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        DIGITAL DISPLAY
      </Text>
    </group>
  )
}

function Scene({ 
  knownResistance,
  bridgePosition,
  isBalanced,
  current,
  leftLength,
  rightLength,
  unknownResistance
}: {
  knownResistance: number;
  bridgePosition: number;
  isBalanced: boolean;
  current: number;
  leftLength: number;
  rightLength: number;
  unknownResistance: number;
}) {
  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 3]} intensity={1} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[0, 4, 2]} intensity={0.5} color="#fbbf24" />
      
      {/* Lab bench */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.9} />
      </mesh>
      
      <Battery voltage={6} />
      <StandardResistor resistance={knownResistance} position={[-2.5, 0.2, 0]} />
      <UnknownResistor position={[2.5, 0.2, 0]} />
      <SlideWireBridge 
        bridgePosition={bridgePosition}
        isBalanced={isBalanced}
        current={current}
      />
      <BridgeWires bridgePosition={bridgePosition} />
      <DigitalDisplay 
        leftLength={leftLength}
        rightLength={rightLength}
        unknownResistance={unknownResistance}
        isBalanced={isBalanced}
      />
      
      {/* Instructions */}
      <Text position={[0, 3.5, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        Slide Wire Bridge: R₂ = R₁ × (L₂/L₁)
      </Text>
      
      <OrbitControls 
        enablePan={false} 
        minDistance={5} 
        maxDistance={10} 
        target={[0, 0.5, 0]}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  )
}

export function SlideWireBridgeSim({ 
  knownResistance: initialKnownResistance = 10, 
  wireLength: initialWireLength = 1, 
  bridgePosition: initialBridgePosition = 0.5
}: Props) {
  const [knownResistance, setKnownResistance] = useState(initialKnownResistance)
  const [wireLength, setWireLength] = useState(initialWireLength)
  const [bridgePosition, setBridgePosition] = useState(initialBridgePosition)
  
  const [trials, setTrials] = useState<Trial[]>([])
  const [isBalanced, setIsBalanced] = useState(false)
  const [current, setCurrent] = useState(0)
  
  // Calculate wire lengths
  const leftLength = bridgePosition * wireLength * 100 // Convert to cm
  const rightLength = (1 - bridgePosition) * wireLength * 100
  
  // Calculate unknown resistance using Wheatstone bridge formula
  const calculateUnknownResistance = (): number => {
    if (leftLength > 0) {
      return knownResistance * (rightLength / leftLength)
    }
    return 0
  }
  
  const unknownResistance = calculateUnknownResistance()
  
  // Simulate balance detection
  const checkBalance = () => {
    // Simulate finding balance point (in real experiment, you'd adjust until galvanometer reads zero)
    const tolerance = 0.05 // 5% tolerance for balance
    const expectedRatio = knownResistance / unknownResistance
    const actualRatio = leftLength / rightLength
    const difference = Math.abs(expectedRatio - actualRatio) / expectedRatio
    
    setIsBalanced(difference < tolerance)
    setCurrent(difference < tolerance ? 0 : 0.1 * difference) // Current proportional to imbalance
  }
  
  const autoBalance = () => {
    // Automatically find balance point for demonstration
    const targetRatio = Math.random() * 5 + 1 // Random unknown resistance between 1-6x known
    const targetPosition = knownResistance / (knownResistance + knownResistance * targetRatio)
    setBridgePosition(targetPosition)
    setIsBalanced(true)
    setCurrent(0)
    
    // Record the trial
    const newLeftLength = targetPosition * wireLength * 100
    const newRightLength = (1 - targetPosition) * wireLength * 100
    const calculatedResistance = knownResistance * (newRightLength / newLeftLength)
    
    setTrials(prev => [...prev, {
      knownResistance,
      leftLength: newLeftLength,
      rightLength: newRightLength,
      unknownResistance: calculatedResistance,
      balancePoint: targetPosition
    }].slice(-5))
  }
  
  const recordMeasurement = () => {
    if (isBalanced) {
      setTrials(prev => [...prev, {
        knownResistance,
        leftLength,
        rightLength,
        unknownResistance,
        balancePoint: bridgePosition
      }].slice(-5))
    }
  }
  
  const reset = () => {
    setBridgePosition(0.5)
    setIsBalanced(false)
    setCurrent(0)
  }
  
  useEffect(() => {
    checkBalance()
  }, [bridgePosition, knownResistance, leftLength, rightLength, unknownResistance])
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Known R₁: {knownResistance} Ω</Badge>
        <Badge variant="outline">Left Length: {leftLength.toFixed(1)} cm</Badge>
        <Badge variant="outline">Right Length: {rightLength.toFixed(1)} cm</Badge>
        <Badge variant="outline">Unknown R₂: {unknownResistance.toFixed(2)} Ω</Badge>
        <Badge variant={isBalanced ? "default" : "destructive"}>
          {isBalanced ? "Balanced" : "Unbalanced"}
        </Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Measure unknown resistance using slide wire bridge (Wheatstone bridge principle).
        Adjust bridge position until galvanometer shows zero (balanced condition).
        Formula: R₂ = R₁ × (L₂/L₁)
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Bridge Position</div>
          <div className="text-lg font-semibold text-blue-500">{(bridgePosition * 100).toFixed(1)}%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Ratio L₂/L₁</div>
          <div className="text-lg font-semibold text-green-500">{(rightLength / leftLength).toFixed(3)}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Galvanometer</div>
          <div className="text-lg font-semibold text-amber-500">{current > 0 ? "Deflected" : "Zero"}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Wire Length</div>
          <div className="text-lg font-semibold text-purple-500">{(wireLength * 100).toFixed(0)} cm</div>
        </div>
      </div>
      
      {/* Parameter Controls */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Gauge className="w-4 h-4" />
          Bridge Controls
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Known Resistance (R₁)</span>
              <span className="font-medium">{knownResistance} Ω</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={knownResistance}
              onChange={(e) => setKnownResistance(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Bridge Position</span>
              <span className="font-medium">{(bridgePosition * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.01"
              value={bridgePosition}
              onChange={(e) => setBridgePosition(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Wire Length</span>
              <span className="font-medium">{(wireLength * 100).toFixed(0)} cm</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={wireLength}
              onChange={(e) => setWireLength(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={autoBalance}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          Auto Balance
        </Button>
        <Button 
          onClick={recordMeasurement}
          disabled={!isBalanced}
          variant="outline"
          className="gap-2"
        >
          <Gauge className="w-4 h-4" />
          Record Measurement
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
          <div className="grid grid-cols-5 gap-2 text-xs">
            <div className="text-muted-foreground">R₁ (Ω)</div>
            <div className="text-muted-foreground">L₁ (cm)</div>
            <div className="text-muted-foreground">L₂ (cm)</div>
            <div className="text-muted-foreground">R₂ (Ω)</div>
            <div className="text-muted-foreground">Balance Point</div>
            {trials.map((t, i) => (
              <div key={i} className="contents">
                <div>{t.knownResistance}</div>
                <div>{t.leftLength.toFixed(1)}</div>
                <div>{t.rightLength.toFixed(1)}</div>
                <div className="text-green-500">{t.unknownResistance.toFixed(2)}</div>
                <div>{(t.balancePoint * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [4, 4, 5], fov: 50 }} shadows>
          <Scene 
            knownResistance={knownResistance}
            bridgePosition={bridgePosition}
            isBalanced={isBalanced}
            current={current}
            leftLength={leftLength}
            rightLength={rightLength}
            unknownResistance={unknownResistance}
          />
        </Canvas>
      </div>
    </div>
  )
}
