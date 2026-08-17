"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function BrandHeader() {
  return (
    <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-[1360px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-lg bg-[#0c1e3d] flex items-center justify-center text-white shadow-xs group-hover:bg-[#162a4d] transition-colors">
            <span className="font-serif font-bold text-[20px] italic leading-none tracking-tight">
              ℞
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif-heading text-[19px] font-bold text-slate-950 tracking-tight leading-tight">
              Prescription Reader
            </span>
            <span className="text-[12px] font-medium text-slate-500 tracking-normal mt-0.5">
              Read &bull; Organize &bull; Verify
            </span>
          </div>
        </Link>

        {/* Right Navigation */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-[14.5px] font-medium text-slate-600 hover:text-slate-950 transition-colors hidden sm:inline-block"
          >
            Overview
          </Link>
          
          <Link
            href="/#studio-section"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0c1e3d] hover:bg-[#162a4d] text-white text-[14px] font-semibold transition-all shadow-xs"
          >
            <span>Scan Prescription</span>
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </header>
  );
}
