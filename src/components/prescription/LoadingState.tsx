import { Loader2 } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-6">
      <Loader2
        size={32}
        strokeWidth={2}
        className="animate-spin text-[#4a90d9]"
      />
      <p className="mt-4 text-[15px] font-semibold text-[#0a1628]">
        Reading your prescription...
      </p>
      <p className="mt-1 text-[13px] text-slate-500">
        AI is identifying medicines, dosages &amp; warnings
      </p>
    </div>
  );
}
