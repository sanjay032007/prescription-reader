export default function FeaturesSection() {
  const features = [
    {
      icon: "ti-signature",
      title: "Reads messy handwriting",
      description:
        "Recognizes difficult handwritten prescriptions and complex medical abbreviations with precision.",
      color: "from-blue-500/10 to-indigo-500/10",
      iconColor: "text-[#4a90d9]",
    },
    {
      icon: "ti-file-text",
      title: "Plain-English explanations",
      description:
        "Explains what each medicine does and why it may have been prescribed without confusing jargon.",
      color: "from-indigo-500/10 to-purple-500/10",
      iconColor: "text-[#6366f1]",
    },
    {
      icon: "ti-shield-alert",
      title: "Safety alerts",
      description:
        "Highlights critical allergy warnings, antibiotic course advice, and food timing instructions.",
      color: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-[#a855f7]",
    },
    {
      icon: "ti-bolt",
      title: "Results in seconds",
      description:
        "Leverages advanced clinical vision AI models to analyze full prescriptions in just a few seconds.",
      color: "from-pink-500/10 to-rose-500/10",
      iconColor: "text-[#ec4899]",
    },
  ];

  return (
    <section id="features" className="w-full py-16 sm:py-24 border-t border-slate-200/60">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
        <div className="text-center max-w-xl mx-auto mb-14 sm:mb-18">
          <h2 className="text-[32px] sm:text-[40px] font-extrabold tracking-tight text-[#0a1628]">
            What you&apos;ll get
          </h2>
          <p className="mt-3 text-[16px] text-slate-500">
            A comprehensive, patient-friendly medical intelligence breakdown.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-8 rounded-[24px] bg-white/90 border border-slate-200/80 shadow-[0_10px_30px_rgba(10,22,40,0.03)] backdrop-blur-sm hover:-translate-y-1 transition-all duration-200 flex flex-col items-start"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} border border-slate-100 flex items-center justify-center mb-6 shadow-2xs`}
              >
                <i className={`ti ${feature.icon} text-2xl ${feature.iconColor}`} />
              </div>
              <h3 className="text-[19px] font-bold text-[#0a1628] mb-2.5">
                {feature.title}
              </h3>
              <p className="text-[14.5px] text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
