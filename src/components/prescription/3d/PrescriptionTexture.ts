import * as THREE from "three";
import type { PrescriptionTextureOptions } from "./types";

/**
 * Generates a high-frequency subtle paper grain bump map.
 */
export function createPaperBumpTexture(size = 1024): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture(null as any);
  }

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    const val = THREE.MathUtils.clamp(128 + noise, 0, 255);
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Photorealistic Clean Medical Prescription Texture.
 * Generic clinical aesthetic without doctor names.
 */
export function createPrescriptionCanvasTexture(
  options: PrescriptionTextureOptions = {}
): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture(null as any);
  }

  const width = options.width ?? 2048;
  const height = options.height ?? 2896;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to acquire 2D canvas context for prescription texture");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. Crisp, Bright Medical Bond Paper Base (#ffffff)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Subtle clean watermark seal in background center
  ctx.save();
  ctx.translate(width / 2, height / 2 + 100);
  ctx.strokeStyle = "rgba(74, 144, 217, 0.035)";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(0, 0, 360, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 260, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(74, 144, 217, 0.025)";
  ctx.fillRect(-45, -140, 90, 280);
  ctx.fillRect(-140, -45, 280, 90);
  ctx.restore();

  // Subtle clean border
  ctx.strokeStyle = "#e8edf5";
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // 2. Minimalist Clinic Header
  ctx.save();
  ctx.translate(110, 130);
  ctx.fillStyle = "#0284c7";
  ctx.beginPath();
  ctx.arc(0, 0, 38, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-6, -20, 12, 40);
  ctx.fillRect(-20, -6, 40, 12);
  ctx.restore();

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#0a1628";
  ctx.font = "bold 52px 'DM Sans', system-ui, -apple-system, sans-serif";
  ctx.fillText("CENTRAL MEDICAL CLINIC", 175, 125);

  ctx.fillStyle = "#0284c7";
  ctx.font = "600 28px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("Department of Internal Medicine", 175, 168);

  ctx.fillStyle = "#475569";
  ctx.font = "500 24px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("Senior Clinical Practice · Reg. No: MH-48921-A", 175, 204);

  // Clinic Address & Contact (Top Right)
  ctx.textAlign = "right";
  ctx.fillStyle = "#64748b";
  ctx.font = "500 22px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("104 Medical Plaza, Suite 400", width - 96, 122);
  ctx.fillText("Tel: +1 (555) 019-2834", width - 96, 158);
  ctx.fillText("info@centralclinic.org", width - 96, 194);
  ctx.textAlign = "left";

  // Divider
  const headerLine = ctx.createLinearGradient(96, 235, width - 96, 235);
  headerLine.addColorStop(0, "#0284c7");
  headerLine.addColorStop(0.6, "#4a90d9");
  headerLine.addColorStop(1, "#94a3b8");
  ctx.fillStyle = headerLine;
  ctx.fillRect(96, 235, width - 192, 4);

  // 3. Patient Information Bar
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(96, 260, width - 192, 90);
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(96, 260, width - 192, 90);

  ctx.fillStyle = "#64748b";
  ctx.font = "bold 22px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("Patient:", 120, 315);
  ctx.fillText("Age/Sex:", 780, 315);
  ctx.fillText("Date:", 1220, 315);
  ctx.fillText("Rx #:", 1640, 315);

  ctx.fillStyle = "#0f3460";
  ctx.font = "700 32px 'Caveat', cursive, Georgia, serif";
  ctx.fillText("Patient Record", 225, 315);
  ctx.fillText("38 Y / M", 900, 315);
  ctx.fillText("16 Aug 2026", 1300, 315);
  ctx.fillText("48921-A", 1720, 315);

  // 4. Large Iconic "Rx" Symbol
  ctx.fillStyle = "#0284c7";
  ctx.font = "italic 800 130px 'Playfair Display', Georgia, serif";
  ctx.fillText("℞", 100, 480);

  ctx.strokeStyle = "#f1f5f9";
  ctx.lineWidth = 1.5;
  for (let y = 540; y <= 1960; y += 105) {
    ctx.beginPath();
    ctx.moveTo(96, y);
    ctx.lineTo(width - 96, y);
    ctx.stroke();
  }

  // 5. Prescribed Medications
  const medEntries = [
    {
      num: "1.",
      name: "Tab. Paracetamol 650 mg",
      dosage: "1 — 1 — 1",
      timing: "after meals x 5 days",
      advice: "for fever & pain relief",
    },
    {
      num: "2.",
      name: "Cap. Augmentin 625 mg",
      dosage: "1 — 0 — 1",
      timing: "after food x 7 days",
      advice: "complete full antibiotic course",
    },
    {
      num: "3.",
      name: "Tab. Pantoprazole 40 mg",
      dosage: "1 — 0 — 0",
      timing: "before breakfast x 5 days",
      advice: "take on empty stomach",
    },
    {
      num: "4.",
      name: "Syp. Levocetirizine 5 ml",
      dosage: "0 — 0 — 1",
      timing: "at bedtime x 3 days",
      advice: "for allergy & cold symptoms",
    },
  ];

  let currentY = 600;
  medEntries.forEach((med) => {
    ctx.fillStyle = "#0284c7";
    ctx.font = "bold 32px 'DM Sans', system-ui, sans-serif";
    ctx.fillText(med.num, 115, currentY);

    ctx.fillStyle = "#0f3460";
    ctx.font = "700 46px 'Caveat', 'Kalam', cursive, sans-serif";
    ctx.fillText(med.name, 170, currentY);

    ctx.fillStyle = "#0a1628";
    ctx.font = "bold 36px 'DM Sans', monospace";
    ctx.fillText(med.dosage, width - 420, currentY);

    ctx.fillStyle = "#2563eb";
    ctx.font = "600 28px 'Caveat', cursive, sans-serif";
    ctx.fillText(`(${med.timing})`, width - 820, currentY);

    ctx.fillStyle = "#64748b";
    ctx.font = "italic 24px 'DM Sans', system-ui, sans-serif";
    ctx.fillText(`↳ Note: ${med.advice}`, 170, currentY + 44);

    currentY += 150;
  });

  // 6. Clinical Instructions Box
  const adviceY = currentY + 40;
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(96, adviceY, width - 192, 130);
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(96, adviceY, width - 192, 130);

  ctx.fillStyle = "#0a1628";
  ctx.font = "bold 24px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("Clinical Instructions & General Advice:", 125, adviceY + 42);

  ctx.fillStyle = "#475569";
  ctx.font = "500 22px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("• Drink plenty of warm fluids and ensure adequate rest.", 135, adviceY + 78);
  ctx.fillText("• Follow up in clinic if fever or symptoms persist after 5 days.", 135, adviceY + 110);

  // 7. Official Clinic Seal Stamp
  const stampX = 300;
  const stampY = height - 380;

  ctx.save();
  ctx.translate(stampX, stampY);
  ctx.rotate(-0.08);

  ctx.strokeStyle = "rgba(2, 132, 199, 0.75)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 105, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 92, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(2, 132, 199, 0.85)";
  ctx.font = "bold 16px 'DM Sans', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("CENTRAL CLINIC", 0, -48);
  ctx.font = "bold 24px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("VERIFIED RX", 0, -10);
  ctx.font = "bold 16px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("CLINICAL PRACTICE", 0, 24);
  ctx.font = "bold 14px monospace";
  ctx.fillText("REG NO: 48921-A", 0, 50);
  ctx.restore();

  // 8. Authorized Practitioner Signature
  const sigX = width - 540;
  const sigY = height - 400;

  ctx.fillStyle = "#0f3460";
  ctx.font = "700 68px 'Caveat', cursive, Georgia, serif";
  ctx.fillText("Medical Officer", sigX + 20, sigY + 50);

  ctx.strokeStyle = "#0f3460";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(sigX, sigY + 80);
  ctx.bezierCurveTo(sigX + 100, sigY + 70, sigX + 260, sigY + 85, sigX + 420, sigY + 75);
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.font = "600 22px 'DM Sans', system-ui, sans-serif";
  ctx.fillText("Authorized Practitioner Signature", sigX + 35, sigY + 115);

  // 9. Minimal Footer Bar
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(40, height - 72, width - 80, 32);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 18px monospace";
  ctx.textAlign = "center";
  ctx.fillText(
    "OFFICIAL CLINICAL PRESCRIPTION RECORD · DISPENSARY COMPLIANT · ID: #PR-48921-A",
    width / 2,
    height - 50
  );

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = options.anisotropy ?? 16;
  texture.needsUpdate = true;

  return texture;
}
