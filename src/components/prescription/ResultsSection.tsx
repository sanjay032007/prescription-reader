"use client";

import { useState } from "react";
import type { PipelineVerificationResult, VerifiedMedicine, CandidateMatch } from "@/services/types";
import MedicineCard from "./MedicineCard";
import { Copy, Check, ShieldAlert, Cpu } from "lucide-react";

interface ResultsSectionProps {
  result: PipelineVerificationResult | null;
  onConfirmCandidate?: (id: string, candidate: CandidateMatch) => void;
  onKeepOriginal?: (id: string) => void;
}

export default function ResultsSection({
  result,
  onConfirmCandidate,
  onKeepOriginal,
}: ResultsSectionProps) {
  const [copied, setCopied] = useState(false);

  if (!result || !result.medicines || result.medicines.length === 0) return null;

  const handleCopy = () => {
    const text = result.medicines
      .map((m, i) => {
        const name = m.selected_candidate?.name || m.verified_name || m.raw_text;
        const comp = m.selected_candidate?.short_composition || m.composition || "General formulation";
        const dos = m.dosage.raw_text || "As prescribed";
        const dur = m.duration.raw_text || "As advised";
        const tim = m.timing.raw_text || "As advised";
        return `${i + 1}. ${name} (${comp})\n   Dosage: ${dos} | Timing: ${tim} | Duration: ${dur}`;
      })
      .join("\n\n");

    const full = `PRESCRIPTION SUMMARY\n\n${text}\n\nProcessed with Multi-Model Clinical Verification.\nAlways consult your doctor.`;
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <section id="results-breakdown" className="pt-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#0284c7] uppercase tracking-wider mb-1">
            <Cpu size={13} />
            <span>Multi-Model Verification Complete</span>
          </div>
          <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-950">
            Detected Medications
          </h2>
          <p className="text-[14px] text-slate-500 mt-0.5">
            {result.medicines.length} {result.medicines.length === 1 ? "medication" : "medications"} identified with evidence verification
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-600" />
              <span className="text-emerald-700">Copied Summary</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy summary</span>
            </>
          )}
        </button>
      </div>

      {/* General Notices / Warnings */}
      {result.general_warnings && result.general_warnings.length > 0 && (
        <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-3">
          <ShieldAlert size={18} className="text-[#0284c7] shrink-0 mt-0.5" />
          <div className="text-[13px] text-sky-950 font-medium space-y-1">
            {result.general_warnings.map((w, idx) => (
              <p key={idx}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Verified Medicine Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {result.medicines.map((med) => (
          <MedicineCard
            key={med.id}
            medicine={med}
            onConfirmCandidate={onConfirmCandidate}
            onKeepOriginal={onKeepOriginal}
          />
        ))}
      </div>
    </section>
  );
}
