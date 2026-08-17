"use client";

export default function DeskClipboardVisual() {
  return (
    <div className="relative w-full max-w-[560px] mx-auto select-none">
      
      {/* Top Right Decorative Plant in Ceramic Pot */}
      <div className="absolute -top-6 -right-6 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-50 border-4 border-white shadow-md z-0 overflow-hidden flex items-center justify-center pointer-events-none opacity-90 sm:opacity-100">
        <div className="relative w-full h-full bg-gradient-to-br from-white to-slate-100 rounded-full flex items-center justify-center p-2">
          {/* Leaves SVG */}
          <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-800 drop-shadow-sm">
            <ellipse cx="50" cy="50" rx="36" ry="36" fill="#e2e8f0" />
            <ellipse cx="50" cy="50" rx="30" ry="30" fill="#2d3748" opacity="0.1" />
            {/* Succulent Leaves */}
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
      <div className="absolute top-16 -right-5 w-16 h-72 rounded-r-lg bg-slate-700 shadow-md transform rotate-2 z-0 hidden sm:block pointer-events-none opacity-80" />

      {/* Main Wooden Hardboard Clipboard */}
      <div className="relative bg-[#b58b5b] p-3 sm:p-4 rounded-2xl shadow-xl transform rotate-[3deg] sm:rotate-[4deg] hover:rotate-[2deg] transition-transform duration-500 z-10 border border-[#9a7244]">
        
        {/* Silver Metal Clip at Top */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-8 bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 rounded-md shadow-md border border-slate-400 z-30 flex items-center justify-center">
          <div className="w-16 sm:w-20 h-2 bg-slate-400 rounded-full" />
          <div className="absolute -top-2 w-10 h-3 border-2 border-slate-400 rounded-t-md bg-transparent" />
        </div>

        {/* Prescription Paper Sheet */}
        <div className="bg-white rounded-lg p-5 sm:p-8 pt-9 sm:pt-11 shadow-inner min-h-[380px] sm:min-h-[420px] flex flex-col justify-between relative overflow-hidden">
          
          {/* Header Row */}
          <div>
            <div className="flex justify-between items-start text-left border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-[13px] sm:text-[14px] font-bold text-slate-900 leading-tight">
                  Dr. Ramesh Kumar
                </h4>
                <p className="text-[10.5px] sm:text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                  MBBS, MD (General Medicine)
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Reg. No. 12345
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-medium text-slate-600">
                  Date: 14/05/2024
                </span>
              </div>
            </div>

            {/* Rx Symbol */}
            <div className="mt-3 text-left">
              <span className="font-serif font-bold text-[28px] italic text-slate-900 leading-none">
                ℞
              </span>
            </div>

            {/* Handwritten Prescribed Medicines */}
            <div className="mt-3 space-y-3 font-handwriting text-[18px] sm:text-[21px] font-semibold text-[#1e293b] leading-tight">
              
              <div className="flex justify-between items-baseline pr-2">
                <span>Tab. &nbsp; Dolo &nbsp; 650</span>
                <span className="font-sans text-[12px] sm:text-[13px] font-medium text-slate-600 tracking-wider">
                  1 - 1 - 1
                </span>
              </div>

              <div className="flex justify-between items-baseline pr-2">
                <span>Cap. &nbsp; Augmentin &nbsp; 625</span>
                <span className="font-sans text-[12px] sm:text-[13px] font-medium text-slate-600 tracking-wider">
                  1 - 0 - 1
                </span>
              </div>

              <div className="flex justify-between items-baseline pr-2">
                <span>Tab. &nbsp; Pantoprazole &nbsp; 40</span>
                <span className="font-sans text-[12px] sm:text-[13px] font-medium text-slate-600 tracking-wider">
                  0 - 0 - 1
                </span>
              </div>

              <div className="flex justify-between items-baseline pr-2">
                <span>Syp. &nbsp; Cetirizine &nbsp; 10ml</span>
                <span className="font-sans text-[12px] sm:text-[13px] font-medium text-slate-600 tracking-wider">
                  0 - 0 - 1
                </span>
              </div>

            </div>
          </div>

          {/* Doctor Signature at Bottom Right */}
          <div className="flex flex-col items-end text-right pt-4 border-t border-slate-100">
            <div className="font-handwriting text-[24px] sm:text-[28px] font-bold text-slate-800 leading-none pr-3">
              Ramesh
            </div>
            <div className="text-[11px] font-medium text-slate-700 mt-1">
              Dr. Ramesh Kumar
            </div>
          </div>

        </div>
      </div>

      {/* Black Metallic Executive Pen Resting on the Right */}
      <div className="absolute -bottom-4 right-1 sm:-right-6 w-3.5 h-44 sm:h-52 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 rounded-full shadow-lg transform rotate-[-12deg] z-20 pointer-events-none hidden sm:block border-t border-slate-700">
        {/* Silver Pen Clip */}
        <div className="absolute top-4 left-0 w-1.5 h-14 bg-gradient-to-r from-slate-200 to-slate-400 rounded-sm shadow-xs" />
        {/* Silver Band */}
        <div className="absolute top-20 left-0 w-full h-2 bg-slate-300" />
        {/* Silver Nib Tip */}
        <div className="absolute bottom-0 left-0 w-full h-4 bg-slate-300 rounded-b-full" />
      </div>

    </div>
  );
}
