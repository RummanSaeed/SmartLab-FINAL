"use client"

import { useMemo } from "react"
import * as THREE from "three"

export function LabEnvironment({
  benchY = -1.1,
  benchSize = 14,
}: {
  benchY?: number
  benchSize?: number
}) {
  const wallMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#060b16", roughness: 0.95, metalness: 0.05 }),
    [],
  )

  const benchMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#0b1220", roughness: 0.9, metalness: 0.08 }),
    [],
  )

  const benchTopMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#111827", roughness: 0.65, metalness: 0.18 }),
    [],
  )

  const accentMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0f172a",
        emissive: "#0b1220",
        emissiveIntensity: 0.35,
        roughness: 0.8,
        metalness: 0.15,
      }),
    [],
  )

  return (
    <>
      <color attach="background" args={["#050814"]} />
      <fog attach="fog" args={["#050814", 10, 22]} />

      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 8, 3]} intensity={1.25} castShadow />
      <directionalLight position={[-5, 6, -4]} intensity={0.35} />
      <pointLight position={[0, 2.8, 3.6]} intensity={0.6} color="#60a5fa" />
      <pointLight position={[0, 1.6, -3.5]} intensity={0.35} color="#fbbf24" />

      {/* Bench */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, benchY, 0]} receiveShadow material={benchMat}>
        <planeGeometry args={[benchSize, benchSize]} />
      </mesh>
      <mesh position={[0, benchY + 0.05, 0]} receiveShadow material={benchTopMat}>
        <boxGeometry args={[benchSize * 0.7, 0.1, benchSize * 0.45]} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, benchY + 2.7, -benchSize * 0.35]} receiveShadow material={wallMat}>
        <boxGeometry args={[benchSize, 6, 0.25]} />
      </mesh>

      {/* Side walls */}
      <mesh position={[benchSize * 0.48, benchY + 2.2, 0]} receiveShadow material={wallMat}>
        <boxGeometry args={[0.25, 5, benchSize]} />
      </mesh>
      <mesh position={[-benchSize * 0.48, benchY + 2.2, 0]} receiveShadow material={wallMat}>
        <boxGeometry args={[0.25, 5, benchSize]} />
      </mesh>

      {/* Accent strips */}
      <mesh position={[0, benchY + 3.6, -benchSize * 0.34]} material={accentMat}>
        <boxGeometry args={[benchSize * 0.9, 0.06, 0.1]} />
      </mesh>
      <mesh position={[0, benchY + 1.05, -benchSize * 0.34]} material={accentMat}>
        <boxGeometry args={[benchSize * 0.9, 0.04, 0.1]} />
      </mesh>
    </>
  )
}
