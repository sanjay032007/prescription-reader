"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, X, RefreshCw, Check, AlertCircle, ScanLine } from "lucide-react";

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

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
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
        setCameraError("Camera permission was denied. Please allow camera access in your browser settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No camera device found on this system.");
      } else {
        setCameraError("Unable to open camera. Please use standard photo upload.");
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

  const handleConfirm = () => {
    if (!capturedBlob) return;
    const file = new File([capturedBlob], `scan_rx_${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    onCapture(file);
    handleClose();
  };

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
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="w-full max-w-xl flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Camera size={18} />
          </div>
          <span className="text-white font-bold text-[15px] tracking-tight">
            Prescription Scanner
          </span>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close scanner"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Viewfinder Frame */}
      <div className="relative w-full max-w-md my-auto aspect-[3/4] max-h-[65vh] rounded-3xl overflow-hidden bg-black border border-slate-700 shadow-2xl flex items-center justify-center">
        {capturedBlobUrl ? (
          <img
            src={capturedBlobUrl}
            alt="Captured scan"
            className="w-full h-full object-cover"
          />
        ) : cameraError ? (
          <div className="p-6 text-center flex flex-col items-center justify-center text-slate-300">
            <AlertCircle className="w-10 h-10 text-amber-400 mb-3" />
            <h4 className="text-white font-bold text-[15px] mb-1.5">Camera Notice</h4>
            <p className="text-[13px] text-slate-400 max-w-xs mb-4 leading-relaxed">{cameraError}</p>
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-[13px]"
            >
              Upload Photo Instead
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
            />

            {/* Viewfinder Target Framing */}
            <div className="absolute inset-5 pointer-events-none flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-2 border-l-2 border-sky-400 rounded-tl-md" />
                <div className="w-6 h-6 border-t-2 border-r-2 border-sky-400 rounded-tr-md" />
              </div>
              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-2 border-l-2 border-sky-400 rounded-bl-md" />
                <div className="w-6 h-6 border-b-2 border-r-2 border-sky-400 rounded-br-md" />
              </div>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-slate-200 text-[11.5px] font-medium pointer-events-none">
              Align prescription inside the corners
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md flex items-center justify-between px-4 z-20">
        {capturedBlobUrl ? (
          <div className="w-full flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-[14px] transition-colors cursor-pointer"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-3 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Check size={16} />
              <span>Use This Photo</span>
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between">
            <div className="w-10 flex justify-start">
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={toggleCamera}
                  className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Flip camera"
                >
                  <RefreshCw size={16} />
                </button>
              )}
            </div>

            {/* Circular Shutter Button */}
            <button
              type="button"
              onClick={handleCapture}
              disabled={!!cameraError}
              className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center p-1 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              aria-label="Capture prescription photo"
            >
              <div className="w-full h-full rounded-full bg-white transition-colors" />
            </button>

            <div className="w-10" />
          </div>
        )}
      </div>
    </div>
  );
}
