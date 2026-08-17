"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import BrandHeader from "@/components/prescription/BrandHeader";
import Hero3DFallback from "@/components/prescription/Hero3DFallback";
import { ArrowRight, ShieldCheck, Clock, CheckCircle2, ScanLine } from "lucide-react";

const Hero3D = dynamic(() => import("@/components/prescription/Hero3D"), {
  ssr: false,
  loading: () => <Hero3DFallback />,
});

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc]">
      <BrandHeader />

      <main className="flex-1 w-full flex items-center py-10 sm:py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* Left Column — Content */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-[#0284c7] text-[12px] font-semibold mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
                <span>Clinical Vision Intelligence</span>
              </div>

              {/* Headline */}
              <h1 className="text-[40px] sm:text-[52px] lg:text-[58px] font-extrabold tracking-tight text-slate-950 leading-[1.06] mb-5">
                Understand your prescription with clarity.
              </h1>

              {/* Subtitle */}
              <p className="text-[16px] sm:text-[18px] text-slate-600 font-normal leading-relaxed max-w-[480px] mb-8">
                Upload or scan your doctor&apos;s handwritten or printed prescription. 
                Get an instant, structured breakdown of active drug salts, dosage schedules, and essential safety warnings.
              </p>

              {/* CTA Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
                <Link
                  href="/upload"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-[15px] font-semibold shadow-xs hover:shadow transition-all"
                >
                  <ScanLine size={16} />
                  <span>Scan &amp; Upload Prescription</span>
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-[13px] font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  100% Private
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-sky-600" />
                  Zero Hallucinations
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={16} className="text-indigo-600" />
                  Instant Extraction
                </span>
              </div>
            </div>

            {/* Right Column — 3D Interactive Canvas */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <div className="w-full max-w-[500px] bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 text-[12px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Interactive 3D View
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">Dr. Anita Sharma Rx</span>
                </div>

                <div className="w-full flex items-center justify-center">
                  <Hero3D />
                </div>

                <div className="pt-2 text-center text-[12px] text-slate-400 font-medium">
                  Move cursor or swipe to rotate in 3D
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Minimal Footer Notice */}
      <footer className="w-full py-6 border-t border-slate-200/60 text-center text-[12px] text-slate-400 font-medium">
        Prescription Reader · Clinical information tool · Consult your prescribing doctor for medical advice
      </footer>
    </div>
  );
}
