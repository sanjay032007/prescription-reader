"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { Camera, Image as ImageIcon, Cloud, FileText, Sparkles } from "lucide-react";
import LiveCameraScanner from "./LiveCameraScanner";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  fileName?: string | null;
  previewUrl?: string | null;
  disabled?: boolean;
}

const MAX_BYTES = 10 * 1024 * 1024;

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

        // Doctor header matching screenshot
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 44px sans-serif";
        ctx.fillText("Dr. Ramesh Kumar", 120, 140);
        ctx.fillStyle = "#64748b";
        ctx.font = "500 24px sans-serif";
        ctx.fillText("MBBS, MD (General Medicine)", 120, 185);
        ctx.fillText("Reg. No. 12345", 120, 225);

        ctx.textAlign = "right";
        ctx.fillText("Date: 14/05/2024", 1480, 140);
        ctx.textAlign = "left";

        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(120, 260);
        ctx.lineTo(1480, 260);
        ctx.stroke();

        ctx.fillStyle = "#0f172a";
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
        ctx.fillText("Ramesh", 1450, 1150);
        ctx.font = "bold 22px sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Dr. Ramesh Kumar", 1450, 1190);

        canvas.toBlob((blob) => {
          if (blob) {
            onFileSelected(new File([blob], "sample_ramesh_prescription.jpg", { type: "image/jpeg" }));
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
        <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-slate-50/50 shadow-2xs">
          <div className="relative p-2 bg-white flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Prescription preview"
              className="max-h-[260px] sm:max-h-[320px] w-auto object-contain rounded-lg"
            />
          </div>

          <div className="px-5 py-3.5 flex items-center justify-between border-t border-slate-200/80 bg-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText size={16} className="text-[#0284c7] shrink-0" />
              <span className="text-[13.5px] font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-md">
                {fileName}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="text-[12.5px] font-semibold text-slate-600 hover:text-slate-950 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Rescan
              </button>
              <button
                type="button"
                onClick={triggerBrowse}
                className="text-[12.5px] font-semibold text-[#0284c7] hover:text-[#0369a1] px-2.5 py-1 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer"
              >
                Change photo
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
          className={`rounded-2xl p-7 sm:p-10 text-center cursor-pointer transition-all border-2 border-dashed ${
            dragOver
              ? "border-[#0284c7] bg-sky-50/60"
              : "border-slate-300/90 bg-white hover:border-slate-400 hover:bg-slate-50/40"
          }`}
        >
          {/* Cloud Upload Icon */}
          <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center mx-auto mb-3 text-[#0284c7]">
            <Cloud className="w-6 h-6" />
          </div>

          <p className="text-[15px] sm:text-[16px] font-bold text-slate-800 mb-1">
            Drop prescription here
          </p>
          <p className="text-[13px] text-slate-400 font-medium mb-4">
            or
          </p>

          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full max-w-xs sm:max-w-md mx-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsScannerOpen(true);
              }}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0c1e3d] text-white text-[13.5px] font-semibold hover:bg-[#162a4d] transition-colors shadow-2xs cursor-pointer"
            >
              <Camera size={15} />
              <span>Take a photo</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                triggerBrowse();
              }}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-[13.5px] font-semibold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <ImageIcon size={15} className="text-slate-500" />
              <span>Choose from device</span>
            </button>
          </div>

          {/* Sample Prescription Helper */}
          <div className="mt-4">
            <button
              type="button"
              disabled={isGeneratingSample}
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSample();
              }}
              className="inline-flex items-center gap-1.5 text-[12.5px] text-slate-500 hover:text-slate-800 font-medium cursor-pointer transition-colors"
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>{isGeneratingSample ? "Loading sample..." : "Try sample prescription"}</span>
            </button>
          </div>

          {/* Subtext Specs */}
          <p className="mt-4 text-[11.5px] text-slate-400 font-medium">
            JPG &bull; PNG &bull; WEBP &bull; Max 10 MB
          </p>
        </div>
      )}
    </div>
  );
}
