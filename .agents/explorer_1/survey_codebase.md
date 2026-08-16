# Codebase & Architecture Survey Report: 3D Prescription Hero Visual

**Date:** 2026-08-16  
**Investigator:** Explorer 1  
**Project:** Prescription Reader — 3D Interactive Prescription Hero Visual  
**Target File Path:** src/components/prescription/HeroSection.tsx & src/components/prescription/Hero3D.tsx

---

## 1. Executive Summary

This survey examines the Next.js 16 / React 19 application architecture, package ecosystem, visual style guidelines, and runtime environment to prepare the implementation plan for the photorealistic 3D interactive prescription visual in the hero section.

All core 3D libraries (	hree, @types/three, @react-three/fiber, @react-three/drei, @react-three/postprocessing) are already installed and compatible with React 19 and Next.js 16 App Router. Production builds (
ext build with Turbopack) compile cleanly in under 21 seconds.

---

## 2. Package Ecosystem & Dependencies

### Currently Installed Packages
Inspection of package.json reveals that all necessary 3D and animation dependencies are already in place:

| Package | Version Installed | Status | Purpose |
|---|---|---|---|
| 	hree | ^0.185.1 | Installed | Core WebGL 3D engine |
| @types/three | ^0.185.4 | Installed | TypeScript typings for Three.js |
| @react-three/fiber | ^9.7.0 | Installed | React 19 reconciler for Three.js scene graph |
| @react-three/drei | ^10.7.8 | Installed | R3F helpers (Float, MeshTransmissionMaterial, ContactShadows, Environment, etc.) |
| @react-three/postprocessing | ^3.0.5 | Installed | Bloom, Depth of Field, Tone mapping |
| ramer-motion | ^12.23.2 | Installed | UI transitions and DOM element animations |
| lucide-react | ^0.525.0 | Installed | Icon library |
| 
ext | ^16.1.1 (turbopack) | Installed | App Router framework |
| eact & eact-dom | ^19.0.0 | Installed | React 19 runtime |
| 	ailwindcss | ^4 (with @tailwindcss/postcss) | Installed | Tailwind CSS v4 styling |

### Dependency Installation Requirement
**No additional npm packages need to be installed.** Everything required to build the photorealistic 3D prescription sheet, procedural textures, interactive floating physics, glass pill capsules, and lighting is already present.

---

## 3. Existing HeroSection & Layout Architecture

### Current Structure of src/components/prescription/HeroSection.tsx
- **Section Wrapper**: <section className=relative w-full pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden>
- **Grid Layout**: 12-column grid (grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center)
  - **Left Column (lg:col-span-7)**: Headline (Understand your prescription instantly), value proposition, AI badge, and 3 trust badges (100% Private, Fast & Accurate, No Data Stored).
  - **Right Column (lg:col-span-5)**: Currently contains a pseudo-3D CSS tilted card (<div ref={cardRef} onMouseMove={handleMouseMove}>) with hardcoded text and static badge icons.

### Recommended Integration Architecture for 3D Hero Visual
1. **Component Separation**:
   - Create a dedicated component src/components/prescription/PrescriptionHero3D.tsx (or upgrade Hero3D.tsx) containing the R3F <Canvas> and all 3D scene elements.
   - In src/components/prescription/HeroSection.tsx, load the 3D visual using Next.js client-side dynamic import:
     `	sx
     import dynamic from next/dynamic;

     const PrescriptionHero3D = dynamic(
       () => import(@/components/prescription/PrescriptionHero3D),
       {
         ssr: false,
         loading: () => <PrescriptionHeroSkeleton />,
       }
     );
     `
2. **Container Sizing & Breakpoints**:
   - Container class: elative w-full max-w-[480px] h-[440px] sm:h-[500px] lg:h-[540px] mx-auto flex items-center justify-center
   - Aspect ratio: Accommodates floating Rx sheet (aspect ~1:1.41) alongside ambient hovering pill capsules and contact shadows without edge clipping.
3. **Canvas Configuration**:
   `	sx
   <Canvas
     camera={{ position: [0, 0, 5.2], fov: 42 }}
     dpr={[1, 2]}
     gl={{
       antialias: true,
       alpha: true,
       powerPreference: high-performance,
     }}
     style={{ width: 100%, height: 100%, pointerEvents: auto }}
   >
   `

---

## 4. Brand Palette, Visual Styling, & Studio Lighting

### Brand Colors & Style Tokens
Extracted from src/app/globals.css, BrandHeader.tsx, and HeroSection.tsx:

