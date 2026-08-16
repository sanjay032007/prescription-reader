'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import PrescriptionPaper from './PrescriptionPaper';
import FloatingElements from './FloatingElements';
import Sparkles from './Sparkles';
import Lighting from './Lighting';

export default function PrescriptionScene() {
  const rigRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  // Responsive scale based on 3D viewport aspect
  const isMobile = viewport.width < 4.2;
  const paperScale = isMobile ? 0.88 : 1.0;

  useFrame((state, delta) => {
    if (!rigRef.current) return;
    const t = state.clock.getElapsedTime();

    // 1. Natural floating levitation bobbing
    const bobY = Math.sin(t * 1.0) * 0.05 + Math.cos(t * 0.5) * 0.02;
    rigRef.current.position.y = bobY;

    // 2. Subtle breathing tilt
    const breathX = Math.sin(t * 0.65) * 0.015;
    const breathZ = Math.cos(t * 0.55) * 0.015;

    // 3. Fluid cursor / touch parallax tracking
    const { x, y } = state.pointer;
    const targetY = THREE.MathUtils.clamp(x * 0.2, -0.22, 0.22);
    const targetX = THREE.MathUtils.clamp(-y * 0.12, -0.16, 0.16);

    targetRotation.current.x = THREE.MathUtils.damp(
      targetRotation.current.x,
      targetX + breathX,
      4.0,
      delta
    );
    targetRotation.current.y = THREE.MathUtils.damp(
      targetRotation.current.y,
      targetY,
      4.0,
      delta
    );

    rigRef.current.rotation.x = targetRotation.current.x;
    rigRef.current.rotation.y = targetRotation.current.y;
    rigRef.current.rotation.z = breathZ;
  });

  return (
    <>
      <Lighting />
      <Sparkles count={18} />

      <group ref={rigRef} position={[0, 0, 0]} scale={paperScale}>
        {/* Floating Physical Prescription Sheet */}
        <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.2}>
          <PrescriptionPaper
            width={2.6}
            height={3.68}
            position={[0, 0, 0]}
            rotation={[0, -0.04, 0.025]}
          />
        </Float>

        {/* Surrounding Floating Biotech Accents */}
        <FloatingElements />
      </group>

      {/* Grounding Contact Shadow */}
      <ContactShadows
        position={[0, -2.1, 0]}
        opacity={0.35}
        scale={8.5}
        blur={2.5}
        far={5.0}
        color="#0c1a2e"
      />
    </>
  );
}
