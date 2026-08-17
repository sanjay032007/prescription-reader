"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import BrandHeader from "@/components/prescription/BrandHeader";
import DeskClipboardVisual from "@/components/prescription/DeskClipboardVisual";
import UploadZone from "@/components/prescription/UploadZone";
import SymptomsInput from "@/components/prescription/SymptomsInput";
import AnalyseButton from "@/components/prescription/AnalyseButton";
import ResultsSection from "@/components/prescription/ResultsSection";
import ErrorCard from "@/components/prescription/ErrorCard";
import {
  analysePrescription,
  toBase64,
  type PrescriptionResult,
  GeminiError,
} from "@/lib/gemini";
import {
  Upload,
  Lock,
  Shield,
  Zap,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PrescriptionResult | null>(null);

  const studioRef = useRef<HTMLDivElement>(null);

  const scrollToStudio = () => {
    studioRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileSelected = useCallback((selected: File) => {
    setFile(selected);
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
  }, []);

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
      const data = await analysePrescription(base64, mimeType, symptoms);
      setResult(data);

      setTimeout(() => {
        const el = document.getElementById("results-breakdown");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err) {
      if (err instanceof GeminiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to read prescription. Please upload a clear photo.");
      }
    } finally {
      setLoading(false);
    }
  }, [file, symptoms]);

  const allergyWarningMessage = useMemo(() => {
    if (!result) return null;
    const penMed = result.medicines.find(
      (m) => m.isPenicillinBased || m.allergyWarning
    );
    if (!penMed) return null;
    return (
      penMed.allergyWarning ||
      "This prescription contains penicillin-based antibiotics. Inform your doctor if you have an allergy."
    );
  }, [result]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfdfd]">
      <BrandHeader />

      {/* ============================================================ */}
      {/* 1. TOP HERO BANNER (Warm Wooden Desk Surface Background)     */}
      {/* ============================================================ */}
      <section className="w-full desk-surface border-b border-[#e5ded4] py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#eaf4fd] text-[#0284c7] text-[11px] font-extrabold uppercase tracking-widest mb-6">
                <span>Clinical Intelligence</span>
              </div>

              {/* Serif Headline matching reference */}
              <h1 className="font-serif-heading text-[42px] sm:text-[54px] lg:text-[62px] font-extrabold text-slate-950 tracking-tight leading-[1.08] mb-5">
                Make your<br />
                prescription<br />
                easier to read.
              </h1>

              {/* Subtitle */}
              <p className="text-[16px] sm:text-[17px] text-slate-600 font-normal leading-relaxed max-w-[480px] mb-8">
                Upload a photo of your doctor&apos;s prescription. We&apos;ll organize the medicines, strengths and instructions into a clearer format.
              </p>

              {/* Upload Prescription Button */}
              <button
                type="button"
                onClick={scrollToStudio}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-[#0c1e3d] hover:bg-[#162a4d] text-white text-[15px] font-semibold transition-all shadow-sm cursor-pointer mb-6"
              >
                <Upload size={17} />
                <span>Upload Prescription</span>
              </button>

              {/* Specs & Privacy Note */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[13px] text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <Lock size={13} className="text-slate-400" />
                  Private processing
                </span>
                <span className="text-slate-300">&bull;</span>
                <span>JPG, PNG, WEBP</span>
                <span className="text-slate-300">&bull;</span>
                <span>Up to 10 MB</span>
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
      <section id="studio-section" ref={studioRef} className="w-full py-12 sm:py-16 bg-[#fcfdfd]">
        <div className="max-w-[1360px] mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Upload Studio Box */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="mb-4">
                <span className="text-[11.5px] font-extrabold uppercase tracking-widest text-[#0284c7] block mb-1">
                  Prescription Studio
                </span>
                <h2 className="font-serif-heading text-[26px] sm:text-[30px] font-extrabold text-slate-950 tracking-tight">
                  Upload Prescription
                </h2>
                <p className="text-[14.5px] text-slate-500 mt-1">
                  Upload a clear photo of your prescription.
                </p>
              </div>

              {/* Dashed Dropzone */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-2xs">
                <UploadZone
                  onFileSelected={handleFileSelected}
                  fileName={file?.name}
                  previewUrl={previewUrl}
                  disabled={loading}
                />

                {/* Optional Symptoms Bar */}
                {file && (
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <SymptomsInput
                      value={symptoms}
                      onChange={setSymptoms}
                      disabled={loading}
                    />
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="mt-4">
                    <ErrorCard message={error} />
                    <button
                      type="button"
                      onClick={handleReset}
                      className="mt-2 text-[12.5px] font-semibold text-[#0284c7] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={12} />
                      <span>Try another photo</span>
                    </button>
                  </div>
                )}

                {/* Analyse Action Button */}
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
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-2xs">
                
                {/* Shield Icon Badge */}
                <div className="w-12 h-12 rounded-full bg-[#f0f7fe] flex items-center justify-center text-[#0284c7] mb-4">
                  <Shield size={22} />
                </div>

                {/* Heading */}
                <h3 className="text-[17px] font-bold text-slate-950 mb-2">
                  Your data is safe
                </h3>

                {/* Description */}
                <p className="text-[13.5px] text-slate-600 leading-relaxed mb-6">
                  We don&apos;t store your images or data. Everything is processed securely and privately.
                </p>

                {/* Bullet Points */}
                <div className="space-y-4 pt-5 border-t border-slate-100 text-[13.5px] font-medium text-slate-700">
                  <div className="flex items-center gap-3">
                    <Lock size={16} className="text-[#0284c7] shrink-0" />
                    <span>100% Private &amp; Encrypted</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-[#0284c7] shrink-0" />
                    <span>No Data Stored</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Zap size={16} className="text-[#0284c7] shrink-0" />
                    <span>Instant Results</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* 3. MULTI-LAYER VERIFIED RESULTS BREAKDOWN                    */}
          {/* ============================================================ */}
          <div className="mt-6">
            <ResultsSection
              result={result}
              allergyWarningMessage={allergyWarningMessage}
            />
          </div>

        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="w-full py-6 border-t border-slate-200/70 text-center text-[12px] text-slate-400 font-medium bg-white">
        Prescription Reader &bull; Clinical information system &bull; Always follow the advice of your qualified medical provider
      </footer>
    </div>
  );
}
