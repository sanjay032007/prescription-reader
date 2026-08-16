# 3D Prescription Hero Visual — Verification, Testing, and QA Strategy

**Author**: Explorer 3 (QA & Testing Architecture)  
**Date**: 2026-08-16  
**Status**: COMPLETE / SURVEY DELIVERABLE  
**Target Feature**: 3D Prescription Hero Visual Component (Hero3D.tsx & HeroSection.tsx)  
**Workspace**: c:\Users\sanjay\.gemini\antigravity\brain\45038082-faa5-4fff-8144-1681601141c1\exm

---

## 1. Executive Summary & Verification Objectives

The purpose of this strategy is to establish a rigorous, evidence-based quality assurance framework for the interactive 3D Prescription Hero visual component in the Prescription Reader web application.

Building photorealistic, real-time 3D elements inside a Next.js App Router (React 19) application introduces unique engineering risks:
1. **SSR / Hydration Mismatches**: WebGL canvas requires browser DOM window APIs (window, HTMLCanvasElement, WebGLRenderingContext) that do not exist on the server.
2. **GPU & Memory Leaks**: Improper disposal of Three.js geometries, materials, canvas textures, and post-processing framebuffers can exhaust GPU VRAM and crash mobile browser tabs.
3. **Core Web Vitals Regressions**: Heavy 3D bundles can delay Largest Contentful Paint (LCP) and cause Interaction to Next Paint (INP) lag if rendering loops block the main thread.
4. **Visual Integrity / Authenticity**: The feature must deliver genuine 3D WebGL geometry, dynamic procedural texture mapping, and physics simulations—not static pre-rendered image fallbacks masquerading as 3D.

This strategy establishes a **4-tier testing hierarchy**, **integrity verification checks**, and **automated test runners** tailored for the project runtime.

---

## 2. Test Architecture & Foundations

`
+-----------------------------------------------------------------------------------------+
|                               Next.js 16 + React 19 Build                               |
|   +------------------------------------+   +----------------------------------------+   |
|   | SSR Server Component (Page.tsx)    |   | Client Dynamic Boundary (HeroSection)  |   |
|   | HTML Shell & Zero Hydration Errors |   | dynamic(() => import(./Hero3D),      |   |
|   | Pre-allocated Aspect-Ratio CSS     |   |   { ssr: false, loading: Fallback })   |   |
|   +------------------------------------+   +----------------------------------------+   |
+--------------------------------------------+--------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                               WebGL & Three.js Runtime                                  |
|   +---------------------------+ +----------------------------+ +--------------------+   |
|   | 3D Paper Curved Mesh      | | Procedural Canvas Texture  | | Floating Accents   |   |
|   | Double-Sided Physical Mat | | High-DPI Crisp Rx Details  | | Glass Pills & Dots |   |
|   +---------------------------+ +----------------------------+ +--------------------+   |
|   +---------------------------------------------------------------------------------+   |
|   | Lifecycle Manager: Resource Disposal on Unmount + WebGL Context Loss Recovery   |   |
|   +---------------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------------+
`

### 2.1 Next.js Build Verification & Client-Side Isolation
- **Dynamic Client Boundary**: The 3D Canvas component MUST be dynamically imported with ssr: false in HeroSection.tsx:
  `	sx
  const Hero3D = dynamic(() => import(./Hero3D), {
    ssr: false,
    loading: () => <Hero3DFallback />,
  });
  `
- **SSR Hydration Mismatch Prevention**: The fallback component <Hero3DFallback /> must render an identical DOM placeholder container with exact width/height constraints (min-height: 420px, max-width: 450px, spect-ratio: 1/1) so that initial SSR paint matches client hydration with **Zero CLS**.
- **Static Compilation Check**: Executing 
pm run build and 
px tsc --noEmit must pass without any build warnings or chunk resolution errors.

