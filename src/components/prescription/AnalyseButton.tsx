"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowRight, Sparkles } from "lucide-react";

interface AnalyseButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const LOADING_MESSAGES = [
  "Running TrOCR handwritten recognition…",
  "Inspecting via Qwen & Llama vision…",
  "Cross-referencing Indian Pharmacopeia…",
  "Validating dosages & active salts…",
  "Compiling multi-model evidence…",
];

export default function AnalyseButton({
  onClick,
  isLoading = false,
  disabled = false,
}: AnalyseButtonProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setMsgIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1600);
    return () => clearInterval(timer);
  }, [isLoading]);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full py-4 px-6 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2.5 transition-all shadow-sm ${
        disabled || isLoading
          ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
          : "bg-gradient-to-r from-[#0c1e3d] via-[#162a4d] to-[#0c1e3d] hover:opacity-95 text-white cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99]"
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin h-5 w-5 text-[#38bdf8]" />
          <span className="text-white font-medium">{LOADING_MESSAGES[msgIndex]}</span>
        </>
      ) : (
        <>
          <Sparkles size={16} className="text-amber-400" />
          <span>Analyse &amp; Verify Prescription</span>
          <ArrowRight size={16} className="ml-1" />
        </>
      )}
    </button>
  );
}
