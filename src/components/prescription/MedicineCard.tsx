"use client";

import { useEffect, useState } from "react";
import type { Medicine } from "@/lib/gemini";
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
  Info,
  Pill,
} from "lucide-react";

interface MedicineCardProps {
  medicine: Medicine;
  isExample?: boolean;
}

export default function MedicineCard({
  medicine,
  isExample = false,
}: MedicineCardProps) {
  const [fdaInfo, setFdaInfo] = useState<any>(null);
  const [showFda, setShowFda] = useState(false);

  useEffect(() => {
    if (isExample) return;
    const apiKey = process.env.NEXT_PUBLIC_FDA_API_KEY || "";
    const cleanTerm = (str?: string) =>
      (str || "")
        .replace(
          /(Tab\.|Cap\.|Syp\.|Tablet|Capsule|Syrup|\d+\s*mg|\d+\s*ml|\d+)/gi,
          ""
        )
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
        if (data?.results?.length > 0) setFdaInfo(data.results[0]);
      })
      .catch(() => setFdaInfo(null));
  }, [medicine.brandName, medicine.genericName, isExample]);

  const freq = (medicine.frequency || "").toLowerCase();
  const tim = (medicine.timing || "").toLowerCase();
  const dur = (medicine.duration || "").toLowerCase();

  const hasValidDosage =
    medicine.dosageUnderstood &&
    (Boolean(freq && !freq.includes("unclear")) ||
      Boolean(tim && !tim.includes("unclear")));

  const isMorning =
    hasValidDosage &&
    (freq.includes("1-1-1") ||
      freq.includes("1-0-1") ||
      freq.includes("1-0-0") ||
      freq.includes("twice") ||
      freq.includes("3 times") ||
      freq.includes("morning") ||
      tim.includes("morning") ||
      tim.includes("breakfast"));

  const isAfternoon =
    hasValidDosage &&
    (freq.includes("1-1-1") ||
      freq.includes("0-1-0") ||
      freq.includes("3 times") ||
      tim.includes("afternoon") ||
      tim.includes("lunch"));

  const isNight =
    hasValidDosage &&
    (freq.includes("1-1-1") ||
      freq.includes("1-0-1") ||
      freq.includes("0-0-1") ||
      freq.includes("twice") ||
      freq.includes("3 times") ||
      freq.includes("night") ||
      tim.includes("night") ||
      tim.includes("bed") ||
      tim.includes("dinner"));

  return (
    <article className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
      <div>
        {/* Top Header: Brand Name + Category Tag */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] sm:text-[18px] font-extrabold text-slate-950 leading-snug break-words">
              {medicine.brandName}
            </h3>
            {medicine.genericName && (
              <p className="text-[13px] font-medium text-[#0284c7] mt-0.5 flex items-center gap-1.5">
                <Pill size={12} className="shrink-0" />
                <span>Salt: {medicine.genericName}</span>
              </p>
            )}
          </div>

          {medicine.category && (
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 tracking-wide uppercase ${
                medicine.isAntibiotic
                  ? "bg-amber-50 text-amber-800 border border-amber-200/70"
                  : "bg-slate-100 text-slate-700 border border-slate-200/60"
              }`}
            >
              {medicine.category}
            </span>
          )}
        </div>

        {/* Daily Dosage Schedule Timeline */}
        {hasValidDosage ? (
          <div className="my-3.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70">
            <div className="flex items-center justify-between mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Daily Schedule</span>
              {medicine.frequency && (
                <span className="font-mono text-slate-700 font-semibold">{medicine.frequency}</span>
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
        {hasValidDosage && (medicine.timing || medicine.duration) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {medicine.timing && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 text-[12px] font-medium text-slate-700">
                <Clock size={13} className="text-[#0284c7]" />
                <span>{medicine.timing}</span>
              </div>
            )}
            {medicine.duration && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 text-[12px] font-medium text-slate-700">
                <Calendar size={13} className="text-indigo-600" />
                <span>{medicine.duration}</span>
              </div>
            )}
          </div>
        )}

        {/* Clinical Description */}
        {medicine.description && (
          <p className="text-[13.5px] text-slate-600 leading-relaxed mb-3">
            {medicine.description}
          </p>
        )}

        {/* Why Prescribed Box */}
        {medicine.whyPrescribed && (
          <div className="mb-3.5 p-3 rounded-xl bg-sky-50/70 border-l-2 border-[#0284c7]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0369a1] block mb-0.5">
              Why Prescribed
            </span>
            <p className="text-[13px] text-slate-700 leading-relaxed">
              {medicine.whyPrescribed}
            </p>
          </div>
        )}

        {/* Side Effects */}
        {medicine.sideEffects && medicine.sideEffects.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Possible Side Effects
            </span>
            <div className="flex flex-wrap gap-1.5">
              {medicine.sideEffects.map((effect, idx) => (
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

        {/* Allergy Warning */}
        {medicine.allergyWarning && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2.5 items-start">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="text-[12px] text-amber-900 font-semibold leading-snug">
              {medicine.allergyWarning}
            </span>
          </div>
        )}

        {/* Antibiotic Course Warning */}
        {medicine.completionWarning && (
          <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-2.5 items-start">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-[12px] text-emerald-900 font-medium leading-snug">
              {medicine.completionWarning}
            </span>
          </div>
        )}
      </div>

      {/* FDA Drug Data Drawer */}
      {fdaInfo && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            className="text-[12px] font-bold text-[#0284c7] hover:text-[#0369a1] transition-colors cursor-pointer inline-flex items-center gap-1"
            onClick={() => setShowFda(!showFda)}
          >
            <Info size={13} />
            <span>{showFda ? "Hide Official FDA Information" : "View Official FDA Data"}</span>
            {showFda ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          
          {showFda && (
            <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] text-slate-600 space-y-2">
              {fdaInfo.warnings && fdaInfo.warnings.length > 0 && (
                <div>
                  <strong className="block text-slate-900 font-bold mb-0.5">FDA Warnings:</strong>
                  <p className="line-clamp-4 leading-relaxed">{fdaInfo.warnings[0]}</p>
                </div>
              )}
              {fdaInfo.contraindications && fdaInfo.contraindications.length > 0 && (
                <div>
                  <strong className="block text-slate-900 font-bold mb-0.5">Contraindications:</strong>
                  <p className="line-clamp-4 leading-relaxed">{fdaInfo.contraindications[0]}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
