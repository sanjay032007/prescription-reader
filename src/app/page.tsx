"use client";

import { useState, useCallback, useRef } from "react";
import BrandHeader from "@/components/prescription/BrandHeader";
import UploadZone from "@/components/prescription/UploadZone";
import SymptomsInput from "@/components/prescription/SymptomsInput";
import AnalyseButton from "@/components/prescription/AnalyseButton";
import ResultsSection from "@/components/prescription/ResultsSection";
import ErrorCard from "@/components/prescription/ErrorCard";
import ManualMedicineSearchModal from "@/components/prescription/ManualMedicineSearchModal";
import { enhancePrescriptionImage } from "@/lib/imageEnhancer";
import { toBase64 } from "@/lib/gemini";
import type { PipelineVerificationResult, VerifiedMedicine, CandidateMatch } from "@/services/types";
import {
  Lock,
  ShieldCheck,
  Cpu,
  Sparkles,
  Search,
  Wand2,
  FileCheck2,
  CheckCircle2,
  RefreshCw,
  Zap,
} from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineVerificationResult | null>(null);
  const [isEnhanced, setIsEnhanced] = useState<boolean>(false);
  const [isManualSearchOpen, setIsManualSearchOpen] = useState<boolean>(false);

  const handleFileSelected = useCallback((selected: File) => {
    setFile(selected);
    setIsEnhanced(false);
    setError(null);
    setResult(null);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setSymptoms("");
    setError(null);
    setResult(null);
    setIsEnhanced(false);
  }, []);

  const handleToggleEnhance = useCallback(async () => {
    if (!file) return;
    try {
      const enhancedFile = await enhancePrescriptionImage(file);
      setFile(enhancedFile);
      setIsEnhanced(true);
      const url = URL.createObjectURL(enhancedFile);
      setPreviewUrl(url);
    } catch {
      // Keep existing file
    }
  }, [file]);

  const handleAnalyse = useCallback(async () => {
    if (!file) {
      setError("Please select or capture a prescription image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const base64 = await toBase64(file);
      const mimeType = file.type || "image/jpeg";

      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          symptoms,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error || `Server responded with status ${res.status}`);
      }

      const data: PipelineVerificationResult = await res.json();
      setResult(data);

      setTimeout(() => {
        const el = document.getElementById("results-breakdown");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err: any) {
      setError(err?.message || "Failed to complete multi-model verification. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [file, symptoms]);

  const handleConfirmCandidate = useCallback((id: string, candidate: CandidateMatch) => {
    setResult((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        medicines: prev.medicines.map((m) =>
          m.id === id
            ? {
                ...m,
                verified_name: candidate.name,
                selected_candidate: candidate,
                user_confirmed: true,
              }
            : m
        ),
      };
    });
  }, []);

  const handleKeepOriginal = useCallback((id: string) => {
    setResult((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        medicines: prev.medicines.map((m) =>
          m.id === id
            ? {
                ...m,
                verified_name: null,
                user_confirmed: true,
              }
            : m
        ),
      };
    });
  }, []);

  const handleAddManualMedicine = useCallback((newMed: any) => {
    const verified: VerifiedMedicine = {
      id: `manual_${Date.now()}`,
      raw_text: newMed.brandName || newMed.name,
      verified_name: newMed.brandName || newMed.name,
      candidate_matches: [
        {
          name: newMed.brandName || newMed.name,
          genericName: newMed.genericName,
          short_composition: newMed.genericName,
          category: newMed.category,
          manufacturer: newMed.manufacturer,
          similarity: 1.0,
        },
      ],
      selected_candidate: {
        name: newMed.brandName || newMed.name,
        genericName: newMed.genericName,
        short_composition: newMed.genericName,
        category: newMed.category,
        manufacturer: newMed.manufacturer,
        similarity: 1.0,
      },
      strength: { raw_text: null, value: null, confidence: 1.0 },
      dosage: { raw_text: newMed.frequency || "1-0-1", confidence: 1.0 },
      duration: { raw_text: newMed.duration || "5 days", confidence: 1.0 },
      timing: { raw_text: newMed.timing || "After meals", confidence: 1.0 },
      category: newMed.category || null,
      manufacturer: newMed.manufacturer || null,
      composition: newMed.genericName || null,
      confidence: "HIGH",
      confidence_score: 1.0,
      confidence_reasons: ["Manually selected from official Indian Pharmacopeia database"],
      evidence: {},
      user_confirmed: true,
      allergy_warning: newMed.allergyWarning || null,
      completion_warning: newMed.completionWarning || null,
      description: newMed.description || null,
      why_prescribed: newMed.whyPrescribed || null,
      side_effects: newMed.sideEffects || [],
    };

    setResult((prev) => {
      const existing = prev?.medicines || [];
      return {
        image_readable: true,
        medicines: [...existing, verified],
        general_warnings: prev?.general_warnings || [],
        symptom_analysis: prev?.symptom_analysis,
        model_audit_log: prev?.model_audit_log || { trocr: null, qwen: null, llama: null, gemini: null },
        verification_partial: false,
        total_processing_time_ms: 0,
      };
    });
    setError(null);
    setTimeout(() => {
      const el = document.getElementById("results-breakdown");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] selection:bg-sky-100 selection:text-[#0284c7] overflow-x-hidden hero-gradient">
      <BrandHeader onOpenLookup={() => setIsManualSearchOpen(true)} />

      <ManualMedicineSearchModal
        isOpen={isManualSearchOpen}
        onClose={() => setIsManualSearchOpen(false)}
        onSelectMedicine={handleAddManualMedicine}
      />

      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* ============================================================ */}
        {/* 1. HERO TITLE BLOCK                                          */}
        {/* ============================================================ */}
        <section className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-[#0284c7] text-[11px] sm:text-[11.5px] font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles size={13} className="text-amber-500" />
            <span>AI Handwritten Prescription Reader</span>
          </div>

          {/* Heading */}
          <h1 className="text-[28px] sm:text-[40px] lg:text-[48px] font-extrabold text-slate-950 tracking-tight leading-[1.12] mb-2 sm:mb-3">
            Understand your prescription.<br />
            <span className="text-[#0284c7]">Accurate &amp; Verified.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[14px] sm:text-[15.5px] text-slate-600 font-normal leading-relaxed">
            Upload any handwritten prescription to decipher medicine names, strengths, and dosage schedules cross-referenced with the Indian Pharmacopeia.
          </p>
        </section>

        {/* ============================================================ */}
        {/* 2. CORE INTERACTIVE UPLOAD WORKSPACE CARD                    */}
        {/* ============================================================ */}
        <section className="max-w-2xl mx-auto mb-10">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-7 shadow-xs hover:border-slate-300 transition-all">
            
            {/* Upload Zone */}
            <UploadZone
              onFileSelected={handleFileSelected}
              fileName={file?.name}
              previewUrl={previewUrl}
              disabled={loading}
            />

            {/* Auto-Enhance Filter Tool */}
            {file && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-[12px] sm:text-[12.5px]">
                <div className="flex items-center gap-2">
                  <Wand2 size={15} className="text-[#0284c7]" />
                  <span className="font-semibold text-slate-800">
                    {isEnhanced ? "✨ Contrast Filter Applied" : "Faint ink or dim lighting?"}
                  </span>
                </div>

                {!isEnhanced ? (
                  <button
                    type="button"
                    onClick={handleToggleEnhance}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-[#0284c7] font-bold text-[11.5px] sm:text-[12px] transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    <Sparkles size={12} className="text-amber-500" />
                    <span>Apply Auto-Enhance Filter</span>
                  </button>
                ) : (
                  <span className="text-emerald-700 font-bold text-[11.5px] sm:text-[12px] flex items-center gap-1">
                    <FileCheck2 size={13} />
                    <span>Enhanced for OCR</span>
                  </span>
                )}
              </div>
            )}

            {/* Optional Symptoms Input */}
            {file && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <SymptomsInput
                  value={symptoms}
                  onChange={setSymptoms}
                  disabled={loading}
                />
              </div>
            )}

            {/* Error Banner with Smart Remediation Actions */}
            {error && (
              <div className="mt-4">
                <ErrorCard message={error} />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleEnhance}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-[#0284c7] hover:bg-sky-100 font-bold text-[12px] transition-colors cursor-pointer"
                  >
                    <Sparkles size={13} />
                    <span>1. Enhance Contrast</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAnalyse}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold text-[12px] transition-colors cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>2. Retry Scan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsManualSearchOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 font-bold text-[12px] transition-colors cursor-pointer"
                  >
                    <Search size={13} />
                    <span>3. Lookup Medicine Name</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-slate-800 ml-auto cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>Try another photo</span>
                  </button>
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            {file && (
              <div className="mt-5">
                <AnalyseButton
                  onClick={handleAnalyse}
                  isLoading={loading}
                  disabled={!file}
                />
              </div>
            )}

          </div>

          {/* Quick Feature Badges Grid */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-[#0284c7] shrink-0 border border-sky-100">
                <Lock size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-slate-900 leading-tight">100% Private</p>
                <p className="text-[10.5px] text-slate-500 truncate">Zero data saved</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                <Cpu size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-slate-900 leading-tight">Multi-Model AI</p>
                <p className="text-[10.5px] text-slate-500 truncate">TrOCR + Qwen + Llama</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center gap-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100">
                <ShieldCheck size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-slate-900 leading-tight">Indian Database</p>
                <p className="text-[10.5px] text-slate-500 truncate">300+ Verified Medicines</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. MULTI-LAYER VERIFIED RESULTS SECTION                      */}
        {/* ============================================================ */}
        <ResultsSection
          result={result}
          onConfirmCandidate={handleConfirmCandidate}
          onKeepOriginal={handleKeepOriginal}
        />

      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-6 border-t border-slate-200 text-center text-[11.5px] sm:text-[12px] text-slate-400 font-medium bg-white">
        Prescription Reader &bull; Multi-Model Clinical Verification System &bull; Always follow your doctor&apos;s advice
      </footer>
    </div>
  );
}
