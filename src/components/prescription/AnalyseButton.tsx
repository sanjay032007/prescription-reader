"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowRight, Sparkles, Cpu } from "lucide-react";

interface AnalyseButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const LOADING_STAGES = [
  "Running TrOCR handwritten neural recognition…",
  "Visual cross-inspection via Qwen & Llama…",
  "Validating against Indian Pharmacopeia…",
  "Verifying active salt formulations & dosages…",
  "Compiling multi-model evidence consensus…",
];

export default function AnalyseButton({
  onClick,
  isLoading = false,
  disabled = false,
}: AnalyseButtonProps) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setStageIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % LOADING_STAGES.length);
    }, 1600);
    return () => clearInterval(timer);
  }, [isLoading]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full h-13 sm:h-14 px-6 rounded-2xl font-extrabold text-[15px] sm:text-[16px] flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.99] ${
        disabled || isLoading
          ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
          : "bg-gradient-to-r from-[#0284c7] to-[#2563eb] hover:from-[#0369a1] hover:to-[#1d4ed8] text-white cursor-pointer hover:shadow-lg"
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin h-5 w-5 text-white" />
          <span className="text-white font-semibold text-[14px] sm:text-[15px]">
            {LOADING_STAGES[stageIndex]}
          </span>
        </>
      ) : (
        <>
          <Cpu size={18} className="text-white" />
          <span>Analyse &amp; Verify Prescription</span>
          <ArrowRight size={18} className="ml-1" />
        </>
      )}
    </button>
  );
}
