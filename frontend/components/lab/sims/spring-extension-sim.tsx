"use client"

import { useMemo, useRef } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import * as THREE from "three"

// Realistic coiled spring using tube geometry
function CoilSpring({ length }: { length: number }) {
  const coilRef = useRef<THREE.Group>(null)
  const coils = 15
  const radius = 0.1

  const points = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const segments = coils * 20
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const angle = t * coils * Math.PI * 2
      const y = -t * length
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      pts.push(new THREE.Vector3(x, y, z))
    }
    return pts
  }, [length])

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points])

  return (
    <group ref={coilRef}>
      <mesh>
        <tubeGeometry args={[curve, 100, 0.015, 8, false]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

// Retort stand with heavy base
function RetortStand() {
  return (
    <group>
      {/* Heavy circular base */}
      <mesh position={[-1.5, 0.15, 0]}>
        <cylinderGeometry args={[1, 1.1, 0.3, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Base top surface */}
      <mesh position={[-1.5, 0.32, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.04, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Vertical rod - cast iron look */}
      <mesh position={[-1.5, 2.5, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 5, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Rod protective cap */}
      <mesh position={[-1.5, 5.05, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.6} />
      </mesh>
    </group>
  )
}

// Clamp holding the spring
function SpringClamp() {
  return (
    <group position={[-1.5, 4, 0]}>
      {/* Clamp body - metal block */}
      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.3]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Thumb screw - brass color */}
      <mesh position={[0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.2, 12]} />
        <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Screw head detail */}
      <mesh position={[0.55, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 6]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Horizontal arm */}
      <mesh position={[0.7, -0.05, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.1]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* End hook for spring */}
      <mesh position={[1.15, -0.15, 0]}>
        <torusGeometry args={[0.05, 0.015, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Hook label */}
      <Text position={[1.15, 0.15, 0]} fontSize={0.08} color="#64748b" anchorX="center">
        Clamp
      </Text>
    </group>
  )
}

// Weight hanger with slotted masses
function WeightHanger({ load, position }: { load: number; position: [number, number, number] }) {
  const hangerMass = 0.5
  const addedMass = Math.max(0, load - hangerMass)

  return (
    <group position={position}>
      {/* Top hook - connects to spring */}
      <mesh position={[0, 0.2, 0]}>
        <torusGeometry args={[0.05, 0.015, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#64748b" metalness={0.9} />
      </mesh>

      {/* Thin rod */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} />
      </mesh>

      {/* Weight pan - brass */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.25, 0.2, 24]} />
        <meshStandardMaterial color="#d97706" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Stacked slotted weights */}
      {addedMass > 0 && (
        <group position={[0, -0.38, 0]}>
          {Array.from({ length: Math.min(Math.ceil(addedMass), 6) }, (_, i) => (
            <mesh key={i} position={[0, i * 0.08, 0]}>
              <cylinderGeometry args={[0.22 - i * 0.005, 0.22 - i * 0.005, 0.06, 24]} />
              <meshStandardMaterial
                color={i % 3 === 0 ? "#ef4444" : i % 3 === 1 ? "#3b82f6" : "#22c55e"}
                metalness={0.4}
                roughness={0.5}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Load label floating */}
      <Text position={[0.5, -0.4, 0.2]} fontSize={0.1} color="#f8fafc" anchorX="left">
        Load: {load.toFixed(1)}N
      </Text>
    </group>
  )
}

// Measurement ruler
function Ruler({ topY }: { topY: number }) {
  return (
    <group position={[1.5, 0, 0]}>
      {/* Ruler backboard */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[0.2, 4, 0.03]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>

      {/* Measurement ticks */}
      {Array.from({ length: 9 }, (_, i) => {
        const y = topY - 0.5 - i * 0.5
        const isMajor = i % 2 === 0
        return (
          <group key={i}>
            <mesh position={[-0.12, y, 0.02]}>
              <boxGeometry args={[isMajor ? 0.1 : 0.05, 0.02, 0.01]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            {isMajor && (
              <Text position={[0.15, y, 0.02]} fontSize={0.08} color="#0f172a" anchorX="left">
                {(i * 50)}cm
              </Text>
            )}
          </group>
        )
      })}
    </group>
  )
}

// Main 3D scene
function SpringScene({ load, k }: { load: number; k: number }) {
  const { camera } = useThree()
  const groupRef = useRef<THREE.Group>(null)

  useMemo(() => {
    camera.position.set(3, 3.5, 6)
    camera.lookAt(0, 2, 0)
  }, [camera])

  // Physics
  const naturalLength = 1.2
  const extension = load / Math.max(k, 0.01)
  const totalLength = naturalLength + extension

  // Clamp is at y=3.85, spring hangs down
  const clampY = 3.85
  const hangerY = clampY - totalLength - 0.5

  // Smooth animation
  useFrame(() => {
    if (groupRef.current) {
      const targetY = clampY - totalLength / 2
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1)
    }
  })

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.3} castShadow />
      <directionalLight position={[-5, 8, -3]} intensity={0.6} />
      <pointLight position={[0, 4, 2]} intensity={0.5} color="#60a5fa" />

      {/* Base platform */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3, 0.1, 64]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Retort stand */}
      <RetortStand />

      {/* Clamp */}
      <SpringClamp />

      {/* Spring - animated */}
      <group ref={groupRef} position={[1.15, clampY - totalLength / 2, 0]}>
        <CoilSpring length={totalLength} />
      </group>

      {/* Hanger - animated separately */}
      <WeightHanger load={load} position={[1.15, hangerY, 0]} />

      {/* Ruler */}
      <Ruler topY={clampY} />

      {/* Pointer showing natural length position */}
      <mesh position={[1.3, clampY - naturalLength - 0.5, 0]}>
        <boxGeometry args={[0.02, 0.02, 0.3]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <Text position={[1.6, clampY - naturalLength - 0.5, 0]} fontSize={0.08} color="#ef4444" anchorX="left">
        Natural length
      </Text>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 2, 0]}
      />
    </>
  )
}

// Simple SVG graph component - exported for use in sidebar
export function LoadExtensionGraph({ load, extension, k }: { load: number; extension: number; k: number }) {
  // Graph dimensions
  const width = 300
  const height = 150
  const padding = { top: 10, right: 10, bottom: 30, left: 40 }
  const graphWidth = width - padding.left - padding.right
  const graphHeight = height - padding.top - padding.bottom

  // Max values for scaling (based on max possible values)
  const maxLoad = 10
  const maxExtension = maxLoad / Math.max(k, 0.01)

  // Scale functions
  const xScale = (ext: number) => padding.left + (ext / maxExtension) * graphWidth
  const yScale = (f: number) => padding.top + graphHeight - (f / maxLoad) * graphHeight

  // Current point
  const currentX = xScale(extension)
  const currentY = yScale(load)

  // Line points (Hooke's Law: F = kx)
  const linePoints = [
    [xScale(0), yScale(0)],
    [xScale(maxExtension), yScale(maxLoad)],
  ]

  return (
    <div className="rounded-lg border border-border/60 bg-card/60 p-3">
      <div className="text-xs text-muted-foreground mb-2 font-medium">Load vs Extension Graph (Hooke's Law)</div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Background */}
        <rect x={padding.left} y={padding.top} width={graphWidth} height={graphHeight} fill="#1e293b" opacity="0.3" rx="4" />

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <g key={tick}>
            {/* Horizontal grid */}
            <line
              x1={padding.left}
              y1={yScale(tick * maxLoad)}
              x2={padding.left + graphWidth}
              y2={yScale(tick * maxLoad)}
              stroke="#334155"
              strokeDasharray="2,2"
            />
            {/* Vertical grid */}
            <line
              x1={xScale(tick * maxExtension)}
              y1={padding.top}
              x2={xScale(tick * maxExtension)}
              y2={padding.top + graphHeight}
              stroke="#334155"
              strokeDasharray="2,2"
            />
          </g>
        ))}

        {/* Axes */}
        <line x1={padding.left} y1={padding.top + graphHeight} x2={padding.left + graphWidth} y2={padding.top + graphHeight} stroke="#64748b" strokeWidth="2" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + graphHeight} stroke="#64748b" strokeWidth="2" />

        {/* X-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <text key={`x-${tick}`} x={xScale(tick * maxExtension)} y={padding.top + graphHeight + 15} textAnchor="middle" fill="#94a3b8" fontSize="8">
            {(tick * maxExtension * 100).toFixed(0)}cm
          </text>
        ))}
        <text x={padding.left + graphWidth / 2} y={padding.top + graphHeight + 25} textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="500">
          Extension
        </text>

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <text key={`y-${tick}`} x={padding.left - 5} y={yScale(tick * maxLoad) + 3} textAnchor="end" fill="#94a3b8" fontSize="8">
            {(tick * maxLoad).toFixed(1)}N
          </text>
        ))}
        <text x={15} y={padding.top + graphHeight / 2} textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="500" transform={`rotate(-90, 15, ${padding.top + graphHeight / 2})`}>
          Load
        </text>

        {/* Hooke's Law line (F = kx) */}
        <line x1={linePoints[0][0]} y1={linePoints[0][1]} x2={linePoints[1][0]} y2={linePoints[1][1]} stroke="#60a5fa" strokeWidth="2" />

        {/* Current point */}
        <circle cx={currentX} cy={currentY} r="5" fill="#f59e0b" stroke="#fff" strokeWidth="2" />

        {/* Label for current point */}
        <g transform={`translate(${currentX + 10}, ${currentY - 10})`}>
          <rect x="0" y="-12" width="70" height="16" fill="#1e293b" rx="3" opacity="0.9" />
          <text x="5" y="-2" fill="#f59e0b" fontSize="8" fontWeight="500">
            ({extension.toFixed(2)}m, {load.toFixed(1)}N)
          </text>
        </g>

        {/* Slope label */}
        <text x={padding.left + graphWidth - 5} y={padding.top + 15} textAnchor="end" fill="#60a5fa" fontSize="9" fontWeight="500">
          k = {k.toFixed(1)} N/m
        </text>
      </svg>
      <div className="mt-2 text-center text-xs text-muted-foreground">
        <span className="text-blue-400">Linear relationship: F = kx</span> • Gradient = spring constant
      </div>
    </div>
  )
}

export function SpringExtensionSim({ load, k }: { load: number; k: number }) {
  const extension = load / Math.max(k, 0.01)
  const originalLength = 1.2
  const finalLength = originalLength + extension

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Load: {load.toFixed(1)} N
        </Badge>
        <Badge variant="outline" className="gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          Spring constant (k): {k.toFixed(1)} N/m
        </Badge>
        <Badge variant="secondary">
          Extension: {extension.toFixed(3)} m ({(extension * 100).toFixed(1)} cm)
        </Badge>
        <Badge variant="outline">
          Total length: {finalLength.toFixed(2)} m
        </Badge>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden flex-1 min-h-[400px]">
        <Canvas shadows camera={{ position: [3, 3.5, 6], fov: 45 }}>
          <SpringScene load={load} k={k} />
        </Canvas>
      </div>

      <div className="rounded-lg border border-border/60 bg-primary/5 p-3 text-sm">
        <p className="text-muted-foreground">
          <strong>Hooke's Law:</strong> Extension is directly proportional to load (F = kx). 
          The red marker shows natural length. 
          <span className="text-blue-400">
            Extension = {extension.toFixed(3)}m = Load ({load.toFixed(1)}N) ÷ k ({k.toFixed(1)}N/m)
          </span>
        </p>
      </div>
    </div>
  )
}

