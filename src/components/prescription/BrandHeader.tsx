"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ScanLine } from "lucide-react";

export default function BrandHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 border-b border-slate-200/80 transition-colors">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Left: Brand Logo & Wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284c7] via-[#6366f1] to-[#a855f7] p-[1px] shadow-xs group-hover:shadow-sm transition-shadow">
            <div className="w-full h-full bg-white rounded-[11px] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-[#0284c7]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[17px] font-extrabold tracking-tight text-[#0a1628] leading-tight">
              Prescription Reader
            </span>
            <span className="text-[11px] font-medium text-slate-500 tracking-wide">
              Clinical AI Vision
            </span>
          </div>
        </Link>

        {/* Center/Right Nav Links */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className={`text-[14px] font-semibold transition-colors ${
              pathname === "/"
                ? "text-[#0284c7] font-bold"
                : "text-slate-600 hover:text-[#0284c7]"
            }`}
          >
            Home
          </Link>

          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284c7] via-[#4a90d9] to-[#6366f1] text-white text-[13.5px] font-bold shadow-xs hover:shadow-md hover:brightness-105 transition-all"
          >
            <ScanLine size={14} />
            <span>Scan / Upload</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </header>
  );
}
