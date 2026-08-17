"use client";

import { AlertTriangle } from "lucide-react";

interface AllergyWarningProps {
  message?: string | null;
}

export default function AllergyWarning({ message }: AllergyWarningProps) {
  if (!message) return null;

  return (
    <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
      <div className="w-8 h-8 rounded-xl bg-amber-100/90 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
        <AlertTriangle size={18} />
      </div>
      <div>
        <div className="text-[13.5px] font-bold text-amber-900 mb-0.5">
          Allergy &amp; Sensitivity Notice
        </div>
        <div className="text-[13px] text-amber-800 leading-relaxed">
          {message}
        </div>
      </div>
    </div>
  );
}
