import type { Medicine } from "@/lib/gemini";

interface DetectedChipsProps {
  medicines: Medicine[];
}

export default function DetectedChips({ medicines }: DetectedChipsProps) {
  if (!medicines || medicines.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {medicines.map((med, idx) => {
        if (med.isAntibiotic) {
          return (
            <div
              key={idx}
              className="bg-white border border-amber-200 text-[#0a1628] text-[12.5px] sm:text-[13px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-none">{med.brandName}</span>
            </div>
          );
        }
        return (
          <div
            key={idx}
            className="bg-white border border-slate-200 text-[#0a1628] text-[12.5px] sm:text-[13px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#0284c7] shrink-0" />
            <span className="truncate max-w-[200px] sm:max-w-none">{med.brandName}</span>
          </div>
        );
      })}
    </div>
  );
}