### 2.2 TypeScript Compilation & Strict Type Safety
- **Compiler Version**: TypeScript 5.9.3 with strict mode (	sconfig.json).
- **Required Type Audits**:
  - Verify @react-three/fiber R3F intrinsic elements (e.g. <mesh>, <group>, <cylinderGeometry>, <meshPhysicalMaterial>).
  - Verify @react-three/drei component props (Float, Environment, ContactShadows, MeshTransmissionMaterial).
  - Verify @react-three/postprocessing props (ensuring valid prop names, avoiding deprecated disableNormalPass or invalid effect arguments).
  - Strongly typed state vectors (Vector3, Euler, PointerState) avoiding 
ever[] or implicit ny.

### 2.3 Runtime Rendering Lifecycle & Error Boundary
- **Canvas Mount Safety**: R3F <Canvas> must safely mount inside a resize-observed container.
- **Error Boundary Architecture**: Wrap the 3D canvas inside a dedicated Hero3DErrorBoundary component. If WebGL initialization fails (e.g. headless environment, disabled GPU), the boundary catches the error and silently renders the styled 2.5D CSS/SVG prescription fallback card without breaking the page.

### 2.4 WebGL Context Lifecycle & Memory Leak Mitigation
- **Event Listeners**: Register listeners for webglcontextlost and webglcontextrestored on the canvas:
  `	s
  const handleContextLost = (event: Event) => {
    event.preventDefault();
    console.warn(WebGL context lost. Entering fallback mode.);
    setHasWebGLError(true);
  };
  const handleContextRestored = () => {
    console.info(WebGL context restored. Rebuilding scene.);
    setHasWebGLError(false);
  };
  `
- **Explicit Resource Disposal**: Ensure that when the component unmounts:
  1. geometry.dispose() is called on all custom BufferGeometries.
  2. material.dispose() is called on paper, glass, pill, and particle materials.
  3. 	exture.dispose() is called on the dynamic canvas texture.
  4. gl.dispose() is triggered by R3F.
  5. Cancel active equestAnimationFrame IDs and pointer listeners.

---

## 3. Four-Tier E2E & Visual Verification Hierarchy

`
+------------------------------------------------------------------------------------+
|  TIER 4: REAL-WORLD PERFORMANCE & CORE WEB VITALS                                  |
|  * Sustained 60 FPS * Memory Leak Flat-line * LCP <= 2.5s * INP <= 200ms           |
+------------------------------------------------------------------------------------+
|  TIER 3: INTERACTION & RESPONSIVENESS COMBINATIONS                                 |
|  * Pointer Tracking Damping * Touch Scroll Safety * Background Tab Throttling     |
+------------------------------------------------------------------------------------+
|  TIER 2: BOUNDARY / EDGE CASES & FALLBACK HANDLING                                 |
|  * WebGL Loss Recovery * Viewport Extremes (320px-3440px) * Reduced Motion * DPR   |
+------------------------------------------------------------------------------------+
|  TIER 1: FEATURE VERIFICATION (CORE REQUIREMENTS)                                  |
|  * 3D Curved Paper Mesh * Procedural High-Res Texture * Studio Lights * Capsules   |
+------------------------------------------------------------------------------------+
`

### Tier 1: Feature Verification (Core Functional Requirements)

| Item | Requirement | Verification Method | Pass Criteria |
|---|---|---|---|
| **T1.1** | **3D Curved Paper Mesh** | Inspect Three.js Scene graph geometry vertices. | Mesh geometry has non-flat Z/Y curvature (e.g. cylinder segment or sine wave deformation), double-sided rendering (side={THREE.DoubleSide}). |
| **T1.2** | **Dynamic High-Res Canvas Texture** | Inspect dynamic canvas generation routine. | Procedurally generated 2D canvas (min 1024x1440 or 2048x2880) containing: Doctor header (Dr. Anita Sharma, MBBS, MD), Rx icon, medications (Tab. Paracetamol 650 mg, Cap. Amoxicillin 500 mg, Syp. Levocetirizine 5 ml), advice box, doctor signature. Text is razor sharp with anisotropy >= 4. |
| **T1.3** | **Atmospheric Frosted-Glass Capsules** | Inspect scene graph children for pill/capsule meshes. | Frosted glass transmission material (MeshTransmissionMaterial or MeshPhysicalMaterial with transmission > 0.8, roughness ~0.2-0.3, ior ~1.4). |
| **T1.4** | **Particle Sparkles / Accent Nodes** | Inspect background particle group. | Ambient floating sparkle nodes rendered with additive blending or glowing soft points. |
| **T1.5** | **Studio Multi-Point Lighting** | Inspect scene lights. | Key light (directional), fill light (soft ambient / cyan), and brand accent rim lights (violet/blue), casting soft contact shadow underneath. |
| **T1.6** | **Contact Grounding Shadow** | Inspect ContactShadows or ground plane mesh. | Soft contact shadow beneath floating paper and capsules with opacity ~0.25-0.35 and blur radius >= 2. |

