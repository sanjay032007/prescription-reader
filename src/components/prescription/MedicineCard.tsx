"use client";

import { useEffect, useState } from "react";
import type { Medicine } from "@/lib/gemini";
import { Clock, AlertTriangle, ShieldCheck, Sun, Moon, Sunrise } from "lucide-react";

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
    <article className="bg-white rounded-[28px] p-6 sm:p-7 border border-slate-200/80 shadow-[0_10px_30px_rgba(10,22,40,0.03)] relative overflow-hidden flex flex-col justify-between hover:shadow-[0_20px_50px_rgba(10,22,40,0.08)] hover:-translate-y-1 transition-all duration-300">
      {/* Top accent gradient bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-[4px] rounded-t-[28px] ${
          isAntibiotic
            ? "bg-gradient-to-r from-amber-500 to-orange-500"
            : "bg-gradient-to-r from-[#0284c7] via-[#4a90d9] to-[#6366f1]"
        }`}
      />

      <div className="pt-2">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-extrabold text-[#0a1628] tracking-tight">
              {medicine.brandName}
            </h3>
            {medicine.genericName && (
              <p className="text-[13.5px] text-[#0284c7] font-semibold mt-0.5">
                {medicine.genericName}
              </p>
            )}
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            {medicine.category && (
              <span
                className={`text-[11.5px] font-bold px-3 py-1 rounded-full shrink-0 ${
                  isAntibiotic
                    ? "bg-orange-50 border border-orange-200 text-orange-700"
                    : "bg-sky-50 border border-sky-200 text-[#0284c7]"
                }`}
              >
                {medicine.category}
              </span>
            )}
          </div>
        </div>

        {/* Daily Dosage Visualizer Schedule Timeline */}
        <div className="my-4 p-3.5 bg-slate-50/80 border border-slate-200/60 rounded-2xl">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
            DAILY DOSAGE SCHEDULE
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Morning */}
            <div
              className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-colors ${
                isMorning
                  ? "bg-sky-50/90 border-sky-200 text-[#0284c7] font-bold"
                  : "bg-white/60 border-slate-200/60 text-slate-400 opacity-60"
              }`}
            >
              <Sunrise size={16} />
              <span className="text-[11px]">Morning</span>
              <span className="text-[12px] font-mono">{isMorning ? "1 Dose" : "—"}</span>
            </div>

            {/* Afternoon */}
            <div
              className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-colors ${
                isAfternoon
                  ? "bg-amber-50/90 border-amber-200 text-amber-700 font-bold"
                  : "bg-white/60 border-slate-200/60 text-slate-400 opacity-60"
              }`}
            >
              <Sun size={16} />
              <span className="text-[11px]">Afternoon</span>
              <span className="text-[12px] font-mono">{isAfternoon ? "1 Dose" : "—"}</span>
            </div>

            {/* Night */}
            <div
              className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-colors ${
                isNight
                  ? "bg-indigo-50/90 border-indigo-200 text-indigo-700 font-bold"
                  : "bg-white/60 border-slate-200/60 text-slate-400 opacity-60"
              }`}
            >
              <Moon size={16} />
              <span className="text-[11px]">Night</span>
              <span className="text-[12px] font-mono">{isNight ? "1 Dose" : "—"}</span>
            </div>
          </div>
        </div>

        {/* Dosage detail tags */}
        {(medicine.timing || medicine.duration) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {medicine.timing && (
              <div className="bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-slate-700 inline-flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400" />
                <span>{medicine.timing}</span>
              </div>
            )}
            {medicine.duration && (
              <div className="bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-1.5 text-[12px] font-semibold text-slate-700 inline-flex items-center gap-1.5">
                <span className="text-slate-400">📅</span>
                <span>{medicine.duration}</span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {medicine.description && (
          <p className="text-[14.5px] text-slate-600 leading-relaxed font-normal mb-3">
            {medicine.description}
          </p>
        )}

        {/* Why Prescribed Box */}
        {medicine.whyPrescribed && (
          <div className="mt-3 bg-[#f0f9ff] rounded-2xl border-l-[4px] border-[#0284c7] p-3.5 sm:p-4">
            <div className="text-[10px] font-bold tracking-wider text-[#0369a1] uppercase mb-1">
              WHY PRESCRIBED
            </div>
            <div className="text-[13.5px] text-[#0369a1] leading-relaxed">
              {medicine.whyPrescribed}
            </div>
          </div>
        )}

        {/* Side Effects */}
        {medicine.sideEffects && medicine.sideEffects.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
              POSSIBLE SIDE EFFECTS
            </div>
            <div className="flex flex-wrap gap-1.5">
              {medicine.sideEffects.map((effect, idx) => (
                <span
                  key={idx}
                  className="bg-rose-50 text-rose-700 border border-rose-200/70 text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full"
                >
                  {effect}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Allergy or Antibiotic Warning */}
        {medicine.allergyWarning && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5 items-center">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-[12px] text-amber-800 font-semibold leading-snug">
              {medicine.allergyWarning}
            </span>
          </div>
        )}

        {medicine.completionWarning && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex gap-2.5 items-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[12px] text-emerald-800 font-medium leading-snug">
              {medicine.completionWarning}
            </span>
          </div>
        )}
      </div>

      {/* Collapsible Official FDA Data Section */}
      {fdaInfo && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            className="text-[12px] font-bold text-[#0284c7] hover:text-[#0369a1] transition-colors cursor-pointer inline-flex items-center gap-1.5"
            onClick={() => setShowFdaInfo(!showFdaInfo)}
          >
            <span>{showFdaInfo ? "Hide Official FDA Info" : "View Official FDA Info"}</span>
            <i
              className={`ti ti-chevron-${
                showFdaInfo ? "up" : "down"
              } text-[12px]`}
            />
          </button>
          {showFdaInfo && (
            <div className="mt-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-[12px] text-slate-600 leading-relaxed space-y-2">
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
