"use client"

import { useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Plus, Minus, Droplet } from "lucide-react"
import * as THREE from "three"

interface Props {
  initialConcentration?: number
}

// Chromate-Dichromate equilibrium
function EquilibriumFlask({ 
  cr2o7Ratio,
  cro4Ratio,
  ph,
  isAddingAcid,
  isAddingBase
}: { 
  cr2o7Ratio: number
  cro4Ratio: number
  ph: number
  isAddingAcid: boolean
  isAddingBase: boolean
}) {
  const acidStreamRef = useRef<THREE.Mesh>(null)
  const baseStreamRef = useRef<THREE.Mesh>(null)
  
  useFrame(({ clock }) => {
    if (acidStreamRef.current && isAddingAcid) {
      acidStreamRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 10) * 0.3
    }
    if (baseStreamRef.current && isAddingBase) {
      baseStreamRef.current.scale.y = 1 + Math.sin(clock.getElapsedTime() * 10) * 0.3
    }
  })

  // Color interpolation: Yellow (CrO4) to Orange (Cr2O7)
  const r = Math.round(255 * cro4Ratio + 255 * cr2o7Ratio)
  const g = Math.round(255 * cro4Ratio + 140 * cr2o7Ratio)
  const b = Math.round(0 * cro4Ratio + 0 * cr2o7Ratio)
  const color = `rgb(${r}, ${g}, ${b})`

  return (
    <group position={[0, 1, 0]}>
      {/* Flask */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.3, 1, 32, 1, true]} />
        <meshPhysicalMaterial
          color="white"
          transparent
          opacity={0.2}
          roughness={0.1}
          transmission={0.9}
        />
      </mesh>
      {/* Solution with dynamic color */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.37, 0.27, 0.7, 32]} />
        <meshStandardMaterial 
          color={color}
          roughness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Flask bottom */}
      <mesh position={[0, -0.5, 0]}>
        <sphereGeometry args={[0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="white" transparent opacity={0.3} />
      </mesh>
      {/* pH indicator */}
      <Text position={[0.6, 0.3, 0]} fontSize={0.08} color="#333" anchorX="left">
        pH = {ph.toFixed(1)}
      </Text>
      {/* Acid stream */}
      <mesh ref={acidStreamRef} position={[-0.2, 1.2, 0]} visible={isAddingAcid}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial color="#ffff00" transparent opacity={0.7} />
      </mesh>
      {/* Base stream */}
      <mesh ref={baseStreamRef} position={[0.2, 1.2, 0]} visible={isAddingBase}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial color="#00ffff" transparent opacity={0.7} />
      </mesh>
      {/* Equilibrium equation */}
      <Text position={[0, 0.7, 0]} fontSize={0.07} color="#333" anchorX="center">
        2CrO₄²⁻(yellow) + 2H⁺ ⇌ Cr₂O₇²⁻(orange) + H₂O
      </Text>
    </group>
  )
}

// Burettes for acid and base
function Burettes({ isAddingAcid, isAddingBase }: { isAddingAcid: boolean; isAddingBase: boolean }) {
  return (
    <>
      {/* Acid burette (HCl) */}
      <group position={[-0.8, 2.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.02, 1, 16]} />
          <meshPhysicalMaterial color="white" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <coneGeometry args={[0.02, 0.06, 16]} />
          <meshPhysicalMaterial color="white" transparent opacity={0.5} />
        </mesh>
        {/* Label */}
        <Text position={[0.15, 0.3, 0]} fontSize={0.05} color="#ff0000" anchorX="left">
          HCl (Acid)
        </Text>
        {/* Flow */}
        {isAddingAcid && (
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.3} />
          </mesh>
        )}
      </group>
      
      {/* Base burette (NaOH) */}
      <group position={[0.8, 2.5, 0]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.02, 1, 16]} />
          <meshPhysicalMaterial color="white" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0, -0.55, 0]}>
          <coneGeometry args={[0.02, 0.06, 16]} />
          <meshPhysicalMaterial color="white" transparent opacity={0.5} />
        </mesh>
        {/* Label */}
        <Text position={[0.15, 0.3, 0]} fontSize={0.05} color="#0000ff" anchorX="left">
          NaOH (Base)
        </Text>
        {/* Flow */}
        {isAddingBase && (
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
            <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.3} />
          </mesh>
        )}
      </group>
    </>
  )
}

