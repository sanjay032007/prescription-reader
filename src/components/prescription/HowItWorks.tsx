export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: "ti-camera",
      title: "Snap or upload",
      description: "Take a photo or upload your prescription.",
      color: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-[#4a90d9]",
    },
    {
      number: "02",
      icon: "ti-scan",
      title: "AI reads it",
      description: "AI identifies medicines, dosage and timing.",
      color: "from-indigo-500/10 to-purple-500/10",
      iconColor: "text-[#6366f1]",
    },
    {
      number: "03",
      icon: "ti-book",
      title: "Understand it",
      description:
        "Get a simple explanation of medicines, warnings and important information.",
      color: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-[#a855f7]",
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-16 sm:py-24 border-t border-slate-200/60">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
        <div className="text-center max-w-xl mx-auto mb-14 sm:mb-18">
          <h2 className="text-[32px] sm:text-[40px] font-extrabold tracking-tight text-[#0a1628]">
            How it works
          </h2>
          <p className="mt-3 text-[16px] text-slate-500">
            Three simple steps to decode any medical prescription in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-stretch">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center">
              {/* Step Card */}
              <div className="w-full h-full p-8 rounded-[24px] bg-white/90 border border-slate-200/80 shadow-[0_10px_30px_rgba(10,22,40,0.04)] backdrop-blur-sm flex flex-col items-center hover:translate-y-[-2px] transition-transform duration-200">
                {/* Number Badge */}
                <span className="text-[12px] font-extrabold tracking-widest text-slate-400 uppercase mb-4">
                  STEP {step.number}
                </span>

                {/* Icon Circle */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} border border-slate-100 flex items-center justify-center mb-6 shadow-xs`}
                >
                  <i className={`ti ${step.icon} text-2xl ${step.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-[20px] font-bold text-[#0a1628] mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-[14.5px] leading-relaxed text-slate-500 max-w-[260px]">
                  {step.description}
                </p>
              </div>

              {/* Connecting subtle horizontal arrows (between 1-2 and 2-3 on desktop) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm items-center justify-center text-slate-400">
                  <i className="ti ti-arrow-right text-sm" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