- **Primary Blue / Cyan**: #4a90d9 (Primary Brand Blue), #38bdf8 / #0891b2 (Cyan/Teal accents)
- **Indigo & Violet**: #6366f1 (Indigo accent), #a855f7 / #c084fc (Purple/Violet highlight)
- **Brand Hero Gradient**: linear-gradient(to right, #4a90d9, #6366f1, #a855f7)
- **Background Atmosphere**: linear-gradient(135deg, #e8f0fb 0%, #f0e8f8 50%, #fce8f0 100%)
- **Dark Elements / Typography**: #0a1628 (Primary heading navy), #1e293b (Slate-800 body), #64748b (Muted slate)
- **Typography / Fonts**:
  - DM Sans (via 
ext/font/google variable --font-dm-sans)
  - Serif italic style for medical handwriting and the Rx symbol
  - Cursive script style for the doctor signature
- **Icons**: Tabler Icons webfont (@tabler/icons-webfont@2.47.0) loaded via <head> in layout.tsx.

### 3D Studio Lighting Scheme
- **Key Light**: Warm white directional light from top-left (position: [4, 6, 4], intensity 1.8, soft shadow mapping).
- **Cyan Rim Light**: Vibrant cyan directional light from bottom-left (position: [-5, -2, -2], color #38bdf8, intensity 1.2) catching the curved paper edge.
- **Violet Back/Rim Light**: Soft violet directional light from top-right (position: [3, 4, -4], color #c084fc, intensity 1.0) highlighting translucent pill capsules.
- **Ambient Fill**: Gentle ambient light (intensity: 0.7, color #f8fafc).
- **Environment**: <Environment preset=city /> for physical reflections on glass capsule materials.

---

## 5. 3D Prescription Mesh, Texture & Physics Design

### 1. Curved Prescription Paper Mesh
- **Geometry**: Plane geometry subdivided into a grid (e.g. PlaneGeometry(2.4, 3.4, 32, 32)).
- **Physical Curvature**: Displace vertex z-coordinates using a gentle cylindrical/hyperbolic formula:
  z = -0.08 * (x^2) + 0.04 * sin(y * 1.5) creating realistic natural curl.
- **Material**: meshStandardMaterial with side: THREE.DoubleSide, oughness: 0.85, metalness: 0.05, and subtle normal bump/grain.

### 2. High-DPI Procedural Dynamic Canvas Texture
- Create an offscreen HTML <canvas> at **2048 x 2896 px** (sharp 2x A4 aspect ratio).
- Render:
  - Header: Dr. Anita Sharma, MBBS, MD — General Physician, Reg. No: 48921-A · City Health Clinic, Phone / Address line, clinic emblem.
  - Divider: Crisp hairline rule.
  - Large stylized italic **Rx** symbol in #4a90d9.
  - Handwritten prescription list:
    - Tab. Paracetamol 650 mg — [1 - 1 - 1]
    - Cap. Amoxicillin 500 mg — [1 - 0 - 1]
    - Syp. Levocetirizine 5 ml — [0 - 0 - 1]
  - Advice box: 💡 Advice: Drink warm fluids & take amoxicillin after food.
  - Doctor signature: Realistic cursive Dr. Sharma with underline and Verified Rx security stamp / seal.
- Texture Setup: 	exture.anisotropy = 16, 	exture.minFilter = THREE.LinearMipmapLinearFilter, 	exture.generateMipmaps = true.

### 3. Atmospheric Elements & Physics
- **Floating Pill Capsules**: 2-3 floating frosted glass capsules positioned in 3D orbit around the prescription paper using MeshTransmissionMaterial (roughness: 0.2, ior: 1.45, chromaticAberration: 0.03, color: #ffffff & #60a5fa).
- **Floating Particles**: 20-30 glowing micro-particles floating with gentle sine oscillations.
- **Pointer Parallax Rig**: Smooth lerp tracking cursor (pointer.x, pointer.y) with rotational inertia:
  otation.y = lerp(rotation.y, pointer.x * 0.25, 0.05) and otation.x = lerp(rotation.x, -pointer.y * 0.18, 0.05).
- **Harmonic Levitation**: Gentle continuous float: position.y = sin(clock.elapsedTime * 1.2) * 0.08.
- **Contact Shadows**: <ContactShadows position={[0, -2.0, 0]} opacity={0.35} scale={8} blur={2.5} far={4} color=#0a1628 />.

---

## 6. Build, SSR, & Runtime Pitfalls & Mitigations

| Pitfall | Risk | Mitigation Strategy |
|---|---|---|
| **SSR / Hydration Mismatch** | Canvas references window / WebGL APIs not present on server during SSR | Wrap 3D component with 
ext/dynamic(() => import(...), { ssr: false }) + Skeleton loader. |
| **WebGL Context Leaks** | Unmounting / remounting during client navigation leaving orphaned contexts | Ensure clean disposal of canvas textures, materials, and geometries on cleanup. |
| **High DPR Performance Choke** | 3x Retina displays causing frame drops | Explicitly cap DPR at dpr={[1, 2]} on <Canvas>. |
| **Turbopack / Postprocessing types** | @react-three/postprocessing v3 prop deprecations (disableNormalPass) | Use validated props and test build cleanly with 
ext build. |
| **Mobile Touch Interaction** | Pointer events on canvas interfering with page scroll | Set 	ouchAction: pan-y on outer container and clamp parallax angles. |

---

## 7. Next Steps for Implementation

1. **Step 1 (Model & Texture)**: Create procedural 2D canvas texture generator with high-resolution doctor prescription details.
2. **Step 2 (3D Mesh & Shader)**: Implement curved paper geometry with double-sided standard material and realistic rim lighting.
3. **Step 3 (Atmosphere & Capsules)**: Add transmission-shaded pill capsules, floating sparkles, and contact shadow.
4. **Step 4 (HeroSection Integration)**: Connect PrescriptionHero3D into HeroSection.tsx with dynamic import and responsive container styling.
5. **Step 5 (Build & Verification)**: Run full 
ext build test and verify 60 FPS performance.
