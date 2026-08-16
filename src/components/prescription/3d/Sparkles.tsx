'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SparkleParticle {
  position: [number, number, number];
  scale: number;
  speed: number;
  phase: number;
  color: string;
}

export default function Sparkles({ count = 28 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const particles = useMemo<SparkleParticle[]>(() => {
    const palette = ['#38bdf8', '#818cf8', '#c084fc', '#60a5fa', '#ffffff'];
    const items: SparkleParticle[] = [];

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 6.5;
      const y = (Math.random() - 0.5) * 5.0;
      const z = (Math.random() - 0.5) * 3.0 - 0.5;
      const scale = 0.02 + Math.random() * 0.04;
      const speed = 0.5 + Math.random() * 0.8;
      const phase = Math.random() * Math.PI * 2;
      const color = palette[Math.floor(Math.random() * palette.length)];

      items.push({ position: [x, y, z], scale, speed, phase, color });
    }
    return items;
  }, [count]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;
      const pulse = 1 + Math.sin(t * p.speed + p.phase) * 0.35;
      child.scale.set(p.scale * pulse, p.scale * pulse, p.scale * pulse);
      child.position.y = p.position[1] + Math.sin(t * (p.speed * 0.5) + p.phase) * 0.08;
    });
  });

  return (
    <group ref={groupRef} name="Sparkles">
      {particles.map((p, idx) => (
        <mesh key={idx} position={p.position}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color={p.color} transparent opacity={0.65} />
        </mesh>
      ))}
    </group>
  );
}
