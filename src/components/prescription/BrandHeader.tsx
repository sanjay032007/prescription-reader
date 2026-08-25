"use client";

import Link from "next/link";
import { Search, Shield, Heart } from "lucide-react";

interface BrandHeaderProps {
  onOpenLookup?: () => void;
}

export default function BrandHeader({ onOpenLookup }: BrandHeaderProps) {
  return (
    <header className="glass-header flex items-center justify-between px-4 sm:px-8 md:px-14 lg:px-20 py-4 sticky top-0 z-50 transition-all">
      <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#094cb2]/10 text-[#094cb2] flex items-center justify-center shadow-xs group-hover:scale-105 transition-all border border-[#094cb2]/15 relative">
            <Shield size={22} className="text-[#094cb2]" />
            <Heart size={10} className="text-[#094cb2] fill-[#094cb2] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-[19px] sm:text-[21px] font-bold tracking-tight text-[#1b1c1d] leading-none">
              PrescriptCheck
            </span>
            <span className="text-[11px] font-sans font-medium text-slate-500 mt-0.5">
              Prescription Reader
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-sans font-medium text-slate-600">
          <a href="#how-it-works" className="hover:text-[#094cb2] transition-colors">
            How it Works
          </a>
          <a href="#care" className="hover:text-[#094cb2] transition-colors">
            Symptom Journal
          </a>
          <a href="#dashboard" className="hover:text-[#094cb2] transition-colors">
            Dashboard
          </a>
        </nav>

        {/* Right Search Button */}
        <div className="flex items-center gap-3">
          {onOpenLookup && (
            <button
              type="button"
              onClick={onOpenLookup}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#094cb2]/20 bg-white hover:bg-[#faf9fa] text-[13px] font-semibold text-[#094cb2] transition-all shadow-xs cursor-pointer"
            >
              <Search size={14} className="text-[#094cb2]" />
              <span className="hidden sm:inline">Search Indian Medicines</span>
              <span className="sm:hidden">Lookup</span>
            </button>
          )}

          <a
            href="#scan"
            className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#094cb2] hover:bg-[#002e7a] text-white text-[13px] font-semibold transition-all shadow-md shadow-[#094cb2]/20 cursor-pointer"
          >
            Start Scan
          </a>
        </div>

      </div>
    </header>
  );
}
