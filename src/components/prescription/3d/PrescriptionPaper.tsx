'use client';

import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { createPrescriptionCanvasTexture, createPaperBumpTexture } from './PrescriptionTexture';
import type { PrescriptionPaperProps } from './types';

export default function PrescriptionPaper({
  width = 2.6,
  height = 3.68,
  segmentsX = 48,
  segmentsY = 48,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  castShadow = true,
  receiveShadow = true,
}: PrescriptionPaperProps) {
  const { geometry, texture, bumpTexture, material } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);
    const pos = geo.attributes.position;

    // Gentle natural paper curvature
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      const nx = x / width; // -0.5 to 0.5
      const ny = y / height; // -0.5 to 0.5

      // Natural gentle cylindrical curvature
      const bowX = Math.sin(nx * Math.PI * 0.85) * 0.09;
      const waveY = Math.cos(ny * Math.PI * 0.75) * 0.04;
      const cornerLift = Math.sin((nx + 0.5) * Math.PI) * Math.cos((ny + 0.5) * Math.PI) * 0.03;

      pos.setZ(i, bowX + waveY + cornerLift);
    }
    geo.computeVertexNormals();

    const tex = createPrescriptionCanvasTexture({ anisotropy: 16 });
    const bumpTex = createPaperBumpTexture(1024);

    const mat = new THREE.MeshPhysicalMaterial({
      map: tex,
      bumpMap: bumpTex,
      bumpScale: 0.004,
      roughness: 0.76,
      metalness: 0.0,
      side: THREE.DoubleSide,
      clearcoat: 0.04,
      clearcoatRoughness: 0.35,
      reflectivity: 0.15,
      sheen: 0.35,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color('#ffffff'),
    });

    return { geometry: geo, texture: tex, bumpTexture: bumpTex, material: mat };
  }, [width, height, segmentsX, segmentsY]);

  // Subtle clean backing sheet for pad realism
  const { backGeometry, backMaterial } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width * 1.008, height * 1.008, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: '#edf2f7',
      roughness: 0.85,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
    return { backGeometry: geo, backMaterial: mat };
  }, [width, height]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      texture.dispose();
      bumpTexture.dispose();
      material.dispose();
      backGeometry.dispose();
      backMaterial.dispose();
    };
  }, [geometry, texture, bumpTexture, material, backGeometry, backMaterial]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Backing sheet */}
      <mesh
        name="PrescriptionPadBacking"
        geometry={backGeometry}
        material={backMaterial}
        position={[0.03, -0.02, -0.05]}
        rotation={[0, 0, -0.02]}
        receiveShadow
      />

      {/* Primary prescription sheet */}
      <mesh
        name="PrescriptionPaper"
        geometry={geometry}
        material={material}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      />
    </group>
  );
}
