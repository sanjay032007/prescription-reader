"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

interface AnalyseButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const LOADING_STAGES = [
  "Enhancing prescription contrast...",
  "Deciphering handwriting & Rx abbreviations...",
  "Validating generic drug salts & dosages...",
  "Cross-checking FDA safety warnings...",
];

export default function AnalyseButton({
  onClick,
  isLoading,
  disabled,
}: AnalyseButtonProps) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setStageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % LOADING_STAGES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="w-full flex flex-col items-center">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className={`w-full max-w-xl h-[62px] rounded-2xl text-white text-[17px] sm:text-[18px] font-extrabold tracking-tight flex items-center justify-center gap-3 transition-all duration-300 ${
          disabled || isLoading
            ? "bg-slate-300 cursor-not-allowed opacity-70"
            : "bg-gradient-to-r from-[#0284c7] via-[#4a90d9] to-[#6366f1] hover:shadow-[0_12px_36px_rgba(2,132,199,0.35)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 text-white" />
            <span className="text-[16px] font-bold animate-pulse">
              {LOADING_STAGES[stageIndex]}
            </span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-sky-200" />
            <span>Analyse Prescription</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      <div className="text-[12.5px] text-slate-400 font-semibold tracking-wide text-center mt-3.5 flex items-center justify-center gap-2">
        <span className="text-emerald-600 font-bold">🔒 100% Private</span>
        <span>·</span>
        <span>No Data Stored</span>
        <span>·</span>
        <span>Instant Results</span>
      </div>
    </div>
  );
}
