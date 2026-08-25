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
  Shield,
  HealthAndSafety,
  Camera,
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFA] selection:bg-[#0D5C63]/15 selection:text-[#004B49] overflow-x-hidden">
      <BrandHeader onOpenLookup={() => setIsManualSearchOpen(true)} />

      <ManualMedicineSearchModal
        isOpen={isManualSearchOpen}
        onClose={() => setIsManualSearchOpen(false)}
        onSelectMedicine={handleAddManualMedicine}
      />

      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        
        {/* ============================================================ */}
        {/* 1. STITCH HERO TITLE SECTION                                 */}
        {/* ============================================================ */}
        <section className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] text-[11.5px] sm:text-[12px] font-extrabold uppercase tracking-widest mb-4 sm:mb-6 shadow-2xs border border-[#2D6A4F]/20">
            <ShieldCheck size={14} className="text-[#2D6A4F]" />
            <span>Pharmaceutical Grade Verification</span>
          </div>

          {/* Heading */}
          <h1 className="text-[36px] sm:text-[54px] lg:text-[64px] font-extrabold text-[#004B49] tracking-tight leading-[1.08] mb-4 sm:mb-5">
            Medication safety,<br />
            <span className="text-[#2D6A4F]">verified instantly.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[15px] sm:text-[18px] text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            Protect your health with our AI-powered prescription reader. We use clinical-grade multi-model vision to verify identity, dosage, and safety protocols in seconds.
          </p>

          {/* Trust Badges Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-6 grayscale opacity-80">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#0D5C63]" />
              <span className="text-[11.5px] sm:text-[12px] font-bold text-slate-700 tracking-wider">100% PRIVATE &amp; ENCRYPTED</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-[#0D5C63]" />
              <span className="text-[11.5px] sm:text-[12px] font-bold text-slate-700 tracking-wider">TrOCR + QWEN + LLAMA</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#0D5C63]" />
              <span className="text-[11.5px] sm:text-[12px] font-bold text-slate-700 tracking-wider">INDIAN PHARMACOPEIA</span>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. CORE INTERACTIVE UPLOAD WORKSPACE CARD                    */}
        {/* ============================================================ */}
        <section className="max-w-3xl mx-auto mb-12">
          <div className="bg-white rounded-3xl sm:rounded-[2.5rem] border border-[#0D5C63]/10 p-5 sm:p-9 shadow-premium hover:border-[#0D5C63]/25 transition-all">
            
            {/* Upload Zone */}
            <UploadZone
              onFileSelected={handleFileSelected}
              fileName={file?.name}
              previewUrl={previewUrl}
              disabled={loading}
            />

            {/* Auto-Enhance Filter Tool */}
            {file && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-[#F9F6F0] border border-[#0D5C63]/15 text-[12px] sm:text-[12.5px]">
                <div className="flex items-center gap-2">
                  <Wand2 size={16} className="text-[#0D5C63]" />
                  <span className="font-bold text-slate-800">
                    {isEnhanced ? "✨ High-Contrast Filter Active" : "Faint ink or dim lighting?"}
                  </span>
                </div>

                {!isEnhanced ? (
                  <button
                    type="button"
                    onClick={handleToggleEnhance}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-[#0D5C63]/20 hover:border-[#0D5C63] text-[#004B49] font-bold text-[12px] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                  >
                    <Sparkles size={13} className="text-amber-500" />
                    <span>Apply Contrast Filter</span>
                  </button>
                ) : (
                  <span className="text-[#2D6A4F] font-bold text-[12px] flex items-center gap-1">
                    <FileCheck2 size={14} />
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

          {/* Stitch Protocol 3-Card Highlights */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-3xl bg-white border border-[#0D5C63]/10 flex items-center gap-3.5 shadow-premium">
              <div className="w-10 h-10 rounded-2xl bg-[#0D5C63]/10 flex items-center justify-center text-[#0D5C63] shrink-0 border border-[#0D5C63]/20">
                <Lock size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-extrabold text-[#004B49] leading-tight">100% Private</p>
                <p className="text-[11.5px] text-slate-500 truncate">Zero images saved</p>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-[#0D5C63]/10 flex items-center gap-3.5 shadow-premium">
              <div className="w-10 h-10 rounded-2xl bg-[#2D6A4F]/10 flex items-center justify-center text-[#2D6A4F] shrink-0 border border-[#2D6A4F]/20">
                <Cpu size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-extrabold text-[#004B49] leading-tight">Multi-Model AI</p>
                <p className="text-[11.5px] text-slate-500 truncate">TrOCR + Qwen + Llama</p>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white border border-[#0D5C63]/10 flex items-center gap-3.5 shadow-premium">
              <div className="w-10 h-10 rounded-2xl bg-[#F9F6F0] flex items-center justify-center text-[#004B49] shrink-0 border border-[#0D5C63]/20">
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-extrabold text-[#004B49] leading-tight">Indian Database</p>
                <p className="text-[11.5px] text-slate-500 truncate">300+ Formulations</p>
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
      <footer className="w-full py-8 border-t border-slate-200 text-center text-[12px] text-slate-400 font-medium bg-white">
        Prescription Reader &bull; Pharmaceutical Grade Verification &bull; Always consult your qualified healthcare professional
      </footer>
    </div>
  );
}
