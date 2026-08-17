"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import indianMedicinesData from "@/data/indian_medicines.json";
import { Search, X, Pill, Plus, Check, Building2 } from "lucide-react";
import type { Medicine } from "@/lib/gemini";

interface ManualMedicineSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedicine: (med: Medicine) => void;
}

export default function ManualMedicineSearchModal({
  isOpen,
  onClose,
  onSelectMedicine,
}: ManualMedicineSearchModalProps) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(() => {
    return new Fuse(indianMedicinesData, {
      keys: ["name", "brandName", "genericName", "short_composition1"],
      threshold: 0.35,
      distance: 100,
    });
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) {
      return (indianMedicinesData as any[]).slice(0, 10);
    }
    return fuse.search(query).map((res) => res.item).slice(0, 15);
  }, [query, fuse]);

  if (!isOpen) return null;

  const handleChoose = (item: any) => {
    const isPenicillin =
      item.genericName?.toLowerCase().includes("amoxicillin") ||
      item.genericName?.toLowerCase().includes("augmentin");
    const isAntibiotic =
      item.category?.toLowerCase().includes("antibiotic") || isPenicillin;

    const med: Medicine = {
      brandName: item.brandName || item.name,
      genericName: item.genericName,
      category: item.category || "Medication",
      frequency: "1 - 0 - 1",
      timing: "After meals (PC)",
      duration: "5 days",
      dosageUnderstood: true,
      confidence: "high",
      confidenceReason: "Selected from official Indian medicine database registry.",
      description: `Indian pharmaceutical formulation: ${item.short_composition1 || item.genericName}.`,
      whyPrescribed: `Commonly prescribed in India for therapeutic relief.`,
      sideEffects: ["Mild nausea", "Headache"],
      isAntibiotic,
      isPenicillinBased: isPenicillin,
      allergyWarning: isPenicillin
        ? "Contains penicillin-based antibiotic. Avoid if allergic to penicillin."
        : null,
      completionWarning: isAntibiotic
        ? "Complete full prescribed antibiotic course even if feeling better."
        : null,
      manufacturer: item.manufacturer,
    };

    onSelectMedicine(med);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-[18px] font-extrabold text-slate-950">
              Indian Medicine Quick Lookup
            </h3>
            <p className="text-[12.5px] text-slate-500 mt-0.5">
              Search 500+ Indian brands (Dolo, Augmentin, Pan-D, Calpol...)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Input */}
        <div className="my-4 relative">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type medicine name (e.g. Dolo, Pan 40, Cheston)..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] text-slate-900 focus:bg-white focus:border-[#0284c7] focus:outline-none transition-all"
          />
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {results.map((item: any, idx: number) => (
            <div
              key={idx}
              onClick={() => handleChoose(item)}
              className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-sky-50/70 hover:border-sky-200 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="min-w-0 pr-3">
                <p className="text-[14.5px] font-bold text-slate-950 group-hover:text-[#0284c7] transition-colors truncate">
                  {item.brandName || item.name}
                </p>
                <p className="text-[12px] text-slate-500 font-medium truncate mt-0.5 flex items-center gap-1.5">
                  <Pill size={12} className="text-[#0284c7] shrink-0" />
                  <span>{item.genericName || item.short_composition1}</span>
                </p>
                {item.manufacturer && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Mfr: {item.manufacturer}
                  </p>
                )}
              </div>

              <button
                type="button"
                className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-slate-200 group-hover:bg-[#0c1e3d] group-hover:text-white text-slate-700 text-[12px] font-bold transition-colors shadow-2xs flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Select</span>
              </button>
            </div>
          ))}

          {results.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-[13px]">
              No exact match found. Try a generic name like &quot;Paracetamol&quot; or &quot;Pantoprazole&quot;.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
