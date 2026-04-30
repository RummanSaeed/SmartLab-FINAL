"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Beaker, AlertTriangle } from "lucide-react"
import * as THREE from "three"

interface Props {
  initialConcentration?: number
}

// Saturated NaCl solution with precipitate
function SaturatedSolution({ 
  precipitateLevel, 
  isBubbling,
  shiftDirection
}: { 
  precipitateLevel: number
  isBubbling: boolean
  shiftDirection: 'none' | 'forward' | 'reverse'
}) {
  const bubblesRef = useRef<THREE.Group>(null)
  
  useFrame(({ clock }) => {
    if (bubblesRef.current && isBubbling) {
      const time = clock.getElapsedTime()
      bubblesRef.current.children.forEach((bubble, i) => {
        const y = ((time * 2 + i * 0.5) % 2) * 1.5 - 0.5
        bubble.position.y = y
        bubble.scale.setScalar(1 + Math.sin(time * 3 + i) * 0.2)
      })
    }
  })

  return (
    <group position={[0, 0.6, 0]}>
      {/* Flask */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.4, 1.2, 32, 1, true]} />
        <meshPhysicalMaterial
          color="white"
          transparent
          opacity={0.25}
          roughness={0.1}
          transmission={0.9}
        />
      </mesh>
      {/* Flask bottom */}
      <mesh position={[0, -0.6, 0]}>
        <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="white" transparent opacity={0.3} />
      </mesh>
      {/* Solution */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.47, 0.37, 0.8, 32]} />
        <meshPhysicalMaterial 
          color={shiftDirection === 'reverse' ? "#e8f4f8" : "#f0f8ff"}
          transparent 
          opacity={0.5} 
          roughness={0.2} 
        />
      </mesh>
      {/* NaCl precipitate at bottom */}
      <mesh position={[0, -0.5 + precipitateLevel * 0.1, 0]}>
        <cylinderGeometry args={[0.35, 0.35, precipitateLevel * 0.2, 32]} />
        <meshStandardMaterial 
          color="#f5f5dc" 
          roughness={0.7}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* HCl bubbles */}
      <group ref={bubblesRef} visible={isBubbling}>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[Math.sin(i) * 0.2, -0.5 + i * 0.3, Math.cos(i) * 0.2]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#fff" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
      {/* Equilibrium equation */}
      <Text position={[0, 0.8, 0]} fontSize={0.07} color="#333" anchorX="center">
        NaCl(s) ⇌ Na⁺(aq) + Cl⁻(aq)
      </Text>
    </group>
  )
}

// HCl delivery tube
function HClDelivery({ isDelivering }: { isDelivering: boolean }) {
  return (
    <group position={[0, 2, 0]}>
      {/* Delivery tube */}
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 1.5, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Thistle funnel / generator */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.15, 0.1, 0.4, 16]} />
        <meshPhysicalMaterial color="white" transparent opacity={0.5} />
      </mesh>
      {/* HCl label */}
      <Text position={[0.3, 1, 0]} fontSize={0.06} color="#ff0000" anchorX="left">
        HCl (Cl⁻ source)
      </Text>
      {/* Flow indicator */}
      {isDelivering && (
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
          <meshStandardMaterial color="#ffff00" transparent opacity={0.8} emissive="#ffff00" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  )
}

// Ion concentration display
function IonDisplay({ naConcentration, clConcentration }: { naConcentration: number; clConcentration: number }) {
  return (
    <group position={[-1.5, 1.5, 0]}>
      <mesh>
        <boxGeometry args={[0.8, 1, 0.05]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      <Text position={[0, 0.35, 0.03]} fontSize={0.08} color="#333" anchorX="center">
        Ion Concentrations
      </Text>
      {/* Na+ */}
      <Text position={[-0.2, 0.15, 0.03]} fontSize={0.06} color="#4169E1" anchorX="center">
        Na⁺
      </Text>
      <Text position={[0.2, 0.15, 0.03]} fontSize={0.06} color="#333" anchorX="center">
        {naConcentration.toFixed(2)} M
      </Text>
      {/* Cl- */}
      <Text position={[-0.2, 0, 0.03]} fontSize={0.06} color="#228B22" anchorX="center">
        Cl⁻
      </Text>
      <Text position={[0.2, 0, 0.03]} fontSize={0.06} color="#333" anchorX="center">
        {clConcentration.toFixed(2)} M
      </Text>
      {/* Arrow */}
      <Text position={[0, -0.2, 0.03]} fontSize={0.07} color={clConcentration > naConcentration ? "#ff0000" : "#333"} anchorX="center">
        {clConcentration > naConcentration ? "→ Shift Left" : "Equilibrium"}
      </Text>
    </group>
  )
}

function Scene({ 
  precipitateLevel, 
  isBubbling,
  naConcentration,
  clConcentration,
  shiftDirection
}: { 
  precipitateLevel: number
  isBubbling: boolean
  naConcentration: number
  clConcentration: number
  shiftDirection: 'none' | 'forward' | 'reverse'
}) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1} />
      <pointLight position={[-2, 4, 2]} intensity={0.5} />
      
      {/* Lab table */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[6, 0.2, 3]} />
        <meshStandardMaterial color="#deb887" roughness={0.8} />
      </mesh>
      
      <SaturatedSolution 
        precipitateLevel={precipitateLevel}
        isBubbling={isBubbling}
        shiftDirection={shiftDirection}
      />
      <HClDelivery isDelivering={isBubbling} />
      <IonDisplay naConcentration={naConcentration} clConcentration={clConcentration} />
      
      <OrbitControls enablePan={false} minDistance={3} maxDistance={8} target={[0, 1, 0]} />
    </>
  )
}

