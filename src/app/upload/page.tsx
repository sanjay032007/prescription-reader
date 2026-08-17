"use client";

import { useState, useCallback, useMemo } from "react";
import BrandHeader from "@/components/prescription/BrandHeader";
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
import { ArrowLeft, RefreshCw, Info, Shield } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PrescriptionResult | null>(null);

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
      setError("Please upload or capture a prescription image first.");
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
      }, 150);
    } catch (err) {
      if (err instanceof GeminiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to read the prescription. Please upload a clearer photo.");
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
      "This prescription contains penicillin-based antibiotics. Inform your doctor if you have a known penicillin allergy."
    );
  }, [result]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <BrandHeader />

      <main className="flex-1 w-full py-8 sm:py-12">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Overview</span>
            </Link>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-[28px] sm:text-[34px] font-extrabold tracking-tight text-slate-950">
              Prescription Studio
            </h1>
            <p className="mt-2 text-[15px] text-slate-600 leading-relaxed max-w-xl">
              Upload a clear photo or scan your prescription using your camera. We&apos;ll extract the medicines, schedules, and clinical guidance.
            </p>
          </div>

          {/* Main Workspace Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-xs mb-8">
            
            {/* Step 1: Upload Zone */}
            <div className="mb-6">
              <UploadZone
                onFileSelected={handleFileSelected}
                fileName={file?.name}
                previewUrl={previewUrl}
                disabled={loading}
              />
            </div>

            {/* Step 2: Optional Symptoms Context */}
            <div className="mb-6">
              <SymptomsInput
                value={symptoms}
                onChange={setSymptoms}
                disabled={loading}
              />
            </div>

            {/* Error Banner with Quick Reset */}
            {error && (
              <div className="mb-6">
                <ErrorCard message={error} />
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0284c7] hover:text-[#0369a1] transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Try a different photo</span>
                </button>
              </div>
            )}

            {/* Step 3: Action Button */}
            <div>
              <AnalyseButton
                onClick={handleAnalyse}
                isLoading={loading}
                disabled={!file}
              />
            </div>

            {/* Quality Tips */}
            {!result && !loading && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  <Info size={13} />
                  <span>Tips for best accuracy</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[13px] text-slate-600">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    📸 <strong>Lighting:</strong> Ensure even light without strong glares or shadows.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    🔍 <strong>Framing:</strong> Capture the full prescription sheet flat in frame.
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    ✍️ <strong>Text:</strong> Printed prescriptions or clear handwriting yield best results.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Breakdown Section */}
          <ResultsSection
            result={result}
            allergyWarningMessage={allergyWarningMessage}
          />

          {/* Bottom Medical Disclaimer */}
          <div className="text-center mt-12 text-[12.5px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
            <Shield size={13} className="text-slate-400" />
            <span>Prescription Reader is for informational purposes only. Always follow the advice of your qualified medical provider.</span>
          </div>

        </div>
      </main>
    </div>
  );
}
