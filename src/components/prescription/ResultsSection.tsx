"use client";

import { useState } from "react";
import type { PrescriptionResult } from "@/lib/gemini";
import MedicineCard from "./MedicineCard";
import DetectedChips from "./DetectedChips";
import AllergyWarning from "./AllergyWarning";
import SymptomMatchCard from "./SymptomMatchCard";
import { Printer, Copy, Check } from "lucide-react";

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
          `${i + 1}. ${m.brandName} (${m.genericName || "Generic"})\n   Schedule: ${m.dosageUnderstood ? (m.frequency || "As prescribed") : "Consult doctor"} | ${m.timing || "N/A"}\n   Duration: ${m.duration || "N/A"}\n   Why: ${m.whyPrescribed || m.description}\n`
      )
      .join("\n");

    const symptomText = result.symptomAnalysis?.explanation
      ? `\nSymptom Analysis: ${result.symptomAnalysis.explanation}\n`
      : "";

    const fullSummary = `PRESCRIPTION SUMMARY\n--------------------\n${text}${symptomText}\nImportant: Always consult your physician or pharmacist for questions regarding your medication schedule.`;

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
      className="w-full pt-8 pb-12 sm:pb-16"
    >
      {/* Header and Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#0284c7] mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-pulse" />
            <span>AI CLINICAL EXTRACTION COMPLETE</span>
          </div>
          <h2 className="text-[24px] sm:text-[32px] font-extrabold tracking-tight text-[#0a1628]">
            Prescription Breakdown
          </h2>
          <p className="text-[14px] sm:text-[15px] text-slate-500 mt-1">
            {result.medicines.length}{" "}
            {result.medicines.length === 1 ? "medication" : "medications"} identified with clinical details.
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-[#0284c7] text-[13px] sm:text-[13.5px] font-bold text-slate-700 hover:text-[#0284c7] transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={15} className="text-emerald-500" />
                <span className="text-emerald-600">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy size={15} />
                <span>Copy Medication Plan</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white shadow-xs hover:bg-slate-800 text-[13px] sm:text-[13.5px] font-bold transition-all cursor-pointer"
          >
            <Printer size={15} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Symptom & Prescription Correlation / Mismatch Analysis Card */}
      {result.symptomAnalysis && (
        <SymptomMatchCard analysis={result.symptomAnalysis} />
      )}

      {/* Detected Chips Bar */}
      <div className="mb-6">
        <DetectedChips medicines={result.medicines} />
      </div>

      {/* Allergy warning if present */}
      {allergyWarningMessage && (
        <div className="mb-6">
          <AllergyWarning message={allergyWarningMessage} />
        </div>
      )}

      {/* General Warnings Notice */}
      {result.generalWarnings && result.generalWarnings.length > 0 && (
        <div className="mb-6 p-4 sm:p-5 bg-amber-50/80 border border-amber-200/80 rounded-2xl">
          <div className="text-[11.5px] font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
            <span className="text-amber-600">⚠️</span>
            <span>Important Medical Notices</span>
          </div>
          <ul className="space-y-1 text-[13px] sm:text-[14px] text-amber-900 list-disc list-inside">
            {result.generalWarnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Medicine Cards Grid (1 column on mobile, 2 columns on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {result.medicines.map((med, idx) => (
          <MedicineCard key={idx} medicine={med} isExample={false} />
        ))}
      </div>
    </section>
  );
}
