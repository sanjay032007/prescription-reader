"use client";

import { useState } from "react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How accurate is the AI at reading doctors' handwriting?",
      answer:
        "The application utilizes advanced multimodal clinical vision models trained on diverse handwriting samples and medical prescription formats. If a brand name or dosage is slightly ambiguous, the AI flags it with an (unclear) tag so you always know to double-check.",
    },
    {
      question: "Is my personal medical data or prescription stored anywhere?",
      answer:
        "No. Your prescription image is converted to temporary in-memory base64 data strictly for processing and is never stored on our servers or databases.",
    },
    {
      question: "Does this replace advice from a pharmacist or doctor?",
      answer:
        "No. Prescription Reader provides informational summaries and patient-friendly explanations. Always consult your prescribing physician or pharmacist before taking or modifying any medication.",
    },
    {
      question: "What types of image formats and languages are supported?",
      answer:
        "You can upload JPG, PNG, or WEBP photos up to 10 MB. The vision AI supports Latin medical scripts as well as multi-lingual doctor notes.",
    },
  ];

  return (
    <section id="faq" className="w-full py-16 sm:py-24 border-t border-slate-200/60">
      <div className="max-w-[900px] mx-auto px-4 sm:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#4a90d9] mb-2">
            FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="text-[32px] sm:text-[40px] font-extrabold tracking-tight text-[#0a1628]">
            Got questions? We have answers.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-[20px] bg-white/90 border border-slate-200/80 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-[17px] text-[#0a1628] hover:text-[#4a90d9] transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <i
                    className={`ti ti-chevron-${
                      isOpen ? "up" : "down"
                    } text-slate-400 text-lg shrink-0`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-[15px] leading-relaxed text-slate-600 border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
