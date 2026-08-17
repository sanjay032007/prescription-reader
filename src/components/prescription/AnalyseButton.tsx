"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";

interface AnalyseButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const LOADING_STAGES = [
  "Enhancing prescription resolution...",
  "Deciphering handwriting & medical abbreviations...",
  "Identifying active pharmaceutical ingredients...",
  "Checking clinical indications & warnings...",
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
    }, 1400);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full h-12 rounded-xl text-[14.5px] font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs ${
        disabled || isLoading
          ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
          : "bg-slate-950 hover:bg-slate-800 text-white cursor-pointer hover:shadow"
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin h-4 w-4 text-sky-400 shrink-0" />
          <span className="truncate max-w-xs">{LOADING_STAGES[stageIndex]}</span>
        </>
      ) : (
        <>
          <span>Analyze Prescription</span>
          <ArrowRight size={16} className="opacity-80" />
        </>
      )}
    </button>
  );
}
