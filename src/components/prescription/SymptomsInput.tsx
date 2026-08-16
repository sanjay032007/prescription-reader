"use client";

interface SymptomsInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const COMMON_SYMPTOMS = [
  "Fever & chills",
  "Sore throat",
  "Headache",
  "Dry cough",
  "Stomach ache / acidity",
  "Allergy & runny nose",
  "Body pain",
];

export default function SymptomsInput({
  value,
  onChange,
  disabled,
}: SymptomsInputProps) {
  const handleAddSymptom = (symptom: string) => {
    if (disabled) return;
    if (!value.trim()) {
      onChange(symptom);
    } else if (!value.toLowerCase().includes(symptom.toLowerCase())) {
      onChange(`${value.trim()}, ${symptom}`);
    }
  };

  return (
    <div className="w-full bg-white/95 border border-slate-200/80 rounded-[24px] p-6 mb-6 shadow-2xs">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="symptoms-input"
          className="block text-[14px] font-bold text-[#0a1628]"
        >
          Patient symptoms <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <span className="text-[12px] text-[#0284c7] font-semibold">
          Helps verify why medicines were prescribed
        </span>
      </div>

      <input
        id="symptoms-input"
        type="text"
        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#0284c7] focus:bg-white focus:outline-none text-[15px] text-[#0a1628] placeholder-slate-400 transition-all font-sans"
        placeholder="e.g. fever, headache, sore throat for 3 days"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />

      {/* Quick Suggestion Pills */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-semibold text-slate-400">Quick add:</span>
        {COMMON_SYMPTOMS.map((symptom, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => handleAddSymptom(symptom)}
            className="px-2.5 py-1 rounded-lg bg-slate-100/80 hover:bg-[#e0f2fe] text-slate-600 hover:text-[#0284c7] border border-slate-200/60 text-[12px] font-medium transition-colors cursor-pointer"
          >
            + {symptom}
          </button>
        ))}
      </div>
    </div>
  );
}
