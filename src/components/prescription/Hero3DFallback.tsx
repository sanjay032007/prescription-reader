'use client';

export default function Hero3DFallback() {
  return (
    <div
      className="w-full max-w-[480px] h-[440px] sm:h-[500px] lg:h-[540px] relative rounded-[24px] overflow-hidden bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_20px_50px_rgba(10,22,40,0.08)] flex flex-col items-center justify-center p-8 select-none"
      style={{ touchAction: 'pan-y' }}
    >
      <div className="w-full max-w-[320px] h-full flex flex-col justify-between animate-pulse">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-3/5 bg-slate-200/80 rounded-md" />
          <div className="h-3 w-4/5 bg-slate-200/60 rounded-md" />
          <div className="h-2.5 w-1/2 bg-slate-200/40 rounded-md" />
        </div>

        {/* Divider */}
        <div className="h-0.5 w-full bg-slate-200/50 my-4" />

        {/* Rx symbol & med lines skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-12 bg-blue-100/80 rounded-md" />
          <div className="h-4 w-full bg-slate-200/70 rounded-md" />
          <div className="h-4 w-5/6 bg-slate-200/60 rounded-md" />
          <div className="h-4 w-4/6 bg-slate-200/50 rounded-md" />
        </div>

        {/* Bottom signature skeleton */}
        <div className="flex justify-between items-end mt-6">
          <div className="h-6 w-20 bg-emerald-100/70 rounded-md" />
          <div className="h-6 w-24 bg-slate-200/70 rounded-md" />
        </div>
      </div>
    </div>
  );
}
