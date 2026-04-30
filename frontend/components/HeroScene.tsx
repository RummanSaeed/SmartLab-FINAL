import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF } from '@react-three/drei';

// Simple rotating flask model placeholder — uses a small procedural mesh
function FlaskModel() {
  return (
    <group>
      <mesh rotation={[0, Math.PI * 0.25, 0]} position={[0, -0.18, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 1.2, 40]} />
        <meshStandardMaterial color="#8b5cf6" metalness={0.55} roughness={0.18} emissive="#2b076e" emissiveIntensity={0.08} transparent opacity={0.98} />
      </mesh>
      {/* inner liquid */}
      <mesh position={[0, -0.05, 0]} rotation={[0, Math.PI * 0.25, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.6, 40]} />
        <meshPhysicalMaterial color="#ec4899" metalness={0.1} roughness={0.15} transparent opacity={0.9} clearcoat={0.5} />
      </mesh>
    </group>
  );
}

const HeroScene: React.FC = () => {
  return (
    <div style={{ width: '100%', height: 320 }} className="hero-canvas">
      <Canvas camera={{ position: [2.2, 1.2, 2.8], fov: 38 }} shadows>
        <color attach="background" args={[0.04, 0.04, 0.06]} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[6, 10, 6]} intensity={0.8} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <spotLight position={[-5, 6, -6]} intensity={0.15} />
        <Suspense fallback={<Html center>Loading...</Html>}>
          <group rotation={[-0.12, 0.6, 0]}>
            <FlaskModel />
          </group>
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};

export default HeroScene;
