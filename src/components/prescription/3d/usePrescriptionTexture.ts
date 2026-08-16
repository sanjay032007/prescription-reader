import * as THREE from "three";
import type { PrescriptionTextureOptions } from "./types";

export function createPrescriptionCanvasTexture(options: PrescriptionTextureOptions = {}): THREE.CanvasTexture {
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

  // 1. Background paper
  ctx.fillStyle = "#fbfcfd";
  ctx.fillRect(0, 0, width, height);

  // Subtle outer paper border and inner margin
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, width - 64, height - 64);

  // Soft watermark lines
  ctx.strokeStyle = "rgba(226, 232, 240, 0.4)";
  ctx.lineWidth = 1;
  for (let y = 160; y < height - 160; y += 48) {
    ctx.beginPath();
    ctx.moveTo(80, y);
    ctx.lineTo(width - 80, y);
    ctx.stroke();
  }

  // 2. Doctor / Clinic Header: Dr. Anita Sharma, MBBS, MD
  ctx.fillStyle = "#0a1628";
  ctx.font = "bold 64px system-ui, -apple-system, sans-serif";
  ctx.fillText("Dr. Anita Sharma", 96, 170);

  ctx.fillStyle = "#475569";
  ctx.font = "600 38px system-ui, -apple-system, sans-serif";
  ctx.fillText("MBBS, MD · General Physician & Internal Medicine", 96, 230);

  ctx.fillStyle = "#64748b";
  ctx.font = "400 32px system-ui, -apple-system, sans-serif";
  ctx.fillText("Reg. No: 48921-A · City Health Clinic · 104 Medical Plaza", 96, 280);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "400 28px system-ui, -apple-system, sans-serif";
  ctx.fillText("Tel: +1 (555) 234-5678 · emergency@cityhealth.org", 96, 325);

  // Top header divider gradient
  const grad = ctx.createLinearGradient(96, 360, width - 96, 360);
  grad.addColorStop(0, "#4a90d9");
  grad.addColorStop(0.5, "#6366f1");
  grad.addColorStop(1, "#a855f7");
  ctx.fillStyle = grad;
  ctx.fillRect(96, 360, width - 192, 6);

  // 3. Patient Details Row
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(96, 400, width - 192, 110);
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  ctx.strokeRect(96, 400, width - 192, 110);

  ctx.fillStyle = "#1e293b";
  ctx.font = "600 32px system-ui, sans-serif";
  ctx.fillText("Patient: John Doe", 130, 465);

  ctx.fillStyle = "#64748b";
  ctx.font = "500 30px system-ui, sans-serif";
  ctx.fillText("Age / Sex: 38 / Male", 720, 465);
  ctx.fillText("Date: 16 Aug 2026", 1240, 465);
  ctx.fillText("Rx ID: 48921-A", 1680, 465);

  // 4. Prominent Stylized Italic Rx Symbol
  ctx.fillStyle = "#4a90d9";
  ctx.font = "italic 800 140px Georgia, serif";
  ctx.fillText("Rx", 100, 680);

  // 5. Medication List (Paracetamol, Amoxicillin, Levocetirizine with dosages 1-1-1, 1-0-1, 0-0-1)
  const meds = [
    {
      name: "Tab. Paracetamol 650 mg",
      dosage: "1-1-1",
      timing: "Morning - Afternoon - Night (After meals)",
      duration: "5 Days",
      note: "Take with warm water for fever & body ache",
    },
    {
      name: "Cap. Amoxicillin 500 mg",
      dosage: "1-0-1",
      timing: "Morning - Night (After meals)",
      duration: "7 Days",
      note: "Complete the full antibiotic course diligently",
    },
    {
      name: "Syp. Levocetirizine 5 ml",
      dosage: "0-0-1",
      timing: "Night before bed",
      duration: "3 Days",
      note: "For allergic rhinitis & nasal congestion relief",
    },
  ];

  let startY = 780;
  meds.forEach((med, idx) => {
    // Number bullet
    ctx.fillStyle = "#4a90d9";
    ctx.beginPath();
    ctx.arc(120, startY - 14, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${idx + 1}`, 120, startY - 6);
    ctx.textAlign = "left";

    // Medicine Name
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 44px Georgia, serif";
    ctx.fillText(med.name, 160, startY);

    // Dosage Frequency Badge (1-1-1, 1-0-1, 0-0-1)
    const badgeX = width - 360;
    ctx.fillStyle = "#eff6ff";
    ctx.fillRect(badgeX, startY - 42, 240, 56);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.strokeRect(badgeX, startY - 42, 240, 56);

    ctx.fillStyle = "#1d4ed8";
    ctx.font = "bold 32px monospace";
    ctx.textAlign = "center";
    ctx.fillText(med.dosage, badgeX + 120, startY - 3);
    ctx.textAlign = "left";

    // Subtext - timing & duration
    ctx.fillStyle = "#334155";
    ctx.font = "500 32px system-ui, sans-serif";
    ctx.fillText(`🕒 ${med.timing} · Duration: ${med.duration}`, 160, startY + 54);

    // Clinical note
    ctx.fillStyle = "#64748b";
    ctx.font = "italic 28px system-ui, sans-serif";
    ctx.fillText(`ℹ ${med.note}`, 160, startY + 98);

    // Dotted separator line
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(96, startY + 140);
    ctx.lineTo(width - 96, startY + 140);
    ctx.stroke();
    ctx.setLineDash([]);

    startY += 210;
  });

  // 6. Advice & Precautions Box
  const adviceY = startY + 40;
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(96, adviceY, width - 192, 170);
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2;
  ctx.strokeRect(96, adviceY, width - 192, 170);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 34px system-ui, sans-serif";
  ctx.fillText("💡 General Advice & Instructions:", 130, adviceY + 54);

  ctx.fillStyle = "#475569";
  ctx.font = "500 30px system-ui, sans-serif";
  ctx.fillText("• Drink warm fluids & take amoxicillin after food.", 140, adviceY + 102);
  ctx.fillText("• Maintain proper hydration, rest adequately, and follow up in 5 days if symptoms persist.", 140, adviceY + 144);

  // 7. Security Stamp & Doctor Cursive Signature
  const footerY = height - 380;

  // Verified Rx Security Stamp
  ctx.save();
  ctx.translate(240, footerY + 120);
  ctx.rotate(-0.08);

  ctx.strokeStyle = "rgba(16, 185, 129, 0.85)";
  ctx.lineWidth = 5;
  ctx.strokeRect(-120, -50, 240, 100);

  ctx.fillStyle = "rgba(16, 185, 129, 0.9)";
  ctx.font = "bold 26px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("VERIFIED RX", 0, -10);
  ctx.font = "bold 20px system-ui, sans-serif";
  ctx.fillText("SECURE · AUTHENTIC", 0, 24);
  ctx.restore();

  // Signature line and text: Dr. Sharma
  const sigX = width - 480;
  ctx.fillStyle = "#0f172a";
  ctx.font = "italic 52px cursive, serif";
  ctx.fillText("Dr. Sharma", sigX + 40, footerY + 90);

  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(sigX, footerY + 120);
  ctx.lineTo(sigX + 360, footerY + 120);
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.font = "600 24px system-ui, sans-serif";
  ctx.fillText("Authorized Physician Signature", sigX + 20, footerY + 160);

  // Footer security bar
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(32, height - 90, width - 64, 58);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "500 22px monospace";
  ctx.textAlign = "center";
  ctx.fillText("ENCRYPTED DIGITAL HEALTHCARE RECORD · CITY HEALTH NETWORK · CLINICAL DISPENSARY COMPLIANT", width / 2, height - 52);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = options.anisotropy ?? 16;
  texture.needsUpdate = true;

  return texture;
}
