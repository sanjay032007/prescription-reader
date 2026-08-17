"use client";

interface SymptomsInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const QUICK_SYMPTOMS = [
  "Fever",
  "Headache",
  "Cough",
  "Sore throat",
  "Body pain",
  "Acidity",
];

export default function SymptomsInput({
  value,
  onChange,
  disabled,
}: SymptomsInputProps) {
  const handleAdd = (symptom: string) => {
    if (disabled) return;
    if (!value.trim()) {
      onChange(symptom);
      return;
    }
    if (!value.toLowerCase().includes(symptom.toLowerCase())) {
      onChange(`${value.trim()}, ${symptom}`);
    }
  };

  return (
    <div>
      <label
        htmlFor="symptoms"
        className="block text-[13px] font-medium text-slate-700 mb-1.5"
      >
        Your symptoms{" "}
        <span className="text-slate-400 font-normal">(optional)</span>
      </label>
      <input
        id="symptoms"
        type="text"
        className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50 focus:border-slate-400 focus:bg-white focus:outline-none text-[14px] text-[#0a1628] placeholder-slate-400 transition-colors"
        placeholder="e.g. fever, headache, sore throat"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {QUICK_SYMPTOMS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => handleAdd(s)}
            className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 text-[12px] font-medium transition-colors cursor-pointer"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
