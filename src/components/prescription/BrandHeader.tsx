"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X, ShieldCheck } from "lucide-react";

export default function BrandHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Upload & Scan", href: "/upload" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Features", href: "/features" },
    { name: "FAQ", href: "/faq" },
    { name: "Privacy", href: "/privacy" },
  ];

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

        {/* Center: Dedicated Route Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-[14px] font-semibold">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1 relative ${
                  isActive
                    ? "text-[#0284c7] font-bold"
                    : "text-slate-600 hover:text-[#0284c7]"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0284c7] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Primary Action Button */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284c7] via-[#4a90d9] to-[#6366f1] text-white text-[13.5px] font-bold shadow-xs hover:shadow-md hover:brightness-105 transition-all"
          >
            <span>Scan Prescription</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-700 hover:text-[#0284c7] transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-6 py-5 bg-white border-b border-slate-200 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-[15px] py-1.5 transition-colors ${
                    isActive
                      ? "text-[#0284c7] font-bold"
                      : "text-slate-700 hover:text-[#0284c7] font-medium"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              href="/upload"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#0284c7] via-[#4a90d9] to-[#6366f1] text-white text-[14.5px] font-bold shadow-sm"
            >
              <span>Scan Prescription</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
