"use client";

import Link from "next/link";
import { Search, Shield, Sparkles } from "lucide-react";

interface BrandHeaderProps {
  onOpenLookup?: () => void;
}

export default function BrandHeader({ onOpenLookup }: BrandHeaderProps) {
  return (
    <header className="w-full glass-nav border-b border-slate-200/80 sticky top-0 z-50 transition-all">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#0D5C63]/10 text-[#0D5C63] flex items-center justify-center shadow-xs group-hover:scale-105 transition-all border border-[#0D5C63]/15">
            <Shield size={22} className="text-[#0D5C63] fill-[#0D5C63]/15" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[18px] sm:text-[20px] text-[#004B49] tracking-tight leading-none">
                Prescription Reader
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-[#2D6A4F]/10 text-[#2D6A4F] border border-[#2D6A4F]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] animate-pulse" />
                AI Active
              </span>
            </div>
            <span className="text-[11.5px] font-medium text-slate-500 mt-0.5">
              Pharmaceutical Grade Verification
            </span>
          </div>
        </Link>

        {/* Right Search Button */}
        <div className="flex items-center gap-3">
          {onOpenLookup && (
            <button
              type="button"
              onClick={onOpenLookup}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full border border-[#0D5C63]/20 bg-white hover:bg-[#F9F6F0] text-[13px] font-bold text-[#004B49] transition-all shadow-xs cursor-pointer"
            >
              <Search size={14} className="text-[#0D5C63]" />
              <span className="hidden sm:inline">Search Indian Medicines</span>
              <span className="sm:hidden">Lookup</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
