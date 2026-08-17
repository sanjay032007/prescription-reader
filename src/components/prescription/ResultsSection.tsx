"use client";

import { useState } from "react";
import type { PrescriptionResult } from "@/lib/gemini";
import MedicineCard from "./MedicineCard";
import DetectedChips from "./DetectedChips";
import AllergyWarning from "./AllergyWarning";
import SymptomMatchCard from "./SymptomMatchCard";
import { Copy, Check } from "lucide-react";

interface ResultsSectionProps {
  result: PrescriptionResult | null;
  allergyWarningMessage: string | null;
}

export default function ResultsSection({
  result,
  allergyWarningMessage,
}: ResultsSectionProps) {
  const [copied, setCopied] = useState(false);

  if (!result || !result.medicines || result.medicines.length === 0)
    return null;

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
    const full = `PRESCRIPTION SUMMARY\n${text}${symptomText}\nAlways consult your physician.`;
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <section id="results-breakdown" className="pt-8 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-[22px] sm:text-[26px] font-bold text-[#0a1628]">
            Results
          </h2>
          <p className="text-[14px] text-slate-500 mt-0.5">
            {result.medicines.length}{" "}
            {result.medicines.length === 1 ? "medication" : "medications"}{" "}
            identified
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:border-slate-300 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-500" />
              <span className="text-emerald-600">Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy summary</span>
            </>
          )}
        </button>
      </div>

      {/* Symptom match */}
      {result.symptomAnalysis && (
        <SymptomMatchCard analysis={result.symptomAnalysis} />
      )}

      {/* Detected chips */}
      <div className="mb-5">
        <DetectedChips medicines={result.medicines} />
      </div>

      {/* Allergy warning */}
      {allergyWarningMessage && (
        <div className="mb-5">
          <AllergyWarning message={allergyWarningMessage} />
        </div>
      )}

      {/* General warnings */}
      {result.generalWarnings && result.generalWarnings.length > 0 && (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-[13px] font-semibold text-amber-800 mb-1.5">
            Important notices
          </p>
          <ul className="space-y-1 text-[13px] text-amber-900 list-disc list-inside">
            {result.generalWarnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Medicine cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {result.medicines.map((med, idx) => (
          <MedicineCard key={idx} medicine={med} isExample={false} />
        ))}
      </div>
    </section>
  );
}
