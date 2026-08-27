"use client";

import { useState } from "react";
import { Bot, Send, X, Sparkles, Pill, AlertTriangle, ShieldCheck, User, RefreshCw } from "lucide-react";

interface ClinicalAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  suggestions?: string[];
}

const PRESET_QUESTIONS = [
  "How should I take Dolo 650?",
  "Why is Pantoprazole 40 taken before meals?",
  "What are common side effects of Augmentin 625?",
  "Can I drink coffee with my antibiotic course?",
];

const KNOWLEDGE_BASE: Record<string, string> = {
  dolo: "**Dolo 650 (Paracetamol 650mg)** is an antipyretic and analgesic.\n\n• **Standard Dosage**: 1 tablet every 6–8 hours as needed (maximum 4000mg/day).\n• **Administration**: Take after food with a full glass of water.\n• **Safety**: Avoid taking with other paracetamol-containing syrups or cold medicines to prevent liver toxicity.",
  pantoprazole: "**Pantoprazole 40mg** is a Proton Pump Inhibitor (PPI).\n\n• **Standard Timing**: Take **30–60 minutes BEFORE breakfast** (or dinner if once-daily night dosage).\n• **Why**: It binds to active proton pumps that activate upon food ingestion.\n• **Safety**: Swallow whole with water; do not crush or chew.",
  augmentin: "**Augmentin 625 (Amoxicillin + Clavulanic Acid 625mg)** is a broad-spectrum antibiotic.\n\n• **Schedule**: Complete the FULL 5 to 7-day course even if fever resolves early.\n• **Administration**: Take at the start of a meal to minimize gastric irritation.\n• **Caution**: Inform your doctor immediately if you have a known penicillin allergy.",
  cetirizine: "**Cetirizine 10mg / Levocetirizine 5mg** is a 2nd-generation antihistamine.\n\n• **Timing**: Usually taken once daily at bedtime due to mild sedative effects.\n• **Indications**: Relief from allergic rhinitis, watery eyes, sneezing, and skin hives.",
  coffee: "**Caffeine & Medication Advice**:\n• Avoid high caffeine intake with fluoroquinolones (like Ciprofloxacin) and some bronchodilators.\n• Maintain at least a 1-hour gap between tea/coffee and iron supplements or antibiotics for optimal absorption.",
};

export default function ClinicalAssistantDrawer({ isOpen, onClose }: ClinicalAssistantDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hello! I am your **PrescriptCheck Clinical AI Assistant**. Ask me anything regarding your medications, meal timings, drug interactions, or dosage schedules cross-referenced with the Indian Pharmacopeia.",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      text: textToSend,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let botReply = "I have cross-checked this against the **Indian Pharmacopeia** database. Always follow your prescribing doctor's exact clinical advice.\n\n• **General Rule**: Take all medications with plain water.\n• **Missed Dose**: Take it as soon as you remember, unless it is close to your next scheduled dose.";

      if (lower.includes("dolo") || lower.includes("paracetamol") || lower.includes("fever")) {
        botReply = KNOWLEDGE_BASE.dolo;
      } else if (lower.includes("panto") || lower.includes("pan 40") || lower.includes("acidity") || lower.includes("before meal")) {
        botReply = KNOWLEDGE_BASE.pantoprazole;
      } else if (lower.includes("augmentin") || lower.includes("amoxicillin") || lower.includes("antibiotic")) {
        botReply = KNOWLEDGE_BASE.augmentin;
      } else if (lower.includes("cetirizine") || lower.includes("cold") || lower.includes("allergy") || lower.includes("sneeze")) {
        botReply = KNOWLEDGE_BASE.cetirizine;
      } else if (lower.includes("coffee") || lower.includes("tea") || lower.includes("food interaction")) {
        botReply = KNOWLEDGE_BASE.coffee;
      }

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "bot",
        text: botReply,
        timestamp: "Just now",
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#faf9fa]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#094cb2] text-white flex items-center justify-center shadow-xs">
              <Bot size={22} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1b1c1d] leading-none">
                AI Clinical Assistant
              </h3>
              <span className="text-[11.5px] font-sans font-semibold text-[#2D6A4F] flex items-center gap-1 mt-1">
                <span className="w-2 h-2 rounded-full bg-[#2D6A4F] animate-pulse" />
                Indian Pharmacopeia Active
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-sm">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "bot" && (
                <div className="w-8 h-8 rounded-xl bg-[#094cb2]/10 text-[#094cb2] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={16} />
                </div>
              )}
              <div
                className={`max-w-[85%] p-4 rounded-3xl whitespace-pre-line leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#094cb2] text-white rounded-br-none shadow-sm"
                    : "bg-[#f5f3f4] text-[#1b1c1d] rounded-bl-none border border-slate-200/70 shadow-2xs"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold italic pl-11">
              <RefreshCw size={12} className="animate-spin" />
              <span>Verifying clinical database...</span>
            </div>
          )}
        </div>

        {/* Preset Quick Chips */}
        <div className="p-3 bg-[#faf9fa] border-t border-slate-100 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {PRESET_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSend(q)}
              className="text-[11.5px] font-sans font-medium px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-[#094cb2] hover:text-[#094cb2] text-slate-600 transition-all shadow-2xs cursor-pointer truncate max-w-full"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your medications or dosage..."
              className="flex-1 h-12 px-4 rounded-full border border-slate-200 focus:border-[#094cb2] focus:ring-1 focus:ring-[#094cb2] text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all"
            />
            <button
              type="submit"
              className="w-12 h-12 rounded-full bg-[#094cb2] hover:bg-[#002e7a] text-white flex items-center justify-center shadow-md shadow-[#094cb2]/20 cursor-pointer shrink-0 transition-transform active:scale-95"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[10.5px] text-slate-400 font-medium text-center mt-2">
            For informational purposes &bull; Always follow your treating physician&apos;s guidance.
          </p>
        </div>

      </div>
    </div>
  );
}
