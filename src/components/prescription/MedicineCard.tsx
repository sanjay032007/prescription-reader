"use client";

import { useState } from "react";
import type { VerifiedMedicine, CandidateMatch } from "@/services/types";
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Check,
  RotateCcw,
  Clock,
  Calendar,
  Pill,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sunrise,
  Sun,
  Moon,
  Sparkles,
  Info,
} from "lucide-react";

interface MedicineCardProps {
  medicine: VerifiedMedicine;
  onConfirmCandidate?: (id: string, candidate: CandidateMatch) => void;
  onKeepOriginal?: (id: string) => void;
}

export default function MedicineCard({
  medicine,
  onConfirmCandidate,
  onKeepOriginal,
}: MedicineCardProps) {
  const [confirmed, setConfirmed] = useState<boolean>(medicine.user_confirmed);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatch | null>(
    medicine.selected_candidate
  );
  const [showEvidence, setShowEvidence] = useState<boolean>(false);
  const [useOriginal, setUseOriginal] = useState<boolean>(false);

  const displayName = useOriginal
    ? medicine.raw_text
    : confirmed && selectedCandidate
    ? selectedCandidate.name
    : medicine.verified_name || medicine.raw_text;

  const handleConfirm = (cand: CandidateMatch) => {
    setSelectedCandidate(cand);
    setConfirmed(true);
    setUseOriginal(false);
    if (onConfirmCandidate) onConfirmCandidate(medicine.id, cand);
  };

  const handleKeep = () => {
    setUseOriginal(true);
    setConfirmed(true);
    if (onKeepOriginal) onKeepOriginal(medicine.id);
  };

  const handleResetConfirmation = () => {
    setConfirmed(false);
    setUseOriginal(false);
  };

  // Compute Morning / Afternoon / Night dosage timeline highlights
  const dosageText = (medicine.dosage.raw_text || "").toLowerCase();
  const isMorning =
    dosageText.includes("1-1-1") ||
    dosageText.includes("1-0-1") ||
    dosageText.includes("1-0-0") ||
    dosageText.includes("1-1-0") ||
    dosageText.includes("morning") ||
    dosageText.includes("od") ||
    dosageText.includes("bd") ||
    dosageText.includes("bbf");

  const isAfternoon =
    dosageText.includes("1-1-1") ||
    dosageText.includes("0-1-0") ||
    dosageText.includes("1-1-0") ||
    dosageText.includes("0-1-1") ||
    dosageText.includes("afternoon") ||
    dosageText.includes("lunch") ||
    dosageText.includes("tds");

  const isNight =
    dosageText.includes("1-1-1") ||
    dosageText.includes("1-0-1") ||
    dosageText.includes("0-0-1") ||
    dosageText.includes("0-1-1") ||
    dosageText.includes("night") ||
    dosageText.includes("bedtime") ||
    dosageText.includes("hs") ||
    dosageText.includes("bd");

  const hasDosagePattern = Boolean(dosageText && (isMorning || isAfternoon || isNight));

  return (
    <article className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
      
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[18px] sm:text-[19px] font-extrabold text-slate-950 leading-snug">
                {displayName}
              </h3>
              {confirmed && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check size={11} />
                  <span>User Confirmed</span>
                </span>
              )}
            </div>

            {/* Active Salt & Category */}
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {(selectedCandidate?.short_composition || selectedCandidate?.genericName || medicine.composition) && (
                <p className="text-[13px] text-slate-600 font-semibold flex items-center gap-1.5">
                  <Pill size={13} className="text-[#0284c7] shrink-0" />
                  <span>{selectedCandidate?.short_composition || selectedCandidate?.genericName || medicine.composition}</span>
                </p>
              )}
              {medicine.category && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {medicine.category}
                </span>
              )}
            </div>
          </div>

          {/* Verification Badge */}
          <div className="shrink-0">
            {medicine.confidence === "HIGH" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <CheckCircle2 size={13} />
                <span>Verified</span>
              </span>
            ) : medicine.confidence === "MEDIUM" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                <AlertCircle size={13} />
                <span>Please verify</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                <HelpCircle size={13} />
                <span>Unclear</span>
              </span>
            )}
          </div>
        </div>

        {/* Raw Text & Candidate Matching Section (Shown when verification is needed) */}
        {medicine.raw_text && (!confirmed || medicine.confidence !== "HIGH") && (
          <div className="mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-[12.5px] text-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">Read from prescription: </span>
                <span className="font-mono font-semibold text-[#0c1e3d] bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                  &quot;{medicine.raw_text}&quot;
                </span>
              </div>
            </div>

            {/* Candidate Match Options */}
            {medicine.candidate_matches && medicine.candidate_matches.length > 0 && !confirmed && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                <p className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-[#0284c7]" />
                  <span>Suggested Indian Pharmacopeia Matches:</span>
                </p>
                {medicine.candidate_matches.map((cand, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#0284c7] hover:shadow-2xs transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-[13.5px] font-bold text-slate-950 truncate">
                        {cand.name}
                      </p>
                      <p className="text-[11.5px] text-slate-500 truncate mt-0.5">
                        {cand.genericName || cand.short_composition} &bull; <span className="font-semibold text-emerald-600">{Math.round(cand.similarity * 100)}% match</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConfirm(cand)}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-[#0c1e3d] hover:bg-[#162a4d] text-white text-[12px] font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      Use this
                    </button>
                  </div>
                ))}

                <div className="pt-1 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleKeep}
                    className="text-[11.5px] font-semibold text-slate-500 hover:text-slate-900 underline cursor-pointer"
                  >
                    Keep original &quot;{medicine.raw_text}&quot;
                  </button>
                </div>
              </div>
            )}

            {confirmed && (
              <div className="mt-2.5 flex items-center justify-between text-[11.5px] text-slate-500">
                <span>{useOriginal ? "Using exact raw reading" : `Confirmed as ${selectedCandidate?.name}`}</span>
                <button
                  type="button"
                  onClick={handleResetConfirmation}
                  className="inline-flex items-center gap-1 font-bold text-[#0284c7] hover:underline cursor-pointer"
                >
                  <RotateCcw size={11} />
                  <span>Change selection</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3-Part Daily Schedule Visual (Morning, Afternoon, Night) */}
        {hasDosagePattern && (
          <div className="mb-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Daily Schedule Timeline
              </span>
              {medicine.dosage.raw_text && (
                <span className="text-[12px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {medicine.dosage.raw_text}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div
                className={`py-2 px-1 rounded-lg text-center flex flex-col items-center gap-1 transition-all ${
                  isMorning
                    ? "bg-sky-100/70 border border-sky-200 text-[#0284c7] font-bold"
                    : "bg-white border border-slate-100 text-slate-300 font-medium"
                }`}
              >
                <Sunrise size={14} className={isMorning ? "text-[#0284c7]" : "text-slate-300"} />
                <span className="text-[11.5px]">Morning</span>
              </div>

              <div
                className={`py-2 px-1 rounded-lg text-center flex flex-col items-center gap-1 transition-all ${
                  isAfternoon
                    ? "bg-amber-100/70 border border-amber-200 text-amber-700 font-bold"
                    : "bg-white border border-slate-100 text-slate-300 font-medium"
                }`}
              >
                <Sun size={14} className={isAfternoon ? "text-amber-600" : "text-slate-300"} />
                <span className="text-[11.5px]">Afternoon</span>
              </div>

              <div
                className={`py-2 px-1 rounded-lg text-center flex flex-col items-center gap-1 transition-all ${
                  isNight
                    ? "bg-indigo-100/70 border border-indigo-200 text-indigo-700 font-bold"
                    : "bg-white border border-slate-100 text-slate-300 font-medium"
                }`}
              >
                <Moon size={14} className={isNight ? "text-indigo-600" : "text-slate-300"} />
                <span className="text-[11.5px]">Night</span>
              </div>
            </div>
          </div>
        )}

        {/* Structured Field Badges: Duration, Meal Timing, Strength */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3.5">
          {/* Timing */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
            <Clock size={15} className="text-[#0284c7] shrink-0" />
            <div className="min-w-0">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Timing</span>
              <span className="text-[13px] font-bold text-slate-800 truncate block">
                {medicine.timing.raw_text || <span className="text-slate-400 font-normal italic">As advised by doctor</span>}
              </span>
            </div>
          </div>

          {/* Duration */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
            <Calendar size={15} className="text-[#0284c7] shrink-0" />
            <div className="min-w-0">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
              <span className="text-[13px] font-bold text-slate-800 truncate block">
                {medicine.duration.raw_text || <span className="text-slate-400 font-normal italic">As prescribed</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Note / Description */}
        {medicine.description && (
          <p className="text-[13px] text-slate-600 leading-relaxed mb-3">
            {medicine.description}
          </p>
        )}

        {/* Safety Warnings */}
        {medicine.allergy_warning && (
          <div className="mb-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-[12.5px] text-amber-950 font-medium">
            <AlertTriangle size={15} className="text-amber-700 shrink-0 mt-0.5" />
            <span>{medicine.allergy_warning}</span>
          </div>
        )}

        {medicine.completion_warning && (
          <div className="mb-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-[12.5px] text-emerald-950 font-medium">
            <ShieldCheck size={15} className="text-emerald-700 shrink-0 mt-0.5" />
            <span>{medicine.completion_warning}</span>
          </div>
        )}
      </div>

      {/* Evidence & Verification Signals (Collapsible) */}
      <div className="pt-3 border-t border-slate-100 mt-2">
        <button
          type="button"
          onClick={() => setShowEvidence(!showEvidence)}
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Info size={13} className="text-[#0284c7]" />
          <span>{showEvidence ? "Hide verification evidence" : "View verification evidence"}</span>
          {showEvidence ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {showEvidence && (
          <div className="mt-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[12px] text-slate-700 space-y-2 animate-in fade-in duration-150">
            <p className="font-bold text-slate-900">Evidence &amp; Consensus Log:</p>
            {medicine.confidence_reasons.map((r, i) => (
              <p key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] shrink-0 mt-1.5" />
                <span>{r}</span>
              </p>
            ))}
            {medicine.manufacturer && (
              <p className="text-slate-500 pt-1.5 border-t border-slate-200 text-[11.5px]">
                Manufacturer: <span className="font-semibold text-slate-700">{medicine.manufacturer}</span>
              </p>
            )}
          </div>
        )}
      </div>

    </article>
  );
}
