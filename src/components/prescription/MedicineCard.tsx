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
    <article className="bg-white rounded-[2rem] p-6 sm:p-8 border border-[#094cb2]/10 shadow-premium flex flex-col justify-between transition-all hover:border-[#094cb2]/25">
      
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif text-[20px] sm:text-[23px] font-bold text-[#1b1c1d] leading-snug">
                {displayName}
              </h3>
              {confirmed && (
                <span className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold px-2.5 py-0.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/20">
                  <Check size={11} />
                  <span>Confirmed</span>
                </span>
              )}
            </div>

            {/* Active Salt & Category */}
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {(selectedCandidate?.short_composition || selectedCandidate?.genericName || medicine.composition) && (
                <p className="text-[13px] sm:text-[13.5px] font-sans text-slate-600 font-medium flex items-center gap-1.5">
                  <Pill size={14} className="text-[#094cb2] shrink-0" />
                  <span>{selectedCandidate?.short_composition || selectedCandidate?.genericName || medicine.composition}</span>
                </p>
              )}
              {medicine.category && (
                <span className="text-[11px] font-sans font-semibold px-2.5 py-0.5 rounded-md bg-[#f5f3f4] text-[#094cb2] border border-[#094cb2]/15">
                  {medicine.category}
                </span>
              )}
            </div>
          </div>

          {/* Verification Status Badge */}
          <div className="shrink-0">
            {medicine.confidence === "HIGH" ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[12px] font-sans font-bold bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/20 shadow-2xs">
                <CheckCircle2 size={13} />
                <span>Verified</span>
              </span>
            ) : medicine.confidence === "MEDIUM" ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[12px] font-sans font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                <AlertCircle size={13} />
                <span>Please verify</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[12px] font-sans font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                <HelpCircle size={13} />
                <span>Unclear</span>
              </span>
            )}
          </div>
        </div>

        {/* Raw Text & Candidate Matching Section (Shown when verification is needed) */}
        {medicine.raw_text && (!confirmed || medicine.confidence !== "HIGH") && (
          <div className="mb-4 p-3.5 rounded-2xl bg-[#f5f3f4] border border-[#094cb2]/15 text-[12.5px] font-sans text-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900">Read from prescription: </span>
                <span className="font-mono font-bold text-[#094cb2] bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                  &quot;{medicine.raw_text}&quot;
                </span>
              </div>
            </div>

            {/* Candidate Match Options */}
            {medicine.candidate_matches && medicine.candidate_matches.length > 0 && !confirmed && (
              <div className="mt-3 pt-3 border-t border-[#094cb2]/15 space-y-2">
                <p className="text-[11.5px] font-sans font-bold text-[#094cb2] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500" />
                  <span>Indian Pharmacopeia Matches:</span>
                </p>
                {medicine.candidate_matches.map((cand, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#094cb2] hover:shadow-2xs transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-[13.5px] font-sans font-bold text-slate-950 truncate">
                        {cand.name}
                      </p>
                      <p className="text-[11.5px] font-sans text-slate-500 truncate mt-0.5">
                        {cand.genericName || cand.short_composition} &bull; <span className="font-bold text-[#2D6A4F]">{Math.round(cand.similarity * 100)}% match</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConfirm(cand)}
                      className="shrink-0 px-3.5 py-1.5 rounded-full bg-[#094cb2] hover:bg-[#002e7a] text-white text-[12px] font-sans font-semibold transition-all shadow-2xs cursor-pointer"
                    >
                      Use this
                    </button>
                  </div>
                ))}

                <div className="pt-1 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleKeep}
                    className="text-[11.5px] font-sans font-medium text-slate-500 hover:text-slate-900 underline cursor-pointer"
                  >
                    Keep original &quot;{medicine.raw_text}&quot;
                  </button>
                </div>
              </div>
            )}

            {confirmed && (
              <div className="mt-2.5 flex items-center justify-between text-[11.5px] font-sans text-slate-500">
                <span>{useOriginal ? "Using exact raw reading" : `Confirmed as ${selectedCandidate?.name}`}</span>
                <button
                  type="button"
                  onClick={handleResetConfirmation}
                  className="inline-flex items-center gap-1 font-semibold text-[#094cb2] hover:underline cursor-pointer"
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
          <div className="mb-4 p-3.5 rounded-2xl bg-[#f5f3f4] border border-[#094cb2]/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-sans font-bold text-slate-500 uppercase tracking-wider">
                Daily Dosage Schedule
              </span>
              {medicine.dosage.raw_text && (
                <span className="text-[12px] font-mono font-bold text-[#094cb2] bg-white px-2.5 py-0.5 rounded-md border border-[#094cb2]/20">
                  {medicine.dosage.raw_text}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div
                className={`py-2.5 px-1 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${
                  isMorning
                    ? "bg-[#094cb2] text-white font-sans font-bold shadow-xs"
                    : "bg-white border border-slate-200/80 text-slate-300 font-sans font-medium"
                }`}
              >
                <Sunrise size={14} className={isMorning ? "text-white" : "text-slate-300"} />
                <span className="text-[11.5px]">Morning</span>
              </div>

              <div
                className={`py-2.5 px-1 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${
                  isAfternoon
                    ? "bg-[#3366cc] text-white font-sans font-bold shadow-xs"
                    : "bg-white border border-slate-200/80 text-slate-300 font-sans font-medium"
                }`}
              >
                <Sun size={14} className={isAfternoon ? "text-white" : "text-slate-300"} />
                <span className="text-[11.5px]">Afternoon</span>
              </div>

              <div
                className={`py-2.5 px-1 rounded-xl text-center flex flex-col items-center gap-1 transition-all ${
                  isNight
                    ? "bg-[#002e7a] text-white font-sans font-bold shadow-xs"
                    : "bg-white border border-slate-200/80 text-slate-300 font-sans font-medium"
                }`}
              >
                <Moon size={14} className={isNight ? "text-white" : "text-slate-300"} />
                <span className="text-[11.5px]">Night</span>
              </div>
            </div>
          </div>
        )}

        {/* Structured Info: Meal Timing & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
          <div className="p-3 rounded-2xl bg-[#f5f3f4] border border-[#094cb2]/10 flex items-center gap-2.5">
            <Clock size={16} className="text-[#094cb2] shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block">Meal Timing</span>
              <span className="text-[13px] font-sans font-semibold text-slate-800 truncate block">
                {medicine.timing.raw_text || <span className="text-slate-400 font-normal italic">As advised by doctor</span>}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#f5f3f4] border border-[#094cb2]/10 flex items-center gap-2.5">
            <Calendar size={16} className="text-[#094cb2] shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
              <span className="text-[13px] font-sans font-semibold text-slate-800 truncate block">
                {medicine.duration.raw_text || <span className="text-slate-400 font-normal italic">As prescribed</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Description */}
        {medicine.description && (
          <p className="text-[13px] font-sans text-slate-600 leading-relaxed mb-3.5 font-light">
            {medicine.description}
          </p>
        )}

        {/* Safety Warnings */}
        {medicine.allergy_warning && (
          <div className="mb-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-[12.5px] font-sans text-amber-950 font-medium">
            <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <span>{medicine.allergy_warning}</span>
          </div>
        )}

        {medicine.completion_warning && (
          <div className="mb-2.5 p-3 rounded-2xl bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 flex items-start gap-2.5 text-[12.5px] font-sans text-[#2D6A4F] font-bold">
            <ShieldCheck size={16} className="text-[#2D6A4F] shrink-0 mt-0.5" />
            <span>{medicine.completion_warning}</span>
          </div>
        )}
      </div>

      {/* Expandable Verification Evidence Drawer */}
      <div className="pt-3.5 border-t border-slate-100 mt-2">
        <button
          type="button"
          onClick={() => setShowEvidence(!showEvidence)}
          className="inline-flex items-center gap-1.5 text-[12px] font-sans font-semibold text-[#094cb2] hover:text-[#002e7a] transition-colors cursor-pointer"
        >
          <Info size={13} className="text-[#094cb2]" />
          <span>{showEvidence ? "Hide verification audit" : "View verification audit"}</span>
          {showEvidence ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {showEvidence && (
          <div className="mt-2.5 p-3.5 rounded-2xl bg-[#f5f3f4] border border-[#094cb2]/15 text-[12px] font-sans text-slate-700 space-y-1.5">
            <p className="font-bold text-[#1b1c1d]">Verification Consensus Log:</p>
            {medicine.confidence_reasons.map((r, i) => (
              <p key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#094cb2] shrink-0 mt-1.5" />
                <span>{r}</span>
              </p>
            ))}
            {medicine.manufacturer && (
              <p className="text-slate-500 pt-2 border-t border-slate-200 text-[11px]">
                Manufacturer: <span className="font-semibold text-slate-700">{medicine.manufacturer}</span>
              </p>
            )}
          </div>
        )}
      </div>

    </article>
  );
}
