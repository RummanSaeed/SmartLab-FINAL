"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import * as THREE from "three"

// Scale: 100cm beam = 6 units wide
const cmToUnits = (cm: number) => (cm - 50) / 8.33

// Weight hanger with chain
function WeightHanger({
  x,
  weight,
  color,
  label,
  beamY,
  isLeft,
}: {
  x: number
  weight: number
  color: string
  label: string
  beamY: number
  isLeft: boolean
}) {
  // Chain goes from beam hook down to weight
  const chainLength = 1.2
  const weightY = beamY - chainLength

  return (
    <group>
      {/* Hook on beam */}
      <mesh position={[x, beamY - 0.08, 0]}>
        <torusGeometry args={[0.06, 0.02, 8, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Chain */}
      <line>
        <bufferGeometry
          attach="geometry"
          setFromPoints={[
            new THREE.Vector3(x, beamY - 0.14, 0),
            new THREE.Vector3(x, weightY + 0.15, 0),
          ]}
        />
        <lineBasicMaterial color="#94a3b8" linewidth={2} />
      </line>

      {/* Weight hanger (cylinder) */}
      <mesh position={[x, weightY, 0]}>
        <cylinderGeometry args={[0.15, 0.12, 0.3, 24]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Weight label */}
      <Text
        position={[x, weightY + 0.45, 0.2]}
        fontSize={0.12}
        color="#f8fafc"
        anchorX="center"
        anchorY="middle"
      >
        {label}: {weight.toFixed(1)}N
      </Text>

      {/* Position marker on beam */}
      <Text
        position={[x, beamY + 0.25, 0]}
        fontSize={0.1}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {isLeft ? "←" : "→"} {Math.abs(x * 8.33).toFixed(0)}cm
      </Text>
    </group>
  )
}

// Triangular fulcrum
function Fulcrum() {
  return (
    <group position={[0, 0, 0]}>
      {/* Base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.8, 0.9, 0.3, 32]} />
        <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Triangle top */}
      <mesh position={[0, 0.55, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.6, 0.8, 4]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Sharp edge */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Center marker */}
      <mesh position={[0, 0.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.15, 16]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
    </group>
  )
}

// Main beam with hooks
function Beam({
  tilt,
  leftX,
  rightX,
  unknownW,
  knownW,
}: {
  tilt: number
  leftX: number
  rightX: number
  unknownW: number
  knownW: number
}) {
  const beamRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (beamRef.current) {
      // Smooth tilt animation
      beamRef.current.rotation.z = THREE.MathUtils.lerp(beamRef.current.rotation.z, tilt, 0.1)
    }
  })

  const beamY = 1.0 // Height where beam sits on fulcrum

  return (
    <group ref={beamRef} position={[0, beamY, 0]}>
      {/* Main beam - metallic ruler */}
      <mesh>
        <boxGeometry args={[6, 0.12, 0.4]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Ruler markings on top */}
      {Array.from({ length: 11 }, (_, i) => i * 10).map((cm) => {
        const x = cmToUnits(cm)
        const isCenter = cm === 50
        return (
          <group key={cm}>
            {/* Tick mark */}
            <mesh position={[x, 0.07, 0.21]}>
              <boxGeometry args={[0.02, isCenter ? 0.08 : 0.04, 0.01]} />
              <meshBasicMaterial color={isCenter ? "#22c55e" : "#475569"} />
            </mesh>
            {/* Label */}
            <Text
              position={[x, 0.15, 0.25]}
              fontSize={0.08}
              color={isCenter ? "#22c55e" : "#64748b"}
              anchorX="center"
              anchorY="bottom"
              rotation={[0, 0, 0]}
            >
              {isCenter ? "50" : `${cm}`}
            </Text>
          </group>
        )
      })}

      {/* Hooks every 10cm */}
      {Array.from({ length: 11 }, (_, i) => i * 10).map((cm) => {
        const x = cmToUnits(cm)
        if (cm === 50) return null // Skip center (fulcrum)
        return (
          <mesh key={`hook-${cm}`} position={[x, -0.08, 0]}>
            <torusGeometry args={[0.05, 0.015, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
          </mesh>
        )
      })}

      {/* Weights */}
      <WeightHanger x={leftX} weight={unknownW} color="#f59e0b" label="Unknown" beamY={beamY} isLeft={true} />
      <WeightHanger x={rightX} weight={knownW} color="#22c55e" label="Known" beamY={beamY} isLeft={false} />
    </group>
  )
}

// 3D Scene
function MomentsScene({
  unknownW,
  unknownPos,
  knownW,
  knownPos,
}: {
  unknownW: number
  unknownPos: number
  knownW: number
  knownPos: number
}) {
  const { camera } = useThree()

  useMemo(() => {
    camera.position.set(0, 4, 6)
    camera.lookAt(0, 0.8, 0)
  }, [camera])

  // Calculations
  const leftDist = 50 - unknownPos
  const rightDist = knownPos - 50
  const leftMoment = unknownW * leftDist
  const rightMoment = knownW * rightDist

  // Calculate tilt based on moment difference (physics-based)
  // Max tilt ±15 degrees (0.26 radians)
  const maxTilt = 0.26
  const momentDiff = rightMoment - leftMoment
  const tilt = Math.max(-maxTilt, Math.min(maxTilt, momentDiff / 1000))

  const leftX = cmToUnits(unknownPos)
  const rightX = cmToUnits(knownPos)

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.3} castShadow />
      <directionalLight position={[-5, 8, -5]} intensity={0.6} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#60a5fa" />

      {/* Base platform */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[4, 4, 0.1, 64]} />
        <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* Fulcrum */}
      <Fulcrum />

      {/* Beam with weights */}
      <Beam tilt={tilt} leftX={leftX} rightX={rightX} unknownW={unknownW} knownW={knownW} />

      {/* Pivot point indicator */}
      <mesh position={[0, 1.08, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
      </mesh>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0.8, 0]}
      />
    </>
  )
}

