"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Zap, Battery } from "lucide-react"
import * as THREE from "three"

type Props = {
  cellEMF: number // Volts
  standardCellEMF: number // Volts
  wireLength: number // meters
}

type Trial = {
  cellEMF: number
  internalResistance: number
  balanceLength1: number
  balanceLength2: number
  loadCurrent: number
}

// Potentiometer wire with sliding contact
function PotentiometerWire({ 
  contactPosition, 
  isBalanced, 
  current 
}: { 
  contactPosition: number; 
  isBalanced: boolean; 
  current: number; 
}) {
  const wireRef = useRef<THREE.Mesh>(null)
  const contactRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (wireRef.current && current > 0) {
      // Wire glow when current flows
      const material = wireRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = Math.min(current * 0.5, 0.8)
    }
    
    if (contactRef.current) {
      // Animate contact position
      contactRef.current.position.x = -2 + contactPosition * 4
    }
  })
  
  return (
    <group position={[0, 0.5, 0]}>
      {/* Potentiometer wire */}
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
      
      {/* Scale markings */}
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
      
      {/* Sliding contact */}
      <mesh ref={contactRef} position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.05]} />
        <meshStandardMaterial color="#ff6b35" metalness={0.8} />
      </mesh>
      
      {/* Contact pointer */}
      <mesh position={[0, -0.03, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.06, 16]} />
        <meshStandardMaterial color="#ff6b35" />
      </mesh>
      
      <Text position={[0, -0.3, 0]} fontSize={0.05} color="#64748b" anchorX="center">
      POTENTIOMETER
      </Text>
    </group>
  )
}

