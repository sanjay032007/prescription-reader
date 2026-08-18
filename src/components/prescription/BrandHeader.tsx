"use client";

import Link from "next/link";
import { Search, Sparkles, Shield, Pill } from "lucide-react";

interface BrandHeaderProps {
  onOpenLookup?: () => void;
}

export default function BrandHeader({ onOpenLookup }: BrandHeaderProps) {
  return (
    <header className="w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 transition-all">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#2563eb] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-all">
            <span className="font-serif font-bold text-[20px] italic leading-none">
              ℞
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[17px] sm:text-[18px] text-slate-900 tracking-tight leading-none">
                Prescription Reader
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-sky-50 text-[#0284c7] border border-sky-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-pulse" />
                Multi-Model AI
              </span>
            </div>
            <span className="text-[11px] sm:text-[11.5px] font-medium text-slate-500 mt-0.5">
              Indian Clinical Pharmacopeia Verified
            </span>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {onOpenLookup && (
            <button
              type="button"
              onClick={onOpenLookup}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-[12.5px] sm:text-[13px] font-bold text-slate-700 transition-all shadow-2xs cursor-pointer"
            >
              <Search size={14} className="text-[#0284c7]" />
              <span className="hidden sm:inline">Search Indian Medicines</span>
              <span className="sm:hidden">Lookup</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
