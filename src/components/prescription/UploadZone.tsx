"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { FileText, Sparkles, Camera, Upload, CheckCircle2, ScanLine } from "lucide-react";
import LiveCameraScanner from "./LiveCameraScanner";

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
  const [isScannerOpen, setIsScannerOpen] = useState(false);

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

  const handleLoadSample = async () => {
    if (disabled) return;
    setIsGeneratingSample(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1600;
      canvas.height = 2262;
      const ctx = canvas.getContext("2d");
      if (ctx) {
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
      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg,application/pdf"
        className="sr-only"
        onChange={onChange}
        disabled={disabled}
      />

      {/* Live Camera Scanner Modal */}
      <LiveCameraScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCapture={(file) => onFileSelected(file)}
      />

      {previewUrl && fileName ? (
        /* ================= UPLOADED STATE WITH SCANNER OVERLAY ================= */
        <div className="mb-5 sm:mb-6">
          <div className="relative rounded-[24px] sm:rounded-[28px] border-2 border-[#0284c7]/30 bg-slate-950 overflow-hidden shadow-2xl group">
            {/* Prescription Preview Image */}
            <img
              src={previewUrl}
              alt="Prescription preview"
              className="h-[220px] sm:h-[340px] w-full object-contain bg-slate-900/60 transition-transform duration-500"
            />

            {/* AI Medical Laser Scan Line Animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-l-2 border-[#38bdf8]" />
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-r-2 border-[#38bdf8]" />
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-l-2 border-[#38bdf8]" />
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-r-2 border-[#38bdf8]" />

              <div
                className="w-full h-[3px] bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent shadow-[0_0_15px_#38bdf8] absolute top-0"
                style={{
                  animation: "scan 3s cubic-bezier(0.4, 0, 0.2, 1) infinite",
                }}
              />
            </div>

            {/* Bottom Status Bar */}
            <div className="bg-slate-900/95 backdrop-blur-md px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between gap-2 border-t border-slate-800">
              <div className="flex items-center gap-2.5 text-[13px] sm:text-[14px] font-medium text-slate-200 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#38bdf8] shrink-0">
                  <FileText size={15} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate max-w-[150px] xs:max-w-[200px] sm:max-w-md font-semibold text-white">
                    {fileName}
                  </span>
                  <span className="text-[10.5px] sm:text-[11px] text-[#38bdf8] font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-ping shrink-0" />
                    <span className="truncate">Ready for AI Analysis</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="text-[12px] sm:text-[13px] font-semibold text-[#38bdf8] hover:text-white px-2.5 py-1.5 rounded-lg bg-[#0284c7]/20 hover:bg-[#0284c7]/40 transition-colors shrink-0 cursor-pointer hidden xs:inline-flex items-center gap-1"
                >
                  <ScanLine size={13} />
                  <span>Rescan</span>
                </button>
                <button
                  type="button"
                  onClick={triggerBrowse}
                  className="text-[12px] sm:text-[13px] font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= EMPTY DRAG & DROP ZONE ================= */
        <div className="space-y-3 sm:space-y-4">
          <div
            role="button"
            tabIndex={0}
            onClick={triggerBrowse}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragEnter={onDragOver}
            onDragLeave={onDragLeave}
            className={`relative rounded-[24px] sm:rounded-[28px] p-6 sm:p-14 text-center cursor-pointer transition-all duration-300 border-2 border-dashed overflow-hidden ${
              dragOver
                ? "border-[#0284c7] bg-[#0284c7]/8 scale-[0.99] shadow-xl"
                : "border-slate-200 bg-gradient-to-b from-white to-slate-50/50 hover:border-[#0284c7]/80 hover:shadow-lg shadow-2xs"
            }`}
          >
            {dragOver && (
              <div className="absolute inset-0 bg-[#0284c7]/10 animate-pulse pointer-events-none flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border-2 border-[#0284c7]/40 animate-ping" />
              </div>
            )}

            {/* Center Icon Ring */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-[#e0f2fe] via-[#f0f9ff] to-[#e0e7ff] border border-blue-100/80 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
              <Upload className="w-7 h-7 sm:w-9 sm:h-9 text-[#0284c7]" />
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-[10px] sm:text-xs shadow-xs">
                ✦
              </div>
            </div>

            {/* Main Headline */}
            <h3 className="text-[19px] sm:text-[24px] font-extrabold text-[#0a1628] tracking-tight mb-1.5 sm:mb-2">
              Scan or upload your prescription
            </h3>
            <p className="text-[13.5px] sm:text-[14.5px] text-slate-500 max-w-md mx-auto mb-5 sm:mb-6 leading-relaxed">
              Works with handwritten doctor notes, printed clinic slips, and hospital discharge sheets.
            </p>

            {/* Action Buttons Row - mobile responsive 3-action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full max-w-lg mx-auto">
              {/* Primary Action 1: Live Camera Scanner */}
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#0284c7] via-[#4a90d9] to-[#6366f1] text-white text-[14.5px] font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsScannerOpen(true);
                }}
              >
                <ScanLine className="w-4 h-4" />
                <span>Scan with Camera</span>
              </button>

              {/* Action 2: File Browser */}
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#0284c7] text-[13.5px] sm:text-[14px] font-semibold shadow-2xs transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerBrowse();
                }}
              >
                <Camera className="w-4 h-4" />
                <span>Browse Photo</span>
              </button>

              {/* Action 3: Try Sample */}
              <button
                type="button"
                disabled={isGeneratingSample}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13.5px] sm:text-[14px] font-medium transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSample();
                }}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{isGeneratingSample ? "Loading..." : "Sample Rx"}</span>
              </button>
            </div>

            {/* Accepted Formats Footer */}
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-[11.5px] sm:text-[12px] font-semibold text-slate-400">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> JPG, PNG, WEBP
              </span>
              <span>·</span>
              <span>Max 10 MB</span>
              <span>·</span>
              <span>Encrypted</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
