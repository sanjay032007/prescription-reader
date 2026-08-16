# 3D Prescription Hero Visual — Test Architecture & Infrastructure

## 1. Executive Summary & Verification Philosophy

This document defines the comprehensive, requirement-driven, opaque-box E2E testing framework for the **3D Interactive Prescription Hero Visual** in the Prescription Reader web application.

The testing philosophy is founded on three pillars:
1. **Opaque-Box Requirement Verification**: Tests validate observable behaviors, visual geometry, rendering outputs, and runtime safety against explicit requirements in `ORIGINAL_REQUEST.md` rather than internal implementation quirks.
2. **Anti-Cheat Integrity Enforcement**: Prevents pseudo-3D compromises (such as static images, flat 2D planes without vertex depth, or unlit mocks) by programmatically inspecting 3D vertex displacement, procedural texture generation, double-sided PBR shaders, and multi-point lighting.
3. **4-Tier Test Hierarchy**: Spans Core Functional Requirements (Tier 1), Boundary & Edge Cases (Tier 2), Interaction & Responsiveness (Tier 3), and Real-World Performance & Core Web Vitals (Tier 4).

```
+-----------------------------------------------------------------------------------------+
|                                4-TIER TESTING HIERARCHY                                 |
+-----------------------------------------------------------------------------------------+
|  TIER 4: REAL-WORLD PERFORMANCE & CORE WEB VITALS                                       |
|  * Sustained 60 FPS Target * Zero GPU VRAM Leaks * LCP <= 2.5s * INP <= 200ms           |
+-----------------------------------------------------------------------------------------+
|  TIER 3: INTERACTION & RESPONSIVENESS COMBINATIONS                                      |
|  * Pointer Parallax Damping * Touch Scroll Non-Interference * Tab Visibility Throttling |
+-----------------------------------------------------------------------------------------+
|  TIER 2: BOUNDARY / EDGE CASES & FALLBACK HANDLING                                      |
|  * WebGL Context Loss Recovery * Viewport Extremes (320px-3440px) * DPR Capping [1, 2]   |
+-----------------------------------------------------------------------------------------+
|  TIER 1: FEATURE VERIFICATION (CORE REQUIREMENTS)                                       |
|  * Curved 3D Paper Mesh * Procedural High-Res Texture * Studio Lighting * Pill Capsules |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Test Suite Architecture & Script Inventory

All test suites are implemented as zero-dependency ES Modules executable in Node.js 20+ with native Three.js integration.

| Script Path | Primary Focus | Tier Coverage |
|---|---|---|
| `scripts/verify-3d-integrity.mjs` | Static AST & Architectural Integrity Verification | Tier 1, Tier 2 |
| `scripts/test-scene-graph.mjs` | Headless Three.js Scene Graph & Math Curvature Unit Tests | Tier 1, Tier 4 |
| `scripts/test-hero-integration.mjs` | HeroSection Integration, Fallback, SSR, & Type Safety | Tier 2, Tier 3 |
| `scripts/run-all-e2e-tests.mjs` | Master E2E Test Suite Runner & Metrics Aggregator | Tiers 1-4 |

---

## 3. Four-Tier Feature Inventory Coverage

### Tier 1: Core Functional Feature Verification
- **T1.1 3D Curved Paper Mesh**: Genuine 3D plane geometry with `segmentsX >= 16, segmentsY >= 16` and vertex Z displacement variance >= 0.05 units creating realistic paper curl.
- **T1.2 Double-Sided PBR Material**: Double-sided rendering (`THREE.DoubleSide`) with physical roughness and subtle paper sheen.
- **T1.3 Procedural Dynamic Canvas Texture**: Offscreen 2D canvas dynamically rendering:
  - Doctor Header: Dr. Anita Sharma, MBBS, MD, General Physician, Reg. No: 48921-A, City Health Clinic.
  - Stylized Italic Rx symbol.
  - Handwritten prescription items: Tab. Paracetamol 650 mg (1-1-1), Cap. Amoxicillin 500 mg (1-0-1), Syp. Levocetirizine 5 ml (0-0-1).
  - Advice box: Drink warm fluids & take amoxicillin after food.
  - Doctor cursive signature with Verified Rx security stamp.
- **T1.4 Floating Glass Pill Capsules**: Frosted glass transmission material with realistic IOR (1.2 - 1.5) and refraction.
- **T1.5 Ambient Glowing Sparkles**: Background particle nodes floating in 3D coordinate space.
- **T1.6 Studio Multi-Point Lighting**: Cinematic 3-point lighting setup with key light, ambient fill, and brand cyan/violet rim accents.
- **T1.7 Grounding Contact Shadow**: Soft contact shadow anchoring the floating 3D composition.

### Tier 2: Boundary & Edge Cases
- **T2.1 Client-Side Dynamic Import**: Next.js dynamic import with `ssr: false` to eliminate SSR/hydration mismatches.
- **T2.2 Smooth Skeleton Fallback**: Identical CSS dimensioned placeholder preventing layout shifts during initial render.
- **T2.3 Device Pixel Ratio Clamping**: Canvas `dpr={[1, 2]}` capping to prevent GPU fill rate throttling on 3x/4x mobile screens.
- **T2.4 WebGL Context Loss Recovery**: Clean fallback handling on GPU context loss.
- **T2.5 Responsive Viewport Scalability**: Tested across mobile (320px, 375px), tablet (768px), and ultra-wide (2560px+) viewports.
- **T2.6 Rapid Mount/Unmount Memory Safety**: Clean disposal of geometry, materials, and textures without VRAM leaks.

### Tier 3: Interaction & Responsiveness
- **T3.1 Pointer Parallax Physics**: Smooth cursor tracking with rotational inertia, spring damping (lerp factor ~0.05), and clamped rotation angles (+/- 15°).
- **T3.2 Pointer Exit Reset**: Graceful return to neutral resting floating orientation on cursor leave.
- **T3.3 Non-Blocking Mobile Touch**: `touch-action: pan-y` ensuring vertical mobile page scrolling is never blocked.
- **T3.4 Background Tab Throttling**: Frame loop throttling when document is hidden to conserve battery.

### Tier 4: Real-World Performance & Core Web Vitals
- **T4.1 Sustained 60 FPS**: Steady 60 frames per second render budget (< 16.67 ms/frame).
- **T4.2 Zero Memory Accumulation**: Flat-line JS heap and GPU VRAM footprint over extended execution.
- **T4.3 TypeScript Strict Type Safety**: 100% clean compilation via `npx tsc --noEmit`.
- **T4.4 Zero Cumulative Layout Shift (CLS = 0.00)**: Aspect-ratio locked layout preventing content jumps.

---

## 4. Anti-Cheat Verification Matrix

| Verification Dimension | Anti-Cheat Criterion | Verification Mechanism |
|---|---|---|
| 1. Genuine 3D Geometry | No flat 2D sprite or billboard | BufferGeometry vertex position analysis (`Z` variance >= 0.05) |
| 2. Procedural Texture | No static pre-rendered image asset | Dynamic CanvasRenderingContext2D text & signature drawing audit |
| 3. Double-Sided PBR | Realistic physical material interaction | `MeshStandardMaterial` / `MeshPhysicalMaterial` with `side=DoubleSide` |
| 4. Multi-Depth Parallax | Authentic 3D spatial separation | Layered Z-coordinate verification for paper, pills, sparkles, and shadow |
| 5. Memory Management | Zero GPU resource leaks | Explicit `.dispose()` lifecycle execution test |

---

## 5. Test Runner Commands & Automation

### Run Master Test Suite (All Tiers)
```bash
node scripts/run-all-e2e-tests.mjs
```

### Run Individual Test Suites
```bash
# 1. Static AST & 3D Architectural Integrity Audit
node scripts/verify-3d-integrity.mjs

# 2. Headless Three.js Scene Graph & Math Curvature Tests
node scripts/test-scene-graph.mjs

# 3. HeroSection Integration, Fallback, & TypeScript Type Safety Tests
node scripts/test-hero-integration.mjs
```

### CI/CD Quality Gate Integration
Add to `package.json` scripts:
```json
"scripts": {
  "test:3d": "node scripts/run-all-e2e-tests.mjs",
  "test:integrity": "node scripts/verify-3d-integrity.mjs",
  "test:scene": "node scripts/test-scene-graph.mjs",
  "test:hero": "node scripts/test-hero-integration.mjs"
}
```
