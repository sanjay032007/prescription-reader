"use client";

import { AlertCircle } from "lucide-react";

interface ErrorCardProps {
  message?: string;
}

export default function ErrorCard({ message }: ErrorCardProps) {
  return (
    <div className="bg-red-50/90 border border-red-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
      <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
        <AlertCircle size={18} />
      </div>
      <div>
        <div className="text-[14px] font-bold text-red-950 mb-0.5">
          Prescription Unreadable
        </div>
        <div className="text-[13px] text-red-800 leading-relaxed">
          {message || "We were unable to extract legible text from this image. Please upload a well-lit, high-resolution photo."}
        </div>
      </div>
    </div>
  );
}
