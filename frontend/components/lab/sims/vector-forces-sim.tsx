"use client"

import { useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Text, Cylinder, Ring } from "@react-three/drei"
import { Badge } from "@/components/ui/badge"
import * as THREE from "three"

const degToRad = (d: number) => (d * Math.PI) / 180

// Protractor markings around the table
function ProtractorMarkings({ radius = 2.2 }: { radius?: number }) {
  const markings = useMemo(() => {
    const items: { angle: number; label: string; major: boolean }[] = []
    for (let i = 0; i < 360; i += 10) {
      items.push({ angle: i, label: i % 30 === 0 ? `${i}°` : "", major: i % 30 === 0 })
    }
    return items
  }, [])

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      {markings.map((m) => {
        const rad = degToRad(m.angle)
        const x = Math.cos(rad) * radius
        const z = Math.sin(rad) * radius
        const x2 = Math.cos(rad) * (radius - (m.major ? 0.15 : 0.08))
        const z2 = Math.sin(rad) * (radius - (m.major ? 0.15 : 0.08))
        return (
          <group key={m.angle}>
            {/* Tick mark */}
            <line>
              <bufferGeometry
                attach="geometry"
                setFromPoints={[new THREE.Vector3(x, 0, z), new THREE.Vector3(x2, 0, z2)]}
              />
              <lineBasicMaterial color="#94a3b8" linewidth={m.major ? 2 : 1} />
            </line>
            {/* Degree label */}
            {m.label && (
              <Text
                position={[Math.cos(rad) * (radius + 0.25), 0.05, Math.sin(rad) * (radius + 0.25)]}
                rotation={[-Math.PI / 2, 0, -rad - Math.PI / 2]}
                fontSize={0.12}
                color="#cbd5e1"
                anchorX="center"
                anchorY="middle"
              >
                {m.label}
              </Text>
            )}
          </group>
        )
      })}
    </group>
  )
}

// Pulley with string
function PulleyWithString({
  angle,
  distance,
  stringLength,
  force,
  color = "#64748b",
}: {
  angle: number
  distance: number
  stringLength: number
  force: number
  color?: string
}) {
  const rad = degToRad(angle)
  const pulleyX = Math.cos(rad) * distance
  const pulleyZ = Math.sin(rad) * distance
  const stringEndX = Math.cos(rad) * (distance + stringLength)
  const stringEndZ = Math.sin(rad) * (distance + stringLength)

  return (
    <group>
      {/* Pulley base/post */}
      <mesh position={[pulleyX, 0.5, pulleyZ]}>
        <cylinderGeometry args={[0.06, 0.06, 1, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Pulley wheel */}
      <mesh position={[pulleyX, 1.1, pulleyZ]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 32]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* String from center ring to pulley */}
      <line>
        <bufferGeometry
          attach="geometry"
          setFromPoints={[
            new THREE.Vector3(0, 0.05, 0),
            new THREE.Vector3(pulleyX, 1.1, pulleyZ),
          ]}
        />
        <lineBasicMaterial color="#e2e8f0" linewidth={1.5} />
      </line>
      {/* String hanging down with weight */}
      <line>
        <bufferGeometry
          attach="geometry"
          setFromPoints={[
            new THREE.Vector3(pulleyX, 1.1, pulleyZ),
            new THREE.Vector3(stringEndX, 0.3, stringEndZ),
          ]}
        />
        <lineBasicMaterial color="#e2e8f0" linewidth={1.5} />
      </line>
      {/* Mass hanger (weight) */}
      <group position={[stringEndX, 0.15, stringEndZ]}>
        <mesh>
          <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Mass label */}
        <Text
          position={[0, 0, 0.12]}
          fontSize={0.08}
          color="#1e293b"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {force.toFixed(1)}N
        </Text>
      </group>
    </group>
  )
}

