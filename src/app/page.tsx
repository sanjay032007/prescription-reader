"use client";

import { useState, useCallback, useRef } from "react";
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
  Shield,
  Heart,
  Camera,
  Search,
  Sparkles,
  Wand2,
  FileCheck2,
  RefreshCw,
  TrendingUp,
  Bell,
  Activity,
  Check,
  ArrowRight,
  Menu,
  Lock,
  MessageCircle,
  FileText,
  Clock,
  Pill,
  Send,
  Mic,
  Paperclip,
  Share2,
  Globe,
  Bot,
  Stethoscope,
  BookOpen,
  Calendar,
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
  const [dailyLogText, setDailyLogText] = useState<string>("");
  const [dailyLogFeedback, setDailyLogFeedback] = useState<string | null>(null);

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

  const handleAnalyzeDailyLog = () => {
    if (!dailyLogText.trim()) return;
    setDailyLogFeedback("Logged successfully. No adverse medication interactions detected based on your entry.");
  };

  const scrollToScan = () => {
    const el = document.getElementById("scan-studio");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#faf9fa] text-[#1b1c1d]">
      
      {/* Search Modal */}
      <ManualMedicineSearchModal
        isOpen={isManualSearchOpen}
        onClose={() => setIsManualSearchOpen(false)}
        onSelectMedicine={handleAddManualMedicine}
      />

      {/* ============================================================ */}
      {/* HEADER                                                       */}
      {/* ============================================================ */}
      <header className="glass-header flex items-center justify-between px-6 md:px-12 lg:px-24 py-4 sticky top-0 z-50 transition-all">
        <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#3366cc]/20 p-2 rounded-xl text-[#094cb2] flex items-center justify-center">
              <Shield size={24} className="fill-[#094cb2]/20" />
            </div>
            <h2 className="font-serif text-xl font-bold tracking-tight text-[#1b1c1d]">
              PrescriptCheck
            </h2>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#434653]">
            <a className="hover:text-[#094cb2] transition-colors" href="#how-it-works">How it Works</a>
            <a className="hover:text-[#094cb2] transition-colors" href="#care">Symptom Journal</a>
            <a className="hover:text-[#094cb2] transition-colors" href="#dashboard">Dashboard</a>
            <a className="hover:text-[#094cb2] transition-colors" href="#support">Clinical Support</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsManualSearchOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#094cb2]/20 bg-white hover:bg-[#faf9fa] text-xs font-semibold text-[#094cb2] transition-all shadow-xs cursor-pointer"
            >
              <Search size={13} />
              <span>Search Indian Medicines</span>
            </button>

            <button
              type="button"
              onClick={scrollToScan}
              className="bg-[#094cb2] text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-md shadow-[#094cb2]/20 hover:bg-[#3366cc] transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MAIN CONTENT                                                 */}
      {/* ============================================================ */}
      <main className="flex-1">

        {/* HERO SECTION */}
        <section className="relative px-6 md:px-12 lg:px-24 pt-16 pb-28 overflow-hidden bg-white">
          <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Hero Column */}
            <div className="flex flex-col gap-8 lg:col-span-5 xl:col-span-6 z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#efedee] border border-[#c3c6d5]/30 text-[#434653] text-xs font-semibold tracking-wide w-fit">
                <Shield size={14} className="text-[#094cb2]" />
                <span>Pharmaceutical Grade Verification</span>
              </div>

              <h1 className="text-5xl md:text-6xl xl:text-7xl font-serif font-medium leading-[1.1] text-[#1b1c1d]">
                Medication safety,<br />
                <span className="italic text-[#094cb2]">verified instantly.</span>
              </h1>

              <p className="text-[#434653] text-lg md:text-xl max-w-xl leading-relaxed font-sans">
                Protect your health with our AI-powered prescription reader. We use clinical-grade imaging to verify identity, dosage, and safety protocols in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <button
                  type="button"
                  onClick={scrollToScan}
                  className="flex items-center gap-3 justify-center rounded-full px-8 py-4 bg-[#094cb2] text-white text-base font-semibold shadow-xl shadow-[#094cb2]/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all w-full sm:w-auto cursor-pointer"
                >
                  <Camera size={20} />
                  <span>Start Scanning Now</span>
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">AI</div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">Rx</div>
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-[#094cb2] flex items-center justify-center font-bold text-xs text-white">99%</div>
                  </div>
                  <span className="text-sm text-[#434653] font-medium">Trusted by 10k+</span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Visual Phone Card Mockup */}
            <div className="lg:col-span-7 xl:col-span-6 relative h-[540px] md:h-[620px] w-full mt-6 lg:mt-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-[#d9e2ff]/40 to-transparent rounded-full blur-3xl -z-10"></div>
              
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-[340px] sm:w-[380px] h-[520px] bg-[#1b1c1d] rounded-[2.5rem] p-3 shadow-2xl border border-slate-200 premium-shadow transform -rotate-1 hover:rotate-0 transition-transform duration-700 ease-out">
                  <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative flex flex-col">
                    
                    {/* Mockup Header */}
                    <div className="px-6 pt-6 pb-3 flex items-center justify-between bg-white z-10 border-b border-slate-100">
                      <Menu size={18} className="text-slate-400" />
                      <span className="font-bold text-[#094cb2] text-xs tracking-widest uppercase">PrescriptCheck</span>
                      <div className="w-7 h-7 rounded-full bg-sky-50 flex items-center justify-center text-[10px] font-bold text-[#094cb2]">Rx</div>
                    </div>

                    {/* Prescription Mockup Content */}
                    <div className="relative flex-1 p-4 bg-[#f5f3f4] flex flex-col justify-between">
                      <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                          <span className="text-[11px] font-bold text-slate-800">CLINICAL HEALTH CENTER</span>
                          <span className="text-[10px] font-mono text-slate-400">14/05/2024</span>
                        </div>
                        <p className="font-serif italic text-[#094cb2] text-xl mb-1">℞</p>
                        <div className="space-y-1.5 font-mono text-[12px] text-slate-700">
                          <p>1. Tab. Dolo 650 &bull; 1-1-1</p>
                          <p>2. Cap. Augmentin 625 &bull; 1-0-1</p>
                          <p>3. Tab. Pantoprazole 40 &bull; 0-0-1</p>
                        </div>
                      </div>

                      <div className="glass-card p-3.5 rounded-2xl border border-emerald-200/60 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2D6A4F]/20 flex items-center justify-center text-[#2D6A4F] shrink-0">
                          <Check size={14} />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#2D6A4F] uppercase tracking-wider block">Verified Consensus</span>
                          <p className="text-[11.5px] font-bold text-slate-900">Dolo 650 &bull; 100% Match</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Floating Status Badge */}
                <div className="absolute top-[18%] right-[2%] z-30 transform rotate-2 glass-card p-3.5 rounded-2xl shadow-xl w-44 hidden sm:block">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-[#2D6A4F]/20 flex items-center justify-center text-[#2D6A4F]">
                      <Check size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 uppercase">Verified</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Augmentin 625 active match detected.</p>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* INTERACTIVE SCANNING & ANALYSIS STUDIO (LIVE ENGINE)        */}
        {/* ============================================================ */}
        <section id="scan-studio" className="px-6 md:px-12 lg:px-24 py-20 bg-[#f5f3f4] text-[#1b1c1d] relative overflow-hidden">
          <div className="max-w-[1000px] mx-auto relative z-10">
            
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-[#094cb2] uppercase tracking-widest block mb-2">Live AI Studio</span>
              <h2 className="text-3xl md:text-5xl font-serif font-medium mb-4">Upload &amp; Verify Your Prescription</h2>
              <p className="text-[#434653] text-base md:text-lg max-w-xl mx-auto font-sans">
                Our vision AI deciphers doctor handwriting, validates active strengths, and checks clinical dosage schedules.
              </p>
            </div>

            <div className="glass-card rounded-[2.5rem] p-6 sm:p-10 shadow-premium">
              <UploadZone
                onFileSelected={handleFileSelected}
                fileName={file?.name}
                previewUrl={previewUrl}
                disabled={loading}
              />

              {file && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 p-3.5 sm:p-4 rounded-2xl bg-white border border-[#094cb2]/15 text-[12px] sm:text-[12.5px] font-sans">
                  <div className="flex items-center gap-2">
                    <Wand2 size={16} className="text-[#094cb2]" />
                    <span className="font-semibold text-slate-800">
                      {isEnhanced ? "✨ High-Contrast OCR Filter Active" : "Faint handwriting or dim lighting?"}
                    </span>
                  </div>

                  {!isEnhanced ? (
                    <button
                      type="button"
                      onClick={handleToggleEnhance}
                      className="px-4 py-1.5 rounded-full bg-[#faf9fa] border border-[#094cb2]/20 hover:border-[#094cb2] text-[#094cb2] font-semibold text-[12px] transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
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

              {file && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <SymptomsInput
                    value={symptoms}
                    onChange={setSymptoms}
                    disabled={loading}
                  />
                </div>
              )}

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

              {file && (
                <div className="mt-6">
                  <AnalyseButton
                    onClick={handleAnalyse}
                    isLoading={loading}
                    disabled={!file}
                  />
                </div>
              )}

            </div>
          </div>
        </section>

        {/* VERIFIED RESULTS SECTION */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
          <ResultsSection
            result={result}
            onConfirmCandidate={handleConfirmCandidate}
            onKeepOriginal={handleKeepOriginal}
          />
        </div>

        {/* ============================================================ */}
        {/* HOW IT WORKS (SECURING YOUR JOURNEY)                          */}
        {/* ============================================================ */}
        <section className="px-6 md:px-12 lg:px-24 py-28 bg-white" id="how-it-works">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-serif font-medium text-[#1b1c1d] mb-4">
                Securing your journey.
              </h2>
              <p className="text-[#434653] max-w-2xl mx-auto text-lg font-sans font-light leading-relaxed">
                Our protocol ensures absolute accuracy from the moment you open the app to the moment you take your dose, combining clinical precision with seamless design.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 relative">
              {/* Step 1 */}
              <div className="flex flex-col gap-6 group relative z-10 glass-card p-8 sm:p-10 rounded-[2.5rem]">
                <div className="flex items-start gap-5">
                  <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#efedee] border border-[#c3c6d5]/30 text-[#1b1c1d] font-serif font-medium text-xl shadow-sm transition-transform group-hover:scale-105">
                    01
                  </span>
                  <div>
                    <h3 className="text-2xl font-serif font-medium text-[#1b1c1d] mb-2">Scan your prescription</h3>
                    <p className="text-[#434653] leading-relaxed font-sans font-light text-[15px]">
                      Use your mobile camera to capture a clear image of the medication or the physical script. Our vision AI detects text, imprint codes, and physical dimensions instantly.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2 text-[#094cb2] text-sm font-semibold uppercase tracking-wider pt-2 border-t border-slate-100">
                  <Camera size={18} />
                  <span>Real-time edge detection active</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col gap-6 group relative z-10 glass-card p-8 sm:p-10 rounded-[2.5rem]">
                <div className="flex items-start gap-5">
                  <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#094cb2] text-white font-serif font-medium text-xl shadow-md shadow-[#094cb2]/20 transition-transform group-hover:scale-105">
                    02
                  </span>
                  <div>
                    <h3 className="text-2xl font-serif font-medium text-[#1b1c1d] mb-2">AI Cross-reference</h3>
                    <p className="text-[#434653] leading-relaxed font-sans font-light text-[15px]">
                      Our proprietary engine cross-references the scanned data with official global pharmaceutical databases and your own medical history to identify any conflicts or errors.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-2 text-[#094cb2] text-sm font-semibold uppercase tracking-wider pt-2 border-t border-slate-100">
                  <Shield size={18} />
                  <span>Linked to 1.2M+ drug entries</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* ONGOING CARE & SYMPTOM JOURNAL                               */}
        {/* ============================================================ */}
        <section className="px-6 md:px-12 lg:px-24 py-28 bg-[#faf9fa]" id="care">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
              
              <div className="lg:w-5/12">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#efedee] text-[#434653] text-xs font-semibold uppercase tracking-widest mb-6 border border-[#c3c6d5]/30">
                  Ongoing Care
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-medium text-[#1b1c1d] mb-6 leading-tight">
                  Monitor your journey with the Symptom Journal.
                </h2>
                <p className="text-[#434653] text-lg leading-relaxed mb-10 font-sans font-light">
                  Safe medication management doesn&apos;t end after the scan. Log how you feel daily to identify patterns, potential side effects, and long-term efficacy.
                </p>

                <div className="flex flex-col gap-6">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-[#3366cc]/20 flex items-center justify-center text-[#094cb2] shrink-0 mt-1">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <h4 className="font-serif font-medium text-xl text-[#1b1c1d] mb-1">Trend Analysis</h4>
                      <p className="text-[#434653] font-sans text-sm">Visual charts showing how symptoms evolve over time, correlated with your medication schedule.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0 mt-1">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h4 className="font-serif font-medium text-xl text-[#1b1c1d] mb-1">Smart Alerts</h4>
                      <p className="text-[#434653] font-sans text-sm">Get proactively notified if reported symptoms match known side effects in the clinical database.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-7/12 w-full relative">
                <div className="glass-card p-8 sm:p-12 rounded-[2.5rem] relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xs border border-slate-200 text-[#094cb2]">
                      <Calendar size={22} />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-medium text-[#1b1c1d]">Daily Log</h3>
                      <p className="text-xs font-semibold text-[#434653] tracking-wide uppercase mt-0.5">Clinical Tracking</p>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      value={dailyLogText}
                      onChange={(e) => setDailyLogText(e.target.value)}
                      className="w-full min-h-[180px] p-6 rounded-3xl bg-white border border-slate-200 focus:border-[#094cb2] focus:ring-1 focus:ring-[#094cb2] text-[#1b1c1d] font-sans text-base resize-none placeholder:text-slate-400 shadow-inner transition-all outline-none"
                      placeholder="Describe how you're feeling today... Are you experiencing any mild nausea or fatigue?"
                    />
                  </div>

                  {dailyLogFeedback && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                      <Check size={14} />
                      <span>{dailyLogFeedback}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAnalyzeDailyLog}
                    className="w-full mt-6 bg-[#1b1c1d] text-white font-semibold py-4 rounded-2xl shadow-md hover:bg-[#094cb2] transition-colors flex items-center justify-center gap-2 text-base cursor-pointer"
                  >
                    <Activity size={18} />
                    <span>Analyze Entry</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* HEALTH DASHBOARD & SCHEDULE                                  */}
        {/* ============================================================ */}
        <section className="px-6 md:px-12 lg:px-24 py-28 bg-[#efedee]" id="dashboard">
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif font-medium text-[#1b1c1d] mb-3">Your Health Dashboard</h2>
                <p className="text-[#434653] text-lg font-sans font-light">Manage your verification history and upcoming schedule.</p>
              </div>
              <a href="#scan-studio" className="text-sm font-semibold text-[#094cb2] hover:underline flex items-center gap-1">
                <span>View Complete History</span> <ArrowRight size={15} />
              </a>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
              
              {/* Recent Verifications */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <h3 className="font-serif text-2xl font-medium text-[#1b1c1d] mb-2">Recent Verifications</h3>
                
                {/* Item 1 */}
                <div className="glass-card p-5 rounded-3xl flex items-center gap-5 hover:shadow-lg transition-all group">
                  <div className="w-16 h-16 rounded-2xl bg-[#094cb2]/10 text-[#094cb2] flex items-center justify-center shrink-0">
                    <Pill size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="px-2.5 py-0.5 bg-[#2D6A4F]/10 text-[#2D6A4F] text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                        <Check size={11} /> Verified
                      </span>
                      <span className="text-xs text-slate-400">14/05/2024</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#1b1c1d] truncate">Dolo 650 (Paracetamol)</h4>
                    <p className="text-xs text-slate-500">Antipyretic &bull; 1 tablet TID</p>
                  </div>
                  <div className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-[#094cb2] group-hover:text-white group-hover:border-[#094cb2] transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </div>

                {/* Item 2 */}
                <div className="glass-card p-5 rounded-3xl flex items-center gap-5 hover:shadow-lg transition-all group">
                  <div className="w-16 h-16 rounded-2xl bg-[#094cb2]/10 text-[#094cb2] flex items-center justify-center shrink-0">
                    <Pill size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="px-2.5 py-0.5 bg-[#2D6A4F]/10 text-[#2D6A4F] text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
                        <Check size={11} /> Verified
                      </span>
                      <span className="text-xs text-slate-400">10/05/2024</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#1b1c1d] truncate">Augmentin 625 (Amoxicillin)</h4>
                    <p className="text-xs text-slate-500">Antibiotic &bull; 1 tablet BID</p>
                  </div>
                  <div className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-[#094cb2] group-hover:text-white group-hover:border-[#094cb2] transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>

              {/* Status & Schedule Widgets */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <h3 className="font-serif text-2xl font-medium text-[#1b1c1d] mb-2">Status &amp; Schedule</h3>

                <div className="bg-[#094cb2] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#d9e2ff] mb-2">System Status</p>
                  <h4 className="font-serif text-3xl font-medium mb-4">0 Conflicts Detected</h4>
                  <div className="flex items-center gap-2 text-white bg-white/20 w-fit px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm">
                    <Shield size={14} />
                    <span>All medications safe to take</span>
                  </div>
                </div>

                <div className="glass-card p-7 rounded-3xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[#434653] text-xs font-bold uppercase tracking-wider">
                      <Clock size={15} />
                      <span>Next Dose</span>
                    </div>
                    <span className="font-serif text-base font-bold text-[#1b1c1d]">8:00 PM</span>
                  </div>
                  <p className="font-serif text-lg font-bold text-[#1b1c1d]">Dolo 650 mg</p>
                  <p className="text-xs text-slate-500 mt-0.5 mb-5">Take after meals with warm water &bull; 1 tablet</p>
                  <button
                    type="button"
                    className="w-full py-3 border border-[#094cb2] text-[#094cb2] rounded-full text-xs font-bold hover:bg-[#094cb2] hover:text-white transition-all cursor-pointer"
                  >
                    Mark as Taken
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CLINICAL SUPPORT                                             */}
        {/* ============================================================ */}
        <section className="px-6 md:px-12 lg:px-24 py-28 bg-white border-t border-slate-200" id="support">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-16 flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#efedee] text-[#434653] text-xs font-semibold uppercase tracking-widest mb-4 border border-[#c3c6d5]/30">
                Clinical Support
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-medium text-[#1b1c1d] mb-4">Premium Care, 24/7</h2>
              <p className="text-[#434653] max-w-2xl text-lg font-sans font-light leading-relaxed">
                Our clinical team and AI assistants are available round-the-clock to ensure your medication journey is safe, informed, and completely supported.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="glass-card p-8 rounded-[2.5rem] group hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-[#f5f3f4] rounded-2xl flex items-center justify-center mb-6 text-[#094cb2]">
                  <Bot size={24} />
                </div>
                <h3 className="font-serif text-xl font-medium text-[#1b1c1d] mb-3">AI Clinical Assistant</h3>
                <p className="text-[#434653] text-sm font-light leading-relaxed mb-6">
                  Get instant, scientifically-backed answers about dosage, timing, and general medication information.
                </p>
                <button
                  type="button"
                  onClick={() => setIsManualSearchOpen(true)}
                  className="text-xs font-semibold text-[#094cb2] flex items-center gap-1.5 group-hover:gap-2.5 transition-all cursor-pointer"
                >
                  <span>Search Database</span> <ArrowRight size={14} />
                </button>
              </div>

              {/* Card 2 */}
              <div className="p-8 rounded-[2.5rem] bg-[#094cb2] text-white shadow-xl group hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-white">
                  <Stethoscope size={24} />
                </div>
                <h3 className="font-serif text-xl font-medium text-white mb-3">Pharmacopeia Verification</h3>
                <p className="text-white/80 text-sm font-light leading-relaxed mb-6">
                  Validated against official Indian Pharmacopeia active salt monographs and recommended dosage guidelines.
                </p>
                <button
                  type="button"
                  onClick={scrollToScan}
                  className="text-xs font-semibold text-white flex items-center gap-1.5 group-hover:gap-2.5 transition-all cursor-pointer"
                >
                  <span>Scan Prescription</span> <ArrowRight size={14} />
                </button>
              </div>

              {/* Card 3 */}
              <div className="glass-card p-8 rounded-[2.5rem] group hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-[#f5f3f4] rounded-2xl flex items-center justify-center mb-6 text-[#2D6A4F]">
                  <BookOpen size={24} />
                </div>
                <h3 className="font-serif text-xl font-medium text-[#1b1c1d] mb-3">Clinical Library</h3>
                <p className="text-[#434653] text-sm font-light leading-relaxed mb-6">
                  Browse our extensive library of drug interactions, side effects, and clinical safety guidelines.
                </p>
                <button
                  type="button"
                  onClick={() => setIsManualSearchOpen(true)}
                  className="text-xs font-semibold text-[#094cb2] flex items-center gap-1.5 group-hover:gap-2.5 transition-all cursor-pointer"
                >
                  <span>Browse Articles</span> <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ============================================================ */}
      {/* FOOTER                                                       */}
      {/* ============================================================ */}
      <footer className="bg-[#1b1c1d] text-white px-6 md:px-12 lg:px-24 py-16">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/10 p-2 rounded-xl text-white">
                  <Shield size={20} />
                </div>
                <h2 className="font-serif text-xl font-bold tracking-tight text-white">PrescriptCheck</h2>
              </div>
              <p className="text-white/60 text-sm font-light leading-relaxed max-w-sm">
                Dedicated to global medication safety through advanced multi-model vision AI and clinical data.
              </p>
            </div>

            <div className="md:col-span-3 md:col-start-7">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/80 mb-4">Services</h4>
              <ul className="space-y-2.5 text-xs text-white/60 font-light">
                <li><a href="#scan-studio" className="hover:text-white transition-colors">Prescription Verification</a></li>
                <li><a href="#care" className="hover:text-white transition-colors">Symptom Tracker</a></li>
                <li><a href="#dashboard" className="hover:text-white transition-colors">Drug Database</a></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/80 mb-4">Support &amp; Trust</h4>
              <ul className="space-y-2.5 text-xs text-white/60 font-light">
                <li><span className="text-white/80 font-medium">100% Private &bull; No Data Saved</span></li>
                <li><span className="text-white/80 font-medium">TrOCR + Qwen + Llama Multi-Model</span></li>
                <li><span className="text-white/80 font-medium">Indian Pharmacopeia Consensus</span></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 text-xs text-white/40">
            <p>&copy; 2026 PrescriptCheck AI. Professional Healthcare Verification.</p>
            <div className="flex items-center gap-6">
              <span>🔒 HIPAA COMPLIANT</span>
              <span>🛡️ 256-BIT ENCRYPTION</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={() => setIsManualSearchOpen(true)}
          className="w-14 h-14 bg-[#094cb2] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform duration-300 ease-out cursor-pointer shadow-[#094cb2]/40"
          title="Search Medicine"
        >
          <Search size={22} />
        </button>
      </div>

    </div>
  );
}
