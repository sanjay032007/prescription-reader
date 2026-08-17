"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { FileText, Sparkles, Camera, Upload, ScanLine, ArrowRight } from "lucide-react";
import LiveCameraScanner from "./LiveCameraScanner";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  fileName?: string | null;
  previewUrl?: string | null;
  disabled?: boolean;
}

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

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
      alert("File exceeds maximum size of 10 MB.");
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
        ctx.fillStyle = "#0f3460";
        ctx.font = "bold 38px 'Segoe Print', cursive, sans-serif";
        ctx.fillText("1. Tab. Paracetamol 650 mg — 1 - 1 - 1 (x 5 days pc)", 160, 520);
        ctx.fillText("2. Cap. Augmentin 625 mg — 1 - 0 - 1 (x 7 days pc)", 160, 640);
        ctx.fillText("3. Tab. Pantoprazole 40 mg — 1 - 0 - 0 (x 5 days ac)", 160, 760);
        ctx.fillText("4. Syp. Levocetirizine 5 ml — 0 - 0 - 1 (x 3 days hs)", 160, 880);
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
            onFileSelected(new File([blob], "sample_prescription_rx.jpg", { type: "image/jpeg" }));
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
      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="sr-only"
        onChange={onChange}
        disabled={disabled}
      />

      {/* Live Camera Scanner Dialog */}
      <LiveCameraScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCapture={(file) => onFileSelected(file)}
      />

      {previewUrl && fileName ? (
        /* Preview State */
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all">
          <div className="relative rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center max-h-[300px]">
            <img
              src={previewUrl}
              alt="Prescription preview"
              className="max-h-[300px] w-full object-contain"
            />
          </div>

          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-[#0284c7] flex items-center justify-center shrink-0">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-slate-900 truncate max-w-[220px] sm:max-w-md">
                  {fileName}
                </p>
                <p className="text-[11.5px] text-emerald-600 font-medium">Ready for clinical analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="px-3 py-1.5 rounded-lg text-[12.5px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Rescan
              </button>
              <button
                type="button"
                onClick={triggerBrowse}
                className="px-3 py-1.5 rounded-lg text-[12.5px] font-semibold text-[#0284c7] hover:bg-sky-50 transition-colors cursor-pointer"
              >
                Change photo
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Zone */
        <div
          role="button"
          tabIndex={0}
          onClick={triggerBrowse}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragEnter={onDragOver}
          onDragLeave={onDragLeave}
          className={`rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all border-2 border-dashed ${
            dragOver
              ? "border-[#0284c7] bg-sky-50/50 scale-[0.99]"
              : "border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50/80"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
            <Upload size={22} className="text-slate-600" />
          </div>

          <h3 className="text-[16px] font-bold text-slate-900 mb-1">
            Upload doctor&apos;s prescription
          </h3>
          <p className="text-[13.5px] text-slate-500 max-w-sm mx-auto mb-6">
            Drag and drop your image file here, or choose an option below
          </p>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 max-w-md mx-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsScannerOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[13.5px] font-semibold transition-colors cursor-pointer"
            >
              <ScanLine size={15} />
              <span>Scan with Camera</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerBrowse();
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13.5px] font-semibold transition-colors cursor-pointer"
            >
              <Camera size={15} />
              <span>Browse Photos</span>
            </button>
          </div>

          {/* Sample Try Button */}
          <div className="mt-4">
            <button
              type="button"
              disabled={isGeneratingSample}
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSample();
              }}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-slate-500 hover:text-[#0284c7] transition-colors cursor-pointer"
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>{isGeneratingSample ? "Generating sample Rx..." : "Try with a sample doctor prescription"}</span>
            </button>
          </div>

          <p className="mt-5 text-[11.5px] font-medium text-slate-400">
            Supports JPG, PNG, WEBP · Max 10 MB · Completely Private
          </p>
        </div>
      )}
    </div>
  );
}