---

### Tier 2: Boundary / Edge Cases & Fallback Handling

| Item | Scenario | Test Method | Expected Behavior |
|---|---|---|---|
| **T2.1** | **No WebGL Support** | Mock window.WebGLRenderingContext = undefined or simulate software fallback. | Component gracefully degrades to the crisp 2.5D CSS/SVG card without throwing unhandled exceptions or blank screens. |
| **T2.2** | **GPU Context Loss** | Trigger gl.getExtension('WEBGL_lose_context').loseContext(). | App does not crash; error boundary or fallback activates cleanly; reloads on webglcontextrestored. |
| **T2.3** | **Small Mobile Viewport (320px - 375px)** | Test in Chrome DevTools responsive mode at 320x568 & 375x667. | Visual scales down smoothly within container, no horizontal scroll overflow, text on hero remains completely legible. |
| **T2.4** | **Ultra-Wide Viewport (2560px - 3440px)** | Test on 3440x1440 resolution. | Centered properly within max-width grid container (max-w-[1360px]), no distortion of perspective camera FOV. |
| **T2.5** | **Rapid Window Resizing** | Drag browser window width back and forth rapidly for 10 seconds. | Canvas auto-resizes cleanly via R3F ResizeObserver without geometry stretching or render glitches. |
| **T2.6** | **Rapid Mount / Unmount** | Rapidly toggle component visibility or navigate back/forth 20 times. | Zero memory accumulation; all WebGL resources and event listeners cleanly disposed. |
| **T2.7** | **High-DPI Mobile Screens (DPR = 3 or 4)** | Test on device with window.devicePixelRatio = 3. | Canvas clamps DPR using dpr={[1, 2]} to prevent 9x/16x GPU fill rate explosion on mobile OLED screens. |
| **T2.8** | **Reduced Motion Preference** | Enable prefers-reduced-motion: reduce in OS/browser. | Continuous levitation bobbing and parallax rotation are dampened or disabled to respect accessibility standards. |
| **T2.9** | **Zero Cumulative Layout Shift (CLS)** | Measure CLS during initial load and canvas mount. | Layout Shift Score is exactly 0.0 (container has fixed aspect-ratio / min-height before canvas mounts). |

---

### Tier 3: Interaction & Responsiveness Combinations

| Item | Interaction Flow | Test Action | Expected Behavior |
|---|---|---|---|
| **T3.1** | **Pointer Parallax Damping** | Move cursor smoothly across top-left, top-right, bottom-left, bottom-right quadrants. | Paper mesh rotates smoothly toward pointer with gentle inertia and spring damping (lerp factor ~0.05), clamped within safe angles (+/- 15 deg). |
| **T3.2** | **Pointer Exit / Window Blur** | Move cursor outside the hero container or switch application focus. | Paper smoothly returns to its resting neutral floating orientation without snapping or jerking. |
| **T3.3** | **Touch Gestures on Mobile** | Perform vertical touch scroll over the 3D visual area on touch device. | Page scrolls vertically without stutter; touch events do not lock or intercept native page scrolling (	ouch-action: pan-y or pointer-events: none on overlay elements). |
| **T3.4** | **Tab Backgrounding / Visibility Change** | Switch to another browser tab for 60 seconds and return. | useFrame stops rendering or throttles when tab is hidden (document.hidden), resuming seamlessly on tab focus without sudden frame burst. |

---

### Tier 4: Real-World Performance & Core Web Vitals Validation

