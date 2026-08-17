"use client";

import { Activity } from "lucide-react";

interface SymptomsInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const COMMON_SYMPTOMS = [
  "Fever",
  "Headache",
  "Sore throat",
  "Dry cough",
  "Stomach pain / Acidity",
  "Body ache",
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
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="symptoms"
          className="text-[13.5px] font-bold text-slate-900"
        >
          Patient symptoms <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <span className="text-[11.5px] font-medium text-slate-400">
          Used to verify clinical indication
        </span>
      </div>

      <input
        id="symptoms"
        type="text"
        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:border-[#0284c7] focus:bg-white focus:outline-none text-[14px] text-slate-900 placeholder-slate-400 transition-all font-sans"
        placeholder="e.g. fever for 2 days, sore throat, severe headache"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[11.5px] font-semibold text-slate-400 mr-1">Quick add:</span>
        {COMMON_SYMPTOMS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => handleAdd(s)}
            className="px-2.5 py-1 rounded-lg bg-slate-100/80 hover:bg-sky-50 text-slate-600 hover:text-[#0284c7] border border-slate-200/60 text-[12px] font-medium transition-colors cursor-pointer"
          >
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}
