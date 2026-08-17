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
import { ArrowLeft, RefreshCw } from "lucide-react";
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
      setError("Please upload a prescription image first.");
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
        setError("Something went wrong. Please try again with a clearer photo.");
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
    <div className="min-h-screen flex flex-col bg-white">
      <BrandHeader />

      <main className="flex-1 w-full">
        <div className="max-w-[720px] mx-auto px-5 sm:px-8 pt-6 pb-20">
          {/* Breadcrumb */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-700 transition-colors mb-8"
          >
            <ArrowLeft size={13} />
            <span>Home</span>
          </Link>

          {/* Page Title — left aligned, no subtitle label */}
          <div className="mb-8">
            <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[#0a1628] leading-tight">
              Upload prescription
            </h1>
            <p className="mt-2 text-[15px] text-slate-500 leading-relaxed max-w-md">
              Take a clear photo of your prescription in good lighting.
              We&apos;ll identify the medicines and explain each one.
            </p>
          </div>

          {/* Upload Card */}
          <div className="border border-slate-200 rounded-2xl bg-white p-5 sm:p-8 mb-6">
            <UploadZone
              onFileSelected={handleFileSelected}
              fileName={file?.name}
              previewUrl={previewUrl}
              disabled={loading}
            />

            <div className="mt-5">
              <SymptomsInput
                value={symptoms}
                onChange={setSymptoms}
                disabled={loading}
              />
            </div>

            {/* Error with retry guidance */}
            {error && (
              <div className="mt-5">
                <ErrorCard message={error} />
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold text-[#0284c7] hover:text-[#0369a1] cursor-pointer transition-colors"
                >
                  <RefreshCw size={13} />
                  <span>Upload a different image</span>
                </button>
              </div>
            )}

            <div className="mt-5">
              <AnalyseButton
                onClick={handleAnalyse}
                isLoading={loading}
                disabled={!file}
              />
            </div>

            {/* Tips for better results */}
            {!result && !loading && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Tips for accurate results
                </p>
                <ul className="text-[13px] text-slate-500 space-y-1 list-none">
                  <li>📸 Use good, even lighting — avoid shadows on the paper</li>
                  <li>🔍 Make sure the entire prescription is visible and in focus</li>
                  <li>📋 Printed prescriptions work best; clear handwriting also works</li>
                </ul>
              </div>
            )}
          </div>

          {/* Results */}
          <ResultsSection
            result={result}
            allergyWarningMessage={allergyWarningMessage}
          />

          {/* Minimal disclaimer */}
          <p className="text-center mt-16 text-[12px] text-slate-400">
            For general information only — always consult your doctor.
          </p>
        </div>
      </main>
    </div>
  );
}