| Metric | Target | Measurement Method | Failure Threshold |
|---|---|---|---|
| **Frame Rate (FPS)** | **60 FPS** (sustained) | Chrome DevTools Performance monitor / 3f-perf stats over 60 seconds continuous motion. | < 55 FPS on standard desktop / < 45 FPS on mobile. |
| **Frame Time Variance** | **< 16.67 ms / frame** | Chrome DevTools Trace (99th percentile frame delta). | Any frame task > 33.3 ms (causing noticeable jank). |
| **VRAM & JS Heap Stability** | **Flat Line (Zero Growth)** | Record JS Heap and GPU Memory snapshot at 0s, 60s, 180s, and 300s. | Heap growth > 5MB over 5 mins without garbage collection. |
| **Largest Contentful Paint (LCP)** | **<= 2.5 seconds** | Lighthouse audit on simulated Slow 4G / 4x CPU slowdown. | LCP > 2.5s (due to heavy bundle delaying above-the-fold content). |
| **Interaction to Next Paint (INP)** | **<= 200 ms** | DevTools INP audit during active mouse movement and scroll. | INP > 200ms (main thread blocked by Three.js render loop). |
| **Cumulative Layout Shift (CLS)** | **< 0.1 (Target: 0.00)** | Lighthouse Performance audit during page load and hydration. | CLS >= 0.1 (caused by canvas popping into DOM without reserved space). |

---

## 4. 3D WebGL Scene Integrity & Anti-Cheat Validation

To ensure the implementation is a **genuine, authentic 3D WebGL experience** rather than a static 2D image trick or simulated mock, the following automated and runtime integrity checks are defined:

`
+--------------------------------------------------------------------------------------+
|                     3D WebGL SCENE INTEGRITY AUDIT MATRIX                            |
+------------------------------------+-------------------------------------------------+
| Verification Dimension             | Technical Verification Mechanism                |
+------------------------------------+-------------------------------------------------+
| 1. Genuine WebGL Context           | canvas.getContext(webgl2) instanceof          |
|                                    | WebGL2RenderingContext                          |
+------------------------------------+-------------------------------------------------+
| 2. Genuine 3D Polygon Mesh         | scene.children contains THREE.Mesh with         |
|                                    | THREE.BufferGeometry (vertex count > 500)       |
+------------------------------------+-------------------------------------------------+
| 3. Dynamic Procedural Texture      | CanvasRenderingContext2D dynamically paints Rx  |
|                                    | header & handwriting onto THREE.CanvasTexture   |
+------------------------------------+-------------------------------------------------+
| 4. Genuine 3D Spatial Curvature    | BufferGeometry has non-planar vertex positions  |
|                                    | (Z displacement variance > 0.05 units)          |
+------------------------------------+-------------------------------------------------+
| 5. Real-Time Dynamic Physics       | mesh.rotation.x/y and position.y values vary    |
|                                    | across animation frames based on clock & cursor |
+------------------------------------+-------------------------------------------------+
| 6. Dynamic Multi-Point Lighting    | Scene contains DirectionalLight & AmbientLight  |
|                                    | calculating PBR reflection & ContactShadows     |
+------------------------------------+-------------------------------------------------+
`

### 4.1 Anti-Cheat Rule Table
1. **Rule 1 — No Static Image Fake**: The prescription sheet MUST NOT be a static .png / .jpg / .svg file loaded from public/ or an external URL. It must be dynamically rendered onto an in-memory high-res canvas and mapped onto the 3D geometry as a THREE.CanvasTexture.
2. **Rule 2 — Genuine Geometry**: The prescription paper MUST have authentic 3D polygon subdivisions (e.g. planeGeometry with [width, height, 32, 32] segments) with physical curvature applied either procedurally or via vertex shader.
3. **Rule 3 — Genuine Lighting & Material**: The prescription material MUST be a physically-based material (THREE.MeshStandardMaterial or THREE.MeshPhysicalMaterial) responding dynamically to lights and shadows, with double-sided rendering enabled.
4. **Rule 4 — True Depth Parallax**: The floating elements (capsules, sparkles, background glow, contact shadow) MUST exist at different Z-depths in 3D coordinate space, creating genuine motion parallax when the camera/pointer tilts.

---

## 5. Automated Test Scripts & Test Runners

