import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Text, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

function CandyText() {
  return (
    <Text
      fontSize={2}
      color="#ff69b4"
      font="https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf"
      position={[0, 0, 0]}
      bevelEnabled={true}
      bevelThickness={0.1}
      bevelSize={0.05}
      bevelOffset={0}
      bevelSegments={5}
      material={
        new THREE.MeshPhysicalMaterial({
          color: '#ff69b4',
          roughness: 0.2,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          reflectivity: 1,
          transmission: 0.5,
          thickness: 0.5,
          iridescence: 0.3,
          metalness: 0.2,
        })
      }
    >
      LIQUID LAB
    </Text>
  );
}

export default function Hero3D() {
  return (
    <div style={{ width: '100vw', height: '60vh', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <CandyText />
        <OrbitControls enableZoom={false} enablePan={false} />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}
