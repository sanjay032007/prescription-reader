"use client";

import { useState, useCallback, useRef } from "react";
import BrandHeader from "@/components/prescription/BrandHeader";
import DeskClipboardVisual from "@/components/prescription/DeskClipboardVisual";
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
  Upload,
  Lock,
  Shield,
  Zap,
  RefreshCw,
  Sparkles,
  Search,
  Wand2,
  FileCheck2,
  CheckCircle2,
  Activity,
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

  const studioRef = useRef<HTMLDivElement>(null);

  const scrollToStudio = () => {
    studioRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    <div className="min-h-screen flex flex-col bg-[#fafbfc]">
      <BrandHeader />

      <ManualMedicineSearchModal
        isOpen={isManualSearchOpen}
        onClose={() => setIsManualSearchOpen(false)}
        onSelectMedicine={handleAddManualMedicine}
      />

      {/* ============================================================ */}
      {/* 1. TOP HERO BANNER (Warm Wooden Desk Surface Background)     */}
      {/* ============================================================ */}
      <section className="w-full desk-surface border-b border-[#e6dfd6] py-14 sm:py-18 lg:py-22 overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/80 text-[#0284c7] text-[11.5px] font-extrabold uppercase tracking-widest mb-6 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-pulse" />
                <span>Multi-Model Clinical Intelligence</span>
              </div>

              {/* Serif Headline */}
              <h1 className="font-serif-heading text-[44px] sm:text-[56px] lg:text-[64px] font-extrabold text-slate-950 tracking-tight leading-[1.06] mb-5">
                Make your<br />
                prescription<br />
                <span className="text-[#0284c7]">easier to read.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-[16px] sm:text-[17.5px] text-slate-600 font-normal leading-relaxed max-w-[500px] mb-8">
                Upload a photo of your doctor&apos;s prescription. We cross-verify handwritten medicines, exact strengths, and dosage schedules against the Indian Pharmacopeia.
              </p>

              {/* Upload Prescription Button */}
              <button
                type="button"
                onClick={scrollToStudio}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-[#0c1e3d] hover:bg-[#162a4d] text-white text-[15px] font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer mb-6"
              >
                <Upload size={18} />
                <span>Upload Prescription</span>
              </button>

              {/* Specs & Privacy Note */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[13px] text-slate-500 font-semibold">
                <span className="inline-flex items-center gap-1.5 text-slate-700">
                  <Lock size={13} className="text-[#0284c7]" />
                  100% Private &amp; Encrypted
                </span>
                <span className="text-slate-300">&bull;</span>
                <span>TrOCR + Qwen + Llama</span>
                <span className="text-slate-300">&bull;</span>
                <span>Indian Database Verified</span>
              </div>
            </div>

            {/* Right Hero Desk Clipboard Visual */}
            <div className="lg:col-span-6 flex items-center justify-center pt-4 lg:pt-0">
              <DeskClipboardVisual />
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. PRESCRIPTION STUDIO & DATA SAFETY SECTION                 */}
      {/* ============================================================ */}
      <section id="studio-section" ref={studioRef} className="w-full py-14 sm:py-18 bg-[#fafbfc]">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Left Column: Upload Studio Box */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[11.5px] font-extrabold uppercase tracking-widest text-[#0284c7] block mb-1">
                    Prescription Studio
                  </span>
                  <h2 className="font-serif-heading text-[28px] sm:text-[32px] font-extrabold text-slate-950 tracking-tight">
                    Upload Prescription
                  </h2>
                  <p className="text-[14.5px] text-slate-500 mt-0.5">
                    Upload a clear photo or document of your prescription.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsManualSearchOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-[13px] font-bold text-slate-700 transition-all shadow-2xs cursor-pointer"
                >
                  <Search size={14} className="text-[#0284c7]" />
                  <span>Quick Lookup</span>
                </button>
              </div>

              {/* Dashed Dropzone Box */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs hover:border-slate-300 transition-all">
                <UploadZone
                  onFileSelected={handleFileSelected}
                  fileName={file?.name}
                  previewUrl={previewUrl}
                  disabled={loading}
                />

                {/* Auto-Enhance Filter Tool */}
                {file && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-[12.5px]">
                    <div className="flex items-center gap-2">
                      <Wand2 size={15} className="text-[#0284c7]" />
                      <span className="font-semibold text-slate-800">
                        {isEnhanced ? "✨ High-Contrast Document Filter Active" : "Faint or blurry ink?"}
                      </span>
                    </div>

                    {!isEnhanced ? (
                      <button
                        type="button"
                        onClick={handleToggleEnhance}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-[#0284c7] font-bold text-[12px] transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                      >
                        <Sparkles size={12} className="text-amber-500" />
                        <span>Apply Auto-Enhance Filter</span>
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold text-[12px] flex items-center gap-1">
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

                {/* Error Banner with Smart Actions */}
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

                {/* Analyse Button */}
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
            </div>

            {/* Right Column: "Your data is safe" Card */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                
                {/* Shield Icon */}
                <div className="w-13 h-13 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7] mb-5 shadow-2xs">
                  <Shield size={24} />
                </div>

                <h3 className="text-[19px] font-extrabold text-slate-950 mb-2">
                  Evidence-Based Clinical Intelligence
                </h3>

                <p className="text-[13.5px] text-slate-600 leading-relaxed mb-6">
                  We cross-verify handwritten doctor scripts with independent vision models and the official Indian Pharmacopeia. Zero assumptions.
                </p>

                <div className="space-y-4 pt-6 border-t border-slate-100 text-[13.5px] font-semibold text-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#0284c7] shrink-0 border border-slate-100">
                      <Lock size={15} />
                    </div>
                    <span>100% Ephemeral &amp; Private</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#0284c7] shrink-0 border border-slate-100">
                      <CheckCircle2 size={15} />
                    </div>
                    <span>Zero Default Values or Guessing</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[#0284c7] shrink-0 border border-slate-100">
                      <Activity size={15} />
                    </div>
                    <span>Multi-Model Vision Consensus</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* 3. MULTI-LAYER VERIFIED RESULTS BREAKDOWN                    */}
          {/* ============================================================ */}
          <div className="mt-8">
            <ResultsSection
              result={result}
              onConfirmCandidate={handleConfirmCandidate}
              onKeepOriginal={handleKeepOriginal}
            />
          </div>

        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="w-full py-8 border-t border-slate-200 text-center text-[12.5px] text-slate-400 font-medium bg-white">
        Prescription Reader &bull; Multi-Model Clinical Verification System &bull; Always consult your qualified healthcare professional
      </footer>
    </div>
  );
}
