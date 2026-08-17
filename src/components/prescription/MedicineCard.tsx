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

  return (
    <article className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col transition-all hover:border-slate-300">
      
      {/* Header with Title & Confidence Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[17px] sm:text-[18px] font-bold text-slate-950 leading-snug">
              {displayName}
            </h3>
            {confirmed && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check size={11} />
                <span>Confirmed</span>
              </span>
            )}
          </div>

          {/* Composition */}
          {selectedCandidate?.short_composition || selectedCandidate?.genericName || medicine.composition ? (
            <p className="text-[13px] text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
              <Pill size={13} className="text-[#0284c7] shrink-0" />
              <span>{selectedCandidate?.short_composition || selectedCandidate?.genericName || medicine.composition}</span>
            </p>
          ) : null}
        </div>

        {/* Confidence Badge */}
        <div className="shrink-0">
          {medicine.confidence === "HIGH" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={13} />
              <span>Verified</span>
            </span>
          ) : medicine.confidence === "MEDIUM" ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <AlertCircle size={13} />
              <span>Please verify</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <HelpCircle size={13} />
              <span>Unclear</span>
            </span>
          )}
        </div>
      </div>

      {/* Raw Reading Notice (Shown when OCR differs or needs verification) */}
      {medicine.raw_text && (!confirmed || medicine.confidence !== "HIGH") && (
        <div className="mb-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[12.5px] text-slate-700">
          <span className="font-bold text-slate-900">Read as: </span>
          <span className="font-mono text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            &quot;{medicine.raw_text}&quot;
          </span>

          {/* Candidates Confirmation UI */}
          {medicine.candidate_matches && medicine.candidate_matches.length > 0 && !confirmed && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-200 space-y-1.5">
              <p className="text-[11.5px] font-semibold text-slate-500 uppercase tracking-wider">
                Possible matches in Indian Pharmacopeia:
              </p>
              {medicine.candidate_matches.map((cand, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-slate-200 hover:border-[#0284c7] transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-slate-900 truncate">
                      {cand.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {cand.genericName || cand.short_composition} &bull; {Math.round(cand.similarity * 100)}% match
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleConfirm(cand)}
                      className="px-2.5 py-1 rounded-md bg-[#0c1e3d] hover:bg-[#162a4d] text-white text-[11.5px] font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      Use this
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleKeep}
                  className="text-[11.5px] font-medium text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Keep original raw text
                </button>
              </div>
            </div>
          )}

          {confirmed && (
            <div className="mt-2 flex items-center justify-between text-[11.5px] text-slate-500">
              <span>{useOriginal ? "Using exact raw OCR" : `Confirmed as ${selectedCandidate?.name}`}</span>
              <button
                type="button"
                onClick={handleResetConfirmation}
                className="inline-flex items-center gap-1 text-[#0284c7] hover:underline cursor-pointer"
              >
                <RotateCcw size={11} />
                <span>Change</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Structured Dosage, Duration, Timing Grid (Strictly NO fake default assumptions) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3.5">
        {/* Dosage */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dosage</span>
          <span className="text-[13.5px] font-bold text-slate-900 mt-0.5">
            {medicine.dosage.raw_text || <span className="text-slate-400 font-normal italic">Not specified</span>}
          </span>
          {medicine.dosage.warning && (
            <span className="text-[10.5px] text-amber-700 font-medium mt-0.5">
              ⚠️ {medicine.dosage.warning}
            </span>
          )}
        </div>

        {/* Duration */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar size={11} className="text-slate-400" />
            Duration
          </span>
          <span className="text-[13.5px] font-bold text-slate-900 mt-0.5">
            {medicine.duration.raw_text || <span className="text-slate-400 font-normal italic">Not specified</span>}
          </span>
        </div>

        {/* Timing */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Clock size={11} className="text-slate-400" />
            Timing
          </span>
          <span className="text-[13.5px] font-bold text-slate-900 mt-0.5">
            {medicine.timing.raw_text || <span className="text-slate-400 font-normal italic">As advised</span>}
          </span>
        </div>
      </div>

      {/* Safety Alerts */}
      {medicine.allergy_warning && (
        <div className="mb-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-[12px] text-amber-900 font-medium">
          <AlertTriangle size={14} className="text-amber-700 shrink-0 mt-0.5" />
          <span>{medicine.allergy_warning}</span>
        </div>
      )}

      {medicine.completion_warning && (
        <div className="mb-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-[12px] text-emerald-900 font-medium">
          <ShieldCheck size={14} className="text-emerald-700 shrink-0 mt-0.5" />
          <span>{medicine.completion_warning}</span>
        </div>
      )}

      {/* Evidence & Model Audit Dropdown */}
      <div className="mt-auto pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowEvidence(!showEvidence)}
          className="inline-flex items-center gap-1 text-[11.5px] font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <span>{showEvidence ? "Hide model evidence" : "View verification evidence"}</span>
          {showEvidence ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {showEvidence && (
          <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11.5px] text-slate-700 space-y-1.5">
            <p className="font-bold text-slate-900 mb-1">Evidence Signals:</p>
            {medicine.confidence_reasons.map((r, i) => (
              <p key={i} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] shrink-0" />
                <span>{r}</span>
              </p>
            ))}
            {medicine.manufacturer && (
              <p className="text-slate-500 pt-1 border-t border-slate-200">
                Manufacturer: {medicine.manufacturer}
              </p>
            )}
          </div>
        )}
      </div>

    </article>
  );
}
