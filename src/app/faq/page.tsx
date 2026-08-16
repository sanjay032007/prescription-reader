"use client";

import BrandHeader from "@/components/prescription/BrandHeader";
import Footer from "@/components/prescription/Footer";
import FaqSection from "@/components/prescription/FaqSection";
import Link from "next/link";
import { ArrowRight, ScanLine, ArrowLeft } from "lucide-react";

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc]">
      <BrandHeader />

      <main className="flex-1 w-full py-10 sm:py-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-500 hover:text-[#0284c7] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#0284c7] block mb-2">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h1 className="text-[32px] sm:text-[42px] font-extrabold tracking-tight text-[#0a1628]">
              Prescription Reader FAQ
            </h1>
            <p className="mt-3 text-[16px] text-slate-500">
              Answers to common questions regarding handwriting recognition, safety warnings, and privacy.
            </p>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200/80 p-6 sm:p-12 shadow-sm mb-12">
            <FaqSection />
          </div>

          <div className="text-center py-10">
            <Link
              href="/upload"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#4a90d9] to-[#6366f1] text-white text-[16px] font-bold shadow-lg hover:brightness-105 transition-all"
            >
              <ScanLine size={18} />
              <span>Start Analyzing Prescriptions</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
