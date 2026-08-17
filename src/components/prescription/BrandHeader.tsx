"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BrandHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0a1628] flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
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
          <span className="text-[16px] font-bold text-[#0a1628]">
            Prescription Reader
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-[14px] font-medium transition-colors ${
              pathname === "/"
                ? "text-[#0a1628]"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            Home
          </Link>
          <Link
            href="/upload"
            className={`text-[14px] font-medium transition-colors ${
              pathname === "/upload"
                ? "text-[#0a1628]"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            Upload
          </Link>
        </nav>
      </div>
    </header>
  );
}
