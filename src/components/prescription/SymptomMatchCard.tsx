"use client";

import type { SymptomAnalysis } from "@/lib/gemini";
import { AlertTriangle, AlertOctagon, CheckCircle2, Info, HelpCircle } from "lucide-react";

interface SymptomMatchCardProps {
  analysis?: SymptomAnalysis;
}

export default function SymptomMatchCard({ analysis }: SymptomMatchCardProps) {
  if (!analysis || !analysis.symptomsProvided || analysis.matchStatus === "none_provided") {
    return null;
  }

  const { matchStatus, symptomsProvided, explanation, possibleReasons } = analysis;

  if (matchStatus === "mismatch") {
    return (
      <div className="mb-6 p-5 sm:p-6 bg-red-50/90 border-2 border-red-200/90 rounded-2xl shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
            <AlertOctagon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-red-200/70 text-red-800">
                MISMATCH DETECTED
              </span>
              <span className="text-[12.5px] text-red-700 font-medium">
                Prescription does not match reported symptoms
              </span>
            </div>

            <h3 className="text-[17px] sm:text-[19px] font-bold text-red-950 mb-2">
              Why do these medications not match your symptoms?
            </h3>

            {/* Reported Symptoms Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/80 border border-red-200 text-[12.5px] font-medium text-red-900 mb-3">
              <span className="text-red-500 font-semibold">Your Symptoms:</span>
              <span className="italic">“{symptomsProvided}”</span>
            </div>

            {/* Explanation */}
            {explanation && (
              <p className="text-[14px] text-red-900/90 leading-relaxed mb-3.5">
                {explanation}
              </p>
            )}

            {/* Possible Reasons List */}
            {possibleReasons && possibleReasons.length > 0 && (
              <div className="mt-3 p-3.5 bg-white/90 rounded-xl border border-red-200/70">
                <p className="text-[12px] font-bold uppercase tracking-wider text-red-900 mb-2 flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-red-500" />
                  <span>Possible Clinical Reasons:</span>
                </p>
                <ul className="space-y-1.5 text-[13px] text-red-900/90 list-disc list-inside">
                  {possibleReasons.map((reason, idx) => (
                    <li key={idx} className="leading-snug">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-3.5 text-[12px] text-red-700/90 font-medium">
              💡 <strong>Next Step:</strong> Check if you uploaded the intended prescription slip, or consult your prescribing doctor or pharmacist before taking these medicines.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (matchStatus === "partial_match") {
    return (
      <div className="mb-6 p-5 sm:p-6 bg-amber-50/90 border-2 border-amber-200/90 rounded-2xl shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-200/70 text-amber-900">
                PARTIAL SYMPTOM MATCH
              </span>
              <span className="text-[12.5px] text-amber-800 font-medium">
                Some symptoms may not be fully covered
              </span>
            </div>

            <h3 className="text-[17px] sm:text-[19px] font-bold text-amber-950 mb-2">
              Symptom &amp; Prescription Correlation
            </h3>

            {/* Reported Symptoms Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/80 border border-amber-200 text-[12.5px] font-medium text-amber-900 mb-3">
              <span className="text-amber-600 font-semibold">Your Symptoms:</span>
              <span className="italic">“{symptomsProvided}”</span>
            </div>

            {explanation && (
              <p className="text-[14px] text-amber-900/90 leading-relaxed mb-3">
                {explanation}
              </p>
            )}

            {possibleReasons && possibleReasons.length > 0 && (
              <div className="mt-2.5 p-3 bg-white/80 rounded-xl border border-amber-200/70">
                <ul className="space-y-1 text-[13px] text-amber-900 list-disc list-inside">
                  {possibleReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // matchStatus === "matched"
  return (
    <div className="mb-6 p-4 sm:p-5 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex items-start gap-3.5 shadow-2xs">
      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
        <CheckCircle2 size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900">
            TREATMENT MATCHES
          </span>
          <span className="text-[12.5px] font-semibold text-emerald-900">
            Prescription aligns with reported symptoms
          </span>
        </div>
        <p className="text-[13.5px] text-emerald-900/90 leading-relaxed">
          {explanation || "The prescribed medications correspond directly to the symptoms you described."}
        </p>
      </div>
    </div>
  );
}
