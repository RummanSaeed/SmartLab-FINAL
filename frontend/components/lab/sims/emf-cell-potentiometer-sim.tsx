"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Zap, Battery } from "lucide-react"
import * as THREE from "three"

type Props = {
  standardCellEMF: number // Volts
  unknownCellEMF: number // Volts
  wireLength: number // meters
}

type Trial = {
  standardEMF: number
  unknownEMF: number
  standardLength: number
  unknownLength: number
  calculatedEMF: number
  error: number
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

// Standard cell (known EMF)
function StandardCell({ emf }: { emf: number }) {
  const cellRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (cellRef.current) {
      // Cell glow
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
          color="#3498db"
          metalness={0.2}
          roughness={0.6}
          emissive="#2980b9"
          emissiveIntensity={0.3}
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

// Unknown cell (to be measured)
function UnknownCell({ emf }: { emf: number }) {
  const cellRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (cellRef.current) {
      // Cell glow
      const material = cellRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.002) * 0.1
    }
  })
  
  return (
    <group position={[3, 0.2, 0]}>
      {/* Cell body */}
      <mesh ref={cellRef} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.3]} />
        <meshStandardMaterial 
          color="#2ecc71"
          metalness={0.2}
          roughness={0.6}
          emissive="#27ae60"
          emissiveIntensity={0.3}
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
      
      {/* EMF label (initially unknown) */}
      <Text position={[0, 0, 0.16]} fontSize={0.05} color="#ffffff" anchorX="center">
        ? V
      </Text>
      
      <Text position={[0, -0.5, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        UNKNOWN CELL
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

// Battery for potentiometer circuit
function BatteryBank({ voltage }: { voltage: number }) {
  const batteryRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (batteryRef.current) {
      const material = batteryRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.001) * 0.1
    }
  })
  
  return (
    <group position={[0, -0.8, 0]}>
      {/* Battery bank */}
      <mesh ref={batteryRef} castShadow>
        <boxGeometry args={[1, 0.6, 0.4]} />
        <meshStandardMaterial 
          color="#34495e"
          metalness={0.3}
          emissive="#f39c12"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Individual battery indicators */}
      {Array.from({ length: 4 }).map((_, i) => {
        const x = -0.35 + i * 0.23
        return (
          <mesh key={i} position={[x, 0, 0.21]}>
            <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
        )
      })}
      
      <Text position={[0, 0, 0.16]} fontSize={0.06} color="#ffffff" anchorX="center">
        {voltage.toFixed(1)}V
      </Text>
      
      <Text position={[0, -0.4, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        BATTERY BANK
      </Text>
    </group>
  )
}

