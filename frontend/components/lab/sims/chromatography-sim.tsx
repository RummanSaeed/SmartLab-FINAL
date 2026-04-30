"use client"

import { useMemo, useState, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, RotateCcw, Droplets, Ruler } from "lucide-react"
import * as THREE from "three"

interface Props {
  sampleType?: 'inks' | 'ions'
}

// Paper strip with solvent front
function ChromatographyPaper({ 
  solventHeight, 
  spots,
  isRunning 
}: { 
  solventHeight: number
  spots: Array<{ color: string; rf: number; height: number }>
  isRunning: boolean
}) {
  return (
    <group position={[0, 1, 0]}>
      {/* Paper strip */}
      <mesh>
        <boxGeometry args={[0.15, 2.5, 0.01]} />
        <meshStandardMaterial color="#fffef0" roughness={0.8} />
      </mesh>
      
      {/* Baseline */}
      <mesh position={[0, -0.8, 0.006]}>
        <boxGeometry args={[0.16, 0.005, 0.002]} />
        <meshBasicMaterial color="#333" />
      </mesh>
      
      {/* Sample spots */}
      {spots.map((spot, i) => (
        <group key={i}>
          {/* Original spot at baseline */}
          <mesh position={[0, -0.8, 0.01]}>
            <cylinderGeometry args={[0.03, 0.03, 0.008, 16]} />
            <meshStandardMaterial color={spot.color} />
          </mesh>
          {/* Separated spot moving up */}
          <mesh 
            position={[0, -0.8 + (isRunning ? spot.height : 0), 0.008]}
            visible={isRunning}
          >
            <cylinderGeometry args={[0.025, 0.025, 0.006, 16]} />
            <meshStandardMaterial color={spot.color} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
      
      {/* Solvent front */}
      <mesh position={[0, -1.2 + solventHeight, 0]} visible={solventHeight > 0}>
        <boxGeometry args={[0.14, 0.02, 0.008]} />
        <meshStandardMaterial color="#aaddff" transparent opacity={0.5} />
      </mesh>
      
      {/* Rf measurement marks */}
      {isRunning && spots.map((spot, i) => spot.height > 0.1 && (
        <group key={`mark-${i}`}>
          <mesh position={[0.12, -0.8 + spot.height, 0.01]}>
            <boxGeometry args={[0.05, 0.002, 0.002]} />
            <meshBasicMaterial color={spot.color} />
          </mesh>
          <Text 
            position={[0.25, -0.8 + spot.height, 0]} 
            fontSize={0.05} 
            color="#333"
            anchorX="left"
          >
            Rf = {spot.rf.toFixed(2)}
          </Text>
        </group>
      ))}
    </group>
  )
}

// Chromatography jar/beaker
function ChromatographyJar({ solventLevel }: { solventLevel: number }) {
  return (
    <group position={[0, 0.3, 0]}>
      {/* Glass jar */}
      <mesh>
        <cylinderGeometry args={[0.6, 0.55, 1.2, 32, 1, true]} />
        <meshPhysicalMaterial
          color="white"
          transparent
          opacity={0.2}
          roughness={0.1}
          transmission={0.9}
        />
      </mesh>
      {/* Jar bottom */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.02, 32]} />
        <meshPhysicalMaterial color="white" transparent opacity={0.3} />
      </mesh>
      {/* Solvent */}
      <mesh position={[0, -0.6 + solventLevel / 2, 0]}>
        <cylinderGeometry args={[0.53, 0.5, solventLevel, 32]} />
        <meshPhysicalMaterial color="#add8e6" transparent opacity={0.4} roughness={0.2} />
      </mesh>
      {/* Lid */}
      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[0.62, 0.62, 0.04, 32]} />
        <meshStandardMaterial color="#333" metalness={0.5} />
      </mesh>
    </group>
  )
}

// Sample droppers
function Droppers({ sampleType }: { sampleType: 'inks' | 'ions' }) {
  const samples = sampleType === 'inks' 
    ? ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF']
    : ['#4169E1', '#228B22', '#FF4500', '#9932CC']
  
  return (
    <group position={[1.2, 0.8, 0]}>
      {samples.map((color, i) => (
        <group key={i} position={[i * 0.25 - 0.5, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.02, 0.4, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, -0.22, 0]}>
            <coneGeometry args={[0.02, 0.04, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// Rf calculation display
function RfDisplay({ spots }: { spots: Array<{ color: string; rf: number }> }) {
  return (
    <group position={[-1.5, 1.5, 0]}>
      <mesh>
        <boxGeometry args={[0.8, 1.2, 0.05]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      <Text position={[0, 0.5, 0.03]} fontSize={0.08} color="#333" anchorX="center">
        Rf Values
      </Text>
      {spots.map((spot, i) => (
        <Text 
          key={i}
          position={[0, 0.3 - i * 0.15, 0.03]} 
          fontSize={0.06} 
          color={spot.color}
          anchorX="center"
        >
          Spot {i + 1}: {spot.rf.toFixed(2)}
        </Text>
      ))}
    </group>
  )
}

function Scene({ 
  solventHeight, 
  spots, 
  isRunning,
  sampleType 
}: { 
  solventHeight: number
  spots: Array<{ color: string; rf: number; height: number }>
  isRunning: boolean
  sampleType: 'inks' | 'ions'
}) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1} />
      
      {/* Lab table */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[6, 0.2, 3]} />
        <meshStandardMaterial color="#deb887" roughness={0.8} />
      </mesh>
      
      <ChromatographyJar solventLevel={0.4} />
      <ChromatographyPaper 
        solventHeight={solventHeight} 
        spots={spots}
        isRunning={isRunning}
      />
      <Droppers sampleType={sampleType} />
      <RfDisplay spots={spots} />
      
      {/* Labels */}
      <Text position={[0, 2.5, 0]} fontSize={0.1} color="#333" anchorX="center">
        Paper Chromatography: {sampleType === 'inks' ? 'Ink Separation' : 'Pb²⁺/Cd²⁺ Identification'}
      </Text>
      
      <OrbitControls enablePan={false} minDistance={3} maxDistance={8} target={[0, 1, 0]} />
    </>
  )
}

export function ChromatographySim({ sampleType = 'inks' }: Props) {
  const [isRunning, setIsRunning] = useState(false)
  const [solventHeight, setSolventHeight] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Define spots based on sample type
  const inkSpots = [
    { color: '#FF0000', rf: 0.45, height: 0 },
    { color: '#00FF00', rf: 0.65, height: 0 },
    { color: '#0000FF', rf: 0.35, height: 0 },
    { color: '#FFFF00', rf: 0.75, height: 0 },
  ]

  const ionSpots = [
    { color: '#8B4513', rf: 0.52, height: 0, name: 'Pb²⁺' },
    { color: '#FFD700', rf: 0.38, height: 0, name: 'Cd²⁺' },
  ]

  const spots = sampleType === 'inks' ? inkSpots : ionSpots
  const [currentSpots, setCurrentSpots] = useState(spots)

  const startExperiment = () => {
    setIsRunning(true)
    let time = 0
    const maxHeight = 1.6
    
    const interval = setInterval(() => {
      time += 0.05
      setElapsedTime(time)
      
      // Solvent front rises
      const newHeight = Math.min(time * 0.08, maxHeight)
      setSolventHeight(newHeight)
      
      // Spots separate and move
      setCurrentSpots(spots.map(spot => ({
        ...spot,
        height: Math.min(newHeight * spot.rf, maxHeight * spot.rf)
      })))
      
      if (time >= 20) {
        clearInterval(interval)
        setIsRunning(false)
      }
    }, 50)
  }

  const reset = () => {
    setIsRunning(false)
    setSolventHeight(0)
    setElapsedTime(0)
    setCurrentSpots(spots.map(s => ({ ...s, height: 0 })))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Class 11</Badge>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500">Chromatography</Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {sampleType === 'inks' ? 'Ink Separation' : 'Heavy Metal Ions'}
        </div>
      </div>

      {/* Formula */}
      <div className="text-xs bg-muted/50 p-2 rounded text-center">
        <strong>Rf = Distance traveled by solute / Distance traveled by solvent</strong>
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Droplets className="w-3 h-3" /> Solvent Height
          </div>
          <div className="text-lg font-semibold text-blue-400">{(solventHeight * 10).toFixed(1)} cm</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Ruler className="w-3 h-3" /> Time
          </div>
          <div className="text-lg font-semibold text-amber-500">{elapsedTime.toFixed(1)} min</div>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="text-xs text-muted-foreground">Status</div>
          <div className="text-lg font-semibold text-green-500">
            {isRunning ? 'Running' : solventHeight > 0 ? 'Complete' : 'Ready'}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden h-[400px]">
        <Canvas camera={{ position: [3, 2, 4], fov: 50 }} shadows>
          <Scene 
            solventHeight={solventHeight}
            spots={currentSpots}
            isRunning={isRunning}
            sampleType={sampleType}
          />
        </Canvas>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={startExperiment} disabled={isRunning} className="gap-2">
          <Play className="w-4 h-4" />
          {isRunning ? 'Developing...' : 'Start Development'}
        </Button>
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {solventHeight > 1 && !isRunning && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <div className="text-sm font-medium text-green-500 mb-2">
            {sampleType === 'inks' ? 'Separation Complete!' : 'Ion Identification:'}
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            {currentSpots.map((spot, i) => (
              <div key={i} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: spot.color }}
                />
                <span>Spot {i + 1}: Rf = {spot.rf.toFixed(2)}</span>
                {sampleType === 'ions' && (
                  <span className="text-primary">({i === 0 ? 'Pb²⁺ - Lead' : 'Cd²⁺ - Cadmium'})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
