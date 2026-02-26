import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

function CandyText() {
  return (
    <Text
      fontSize={2}
      color="#ff69b4"
      font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf"
      position={[0, 0.5, 0]}
      material={
        new THREE.MeshPhysicalMaterial({
          color: '#ff69b4',
          roughness: 0.2,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          reflectivity: 1,
          transmission: 0.5,
          thickness: 0.5,
          metalness: 0.2,
        })
      }
    >
      LIQUID LAB
    </Text>
  );
}

function ArrowMesh() {
  const ref = useRef<THREE.Group | null>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t * 0.8) * 0.25;
    ref.current.position.y = Math.sin(t * 1.2) * 0.15 - 1.8;
  });

  return (
    <group ref={ref} position={[0, -1.6, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.42, 1.4, 32]} />
        <meshPhysicalMaterial color="#ffb86b" metalness={0.45} clearcoat={0.9} />
      </mesh>
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 1.4, 16]} />
        <meshPhysicalMaterial color="#ff9b55" metalness={0.25} clearcoat={0.5} />
      </mesh>
    </group>
  );
}

export default function Hero3D() {
  return (
    <div style={{ width: '100vw', height: '75vh', background: 'linear-gradient(135deg, #07060a 0%, #0b0810 60%)' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <CandyText />
        <ArrowMesh />
        <OrbitControls enableZoom={false} enablePan={false} />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}
