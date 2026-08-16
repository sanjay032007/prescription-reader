"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { FileText, Sparkles, Camera, Upload, CheckCircle2 } from "lucide-react";
import { createPrescriptionCanvasTexture } from "./3d/PrescriptionTexture";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  fileName?: string | null;
  previewUrl?: string | null;
  disabled?: boolean;
}

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export default function UploadZone({
  onFileSelected,
  fileName,
  previewUrl,
  disabled,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > MAX_BYTES) {
      alert("Image is larger than 10 MB. Please upload a smaller file.");
      return;
    }
    onFileSelected(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragOver(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const triggerBrowse = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  // 1-Click Sample Prescription Generator for instant test flow
  const handleLoadSample = async () => {
    if (disabled) return;
    setIsGeneratingSample(true);

    try {
      // Create offscreen canvas for high-res sample prescription
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 2262;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw crisp sample prescription
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1600, 2262);

        // Header
        ctx.fillStyle = "#0a1628";
        ctx.font = "bold 44px sans-serif";
        ctx.fillText("CITY HEALTH CLINIC", 120, 120);

        ctx.fillStyle = "#0284c7";
        ctx.font = "600 24px sans-serif";
        ctx.fillText("Dr. Anita Sharma, MBBS, MD · Reg. 48921-A", 120, 160);

        ctx.fillStyle = "#64748b";
        ctx.font = "500 20px sans-serif";
        ctx.fillText("Patient: Johnathan Doe · Age: 38/M · Date: 16/08/2026", 120, 240);

        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(120, 280);
        ctx.lineTo(1480, 280);
        ctx.stroke();

        ctx.fillStyle = "#0284c7";
        ctx.font = "italic 800 110px Georgia, serif";
        ctx.fillText("℞", 120, 420);

        // Medicines
        ctx.fillStyle = "#0f3460";
        ctx.font = "bold 38px 'Segoe Print', cursive, sans-serif";
        ctx.fillText("1. Tab. Paracetamol 650 mg — 1 - 1 - 1 (x 5 days pc)", 160, 520);
        ctx.fillText("2. Cap. Augmentin 625 mg — 1 - 0 - 1 (x 7 days pc)", 160, 640);
        ctx.fillText("3. Tab. Pantoprazole 40 mg — 1 - 0 - 0 (x 5 days ac)", 160, 760);
        ctx.fillText("4. Syp. Levocetirizine 5 ml — 0 - 0 - 1 (x 3 days hs)", 160, 880);

        // Stamp & Signature
        ctx.strokeStyle = "rgba(2, 132, 199, 0.8)";
        ctx.lineWidth = 4;
        ctx.strokeRect(200, 1100, 260, 110);
        ctx.fillStyle = "#0284c7";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText("VERIFIED RX", 250, 1165);

        ctx.fillStyle = "#0f3460";
        ctx.font = "italic bold 52px cursive";
        ctx.fillText("Dr. Anita Sharma", 1100, 1160);

        // Convert canvas to File
        canvas.toBlob((blob) => {
          if (blob) {
            const sampleFile = new File([blob], "sample_prescription_rx.jpg", {
              type: "image/jpeg",
            });
            onFileSelected(sampleFile);
          }
          setIsGeneratingSample(false);
        }, "image/jpeg", 0.95);
      }
    } catch (e) {
      console.error(e);
      setIsGeneratingSample(false);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
        className="sr-only"
        onChange={onChange}
        disabled={disabled}
      />

      {previewUrl && fileName ? (
        /* ================= UPLOADED STATE WITH SCANNER OVERLAY ================= */
        <div className="mb-6">
          <div className="relative rounded-[28px] border-2 border-[#0284c7]/30 bg-slate-950 overflow-hidden shadow-2xl group">
            {/* Prescription Preview Image */}
            <img
              src={previewUrl}
              alt="Prescription preview"
              className="h-[280px] sm:h-[340px] w-full object-contain bg-slate-900/60 transition-transform duration-500 group-hover:scale-[1.01]"
            />

            {/* AI Medical Laser Scan Line Animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Corner AI Reticle Targets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#38bdf8]" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#38bdf8]" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#38bdf8]" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#38bdf8]" />

              {/* Glowing Laser Scan Bar */}
              <div
                className="w-full h-[3px] bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent shadow-[0_0_15px_#38bdf8] absolute top-0 animate-[scan_3s_ease-in-out_infinite]"
                style={{
                  animation: "scan 3s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                }}
              />
            </div>

            {/* Bottom Status Bar */}
            <div className="bg-slate-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-t border-slate-800">
              <div className="flex items-center gap-3 text-[14px] font-medium text-slate-200">
                <div className="w-8 h-8 rounded-lg bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#38bdf8]">
                  <FileText size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="truncate max-w-[220px] sm:max-w-md font-semibold text-white">
                    {fileName}
                  </span>
                  <span className="text-[11px] text-[#38bdf8] font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping" />
                    Prescription Ready for AI Analysis
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={triggerBrowse}
                  className="text-[13px] font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Change Image
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= EMPTY DRAG & DROP ZONE WITH RETICLE ================= */
        <div className="space-y-4">
          <div
            role="button"
            tabIndex={0}
            onClick={triggerBrowse}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragEnter={onDragOver}
            onDragLeave={onDragLeave}
            className={`relative rounded-[28px] p-8 sm:p-14 text-center cursor-pointer transition-all duration-300 border-2 border-dashed overflow-hidden ${
              dragOver
                ? "border-[#0284c7] bg-[#0284c7]/8 scale-[0.99] shadow-xl"
                : "border-slate-200 bg-gradient-to-b from-white to-slate-50/50 hover:border-[#0284c7]/80 hover:shadow-lg shadow-2xs"
            }`}
          >
            {/* Animated Radar Pulse when dragging */}
            {dragOver && (
              <div className="absolute inset-0 bg-[#0284c7]/10 animate-pulse pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-2 border-[#0284c7]/40 animate-ping" />
              </div>
            )}

            {/* Center Icon Ring */}
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#e0f2fe] via-[#f0f9ff] to-[#e0e7ff] border border-blue-100/80 flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Upload className="w-9 h-9 text-[#0284c7]" />
              <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-xs shadow-xs">
                ✦
              </div>
            </div>

            {/* Main Headline */}
            <h3 className="text-[22px] sm:text-[24px] font-extrabold text-[#0a1628] tracking-tight mb-2">
              Drop your prescription photo here
            </h3>
            <p className="text-[14.5px] text-slate-500 max-w-md mx-auto mb-6">
              Works with handwritten doctor notes, printed clinical slips, and hospital discharge sheets.
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0284c7] via-[#4a90d9] to-[#6366f1] text-white text-[14.5px] font-bold shadow-md hover:shadow-lg hover:brightness-105 transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerBrowse();
                }}
              >
                <Camera className="w-4 h-4" />
                <span>Upload or Take Photo</span>
              </button>

              <button
                type="button"
                disabled={isGeneratingSample}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#0284c7] hover:border-[#0284c7]/40 text-[14px] font-semibold shadow-2xs transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSample();
                }}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{isGeneratingSample ? "Loading sample..." : "Try Sample Rx"}</span>
              </button>
            </div>

            {/* Accepted Formats Footer */}
            <div className="mt-8 flex items-center justify-center gap-4 text-[12px] font-semibold text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> JPG, PNG, WEBP
              </span>
              <span>·</span>
              <span>Max 10 MB</span>
              <span>·</span>
              <span>Encrypted &amp; Private</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
