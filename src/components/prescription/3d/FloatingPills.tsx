'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface PillConfig {
  initialPosition: [number, number, number];
  initialRotation: [number, number, number];
  scale: [number, number, number];
  speedY: number;
  speedRot: number;
  rotAxis: [number, number, number];
  phase: number;
  color: string;
  radius: number;
  bodyLength: number;
}

export function PillCapsule({ config }: { config: PillConfig }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();

    // Natural independent floating & bobbing
    const offsetY =
      Math.sin(t * config.speedY + config.phase) * 0.1 +
      Math.cos(t * (config.speedY * 0.5) + config.phase) * 0.04;
    const offsetX = Math.sin(t * (config.speedY * 0.6) + config.phase * 1.3) * 0.03;

    ref.current.position.x = config.initialPosition[0] + offsetX;
    ref.current.position.y = config.initialPosition[1] + offsetY;
    ref.current.position.z = config.initialPosition[2];

    // Slow independent 3D rotation
    ref.current.rotation.x = config.initialRotation[0] + t * config.speedRot * config.rotAxis[0];
    ref.current.rotation.y = config.initialRotation[1] + t * config.speedRot * config.rotAxis[1];
    ref.current.rotation.z = config.initialRotation[2] + t * config.speedRot * config.rotAxis[2];
  });

  return (
    <mesh
      ref={ref}
      position={config.initialPosition}
      rotation={config.initialRotation}
      scale={config.scale}
      castShadow
    >
      <capsuleGeometry args={[config.radius, config.bodyLength, 16, 32]} />
      <meshPhysicalMaterial
        color={config.color}
        roughness={0.2}
        transmission={0.92}
        ior={1.45}
        thickness={0.5}
        transparent
        opacity={0.95}
        reflectivity={0.5}
        clearcoat={0.3}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

export default function FloatingPills() {
  const pills = useMemo<PillConfig[]>(
    () => [
      {
        initialPosition: [-2.1, 1.2, 0.4],
        initialRotation: [0.6, 0.4, 0.8],
        scale: [1, 1, 1],
        speedY: 1.1,
        speedRot: 0.35,
        rotAxis: [1, 0.8, 0.5],
        phase: 0.2,
        color: '#ffffff',
        radius: 0.14,
        bodyLength: 0.38,
      },
      {
        initialPosition: [2.2, 0.9, 0.6],
        initialRotation: [-0.4, 0.7, -0.5],
        scale: [1.1, 1.1, 1.1],
        speedY: 0.9,
        speedRot: 0.28,
        rotAxis: [0.6, 1, 0.4],
        phase: 2.1,
        color: '#e0f2fe',
        radius: 0.15,
        bodyLength: 0.42,
      },
      {
        initialPosition: [-1.8, -1.2, 0.8],
        initialRotation: [0.3, -0.5, 1.2],
        scale: [0.85, 0.85, 0.85],
        speedY: 1.3,
        speedRot: 0.4,
        rotAxis: [0.8, 0.5, 1],
        phase: 4.3,
        color: '#ede9fe',
        radius: 0.12,
        bodyLength: 0.32,
      },
      {
        initialPosition: [1.9, -1.3, -0.3],
        initialRotation: [0.8, 0.2, -0.6],
        scale: [0.9, 0.9, 0.9],
        speedY: 1.0,
        speedRot: 0.3,
        rotAxis: [0.5, 0.9, 0.7],
        phase: 1.5,
        color: '#ffffff',
        radius: 0.13,
        bodyLength: 0.36,
      },
      {
        initialPosition: [-0.4, 1.9, -0.6],
        initialRotation: [0.2, 1.1, 0.4],
        scale: [0.75, 0.75, 0.75],
        speedY: 0.8,
        speedRot: 0.22,
        rotAxis: [1, 0.4, 0.6],
        phase: 3.4,
        color: '#e0f2fe',
        radius: 0.11,
        bodyLength: 0.28,
      },
    ],
    []
  );

  return (
    <group name="FloatingPillCapsules">
      {pills.map((pill, idx) => (
        <PillCapsule key={idx} config={pill} />
      ))}
    </group>
  );
}
