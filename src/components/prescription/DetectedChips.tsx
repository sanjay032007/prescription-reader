import type { Medicine } from "@/lib/gemini";

interface DetectedChipsProps {
  medicines: Medicine[];
}

export default function DetectedChips({ medicines }: DetectedChipsProps) {
  if (!medicines || medicines.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-[8px] mb-[32px]">
      {medicines.map((med, idx) => {
        if (med.isAntibiotic) {
          return (
            <div
              key={idx}
              className="bg-white border border-[#fed7aa] text-[#0a1628] text-[13px] font-semibold px-[16px] py-[8px] rounded-full flex items-center gap-[8px] shadow-2xs"
            >
              <span className="w-[6px] h-[6px] rounded-full bg-[#f97316]" />
              <span>{med.brandName}</span>
            </div>
          );
        }
        return (
          <div
            key={idx}
            className="bg-white border border-[#e8eef5] text-[#0a1628] text-[13px] font-semibold px-[16px] py-[8px] rounded-full flex items-center gap-[8px] shadow-2xs"
          >
            <span className="w-[6px] h-[6px] rounded-full bg-[#4a90d9]" />
            <span>{med.brandName}</span>
          </div>
        );
      })}
    </div>
  );
}
