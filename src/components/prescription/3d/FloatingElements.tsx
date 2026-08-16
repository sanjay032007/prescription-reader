'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 1. Premium Bi-Color Capsule (Top: Icy Cyan Glass, Bottom: Satin Pearl White, with internal particles)
export function BiColorCapsule({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  speedY = 1.0,
  speedRot = 0.3,
  phase = 0,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  speedY?: number;
  speedRot?: number;
  phase?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Floating bob
    const offsetY = Math.sin(t * speedY + phase) * 0.12;
    const offsetX = Math.cos(t * (speedY * 0.7) + phase) * 0.04;

    groupRef.current.position.x = position[0] + offsetX;
    groupRef.current.position.y = position[1] + offsetY;
    groupRef.current.position.z = position[2];

    // Smooth 3D tumbling rotation
    groupRef.current.rotation.x = rotation[0] + t * speedRot * 0.8;
    groupRef.current.rotation.y = rotation[1] + t * speedRot * 1.2;
    groupRef.current.rotation.z = rotation[2] + Math.sin(t * 0.5 + phase) * 0.2;
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Top Half: Translucent Icy Cyan Glass */}
      <group position={[0, 0.16, 0]}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.2, 32]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.88}
            roughness={0.15}
            ior={1.45}
            thickness={0.8}
            transparent
            opacity={0.95}
            reflectivity={0.6}
            clearcoat={0.4}
          />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transmission={0.88}
            roughness={0.15}
            ior={1.45}
            thickness={0.8}
            transparent
            opacity={0.95}
            reflectivity={0.6}
            clearcoat={0.4}
          />
        </mesh>

        {/* Tiny glowing micronized sphere inside the glass half */}
        <mesh position={[0, 0.12, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial
            color="#cffafe"
            emissive="#06b6d4"
            emissiveIntensity={1.2}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Center Connecting Ring */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.205, 0.205, 0.04, 32]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.3} roughness={0.2} />
      </mesh>

      {/* Bottom Half: Satin Pearl White */}
      <group position={[0, -0.16, 0]}>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.2, 32]} />
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.25}
            metalness={0.05}
            clearcoat={0.3}
            clearcoatRoughness={0.1}
          />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <sphereGeometry args={[0.2, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.25}
            metalness={0.05}
            clearcoat={0.3}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </group>
    </group>
  );
}

// 2. Round Scored Medical Tablet (With bevel edge & score groove)
export function ScoredTablet({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  speedY = 0.8,
  speedRot = 0.2,
  phase = 1.5,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  speedY?: number;
  speedRot?: number;
  phase?: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();

    const offsetY = Math.sin(t * speedY + phase) * 0.09;
    ref.current.position.y = position[1] + offsetY;
    ref.current.rotation.y = rotation[1] + t * speedRot * 0.9;
    ref.current.rotation.x = rotation[0] + Math.sin(t * 0.4 + phase) * 0.15;
  });

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      {/* Tablet Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.12, 48]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.35}
          metalness={0.02}
          clearcoat={0.2}
        />
      </mesh>

      {/* Central Score Line (Groove) */}
      <mesh position={[0, 0.061, 0]}>
        <boxGeometry args={[0.5, 0.015, 0.03]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
      </mesh>
    </group>
  );
}

// 3. Molecular Glass Orb (Small connected atoms in a clear sphere)
export function MolecularOrb({
  position = [0, 0, 0],
  scale = 1,
  speedY = 1.1,
  phase = 3.0,
}: {
  position?: [number, number, number];
  scale?: number;
  speedY?: number;
  phase?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = position[1] + Math.sin(t * speedY + phase) * 0.1;
    groupRef.current.rotation.y = t * 0.4;
    groupRef.current.rotation.x = t * 0.2;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Atoms */}
      <mesh position={[0.07, 0.07, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#4a90d9" roughness={0.3} />
      </mesh>
      <mesh position={[-0.07, -0.05, 0.05]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#6366f1" roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.06, -0.06]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} />
      </mesh>

      {/* Outer Protective Translucent Bubble */}
      <mesh>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshPhysicalMaterial
          color="#f0f9ff"
          transmission={0.92}
          roughness={0.1}
          ior={1.35}
          transparent
          opacity={0.8}
          clearcoat={0.5}
        />
      </mesh>
    </group>
  );
}

export default function FloatingElements() {
  return (
    <group name="FloatingBiotechElements">
      {/* 1. Large prominent bi-color capsule (Top-Left foreground) */}
      <BiColorCapsule
        position={[-2.3, 1.3, 0.6]}
        rotation={[0.5, 0.3, 0.8]}
        scale={1.15}
        speedY={1.1}
        speedRot={0.3}
        phase={0.2}
      />

      {/* 2. Medium bi-color capsule (Bottom-Right foreground) */}
      <BiColorCapsule
        position={[2.3, -1.2, 0.7]}
        rotation={[-0.4, 0.8, -0.6]}
        scale={1.05}
        speedY={0.95}
        speedRot={0.25}
        phase={2.4}
      />

      {/* 3. Small bi-color capsule (Top-Right midground) */}
      <BiColorCapsule
        position={[2.0, 1.5, -0.3]}
        rotation={[0.8, 0.2, 0.4]}
        scale={0.8}
        speedY={1.3}
        speedRot={0.4}
        phase={4.1}
      />

      {/* 4. Round Scored Medical Tablet (Bottom-Left midground) */}
      <ScoredTablet
        position={[-2.0, -1.4, 0.4]}
        rotation={[0.6, 0.4, 0.2]}
        scale={1.1}
        speedY={0.85}
        speedRot={0.22}
        phase={1.8}
      />

      {/* 5. Molecular Bubble (Top center background) */}
      <MolecularOrb
        position={[-0.5, 2.1, -0.5]}
        scale={1.1}
        speedY={0.9}
        phase={3.2}
      />
    </group>
  );
}
