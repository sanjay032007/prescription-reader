"use client";

import { useState } from "react";
import type { Medicine } from "@/lib/gemini";
import {
  Clock,
  AlertTriangle,
  ShieldCheck,
  Sun,
  Moon,
  Sunrise,
  Calendar,
  Pill,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Check,
  Building2,
} from "lucide-react";

interface MedicineCardProps {
  medicine: Medicine;
  onUpdateMedicine?: (updated: Medicine) => void;
  isExample?: boolean;
}

export default function MedicineCard({
  medicine: initialMed,
  onUpdateMedicine,
}: MedicineCardProps) {
  const [currentMed, setCurrentMed] = useState<Medicine>(initialMed);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  const handleApplySuggestion = () => {
    if (!currentMed.suggestedCorrection) return;
    const updated: Medicine = {
      ...currentMed,
      brandName: currentMed.suggestedCorrection.brandName,
      genericName: currentMed.suggestedCorrection.genericName || currentMed.genericName,
      confidence: "high",
      confidenceReason: "Confirmed by user from Indian Pharmacopeia database.",
      suggestedCorrection: undefined,
    };
    setCurrentMed(updated);
    setHasConfirmed(true);
    onUpdateMedicine?.(updated);
  };

  const handleKeepOriginal = () => {
    const updated: Medicine = {
      ...currentMed,
      suggestedCorrection: undefined,
    };
    setCurrentMed(updated);
    setHasConfirmed(true);
    onUpdateMedicine?.(updated);
  };

  const freq = (currentMed.frequency || "").toLowerCase();
  const tim = (currentMed.timing || "").toLowerCase();

  const hasValidDosage =
    currentMed.dosageUnderstood &&
    (Boolean(freq && !freq.includes("unclear")) ||
      Boolean(tim && !tim.includes("unclear")));

  const isMorning =
    hasValidDosage &&
    (freq.includes("1-1-1") ||
      freq.includes("1-0-1") ||
      freq.includes("1-0-0") ||
      freq.includes("1-1-0") ||
      freq.includes("twice") ||
      freq.includes("3 times") ||
      freq.includes("morning") ||
      tim.includes("morning") ||
      tim.includes("breakfast"));

  const isAfternoon =
    hasValidDosage &&
    (freq.includes("1-1-1") ||
      freq.includes("0-1-0") ||
      freq.includes("1-1-0") ||
      freq.includes("3 times") ||
      tim.includes("afternoon") ||
      tim.includes("lunch"));

  const isNight =
    hasValidDosage &&
    (freq.includes("1-1-1") ||
      freq.includes("1-0-1") ||
      freq.includes("0-0-1") ||
      freq.includes("0-1-1") ||
      freq.includes("twice") ||
      freq.includes("3 times") ||
      freq.includes("night") ||
      freq.includes("hs") ||
      tim.includes("night") ||
      tim.includes("bed") ||
      tim.includes("dinner"));

  return (
    <article className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
      <div>
        {/* Top Header: Brand Name + Confidence Indicator */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] sm:text-[18px] font-extrabold text-slate-950 leading-snug break-words">
              {currentMed.brandName}
            </h3>
            {currentMed.genericName && (
              <p className="text-[13px] font-medium text-[#0284c7] mt-0.5 flex items-center gap-1.5">
                <Pill size={13} className="shrink-0" />
                <span>Composition: {currentMed.genericName}</span>
              </p>
            )}
          </div>

          {/* Layer 4: Confidence Badge Indicator */}
          <div className="shrink-0 flex flex-col items-end gap-1">
            {currentMed.confidence === "high" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Verified</span>
              </span>
            )}

            {currentMed.confidence === "medium" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Please verify</span>
              </span>
            )}

            {currentMed.confidence === "low" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-800 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span>Unclear — check Rx</span>
              </span>
            )}

            {currentMed.category && (
              <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
                {currentMed.category}
              </span>
            )}
          </div>
        </div>

        {/* Manufacturer Tag if available */}
        {currentMed.manufacturer && (
          <div className="flex items-center gap-1.5 text-[11.5px] text-slate-500 font-medium mb-3">
            <Building2 size={12} className="text-slate-400" />
            <span>Mfr: {currentMed.manufacturer}</span>
          </div>
        )}

        {/* Layer 4: Medium Confidence Interactive Suggestion Box */}
        {currentMed.confidence === "medium" && currentMed.suggestedCorrection && !hasConfirmed && (
          <div className="my-3 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-[12.5px]">
            <p className="text-amber-900 font-semibold mb-1">
              Did you mean: <span className="font-bold underline text-amber-950">{currentMed.suggestedCorrection.brandName}</span>?
            </p>
            <p className="text-amber-800 text-[11.5px] mb-2.5">
              Indian database match similarity: {currentMed.suggestedCorrection.similarity}%
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplySuggestion}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11.5px] transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <Check size={12} />
                <span>Yes, use {currentMed.suggestedCorrection.brandName}</span>
              </button>
              <button
                type="button"
                onClick={handleKeepOriginal}
                className="px-2.5 py-1.5 rounded-lg border border-amber-300 hover:bg-amber-100 text-amber-900 text-[11.5px] font-medium transition-colors cursor-pointer"
              >
                Keep original
              </button>
            </div>
          </div>
        )}

        {/* Layer 4: Low Confidence Verification Callout Box */}
        {currentMed.confidence === "low" && (
          <div className="my-3 p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-[12.5px]">
            <div className="flex items-start gap-2 mb-1.5">
              <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-950 font-bold">Unclear Handwriting Detected</p>
                {currentMed.rawDetectedText && (
                  <p className="text-red-800 text-[12px]">
                    Read from paper as: <span className="font-mono italic bg-white px-1.5 py-0.5 rounded border border-red-200">&ldquo;{currentMed.rawDetectedText}&rdquo;</span>
                  </p>
                )}
                {currentMed.suggestedCorrection && (
                  <p className="text-red-800 text-[12px] mt-1">
                    Closest Indian medicine match: <strong className="text-red-950">{currentMed.suggestedCorrection.brandName}</strong>
                  </p>
                )}
              </div>
            </div>

            {currentMed.suggestedCorrection && !hasConfirmed && (
              <button
                type="button"
                onClick={handleApplySuggestion}
                className="mt-2 w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[12px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Confirm as {currentMed.suggestedCorrection.brandName} →</span>
              </button>
            )}
          </div>
        )}

        {/* Dosage Warning if flagged by Rule Engine */}
        {currentMed.dosageWarning && (
          <div className="my-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11.5px] text-amber-900 flex items-start gap-1.5">
            <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
            <span>{currentMed.dosageWarning}</span>
          </div>
        )}

        {/* Daily Dosage Schedule Timeline (Layer 3 Validated) */}
        {hasValidDosage ? (
          <div className="my-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center justify-between mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Daily Dosage Schedule</span>
              {currentMed.frequency && (
                <span className="font-mono text-slate-800 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                  {currentMed.frequency}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Morning */}
              <div
                className={`py-2 px-1 rounded-lg text-[11.5px] font-semibold flex flex-col items-center gap-0.5 transition-colors ${
                  isMorning
                    ? "bg-sky-50 text-[#0284c7] border border-sky-200/80"
                    : "bg-white text-slate-400 border border-slate-200/40 opacity-60"
                }`}
              >
                <Sunrise size={14} />
                <span>Morning</span>
                <span className="text-[11px] font-mono">{isMorning ? "1 Dose" : "—"}</span>
              </div>

              {/* Afternoon */}
              <div
                className={`py-2 px-1 rounded-lg text-[11.5px] font-semibold flex flex-col items-center gap-0.5 transition-colors ${
                  isAfternoon
                    ? "bg-amber-50 text-amber-800 border border-amber-200/80"
                    : "bg-white text-slate-400 border border-slate-200/40 opacity-60"
                }`}
              >
                <Sun size={14} />
                <span>Afternoon</span>
                <span className="text-[11px] font-mono">{isAfternoon ? "1 Dose" : "—"}</span>
              </div>

              {/* Night */}
              <div
                className={`py-2 px-1 rounded-lg text-[11.5px] font-semibold flex flex-col items-center gap-0.5 transition-colors ${
                  isNight
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80"
                    : "bg-white text-slate-400 border border-slate-200/40 opacity-60"
                }`}
              >
                <Moon size={14} />
                <span>Night</span>
                <span className="text-[11px] font-mono">{isNight ? "1 Dose" : "—"}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="my-3 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[12.5px] text-slate-500 font-medium flex items-center justify-between">
            <span>Dosage &amp; Schedule</span>
            <span className="text-slate-700 font-semibold">Take as advised by doctor</span>
          </div>
        )}

        {/* Timing & Duration Tags */}
        {(currentMed.timing || currentMed.duration) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {currentMed.timing && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 text-[12px] font-medium text-slate-700">
                <Clock size={13} className="text-[#0284c7]" />
                <span>{currentMed.timing}</span>
              </div>
            )}
            {currentMed.duration && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 text-[12px] font-medium text-slate-700">
                <Calendar size={13} className="text-indigo-600" />
                <span>{currentMed.duration}</span>
              </div>
            )}
          </div>
        )}

        {/* Clinical Description */}
        {currentMed.description && (
          <p className="text-[13.5px] text-slate-600 leading-relaxed mb-3">
            {currentMed.description}
          </p>
        )}

        {/* Why Prescribed Box */}
        {currentMed.whyPrescribed && (
          <div className="mb-3.5 p-3 rounded-xl bg-sky-50/70 border-l-2 border-[#0284c7]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0369a1] block mb-0.5">
              Why Prescribed
            </span>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              {currentMed.whyPrescribed}
            </p>
          </div>
        )}

        {/* Side Effects */}
        {currentMed.sideEffects && currentMed.sideEffects.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Possible Side Effects
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentMed.sideEffects.map((effect, idx) => (
                <span
                  key={idx}
                  className="bg-rose-50 text-rose-700 border border-rose-100 text-[11px] font-medium px-2 py-0.5 rounded-md"
                >
                  {effect}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Penicillin Allergy Alert */}
        {currentMed.allergyWarning && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2.5 items-start">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-[12px] text-amber-900 font-semibold leading-snug">
              {currentMed.allergyWarning}
            </span>
          </div>
        )}

        {/* Antibiotic Course Notice */}
        {currentMed.completionWarning && (
          <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-2.5 items-start">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-[12px] text-emerald-900 font-medium leading-snug">
              {currentMed.completionWarning}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
