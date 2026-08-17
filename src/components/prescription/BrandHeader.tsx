"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function BrandHeader() {
  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-50 transition-all">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0c1e3d] to-[#162a4d] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-all">
            <span className="font-serif font-bold text-[20px] italic leading-none tracking-tight">
              ℞
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-serif-heading text-[19px] font-extrabold text-slate-950 tracking-tight leading-tight">
                Prescription Reader
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-[#0284c7] border border-sky-100 uppercase tracking-wide">
                AI Verified
              </span>
            </div>
            <span className="text-[12px] font-medium text-slate-500 tracking-normal mt-0.5">
              Read &bull; Organize &bull; Verify
            </span>
          </div>
        </Link>

        {/* Right Navigation / Action Button */}
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="text-[14px] font-semibold text-slate-600 hover:text-slate-950 transition-colors hidden sm:inline-block"
          >
            Home
          </Link>
          
          <Link
            href="/#studio-section"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c1e3d] hover:bg-[#162a4d] text-white text-[13.5px] font-semibold transition-all shadow-xs hover:shadow-sm group cursor-pointer"
          >
            <span>Scan Prescription</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>
    </header>
  );
}
