"use client";

import { useState } from "react";
import type { PipelineVerificationResult, CandidateMatch } from "@/services/types";
import MedicineCard from "./MedicineCard";
import {
  Copy,
  Check,
  Printer,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  Share2,
} from "lucide-react";

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

  const handleCopySummary = () => {
    const text = result.medicines
      .map(
        (m, i) =>
          `${i + 1}. ${m.verified_name || m.raw_text} (${m.composition || "Generic"})\n   Schedule: ${m.dosage?.raw_text || "As prescribed"} | Timing: ${m.timing?.raw_text || "N/A"}\n   Duration: ${m.duration?.raw_text || "N/A"}\n   Why: ${m.why_prescribed || m.description || "Prescribed medication"}\n`
      )
      .join("\n");

    const full = `==============================\nPRESCRIPTION BREAKDOWN SUMMARY\n==============================\n${text}\n* Always consult your physician before altering any dosage.\nVerified via PrescriptCheck Multi-Model AI.`;

    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="results-breakdown" className="pt-10 pb-20 scroll-mt-20">
      
      {/* Verification Banner */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/25 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2D6A4F] text-white flex items-center justify-center shadow-lg shadow-[#2D6A4F]/20 shrink-0">
            <ShieldCheck size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#2D6A4F] uppercase tracking-widest bg-emerald-100/80 px-3 py-0.5 rounded-full">
                Verification Complete
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {result.medicines.length} {result.medicines.length === 1 ? "medication" : "medications"} identified
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1b1c1d] mt-1">
              Clinical Prescription Schedule
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-700">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy size={14} className="text-slate-600" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#094cb2] text-white text-xs font-bold hover:bg-[#002e7a] transition-all shadow-md shadow-[#094cb2]/20 cursor-pointer"
          >
            <Printer size={14} />
            <span>Print Prescription</span>
          </button>
        </div>
      </div>

      {/* General Warnings if any */}
      {result.general_warnings && result.general_warnings.length > 0 && (
        <div className="mb-8 p-5 bg-amber-50/90 border border-amber-200 rounded-3xl">
          <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle size={15} className="text-amber-600" />
            <span>Important Physician Notices</span>
          </p>
          <ul className="space-y-1.5 text-xs text-amber-900/90 font-medium list-disc list-inside">
            {result.general_warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Symptom Analysis Box if provided */}
      {result.symptom_analysis && (
        <div className="mb-8 p-6 rounded-3xl glass-card border border-sky-200/80 bg-sky-50/50">
          <span className="text-[10.5px] font-bold text-[#094cb2] uppercase tracking-widest block mb-1">
            Symptom Correlation
          </span>
          <p className="font-serif text-lg font-bold text-[#1b1c1d] mb-1">
            Indication &amp; Recovery Assessment
          </p>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
            {result.symptom_analysis.explanation || "Prescribed medications appropriately match the reported clinical symptoms."}
          </p>
        </div>
      )}

      {/* Grid of Verified Medicine Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
