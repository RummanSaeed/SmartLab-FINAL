"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Html } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Zap, Gauge } from "lucide-react"
import * as THREE from "three"

type Props = {
  galvanometerResistance: number // Ohms
  fullScaleDeflection: number // Amperes
  targetVoltage: number // Volts
}

type Trial = {
  galvanometerResistance: number
  fullScaleDeflection: number
  seriesResistance: number
  targetVoltage: number
  calculatedVoltage: number
}

// Galvanometer with realistic needle movement
function Galvanometer({ 
  current, 
  fullScaleDeflection,
  isConverted 
}: { 
  current: number; 
  fullScaleDeflection: number;
  isConverted: boolean;
}) {
  const needleRef = useRef<THREE.Mesh>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (needleRef.current) {
      // Animate needle based on current
      const deflectionRatio = Math.min(current / fullScaleDeflection, 1)
      const maxAngle = Math.PI / 3
      const angle = deflectionRatio * maxAngle
      needleRef.current.rotation.z = -Math.PI/2 + angle
    }
    
    if (bodyRef.current && isConverted) {
      // Voltmeter label glow
      const material = bodyRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.2 + Math.sin(Date.now() * 0.002) * 0.1
    }
  })
  
  return (
    <group position={[0, 0.5, 0]}>
      {/* Galvanometer body */}
      <mesh ref={bodyRef} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.15, 32]} />
        <meshStandardMaterial 
          color="#2c3e50"
          metalness={0.3}
          emissive="#3498db"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Galvanometer face */}
      <mesh position={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.35, 0.35, 0.02, 32]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Scale markings */}
      {Array.from({ length: 11 }).map((_, i) => {
        const angle = -Math.PI/3 + (i / 10) * (2 * Math.PI/3)
        const x = Math.sin(angle) * 0.28
        const y = Math.cos(angle) * 0.28
        return (
          <mesh key={i} position={[x, y + 0.08, 0.09]}>
            <boxGeometry args={[0.01, 0.02, 0.001]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        )
      })}
      
      {/* Scale numbers */}
      {Array.from({ length: 5 }).map((_, i) => {
        const angle = -Math.PI/3 + (i / 4) * (2 * Math.PI/3)
        const x = Math.sin(angle) * 0.35
        const y = Math.cos(angle) * 0.35
        const value = isConverted ? (i / 4) * 10 : (i / 4) * 1000 // V or mA scale
        const unit = isConverted ? "V" : "mA"
        return (
          <Text key={i} position={[x, y + 0.08, 0.1]} fontSize={0.04} color="#1e293b" anchorX="center">
            {value.toFixed(0)}{unit}
          </Text>
        )
      })}
      
      {/* Center zero mark */}
      <mesh position={[0, 0.28, 0.09]}>
        <boxGeometry args={[0.02, 0.02, 0.001]} />
        <meshStandardMaterial color="#e74c3c" />
      </mesh>
      
      {/* Needle */}
      <mesh ref={needleRef} position={[0, 0.08, 0.1]} rotation={[0, 0, -Math.PI/2]}>
        <boxGeometry args={[0.01, 0.25, 0.001]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      
      {/* Center pivot */}
      <mesh position={[0, 0.08, 0.1]}>
        <cylinderGeometry args={[0.02, 0.02, 0.01, 16]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      <Text position={[0, -0.2, 0.1]} fontSize={0.05} color="#1e293b" anchorX="center">
        {isConverted ? "VOLTMETER" : "GALVANOMETER"}
      </Text>
      
      <Text position={[0, -0.28, 0.1]} fontSize={0.04} color="#64748b" anchorX="center">
        {isConverted ? "0-10V" : "0-1mA"}
      </Text>
    </group>
  )
}

// Series resistor box
function SeriesResistor({ 
  resistance, 
  isAttached 
}: { 
  resistance: number; 
  isAttached: boolean; 
}) {
  const resistorRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (resistorRef.current && isAttached) {
      // Glow when attached and current flows
      const material = resistorRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.3 + Math.sin(Date.now() * 0.002) * 0.1
    }
  })
  
  return (
    <group position={[-2, 0.5, 0]}>
      {/* Resistor box */}
      <mesh ref={resistorRef} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.3]} />
        <meshStandardMaterial 
          color="#8b4513"
          roughness={0.8}
          emissive="#ff6600"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Resistance value display */}
      <Text position={[0, 0, 0.16]} fontSize={0.06} color="#ffffff" anchorX="center">
        {resistance.toFixed(0)} Ω
      </Text>
      
      {/* Color bands */}
      <mesh position={[-0.3, 0, 0.151]}>
        <boxGeometry args={[0.02, 0.3, 0.02]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      <mesh position={[-0.1, 0, 0.151]}>
        <boxGeometry args={[0.02, 0.3, 0.02]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.1, 0, 0.151]}>
        <boxGeometry args={[0.02, 0.3, 0.02]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* Connection terminals */}
      <mesh position={[-0.45, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      <mesh position={[0.45, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 16]} rotation={[0, Math.PI/2, 0]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} />
      </mesh>
      
      <Text position={[0, -0.35, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        SERIES R
      </Text>
    </group>
  )
}

// Variable power supply
function PowerSupply({ 
  voltage, 
  onChange 
}: { 
  voltage: number; 
  onChange: (v: number) => void; 
}) {
  const knobRef = useRef<THREE.Mesh>(null)
  const displayRef = useRef<THREE.Mesh>(null)
  
  useFrame(() => {
    if (knobRef.current) {
      // Rotate knob based on voltage
      const rotation = (voltage / 10) * Math.PI * 1.5
      knobRef.current.rotation.z = rotation
    }
    
    if (displayRef.current) {
      const material = displayRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.4 + Math.sin(Date.now() * 0.002) * 0.1
    }
  })
  
  return (
    <group position={[2, 0.5, 0]}>
      {/* Power supply body */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.6, 0.4]} />
        <meshStandardMaterial color="#34495e" metalness={0.3} />
      </mesh>
      
      {/* Display */}
      <mesh ref={displayRef} position={[0, 0.1, 0.21]}>
        <boxGeometry args={[0.6, 0.2, 0.02]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          emissive="#ff6b35"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      <Text position={[0, 0.1, 0.22]} fontSize={0.08} color="#ff6b35" anchorX="center">
        {voltage.toFixed(1)}V
      </Text>
      
      {/* Voltage control knob */}
      <mesh 
        ref={knobRef}
        position={[-0.2, -0.15, 0.21]}
        onClick={() => onChange(Math.min(voltage + 0.5, 10))}
      >
        <cylinderGeometry args={[0.06, 0.06, 0.03, 16]} />
        <meshStandardMaterial color="#e74c3c" metalness={0.8} />
      </mesh>
      
      {/* Knob indicator */}
      <mesh position={[-0.2, -0.1, 0.23]}>
        <boxGeometry args={[0.03, 0.01, 0.01]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      
      {/* Terminals */}
      <mesh position={[-0.2, -0.25, 0.21]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
        <meshStandardMaterial color="#ff0000" metalness={1} />
      </mesh>
      <mesh position={[0.2, -0.25, 0.21]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 16]} />
        <meshStandardMaterial color="#000000" metalness={1} />
      </mesh>
      
      <Text position={[0, -0.4, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        POWER SUPPLY
      </Text>
    </group>
  )
}

// Circuit connections with current flow
function ConversionCircuit({ 
  current, 
  isConverted 
}: { 
  current: number; 
  isConverted: boolean; 
}) {
  const wireRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (wireRef.current && current > 0) {
      wireRef.current.children.forEach((wire, index) => {
        if (wire instanceof THREE.Mesh) {
          const material = wire.material as THREE.MeshStandardMaterial
          material.emissiveIntensity = 0.2 + Math.sin(Date.now() * 0.005 + index) * 0.1
        }
      })
    }
  })
  
  return (
    <group ref={wireRef}>
      {/* Top wire */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Bottom wire */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[4, 0.02, 0.02]} />
        <meshStandardMaterial 
          color="#c0c0c0"
          metalness={1}
          emissive="#ffffff"
          emissiveIntensity={0}
        />
      </mesh>
      
      {/* Series resistor connection (only when converted) */}
      {isConverted && (
        <>
          <mesh position={[-1, 0.5, 0]}>
            <boxGeometry args={[1, 0.02, 0.02]} />
            <meshStandardMaterial 
              color="#c0c0c0"
              metalness={1}
              emissive="#ffffff"
              emissiveIntensity={0}
            />
          </mesh>
          <mesh position={[-1, 0.2, 0]}>
            <boxGeometry args={[1, 0.02, 0.02]} />
            <meshStandardMaterial 
              color="#c0c0c0"
              metalness={1}
              emissive="#ffffff"
              emissiveIntensity={0}
            />
          </mesh>
        </>
      )}
    </group>
  )
}

// Calculation display
function CalculationDisplay({ 
  galvanometerResistance,
  fullScaleDeflection,
  seriesResistance,
  targetVoltage,
  isConverted
}: {
  galvanometerResistance: number;
  fullScaleDeflection: number;
  seriesResistance: number;
  targetVoltage: number;
  isConverted: boolean;
}) {
  const calculatedVoltage = fullScaleDeflection * (galvanometerResistance + seriesResistance)
  
  return (
    <group position={[0, 2.5, 0]}>
      <mesh castShadow>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[1.8, 1]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      <Text position={[0, 0.3, 0.07]} fontSize={0.06} color="#00ff00" anchorX="center">
        {isConverted ? "CONVERTED" : "GALVANOMETER"}
      </Text>
      
      <Text position={[-0.6, 0.1, 0.07]} fontSize={0.04} color="#ffffff" anchorX="left">
        R_g = {galvanometerResistance}Ω
      </Text>
      <Text position={[-0.6, 0, 0.07]} fontSize={0.04} color="#ffffff" anchorX="left">
        I_fs = {(fullScaleDeflection * 1000).toFixed(1)}mA
      </Text>
      <Text position={[-0.6, -0.1, 0.07]} fontSize={0.04} color="#ffffff" anchorX="left">
        R_s = {seriesResistance.toFixed(0)}Ω
      </Text>
      
      <Text position={[0.6, 0.1, 0.07]} fontSize={0.04} color="#ffff00" anchorX="right">
        V_target = {targetVoltage}V
      </Text>
      <Text position={[0.6, 0, 0.07]} fontSize={0.04} color="#ffff00" anchorX="right">
        V_actual = {calculatedVoltage.toFixed(2)}V
      </Text>
      <Text position={[0.6, -0.1, 0.07]} fontSize={0.04} color="#ffff00" anchorX="right">
        Error = {Math.abs((calculatedVoltage - targetVoltage) / targetVoltage * 100).toFixed(1)}%
      </Text>
      
      <Text position={[0, -0.3, 0.07]} fontSize={0.05} color="#ffa500" anchorX="center">
        R_s = (V_target/I_fs) - R_g
      </Text>
      
      <Text position={[0, -0.5, 0]} fontSize={0.04} color="#64748b" anchorX="center">
        CONVERSION CALCULATOR
      </Text>
    </group>
  )
}

function Scene({ 
  galvanometerResistance,
  fullScaleDeflection,
  seriesResistance,
  voltage,
  current,
  targetVoltage,
  isConverted
}: {
  galvanometerResistance: number;
  fullScaleDeflection: number;
  seriesResistance: number;
  voltage: number;
  current: number;
  targetVoltage: number;
  isConverted: boolean;
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
      
      <Galvanometer 
        current={current}
        fullScaleDeflection={fullScaleDeflection}
        isConverted={isConverted}
      />
      <SeriesResistor 
        resistance={seriesResistance}
        isAttached={isConverted}
      />
      <PowerSupply 
        voltage={voltage}
        onChange={() => {}}
      />
      <ConversionCircuit 
        current={current}
        isConverted={isConverted}
      />
      <CalculationDisplay 
        galvanometerResistance={galvanometerResistance}
        fullScaleDeflection={fullScaleDeflection}
        seriesResistance={seriesResistance}
        targetVoltage={targetVoltage}
        isConverted={isConverted}
      />
      
      {/* Instructions */}
      <Text position={[0, 3.5, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
        Galvanometer → Voltmeter: R_s = (V_target/I_fs) - R_g
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

export function GalvanometerVoltmeterSim({ 
  galvanometerResistance: initialGalvanometerResistance = 50, 
  fullScaleDeflection: initialFullScaleDeflection = 0.001, 
  targetVoltage: initialTargetVoltage = 10
}: Props) {
  const [galvanometerResistance] = useState(initialGalvanometerResistance)
  const [fullScaleDeflection] = useState(initialFullScaleDeflection)
  const [targetVoltage] = useState(initialTargetVoltage)
  const [voltage, setVoltage] = useState(0)
  
  const [trials, setTrials] = useState<Trial[]>([])
  const [isConverted, setIsConverted] = useState(false)
  const [seriesResistance, setSeriesResistance] = useState(0)
  
  // Calculate required series resistance
  const calculateSeriesResistance = (): number => {
    return (targetVoltage / fullScaleDeflection) - galvanometerResistance
  }
  
  // Calculate circuit current
  const totalResistance = isConverted ? galvanometerResistance + seriesResistance : galvanometerResistance
  const current = voltage / totalResistance
  
  const convertToVoltmeter = () => {
    const requiredResistance = calculateSeriesResistance()
    setSeriesResistance(requiredResistance)
    setIsConverted(true)
    
    // Record the conversion
    const calculatedVoltage = fullScaleDeflection * (galvanometerResistance + requiredResistance)
    setTrials(prev => [...prev, {
      galvanometerResistance,
      fullScaleDeflection,
      seriesResistance: requiredResistance,
      targetVoltage,
      calculatedVoltage
    }].slice(-5))
  }
  
  const resetToGalvanometer = () => {
    setIsConverted(false)
    setSeriesResistance(0)
    setVoltage(0)
  }
  
  const testVoltmeter = () => {
    if (isConverted) {
      setVoltage(targetVoltage) // Test at full scale
    }
  }
  
  return (
    <div className="h-full flex flex-col gap-4 overflow-auto pr-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">R_g: {galvanometerResistance} Ω</Badge>
        <Badge variant="outline">I_fs: {(fullScaleDeflection * 1000).toFixed(1)} mA</Badge>
        <Badge variant="outline">Target V: {targetVoltage} V</Badge>
        <Badge variant="outline">Series R: {seriesResistance.toFixed(0)} Ω</Badge>
        <Badge variant={isConverted ? "default" : "secondary"}>
          {isConverted ? "Voltmeter" : "Galvanometer"}
        </Badge>
      </div>
      
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        Convert galvanometer to voltmeter by adding series resistance.
        Required series resistance: R_s = (V_target/I_fs) - R_g
        Test the converted voltmeter and verify accuracy.
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Applied Voltage</div>
          <div className="text-lg font-semibold text-blue-500">{voltage.toFixed(2)} V</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Current</div>
          <div className="text-lg font-semibold text-green-500">{(current * 1000).toFixed(3)} mA</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Total Resistance</div>
          <div className="text-lg font-semibold text-amber-500">{totalResistance.toFixed(0)} Ω</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Deflection</div>
          <div className="text-lg font-semibold text-purple-500">{((current / fullScaleDeflection) * 100).toFixed(1)}%</div>
        </div>
      </div>
      
      {/* Parameter Controls */}
      <div className="space-y-4 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Gauge className="w-4 h-4" />
          Conversion Controls
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Applied Voltage</span>
              <span className="font-medium">{voltage.toFixed(2)} V</span>
            </div>
            <input
              type="range"
              min="0"
              max={targetVoltage}
              step="0.1"
              value={voltage}
              onChange={(e) => setVoltage(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs font-medium mb-2">Required Series Resistance:</div>
            <div className="text-lg font-semibold text-green-500">
              {calculateSeriesResistance().toFixed(0)} Ω
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              R_s = ({targetVoltage}V / {fullScaleDeflection * 1000}mA) - {galvanometerResistance}Ω
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={convertToVoltmeter}
          disabled={isConverted}
          className="gap-2"
        >
          <Play className="w-4 h-4" />
          Convert to Voltmeter
        </Button>
        <Button 
          onClick={testVoltmeter}
          disabled={!isConverted}
          variant="outline"
          className="gap-2"
        >
          <Gauge className="w-4 h-4" />
          Test Full Scale
        </Button>
        <Button 
          onClick={resetToGalvanometer}
          variant="outline"
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Galvanometer
        </Button>
      </div>
      
      {/* Trials */}
      {trials.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs font-medium mb-2">Conversion History:</div>
          <div className="grid grid-cols-5 gap-2 text-xs">
            <div className="text-muted-foreground">R_g (Ω)</div>
            <div className="text-muted-foreground">I_fs (mA)</div>
            <div className="text-muted-foreground">R_s (Ω)</div>
            <div className="text-muted-foreground">V_target (V)</div>
            <div className="text-muted-foreground">V_actual (V)</div>
            {trials.map((t, i) => (
              <div key={i} className="contents">
                <div>{t.galvanometerResistance}</div>
                <div>{(t.fullScaleDeflection * 1000).toFixed(1)}</div>
                <div>{t.seriesResistance.toFixed(0)}</div>
                <div>{t.targetVoltage}</div>
                <div className="text-green-500">{t.calculatedVoltage.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [4, 4, 5], fov: 50 }} shadows>
          <Scene 
            galvanometerResistance={galvanometerResistance}
            fullScaleDeflection={fullScaleDeflection}
            seriesResistance={seriesResistance}
            voltage={voltage}
            current={current}
            targetVoltage={targetVoltage}
            isConverted={isConverted}
          />
        </Canvas>
      </div>
    </div>
  )
}
