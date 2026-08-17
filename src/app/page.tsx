"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import BrandHeader from "@/components/prescription/BrandHeader";
import Hero3DFallback from "@/components/prescription/Hero3DFallback";
import { ArrowRight, ShieldCheck, Clock, CheckCircle2, FileSearch, Sparkles, Activity } from "lucide-react";

const Hero3D = dynamic(() => import("@/components/prescription/Hero3D"), {
  ssr: false,
  loading: () => <Hero3DFallback />,
});

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <BrandHeader />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative w-full pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column — Content */}
              <div className="lg:col-span-6 flex flex-col items-start text-left">
                {/* Micro Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-[#0284c7] text-[12px] font-semibold mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
                  <span>Clinical Vision Intelligence</span>
                </div>

                {/* Primary Headline */}
                <h1 className="text-[38px] sm:text-[50px] lg:text-[56px] font-extrabold tracking-tight text-slate-950 leading-[1.08] mb-5">
                  Understand your prescription with clarity.
                </h1>

                {/* Subtitle */}
                <p className="text-[16px] sm:text-[18px] text-slate-600 font-normal leading-relaxed max-w-[500px] mb-8">
                  Upload a photo of your doctor&apos;s handwritten or printed prescription. 
                  Get an instant, structured breakdown of active salts, dosage timelines, and essential safety warnings.
                </p>

                {/* CTA Button Group */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
                  <Link
                    href="/upload"
                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-[15px] font-semibold shadow-sm hover:shadow transition-all"
                  >
                    <span>Upload Prescription</span>
                    <ArrowRight size={16} />
                  </Link>

                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 text-[14px] font-medium transition-all"
                  >
                    How it works
                  </a>
                </div>

                {/* Trust Points */}
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[13px] font-medium text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    Private &amp; Secure
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-sky-600" />
                    Zero Hallucinations
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={16} className="text-indigo-600" />
                    Instant Results
                  </span>
                </div>
              </div>

              {/* Right Column — 3D Interactive Canvas */}
              <div className="lg:col-span-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-[500px] bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm relative overflow-hidden">
                  {/* Top Bar Decoration */}
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 text-[12px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Activity size={13} className="text-[#0284c7]" />
                      Interactive 3D Preview
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">Dr. Anita Sharma Rx</span>
                  </div>

                  <div className="w-full flex items-center justify-center">
                    <Hero3D />
                  </div>

                  <div className="pt-2 text-center text-[12px] text-slate-400 font-medium">
                    Move your cursor or swipe to rotate the prescription
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section id="how-it-works" className="w-full py-16 sm:py-20 bg-white border-t border-slate-200/80">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-[12px] font-bold text-[#0284c7] uppercase tracking-wider block mb-2">
                Engineered for Reliability
              </span>
              <h2 className="text-[28px] sm:text-[34px] font-extrabold text-slate-950 tracking-tight">
                Designed to make medications easy to understand
              </h2>
              <p className="mt-3 text-[15px] text-slate-500 leading-relaxed">
                We combine optical vision models with clinical pharmacopeias to convert messy medical notes into clear, actionable advice.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0284c7] mb-4 shadow-2xs">
                  <FileSearch size={20} />
                </div>
                <h3 className="text-[16px] font-bold text-slate-900 mb-2">
                  Handwriting Decryption
                </h3>
                <p className="text-[14px] text-slate-600 leading-relaxed">
                  Deciphers doctor cursive, shorthand symbols (1-0-1, TDS, PC), and abbreviations with high precision.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 mb-4 shadow-2xs">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-[16px] font-bold text-slate-900 mb-2">
                  Safety &amp; Allergy Cross-Check
                </h3>
                <p className="text-[14px] text-slate-600 leading-relaxed">
                  Automatically flags antibiotic courses, penicillin-based sensitivities, and essential precautions.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-slate-300 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 mb-4 shadow-2xs">
                  <Clock size={20} />
                </div>
                <h3 className="text-[16px] font-bold text-slate-900 mb-2">
                  Daily Dosage Timelines
                </h3>
                <p className="text-[14px] text-slate-600 leading-relaxed">
                  Organizes each tablet into clear morning, afternoon, and night schedules with food requirements.
                </p>
              </div>
            </div>

            {/* Bottom Callout Banner */}
            <div className="mt-12 p-8 rounded-3xl bg-slate-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-[20px] font-bold tracking-tight">Ready to check your prescription?</h3>
                <p className="text-[14px] text-slate-400 mt-1">Upload a photo or use your camera to get started instantly.</p>
              </div>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-[14px] font-semibold transition-colors shrink-0"
              >
                <span>Try Prescription Studio</span>
                <ArrowRight size={15} />
              </Link>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