// Circuit connections
function EMFCircuit({ 
  contactPosition, 
  current, 
  isBalanced,
  cellType 
}: { 
  contactPosition: number; 
  current: number; 
  isBalanced: boolean;
  cellType: "standard" | "unknown";
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
  const cellX = cellType === "standard" ? -3 : 3
  
  return (
    <group ref={wireRef}>
      {/* Main potentiometer wire */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Connection to cell */}
      <mesh position={[cellX, 0.5, 0]}>
        <boxGeometry args={[Math.abs(cellX - 2), 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Vertical connection from cell */}
      <mesh position={[cellX, 0.35, 0]}>
        <boxGeometry args={[0.02, 0.3, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Galvanometer connection */}
      <mesh position={[contactX, 0.5, 0]}>
        <boxGeometry args={[0.02, 1, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Battery bank connections */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[4, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.02, 0.4, 0.02]} />
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
  standardLength,
  unknownLength,
  standardEMF,
  calculatedEMF,
  isBalanced,
  cellType
}: {
  standardLength: number;
  unknownLength: number;
  standardEMF: number;
  calculatedEMF: number;
  isBalanced: boolean;
  cellType: "standard" | "unknown";
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
      
      <Text position={[0, 0.05, 0.07]} fontSize={0.04} color="#00ff00" anchorX="center">
        {cellType === "standard" ? "STANDARD CELL" : "UNKNOWN CELL"}
      </Text>
      
      <Text position={[0, -0.05, 0.07]} fontSize={0.04} color="#00ff00" anchorX="center">
        Balance Length: {(cellType === "standard" ? standardLength : unknownLength).toFixed(1)} cm
      </Text>
      
      {cellType === "unknown" && calculatedEMF > 0 && (
        <Text position={[0, -0.15, 0.07]} fontSize={0.05} color="#ffff00" anchorX="center">
          EMF = {calculatedEMF.toFixed(3)} V
        </Text>
      )}
      
      <Text position={[0, -0.6, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        MEASUREMENT DISPLAY
      </Text>
    </group>
  )
}

function Scene({ 
  standardCellEMF,
  unknownCellEMF,
  contactPosition,
  isBalanced,
  current,
  standardLength,
  unknownLength,
  calculatedEMF,
  cellType
}: {
  standardCellEMF: number;
  unknownCellEMF: number;
  contactPosition: number;
  isBalanced: boolean;
  current: number;
  standardLength: number;
  unknownLength: number;
  calculatedEMF: number;
  cellType: "standard" | "unknown";
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
      
      <StandardCell emf={standardCellEMF} />
      <UnknownCell emf={unknownCellEMF} />
      <PotentiometerWire 
        contactPosition={contactPosition}
        isBalanced={isBalanced}
        current={current}
      />
      <Galvanometer 
        deflection={isBalanced ? 0 : 0.2}
        isBalanced={isBalanced}
      />
      <BatteryBank voltage={6} />
      <EMFCircuit 
        contactPosition={contactPosition}
        current={current}
        isBalanced={isBalanced}
        cellType={cellType}
      />
      <MeasurementDisplay 
        standardLength={standardLength}
        unknownLength={unknownLength}
        standardEMF={standardCellEMF}
        calculatedEMF={calculatedEMF}
        isBalanced={isBalanced}
        cellType={cellType}
      />
      
      {/* Instructions */}
      <Text position={[0, 3.5, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        EMF Measurement: E_unknown = E_standard × (L_unknown / L_standard)
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

export function EMFCellPotentiometerSim({ 
  standardCellEMF: initialStandardCellEMF = 1.018, 
  unknownCellEMF: initialUnknownCellEMF = 1.5, 
  wireLength: initialWireLength = 1
}: Props) {
  const [standardCellEMF] = useState(initialStandardCellEMF)
  const [unknownCellEMF] = useState(initialUnknownCellEMF)
  const [wireLength] = useState(initialWireLength)
  const [contactPosition, setContactPosition] = useState(0.5)
  
  const [trials, setTrials] = useState<Trial[]>([])
  const [isBalanced, setIsBalanced] = useState(false)
  const [current, setCurrent] = useState(0)
  const [cellType, setCellType] = useState<"standard" | "unknown">("standard")
  const [standardLength, setStandardLength] = useState(0)
  const [unknownLength, setUnknownLength] = useState(0)
  
  // Calculate balance lengths
  const currentLength = contactPosition * wireLength * 100 // Convert to cm
  
  // Calculate EMF using potentiometer formula
  const calculateEMF = (unknownLength: number, standardLength: number): number => {
    if (standardLength > 0) {
      return standardCellEMF * (unknownLength / standardLength)
    }
    return 0
  }
  
  const calculatedEMF = calculateEMF(unknownLength, standardLength)
  
  // Simulate balance detection
  const checkBalance = () => {
    // Simulate finding balance point
    const targetLength = cellType === "standard" ? 50.8 : 74.7 // Target balance lengths
    const difference = Math.abs(currentLength - targetLength) / targetLength
    
    setIsBalanced(difference < 0.02) // 2% tolerance
    setCurrent(difference < 0.02 ? 0 : 0.1 * difference)
  }
  
  const recordStandardBalance = () => {
    if (isBalanced && cellType === "standard") {
      setStandardLength(currentLength)
      setCellType("unknown")
      setIsBalanced(false)
      setContactPosition(0.5) // Reset position for unknown cell
    }
  }
  
  const recordUnknownBalance = () => {
    if (isBalanced && cellType === "unknown" && standardLength > 0) {
      setUnknownLength(currentLength)
      const calculated = calculateEMF(currentLength, standardLength)
      const error = Math.abs((calculated - unknownCellEMF) / unknownCellEMF) * 100
      
      setTrials(prev => [...prev, {
        standardEMF: standardCellEMF,
        unknownEMF: calculated,
        standardLength,
        unknownLength: currentLength,
        calculatedEMF: calculated,
        error
      }].slice(-5))
    }
  }
  
  const autoBalance = () => {
    if (cellType === "standard") {
      const targetPosition = 0.508 // 50.8cm
      setContactPosition(targetPosition)
      setIsBalanced(true)
      setCurrent(0)
    } else {
      const targetPosition = 0.747 // 74.7cm
      setContactPosition(targetPosition)
      setIsBalanced(true)
      setCurrent(0)
    }
  }
  
  const reset = () => {
    setContactPosition(0.5)
    setIsBalanced(false)
    setCurrent(0)
    setCellType("standard")
    setStandardLength(0)
    setUnknownLength(0)
  }
  
  useEffect(() => {
    checkBalance()
  }, [contactPosition, cellType])
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Standard EMF: {standardCellEMF.toFixed(3)} V</Badge>
        <Badge variant="outline">Unknown EMF: {unknownCellEMF.toFixed(3)} V</Badge>
        <Badge variant="outline">Current Cell: {cellType === "standard" ? "Standard" : "Unknown"}</Badge>
        <Badge variant="outline">Balance Length: {currentLength.toFixed(1)} cm</Badge>
        <Badge variant={isBalanced ? "default" : "destructive"}>
          {isBalanced ? "Balanced" : "Unbalanced"}
        </Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Measure EMF of unknown cell using potentiometer comparison method.
        First balance with standard cell, then with unknown cell.
        Formula: E_unknown = E_standard × (L_unknown / L_standard)
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Contact Position</div>
          <div className="text-lg font-semibold text-blue-500">{(contactPosition * 100).toFixed(1)}%</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Standard Length</div>
          <div className="text-lg font-semibold text-green-500">{standardLength.toFixed(1)} cm</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Unknown Length</div>
          <div className="text-lg font-semibold text-amber-500">{unknownLength.toFixed(1)} cm</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Calculated EMF</div>
          <div className="text-lg font-semibold text-purple-500">{calculatedEMF.toFixed(3)} V</div>
        </div>
      </div>
      
      {/* Parameter Controls */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Battery className="w-4 h-4" />
          Measurement Controls
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
          onClick={recordStandardBalance}
          disabled={!isBalanced || cellType !== "standard"}
          variant="outline"
          className="gap-2"
        >
          <Battery className="w-4 h-4" />
          Record Standard
        </Button>
        <Button 
          onClick={recordUnknownBalance}
          disabled={!isBalanced || cellType !== "unknown" || standardLength === 0}
          variant="outline"
          className="gap-2"
        >
          <Battery className="w-4 h-4" />
          Record Unknown
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
            <div className="text-muted-foreground">Std EMF (V)</div>
            <div className="text-muted-foreground">Std L (cm)</div>
            <div className="text-muted-foreground">Unk L (cm)</div>
            <div className="text-muted-foreground">Calc EMF (V)</div>
            <div className="text-muted-foreground">Actual EMF (V)</div>
            <div className="text-muted-foreground">Error (%)</div>
            {trials.map((t, i) => (
              <div key={i} className="contents">
                <div>{t.standardEMF.toFixed(3)}</div>
                <div>{t.standardLength.toFixed(1)}</div>
                <div>{t.unknownLength.toFixed(1)}</div>
                <div className="text-green-500">{t.unknownEMF.toFixed(3)}</div>
                <div>{unknownCellEMF.toFixed(3)}</div>
                <div className="text-amber-500">{t.error.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [4, 4, 5], fov: 50 }} shadows>
          <Scene 
            standardCellEMF={standardCellEMF}
            unknownCellEMF={unknownCellEMF}
            contactPosition={contactPosition}
            isBalanced={isBalanced}
            current={current}
            standardLength={standardLength}
            unknownLength={unknownLength}
            calculatedEMF={calculatedEMF}
            cellType={cellType}
          />
        </Canvas>
      </div>
    </div>
  )
}
