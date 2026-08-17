"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import BrandHeader from "@/components/prescription/BrandHeader";
import Hero3DFallback from "@/components/prescription/Hero3DFallback";
import { ArrowRight } from "lucide-react";

const Hero3D = dynamic(() => import("@/components/prescription/Hero3D"), {
  ssr: false,
  loading: () => <Hero3DFallback />,
});

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <BrandHeader />

      <main className="flex-1 w-full flex items-center">
        <section className="w-full py-16 sm:py-24">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Column */}
              <div className="flex flex-col items-start">
                <h1 className="text-[36px] sm:text-[48px] lg:text-[56px] font-bold leading-[1.1] tracking-tight text-[#0a1628] mb-5">
                  Understand your
                  <br />
                  prescription,
                  <br />
                  <span className="text-[#0284c7]">instantly.</span>
                </h1>

                <p className="text-[16px] sm:text-[18px] text-slate-500 leading-relaxed max-w-[480px] mb-8">
                  Upload a photo of your doctor&apos;s handwritten prescription
                  and get a clear breakdown of every medicine, dosage, and
                  safety warning.
                </p>

                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#0a1628] text-white text-[15px] font-semibold hover:bg-[#1a2d4a] transition-colors"
                >
                  <span>Upload prescription</span>
                  <ArrowRight size={16} />
                </Link>

                <div className="mt-8 flex items-center gap-6 text-[13px] text-slate-400">
                  <span>Private &amp; encrypted</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>No data stored</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>Instant results</span>
                </div>
              </div>

              {/* Right Column: 3D */}
              <div className="flex flex-col items-center justify-center">
                <Hero3D />
                <p className="mt-3 text-[12px] text-slate-400">
                  Move cursor to interact
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
