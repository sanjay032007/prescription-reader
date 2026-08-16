"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import BrandHeader from "@/components/prescription/BrandHeader";
import Hero3DFallback from "@/components/prescription/Hero3DFallback";
import { ArrowRight, ShieldCheck, Zap, Lock, ScanLine } from "lucide-react";

const Hero3D = dynamic(() => import("@/components/prescription/Hero3D"), {
  ssr: false,
  loading: () => <Hero3DFallback />,
});

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#0284c7]/20 bg-[#f8fafc]">
      <BrandHeader />

      <main className="flex-1 w-full flex items-center">
        {/* Hero Section */}
        <section className="relative w-full py-12 sm:py-20 lg:py-24 overflow-hidden">
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

                <h1 className="text-[40px] xs:text-[50px] sm:text-[64px] lg:text-[78px] font-extrabold leading-[1.04] tracking-[-0.04em] text-[#0a1628] mb-6">
                  Understand your
                  <br />
                  prescription
                  <br />
                  <span className="bg-gradient-to-r from-[#0284c7] via-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
                    instantly
                  </span>
                </h1>

                <p className="text-[17px] sm:text-[20px] font-normal leading-relaxed text-slate-600 max-w-[540px] mb-8">
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
                </div>

                {/* Compact Trust Badges */}
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                  <div className="inline-flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <ShieldCheck size={16} className="text-[#0284c7] shrink-0" />
                    <span className="text-[12px] sm:text-[13px] font-semibold text-slate-700">
                      100% Private
                    </span>
                  </div>

                  <div className="inline-flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <Zap size={16} className="text-[#6366f1] shrink-0" />
                    <span className="text-[12px] sm:text-[13px] font-semibold text-slate-700">
                      Instant OCR
                    </span>
                  </div>

                  <div className="inline-flex items-center justify-center sm:justify-start gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
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
      </main>
    </div>
  );
}
