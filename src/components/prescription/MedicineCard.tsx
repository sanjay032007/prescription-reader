"use client";

import { useEffect, useState } from "react";
import type { VerifiedMedicine, CandidateMatch } from "@/services/types";
import {
  Clock,
  AlertTriangle,
  ShieldCheck,
  Sun,
  Moon,
  Sunrise,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  Pill,
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
  const [fdaInfo, setFdaInfo] = useState<any>(null);
  const [showFda, setShowFda] = useState(false);
  const [showCandidates, setShowCandidates] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayName = medicine.verified_name || medicine.raw_text;
  const isCorrected = Boolean(medicine.verified_name && medicine.verified_name !== medicine.raw_text);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_FDA_API_KEY || "";
    const cleanTerm = (str?: string | null) =>
      (str || "")
        .replace(/(Tab\.|Cap\.|Syp\.|Tablet|Capsule|Syrup|\d+\s*mg|\d+\s*ml|\d+)/gi, "")
        .replace(/\(unclear\)/gi, "")
        .trim();

    const brand = cleanTerm(displayName);
    const generic = cleanTerm(medicine.composition || medicine.selected_candidate?.genericName);
    const term = brand || generic;
    if (!term) return;

    const query =
      brand && generic && brand !== generic
        ? `(openfda.brand_name:"${encodeURIComponent(brand)}"+openfda.generic_name:"${encodeURIComponent(generic)}")`
        : `openfda.brand_name:"${encodeURIComponent(term)}"+openfda.generic_name:"${encodeURIComponent(term)}"`;

    const url = `https://api.fda.gov/drug/label.json?search=${query}&api_key=${apiKey}&limit=1`;
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.results?.length > 0) setFdaInfo(data.results[0]);
      })
      .catch(() => setFdaInfo(null));
  }, [displayName, medicine.composition, medicine.selected_candidate]);

  const freq = (medicine.dosage?.raw_text || "").toLowerCase();
  const tim = (medicine.timing?.raw_text || "").toLowerCase();

  const isMorning =
    freq.includes("1-1-1") ||
    freq.includes("1-0-1") ||
    freq.includes("1-0-0") ||
    freq.includes("twice") ||
    freq.includes("3 times") ||
    freq.includes("morning") ||
    tim.includes("morning") ||
    tim.includes("breakfast");

  const isAfternoon =
    freq.includes("1-1-1") ||
    freq.includes("0-1-0") ||
    freq.includes("3 times") ||
    tim.includes("afternoon") ||
    tim.includes("lunch");

  const isNight =
    freq.includes("1-1-1") ||
    freq.includes("1-0-1") ||
    freq.includes("0-0-1") ||
    freq.includes("twice") ||
    freq.includes("3 times") ||
    freq.includes("night") ||
    tim.includes("night") ||
    tim.includes("bed") ||
    tim.includes("dinner");

  const handleCopyMed = () => {
    const text = `${displayName} (${medicine.composition || "Generic"})\nSchedule: ${medicine.dosage?.raw_text || "As prescribed"} | Timing: ${medicine.timing?.raw_text || "N/A"}\nDuration: ${medicine.duration?.raw_text || "N/A"}\nWhy: ${medicine.why_prescribed || medicine.description || "Prescribed medication"}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <article className="glass-card rounded-3xl p-6 sm:p-7 border border-slate-200/90 flex flex-col justify-between hover:shadow-xl transition-all duration-300 relative group overflow-hidden bg-white/90">
      
      {/* Top Accent Pill Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#094cb2]/10 text-[#094cb2] text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 size={11} className="text-[#094cb2]" />
              Verified Active
            </span>

            {medicine.category && (
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10.5px] font-semibold">
                {medicine.category}
              </span>
            )}

            {medicine.confidence_score && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#2D6A4F] text-[10px] font-bold ml-auto sm:ml-0">
                {Math.round(medicine.confidence_score * 100)}% Confidence
              </span>
            )}
          </div>

          <h3 className="font-serif text-[20px] sm:text-[22px] font-bold text-[#1b1c1d] leading-snug break-words mt-1">
            {displayName}
          </h3>

          {medicine.composition && (
            <p className="text-[13px] font-medium text-slate-500 mt-0.5 flex items-center gap-1">
              <Pill size={12} className="text-slate-400 shrink-0" />
              <span>{medicine.composition}</span>
            </p>
          )}

          {isCorrected && (
            <p className="text-[11.5px] text-amber-700 mt-1 font-medium bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 inline-block">
              Deciphered from handwritten: <span className="font-bold">&ldquo;{medicine.raw_text}&rdquo;</span>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopyMed}
          className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
          title="Copy medicine schedule"
        >
          {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
        </button>
      </div>

      {/* 3-Part Dosage Timeline */}
      <div className="mb-4 p-3.5 bg-[#f5f3f4]/80 rounded-2xl border border-slate-200/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Daily Dosage Protocol
          </span>
          {medicine.dosage?.raw_text && (
            <span className="text-[12px] font-mono font-bold text-[#094cb2] bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
              {medicine.dosage.raw_text}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div
            className={`py-2 px-1 rounded-xl text-[12px] font-bold flex flex-col items-center gap-1 transition-all ${
              isMorning
                ? "bg-[#094cb2] text-white shadow-xs"
                : "bg-white text-slate-300 border border-slate-100"
            }`}
          >
            <Sunrise size={15} />
            <span>Morning</span>
          </div>

          <div
            className={`py-2 px-1 rounded-xl text-[12px] font-bold flex flex-col items-center gap-1 transition-all ${
              isAfternoon
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-white text-slate-300 border border-slate-100"
            }`}
          >
            <Sun size={15} />
            <span>Afternoon</span>
          </div>

          <div
            className={`py-2 px-1 rounded-xl text-[12px] font-bold flex flex-col items-center gap-1 transition-all ${
              isNight
                ? "bg-indigo-900 text-white shadow-xs"
                : "bg-white text-slate-300 border border-slate-100"
            }`}
          >
            <Moon size={15} />
            <span>Night</span>
          </div>
        </div>
      </div>

      {/* Timing & Duration Badges */}
      <div className="flex flex-wrap gap-2 mb-3.5">
        {medicine.timing?.raw_text && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[12px] font-medium text-slate-700 shadow-2xs">
            <Clock size={13} className="text-[#094cb2]" />
            <span>{medicine.timing.raw_text}</span>
          </div>
        )}
        {medicine.duration?.raw_text && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[12px] font-medium text-slate-700 shadow-2xs">
            <Calendar size={13} className="text-[#2D6A4F]" />
            <span>{medicine.duration.raw_text}</span>
          </div>
        )}
      </div>

      {/* Why Prescribed Box */}
      {medicine.why_prescribed && (
        <div className="mb-3.5 p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100">
          <p className="text-[10.5px] font-bold text-[#094cb2] uppercase tracking-wider mb-1 flex items-center gap-1">
            <Info size={12} />
            <span>Clinical Indication</span>
          </p>
          <p className="text-[13px] text-slate-800 leading-relaxed font-sans">
            {medicine.why_prescribed}
          </p>
        </div>
      )}

      {/* Description */}
      {medicine.description && !medicine.why_prescribed && (
        <p className="text-[13px] text-slate-600 leading-relaxed mb-3.5 font-sans">
          {medicine.description}
        </p>
      )}

      {/* Side Effects Chips */}
      {medicine.side_effects && medicine.side_effects.length > 0 && (
        <div className="pt-3 border-t border-slate-100 mb-3">
          <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Possible Mild Effects
          </p>
          <div className="flex flex-wrap gap-1.5">
            {medicine.side_effects.map((effect, idx) => (
              <span
                key={idx}
                className="bg-rose-50 text-rose-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border border-rose-100"
              >
                {effect}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Warnings */}
      {medicine.allergy_warning && (
        <div className="mt-2 p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex gap-2.5 items-start">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="text-[12px] text-amber-900 font-semibold leading-snug">
            {medicine.allergy_warning}
          </span>
        </div>
      )}

      {medicine.completion_warning && (
        <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex gap-2.5 items-start">
          <ShieldCheck className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
          <span className="text-[12px] text-emerald-900 font-semibold leading-snug">
            {medicine.completion_warning}
          </span>
        </div>
      )}

      {/* Candidates Expander */}
      {medicine.candidate_matches && medicine.candidate_matches.length > 1 && !medicine.user_confirmed && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowCandidates(!showCandidates)}
            className="text-[12px] font-bold text-[#094cb2] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Alternate matches from Pharmacopeia ({medicine.candidate_matches.length})</span>
            {showCandidates ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showCandidates && (
            <div className="mt-2 space-y-1.5 bg-[#f5f3f4] p-3 rounded-2xl">
              {medicine.candidate_matches.map((cand, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-white text-xs border border-slate-200/60"
                >
                  <div>
                    <p className="font-bold text-slate-800">{cand.name}</p>
                    <p className="text-[11px] text-slate-500">{cand.short_composition || cand.genericName}</p>
                  </div>
                  {onConfirmCandidate && (
                    <button
                      type="button"
                      onClick={() => onConfirmCandidate(medicine.id, cand)}
                      className="px-2.5 py-1 rounded-md bg-[#094cb2] text-white font-bold text-[11px] hover:bg-[#002e7a] cursor-pointer"
                    >
                      Select
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OpenFDA Expander */}
      {fdaInfo && (
        <div className="mt-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            className="text-[11.5px] font-semibold text-slate-500 hover:text-[#094cb2] cursor-pointer inline-flex items-center gap-1"
            onClick={() => setShowFda(!showFda)}
          >
            <span>{showFda ? "Hide Official Label Monograph" : "View Official Label Monograph"}</span>
            {showFda ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {showFda && (
            <div className="mt-2 p-3 bg-slate-50 rounded-2xl text-[11.5px] text-slate-600 space-y-1.5 border border-slate-200/60">
              {fdaInfo.warnings && fdaInfo.warnings.length > 0 && (
                <div>
                  <strong className="text-slate-900 font-semibold">Warnings:</strong>{" "}
                  {fdaInfo.warnings[0]}
                </div>
              )}
              {fdaInfo.contraindications && fdaInfo.contraindications.length > 0 && (
                <div>
                  <strong className="text-slate-900 font-semibold">Contraindications:</strong>{" "}
                  {fdaInfo.contraindications[0]}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </article>
  );
}
