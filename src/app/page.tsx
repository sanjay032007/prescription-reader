"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import BrandHeader from "@/components/prescription/BrandHeader";
import Footer from "@/components/prescription/Footer";
import Hero3DFallback from "@/components/prescription/Hero3DFallback";
import { ArrowRight, ShieldCheck, Zap, Lock, ScanLine, FileText, Activity } from "lucide-react";

const Hero3D = dynamic(() => import("@/components/prescription/Hero3D"), {
  ssr: false,
  loading: () => <Hero3DFallback />,
});

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#0284c7]/20 bg-[#f8fafc]">
      <BrandHeader />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative w-full pt-8 sm:pt-16 pb-16 sm:pb-24 overflow-hidden">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#0284c7]/30 bg-[#0284c7]/5 mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-ping" />
                  <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#0284c7]">
                    CLINICAL AI VISION &amp; PHARMACOPEIA ENGINE
                  </span>
                </div>

                <h1 className="text-[38px] xs:text-[48px] sm:text-[62px] lg:text-[76px] font-extrabold leading-[1.04] tracking-[-0.04em] text-[#0a1628] mb-6">
                  Understand your
                  <br />
                  prescription
                  <br />
                  <span className="bg-gradient-to-r from-[#0284c7] via-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
                    instantly
                  </span>
                </h1>

                <p className="text-[16px] sm:text-[19px] font-normal leading-relaxed text-slate-600 max-w-[540px] mb-8">
                  Upload or scan a photo of your doctor&apos;s handwritten prescription
                  for a clear, plain-English breakdown of every tablet, timing schedule,
                  and safety alert in seconds.
                </p>

                {/* Primary Action Button Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
                  <Link
                    href="/upload"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#4a90d9] to-[#6366f1] text-white text-[16px] font-bold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    <ScanLine size={18} />
                    <span>Upload &amp; Scan Prescription</span>
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    href="/how-it-works"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-[#0284c7] hover:border-[#0284c7]/40 text-[15px] font-semibold shadow-2xs transition-all"
                  >
                    <span>How It Works</span>
                  </Link>
                </div>

                {/* Compact Trust Badges */}
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                  <div className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <ShieldCheck size={16} className="text-[#0284c7] shrink-0" />
                    <span className="text-[12px] sm:text-[13px] font-semibold text-slate-700">
                      100% Private
                    </span>
                  </div>

                  <div className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <Zap size={16} className="text-[#6366f1] shrink-0" />
                    <span className="text-[12px] sm:text-[13px] font-semibold text-slate-700">
                      Instant OCR
                    </span>
                  </div>

                  <div className="inline-flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <Lock size={16} className="text-[#a855f7] shrink-0" />
                    <span className="text-[12px] sm:text-[13px] font-semibold text-slate-700">
                      Zero Storage
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: 3D Interactive Medical Prescription Canvas */}
              <div className="lg:col-span-5 relative flex flex-col justify-center items-center">
                <div
                  className="absolute w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full pointer-events-none opacity-85"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(2, 132, 199, 0.18) 0%, rgba(99, 102, 241, 0.12) 45%, rgba(243, 232, 255, 0) 70%)",
                    filter: "blur(50px)",
                  }}
                />

                <Hero3D />

                <div className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 border border-slate-200 text-[11.5px] font-semibold text-slate-500 shadow-2xs">
                  <span>✦ Move cursor / swipe to inspect in 3D</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="w-full py-16 sm:py-20 border-t border-slate-200/80 bg-white">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#0284c7] block mb-2">
                  CLINICAL FEATURES
                </span>
                <h2 className="text-[28px] sm:text-[36px] font-extrabold tracking-tight text-[#0a1628]">
                  Built for patient clarity and safety
                </h2>
              </div>
              <Link
                href="/features"
                className="text-[14px] font-bold text-[#0284c7] hover:text-[#0369a1] inline-flex items-center gap-1 self-start md:self-auto"
              >
                <span>View all features</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                href="/features"
                className="group p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-[#0284c7]/40 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#0284c7] flex items-center justify-center mb-5">
                  <FileText size={24} />
                </div>
                <h3 className="text-[18px] font-bold text-[#0a1628] mb-2 group-hover:text-[#0284c7] transition-colors">
                  Doctor Handwriting Deciphering
                </h3>
                <p className="text-[14px] text-slate-500 leading-relaxed">
                  Trained on diverse doctor handwriting styles to extract exact brand
                  names, active generic salts, and medical Latin shorthands.
                </p>
              </Link>

              <Link
                href="/features"
                className="group p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-[#0284c7]/40 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-[#6366f1] flex items-center justify-center mb-5">
                  <Activity size={24} />
                </div>
                <h3 className="text-[18px] font-bold text-[#0a1628] mb-2 group-hover:text-[#6366f1] transition-colors">
                  Daily Dosage Schedule Timeline
                </h3>
                <p className="text-[14px] text-slate-500 leading-relaxed">
                  Translates 1-1-1, 1-0-1, and TDS notation into intuitive Morning,
                  Afternoon, and Night schedules with meal timings.
                </p>
              </Link>

              <Link
                href="/features"
                className="group p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-[#0284c7]/40 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-[18px] font-bold text-[#0a1628] mb-2 group-hover:text-amber-600 transition-colors">
                  Safety &amp; Penicillin Allergy Alerts
                </h3>
                <p className="text-[14px] text-slate-500 leading-relaxed">
                  Automatically flags antibiotics, cross-checks FDA drug labeling,
                  and provides antibiotic course completion guidance.
                </p>
              </Link>
            </div>
          </div>
        </section>

        {/* Action Callout Banner */}
        <section className="w-full py-16 sm:py-20 border-t border-slate-200/80 bg-gradient-to-br from-slate-900 via-[#0a1628] to-slate-900 text-white">
          <div className="max-w-[960px] mx-auto px-4 sm:px-8 text-center flex flex-col items-center">
            <h2 className="text-[30px] sm:text-[40px] font-extrabold tracking-tight mb-4">
              Ready to decipher your prescription?
            </h2>
            <p className="text-[16px] sm:text-[18px] text-slate-300 max-w-xl mb-8 leading-relaxed">
              Upload an image or use your device camera to scan handwritten notes
              and get immediate plain-English explanations.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#4a90d9] to-[#6366f1] text-white text-[16px] font-bold shadow-xl hover:brightness-110 transition-all"
            >
              <ScanLine size={18} />
              <span>Go to Prescription Scanner</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
