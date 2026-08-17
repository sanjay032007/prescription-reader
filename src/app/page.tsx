"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import BrandHeader from "@/components/prescription/BrandHeader";
import Hero3DFallback from "@/components/prescription/Hero3DFallback";
import { ArrowRight, ShieldCheck, Clock, CheckCircle2, ScanLine, Sparkles } from "lucide-react";

const Hero3D = dynamic(() => import("@/components/prescription/Hero3D"), {
  ssr: false,
  loading: () => <Hero3DFallback />,
});

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc] relative overflow-hidden">
      {/* Top Ambient Glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] pointer-events-none opacity-60"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(2, 132, 199, 0.12) 0%, rgba(99, 102, 241, 0.04) 50%, transparent 80%)",
        }}
      />

      <BrandHeader />

      <main className="flex-1 w-full flex items-center py-8 sm:py-14 z-10">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column — Text & CTAs */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs text-[12.5px] font-semibold text-slate-700 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-pulse" />
                <span className="text-[#0284c7]">Clinical Intelligence</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 font-normal">Instant Pharmacopeia OCR</span>
              </div>

              {/* Headline */}
              <h1 className="text-[38px] sm:text-[50px] lg:text-[56px] font-extrabold tracking-tight text-slate-950 leading-[1.08] mb-5">
                Understand your prescription with clinical clarity.
              </h1>

              {/* Subtitle */}
              <p className="text-[16px] sm:text-[18px] text-slate-600 font-normal leading-relaxed max-w-[500px] mb-8">
                Upload or scan a photo of your doctor&apos;s handwritten prescription. 
                Get an instant, structured breakdown of active salts, daily dosage timelines, and essential safety warnings.
              </p>

              {/* Action Button Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
                <Link
                  href="/upload"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-[15px] font-semibold shadow-xs hover:shadow transition-all group cursor-pointer"
                >
                  <ScanLine size={17} className="text-sky-400 group-hover:scale-110 transition-transform" />
                  <span>Scan &amp; Upload Prescription</span>
                  <ArrowRight size={16} className="opacity-80 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[13px] font-medium text-slate-500 pt-2 border-t border-slate-200/60 w-full">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  100% Private &amp; Encrypted
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-[#0284c7]" />
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
              <div className="w-full max-w-[500px] bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 text-[12px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Interactive 3D Preview
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">Dr. Anita Sharma Rx</span>
                </div>

                <div className="w-full flex items-center justify-center">
                  <Hero3D />
                </div>

                <div className="pt-2 text-center text-[12px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
                  <Sparkles size={12} className="text-amber-500" />
                  <span>Move cursor or swipe to rotate in 3D space</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Minimal Bottom Footer Bar */}
      <footer className="w-full py-5 border-t border-slate-200/60 text-center text-[12px] text-slate-400 font-medium bg-white/50 backdrop-blur-xs z-10">
        Prescription Reader · Clinical information system · Always consult your physician for medical decisions
      </footer>
    </div>
  );
}
