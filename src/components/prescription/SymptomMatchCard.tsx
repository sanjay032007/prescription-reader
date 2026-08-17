"use client";

import type { SymptomAnalysis } from "@/lib/gemini";
import { AlertTriangle, AlertOctagon, CheckCircle2, HelpCircle } from "lucide-react";

interface SymptomMatchCardProps {
  analysis?: SymptomAnalysis;
}

export default function SymptomMatchCard({ analysis }: SymptomMatchCardProps) {
  if (
    !analysis ||
    !analysis.symptomsProvided ||
    analysis.matchStatus === "none_provided"
  ) {
    return null;
  }

  const { matchStatus, symptomsProvided, explanation, possibleReasons } =
    analysis;

  if (matchStatus === "mismatch") {
    return (
      <div className="mb-5 p-4 sm:p-5 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertOctagon size={18} className="text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-red-900 mb-1">
              Prescription does not match your symptoms
            </p>
            <p className="text-[12px] text-red-700 mb-2">
              You reported: &ldquo;{symptomsProvided}&rdquo;
            </p>
            {explanation && (
              <p className="text-[13px] text-red-800 leading-relaxed mb-3">
                {explanation}
              </p>
            )}
            {possibleReasons && possibleReasons.length > 0 && (
              <div className="p-3 bg-white/80 rounded-lg border border-red-200/60">
                <p className="text-[12px] font-semibold text-red-800 mb-1.5 flex items-center gap-1.5">
                  <HelpCircle size={13} />
                  <span>Possible reasons</span>
                </p>
                <ul className="space-y-1 text-[13px] text-red-800/90 list-disc list-inside">
                  {possibleReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-3 text-[12px] text-red-700">
              Consult your prescribing doctor or pharmacist before taking these
              medicines.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (matchStatus === "partial_match") {
    return (
      <div className="mb-5 p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-amber-900 mb-1">
              Partial symptom match
            </p>
            <p className="text-[12px] text-amber-700 mb-2">
              You reported: &ldquo;{symptomsProvided}&rdquo;
            </p>
            {explanation && (
              <p className="text-[13px] text-amber-800 leading-relaxed mb-2">
                {explanation}
              </p>
            )}
            {possibleReasons && possibleReasons.length > 0 && (
              <ul className="space-y-1 text-[13px] text-amber-800 list-disc list-inside">
                {possibleReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  // matched
  return (
    <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
      <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
      <div>
        <p className="text-[14px] font-semibold text-emerald-900 mb-0.5">
          Prescription matches your symptoms
        </p>
        <p className="text-[13px] text-emerald-800 leading-relaxed">
          {explanation ||
            "The prescribed medications correspond to the symptoms you described."}
        </p>
      </div>
    </div>
  );
}
