"use client";

import { useState } from "react";

export default function BrandHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/85 border-b border-slate-200/60 transition-colors">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Left: Logo + Subtitle */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284c7] via-[#6366f1] to-[#a855f7] p-[1px] shadow-xs">
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
              AI-Powered Prescription Analysis
            </span>
          </div>
        </a>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-[14px] font-semibold text-slate-600">
          <a href="#" className="hover:text-[#0284c7] transition-colors">
            Home
          </a>
          <a href="#how-it-works" className="hover:text-[#0284c7] transition-colors">
            How It Works
          </a>
          <a href="#upload-section" className="hover:text-[#0284c7] transition-colors">
            Upload
          </a>
          <a href="#features" className="hover:text-[#0284c7] transition-colors">
            Features
          </a>
          <a href="#faq" className="hover:text-[#0284c7] transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right Side Pill Badge */}
        <div className="hidden sm:flex items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-semibold bg-slate-50 border border-slate-200/80 text-[#0a1628] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>100% Private &amp; Secure</span>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-700"
          aria-label="Open menu"
        >
          <i className={`ti ${mobileMenuOpen ? "ti-x" : "ti-menu-2"} text-2xl`} />
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 py-4 bg-white/95 backdrop-blur-lg border-b border-slate-200 space-y-3">
          <nav className="flex flex-col gap-3 text-[15px] font-medium text-slate-700">
            <a
              href="#"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#0284c7]"
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#0284c7]"
            >
              How It Works
            </a>
            <a
              href="#upload-section"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#0284c7]"
            >
              Upload
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#0284c7]"
            >
              Features
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#0284c7]"
            >
              FAQ
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
