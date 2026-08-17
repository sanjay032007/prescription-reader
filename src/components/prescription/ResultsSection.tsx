"use client";

import { useState } from "react";
import type { PrescriptionResult } from "@/lib/gemini";
import MedicineCard from "./MedicineCard";
import DetectedChips from "./DetectedChips";
import AllergyWarning from "./AllergyWarning";
import SymptomMatchCard from "./SymptomMatchCard";
import { Copy, Check, Printer, AlertCircle } from "lucide-react";

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

  const handleCopy = () => {
    const text = result.medicines
      .map(
        (m, i) =>
          `${i + 1}. ${m.brandName} (${m.genericName || "Generic"})\n   Schedule: ${m.dosageUnderstood ? m.frequency || "As prescribed" : "Consult doctor"} | ${m.timing || "N/A"}\n   Duration: ${m.duration || "N/A"}\n   Why: ${m.whyPrescribed || m.description}\n`
      )
      .join("\n");
    const symptomText = result.symptomAnalysis?.explanation
      ? `\nSymptom Analysis: ${result.symptomAnalysis.explanation}\n`
      : "";
    const full = `PRESCRIPTION BREAKDOWN\n${text}${symptomText}\nDisclaimer: Informational only. Always follow your prescribing doctor's directions.`;
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="results-breakdown" className="pt-8 pb-12">
      {/* Top Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#0284c7] uppercase tracking-wider mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
            <span>Analysis Complete</span>
          </div>
          <h2 className="text-[22px] sm:text-[26px] font-extrabold text-slate-950 tracking-tight">
            Prescription Breakdown
          </h2>
          <p className="text-[14px] text-slate-500 mt-0.5">
            {result.medicines.length}{" "}
            {result.medicines.length === 1 ? "medication" : "medications"}{" "}
            identified with pharmacological details
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[13px] font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy summary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[13px] font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer size={14} />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Symptom Correlation Check */}
      {result.symptomAnalysis && (
        <SymptomMatchCard analysis={result.symptomAnalysis} />
      )}

      {/* Detected Medication Quick Chips */}
      <div className="mb-6">
        <DetectedChips medicines={result.medicines} />
      </div>

      {/* Penicillin / Antibiotic Warnings */}
      {allergyWarningMessage && (
        <div className="mb-6">
          <AllergyWarning message={allergyWarningMessage} />
        </div>
      )}

      {/* General Warnings Notice */}
      {result.generalWarnings && result.generalWarnings.length > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
          <div className="flex items-center gap-2 text-[12.5px] font-bold text-amber-900 uppercase tracking-wider mb-1.5">
            <AlertCircle size={15} className="text-amber-600" />
            <span>Important Clinical Notices</span>
          </div>
          <ul className="space-y-1 text-[13px] text-amber-900 list-disc list-inside">
            {result.generalWarnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Medicine Cards Grid (1 col on mobile, 2 cols on tablet/desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {result.medicines.map((med, idx) => (
          <MedicineCard key={idx} medicine={med} isExample={false} />
        ))}
      </div>
    </section>
  );
}
