import type { Medicine } from "@/lib/gemini";
import { Pill } from "lucide-react";

interface DetectedChipsProps {
  medicines: Medicine[];
}

export default function DetectedChips({ medicines }: DetectedChipsProps) {
  if (!medicines || medicines.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
        <Pill size={12} />
        <span>Extracted:</span>
      </span>
      {medicines.map((med, idx) => (
        <div
          key={idx}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12.5px] font-medium border shadow-2xs ${
            med.isAntibiotic
              ? "bg-amber-50 text-amber-900 border-amber-200/80"
              : "bg-white text-slate-800 border-slate-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              med.isAntibiotic ? "bg-amber-500" : "bg-[#0284c7]"
            }`}
          />
          <span className="font-semibold">{med.brandName}</span>
        </div>
      ))}
    </div>
  );
}