export function MomentsSim({
  unknownW,
  unknownPos,
  knownW,
  knownPos,
}: {
  unknownW: number
  unknownPos: number
  knownW: number
  knownPos: number
}) {
  const leftDist = 50 - unknownPos
  const rightDist = knownPos - 50
  const leftMoment = unknownW * leftDist
  const rightMoment = knownW * rightDist
  const diff = Math.abs(leftMoment - rightMoment)
  const balanced = diff < 10

  const tiltAngle = ((rightMoment - leftMoment) / 1000) * (180 / Math.PI)

  // Calculate max moment for scaling
  const maxMoment = Math.max(leftMoment, rightMoment, 100)
  const leftBarWidth = (leftMoment / maxMoment) * 40 // max 40% width
  const rightBarWidth = (rightMoment / maxMoment) * 40

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Left: {unknownW.toFixed(1)}N × {leftDist}cm = {leftMoment.toFixed(0)} N·cm
        </Badge>
        <Badge variant="outline" className="gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Right: {knownW.toFixed(1)}N × {rightDist}cm = {rightMoment.toFixed(0)} N·cm
        </Badge>
        <Badge variant={balanced ? "default" : "destructive"}>
          {balanced ? "✓ Balanced (Principle of Moments)" : `⚠ Tilt: ${tiltAngle.toFixed(1)}°`}
        </Badge>
      </div>

      {/* Moment Comparison Graph */}
      <div className="rounded-lg border border-border/60 bg-card/60 p-3">
        <div className="text-xs text-muted-foreground mb-2 font-medium">Moment Comparison (N·cm)</div>
        <div className="space-y-2">
          {/* Anticlockwise (Left) */}
          <div className="flex items-center gap-2">
            <span className="text-xs w-24 text-amber-400">← Anticlockwise</span>
            <div className="flex-1 h-6 bg-muted/50 rounded-sm overflow-hidden">
              <div
                className="h-full bg-amber-500/80 rounded-sm flex items-center justify-end pr-2 transition-all duration-300"
                style={{ width: `${leftBarWidth}%` }}
              >
                <span className="text-xs text-white font-medium">{leftMoment.toFixed(0)}</span>
              </div>
            </div>
          </div>
          {/* Clockwise (Right) */}
          <div className="flex items-center gap-2">
            <span className="text-xs w-24 text-green-400">→ Clockwise</span>
            <div className="flex-1 h-6 bg-muted/50 rounded-sm overflow-hidden">
              <div
                className="h-full bg-green-500/80 rounded-sm flex items-center justify-end pr-2 transition-all duration-300"
                style={{ width: `${rightBarWidth}%` }}
              >
                <span className="text-xs text-white font-medium">{rightMoment.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Equation */}
        <div className="mt-2 text-center text-xs">
          {balanced ? (
            <span className="text-green-400 font-medium">
              ✓ {leftMoment.toFixed(0)} = {rightMoment.toFixed(0)} (Moments balanced!)
            </span>
          ) : leftMoment > rightMoment ? (
            <span className="text-amber-400">
              {leftMoment.toFixed(0)} &gt; {rightMoment.toFixed(0)} (Beam tilts left)
            </span>
          ) : (
            <span className="text-green-400">
              {rightMoment.toFixed(0)} &gt; {leftMoment.toFixed(0)} (Beam tilts right)
            </span>
          )}
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden flex-1 min-h-[420px]">
        <Canvas shadows camera={{ position: [0, 4, 6], fov: 45 }}>
          <MomentsScene unknownW={unknownW} unknownPos={unknownPos} knownW={knownW} knownPos={knownPos} />
        </Canvas>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border border-border/60 bg-primary/5 p-3 text-sm">
        <p className="text-muted-foreground">
          <strong>Principle of Moments:</strong> A beam balances when clockwise moments equal anticlockwise moments. 
          <span className={balanced ? "text-green-400" : "text-amber-400"}>
            {balanced
              ? " The beam is balanced! Unknown × Left distance = Known × Right distance."
              : " Adjust the unknown weight or positions to balance the beam."}
          </span>
        </p>
      </div>
    </div>
  )
}

