'use client';

export default function Lighting() {
  return (
    <group name="StudioLightingRig">
      {/* 1. Main Key Light: Warm neutral directional light with shadow mapping */}
      <directionalLight
        name="KeyLight"
        position={[5, 8, 5]}
        intensity={2.0}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />

      {/* 2. Soft Cool Ambient Fill */}
      <directionalLight
        name="FillLight"
        position={[-5, 3, -2]}
        intensity={0.9}
        color="#e0f2fe"
      />

      {/* 3. Brand Rim Light 1: Cyan specular edge highlight */}
      <directionalLight
        name="CyanRim"
        position={[-4, 2, -3]}
        intensity={1.4}
        color="#38bdf8"
      />

      {/* 4. Brand Rim Light 2: Violet/Lavender specular edge highlight */}
      <directionalLight
        name="VioletRim"
        position={[4, 4, -4]}
        intensity={1.2}
        color="#c084fc"
      />

      {/* 5. Ambient Light for balanced shadows */}
      <ambientLight name="Ambient" intensity={0.75} color="#f8fafc" />
    </group>
  );
}
