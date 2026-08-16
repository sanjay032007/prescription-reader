'use client';

import dynamic from 'next/dynamic';
import Hero3DFallback from './Hero3DFallback';
import { ArrowRight, ShieldCheck, Zap, Lock } from 'lucide-react';

const Hero3D = dynamic(() => import('./Hero3D'), {
  ssr: false,
  loading: () => <Hero3DFallback />,
});

export default function HeroSection() {
  const scrollToUpload = () => {
    const el = document.getElementById('upload-section');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative w-full pt-10 sm:pt-18 pb-16 sm:pb-24 overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
            {/* Outlined label pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#0284c7]/30 bg-[#0284c7]/5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-ping" />
              <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#0284c7]">
                AI CLINICAL PRESCRIPTION INTELLIGENCE
              </span>
            </div>

            {/* Large editorial headline */}
            <h1 className="text-[46px] sm:text-[66px] lg:text-[78px] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#0a1628] mb-6">
              Understand your
              <br />
              prescription
              <br />
              <span className="bg-gradient-to-r from-[#0284c7] via-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
                instantly
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-[17px] sm:text-[19px] font-normal leading-[1.65] text-slate-600 max-w-[540px] mb-8">
              Upload a photo of your doctor&apos;s prescription and get a clear,
              plain-English explanation of every medicine, dosage schedule, timing,
              and safety warning in seconds.
            </p>

            {/* CTA Button Row */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                type="button"
                onClick={scrollToUpload}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#4a90d9] to-[#6366f1] text-white text-[16px] font-bold shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <span>Analyse Your Prescription</span>
                <ArrowRight size={18} />
              </button>

              <div className="text-[13px] font-medium text-slate-500 flex items-center gap-2">
                <span className="text-emerald-500 font-bold">✓ Free to use</span>
                <span>·</span>
                <span>No sign-up required</span>
              </div>
            </div>

            {/* Three Compact Trust Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
                <ShieldCheck size={16} className="text-[#0284c7]" />
                <span className="text-[13px] font-semibold text-slate-700">
                  100% Private
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
                <Zap size={16} className="text-[#6366f1]" />
                <span className="text-[13px] font-semibold text-slate-700">
                  Fast &amp; Accurate
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs">
                <Lock size={16} className="text-[#a855f7]" />
                <span className="text-[13px] font-semibold text-slate-700">
                  No Data Stored
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Medical Prescription Visual (5 cols on lg) */}
          <div className="lg:col-span-5 relative flex flex-col justify-center items-center">
            {/* Soft circular lavender/blue glow backdrop */}
            <div
              className="absolute w-[360px] sm:w-[500px] h-[360px] sm:h-[500px] rounded-full pointer-events-none opacity-85"
              style={{
                background:
                  "radial-gradient(circle, rgba(2, 132, 199, 0.16) 0%, rgba(99, 102, 241, 0.12) 45%, rgba(243, 232, 255, 0) 70%)",
                filter: "blur(50px)",
              }}
            />

            {/* 3D WebGL Canvas Component */}
            <Hero3D />

            {/* Interactive 3D Discovery Pill */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-slate-200 text-[11.5px] font-semibold text-slate-500 shadow-2xs">
              <span>✦ Move cursor to inspect in 3D</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
