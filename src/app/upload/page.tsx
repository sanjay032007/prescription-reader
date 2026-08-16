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
import { ArrowLeft } from "lucide-react";
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
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
  }, []);

  const handleAnalyse = useCallback(async () => {
    if (!file) {
      setError("Please upload, scan, or select a prescription image first.");
      return;
    }

    setLoading(true);
    setError(null);

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
        setError("An unexpected error occurred while analyzing the prescription.");
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
    <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc]">
      <BrandHeader />

      <main className="flex-1 w-full pt-8 pb-16 sm:pb-24">
        <div className="max-w-[960px] mx-auto px-4 sm:px-8">
          {/* Back to Home Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-[#0284c7] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Page Header */}
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#0284c7] block mb-2">
              PRESCRIPTION STUDIO
            </span>
            <h1 className="text-[32px] sm:text-[42px] font-extrabold tracking-tight text-[#0a1628]">
              Scan &amp; Upload Studio
            </h1>
            <p className="mt-3 text-[16px] text-slate-500">
              Scan with your camera, upload a photo, or test with a sample prescription.
            </p>
          </div>

          {/* Upload Card Container */}
          <div className="bg-white/95 border border-slate-200/80 rounded-[32px] p-6 sm:p-12 shadow-[0_20px_60px_rgba(10,22,40,0.05)] backdrop-blur-md mb-12">
            <UploadZone
              onFileSelected={handleFileSelected}
              fileName={file?.name}
              previewUrl={previewUrl}
              disabled={loading}
            />

            <SymptomsInput
              value={symptoms}
              onChange={setSymptoms}
              disabled={loading}
            />

            {error && <ErrorCard message={error} />}

            <AnalyseButton
              onClick={handleAnalyse}
              isLoading={loading}
              disabled={!file}
            />
          </div>

          {/* Dynamic Analysis Breakdown Section */}
          <ResultsSection
            result={result}
            allergyWarningMessage={allergyWarningMessage}
          />

          {/* Clean Medical Disclaimer */}
          <div className="text-center mt-12 text-[12.5px] text-slate-400 font-medium">
            Prescription Reader · For general informational purposes only — always consult your physician or pharmacist.
          </div>
        </div>
      </main>
    </div>
  );
}
