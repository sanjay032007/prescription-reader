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
    <article className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] sm:text-[17px] font-bold text-[#0a1628] leading-snug break-words">
            {medicine.brandName}
          </h3>
          {medicine.genericName && (
            <p className="text-[13px] text-slate-500 mt-0.5">
              {medicine.genericName}
            </p>
          )}
        </div>
        {medicine.category && (
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0 ${
              medicine.isAntibiotic
                ? "bg-amber-50 text-amber-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {medicine.category}
          </span>
        )}
      </div>

      {/* Dosage schedule */}
      {hasValidDosage ? (
        <div className="mb-3 p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Schedule
            </span>
            {medicine.frequency && (
              <span className="text-[12px] font-mono text-slate-700">
                {medicine.frequency}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div
              className={`py-2 rounded-lg text-[12px] font-medium flex flex-col items-center gap-1 ${
                isMorning
                  ? "bg-sky-50 text-[#0284c7]"
                  : "bg-white text-slate-300 border border-slate-100"
              }`}
            >
              <Sunrise size={14} />
              <span>Morning</span>
            </div>
            <div
              className={`py-2 rounded-lg text-[12px] font-medium flex flex-col items-center gap-1 ${
                isAfternoon
                  ? "bg-amber-50 text-amber-700"
                  : "bg-white text-slate-300 border border-slate-100"
              }`}
            >
              <Sun size={14} />
              <span>Afternoon</span>
            </div>
            <div
              className={`py-2 rounded-lg text-[12px] font-medium flex flex-col items-center gap-1 ${
                isNight
                  ? "bg-indigo-50 text-indigo-700"
                  : "bg-white text-slate-300 border border-slate-100"
              }`}
            >
              <Moon size={14} />
              <span>Night</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-3 py-2 px-3 bg-slate-50 rounded-lg text-[13px] text-slate-500 flex items-center justify-between">
          <span>Dosage</span>
          <span className="text-slate-700 font-medium">
            Take as advised by doctor
          </span>
        </div>
      )}

      {/* Timing & duration tags */}
      {hasValidDosage && (medicine.timing || medicine.duration) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {medicine.timing && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 text-[12px] text-slate-600">
              <Clock size={12} className="text-slate-400" />
              <span>{medicine.timing}</span>
            </div>
          )}
          {medicine.duration && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 text-[12px] text-slate-600">
              <Calendar size={12} className="text-slate-400" />
              <span>{medicine.duration}</span>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {medicine.description && (
        <p className="text-[13px] text-slate-600 leading-relaxed mb-3">
          {medicine.description}
        </p>
      )}

      {/* Why prescribed */}
      {medicine.whyPrescribed && (
        <div className="mb-3 pl-3 border-l-2 border-[#0284c7]">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
            Why prescribed
          </p>
          <p className="text-[13px] text-slate-700 leading-relaxed">
            {medicine.whyPrescribed}
          </p>
        </div>
      )}

      {/* Side effects */}
      {medicine.sideEffects && medicine.sideEffects.length > 0 && (
        <div className="pt-3 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            Side effects
          </p>
          <div className="flex flex-wrap gap-1.5">
            {medicine.sideEffects.map((effect, idx) => (
              <span
                key={idx}
                className="bg-rose-50 text-rose-700 text-[11px] font-medium px-2 py-0.5 rounded-md"
              >
                {effect}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {medicine.allergyWarning && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 items-start">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span className="text-[12px] text-amber-800 font-medium">
            {medicine.allergyWarning}
          </span>
        </div>
      )}
      {medicine.completionWarning && (
        <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex gap-2 items-start">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="text-[12px] text-emerald-800 font-medium">
            {medicine.completionWarning}
          </span>
        </div>
      )}

      {/* FDA data */}
      {fdaInfo && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            className="text-[12px] font-medium text-[#0284c7] hover:text-[#0369a1] cursor-pointer inline-flex items-center gap-1"
            onClick={() => setShowFda(!showFda)}
          >
            <span>{showFda ? "Hide FDA data" : "View FDA data"}</span>
            {showFda ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {showFda && (
            <div className="mt-2 p-3 bg-slate-50 rounded-lg text-[12px] text-slate-600 space-y-2">
              {fdaInfo.warnings && fdaInfo.warnings.length > 0 && (
                <div>
                  <strong className="text-[#0a1628]">Warnings:</strong>{" "}
                  {fdaInfo.warnings[0]}
                </div>
              )}
              {fdaInfo.contraindications &&
                fdaInfo.contraindications.length > 0 && (
                  <div>
                    <strong className="text-[#0a1628]">
                      Contraindications:
                    </strong>{" "}
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