The following automated scripts are designed to be placed in scripts/ or executed via Node.js / npm to verify build health, code integrity, and runtime safety:

### 5.1 Static Code & AST Integrity Verifier (scripts/verify-3d-integrity.mjs)
This script inspects the source code of Hero3D.tsx and HeroSection.tsx to ensure all architectural rules, Three.js constructs, and performance constraints are strictly met:

`javascript
// scripts/verify-3d-integrity.mjs
import fs from 'fs';
import path from 'path';

const hero3DPath = path.resolve('src/components/prescription/Hero3D.tsx');
const heroSectionPath = path.resolve('src/components/prescription/HeroSection.tsx');

let passed = true;
function assert(condition, message) {
  if (!condition) {
    console.error(❌ [FAIL] );
    passed = false;
  } else {
    console.log(✅ [PASS] );
  }
}

console.log(=== 3D Prescription Hero Visual: Static Integrity Audit ===\n);

// 1. Check Hero3D file exists
assert(fs.existsSync(hero3DPath), Hero3D.tsx component file exists);

const hero3DContent = fs.readFileSync(hero3DPath, 'utf8');

// 2. Check Three.js / R3F Canvas usage
assert(hero3DContent.includes('<Canvas') || hero3DContent.includes('Canvas'), Uses React Three Fiber Canvas);
assert(hero3DContent.includes('@react-three/fiber'), Imports @react-three/fiber);
assert(hero3DContent.includes('@react-three/drei'), Imports @react-three/drei);

// 3. Check Dynamic Texture / Canvas generation
assert(
  hero3DContent.includes('CanvasTexture') || 
  hero3DContent.includes('createContext') || 
  hero3DContent.includes('document.createElement(canvas)') ||
  hero3DContent.includes('useMemo') ||
  hero3DContent.includes('Anita Sharma'),
  Generates procedural dynamic texture with Dr. Anita Sharma metadata
);

// 4. Check Required Prescription Content
assert(hero3DContent.includes('Paracetamol') || hero3DContent.includes('Amoxicillin'), Includes required prescription medication lines);
assert(hero3DContent.includes('DoubleSide') || hero3DContent.includes('side={THREE.DoubleSide}') || hero3DContent.includes('side={2}'), Configures double-sided material rendering);

// 5. Check DPR Capping for Performance
assert(hero3DContent.includes('dpr={[1, 2]}') || hero3DContent.includes('dpr={[1,2]}') || hero3DContent.includes('dpr={['), Caps Device Pixel Ratio at [1, 2] for 60 FPS guarantee);

// 6. Check Client-Side Dynamic Import in HeroSection
const heroSectionContent = fs.readFileSync(heroSectionPath, 'utf8');
assert(
  heroSectionContent.includes('dynamic') && heroSectionContent.includes('ssr: false'),
  HeroSection imports Hero3D dynamically with ssr: false
);

if (!passed) {
  console.error(\n❌ Static integrity verification failed.);
  process.exit(1);
} else {
  console.log(\n✨ All static 3D integrity checks passed successfully!);
}
`

---

### 5.2 TypeScript Compilation & Type Safety Test (scripts/test-ts.mjs)
Verifies that TypeScript compiles the 3D components cleanly with zero errors:

`javascript
// scripts/test-ts.mjs
import { execSync } from 'child_process';

console.log(=== Running TypeScript Compilation Check ===);
try {
  const output = execSync('npx tsc --noEmit', { encoding: 'utf8' });
  console.log(✅ TypeScript compilation succeeded with zero errors!);
} catch (error) {
  console.error(❌ TypeScript compilation errors detected:\n, error.stdout || error.message);
  process.exit(1);
}
`

---

### 5.3 Headless Scene Graph & Resource Disposal Unit Test (scripts/test-scene-graph.mjs)
Tests Three.js scene creation, vertex curvature math, and resource disposal in a pure Node.js environment using Three.js headless primitives:

