"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { FileText, Sparkles, Camera, Upload, ScanLine } from "lucide-react";
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
      alert("File too large. Max 10 MB.");
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
  const onChange = (e: ChangeEvent<HTMLInputElement>) =>
    handleFiles(e.target.files);
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
        ctx.fillText(
          "Dr. Anita Sharma, MBBS, MD · Reg. 48921-A",
          120,
          160
        );
        ctx.fillStyle = "#64748b";
        ctx.font = "500 20px sans-serif";
        ctx.fillText(
          "Patient: Johnathan Doe · Age: 38/M · Date: 16/08/2026",
          120,
          240
        );
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
        ctx.fillText(
          "1. Tab. Paracetamol 650 mg — 1 - 1 - 1 (x 5 days pc)",
          160,
          520
        );
        ctx.fillText(
          "2. Cap. Augmentin 625 mg — 1 - 0 - 1 (x 7 days pc)",
          160,
          640
        );
        ctx.fillText(
          "3. Tab. Pantoprazole 40 mg — 1 - 0 - 0 (x 5 days ac)",
          160,
          760
        );
        ctx.fillText(
          "4. Syp. Levocetirizine 5 ml — 0 - 0 - 1 (x 3 days hs)",
          160,
          880
        );
        ctx.strokeStyle = "rgba(2, 132, 199, 0.8)";
        ctx.lineWidth = 4;
        ctx.strokeRect(200, 1100, 260, 110);
        ctx.fillStyle = "#0284c7";
        ctx.font = "bold 22px sans-serif";
        ctx.fillText("VERIFIED RX", 250, 1165);
        ctx.fillStyle = "#0f3460";
        ctx.font = "italic bold 52px cursive";
        ctx.fillText("Dr. Anita Sharma", 1100, 1160);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              onFileSelected(
                new File([blob], "sample_prescription.jpg", {
                  type: "image/jpeg",
                })
              );
            }
            setIsGeneratingSample(false);
          },
          "image/jpeg",
          0.95
        );
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
        <div>
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
            <img
              src={previewUrl}
              alt="Prescription preview"
              className="h-[180px] sm:h-[280px] w-full object-contain bg-white"
            />
            <div className="px-4 py-3 flex items-center justify-between border-t border-slate-200 bg-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText size={16} className="text-slate-400 shrink-0" />
                <span className="text-[13px] font-medium text-slate-700 truncate max-w-[200px] sm:max-w-sm">
                  {fileName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="text-[12px] font-medium text-slate-500 hover:text-slate-700 px-2 py-1 rounded-md hover:bg-slate-50 cursor-pointer"
                >
                  Rescan
                </button>
                <button
                  type="button"
                  onClick={triggerBrowse}
                  className="text-[12px] font-medium text-slate-500 hover:text-slate-700 px-2 py-1 rounded-md hover:bg-slate-50 cursor-pointer"
                >
                  Change
                </button>
              </div>
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
          className={`rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all border-2 border-dashed ${
            dragOver
              ? "border-[#0284c7] bg-sky-50"
              : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
          }`}
        >
          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-[15px] font-semibold text-[#0a1628] mb-1">
            Upload prescription image
          </p>
          <p className="text-[13px] text-slate-400 mb-5">
            Drag and drop, or click to browse
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 w-full max-w-sm mx-auto">
            <button
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0a1628] text-white text-[13px] font-semibold hover:bg-[#1a2d4a] transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsScannerOpen(true);
              }}
            >
              <ScanLine size={14} />
              <span>Scan with camera</span>
            </button>
            <button
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                triggerBrowse();
              }}
            >
              <Camera size={14} />
              <span>Browse photo</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isGeneratingSample}
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-600 font-medium cursor-pointer transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleLoadSample();
            }}
          >
            <Sparkles size={12} />
            <span>
              {isGeneratingSample
                ? "Loading..."
                : "Try a sample prescription"}
            </span>
          </button>

          <p className="mt-5 text-[11px] text-slate-400">
            JPG, PNG, WEBP · Max 10 MB
          </p>
        </div>
      )}
    </div>
  );
}