// Color indicator display
function ColorIndicator({ cro4Ratio, cr2o7Ratio }: { cro4Ratio: number; cr2o7Ratio: number }) {
  return (
    <group position={[-1.5, 1.5, 0]}>
      <mesh>
        <boxGeometry args={[0.8, 1.2, 0.05]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      <Text position={[0, 0.5, 0.03]} fontSize={0.07} color="#333" anchorX="center">
        Equilibrium
      </Text>
      {/* CrO4²⁻ */}
      <mesh position={[-0.2, 0.25, 0.03]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      <Text position={[0.15, 0.25, 0.03]} fontSize={0.05} color="#333" anchorX="left">
        CrO₄²⁻: {(cro4Ratio * 100).toFixed(0)}%
      </Text>
      {/* Cr2O7²⁻ */}
      <mesh position={[-0.2, 0.05, 0.03]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#FF8C00" />
      </mesh>
      <Text position={[0.15, 0.05, 0.03]} fontSize={0.05} color="#333" anchorX="left">
        Cr₂O₇²⁻: {(cr2o7Ratio * 100).toFixed(0)}%
      </Text>
      {/* Shift arrow */}
      <Text position={[0, -0.2, 0.03]} fontSize={0.06} color={cr2o7Ratio > 0.5 ? "#FF8C00" : "#FFD700"} anchorX="center">
        {cr2o7Ratio > 0.5 ? "→ Right (Acid)" : cro4Ratio > 0.5 ? "← Left (Base)" : "⇌ Balance"}
      </Text>
    </group>
  )
}

function Scene({ 
  cr2o7Ratio,
  cro4Ratio,
  ph,
  isAddingAcid,
  isAddingBase
}: { 
  cr2o7Ratio: number
  cro4Ratio: number
  ph: number
  isAddingAcid: boolean
  isAddingBase: boolean
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
      
      <EquilibriumFlask 
        cr2o7Ratio={cr2o7Ratio}
        cro4Ratio={cro4Ratio}
        ph={ph}
        isAddingAcid={isAddingAcid}
        isAddingBase={isAddingBase}
      />
      <Burettes isAddingAcid={isAddingAcid} isAddingBase={isAddingBase} />
      <ColorIndicator cro4Ratio={cro4Ratio} cr2o7Ratio={cr2o7Ratio} />
      
      <OrbitControls enablePan={false} minDistance={3} maxDistance={8} target={[0, 1, 0]} />
    </>
  )
}

export function LeChatelierSim({ initialConcentration = 0.1 }: Props) {
  const [ph, setPh] = useState(7)
  const [cro4Ratio, setCro4Ratio] = useState(0.5)
  const [cr2o7Ratio, setCr2o7Ratio] = useState(0.5)
  const [isAddingAcid, setIsAddingAcid] = useState(false)
  const [isAddingBase, setIsAddingBase] = useState(false)

  const addAcid = () => {
    setIsAddingAcid(true)
    setTimeout(() => {
      setPh(prev => Math.max(2, prev - 2))
      setCr2o7Ratio(prev => Math.min(0.9, prev + 0.3))
      setCro4Ratio(prev => Math.max(0.1, prev - 0.3))
      setTimeout(() => setIsAddingAcid(false), 500)
    }, 1000)
  }

  const addBase = () => {
    setIsAddingBase(true)
    setTimeout(() => {
      setPh(prev => Math.min(10, prev + 2))
      setCr2o7Ratio(prev => Math.max(0.1, prev - 0.3))
      setCro4Ratio(prev => Math.min(0.9, prev + 0.3))
      setTimeout(() => setIsAddingBase(false), 500)
    }, 1000)
  }

  const reset = () => {
    setPh(7)
    setCro4Ratio(0.5)
    setCr2o7Ratio(0.5)
    setIsAddingAcid(false)
    setIsAddingBase(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Class 11</Badge>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500">Equilibrium</Badge>
        </div>
        <div className="text-xs text-muted-foreground">Le Chatelier - Concentration</div>
      </div>

      {/* Theory */}
      <div className="text-xs bg-muted/50 p-2 rounded">
        <strong>Le Chatelier's Principle:</strong> Increasing [H⁺] shifts equilibrium toward 
        orange Cr₂O₇²⁻. Adding OH⁻ (base) removes H⁺, shifting back to yellow CrO₄²⁻.
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Droplet className="w-3 h-3" /> pH
          </div>
          <div className={`text-lg font-semibold ${ph < 5 ? 'text-red-500' : ph > 8 ? 'text-blue-500' : 'text-green-500'}`}>
            {ph.toFixed(1)}
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Yellow (CrO₄²⁻)</div>
          <div className="text-lg font-semibold" style={{ color: '#FFD700' }}>
            {(cro4Ratio * 100).toFixed(0)}%
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Orange (Cr₂O₇²⁻)</div>
          <div className="text-lg font-semibold" style={{ color: '#FF8C00' }}>
            {(cr2o7Ratio * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }} shadows>
          <Scene 
            cr2o7Ratio={cr2o7Ratio}
            cro4Ratio={cro4Ratio}
            ph={ph}
            isAddingAcid={isAddingAcid}
            isAddingBase={isAddingBase}
          />
        </Canvas>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={addAcid} 
          disabled={isAddingAcid || isAddingBase || ph <= 2} 
          className="gap-2 bg-red-500 hover:bg-red-600"
        >
          <Plus className="w-4 h-4" />
          {isAddingAcid ? 'Adding Acid...' : 'Add Acid (H⁺)'}
        </Button>
        <Button 
          onClick={addBase} 
          disabled={isAddingAcid || isAddingBase || ph >= 10} 
          className="gap-2 bg-blue-500 hover:bg-blue-600"
        >
          <Minus className="w-4 h-4" />
          {isAddingBase ? 'Adding Base...' : 'Add Base (OH⁻)'}
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="text-sm font-medium text-amber-500 mb-2">Color Change Demonstration:</div>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• <span className="text-yellow-500 font-medium">Yellow</span>: CrO₄²⁻ dominates (basic pH)</div>
          <div>• <span className="text-orange-500 font-medium">Orange</span>: Cr₂O₇²⁻ dominates (acidic pH)</div>
          <div>• Adding acid shifts equilibrium RIGHT (→ orange)</div>
          <div>• Adding base shifts equilibrium LEFT (← yellow)</div>
        </div>
      </div>
    </div>
  )
}
