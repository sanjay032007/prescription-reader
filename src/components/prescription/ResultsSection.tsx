"use client";

import { useState } from "react";
import type { PipelineVerificationResult, VerifiedMedicine, CandidateMatch } from "@/services/types";
import MedicineCard from "./MedicineCard";
import { Copy, Check, Printer, ShieldAlert, Cpu, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

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

    const full = `PRESCRIPTION BREAKDOWN SUMMARY\n\n${text}\n\nVerified with Clinical AI & Indian Pharmacopeia Consensus.\nAlways consult your healthcare professional.`;
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="results-breakdown" className="pt-8 sm:pt-12 pb-16">
      
      {/* Stitch Verification Successful Banner */}
      <div className="bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 rounded-[2rem] p-6 mb-8 flex items-center gap-4 shadow-sm">
        <div className="bg-[#2D6A4F] rounded-full p-2.5 flex-shrink-0 text-white shadow-xs">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h2 className="font-serif text-[18px] sm:text-[20px] font-bold text-[#2D6A4F] m-0 leading-tight">
            Verification Successful
          </h2>
          <p className="font-sans text-[13px] sm:text-[14px] text-slate-600 m-0 mt-0.5 font-light">
            Prescription matches recognized Indian Pharmacopeia database entries. High-confidence multi-model consensus.
          </p>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-[11.5px] font-sans font-bold uppercase tracking-widest text-[#094cb2] block mb-1">
            Extraction Results
          </span>
          <h2 className="font-serif text-[26px] sm:text-[34px] font-bold text-[#1b1c1d] tracking-tight">
            Identified Medications
          </h2>

          <div className="flex items-center gap-3 text-[13.5px] font-sans text-slate-500 mt-1">
            <span>
              {result.medicines.length} {result.medicines.length === 1 ? "medication" : "medications"} identified
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-[#2D6A4F] font-semibold flex items-center gap-1">
              <CheckCircle2 size={15} />
              <span>{verifiedCount} verified</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#094cb2]/20 bg-white text-[13px] font-sans font-semibold text-[#094cb2] hover:bg-[#faf9fa] transition-all cursor-pointer shadow-xs"
          >
            <Printer size={15} />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#094cb2] hover:bg-[#002e7a] text-[13.5px] font-sans font-semibold text-white transition-all cursor-pointer shadow-md shadow-[#094cb2]/20"
          >
            {copied ? (
              <>
                <Check size={15} className="text-emerald-300" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={15} />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* General Warnings Banner */}
      {result.general_warnings && result.general_warnings.length > 0 && (
        <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-3">
          <ShieldAlert size={18} className="text-[#094cb2] shrink-0 mt-0.5" />
          <div className="text-[13px] font-sans text-sky-950 font-medium space-y-1">
            {result.general_warnings.map((w, idx) => (
              <p key={idx}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Verified Medicine Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
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
