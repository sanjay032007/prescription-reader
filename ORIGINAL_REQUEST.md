# Original User Request

## Initial Request — 2026-08-16T15:19:56+05:30

Create an extraordinary, photorealistic, interactive 3D prescription hero visual for the Prescription Reader healthcare web application.

Working directory: c:\Users\sanjay\.gemini\antigravity\brain\45038082-faa5-4fff-8144-1681601141c1\exm
Integrity mode: development

## Requirements

### R1. Photorealistic 3D Floating Prescription Mesh & Shader
- Build a genuine 3D WebGL mesh using React Three Fiber (@react-three/fiber & @react-three/drei).
- Model the prescription sheet with authentic physical properties: slight natural paper curvature/curl, subtle paper roughness, and double-sided rendering.
- Generate high-resolution, crisp dynamic texture mapping for the paper with:
  - Doctor header: Dr. Anita Sharma, MBBS, MD — General Physician (Clinic header, registration number).
  - Prominent stylized italic  Rx symbol.
  - Authentic medical handwriting lines with medications: Tab. Paracetamol 650 mg (1-1-1), Cap. Amoxicillin 500 mg (1-0-1), Syp. Levocetirizine 5 ml (0-0-1).
  - Doctor cursive signature at the bottom right.

### R2. Dynamic Interactive Physics & Atmospheric Accents
- Natural floating levitation animation (gentle harmonic bobbing & breathing rotation).
- Smooth pointer parallax: the prescription paper gracefully tilts and tracks cursor movement with realistic inertia and damping.
- Surrounding atmospheric micro-elements:
  - Subtle floating frosted-glass capsule pills with soft refraction.
  - Soft ambient glowing sparkles/nodes in the background.
  - Grounding contact shadow underneath the composition.

### R3. Studio Lighting & Post-Processing
- Cinematic multi-point lighting setup: soft key light, gentle ambient illumination, and subtle cyan/violet rim lighting that matches the brand palette.
- High-fidelity visual polish without degrading frame rate.

### R4. Next.js Integration & Responsive Optimization
- Integrate seamlessly into src/components/prescription/HeroSection.tsx with dynamic client-side loading (ssr: false).
- Device pixel ratio capped at 2 (dpr={[1, 2]}) to guarantee 60 FPS on desktop, tablet, and mobile.
- Zero WebGL context leaks and smooth fallback handling.

## Acceptance Criteria

### Visual & Interactive Quality
- [ ] 3D prescription sheet is a rendered WebGL object in space with depth and subtle paper curvature.
- [ ] Prescription text and doctor handwriting are razor sharp and legible on high-DPI screens.
- [ ] Floating capsules and sparkles add aesthetic depth without obstructing the paper.
- [ ] Mouse movement smoothly drives paper rotation with fluid spring/damping physics.

### Technical & Performance Standards
- [ ] Maintains a steady 60 FPS on standard devices.
- [ ] Completely clean build with zero React hydration or WebGL errors.
- [ ] Fully responsive and properly centered across mobile, tablet, and wide desktop viewports.