// Center ring that moves when not in equilibrium
function CenterRing({
  ax,
  ay,
  bx,
  by,
  isBalanced,
}: {
  ax: number
  ay: number
  bx: number
  by: number
  isBalanced: boolean
}) {
  const ringRef = useRef<THREE.Group>(null)
  const [time, setTime] = useState(0)

  useFrame((state) => {
    setTime(state.clock.elapsedTime)
    if (ringRef.current && !isBalanced) {
      // Calculate displacement from unbalanced forces
      const rx = -(ax + bx)
      const ry = -(ay + by)
      const displacement = Math.min(Math.sqrt(rx * rx + ry * ry) * 0.08, 0.4)
      const wobble = Math.sin(time * 3) * 0.02
      ringRef.current.position.x = rx * 0.05 + wobble
      ringRef.current.position.z = ry * 0.05 + wobble
    } else if (ringRef.current) {
      // Return to center when balanced
      ringRef.current.position.x *= 0.9
      ringRef.current.position.z *= 0.9
    }
  })

  return (
    <group ref={ringRef}>
      {/* 3D Torus ring - tube shape for visibility from all angles */}
      <mesh position={[0, 0.25, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.5, 0.08, 16, 64]} />
        <meshStandardMaterial
          color={isBalanced ? "#22c55e" : "#ef4444"}
          metalness={0.6}
          roughness={0.2}
          emissive={isBalanced ? "#22c55e" : "#ef4444"}
          emissiveIntensity={0.6}
        />
      </mesh>
      {/* Secondary glow ring (flat underneath) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
        <ringGeometry args={[0.4, 0.6, 48]} />
        <meshBasicMaterial
          color={isBalanced ? "#22c55e" : "#ef4444"}
          transparent
          opacity={0.4}
        />
      </mesh>
      {/* Center sphere - raised */}
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color="#f8fafc" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
      {/* Crosshairs on table surface - aligned with ring center */}
      <line>
        <bufferGeometry
          attach="geometry"
          setFromPoints={[
            new THREE.Vector3(-0.5, 0.06, 0),
            new THREE.Vector3(0.5, 0.06, 0),
          ]}
        />
        <lineBasicMaterial color="#f8fafc" linewidth={2} />
      </line>
      <line>
        <bufferGeometry
          attach="geometry"
          setFromPoints={[
            new THREE.Vector3(0, 0.06, -0.5),
            new THREE.Vector3(0, 0.06, 0.5),
          ]}
        />
        <lineBasicMaterial color="#f8fafc" linewidth={2} />
      </line>
      {/* Vertical indicator showing ring position */}
      <line>
        <bufferGeometry
          attach="geometry"
          setFromPoints={[
            new THREE.Vector3(0, 0.06, 0),
            new THREE.Vector3(0, 0.25, 0),
          ]}
        />
        <lineBasicMaterial color={isBalanced ? "#22c55e" : "#ef4444"} linewidth={3} />
      </line>
    </group>
  )
}

// Force vector arrow on table surface
function ForceVector({
  force,
  angle,
  color,
  label,
}: {
  force: number
  angle: number
  color: string
  label: string
}) {
  const rad = degToRad(angle)
  const maxForce = 10
  const arrowLength = Math.min(force / maxForce, 1) * 2
  const endX = Math.cos(rad) * arrowLength
  const endZ = Math.sin(rad) * arrowLength

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* Arrow shaft */}
      <line>
        <bufferGeometry
          attach="geometry"
          setFromPoints={[
            new THREE.Vector3(0, 0.06, 0),
            new THREE.Vector3(endX, 0.06, endZ),
          ]}
        />
        <lineBasicMaterial color={color} linewidth={3} />
      </line>
      {/* Arrowhead */}
      <mesh position={[endX, 0.06, endZ]} rotation={[0, 0, -angle - 90]}>
        <coneGeometry args={[0.06, 0.15, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Label */}
      <Text
        position={[endX + Math.cos(rad) * 0.2, 0.08, endZ + Math.sin(rad) * 0.2]}
        fontSize={0.1}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}