export function CommonIonEffectSim({ initialConcentration = 6.1 }: Props) {
  const [isRunning, setIsRunning] = useState(false)
  const [step, setStep] = useState<'initial' | 'adding' | 'shifted'>('initial')
  const [precipitateLevel, setPrecipitateLevel] = useState(0.3)
  const [naConcentration, setNaConcentration] = useState(initialConcentration)
  const [clConcentration, setClConcentration] = useState(initialConcentration)
  const [shiftDirection, setShiftDirection] = useState<'none' | 'forward' | 'reverse'>('none')

  const startExperiment = () => {
    setIsRunning(true)
    setStep('adding')
    setShiftDirection('none')
    
    // Simulate adding HCl
    setTimeout(() => {
      setClConcentration(prev => prev + 2)
      setShiftDirection('reverse')
      
      // Precipitate increases as equilibrium shifts left
      setPrecipitateLevel(prev => Math.min(prev + 0.3, 0.8))
      
      setTimeout(() => {
        setIsRunning(false)
        setStep('shifted')
      }, 3000)
    }, 2000)
  }

  const reset = () => {
    setIsRunning(false)
    setStep('initial')
    setPrecipitateLevel(0.3)
    setNaConcentration(initialConcentration)
    setClConcentration(initialConcentration)
    setShiftDirection('none')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Class 11</Badge>
          <Badge variant="outline" className="bg-orange-500/10 text-orange-500">Equilibrium</Badge>
        </div>
        <div className="text-xs text-muted-foreground">Common Ion Effect</div>
      </div>

      {/* Theory */}
      <div className="text-xs bg-muted/50 p-2 rounded">
        <strong>Le Chatelier's Principle:</strong> Adding Cl⁻ from HCl shifts equilibrium left, 
        causing more NaCl to precipitate from saturated solution.
      </div>

      {/* Step indicators */}
      <div className="flex gap-2">
        {['Saturated NaCl', 'Add HCl', 'More Precipitate'].map((s, i) => {
          const steps = ['initial', 'adding', 'shifted']
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
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Beaker className="w-3 h-3" /> Na⁺ Conc.
          </div>
          <div className="text-lg font-semibold text-blue-500">{naConcentration.toFixed(2)} M</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Cl⁻ Conc.
          </div>
          <div className={`text-lg font-semibold ${clConcentration > naConcentration ? 'text-red-500' : 'text-green-500'}`}>
            {clConcentration.toFixed(2)} M
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Precipitate</div>
          <div className="text-lg font-semibold text-amber-500">{(precipitateLevel * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [3, 2, 4], fov: 50 }} shadows>
          <Scene 
            precipitateLevel={precipitateLevel}
            isBubbling={isRunning}
            naConcentration={naConcentration}
            clConcentration={clConcentration}
            shiftDirection={shiftDirection}
          />
        </Canvas>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={startExperiment} disabled={isRunning} className="gap-2">
          <Play className="w-4 h-4" />
          {isRunning ? 'Adding HCl...' : step === 'shifted' ? 'Added HCl ✓' : 'Bubble HCl Gas'}
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {step === 'shifted' && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <div className="text-sm font-medium text-green-500 mb-2">Result:</div>
          <div className="text-xs text-muted-foreground">
            Adding HCl increased [Cl⁻], shifting equilibrium left (NaCl(s) formation). 
            More solid NaCl precipitated from solution, demonstrating the common ion effect.
          </div>
        </div>
      )}
    </div>
  )
}
