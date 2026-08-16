"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import BrandHeader from "@/components/prescription/BrandHeader";
import HeroSection from "@/components/prescription/HeroSection";
import HowItWorks from "@/components/prescription/HowItWorks";
import UploadZone from "@/components/prescription/UploadZone";
import SymptomsInput from "@/components/prescription/SymptomsInput";
import AnalyseButton from "@/components/prescription/AnalyseButton";
import ResultsSection from "@/components/prescription/ResultsSection";
import FeaturesSection from "@/components/prescription/FeaturesSection";
import PrivacySection from "@/components/prescription/PrivacySection";
import FaqSection from "@/components/prescription/FaqSection";
import Footer from "@/components/prescription/Footer";
import ErrorCard from "@/components/prescription/ErrorCard";
import {
  analysePrescription,
  toBase64,
  type PrescriptionResult,
  GeminiError,
} from "@/lib/gemini";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PrescriptionResult | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFileSelected = useCallback((selected: File) => {
    setFile(selected);
    setError(null);

    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
  }, []);

  const handleAnalyse = useCallback(async () => {
    if (!file) {
      setError("Please upload or select a prescription image first.");
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
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#4a90d9]/20">
      {/* Sticky Top Header */}
      <BrandHeader />

      <main className="flex-1 w-full">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. How It Works (3 Steps) */}
        <HowItWorks />

        {/* 3. Main Interaction: Upload Prescription Section */}
        <section
          id="upload-section"
          className="w-full py-16 sm:py-24 border-t border-slate-200/60 bg-gradient-to-b from-white/40 to-transparent"
        >
          <div className="max-w-[960px] mx-auto px-4 sm:px-8">
            <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
              <h2 className="text-[32px] sm:text-[42px] font-extrabold tracking-tight text-[#0a1628]">
                Upload your prescription
              </h2>
              <p className="mt-3 text-[16px] text-slate-500">
                Upload a clear photo of your handwritten or printed prescription.
              </p>
            </div>

            {/* Upload container */}
            <div className="bg-white/90 border border-slate-200/80 rounded-[32px] p-6 sm:p-12 shadow-[0_20px_60px_rgba(10,22,40,0.05)] backdrop-blur-md">
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
          </div>
        </section>

        {/* 4. Analysis Result / Breakdown Section */}
        <ResultsSection
          result={result}
          allergyWarningMessage={allergyWarningMessage}
        />

        {/* 5. Features Section ("What you'll get") */}
        <FeaturesSection />

        {/* 6. Privacy Section */}
        <PrivacySection />

        {/* 7. FAQ Section */}
        <FaqSection />
      </main>

      {/* 8. Footer */}
      <Footer />
    </div>
  );
}
