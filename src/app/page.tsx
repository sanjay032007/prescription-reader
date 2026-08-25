"use client";

import { useState, useCallback } from "react";
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
  Camera,
  Activity,
  Check,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Bell,
  Pill,
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
    <div className="min-h-screen flex flex-col bg-[#faf9fa] selection:bg-[#094cb2]/15 selection:text-[#094cb2] overflow-x-hidden">
      <BrandHeader onOpenLookup={() => setIsManualSearchOpen(true)} />

      <ManualMedicineSearchModal
        isOpen={isManualSearchOpen}
        onClose={() => setIsManualSearchOpen(false)}
        onSelectMedicine={handleAddManualMedicine}
      />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 lg:px-20 py-10 sm:py-16">
        
        {/* ============================================================ */}
        {/* 1. STITCH HERO TITLE SECTION                                 */}
        {/* ============================================================ */}
        <section className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#efedee] border border-[#c3c6d5]/40 text-slate-700 text-[11.5px] sm:text-[12px] font-sans font-semibold tracking-wide mb-5 shadow-2xs">
            <ShieldCheck size={14} className="text-[#094cb2]" />
            <span>Pharmaceutical Grade Verification</span>
          </div>

          {/* Heading in Noto Serif */}
          <h1 className="font-serif text-[38px] sm:text-[56px] lg:text-[68px] font-medium leading-[1.08] text-[#1b1c1d] mb-5">
            Medication safety,<br />
            <span className="italic text-[#094cb2]">verified instantly.</span>
          </h1>

          {/* Subtitle */}
          <p className="font-sans text-[16px] sm:text-[19px] text-slate-600 font-light leading-relaxed max-w-2xl mx-auto">
            Protect your health with our AI-powered prescription reader. We use clinical-grade imaging to verify identity, dosage, and safety protocols in seconds.
          </p>

          {/* Trust Badges Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-8 grayscale opacity-75">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#094cb2]" />
              <span className="text-[11.5px] font-sans font-semibold text-slate-700 tracking-wider">100% PRIVATE &amp; ENCRYPTED</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-[#094cb2]" />
              <span className="text-[11.5px] font-sans font-semibold text-slate-700 tracking-wider">TrOCR + QWEN + LLAMA</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#094cb2]" />
              <span className="text-[11.5px] font-sans font-semibold text-slate-700 tracking-wider">INDIAN PHARMACOPEIA</span>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. CORE INTERACTIVE UPLOAD WORKSPACE CARD                    */}
        {/* ============================================================ */}
        <section id="scan" className="max-w-3xl mx-auto mb-16 scroll-mt-24">
          <div className="glass-card rounded-[2.5rem] p-6 sm:p-10 shadow-premium hover:border-[#094cb2]/25 transition-all">
            
            {/* Upload Zone */}
            <UploadZone
              onFileSelected={handleFileSelected}
              fileName={file?.name}
              previewUrl={previewUrl}
              disabled={loading}
            />

            {/* Auto-Enhance Filter Tool */}
            {file && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-[#f5f3f4] border border-[#094cb2]/15 text-[12px] sm:text-[12.5px] font-sans">
                <div className="flex items-center gap-2">
                  <Wand2 size={16} className="text-[#094cb2]" />
                  <span className="font-semibold text-slate-800">
                    {isEnhanced ? "✨ High-Contrast Filter Active" : "Faint ink or dim lighting?"}
                  </span>
                </div>

                {!isEnhanced ? (
                  <button
                    type="button"
                    onClick={handleToggleEnhance}
                    className="px-4 py-1.5 rounded-full bg-white border border-[#094cb2]/20 hover:border-[#094cb2] text-[#094cb2] font-semibold text-[12px] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                  >
                    <Sparkles size={13} className="text-amber-500" />
                    <span>Apply Contrast Filter</span>
                  </button>
                ) : (
                  <span className="text-[#2D6A4F] font-semibold text-[12px] flex items-center gap-1">
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
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-[#094cb2] hover:bg-sky-100 font-semibold text-[12px] transition-colors cursor-pointer"
                  >
                    <Sparkles size={13} />
                    <span>1. Enhance Contrast</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAnalyse}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-semibold text-[12px] transition-colors cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>2. Retry Scan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsManualSearchOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 font-semibold text-[12px] transition-colors cursor-pointer"
                  >
                    <Search size={13} />
                    <span>3. Lookup Medicine Name</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-500 hover:text-slate-800 ml-auto cursor-pointer"
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
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-[1.5rem] bg-white border border-[#094cb2]/10 flex items-center gap-3.5 shadow-premium">
              <div className="w-10 h-10 rounded-2xl bg-[#094cb2]/10 flex items-center justify-center text-[#094cb2] shrink-0 border border-[#094cb2]/20">
                <Lock size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-sans font-bold text-[#1b1c1d] leading-tight">100% Private</p>
                <p className="text-[11.5px] font-sans text-slate-500 truncate">Zero images saved</p>
              </div>
            </div>

            <div className="p-4 rounded-[1.5rem] bg-white border border-[#094cb2]/10 flex items-center gap-3.5 shadow-premium">
              <div className="w-10 h-10 rounded-2xl bg-[#2D6A4F]/10 flex items-center justify-center text-[#2D6A4F] shrink-0 border border-[#2D6A4F]/20">
                <Cpu size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-sans font-bold text-[#1b1c1d] leading-tight">Multi-Model AI</p>
                <p className="text-[11.5px] font-sans text-slate-500 truncate">TrOCR + Qwen + Llama</p>
              </div>
            </div>

            <div className="p-4 rounded-[1.5rem] bg-white border border-[#094cb2]/10 flex items-center gap-3.5 shadow-premium">
              <div className="w-10 h-10 rounded-2xl bg-[#f5f3f4] flex items-center justify-center text-[#094cb2] shrink-0 border border-[#094cb2]/20">
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-sans font-bold text-[#1b1c1d] leading-tight">Indian Database</p>
                <p className="text-[11.5px] font-sans text-slate-500 truncate">300+ Formulations</p>
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

        {/* ============================================================ */}
        {/* 4. STITCH SECTION: HOW IT WORKS (SECURING YOUR JOURNEY)       */}
        {/* ============================================================ */}
        <section id="how-it-works" className="py-20 sm:py-28 border-t border-slate-200/80">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-16 sm:mb-20">
              <h2 className="font-serif text-[32px] sm:text-[46px] font-medium text-[#1b1c1d] mb-4">
                Securing your journey.
              </h2>
              <p className="font-sans text-slate-600 max-w-2xl mx-auto text-[16px] sm:text-[18px] font-light leading-relaxed">
                Our protocol ensures absolute accuracy from the moment you open the app to the moment you take your dose, combining clinical precision with seamless design.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
              {/* Step 1 */}
              <div className="glass-card p-8 sm:p-10 rounded-[2.5rem] flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#094cb2] text-white font-serif font-bold text-xl shadow-md shadow-[#094cb2]/20">
                    01
                  </span>
                  <h3 className="font-serif text-[22px] sm:text-[24px] font-medium text-[#1b1c1d]">
                    Scan your prescription
                  </h3>
                </div>
                <p className="font-sans text-slate-600 leading-relaxed font-light text-[15px]">
                  Use your mobile camera or upload an image of the physical script. Our vision AI detects text, active strengths, and meal timings instantly.
                </p>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2 text-[#094cb2] text-[13px] font-sans font-semibold uppercase tracking-wider">
                  <Camera size={16} />
                  <span>Real-time optical recognition active</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="glass-card p-8 sm:p-10 rounded-[2.5rem] flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#2D6A4F] text-white font-serif font-bold text-xl shadow-md shadow-[#2D6A4F]/20">
                    02
                  </span>
                  <h3 className="font-serif text-[22px] sm:text-[24px] font-medium text-[#1b1c1d]">
                    Multi-Model Cross-Reference
                  </h3>
                </div>
                <p className="font-sans text-slate-600 leading-relaxed font-light text-[15px]">
                  Our proprietary engine cross-references the scanned data across TrOCR, Qwen, and Llama with the official Indian Pharmacopeia to verify matches.
                </p>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2 text-[#2D6A4F] text-[13px] font-sans font-semibold uppercase tracking-wider">
                  <ShieldCheck size={16} />
                  <span>Linked to 300+ Indian drug entries</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. STITCH SECTION: SYMPTOM JOURNAL & DASHBOARD HIGHLIGHTS    */}
        {/* ============================================================ */}
        <section id="care" className="py-20 sm:py-24 border-t border-slate-200/80">
          <div className="max-w-[1200px] mx-auto grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#efedee] text-slate-700 text-[11.5px] font-sans font-semibold uppercase tracking-widest w-fit border border-[#c3c6d5]/40">
                Ongoing Care
              </div>
              <h2 className="font-serif text-[32px] sm:text-[44px] font-medium text-[#1b1c1d] leading-tight">
                Monitor your journey with the Symptom Journal.
              </h2>
              <p className="font-sans text-slate-600 text-[16px] leading-relaxed font-light">
                Safe medication management doesn&apos;t end after the scan. Cross-reference your symptoms to identify patterns and ensure appropriate therapeutic use.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#094cb2]/10 flex items-center justify-center text-[#094cb2] shrink-0 mt-0.5">
                    <TrendingUp size={18} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-[17px] text-[#1b1c1d]">Trend Analysis</h4>
                    <p className="font-sans text-[13.5px] text-slate-600 font-light mt-0.5">
                      Visual checks correlating reported symptoms with prescribed treatments.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#2D6A4F]/10 flex items-center justify-center text-[#2D6A4F] shrink-0 mt-0.5">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-[17px] text-[#1b1c1d]">Smart Safety Alerts</h4>
                    <p className="font-sans text-[13.5px] text-slate-600 font-light mt-0.5">
                      Get alerts if your symptoms indicate drug sensitivities or penicillin allergies.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div id="dashboard" className="lg:col-span-6">
              <div className="glass-card p-7 sm:p-9 rounded-[2.5rem] border border-[#094cb2]/15 shadow-premium">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#094cb2] text-white flex items-center justify-center shadow-xs">
                      <Activity size={18} />
                    </div>
                    <div>
                      <h4 className="font-serif text-[18px] font-bold text-[#1b1c1d]">Health Status Dashboard</h4>
                      <p className="font-sans text-[12px] text-slate-500">Live Clinical Verification Engine</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-sans font-bold px-2.5 py-1 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/20">
                    <Check size={12} />
                    <span>0 Conflicts</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-[#faf9fa] border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pill size={18} className="text-[#094cb2]" />
                      <div>
                        <p className="font-sans text-[13.5px] font-bold text-slate-800">Dolo 650 (Paracetamol)</p>
                        <p className="font-sans text-[11.5px] text-slate-500">Dosage: 1 - 1 - 1 &bull; After food</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">Verified</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#faf9fa] border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pill size={18} className="text-[#094cb2]" />
                      <div>
                        <p className="font-sans text-[13.5px] font-bold text-slate-800">Augmentin 625 (Amoxicillin)</p>
                        <p className="font-sans text-[11.5px] text-slate-500">Dosage: 1 - 0 - 1 &bull; 5 Days</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-sans font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">Verified</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[12.5px] font-sans font-semibold text-[#094cb2]">
                  <span>Pharmaceutical Protocol Active</span>
                  <a href="#scan" className="hover:underline flex items-center gap-1">
                    Scan new prescription <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-slate-200 text-center text-[12px] font-sans text-slate-400 font-medium bg-white">
        PrescriptCheck &bull; Pharmaceutical Grade Verification &bull; Always consult your qualified medical provider
      </footer>
    </div>
  );
}
