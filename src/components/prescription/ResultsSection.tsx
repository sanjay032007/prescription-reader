"use client";

import { useState } from "react";
import type { PrescriptionResult } from "@/lib/gemini";
import MedicineCard from "./MedicineCard";
import DetectedChips from "./DetectedChips";
import AllergyWarning from "./AllergyWarning";
import { Printer, Copy, Check, Share2 } from "lucide-react";

interface ResultsSectionProps {
  result: PrescriptionResult | null;
  allergyWarningMessage: string | null;
}

export default function ResultsSection({
  result,
  allergyWarningMessage,
}: ResultsSectionProps) {
  const [copied, setCopied] = useState(false);

  if (!result || !result.medicines || result.medicines.length === 0) {
    return null;
  }

  const handleCopySummary = () => {
    const text = result.medicines
      .map(
        (m, i) =>
          `${i + 1}. ${m.brandName} (${m.genericName || "Generic"})\n   Schedule: ${m.frequency || "As prescribed"} | ${m.timing || "N/A"}\n   Duration: ${m.duration || "N/A"}\n   Why: ${m.whyPrescribed || m.description}\n`
      )
      .join("\n");

    const fullSummary = `PRESCRIPTION SUMMARY\n--------------------\n${text}\nImportant: Always consult your physician or pharmacist for questions regarding your medication schedule.`;

    navigator.clipboard.writeText(fullSummary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section
      id="results-breakdown"
      className="w-full py-16 sm:py-24 border-t border-slate-200/60 bg-gradient-to-b from-white/70 to-transparent"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
        {/* Header and Quick Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div>
            <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#0284c7] mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-pulse" />
              <span>AI CLINICAL EXTRACTION COMPLETE</span>
            </div>
            <h2 className="text-[32px] sm:text-[42px] font-extrabold tracking-tight text-[#0a1628]">
              Your prescription breakdown
            </h2>
            <p className="text-[16px] text-slate-500 mt-2 max-w-2xl">
              Verified clinical breakdown with dosages, daily timings, and safety warnings.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-[#0284c7] text-[13.5px] font-bold text-slate-700 hover:text-[#0284c7] transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-emerald-500" />
                  <span className="text-emerald-600">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy Medication Plan</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-sm hover:bg-slate-800 text-[13.5px] font-bold transition-all cursor-pointer"
            >
              <Printer size={16} />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Chips row */}
        <DetectedChips medicines={result.medicines} />

        {/* Allergy warning if present */}
        {allergyWarningMessage && (
          <AllergyWarning message={allergyWarningMessage} />
        )}

        {/* General Warnings Notice */}
        {result.generalWarnings && result.generalWarnings.length > 0 && (
          <div className="mb-8 p-5 bg-amber-50/80 border border-amber-200/80 rounded-2xl">
            <div className="text-[12px] font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-2">
              <i className="ti ti-alert-triangle text-base" />
              <span>Important Medical Notices</span>
            </div>
            <ul className="space-y-1 text-[14px] text-amber-900 list-disc list-inside">
              {result.generalWarnings.map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Medicine Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {result.medicines.map((med, idx) => (
            <MedicineCard key={idx} medicine={med} isExample={false} />
          ))}
        </div>
      </div>
    </section>
  );
}
