"use client";

import { useEffect, useState } from "react";
import type { Medicine } from "@/lib/gemini";
import { Clock, AlertTriangle, ShieldCheck, Sun, Moon, Sunrise, Calendar, ChevronDown, ChevronUp, Pill } from "lucide-react";

interface MedicineCardProps {
  medicine: Medicine;
  isExample?: boolean;
}

export default function MedicineCard({
  medicine,
  isExample = false,
}: MedicineCardProps) {
  const [fdaInfo, setFdaInfo] = useState<any>(null);
  const [showFdaInfo, setShowFdaInfo] = useState(false);

  useEffect(() => {
    if (isExample) return;
    const apiKey = process.env.NEXT_PUBLIC_FDA_API_KEY || "";

    const cleanTerm = (str?: string) =>
      (str || "")
        .replace(/(Tab\.|Cap\.|Syp\.|Tablet|Capsule|Syrup|\d+\s*mg|\d+\s*ml|\d+)/gi, "")
        .replace(/\(unclear\)/gi, "")
        .trim();

    const brand = cleanTerm(medicine.brandName);
    const generic = cleanTerm(medicine.genericName);
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
        if (data?.results?.length > 0) {
          setFdaInfo(data.results[0]);
        }
      })
      .catch(() => setFdaInfo(null));
  }, [medicine.brandName, medicine.genericName, isExample]);

  const isAntibiotic = medicine.isAntibiotic;

  // Determine Daily Timing Schedule (Morning, Afternoon, Night)
  const freq = (medicine.frequency || "").toLowerCase();
  const tim = (medicine.timing || "").toLowerCase();

  const isMorning =
    freq.includes("1-1-1") ||
    freq.includes("1-0-1") ||
    freq.includes("1-0-0") ||
    freq.includes("twice") ||
    freq.includes("3 times") ||
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
    tim.includes("night") ||
    tim.includes("bed") ||
    tim.includes("dinner");

  return (
    <article className="bg-white rounded-2xl sm:rounded-[24px] p-5 sm:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
      {/* Top Brand Accent Bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-[3.5px] ${
          isAntibiotic
            ? "bg-gradient-to-r from-amber-500 to-orange-500"
            : "bg-gradient-to-r from-[#0284c7] via-[#4a90d9] to-[#6366f1]"
        }`}
      />

      <div className="pt-1">
        {/* Header: Brand Name + Category Tag */}
        <div className="flex items-start justify-between gap-2.5 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-[18px] sm:text-[20px] font-extrabold text-[#0a1628] tracking-tight leading-snug break-words">
              {medicine.brandName}
            </h3>
            {medicine.genericName && (
              <p className="text-[13px] text-[#0284c7] font-semibold mt-0.5">
                Generic: {medicine.genericName}
              </p>
            )}
          </div>

          {medicine.category && (
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 tracking-wide uppercase ${
                isAntibiotic
                  ? "bg-orange-50 border border-orange-200 text-orange-700"
                  : "bg-sky-50 border border-sky-200 text-[#0284c7]"
              }`}
            >
              {medicine.category}
            </span>
          )}
        </div>

        {/* Daily Dosage Schedule Timeline Grid */}
        <div className="my-3.5 p-3 sm:p-3.5 bg-slate-50/90 border border-slate-200/70 rounded-xl sm:rounded-2xl">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2 flex items-center justify-between">
            <span>DAILY DOSAGE SCHEDULE</span>
            {medicine.frequency && (
              <span className="text-slate-600 font-mono font-semibold">
                {medicine.frequency}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
            {/* Morning */}
            <div
              className={`p-2 rounded-lg sm:rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isMorning
                  ? "bg-sky-50 border-sky-200 text-[#0284c7] font-bold shadow-2xs"
                  : "bg-white/60 border-slate-200/50 text-slate-400 opacity-60"
              }`}
            >
              <Sunrise size={15} />
              <span className="text-[10.5px] sm:text-[11px] font-medium">Morning</span>
              <span className="text-[11.5px] sm:text-[12px] font-mono font-bold">
                {isMorning ? "1 Dose" : "—"}
              </span>
            </div>

            {/* Afternoon */}
            <div
              className={`p-2 rounded-lg sm:rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isAfternoon
                  ? "bg-amber-50 border-amber-200 text-amber-700 font-bold shadow-2xs"
                  : "bg-white/60 border-slate-200/50 text-slate-400 opacity-60"
              }`}
            >
              <Sun size={15} />
              <span className="text-[10.5px] sm:text-[11px] font-medium">Afternoon</span>
              <span className="text-[11.5px] sm:text-[12px] font-mono font-bold">
                {isAfternoon ? "1 Dose" : "—"}
              </span>
            </div>

            {/* Night */}
            <div
              className={`p-2 rounded-lg sm:rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-colors ${
                isNight
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold shadow-2xs"
                  : "bg-white/60 border-slate-200/50 text-slate-400 opacity-60"
              }`}
            >
              <Moon size={15} />
              <span className="text-[10.5px] sm:text-[11px] font-medium">Night</span>
              <span className="text-[11.5px] sm:text-[12px] font-mono font-bold">
                {isNight ? "1 Dose" : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Dosage detail tags (Timing & Duration) */}
        {(medicine.timing || medicine.duration) && (
          <div className="flex flex-wrap items-center gap-2 mb-3.5">
            {medicine.timing && (
              <div className="bg-slate-100/90 border border-slate-200/80 rounded-lg px-2.5 py-1 text-[12px] font-semibold text-slate-700 inline-flex items-center gap-1.5">
                <Clock size={13} className="text-[#0284c7]" />
                <span>{medicine.timing}</span>
              </div>
            )}
            {medicine.duration && (
              <div className="bg-slate-100/90 border border-slate-200/80 rounded-lg px-2.5 py-1 text-[12px] font-semibold text-slate-700 inline-flex items-center gap-1.5">
                <Calendar size={13} className="text-[#6366f1]" />
                <span>{medicine.duration}</span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {medicine.description && (
          <p className="text-[13.5px] sm:text-[14px] text-slate-600 leading-relaxed mb-3">
            {medicine.description}
          </p>
        )}

        {/* Why Prescribed Box */}
        {medicine.whyPrescribed && (
          <div className="mt-2.5 bg-sky-50/70 rounded-xl border-l-[3px] border-[#0284c7] p-3">
            <div className="text-[10px] font-bold tracking-wider text-[#0369a1] uppercase mb-0.5">
              WHY PRESCRIBED
            </div>
            <div className="text-[13px] text-[#0369a1] leading-relaxed">
              {medicine.whyPrescribed}
            </div>
          </div>
        )}

        {/* Possible Side Effects */}
        {medicine.sideEffects && medicine.sideEffects.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
              POSSIBLE SIDE EFFECTS
            </div>
            <div className="flex flex-wrap gap-1.5">
              {medicine.sideEffects.map((effect, idx) => (
                <span
                  key={idx}
                  className="bg-rose-50 text-rose-700 border border-rose-200/60 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                >
                  {effect}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Allergy Warning if present */}
        {medicine.allergyWarning && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5 items-start">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-[12px] text-amber-800 font-semibold leading-snug">
              {medicine.allergyWarning}
            </span>
          </div>
        )}

        {medicine.completionWarning && (
          <div className="mt-2.5 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex gap-2.5 items-start">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-[12px] text-emerald-800 font-medium leading-snug">
              {medicine.completionWarning}
            </span>
          </div>
        )}
      </div>

      {/* Collapsible Official FDA Drug Data */}
      {fdaInfo && (
        <div className="mt-3.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            className="text-[12px] font-bold text-[#0284c7] hover:text-[#0369a1] transition-colors cursor-pointer inline-flex items-center gap-1"
            onClick={() => setShowFdaInfo(!showFdaInfo)}
          >
            <span>{showFdaInfo ? "Hide FDA Label Details" : "View Official FDA Data"}</span>
            {showFdaInfo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showFdaInfo && (
            <div className="mt-2 bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11.5px] text-slate-600 leading-relaxed space-y-2">
              {fdaInfo.warnings && fdaInfo.warnings.length > 0 && (
                <div>
                  <strong className="block text-[#0a1628] font-bold mb-0.5">
                    FDA Warnings:
                  </strong>
                  {fdaInfo.warnings[0]}
                </div>
              )}
              {fdaInfo.contraindications && fdaInfo.contraindications.length > 0 && (
                <div>
                  <strong className="block text-[#0a1628] font-bold mb-0.5">
                    Contraindications:
                  </strong>
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
