export default function Footer() {
  return (
    <footer id="about" className="w-full bg-white border-t border-slate-200/80 py-12 sm:py-16">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-10 border-b border-slate-100">
          {/* Left Brand info */}
          <div className="flex flex-col">
            <span className="text-[18px] font-extrabold text-[#0a1628] tracking-tight">
              Prescription Reader
            </span>
            <span className="text-[13px] font-medium text-slate-500 mt-0.5">
              AI-Powered Prescription Analysis
            </span>
          </div>

          {/* Right Links */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8 text-[14px] font-medium text-slate-600">
            <a href="#" className="hover:text-[#4a90d9] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#4a90d9] transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-[#4a90d9] transition-colors">
              Contact
            </a>
          </div>
        </div>

        {/* Bottom Disclaimer + Copyright */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[12.5px] text-slate-400">
          <p className="max-w-xl leading-relaxed">
            General information only — not a substitute for professional medical
            advice. Always consult your doctor or pharmacist before taking or
            adjusting medications.
          </p>
          <span className="shrink-0 font-medium">
            © 2026 Prescription Reader. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
