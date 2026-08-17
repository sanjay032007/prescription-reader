"use client";

import { Stethoscope, Plus, Check } from "lucide-react";

interface SymptomsInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const COMMON_SYMPTOMS = [
  "Fever",
  "Headache",
  "Cough & Cold",
  "Sore Throat",
  "Body Ache",
  "Acidity / Heartburn",
  "Chest Congestion",
  "Stomach Pain",
];

export default function SymptomsInput({
  value,
  onChange,
  disabled = false,
}: SymptomsInputProps) {
  const currentSymptoms = value
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const toggleSymptom = (sym: string) => {
    if (disabled) return;
    const lower = sym.toLowerCase();
    if (currentSymptoms.includes(lower)) {
      // Remove
      const filtered = value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.toLowerCase() !== lower);
      onChange(filtered.join(", "));
    } else {
      // Add
      if (!value.trim()) {
        onChange(sym);
      } else {
        onChange(`${value.trim()}, ${sym}`);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="symptoms-input"
          className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800"
        >
          <Stethoscope size={15} className="text-[#0284c7]" />
          <span>Patient Symptoms</span>
          <span className="text-slate-400 font-normal text-[12px]">(optional clinical cross-check)</span>
        </label>
      </div>

      <input
        id="symptoms-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="e.g. fever for 3 days, cough, throat irritation..."
        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/70 text-[14px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100 focus:outline-none transition-all"
      />

      {/* Quick Clickable Symptom Pills */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[11.5px] font-medium text-slate-400 mr-1">Quick add:</span>
        {COMMON_SYMPTOMS.map((sym) => {
          const isSelected = currentSymptoms.includes(sym.toLowerCase());
          return (
            <button
              key={sym}
              type="button"
              disabled={disabled}
              onClick={() => toggleSymptom(sym)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#0c1e3d] text-white shadow-2xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {isSelected ? <Check size={11} /> : <Plus size={11} className="text-slate-400" />}
              <span>{sym}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