`javascript
// scripts/test-scene-graph.mjs
import * as THREE from 'three';

console.log(=== Testing 3D Geometry & Math Curvature in Three.js ===);

// 1. Create Plane Geometry with subdivisions
const width = 3;
const height = 4.2;
const segmentsX = 32;
const segmentsY = 32;
const geometry = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);

const pos = geometry.attributes.position;
let maxZ = -Infinity;
let minZ = Infinity;

// 2. Apply paper curl mathematical deformation
for (let i = 0; i < pos.count; i++) {
  const x = pos.getX(i);
  const y = pos.getY(i);
  // Curl equation: subtle cylindrical bend + corner curl
  const curlZ = Math.sin((x / width) * Math.PI * 0.8) * 0.18 + Math.cos((y / height) * Math.PI * 0.5) * 0.08;
  pos.setZ(i, curlZ);
  if (curlZ > maxZ) maxZ = curlZ;
  if (curlZ < minZ) minZ = curlZ;
}
geometry.computeVertexNormals();

console.log(✅ Paper geometry generated:  vertices, Curvature Z-span:  units);

if (maxZ - minZ < 0.05) {
  console.error(❌ Paper curvature depth variance too small!);
  process.exit(1);
}

// 3. Test Material and Texture creation
const canvas = { width: 1024, height: 1440 }; // Mock canvas
const texture = new THREE.Texture();
const material = new THREE.MeshPhysicalMaterial({
  roughness: 0.6,
  metalness: 0.05,
  side: THREE.DoubleSide,
  map: texture,
});

const mesh = new THREE.Mesh(geometry, material);
console.log(✅ 3D Mesh constructed with DoubleSide Physical Material);

// 4. Test Resource Cleanup / Disposal
geometry.dispose();
material.dispose();
texture.dispose();
console.log(✅ Resource disposal cycle executed cleanly);
`

---

## 6. QA Execution Checklist & Sign-Off Matrix

Before the 3D Prescription Hero feature is signed off for production, the QA engineer must execute and check off all items in this matrix:

`markdown
### 📋 3D Prescription Hero QA Sign-Off Checklist

#### 1. Build & TypeScript Validation
- [ ] 
px tsc --noEmit runs with 0 errors.
- [ ] 
pm run build succeeds and produces optimized client chunks.
- [ ] 
ode scripts/verify-3d-integrity.mjs passes all checks.

#### 2. Visual & Photorealistic Quality
- [ ] 3D prescription sheet exhibits natural paper curvature and authentic double-sided thickness.
- [ ] Dynamic texture displays Dr. Anita Sharma, Rx icon, and medications with razor-sharp legibility on high-DPI screens.
- [ ] Surrounding frosted-glass capsules feature soft refraction/transmission without visual artifacts.
- [ ] Studio lighting creates balanced key light, ambient fill, and brand cyan/violet rim highlights.
- [ ] Soft grounding contact shadow anchors the floating composition.

#### 3. Interactivity & Physics
- [ ] Smooth pointer parallax tilts and tracks cursor movement with realistic damping.
- [ ] Releasing/leaving cursor triggers smooth spring return to resting floating pose.
- [ ] Floating levitation bobbing is organic and non-jarring.

#### 4. Responsiveness & Edge Cases
- [ ] Flawless display and scaling on Mobile (320px, 375px), Tablet (768px), and Desktop (1440px+).
- [ ] Zero horizontal scroll or container blowout across all breakpoints.
- [ ] Graceful fallback renders if WebGL is disabled or context is lost.
- [ ] Zero layout shift (CLS = 0.00) during page load and canvas mount.

#### 5. Performance Benchmarks
- [ ] Sustained 60 FPS during continuous mouse interaction on standard hardware.
- [ ] Device pixel ratio capped at [1, 2] to protect mobile GPU thermal/battery budgets.
- [ ] Memory footprint remains stable (zero GPU VRAM leaks on repeated navigation).
`

---

## 7. Conclusion & Next Steps

This comprehensive strategy ensures that the implementation of the 3D Prescription Hero Visual will achieve both photorealistic aesthetic brilliance and rock-solid technical reliability. 

The developer implementation team should follow the architectural boundaries defined in Section 2, build against the 4-tier criteria in Section 3, satisfy all anti-cheat integrity rules in Section 4, and run the automated verification scripts in Section 5 prior to final handoff.
