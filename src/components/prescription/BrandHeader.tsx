"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, FileText, Sparkles } from "lucide-react";

export default function BrandHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-colors">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-[#0284c7] transition-colors">
            <span className="font-serif font-bold text-[18px] italic leading-none">℞</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight group-hover:text-[#0284c7] transition-colors">
              Prescription Reader
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              Clinical Intelligence
            </span>
          </div>
        </Link>

        {/* Navigation & Action */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-[13.5px] font-medium transition-all ${
              pathname === "/"
                ? "text-slate-900 bg-slate-100/80"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Overview
          </Link>
          
          <Link
            href="/upload"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13.5px] font-semibold transition-all ${
              pathname === "/upload"
                ? "bg-[#0284c7] text-white shadow-xs"
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
            }`}
          >
            <span>Scan &amp; Upload</span>
            <ArrowRight size={14} className="opacity-80" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