// Test cell (unknown EMF and internal resistance)
function TestCell({ 
  emf, 
  internalResistance, 
  isConnected 
}: { 
  emf: number; 
  internalResistance: number; 
  isConnected: boolean; 
}) {
  const cellRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (cellRef.current && isConnected) {
      // Cell glow when connected
      const material = cellRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.002) * 0.1
    }
  })
  
  return (
    <group position={[-3, 0.2, 0]}>
      {/* Cell body */}
      <mesh ref={cellRef} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.3]} />
        <meshStandardMaterial 
          color="#2ecc71"
          metalness={0.2}
          roughness={0.6}
          emissive="#27ae60"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Positive terminal */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
        <meshStandardMaterial color="#e74c3c" metalness={1} />
      </mesh>
      
      {/* Negative terminal */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
        <meshStandardMaterial color="#34495e" metalness={1} />
      </mesh>
      
      {/* EMF label */}
      <Text position={[0, 0, 0.16]} fontSize={0.05} color="#ffffff" anchorX="center">
        {emf.toFixed(2)}V
      </Text>
      
      {/* Internal resistance indicator */}
      <Text position={[0, 0.08, 0.16]} fontSize={0.03} color="#ecf0f1" anchorX="center">
        r = {internalResistance.toFixed(1)}Ω
      </Text>
      
      <Text position={[0, -0.5, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        TEST CELL
      </Text>
    </group>
  )
}

// Standard cell (known EMF)
function StandardCell({ emf }: { emf: number }) {
  return (
    <group position={[3, 0.2, 0]}>
      {/* Cell body */}
      <mesh castShadow>
        <boxGeometry args={[0.4, 0.8, 0.3]} />
        <meshStandardMaterial 
          color="#3498db"
          metalness={0.2}
          roughness={0.6}
        />
      </mesh>
      
      {/* Positive terminal */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
        <meshStandardMaterial color="#e74c3c" metalness={1} />
      </mesh>
      
      {/* Negative terminal */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.05, 16]} />
        <meshStandardMaterial color="#34495e" metalness={1} />
      </mesh>
      
      {/* EMF label */}
      <Text position={[0, 0, 0.16]} fontSize={0.05} color="#ffffff" anchorX="center">
        {emf.toFixed(3)}V
      </Text>
      
      <Text position={[0, -0.5, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        STANDARD CELL
      </Text>
    </group>
  )
}

// Galvanometer for null detection
function Galvanometer({ 
  deflection, 
  isBalanced 
}: { 
  deflection: number; 
  isBalanced: boolean; 
}) {
  const needleRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (needleRef.current) {
      // Animate needle deflection
      const targetDeflection = isBalanced ? 0 : deflection
      needleRef.current.rotation.z = THREE.MathUtils.lerp(
        needleRef.current.rotation.z, 
        targetDeflection, 
        0.1
      )
    }
  })
  
  return (
    <group position={[0, 1.5, 0]}>
      {/* Galvanometer body */}
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
      
      {/* Center zero mark */}
      <mesh position={[0, 0.2, 0.07]}>
        <boxGeometry args={[0.02, 0.02, 0.001]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      
      {/* Needle */}
      <mesh ref={needleRef} position={[0, 0, 0.08]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.01, 0.2, 0.001]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      
      {/* Center pivot */}
      <mesh position={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.02, 0.02, 0.01, 16]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      <Text position={[0, -0.15, 0.08]} fontSize={0.04} color="#1e293b" anchorX="center">
        G
      </Text>
      
      <Text position={[0, -0.25, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        GALVANOMETER
      </Text>
    </group>
  )
}

// Rheostat for load adjustment
function Rheostat({ 
  resistance, 
  current 
}: { 
  resistance: number; 
  current: number; 
}) {
  const rheostatRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (rheostatRef.current && current > 0) {
      // Heat glow when current flows
      const material = rheostatRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = Math.min(current * 5, 0.6)
    }
  })
  
  return (
    <group position={[0, -0.8, 0]}>
      {/* Rheostat body */}
      <mesh ref={rheostatRef} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.6, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial 
          color="#8b4513"
          roughness={0.8}
          emissive="#ff6600"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Winding visualization */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = -0.25 + i * 0.025
        return (
          <mesh key={i} position={[x, 0, 0]}>
            <torusGeometry args={[0.12, 0.01, 8, 8]} />
            <meshStandardMaterial color="#cd853f" />
          </mesh>
        )
      })}
      
      {/* Slider */}
      <mesh position={[0, 0, 0.16]}>
        <boxGeometry args={[0.05, 0.05, 0.02]} />
        <meshStandardMaterial color="#ff6b35" />
      </mesh>
      
      {/* Terminals */}
      <mesh position={[-0.3, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      <mesh position={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      
      <Text position={[0, -0.2, 0]} fontSize={0.04} color="#1e293b" anchorX="center">
        {resistance.toFixed(1)} Ω
      </Text>
      
      <Text position={[0, -0.3, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        RHEOSTAT
      </Text>
    </group>
  )
}

// Circuit connections
function PotentiometerCircuit({ 
  contactPosition, 
  current, 
  isBalanced 
}: { 
  contactPosition: number; 
  current: number; 
  isBalanced: boolean; 
}) {
  const wireRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (wireRef.current && current > 0 && !isBalanced) {
      wireRef.current.children.forEach((wire, index) => {
        if (wire instanceof THREE.Mesh) {
          const material = wire.material as THREE.MeshStandardMaterial
          material.emissiveIntensity = 0.2 + Math.sin(Date.now() * 0.005 + index) * 0.1
        }
      })
    }
  })
  
  const contactX = -2 + contactPosition * 4
  
  return (
    <group ref={wireRef}>
      {/* Main circuit wire */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[6, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Connection to test cell */}
      <mesh position={[-2, 0.5, 0]}>
        <boxGeometry args={[0.02, 0.3, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Connection to standard cell */}
      <mesh position={[2, 0.5, 0]}>
        <boxGeometry args={[0.02, 0.3, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Galvanometer connections */}
      <mesh position={[contactX, 0.5, 0]}>
        <boxGeometry args={[0.02, 1, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Load circuit connections */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[3, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[0.02, 0.5, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
    </group>
  )
}

// Digital display for measurements
function MeasurementDisplay({ 
  balanceLength1,
  balanceLength2,
  cellEMF,
  internalResistance,
  isBalanced
}: {
  balanceLength1: number;
  balanceLength2: number;
  cellEMF: number;
  internalResistance: number;
  isBalanced: boolean;
}) {
  return (
    <group position={[0, 2.5, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.8, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[1.3, 0.6]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      <Text position={[0, 0.15, 0.07]} fontSize={0.06} color="#00ff00" anchorX="center">
        {isBalanced ? "BALANCED" : "UNBALANCED"}
      </Text>
      
      <Text position={[-0.5, 0, 0.07]} fontSize={0.04} color="#00ff00" anchorX="left">
        L₁: {balanceLength1.toFixed(1)}cm
      </Text>
      <Text position={[0.5, 0, 0.07]} fontSize={0.04} color="#00ff00" anchorX="right">
        L₂: {balanceLength2.toFixed(1)}cm
      </Text>
      
      <Text position={[-0.5, -0.08, 0.07]} fontSize={0.04} color="#ffff00" anchorX="left">
        EMF: {cellEMF.toFixed(3)}V
      </Text>
      <Text position={[0.5, -0.08, 0.07]} fontSize={0.04} color="#ffff00" anchorX="right">
        r: {internalResistance.toFixed(2)}Ω
      </Text>
      
      <Text position={[0, -0.6, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        MEASUREMENT DISPLAY
      </Text>
    </group>
  )
}

function Scene({ 
  cellEMF,
  standardCellEMF,
  contactPosition,
  loadResistance,
  isBalanced,
  current,
  balanceLength1,
  balanceLength2,
  calculatedInternalResistance
}: {
  cellEMF: number;
  standardCellEMF: number;
  contactPosition: number;
  loadResistance: number;
  isBalanced: boolean;
  current: number;
  balanceLength1: number;
  balanceLength2: number;
  calculatedInternalResistance: number;
}) {
  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 3]} intensity={1} castShadow />
      <directionalLight position={[-3, 6, -2]} intensity={0.4} />
      <pointLight position={[0, 4, 2]} intensity={0.5} color="#fbbf24" />
      
      {/* Lab bench */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#1e293b" metalness={0.1} roughness={0.9} />
      </mesh>
      
      <TestCell 
        emf={cellEMF}
        internalResistance={calculatedInternalResistance}
        isConnected={true}
      />
      <StandardCell emf={standardCellEMF} />
      <PotentiometerWire 
        contactPosition={contactPosition}
        isBalanced={isBalanced}
        current={current}
      />
      <Galvanometer 
        deflection={isBalanced ? 0 : 0.2}
        isBalanced={isBalanced}
      />
      <Rheostat 
        resistance={loadResistance}
        current={current}
      />
      <PotentiometerCircuit 
        contactPosition={contactPosition}
        current={current}
        isBalanced={isBalanced}
      />
      <MeasurementDisplay 
        balanceLength1={balanceLength1}
        balanceLength2={balanceLength2}
        cellEMF={cellEMF}
        internalResistance={calculatedInternalResistance}
        isBalanced={isBalanced}
      />
      
      {/* Instructions */}
      <Text position={[0, 3.5, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        Internal Resistance: r = (L₂/L₁ - 1) × R
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

export function InternalResistanceCellSim({ 
  cellEMF: initialCellEMF = 1.5, 
  standardCellEMF: initialStandardCellEMF = 1.018, 
  wireLength: initialWireLength = 1
}: Props) {
  const [cellEMF] = useState(initialCellEMF)
  const [standardCellEMF] = useState(initialStandardCellEMF)
  const [wireLength] = useState(initialWireLength)
  const [contactPosition, setContactPosition] = useState(0.5)
  const [loadResistance, setLoadResistance] = useState(10)
  
  const [trials, setTrials] = useState<Trial[]>([])
  const [isBalanced, setIsBalanced] = useState(false)
  const [current, setCurrent] = useState(0)
  
  // Internal resistance to be measured (unknown to the user initially)
  const actualInternalResistance = 2.5 // Ω
  
  // Calculate balance lengths
  const balanceLength1 = contactPosition * wireLength * 100 // Convert to cm
  const balanceLength2 = (1 - contactPosition) * wireLength * 100
  
  // Calculate circuit values
  const totalResistance = loadResistance + actualInternalResistance
  const circuitCurrent = cellEMF / totalResistance
  const terminalVoltage = cellEMF - circuitCurrent * actualInternalResistance
  
  // Calculate measured internal resistance using potentiometer formula
  const calculateInternalResistance = (): number => {
    if (balanceLength1 > 0) {
      return ((balanceLength2 / balanceLength1) - 1) * loadResistance
    }
    return 0
  }
  
  const measuredInternalResistance = calculateInternalResistance()
  
  // Simulate balance detection
  const checkBalance = () => {
    // Simulate finding balance point
    const expectedRatio = (cellEMF - circuitCurrent * actualInternalResistance) / standardCellEMF
    const actualRatio = balanceLength1 / (balanceLength1 + balanceLength2)
    const difference = Math.abs(expectedRatio - actualRatio) / expectedRatio
    
    setIsBalanced(difference < 0.05) // 5% tolerance
    setCurrent(difference < 0.05 ? 0 : circuitCurrent * difference)
  }
  
  const autoBalance = () => {
    // Automatically find balance point for demonstration
    const targetPosition = 0.6 // Simulated balance position
    setContactPosition(targetPosition)
    setIsBalanced(true)
    setCurrent(0)
    
    // Record the trial
    const newBalanceLength1 = targetPosition * wireLength * 100
    const newBalanceLength2 = (1 - targetPosition) * wireLength * 100
    const calculatedResistance = ((newBalanceLength2 / newBalanceLength1) - 1) * loadResistance
    
    setTrials(prev => [...prev, {
      cellEMF,
      internalResistance: calculatedResistance,
      balanceLength1: newBalanceLength1,
      balanceLength2: newBalanceLength2,
      loadCurrent: circuitCurrent
    }].slice(-5))
  }
  
  const recordMeasurement = () => {
    if (isBalanced) {
      setTrials(prev => [...prev, {
        cellEMF,
        internalResistance: measuredInternalResistance,
        balanceLength1,
        balanceLength2,
        loadCurrent: circuitCurrent
      }].slice(-5))
    }
  }
  
  const reset = () => {
    setContactPosition(0.5)
    setIsBalanced(false)
    setCurrent(0)
  }
  
  useEffect(() => {
    checkBalance()
  }, [contactPosition, loadResistance, balanceLength1, balanceLength2])
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Cell EMF: {cellEMF.toFixed(2)} V</Badge>
        <Badge variant="outline">Standard EMF: {standardCellEMF.toFixed(3)} V</Badge>
        <Badge variant="outline">Balance L₁: {balanceLength1.toFixed(1)} cm</Badge>
        <Badge variant="outline">Balance L₂: {balanceLength2.toFixed(1)} cm</Badge>
        <Badge variant="outline">Load R: {loadResistance.toFixed(1)} Ω</Badge>
        <Badge variant={isBalanced ? "default" : "destructive"}>
          {isBalanced ? "Balanced" : "Unbalanced"}
        </Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Measure internal resistance of a cell using potentiometer method.
        First balance with standard cell, then with test cell under load.
        Formula: r = (L₂/L₁ - 1) × R
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Contact Position</div>
          <div className="text-lg font-semibold text-blue-500">{(contactPosition * 100).toFixed(1)}%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Ratio L₂/L₁</div>
          <div className="text-lg font-semibold text-green-500">{(balanceLength2 / balanceLength1).toFixed(3)}</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Load Current</div>
          <div className="text-lg font-semibold text-amber-500">{(circuitCurrent * 1000).toFixed(2)} mA</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Internal R</div>
          <div className="text-lg font-semibold text-purple-500">{measuredInternalResistance.toFixed(2)} Ω</div>
        </div>
      </div>
      
      {/* Parameter Controls */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Battery className="w-4 h-4" />
          Circuit Controls
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Contact Position</span>
              <span className="font-medium">{(contactPosition * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.01"
              value={contactPosition}
              onChange={(e) => setContactPosition(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Load Resistance</span>
              <span className="font-medium">{loadResistance.toFixed(1)} Ω</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="0.5"
              value={loadResistance}
              onChange={(e) => setLoadResistance(Number(e.target.value))}
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
          <Battery className="w-4 h-4" />
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
          <div className="grid grid-cols-6 gap-2 text-xs">
            <div className="text-muted-foreground">EMF (V)</div>
            <div className="text-muted-foreground">L₁ (cm)</div>
            <div className="text-muted-foreground">L₂ (cm)</div>
            <div className="text-muted-foreground">Load R (Ω)</div>
            <div className="text-muted-foreground">Internal R (Ω)</div>
            <div className="text-muted-foreground">Error (%)</div>
            {trials.map((t, i) => (
              <div key={i} className="contents">
                <div>{t.cellEMF.toFixed(2)}</div>
                <div>{t.balanceLength1.toFixed(1)}</div>
                <div>{t.balanceLength2.toFixed(1)}</div>
                <div>{t.loadCurrent > 0 ? (t.cellEMF / t.loadCurrent).toFixed(1) : "--"}</div>
                <div className="text-green-500">{t.internalResistance.toFixed(2)}</div>
                <div className="text-amber-500">
                  {Math.abs((t.internalResistance - actualInternalResistance) / actualInternalResistance * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [4, 4, 5], fov: 50 }} shadows>
          <Scene 
            cellEMF={cellEMF}
            standardCellEMF={standardCellEMF}
            contactPosition={contactPosition}
            loadResistance={loadResistance}
            isBalanced={isBalanced}
            current={current}
            balanceLength1={balanceLength1}
            balanceLength2={balanceLength2}
            calculatedInternalResistance={measuredInternalResistance}
          />
        </Canvas>
      </div>
    </div>
  )
}
