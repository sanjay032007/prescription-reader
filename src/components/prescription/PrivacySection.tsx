export default function PrivacySection() {
  return (
    <section className="w-full py-16 sm:py-20 border-t border-slate-200/60">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
        <div className="w-full rounded-[32px] bg-gradient-to-br from-white/90 via-white/80 to-blue-50/50 border border-white/80 shadow-[0_20px_50px_rgba(10,22,40,0.04)] backdrop-blur-md p-10 sm:p-16 text-center flex flex-col items-center justify-center">
          {/* Subtle lock icon */}
          <div className="w-18 h-18 rounded-3xl bg-slate-100/90 border border-slate-200 flex items-center justify-center mb-6 shadow-xs">
            <i className="ti ti-lock-check text-4xl text-[#4a90d9]" />
          </div>

          <h2 className="text-[28px] sm:text-[38px] font-extrabold tracking-tight text-[#0a1628] mb-3 max-w-xl">
            Your prescription stays private.
          </h2>

          <p className="text-[16px] sm:text-[18px] text-slate-600 max-w-xl leading-relaxed">
            We don&apos;t store your prescription images or personal medical
            information. Image analysis is performed in-memory and discarded.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[13px] font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Direct Browser Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Zero Database Image Retention</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Encrypted Data Transmission</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
