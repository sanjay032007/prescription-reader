"use client";

import type { SymptomAnalysis } from "@/lib/gemini";
import { AlertTriangle, AlertOctagon, CheckCircle2, HelpCircle, ArrowRight } from "lucide-react";

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

  const { matchStatus, symptomsProvided, explanation, possibleReasons } = analysis;

  if (matchStatus === "mismatch") {
    return (
      <div className="mb-6 p-5 rounded-2xl bg-red-50/90 border border-red-200/90 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
            <AlertOctagon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-200/80 text-red-900">
                Mismatch Alert
              </span>
              <span className="text-[13px] font-bold text-red-950">
                Prescription does not align with reported symptoms
              </span>
            </div>

            <p className="text-[12.5px] text-red-700 mb-2">
              Your reported symptoms: <span className="font-semibold italic">&ldquo;{symptomsProvided}&rdquo;</span>
            </p>

            {explanation && (
              <p className="text-[13.5px] text-red-900/90 leading-relaxed mb-3">
                {explanation}
              </p>
            )}

            {possibleReasons && possibleReasons.length > 0 && (
              <div className="p-3 bg-white/90 rounded-xl border border-red-200/60 mb-2.5">
                <p className="text-[12px] font-bold text-red-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <HelpCircle size={13} className="text-red-500" />
                  <span>Possible Clinical Reasons</span>
                </p>
                <ul className="space-y-1 text-[13px] text-red-900/90 list-disc list-inside">
                  {possibleReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-[12px] text-red-700 font-medium">
              💡 Please confirm you uploaded the intended prescription slip and consult your pharmacist or physician before starting treatment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (matchStatus === "partial_match") {
    return (
      <div className="mb-6 p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">
                Partial Match
              </span>
              <span className="text-[13px] font-bold text-amber-950">
                Some symptoms may require separate clinical attention
              </span>
            </div>

            <p className="text-[12.5px] text-amber-800 mb-2">
              Your reported symptoms: <span className="font-semibold italic">&ldquo;{symptomsProvided}&rdquo;</span>
            </p>

            {explanation && (
              <p className="text-[13.5px] text-amber-900/90 leading-relaxed mb-2.5">
                {explanation}
              </p>
            )}

            {possibleReasons && possibleReasons.length > 0 && (
              <ul className="space-y-1 text-[13px] text-amber-900 list-disc list-inside">
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
    <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 flex items-start gap-3.5 shadow-2xs">
      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
        <CheckCircle2 size={18} />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900">
            Therapy Correlated
          </span>
          <span className="text-[13px] font-bold text-emerald-950">
            Medications match your reported symptoms
          </span>
        </div>
        <p className="text-[13px] text-emerald-900/90 leading-relaxed mt-1">
          {explanation ||
            "The prescribed medications directly correspond to the symptoms you described."}
        </p>
      </div>
    </div>
  );
}