// Main 3D Scene
function ForceTableScene({
  forceA,
  angleA,
  forceB,
  angleB,
}: {
  forceA: number
  angleA: number
  forceB: number
  angleB: number
}) {
  const { camera } = useThree()

  useMemo(() => {
    camera.position.set(0, 5, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  // Vector calculations
  const ax = forceA * Math.cos(degToRad(angleA))
  const ay = forceA * Math.sin(degToRad(angleA))
  const bx = forceB * Math.cos(degToRad(angleB))
  const by = forceB * Math.sin(degToRad(angleB))
  const rx = -(ax + bx)
  const ry = -(ay + by)
  const rMag = Math.sqrt(rx * rx + ry * ry)
  const isBalanced = rMag < 0.3

  return (
    <>
      <color attach="background" args={["#0a0f1a"]} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-5, 8, -5]} intensity={0.8} />
      <pointLight position={[0, 4, 0]} intensity={1} color="#60a5fa" />
      <spotLight
        position={[0, 8, 0]}
        angle={Math.PI / 4}
        penumbra={0.5}
        intensity={1}
        castShadow
        target-position={[0, 0, 0]}
      />

      {/* Table base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.1, 64]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.6} />
      </mesh>

      {/* Table surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <cylinderGeometry args={[2.4, 2.4, 0.02, 64]} />
        <meshStandardMaterial color="#334155" metalness={0.2} roughness={0.8} />
      </mesh>

      {/* Protractor markings */}
      <ProtractorMarkings radius={2.2} />

      {/* Center ring */}
      <CenterRing ax={ax} ay={ay} bx={bx} by={by} isBalanced={isBalanced} />

      {/* Pulleys with strings */}
      <PulleyWithString
        angle={angleA}
        distance={2.3}
        stringLength={0.8}
        force={forceA}
        color="#38bdf8"
      />
      <PulleyWithString
        angle={angleB}
        distance={2.3}
        stringLength={0.8}
        force={forceB}
        color="#f59e0b"
      />

      {/* Force vectors on table */}
      <ForceVector force={forceA} angle={angleA} color="#38bdf8" label="A" />
      <ForceVector force={forceB} angle={angleB} color="#f59e0b" label="B" />
      {!isBalanced && (
        <ForceVector
          force={Math.min(rMag, 10)}
          angle={(Math.atan2(ry, rx) * 180) / Math.PI}
          color="#ef4444"
          label="R"
        />
      )}

      {/* Table legs */}
      {[-1.8, 1.8].map((x) =>
        [-1.8, 1.8].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -1, z]}>
            <cylinderGeometry args={[0.08, 0.06, 2, 16]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        ))
      )}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
      />
    </>
  )
}

export function VectorForcesSim({
  forceA,
  angleA,
  forceB,
  angleB,
}: {
  forceA: number
  angleA: number
  forceB: number
  angleB: number
}) {
  // Calculations
  const ax = forceA * Math.cos(degToRad(angleA))
  const ay = forceA * Math.sin(degToRad(angleA))
  const bx = forceB * Math.cos(degToRad(angleB))
  const by = forceB * Math.sin(degToRad(angleB))
  const rx = -(ax + bx)
  const ry = -(ay + by)
  const rMag = Math.sqrt(rx * rx + ry * ry)
  const rAngle = (Math.atan2(ry, rx) * 180) / Math.PI
  const isBalanced = rMag < 0.3

  return (
    <div className="h-full flex flex-col gap-3">
      {/* Status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="gap-1">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          Force A: {forceA.toFixed(1)} N @ {angleA}°
        </Badge>
        <Badge variant="outline" className="gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Force B: {forceB.toFixed(1)} N @ {angleB}°
        </Badge>
        <Badge variant="secondary">
          Equilibrant: {rMag.toFixed(2)} N @ {rAngle.toFixed(1)}°
        </Badge>
        <Badge variant={isBalanced ? "default" : "destructive"}>
          {isBalanced ? "✓ System in equilibrium" : "⚠ Unbalanced forces"}
        </Badge>
      </div>

      {/* 3D Viewport */}
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden flex-1 min-h-[400px]">
        <Canvas shadows camera={{ position: [0, 5, 5], fov: 45 }}>
          <ForceTableScene forceA={forceA} angleA={angleA} forceB={forceB} angleB={angleB} />
        </Canvas>
      </div>

      {/* Instructions */}
      <div className="rounded-lg border border-border/60 bg-primary/5 p-3 text-sm">
        <p className="text-muted-foreground">
          <strong>Force Table:</strong> Two forces pull on the center ring through pulleys. 
          The ring turns <span className={isBalanced ? "text-green-500" : "text-red-400"}>{isBalanced ? "green" : "red"}</span> when {isBalanced ? "in equilibrium" : "forces are unbalanced"}. 
          Drag to rotate view. Adjust parameters to balance the system.
        </p>
      </div>
    </div>
  )
}

