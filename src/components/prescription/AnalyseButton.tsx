"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface AnalyseButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const LOADING_STAGES = [
  "Reading prescription…",
  "Identifying medicines…",
  "Checking dosages…",
  "Verifying safety…",
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
    }, 1500);
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full h-12 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2.5 transition-colors ${
        disabled || isLoading
          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
          : "bg-[#0a1628] text-white hover:bg-[#1a2d4a] cursor-pointer"
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin h-4 w-4" />
          <span>{LOADING_STAGES[stageIndex]}</span>
        </>
      ) : (
        <span>Analyse prescription</span>
      )}
    </button>
  );
}
