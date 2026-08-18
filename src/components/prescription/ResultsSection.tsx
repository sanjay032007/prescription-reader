"use client";

import { useState } from "react";
import type { PipelineVerificationResult, VerifiedMedicine, CandidateMatch } from "@/services/types";
import MedicineCard from "./MedicineCard";
import { Copy, Check, Printer, ShieldAlert, Cpu, Sparkles, CheckCircle2 } from "lucide-react";

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

  const verifiedCount = result.medicines.filter((m) => m.confidence === "HIGH" || m.user_confirmed).length;

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

    const full = `PRESCRIPTION BREAKDOWN SUMMARY\n\n${text}\n\nProcessed with Multi-Model Clinical Intelligence.\nAlways follow your doctor's clinical instructions.`;
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="results-breakdown" className="pt-6 sm:pt-8 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11.5px] sm:text-[12px] font-extrabold uppercase tracking-wider mb-2 border border-emerald-200">
            <Cpu size={14} />
            <span>Multi-Model Verification Complete</span>
          </div>

          <h2 className="text-[24px] sm:text-[30px] font-extrabold text-slate-950 tracking-tight">
            Detected Medications
          </h2>

          <div className="flex items-center gap-3 text-[13px] sm:text-[14px] text-slate-500 mt-1">
            <span>
              {result.medicines.length} {result.medicines.length === 1 ? "medication" : "medications"} identified
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 size={14} />
              <span>{verifiedCount} verified</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-[13px] font-semibold text-white transition-all cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* General Warnings Banner */}
      {result.general_warnings && result.general_warnings.length > 0 && (
        <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-3">
          <ShieldAlert size={18} className="text-[#0284c7] shrink-0 mt-0.5" />
          <div className="text-[12.5px] sm:text-[13px] text-sky-950 font-medium space-y-1">
            {result.general_warnings.map((w, idx) => (
              <p key={idx}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Verified Medicine Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
