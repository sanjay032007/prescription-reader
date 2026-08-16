"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, X, RefreshCw, Check, Sparkles, AlertCircle } from "lucide-react";

interface LiveCameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export default function LiveCameraScanner({
  isOpen,
  onClose,
  onCapture,
}: LiveCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [capturedBlobUrl, setCapturedBlobUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    setCameraError(null);

    // Stop any existing tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      // Check available video devices
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoDevices.length > 1);
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera access was denied. Please allow camera permissions in your browser.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No camera device was found on this device.");
      } else {
        setCameraError("Unable to access camera. Please use standard photo upload.");
      }
    }
  }, [facingMode]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen && !capturedBlobUrl) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera, capturedBlobUrl]);

  // Take High-Res Photo from Video Stream
  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(video, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCapturedBlob(blob);
            setCapturedBlobUrl(URL.createObjectURL(blob));
            stopCamera();
          }
        },
        "image/jpeg",
        0.95
      );
    }
  };

  // Confirm and Pass File to Parent
  const handleConfirm = () => {
    if (!capturedBlob) return;
    const file = new File([capturedBlob], `scan_rx_${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    onCapture(file);
    handleClose();
  };

  // Retake Photo
  const handleRetake = () => {
    if (capturedBlobUrl) {
      URL.revokeObjectURL(capturedBlobUrl);
    }
    setCapturedBlobUrl(null);
    setCapturedBlob(null);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    if (capturedBlobUrl) {
      URL.revokeObjectURL(capturedBlobUrl);
    }
    setCapturedBlobUrl(null);
    setCapturedBlob(null);
    setCameraError(null);
    onClose();
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Top Controls Header */}
      <div className="w-full max-w-2xl flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0284c7]/20 border border-[#0284c7]/50 flex items-center justify-center text-[#38bdf8]">
            <Camera size={18} />
          </div>
          <span className="text-white font-bold text-[16px] tracking-tight">
            Document Scanner
          </span>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close scanner"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Viewfinder / Preview Area */}
      <div className="relative w-full max-w-md my-auto aspect-[3/4] max-h-[65vh] rounded-[28px] overflow-hidden bg-slate-950 border-2 border-slate-700 shadow-2xl flex items-center justify-center">
        {capturedBlobUrl ? (
          /* Captured Preview Image */
          <img
            src={capturedBlobUrl}
            alt="Captured prescription scan"
            className="w-full h-full object-cover"
          />
        ) : cameraError ? (
          /* Error State */
          <div className="p-6 text-center flex flex-col items-center justify-center text-slate-300">
            <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
            <h4 className="text-white font-bold text-[16px] mb-2">Camera Unavailable</h4>
            <p className="text-[13.5px] text-slate-400 max-w-xs mb-5">{cameraError}</p>
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-[14px]"
            >
              Upload Photo Instead
            </button>
          </div>
        ) : (
          /* Live Camera Stream */
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
            />

            {/* Document Frame Overlay Brackets */}
            <div className="absolute inset-4 sm:inset-6 pointer-events-none flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-8 h-8 border-t-[3px] border-l-[3px] border-[#38bdf8] rounded-tl-lg shadow-[0_0_10px_#38bdf8]" />
                <div className="w-8 h-8 border-t-[3px] border-r-[3px] border-[#38bdf8] rounded-tr-lg shadow-[0_0_10px_#38bdf8]" />
              </div>

              {/* Laser Scan Animation Line */}
              <div
                className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent shadow-[0_0_12px_#38bdf8] absolute top-0 left-0"
                style={{
                  animation: "scan 2.5s ease-in-out infinite",
                }}
              />

              <div className="flex justify-between">
                <div className="w-8 h-8 border-b-[3px] border-l-[3px] border-[#38bdf8] rounded-bl-lg shadow-[0_0_10px_#38bdf8]" />
                <div className="w-8 h-8 border-b-[3px] border-r-[3px] border-[#38bdf8] rounded-br-lg shadow-[0_0_10px_#38bdf8]" />
              </div>
            </div>

            {/* Alignment Guideline Tag */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11.5px] font-medium pointer-events-none text-center whitespace-nowrap">
              Align prescription inside frame
            </div>
          </>
        )}
      </div>

      {/* Bottom Actions Bar */}
      <div className="w-full max-w-md flex items-center justify-between px-6 z-20">
        {capturedBlobUrl ? (
          /* Confirm / Retake Actions */
          <div className="w-full flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-[14.5px] transition-all cursor-pointer"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#4a90d9] to-[#6366f1] text-white font-extrabold text-[15px] shadow-lg shadow-sky-500/30 hover:brightness-105 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check size={18} />
              <span>Use Scan</span>
            </button>
          </div>
        ) : (
          /* Live Shutter Controls */
          <div className="w-full flex items-center justify-between">
            {/* Camera Flip (if multiple cameras available) */}
            <div className="w-12 flex justify-start">
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={toggleCamera}
                  className="w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Flip camera"
                >
                  <RefreshCw size={18} />
                </button>
              )}
            </div>

            {/* Big Circular Capture Shutter Button */}
            <button
              type="button"
              onClick={handleCapture}
              disabled={!!cameraError}
              className="relative w-18 h-18 rounded-full border-4 border-white flex items-center justify-center p-1 group hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              aria-label="Capture photo"
            >
              <div className="w-full h-full rounded-full bg-white group-hover:bg-[#38bdf8] transition-colors" />
            </button>

            {/* Spacer for symmetrical alignment */}
            <div className="w-12" />
          </div>
        )}
      </div>
    </div>
  );
}
