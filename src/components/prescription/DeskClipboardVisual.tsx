"use client";

export default function DeskClipboardVisual() {
  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[460px] lg:max-w-[540px] mx-auto select-none">
      
      {/* Top Right Decorative Ceramic Plant (Hidden on small mobile to avoid overflow) */}
      <div className="absolute -top-5 -right-5 w-20 h-20 sm:w-26 sm:h-26 rounded-full bg-emerald-50 border-4 border-white shadow-md z-0 overflow-hidden hidden sm:flex items-center justify-center pointer-events-none opacity-90 sm:opacity-100">
        <div className="relative w-full h-full bg-gradient-to-br from-white to-slate-100 rounded-full flex items-center justify-center p-2">
          <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-800 drop-shadow-xs">
            <ellipse cx="50" cy="50" rx="36" ry="36" fill="#e2e8f0" />
            <ellipse cx="50" cy="50" rx="30" ry="30" fill="#2d3748" opacity="0.1" />
            <path d="M50 15 Q60 35 50 50 Q40 35 50 15Z" fill="#15803d" />
            <path d="M50 85 Q60 65 50 50 Q40 65 50 85Z" fill="#166534" />
            <path d="M15 50 Q35 60 50 50 Q35 40 15 50Z" fill="#15803d" />
            <path d="M85 50 Q65 60 50 50 Q65 40 85 50Z" fill="#166534" />
            <path d="M25 25 Q45 40 50 50 Q35 45 25 25Z" fill="#15803d" />
            <path d="M75 25 Q55 40 50 50 Q65 45 75 25Z" fill="#166534" />
            <path d="M25 75 Q45 60 50 50 Q35 55 25 75Z" fill="#15803d" />
            <path d="M75 75 Q55 60 50 50 Q65 55 75 75Z" fill="#166534" />
            <circle cx="50" cy="50" r="10" fill="#14532d" />
          </svg>
        </div>
      </div>

      {/* Far Right Notebook Edge */}
      <div className="absolute top-16 -right-5 w-16 h-72 rounded-r-lg bg-slate-700 shadow-md transform rotate-2 z-0 hidden lg:block pointer-events-none opacity-80" />

      {/* Main Wooden Hardboard Clipboard (Straight on mobile, subtly angled on desktop) */}
      <div className="relative bg-[#b58b5b] p-2.5 sm:p-3.5 lg:p-4 rounded-2xl shadow-lg sm:shadow-xl transform rotate-0 sm:rotate-[2.5deg] lg:rotate-[3.5deg] hover:rotate-[1.5deg] transition-transform duration-500 z-10 border border-[#9a7244]">
        
        {/* Silver Metal Clip at Top */}
        <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 w-24 sm:w-32 lg:w-36 h-6 sm:h-8 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 rounded-md shadow-md border border-slate-400 z-30 flex items-center justify-center">
          <div className="w-12 sm:w-16 lg:w-20 h-1.5 sm:h-2 bg-slate-400 rounded-full" />
          <div className="absolute -top-1.5 sm:-top-2 w-8 sm:w-10 h-2.5 sm:h-3 border-2 border-slate-400 rounded-t-md bg-transparent" />
        </div>

        {/* Prescription Paper Sheet */}
        <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-7 pt-7 sm:pt-9 lg:pt-10 shadow-inner min-h-[300px] sm:min-h-[360px] lg:min-h-[400px] flex flex-col justify-between relative overflow-hidden">
          
          {/* Header Row */}
          <div>
            <div className="flex justify-between items-start text-left border-b border-slate-100 pb-2.5 sm:pb-3">
              <div>
                <h4 className="text-[12px] sm:text-[13.5px] font-extrabold text-slate-900 leading-tight uppercase tracking-wide">
                  Central Health Clinic
                </h4>
                <p className="text-[9.5px] sm:text-[11px] text-slate-500 font-semibold leading-tight mt-0.5">
                  Department of Internal Medicine
                </p>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
                  Reg. #MH-48921-A &bull; OP Clinic
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600">
                  Date: 14/05/2024
                </span>
              </div>
            </div>

            {/* Rx Symbol */}
            <div className="mt-2 sm:mt-2.5 text-left">
              <span className="font-serif font-bold text-[22px] sm:text-[26px] italic text-[#0284c7] leading-none">
                ℞
              </span>
            </div>

            {/* Handwritten Prescribed Medicines */}
            <div className="mt-2 sm:mt-2.5 space-y-2 sm:space-y-2.5 font-handwriting text-[16px] sm:text-[19px] lg:text-[21px] font-semibold text-[#1e293b] leading-tight">
              
              <div className="flex justify-between items-baseline pr-1 sm:pr-2">
                <span>Tab. &nbsp; Dolo &nbsp; 650</span>
                <span className="font-sans text-[11px] sm:text-[12.5px] font-medium text-slate-600 tracking-wider">
                  1 - 1 - 1
                </span>
              </div>

              <div className="flex justify-between items-baseline pr-1 sm:pr-2">
                <span>Cap. &nbsp; Augmentin &nbsp; 625</span>
                <span className="font-sans text-[11px] sm:text-[12.5px] font-medium text-slate-600 tracking-wider">
                  1 - 0 - 1
                </span>
              </div>

              <div className="flex justify-between items-baseline pr-1 sm:pr-2">
                <span>Tab. &nbsp; Pantoprazole &nbsp; 40</span>
                <span className="font-sans text-[11px] sm:text-[12.5px] font-medium text-slate-600 tracking-wider">
                  0 - 0 - 1
                </span>
              </div>

              <div className="flex justify-between items-baseline pr-1 sm:pr-2">
                <span>Syp. &nbsp; Cetirizine &nbsp; 10ml</span>
                <span className="font-sans text-[11px] sm:text-[12.5px] font-medium text-slate-600 tracking-wider">
                  0 - 0 - 1
                </span>
              </div>

            </div>
          </div>

          {/* Clinical Stamp & Signature at Bottom Right */}
          <div className="flex flex-col items-end text-right pt-3 sm:pt-4 border-t border-slate-100">
            <div className="font-handwriting text-[20px] sm:text-[26px] font-bold text-slate-800 leading-none pr-2">
              Clinician
            </div>
            <div className="text-[9.5px] sm:text-[11px] font-semibold text-slate-600 mt-0.5">
              Authorized Medical Officer
            </div>
          </div>

        </div>
      </div>

      {/* Black Metallic Executive Pen (Hidden on mobile for clean fit) */}
      <div className="absolute -bottom-4 right-1 sm:-right-4 lg:-right-6 w-3 sm:w-3.5 h-36 sm:h-48 lg:h-52 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 rounded-full shadow-lg transform rotate-[-12deg] z-20 pointer-events-none hidden sm:block border-t border-slate-700">
        <div className="absolute top-4 left-0 w-1.5 h-12 bg-gradient-to-r from-slate-200 to-slate-400 rounded-sm shadow-xs" />
        <div className="absolute top-18 left-0 w-full h-1.5 bg-slate-300" />
        <div className="absolute bottom-0 left-0 w-full h-3 bg-slate-300 rounded-b-full" />
      </div>

    </div>
  );
}
