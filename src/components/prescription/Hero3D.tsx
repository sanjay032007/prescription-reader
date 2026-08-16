'use client';

import { Canvas } from '@react-three/fiber';
import PrescriptionScene from './3d/PrescriptionScene';

/**
 * 3D Prescription Hero Visual Component
 * React Three Fiber Scene with high-DPI procedural CanvasTexture, curved paper geometry,
 * floating frosted-glass capsules, ambient sparkles, studio lighting, and contact shadows.
 */
export default function Hero3D() {
  return (
    <div
      className="w-full max-w-[480px] h-[440px] sm:h-[500px] lg:h-[540px] relative rounded-[24px] overflow-hidden select-none"
      style={{ touchAction: 'pan-y' }}
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 42 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <ambientLight intensity={0.7} color="#f8fafc" />
        <directionalLight position={[5, 8, 5]} intensity={1.8} color="#ffffff" castShadow />
        <PrescriptionScene />
      </Canvas>
    </div>
  );
}
