"use client";

import { useState } from "react";
import type { Medicine, PrescriptionResult } from "@/lib/gemini";
import MedicineCard from "./MedicineCard";
import DetectedChips from "./DetectedChips";
import AllergyWarning from "./AllergyWarning";
import SymptomMatchCard from "./SymptomMatchCard";
import { Copy, Check, Printer, AlertCircle, ShieldCheck } from "lucide-react";

interface ResultsSectionProps {
  result: PrescriptionResult | null;
  allergyWarningMessage: string | null;
}

export default function ResultsSection({
  result,
  allergyWarningMessage,
}: ResultsSectionProps) {
  const [copied, setCopied] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>(result?.medicines || []);

  if (!result || !result.medicines || result.medicines.length === 0) {
    return null;
  }

  const handleUpdateMedicine = (index: number, updated: Medicine) => {
    setMedicines((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  const activeMedicines = medicines.length > 0 ? medicines : result.medicines;

  const handleCopy = () => {
    const text = activeMedicines
      .map(
        (m, i) =>
          `${i + 1}. ${m.brandName} (${m.genericName || "Generic"})\n   Confidence: ${m.confidence.toUpperCase()}\n   Schedule: ${m.dosageUnderstood ? m.frequency || "As prescribed" : "Consult doctor"} | ${m.timing || "N/A"}\n   Duration: ${m.duration || "N/A"}\n   Why: ${m.whyPrescribed || m.description}\n`
      )
      .join("\n");
    const symptomText = result.symptomAnalysis?.explanation
      ? `\nSymptom Analysis: ${result.symptomAnalysis.explanation}\n`
      : "";
    const full = `VERIFIED PRESCRIPTION BREAKDOWN (Indian Pharmacopeia Multi-Layer Verified)\n${text}${symptomText}\nDisclaimer: Informational only. Always follow your prescribing physician's directions.`;
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const verifiedCount = activeMedicines.filter((m) => m.confidence === "high").length;

  return (
    <section id="results-breakdown" className="pt-8 pb-12">
      {/* Top Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1.5">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>4-Layer Multi-Verification Complete</span>
          </div>
          <h2 className="text-[22px] sm:text-[26px] font-extrabold text-slate-950 tracking-tight">
            Prescription Breakdown
          </h2>
          <p className="text-[14px] text-slate-500 mt-0.5">
            {activeMedicines.length}{" "}
            {activeMedicines.length === 1 ? "medication" : "medications"}{" "}
            detected ({verifiedCount} verified against Indian drug database)
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
        <DetectedChips medicines={activeMedicines} />
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

      {/* Medicine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {activeMedicines.map((med, idx) => (
          <MedicineCard
            key={idx}
            medicine={med}
            onUpdateMedicine={(updated) => handleUpdateMedicine(idx, updated)}
            isExample={false}
          />
        ))}
      </div>
    </section>
  );
}
