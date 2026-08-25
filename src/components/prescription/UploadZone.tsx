"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { FileText, Sparkles, Camera, Image as ImageIcon, UploadCloud, RefreshCw } from "lucide-react";
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
  disabled = false,
}: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > MAX_BYTES) {
      alert("File is too large. Maximum allowed size is 10 MB.");
      return;
    }
    onFileSelected(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
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
    if (!disabled) inputRef.current?.click();
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

        // Header - Generic Medical Clinic
        ctx.fillStyle = "#004B49";
        ctx.font = "bold 44px sans-serif";
        ctx.fillText("CENTRAL CLINICAL HEALTHCARE", 120, 140);
        ctx.fillStyle = "#0D5C63";
        ctx.font = "500 24px sans-serif";
        ctx.fillText("Department of Internal Medicine", 120, 185);
        ctx.fillText("Reg. #MH-48921-A · Outpatient Care", 120, 225);

        ctx.textAlign = "right";
        ctx.fillText("Date: 14/05/2024", 1480, 140);
        ctx.textAlign = "left";

        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(120, 260);
        ctx.lineTo(1480, 260);
        ctx.stroke();

        ctx.fillStyle = "#0D5C63";
        ctx.font = "italic bold 100px Georgia, serif";
        ctx.fillText("℞", 120, 390);

        ctx.font = "bold 40px 'Segoe Print', cursive, sans-serif";
        ctx.fillStyle = "#1e293b";
        ctx.fillText("1. Tab. Dolo 650 — 1 - 1 - 1 (x 5 days)", 140, 500);
        ctx.fillText("2. Cap. Augmentin 625 — 1 - 0 - 1 (x 5 days)", 140, 620);
        ctx.fillText("3. Tab. Pantoprazole 40 — 0 - 0 - 1 (x 5 days)", 140, 740);
        ctx.fillText("4. Syp. Cetirizine 10ml — 0 - 0 - 1 (x 3 days)", 140, 860);

        ctx.textAlign = "right";
        ctx.font = "italic bold 48px cursive";
        ctx.fillStyle = "#1e293b";
        ctx.fillText("Medical Officer", 1450, 1150);
        ctx.font = "bold 22px sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Authorized Practitioner Signature", 1450, 1190);

        canvas.toBlob((blob) => {
          if (blob) {
            onFileSelected(new File([blob], "sample_prescription.jpg", { type: "image/jpeg" }));
          }
          setIsGeneratingSample(false);
        }, "image/jpeg", 0.95);
      }
    } catch {
      setIsGeneratingSample(false);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="sr-only"
        onChange={onChange}
        disabled={disabled}
      />

      <LiveCameraScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCapture={(file) => onFileSelected(file)}
      />

      {previewUrl && fileName ? (
        <div className="rounded-3xl border border-[#0D5C63]/15 overflow-hidden bg-[#F9F6F0] shadow-premium">
          <div className="relative p-3 sm:p-5 flex items-center justify-center min-h-[200px] sm:min-h-[280px]">
            <img
              src={previewUrl}
              alt="Scanned prescription source"
              className="max-h-[240px] sm:max-h-[320px] w-auto object-contain rounded-2xl shadow-sm bg-white"
            />
          </div>

          <div className="px-5 py-4 flex items-center justify-between border-t border-slate-200/80 bg-white">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <FileText size={18} className="text-[#0D5C63] shrink-0" />
              <span className="text-[13.5px] sm:text-[14.5px] font-bold text-slate-800 truncate">
                {fileName}
              </span>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="text-[12px] sm:text-[13px] font-bold text-slate-600 hover:text-slate-950 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Rescan
              </button>
              <button
                type="button"
                onClick={triggerBrowse}
                className="text-[12px] sm:text-[13px] font-bold text-[#0D5C63] hover:text-[#004B49] px-3 py-1.5 rounded-xl hover:bg-[#0D5C63]/10 transition-colors cursor-pointer"
              >
                Change Photo
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={triggerBrowse}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragEnter={onDragOver}
          onDragLeave={onDragLeave}
          className={`rounded-3xl p-7 sm:p-12 text-center cursor-pointer transition-all border-2 border-dashed ${
            dragOver
              ? "border-[#2D6A4F] bg-[#2D6A4F]/5 shadow-xl scale-[1.01]"
              : "border-[#0D5C63]/25 bg-white hover:border-[#0D5C63] hover:bg-[#F9F6F0]/60"
          }`}
        >
          {/* Upload Icon */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0D5C63]/10 border border-[#0D5C63]/20 flex items-center justify-center mx-auto mb-4 text-[#0D5C63] shadow-xs">
            <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <h3 className="text-[18px] sm:text-[22px] font-extrabold text-[#004B49] mb-1.5">
            Scan your prescription or pill
          </h3>
          <p className="text-[13.5px] sm:text-[14.5px] text-slate-500 font-normal mb-6 max-w-md mx-auto">
            Our vision AI detects handwritten text, active salts, and dosage schedules instantly.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-md mx-auto mb-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsScannerOpen(true);
              }}
              className="w-full h-13 inline-flex items-center justify-center gap-2.5 px-6 rounded-2xl bg-[#0D5C63] hover:bg-[#004B49] text-white text-[14.5px] font-bold transition-all shadow-lg shadow-[#0D5C63]/20 cursor-pointer active:scale-[0.99]"
            >
              <Camera size={18} />
              <span>Camera Scan</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerBrowse();
              }}
              className="w-full h-13 inline-flex items-center justify-center gap-2.5 px-6 rounded-2xl border border-[#0D5C63]/25 bg-white hover:bg-[#F9F6F0] text-[#004B49] text-[14.5px] font-bold transition-all shadow-xs cursor-pointer active:scale-[0.99]"
            >
              <ImageIcon size={18} className="text-[#0D5C63]" />
              <span>Upload Document</span>
            </button>
          </div>

          {/* Instant Sample Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isGeneratingSample}
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSample();
              }}
              className="inline-flex items-center gap-1.5 text-[13px] text-[#2D6A4F] hover:text-[#1e4634] font-bold cursor-pointer transition-colors"
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>{isGeneratingSample ? "Generating sample..." : "✨ Try a sample prescription"}</span>
            </button>
          </div>

          <p className="mt-4 text-[11.5px] text-slate-400 font-medium">
            Secure AES-256 Upload &bull; Supports JPG, PNG, WEBP &bull; Max 10 MB
          </p>
        </div>
      )}
    </div>
  );
}
